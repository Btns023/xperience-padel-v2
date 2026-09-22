-- ===========================================================================
-- Comptabilité — journal financier des petites ASBL (comptabilité simplifiée)
-- ---------------------------------------------------------------------------
-- Reprend la structure du classeur « XP - Compta exercice 2026 » :
--   * ledger_categories  : catégories de recettes et de dépenses du classeur,
--                          rattachées aux postes de l'Annexe B légale
--   * ledger_entries     : une ligne par opération (banque, caisse, épargne),
--                          montant signé (+ recette, − dépense)
--   * ledger_attachments : pièces justificatives (fichiers dans le bucket
--                          privé « pieces »)
--   * next_piece_number  : numérotation continue des pièces, par exercice
--
-- Droits : l'académie (admin) gère tout ; le comptable lit tout, y compris
-- les factures et les paiements, et ne modifie rien.
-- ===========================================================================

create or replace function public.can_read_accounts()
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.is_admin() or public.current_app_role() = 'comptable';
$$;
grant execute on function public.can_read_accounts() to authenticated;

create type public.ledger_direction as enum ('recette', 'depense');
create type public.ledger_account as enum ('banque', 'caisse', 'epargne');

-- --- Catégories --------------------------------------------------------
create table public.ledger_categories (
  code        text primary key,
  direction   public.ledger_direction not null,
  label       text not null,
  -- Poste de l'Annexe B (état des recettes et des dépenses) ; null pour les
  -- virements internes, qui ne sont ni une recette ni une dépense.
  annex_post  text,
  position    int  not null default 0,
  active      boolean not null default true
);

insert into public.ledger_categories (code, direction, label, annex_post, position) values
  ('cotisations',          'recette', 'Cotisations',           'Cotisations',              10),
  ('dons',                 'recette', 'Dons et legs',          'Dons et legs',             20),
  ('subsides',             'recette', 'Subsides',              'Subsides',                 30),
  ('sponsors',             'recette', 'Sponsors',              'Autres recettes',          40),
  ('assurance_recette',    'recette', 'Assurance',             'Autres recettes',          50),
  ('autres_recettes',      'recette', 'Autres',                'Autres recettes',          60),
  ('virement_interne_in',  'recette', 'Virements internes',    null,                       70),
  ('factures_moniteurs',   'depense', 'Factures moniteurs',    'Rémunérations',           110),
  ('moniteurs_benevoles',  'depense', 'Moniteurs bénévoles',   'Rémunérations',           120),
  ('administrateurs',      'depense', 'Administrateurs',       'Rémunérations',           130),
  ('fournitures',          'depense', 'Fournitures',           'Marchandises et services', 140),
  ('site_web',             'depense', 'Site web',              'Marchandises et services', 150),
  ('locations_terrains',   'depense', 'Locations de terrains', 'Services et biens divers', 160),
  ('assurances',           'depense', 'Assurances',            'Services et biens divers', 170),
  ('frais_bancaires',      'depense', 'Frais bancaires',       'Services et biens divers', 180),
  ('frais_asbl',           'depense', 'Frais ASBL',            'Services et biens divers', 190),
  ('autres_depenses',      'depense', 'Autres',                'Autres dépenses',         200),
  ('virement_interne_out', 'depense', 'Virements internes',    null,                      210);

-- --- Écritures ---------------------------------------------------------
create table public.ledger_entries (
  id                uuid primary key default gen_random_uuid(),
  account           public.ledger_account not null default 'banque',
  fiscal_year       int  not null,
  operation_date    date not null,
  value_date        date,
  statement_no      text,
  statement_seq     text,
  description       text not null,
  counterparty      text,
  counterparty_iban text,
  communication     text,
  amount_cents      int  not null check (amount_cents <> 0),
  category_code     text references public.ledger_categories (code),
  piece_number      text,
  invoice_id        uuid references public.invoices (id) on delete set null,
  -- Référence de la ligne bancaire : un extrait réimporté n'est pas doublé.
  bank_ref          text unique,
  source            text not null default 'manuel'
                    check (source in ('manuel', 'classeur', 'bnp')),
  notes             text,
  created_by        uuid references public.profiles (id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (fiscal_year, piece_number)
);

create index ledger_entries_year_idx on public.ledger_entries (fiscal_year, operation_date);
create index ledger_entries_invoice_idx on public.ledger_entries (invoice_id);

create trigger ledger_entries_set_updated_at before update on public.ledger_entries
  for each row execute function public.set_updated_at();

-- La catégorie doit aller dans le sens du montant : une recette positive,
-- une dépense négative.
create or replace function public.ledger_check_direction()
returns trigger language plpgsql set search_path = public
as $$
declare d public.ledger_direction;
begin
  if new.category_code is null then return new; end if;
  select direction into d from public.ledger_categories where code = new.category_code;
  if (d = 'recette') <> (new.amount_cents > 0) then
    raise exception 'La catégorie % ne correspond pas au sens du montant', new.category_code;
  end if;
  return new;
end;
$$;

create trigger ledger_entries_check_direction
  before insert or update of amount_cents, category_code on public.ledger_entries
  for each row execute function public.ledger_check_direction();

-- --- Pièces justificatives ---------------------------------------------
create table public.ledger_attachments (
  id           uuid primary key default gen_random_uuid(),
  entry_id     uuid not null references public.ledger_entries (id) on delete cascade,
  storage_path text not null unique,
  file_name    text not null,
  mime_type    text,
  size_bytes   int,
  uploaded_by  uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now()
);
create index ledger_attachments_entry_idx on public.ledger_attachments (entry_id);

-- Numérotation continue des pièces, par exercice : PJ 2026-001, 002…
create table public.ledger_piece_counters (
  fiscal_year int primary key,
  last_number int not null default 0
);

create or replace function public.next_piece_number(p_year int)
returns text
language plpgsql security definer set search_path = public
as $$
declare n int;
begin
  if not public.is_admin() then
    raise exception 'Réservé aux administrateurs';
  end if;
  insert into public.ledger_piece_counters (fiscal_year, last_number)
  values (p_year, 1)
  on conflict (fiscal_year)
    do update set last_number = public.ledger_piece_counters.last_number + 1
  returning last_number into n;
  return format('PJ %s-%s', p_year, lpad(n::text, 3, '0'));
end;
$$;
grant execute on function public.next_piece_number(int) to authenticated;

-- ===========================================================================
-- RLS
-- ===========================================================================
alter table public.ledger_categories     enable row level security;
alter table public.ledger_entries        enable row level security;
alter table public.ledger_attachments    enable row level security;
alter table public.ledger_piece_counters enable row level security;

create policy "ledger_categories_read"  on public.ledger_categories for select
  using (public.can_read_accounts());
create policy "ledger_categories_admin" on public.ledger_categories for all
  using (public.is_admin()) with check (public.is_admin());

create policy "ledger_entries_read"  on public.ledger_entries for select
  using (public.can_read_accounts());
create policy "ledger_entries_admin" on public.ledger_entries for all
  using (public.is_admin()) with check (public.is_admin());

create policy "ledger_attachments_read"  on public.ledger_attachments for select
  using (public.can_read_accounts());
create policy "ledger_attachments_admin" on public.ledger_attachments for all
  using (public.is_admin()) with check (public.is_admin());

create policy "ledger_piece_counters_admin" on public.ledger_piece_counters for all
  using (public.is_admin()) with check (public.is_admin());

-- Le comptable lit les factures, leurs lignes et les paiements.
create policy "invoices_read_accountant" on public.invoices for select
  using (public.current_app_role() = 'comptable');
create policy "invoice_lines_read_accountant" on public.invoice_lines for select
  using (public.current_app_role() = 'comptable');
create policy "payments_read_accountant" on public.payments for select
  using (public.current_app_role() = 'comptable');

-- --- Fichiers : bucket privé « pieces » ---------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('pieces', 'pieces', false, 10485760)
on conflict (id) do nothing;

create policy "pieces_read" on storage.objects for select
  using (bucket_id = 'pieces' and public.can_read_accounts());
create policy "pieces_admin_insert" on storage.objects for insert
  with check (bucket_id = 'pieces' and public.is_admin());
create policy "pieces_admin_update" on storage.objects for update
  using (bucket_id = 'pieces' and public.is_admin());
create policy "pieces_admin_delete" on storage.objects for delete
  using (bucket_id = 'pieces' and public.is_admin());
