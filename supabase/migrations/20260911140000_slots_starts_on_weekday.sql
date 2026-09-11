-- La date de 1re séance d'un créneau doit tomber sur le jour du créneau :
-- les séances sont générées de semaine en semaine à partir de starts_on
-- (voir src/lib/sessions.ts), sans réalignement sur weekday.
-- weekday suit la norme ISO (1 = lundi … 7 = dimanche), comme isodow.
alter table public.slots
  add constraint slots_starts_on_weekday_chk
  check (starts_on is null or extract(isodow from starts_on) = weekday);
