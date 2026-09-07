-- ===========================================================================
-- Correctif — garde-fou de changement de rôle
-- ---------------------------------------------------------------------------
-- La version initiale bloquait TOUT changement de rôle par un non-admin,
-- y compris les contextes sans utilisateur authentifié (SQL direct, clé
-- service_role, tâches planifiées) — ce qui rendait impossible la création
-- du tout premier administrateur.
--
-- Nouvelle règle : on ne bloque que lorsqu'un utilisateur **authentifié**
-- et **non-admin** tente de modifier un rôle. Sans auth.uid() (SQL direct /
-- service_role), la modification est autorisée.
-- ===========================================================================

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Modification du rôle interdite';
  end if;
  return new;
end;
$$;
