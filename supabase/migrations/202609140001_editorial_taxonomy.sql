alter table public.events
  add column if not exists editorial_tags text[] not null default '{}';

alter table public.events
  drop constraint if exists events_editorial_tags_check;

alter table public.events
  add constraint events_editorial_tags_check check (
    editorial_tags <@ array[
      'Ao ar livre',
      'Para famílias',
      'Cultura de bairro',
      'Lotação limitada',
      'Língua Gestual Portuguesa',
      'Acessível por cadeira de rodas'
    ]::text[]
  );
