-- ===========================================================================
-- Lot 4 — Facturation
-- ---------------------------------------------------------------------------
--  * app_settings       : coordonnées émetteur + mention TVA + préfixes
--  * promo_codes        : remise à montant fixe (admin), code saisi ou manuel
--  * document_counters  : séquences annuelles factures / notes de crédit
--  * invoices           : facture ou note de crédit, numérotée, snapshot légal
--  * invoice_lines      : lignes (rattachées ou non à une inscription)
--  * next_document_number(kind) : allocation atomique et sans trou
-- Montants : centimes d'euro. Aucune TVA (ASBL non assujettie).
-- ===========================================================================

create type public.invoice_kind   as enum ('invoice', 'credit_note');
create type public.invoice_status as enum ('draft', 'sent', 'paid', 'cancelled');

-- --- Paramètres de l'ASBL (une seule ligne) --------------------------
create table public.app_settings (
  id                  text primary key default 'default',
  issuer_name         text not null,
  issuer_legal_name   text not null,
  issuer_address      text not null,
  issuer_bce          text not null,
  issuer_iban         text not null,
  issuer_bic          text not null,
  vat_note            text not null,
  invoice_prefix      text not null default 'FXP',
  credit_note_prefix  text not null default 'NCXP',
  payment_terms_days  int  not null default 15,
  updated_at          timestamptz not null default now()
);

insert into public.app_settings
  (id, issuer_name, issuer_legal_name, issuer_address, issuer_bce, issuer_iban,
   issuer_bic, vat_note)
values (
  'default',
  'Xperience Padel Academy',
  'Padel XP ASBL',
  'Chaussée de Wavre 79, 5030 Gembloux',
  'BE 1031.094.162',
  'BE96 0020 2377 9405',
  'GEBABEBB',
  'Exonéré de TVA en vertu de l''article 44, §2, 3° du Code de la TVA.'
) on conflict (id) do nothing;

-- --- Codes promo ---------------------------------------------------
create table public.promo_codes (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique,
  amount_cents int not null check (amount_cents > 0),
  product_id   uuid references public.products (id) on delete set null,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- --- Compteurs de documents -------------------------------------
create table public.document_counters (
  year        int  not null,
  kind        public.invoice_kind not null,
  last_number int  not null default 0,
  primary key (year, kind)
);

create or replace function public.next_document_number(p_kind public.invoice_kind)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  y int := extract(year from now())::int;
  n int;
begin
  if not public.is_admin() then
    raise exception 'Réservé aux administrateurs';
  end if;
  insert into public.document_counters (year, kind, last_number)
  values (y, p_kind, 1)
  on conflict (year, kind)
    do update set last_number = public.document_counters.last_number + 1
  returning last_number into n;
  return n;
end;
$$;

grant execute on function public.next_document_number(public.invoice_kind) to authenticated;

-- --- Factures / notes de crédit -------------------------------
create table public.invoices (
  id                    uuid primary key default gen_random_uuid(),
  kind                  public.invoice_kind not null default 'invoice',
  number                text unique,                 -- alloué à l'émission
  status                public.invoice_status not null default 'draft',
  issued_on             date not null default current_date,
  billed_to_profile_id  uuid not null references public.profiles (id) on delete restrict,
  billed_to_org_id      uuid references public.organizations (id) on delete set null,
  group_id              uuid references public.groups (id) on delete set null,
  season_id             uuid references public.seasons (id) on delete set null,
  parent_invoice_id     uuid references public.invoices (id) on delete set null,
  issuer_snapshot       jsonb not null default '{}'::jsonb,
  recipient_snapshot    jsonb not null default '{}'::jsonb,
  vat_note              text not null default '',
  structured_comm       text,
  total_cents           int not null default 0,
  notes                 text,
  sent_at               timestamptz,
  paid_at               timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index invoices_billed_idx on public.invoices (billed_to_profile_id);
create index invoices_group_idx  on public.invoices (group_id);
create index invoices_status_idx on public.invoices (status);

create table public.invoice_lines (
  id               uuid primary key default gen_random_uuid(),
  invoice_id       uuid not null references public.invoices (id) on delete cascade,
  registration_id  uuid references public.registrations (id) on delete set null,
  description      text not null,
  quantity         int not null default 1 check (quantity > 0),
  unit_price_cents int not null,
  discount_cents   int not null default 0 check (discount_cents >= 0),
  promo_code       text,
  amount_cents     int not null,
  position         int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index invoice_lines_invoice_idx on public.invoice_lines (invoice_id);

-- --- updated_at -----------------------------------------------
create trigger app_settings_set_updated_at before update on public.app_settings
  for each row execute function public.set_updated_at();
create trigger promo_codes_set_updated_at before update on public.promo_codes
  for each row execute function public.set_updated_at();
create trigger invoices_set_updated_at before update on public.invoices
  for each row execute function public.set_updated_at();
create trigger invoice_lines_set_updated_at before update on public.invoice_lines
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- RLS
-- ===========================================================================
alter table public.app_settings      enable row level security;
alter table public.promo_codes       enable row level security;
alter table public.document_counters enable row level security;
alter table public.invoices          enable row level security;
alter table public.invoice_lines     enable row level security;

-- app_settings : lecture connectés, écriture admin
create policy "app_settings_read"  on public.app_settings for select to authenticated using (true);
create policy "app_settings_admin" on public.app_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- promo_codes : lecture connectés (pour valider un code saisi), écriture admin
create policy "promo_codes_read"  on public.promo_codes for select to authenticated using (true);
create policy "promo_codes_admin" on public.promo_codes for all
  using (public.is_admin()) with check (public.is_admin());

-- document_counters : admin uniquement (la fonction est SECURITY DEFINER)
create policy "document_counters_admin" on public.document_counters for all
  using (public.is_admin()) with check (public.is_admin());

-- invoices : le destinataire lit les siennes ; admin tout
create policy "invoices_read_own" on public.invoices for select
  using (billed_to_profile_id = auth.uid());
create policy "invoices_admin_all" on public.invoices for all
  using (public.is_admin()) with check (public.is_admin());

create policy "invoice_lines_read_own" on public.invoice_lines for select
  using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_lines.invoice_id
        and i.billed_to_profile_id = auth.uid()
    )
  );
create policy "invoice_lines_admin_all" on public.invoice_lines for all
  using (public.is_admin()) with check (public.is_admin());
