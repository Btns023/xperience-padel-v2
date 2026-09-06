-- ===========================================================================
-- Lot 1 — Données initiales : niveaux, lieu, produits & tarifs (grille
--                             relevée sur le site actuel).
-- Idempotent : peut être ré-exécuté sans créer de doublons.
-- ===========================================================================

-- --- Niveaux de padel (classification belge, simplifiée) --------------
insert into public.padel_levels (code, label, rank) values
  ('NC',    'Non classé / débutant', 0),
  ('P100',  'P100',  1),
  ('P200',  'P200',  2),
  ('P300',  'P300',  3),
  ('P400',  'P400',  4),
  ('P500',  'P500',  5),
  ('P700',  'P700',  6),
  ('P1000', 'P1000', 7),
  ('P1500', 'P1500', 8),
  ('P2000', 'P2000', 9)
on conflict (code) do nothing;

-- --- Lieu par défaut ------------------------------------------------
insert into public.locations (name, address)
select 'Padel Smash Gembloux', null
where not exists (select 1 from public.locations where name = 'Padel Smash Gembloux');

-- --- Produits ------------------------------------------------------
insert into public.products
  (slug, name, category, pricing_model, default_session_count, default_session_minutes, description, position)
values
  ('cycle-adulte', 'Cycle adultes', 'cycle_adulte', 'per_group_size', 9, 90,
   '9 séances de 1h30, location comprise. Prix par joueur selon l''effectif du groupe.', 1),
  ('ete-indien', 'Été indien', 'ete_indien', 'per_group_size', 5, 90,
   '5 séances. Prix par joueur selon l''effectif, ou forfait équipe interclubs.', 2),
  ('stage-ete', 'Stage été', 'stage', 'per_group_size', 3, 120,
   '3 × 2h sur une semaine. Prix par personne selon l''effectif.', 3),
  ('cycle-enfant', 'Cycle enfants', 'cycle_enfant', 'per_duration', 9, 60,
   'Cycle annuel dégressif, séances d''1h, location comprise. Prix selon la durée.', 4),
  ('cours-prive', 'Cours privés', 'cours_prive', 'unit', null, 60,
   'Cours particulier, solo ou duo, 1h ou 1h30 (×1,5).', 5)
on conflict (slug) do nothing;

-- --- Tarifs : cycle adultes -------------------------------------
insert into public.price_tiers (product_id, kind, group_size, label, amount_cents, position)
select p.id, v.kind::public.price_tier_kind, v.group_size, v.label, v.amount_cents, v.position
from public.products p
cross join (values
  ('group_size', 2, 'Groupe de 2', 42500, 1),
  ('group_size', 3, 'Groupe de 3', 30000, 2),
  ('group_size', 4, 'Groupe de 4', 23000, 3)
) as v(kind, group_size, label, amount_cents, position)
where p.slug = 'cycle-adulte'
  and not exists (select 1 from public.price_tiers pt where pt.product_id = p.id);

-- --- Tarifs : été indien --------------------------------------
insert into public.price_tiers (product_id, kind, group_size, label, amount_cents, position)
select p.id, v.kind::public.price_tier_kind, v.group_size, v.label, v.amount_cents, v.position
from public.products p
cross join (values
  ('group_size', 2,    'Groupe de 2',              23500, 1),
  ('group_size', 3,    'Groupe de 3',              17000, 2),
  ('group_size', 4,    'Groupe de 4',              13000, 3),
  ('flat',       null, 'Forfait équipe interclubs', 40000, 4)
) as v(kind, group_size, label, amount_cents, position)
where p.slug = 'ete-indien'
  and not exists (select 1 from public.price_tiers pt where pt.product_id = p.id);

-- --- Tarifs : stage été ---------------------------------------
insert into public.price_tiers (product_id, kind, group_size, label, amount_cents, position)
select p.id, v.kind::public.price_tier_kind, v.group_size, v.label, v.amount_cents, v.position
from public.products p
cross join (values
  ('group_size', 2, 'Groupe de 2', 21000, 1),
  ('group_size', 3, 'Groupe de 3', 14000, 2),
  ('group_size', 4, 'Groupe de 4', 10500, 3)
) as v(kind, group_size, label, amount_cents, position)
where p.slug = 'stage-ete'
  and not exists (select 1 from public.price_tiers pt where pt.product_id = p.id);

-- --- Tarifs : cycle enfants (selon la durée) -----------------
insert into public.price_tiers (product_id, kind, session_count, label, amount_cents, position)
select p.id, v.kind::public.price_tier_kind, v.session_count, v.label, v.amount_cents, v.position
from public.products p
cross join (values
  ('duration',  9, '9 cours (sept. → déc.)',  15000, 1),
  ('duration', 18, '18 cours (sept. → mars)', 27500, 2),
  ('duration', 27, '27 cours (sept. → juin)', 35000, 3)
) as v(kind, session_count, label, amount_cents, position)
where p.slug = 'cycle-enfant'
  and not exists (select 1 from public.price_tiers pt where pt.product_id = p.id);

-- --- Tarifs : cours privés (unitaire) -----------------------
insert into public.price_tiers (product_id, kind, variant, duration_minutes, label, amount_cents, position)
select p.id, v.kind::public.price_tier_kind, v.variant, v.duration_minutes, v.label, v.amount_cents, v.position
from public.products p
cross join (values
  ('unit', 'solo', 60, 'Solo · 1h',    6000, 1),
  ('unit', 'solo', 90, 'Solo · 1h30',  9000, 2),
  ('unit', 'duo',  60, 'Duo · 1h',     7000, 3),
  ('unit', 'duo',  90, 'Duo · 1h30',  10500, 4)
) as v(kind, variant, duration_minutes, label, amount_cents, position)
where p.slug = 'cours-prive'
  and not exists (select 1 from public.price_tiers pt where pt.product_id = p.id);
