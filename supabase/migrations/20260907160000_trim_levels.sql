-- ===========================================================================
-- Retrait des niveaux P1500 et P2000 (non utilisés en pratique).
-- ===========================================================================
delete from public.padel_levels where code in ('P1500', 'P2000');
