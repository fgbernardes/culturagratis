-- Dados de teste para validar o schema de eventos ponta a ponta.
-- Título marcado "[TESTE]" de propósito — remover antes de dados reais.

with new_venue as (
  insert into public.venues (name, address, parish_id, latitude, longitude)
  values (
    '[TESTE] Local de teste',
    'Morada de teste, Lisboa',
    'arroios',
    38.736946,
    -9.142685
  )
  returning id
)
insert into public.events (title, description, category_id, venue_id, source_url)
select
  '[TESTE] Evento de teste',
  'Registo de teste para validar o schema — remover antes de dados reais.',
  'musica',
  new_venue.id,
  'https://example.com/evento-teste'
from new_venue
returning id, title;
