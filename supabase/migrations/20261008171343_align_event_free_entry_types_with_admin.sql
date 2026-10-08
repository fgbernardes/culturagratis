alter table public.events drop constraint if exists events_free_entry_type_check;
alter table public.events add constraint events_free_entry_type_check check (free_entry_type in ('entrada-livre', 'Entrada livre', 'Reserva gratuita', 'Levantamento gratuito', 'Entrada gratuita em horário específico', 'Por confirmar'));
