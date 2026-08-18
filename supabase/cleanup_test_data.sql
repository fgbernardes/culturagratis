-- Remove dados de teste marcados "[TESTE]". Correr manualmente no SQL Editor
-- quando disser "limpa os testes" — não faz parte das migrations (não é uma
-- alteração de schema, é uma limpeza de dados, corre à parte e sob pedido).

delete from public.events
where title like '[TESTE]%';
-- event_tags e accessibility_resources destes eventos vão junto (on delete cascade).

delete from public.venues
where name like '[TESTE]%';
-- só apaga venues que não estejam ligados a nenhum evento real, por causa da
-- foreign key events.venue_id (sem "on delete cascade" nessa direção) — se
-- sobrar algum venue de teste ainda ligado a um evento real, este delete falha
-- em vez de arrastar esse evento.
