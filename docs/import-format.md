# Import des inscriptions existantes

Pour reprendre les inscriptions déjà réalisées, envoie un fichier **CSV** (ou
Excel exporté en CSV, séparateur `;` ou `,`) avec **une ligne par joueur
inscrit** et les colonnes suivantes. Les colonnes marquées *(facultatif)*
peuvent être vides.

| Colonne | Exemple | Notes |
|---|---|---|
| `payeur_prenom` | Geoffroy | Personne qui reçoit la facture |
| `payeur_nom` | Beaudot | |
| `payeur_email` | geoffroybeaudot@hotmail.com | Sert d'identifiant du compte |
| `payeur_tel` | 0470 12 34 56 | *(facultatif)* |
| `payeur_adresse` | Chemin d'Eole 32, 5030 Gembloux | *(facultatif)* |
| `entreprise` | Club Padel Smash | *(facultatif)* — si rempli, facture au nom de l'entreprise |
| `entreprise_tva` | BE0123.456.789 | *(facultatif)* |
| `joueur_prenom` | Lucas | Le joueur inscrit (peut être le payeur lui-même) |
| `joueur_nom` | Beaudot | |
| `joueur_email` | lucas.beaudot@gmail.com | *(facultatif — sinon celui du payeur)* |
| `joueur_naissance` | 2011-05-14 | Format `AAAA-MM-JJ` |
| `joueur_niveau` | P200 | `NC`, `P100`, `P200`, `P300`, `P400`, `P500`, `P700`, `P1000` |
| `droit_image` | oui | `oui` ou `non` |
| `formule` | stage-ete | `cycle-adulte`, `cycle-enfant`, `stage-ete`, `ete-indien`, `cours-prive` |
| `creneau` | Lundi 17:00 | *(facultatif)* — jour + heure, pour retrouver le créneau |
| `statut` | validee | `demande_recue`, `groupe_constitue`, `validee`, `facturee`, `payee` |
| `prix_joueur` | 105 | *(facultatif)* — en euros, si déjà connu |
| `note` | Été 6 — payé le 12/08 | *(facultatif)* |

## Ce que fait l'import

1. Crée un **compte** pour chaque `payeur_email` (mot de passe temporaire ;
   le payeur fera « mot de passe oublié » pour y accéder).
2. Crée la **fiche joueur** rattachée à ce compte.
3. Crée l'**inscription** au créneau correspondant, avec le statut fourni.
4. En mode `--dry-run`, affiche ce qui serait créé **sans rien écrire**.

Les créneaux (`slots`) et produits doivent déjà exister dans l'admin ; sinon
l'import crée les inscriptions sans créneau et te les signale.

## Lancer

```bash
node scripts/import.mjs data/import.csv --dry-run   # aperçu
node scripts/import.mjs data/import.csv             # exécution
```

Le script lit `NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` dans
`.env.local`.
