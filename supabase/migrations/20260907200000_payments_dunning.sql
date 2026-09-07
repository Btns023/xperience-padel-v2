-- ===========================================================================
-- Lot 5 — Paiements & relances
-- ---------------------------------------------------------------------------
--  * payments        : virements pointés manuellement (partiels possibles)
--  * invoices.dunning_paused / dunning_count / last_dunned_at
-- Une facture passe « payée » quand la somme des paiements ≥ total.
-- Relances : hebdomadaires tant qu'impayé ; pause possible ; signalée à 3.
-- ===========================================================================

create table public.payments (
  id           uuid primary key default gen_random_uuid(),
  invoice_id   uuid not null references public.invoices (id) on delete cascade,
  amount_cents int  not null check (amount_cents <> 0),
  paid_on      date not null default current_date,
  method       text not null default 'virement',
  reference    text,
  note         text,
  recorded_by  uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now()
);

create index payments_invoice_idx on public.payments (invoice_id);

alter table public.invoices
  add column dunning_paused boolean not null default false,
  add column dunning_count  int     not null default 0,
  add column last_dunned_at timestamptz;

-- --- RLS ----------------------------------------------------------
alter table public.payments enable row level security;

create policy "payments_admin_all" on public.payments for all
  using (public.is_admin()) with check (public.is_admin());

create policy "payments_read_own" on public.payments for select
  using (
    exists (
      select 1 from public.invoices i
      where i.id = payments.invoice_id
        and i.billed_to_profile_id = auth.uid()
    )
  );
