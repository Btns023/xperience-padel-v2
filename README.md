# Xperience Padel — Plateforme V2

Application d'inscription, de constitution des groupes et de facturation de
l'académie **Xperience Padel Academy** (Padel XP ASBL, Gembloux).

Le cahier des charges complet est le document de référence :
<https://claude.ai/code/artifact/379a4eed-517b-4964-af30-c6249db84821>

## Stack

| Brique | Choix |
|---|---|
| Application | Next.js 16 (App Router) · React 19 · TypeScript |
| UI | Tailwind CSS v4 · shadcn/ui (style `base-nova`, sur Base UI) |
| Données / Auth / Fichiers | Supabase (PostgreSQL · Auth · Storage) — projet `diokcsiupaekwhatjsgm` |
| E-mails | Resend (à partir du Lot 7) |
| Hébergement | Vercel (région UE) |
| DNS | Cloudflare (`padelxp.be`) |

Aucun paiement en ligne : la facturation se fait par virement bancaire.

## Prérequis

- Node ≥ 20 (développé sous Node 26)
- pnpm ≥ 10 (`npm install -g pnpm`)

## Installation locale

```bash
pnpm install
cp .env.example .env.local
```

Renseigner `.env.local` avec les clés Supabase
(**Dashboard → Project Settings → API**) :

- `NEXT_PUBLIC_SUPABASE_URL` — déjà rempli
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — clé *publishable* / *anon*
- `SUPABASE_SERVICE_ROLE_KEY` — clé *secret* / *service_role* (serveur uniquement)

Puis :

```bash
pnpm dev        # http://localhost:3000
```

## Base de données

Les migrations SQL vivent dans `supabase/migrations/`.

**Option A — Supabase CLI (recommandé)**

```bash
pnpm supabase login                       # jeton personnel, une fois
pnpm supabase link --project-ref diokcsiupaekwhatjsgm
pnpm supabase db push                     # applique les migrations en attente
```

**Option B — éditeur SQL**

Copier le contenu de chaque fichier de `supabase/migrations/` (dans l'ordre)
dans **Dashboard → SQL Editor** et exécuter.

### Créer le premier administrateur

1. Créer un compte normal via `/inscription` et valider l'e-mail.
2. Dans **SQL Editor** :

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'ton.email@exemple.be');
```

Les administrateurs peuvent ensuite promouvoir les autres comptes
(`client` → `coach` / `admin`) depuis l'espace d'administration (Lot 6).

### Régénérer les types TypeScript après une migration

```bash
pnpm supabase gen types typescript --linked > src/lib/database.types.ts
```

## Scripts

| Commande | Rôle |
|---|---|
| `pnpm dev` | Serveur de développement |
| `pnpm build` | Build de production |
| `pnpm start` | Sert le build |
| `pnpm lint` | ESLint |
| `pnpm exec tsc --noEmit` | Vérification de types |

## Structure

```
src/
  app/
    (auth)/            connexion, inscription, actions serveur
    (app)/             espaces authentifiés : /compte /coach /admin
    auth/              route handlers : confirm (OTP), callback (PKCE)
    layout.tsx         layout racine (lang=fr, Toaster)
    page.tsx           page d'accueil provisoire (vitrine = Lot 8)
  components/ui/        composants shadcn/ui
  lib/
    auth.ts            getCurrentUser, getCurrentProfile, requireRole…
    supabase/          client (navigateur), server, proxy (session)
    types.ts           types métier (remplacés à terme par database.types.ts)
  proxy.ts             ex-middleware : rafraîchit la session, protège les routes
supabase/
  migrations/          migrations SQL versionnées
  config.toml          configuration CLI (project_id renseigné)
```

## Feuille de route (option B)

| Lot | Contenu | État |
|---|---|---|
| **0** | Socle : Next.js, Supabase, auth, rôles, déploiement | ✅ en cours |
| 1 | Catalogue : saisons, produits, tarifs, créneaux | à venir |
| 2 | Inscription + espace client + multi-joueurs + capitaine | à venir |
| 3 | Constitution des groupes, niveaux, alertes d'écart | à venir |
| 4 | Facturation : PDF, numérotation, communication structurée, promos, notes de crédit | à venir |
| 5 | Paiements : pointage, relances hebdo, export CSV | à venir |
| 6 | Espace coach : groupes, planning, présences | à venir |
| 7 | E-mails transactionnels + préférences de notification | à venir |
| 8 | Reconstruction des pages vitrine | à venir |
| 9 | RGPD / CGV / recette / import des inscriptions existantes | à venir |
