-- CGL — schema de eventos (MVP)
-- Fonte de verdade: CGL_Taxonomias_MVP_v1.0.json (ADR-016, vigente desde 2026-08-07)
-- Não alterar categorias/tags/freguesias aqui sem atualizar primeiro o ficheiro fonte.

create extension if not exists "pgcrypto";

-- Vocabulários controlados ---------------------------------------------------

create table public.categories (
  id text primary key,
  label text not null
);

insert into public.categories (id, label) values
  ('musica', 'Música'),
  ('teatro-e-performance', 'Teatro e performance'),
  ('danca', 'Dança'),
  ('cinema', 'Cinema'),
  ('exposicoes-e-artes-visuais', 'Exposições e artes visuais'),
  ('literatura-e-conversas', 'Literatura e conversas'),
  ('museus-e-patrimonio', 'Museus e património'),
  ('cultura-comunitaria-e-festivais', 'Cultura comunitária e festivais');

create table public.tags (
  id text primary key,
  label text not null,
  assignment_rule text
);

insert into public.tags (id, label, assignment_rule) values
  ('familias', 'Famílias', null),
  ('ar-livre', 'Ar livre', null),
  ('visita-guiada', 'Visita guiada', null),
  ('oficina', 'Oficina', null),
  ('acessibilidade', 'Acessibilidade', 'Só pode ser atribuída quando existir pelo menos um recurso de acessibilidade confirmado.');

-- Freguesias de Lisboa. "zone" não entra: sem vocabulário controlado aprovado
-- no MVP (ver CGL_Taxonomias_MVP_v1.0.json, geography.zone.rule).
create table public.parishes (
  id text primary key,
  label text not null
);

insert into public.parishes (id, label) values
  ('ajuda', 'Ajuda'),
  ('alcantara', 'Alcântara'),
  ('alvalade', 'Alvalade'),
  ('areeiro', 'Areeiro'),
  ('arroios', 'Arroios'),
  ('avenidas-novas', 'Avenidas Novas'),
  ('beato', 'Beato'),
  ('belem', 'Belém'),
  ('benfica', 'Benfica'),
  ('campo-de-ourique', 'Campo de Ourique'),
  ('campolide', 'Campolide'),
  ('carnide', 'Carnide'),
  ('estrela', 'Estrela'),
  ('lumiar', 'Lumiar'),
  ('marvila', 'Marvila'),
  ('misericordia', 'Misericórdia'),
  ('olivais', 'Olivais'),
  ('parque-das-nacoes', 'Parque das Nações'),
  ('penha-de-franca', 'Penha de França'),
  ('santa-clara', 'Santa Clara'),
  ('santa-maria-maior', 'Santa Maria Maior'),
  ('santo-antonio', 'Santo António'),
  ('sao-domingos-de-benfica', 'São Domingos de Benfica'),
  ('sao-vicente', 'São Vicente');

-- Locais (venues) ---------------------------------------------------------
-- Suporta o mapa do site: cada evento aponta para um local com coordenadas,
-- em vez de repetir morada/freguesia à solta em cada evento.

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  parish_id text not null references public.parishes (id),
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  created_at timestamptz not null default now(),
  constraint venues_lat_lng_both_or_neither
    check ((latitude is null) = (longitude is null))
);

create index venues_parish_id_idx on public.venues (parish_id);

-- Eventos ---------------------------------------------------------------------

create table public.events (
  id uuid primary key default gen_random_uuid(),
  -- "edition", não "city": alinhado com a chave de topo do ficheiro de
  -- taxonomias. Prepara o schema para futuras edições além de Lisboa.
  edition text not null default 'lisboa',
  title text not null,
  description text,
  category_id text not null references public.categories (id),
  venue_id uuid not null references public.venues (id),
  -- freguesia deixa de estar em events: deriva-se de venues.parish_id,
  -- para não haver duas fontes de verdade que possam desalinhar.
  free_entry_type text not null default 'entrada-livre'
    check (free_entry_type in ('entrada-livre')),
  -- true quando é preciso reservar ou levantar bilhete antecipadamente,
  -- mesmo sendo entrada livre/gratuita.
  requires_booking boolean not null default false,
  -- para entrada livre condicionada a horário (ex.: "grátis aos domingos
  -- até às 14h"). Fica nulo quando a entrada livre não tem condição de horário.
  free_hours_note text,
  -- fonte confirmada é obrigatória (CLAUDE.md: nunca inserir eventos sem
  -- fonte confirmada).
  source_url text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_edition_idx on public.events (edition);
create index events_category_id_idx on public.events (category_id);
create index events_venue_id_idx on public.events (venue_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_events_updated_at
  before update on public.events
  for each row
  execute function public.set_updated_at();

create table public.event_tags (
  event_id uuid not null references public.events (id) on delete cascade,
  tag_id text not null references public.tags (id),
  primary key (event_id, tag_id)
);

-- Regista apenas recursos de acessibilidade confirmados por fonte específica
-- (accessibility.resources_rule no ficheiro de taxonomias).
create table public.accessibility_resources (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  description text not null,
  source text not null,
  confirmed boolean not null default true,
  created_at timestamptz not null default now()
);

create index accessibility_resources_event_id_idx on public.accessibility_resources (event_id);

-- Impõe o assignment_rule da tag "acessibilidade" ao nível da base de dados:
-- só pode ser atribuída a um evento com pelo menos um recurso confirmado.
create or replace function public.check_acessibilidade_tag()
returns trigger
language plpgsql
as $$
begin
  if new.tag_id = 'acessibilidade' and not exists (
    select 1 from public.accessibility_resources
    where event_id = new.event_id and confirmed = true
  ) then
    raise exception 'A tag "acessibilidade" só pode ser atribuída a eventos com pelo menos um recurso de acessibilidade confirmado (event_id: %)', new.event_id;
  end if;
  return new;
end;
$$;

create trigger enforce_acessibilidade_tag_rule
  before insert or update on public.event_tags
  for each row
  execute function public.check_acessibilidade_tag();

-- Acesso público de leitura -----------------------------------------------
-- Escrita fica reservada à service role (CMS/importação), ainda por decidir.

alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.parishes enable row level security;
alter table public.venues enable row level security;
alter table public.events enable row level security;
alter table public.event_tags enable row level security;
alter table public.accessibility_resources enable row level security;

create policy "public read access" on public.categories for select using (true);
create policy "public read access" on public.tags for select using (true);
create policy "public read access" on public.parishes for select using (true);
create policy "public read access" on public.venues for select using (true);
create policy "public read access" on public.events for select using (true);
create policy "public read access" on public.event_tags for select using (true);
create policy "public read access" on public.accessibility_resources for select using (true);
