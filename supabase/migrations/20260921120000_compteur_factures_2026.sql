-- Reprise de la numérotation 2026 : la dernière facture émise hors
-- plateforme porte le numéro 2026-089. La prochaine facture créée ici
-- doit donc être 2026-090, sans trou dans la série (obligation légale).
-- Les notes de crédit gardent leur propre série, encore à zéro.

insert into public.document_counters (year, kind, last_number)
values (2026, 'invoice', 89)
on conflict (year, kind) do update
  set last_number = greatest(public.document_counters.last_number, 89);
