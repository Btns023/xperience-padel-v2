@AGENTS.md

# Xperience Padel V2 — conventions du projet

Contexte métier : voir `README.md` et le cahier des charges
<https://claude.ai/code/artifact/379a4eed-517b-4964-af30-c6249db84821>.

## Langue

- Toute l'interface, les libellés, les e-mails et les messages d'erreur
  destinés aux utilisateurs sont en **français**.
- Le code (identifiants, commentaires courts) peut rester en anglais ;
  les commentaires explicatifs sont en français.

## UI — shadcn/ui style `base-nova` (Base UI, pas Radix)

- Les composants utilisent **Base UI** (`@base-ui/react`), pas Radix.
- Pour composer un composant avec un autre élément, utiliser la prop
  **`render`**, PAS `asChild` :
  ```tsx
  <Button render={<Link href="/x" />}>Libellé</Button>
  ```
- `cn` est importé depuis le paquet `cn` (`src/lib/utils.ts` le ré-exporte).
- Ajouter un composant : `pnpm dlx shadcn@latest add <nom> --yes`.
- Icônes : `lucide-react`.

## Supabase

- Client navigateur : `createClient()` de `@/lib/supabase/client` (fichiers
  `"use client"` uniquement).
- Client serveur : `createClient()` de `@/lib/supabase/server` (Server
  Components, Route Handlers, Server Actions).
- Client admin (contourne RLS, clé secrète) : `createAdminClient()` — réservé
  aux imports, tâches planifiées, webhooks.
- La session est rafraîchie dans `src/proxy.ts` → `updateSession`. **Ne rien
  exécuter entre `createServerClient` et `getUser()`** dans ce fichier.
- Auth : e-mail + mot de passe, activation par lien (`/auth/confirm`).

## Base de données & migrations

- Une migration = un fichier `supabase/migrations/<timestamp>_<nom>.sql`,
  jamais modifié après avoir été appliqué (en créer un nouveau).
- RLS activé sur **toutes** les tables applicatives.
- Pour tester le rôle dans une politique, utiliser les fonctions
  `public.is_admin()` / `public.current_app_role()` (SECURITY DEFINER) afin
  d'éviter la récursion RLS — ne pas faire de sous-requête directe sur
  `profiles` depuis une politique de `profiles`.
- Après une migration qui touche le schéma : régénérer
  `src/lib/database.types.ts` (voir README) et remplacer progressivement les
  types manuels de `src/lib/types.ts`.

## Routes

- Espaces protégés : `/compte` (client), `/coach` (coach + admin),
  `/admin` (admin). La protection est double : `src/proxy.ts` (redirection) +
  `requireRole()` dans les pages.
- Routes d'auth publiques : `/connexion`, `/inscription`, `/auth/*`.

## Avant de committer

```bash
pnpm lint && pnpm exec tsc --noEmit && pnpm build
```

## Périmètre hors V1 (ne pas implémenter sans validation)

Paiement en ligne · réduction fratrie · majoration ×1,5 des cycles enfants ·
SMS · multilingue · cours « hiver » · auto-désinscription client.
