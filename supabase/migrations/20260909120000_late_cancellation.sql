-- ===========================================================================
-- Annulation : distinction « dans les délais » / « tardive » (CGV art. 6).
--  * late_cancellation : l'inscription est marquée annulée par le joueur mais
--    le cours reste dû (annulation < 48 h ou absence non justifiée).
--  * mention TVA alignée sur le texte des CGV (« article 44 »).
-- ===========================================================================

alter table public.registrations
  add column late_cancellation boolean not null default false;

update public.app_settings
  set vat_note = 'Xperience Padel Academy ASBL n''est pas assujettie à la TVA conformément à l''article 44 du Code de la TVA.'
  where id = 'default';
