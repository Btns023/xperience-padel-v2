#!/usr/bin/env node
/**
 * Import des inscriptions existantes — voir docs/import-format.md
 *
 *   node scripts/import.mjs data/import.csv --dry-run
 *   node scripts/import.mjs data/import.csv
 *
 * Lit NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY dans .env.local.
 * Squelette : à ajuster une fois le vrai fichier reçu (colonnes, encodage,
 * façon de retrouver les créneaux).
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// --- env ------------------------------------------------------------
const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
    }),
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

// --- args -----------------------------------------------------------
const [, , file, ...flags] = process.argv;
const dryRun = flags.includes("--dry-run");
if (!file) {
  console.error("Usage: node scripts/import.mjs <fichier.csv> [--dry-run]");
  process.exit(1);
}

// --- CSV -----------------------------------------------------------
function parseCsv(text) {
  const rows = [];
  let field = "";
  let row = [];
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQ = false;
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === "," || c === ";") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (field !== "" || row.length) { row.push(field); rows.push(row); }
      field = ""; row = [];
      if (c === "\r" && text[i + 1] === "\n") i++;
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift().map((h) => h.trim().toLowerCase());
  return rows
    .filter((r) => r.some((v) => v.trim() !== ""))
    .map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? "").trim()])));
}

const records = parseCsv(readFileSync(file, "utf8"));
console.log(`${records.length} ligne(s) lue(s) depuis ${file}\n`);

// --- référentiels ------------------------------------------------
const { data: slots } = await supabase
  .from("slots")
  .select("id, weekday, start_time, products(slug)");
const WD = ["", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
function findSlot(formule, creneau) {
  if (!creneau) return null;
  const m = creneau.toLowerCase().match(/(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche).*?(\d{1,2})[:h](\d{2})?/);
  if (!m) return null;
  const wd = WD.indexOf(m[1]);
  const hh = m[2].padStart(2, "0") + ":" + (m[3] ?? "00");
  return (
    slots?.find(
      (s) =>
        s.weekday === wd &&
        String(s.start_time).startsWith(hh) &&
        (!formule || s.products?.slug === formule),
    ) ?? null
  );
}

// --- import ----------------------------------------------------
let created = 0;
let skipped = 0;
for (const [n, r] of records.entries()) {
  const payerEmail = (r.payeur_email || "").toLowerCase();
  if (!payerEmail) { console.warn(`L${n + 2}: payeur_email vide — ignoré`); skipped++; continue; }

  const slot = findSlot(r.formule, r.creneau);
  const line = `L${n + 2} ${r.joueur_prenom} ${r.joueur_nom} → ${r.formule || "?"} ${
    slot ? "(créneau OK)" : "(créneau ??)"
  } · payeur ${payerEmail}${r.entreprise ? ` · ${r.entreprise}` : ""}`;

  if (dryRun) { console.log(line); created++; continue; }

  // 1. compte payeur
  let payerId;
  const { data: existing } = await supabase.auth.admin.listUsers();
  const u = existing?.users?.find((x) => x.email?.toLowerCase() === payerEmail);
  if (u) payerId = u.id;
  else {
    const { data: nu, error } = await supabase.auth.admin.createUser({
      email: payerEmail,
      email_confirm: true,
      password: crypto.randomUUID(),
      user_metadata: { first_name: r.payeur_prenom, last_name: r.payeur_nom, phone: r.payeur_tel },
    });
    if (error) { console.error(`L${n + 2}: ${error.message}`); skipped++; continue; }
    payerId = nu.user.id;
  }

  // 2. entreprise éventuelle
  let orgId = null;
  if (r.entreprise) {
    const { data: org } = await supabase
      .from("organizations")
      .upsert({ owner_id: payerId, name: r.entreprise, vat_number: r.entreprise_tva || null }, { onConflict: "owner_id,name" })
      .select("id")
      .single();
    orgId = org?.id ?? null;
  }

  // 3. fiche joueur
  const { data: player, error: pErr } = await supabase
    .from("players")
    .insert({
      managed_by: payerId,
      first_name: r.joueur_prenom,
      last_name: r.joueur_nom,
      email: (r.joueur_email || payerEmail).toLowerCase(),
      birthdate: r.joueur_naissance || "2000-01-01",
      level_code: (r.joueur_niveau || "NC").toUpperCase(),
      image_consent: /oui|yes|1|true/i.test(r.droit_image || ""),
      invitation_status: "pending",
    })
    .select("id")
    .single();
  if (pErr) { console.error(`L${n + 2}: joueur — ${pErr.message}`); skipped++; continue; }

  // 4. inscription
  if (slot) {
    const priceCents = r.prix_joueur ? Math.round(parseFloat(r.prix_joueur.replace(",", ".")) * 100) : null;
    const { error: rErr } = await supabase.from("registrations").insert({
      player_id: player.id,
      slot_id: slot.id,
      season_id: (await supabase.from("slots").select("season_id").eq("id", slot.id).single()).data.season_id,
      status: r.statut || "validee",
      billed_to_profile_id: payerId,
      billed_to_org_id: orgId,
      unit_price_cents: priceCents,
      notes: r.note || null,
    });
    if (rErr) { console.error(`L${n + 2}: inscription — ${rErr.message}`); skipped++; continue; }
  }

  console.log("✓ " + line);
  created++;
}

console.log(`\n${dryRun ? "[dry-run] " : ""}${created} traité(s), ${skipped} ignoré(s).`);
