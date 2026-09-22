import { NextResponse, type NextRequest } from "next/server";
import ExcelJS from "exceljs";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { ACCOUNT_LABEL, computeAnnexB, needsPiece } from "@/lib/ledger";
import { loadCategories, loadEntries, loadYears, pickYear } from "../data";

const EURO = '#,##0.00 "€";[Red]-#,##0.00 "€"';

/** Export Excel d'un exercice, pour le comptable. */
export async function GET(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !["admin", "comptable"].includes(profile.role)) {
    return new NextResponse("Accès refusé", { status: 403 });
  }

  const supabase = await createClient();
  const years = await loadYears(supabase);
  const year = pickYear(years, request.nextUrl.searchParams.get("annee") ?? undefined);
  const [entries, categories, { data: invoices }] = await Promise.all([
    loadEntries(supabase, year),
    loadCategories(supabase),
    supabase
      .from("invoices")
      .select("kind, number, status, issued_on, due_on, paid_at, total_cents, structured_comm, recipient_snapshot")
      .neq("status", "draft")
      .gte("issued_on", `${year}-01-01`)
      .lte("issued_on", `${year}-12-31`)
      .order("number"),
  ]);
  const cat = new Map(categories.map((c) => [c.code, c]));

  const wb = new ExcelJS.Workbook();
  wb.creator = "Xperience Padel Academy";
  wb.created = new Date();

  // --- Journal, dans l'ordre chronologique, avec solde progressif ---------
  const journal = wb.addWorksheet(`Journal ${year}`, {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  journal.columns = [
    { header: "Date", key: "date", width: 12 },
    { header: "Compte", key: "compte", width: 16 },
    { header: "N° suite", key: "suite", width: 9 },
    { header: "Libellé", key: "libelle", width: 46 },
    { header: "Contrepartie", key: "contrepartie", width: 24 },
    { header: "Communication", key: "communication", width: 24 },
    { header: "Recettes", key: "recette", width: 12, style: { numFmt: EURO } },
    { header: "Dépenses", key: "depense", width: 12, style: { numFmt: EURO } },
    { header: "Solde", key: "solde", width: 12, style: { numFmt: EURO } },
    { header: "Catégorie", key: "categorie", width: 22 },
    { header: "Poste Annexe B", key: "poste", width: 26 },
    { header: "N° pièce", key: "piece", width: 13 },
    { header: "Pièces jointes", key: "pj", width: 13 },
    { header: "Note", key: "note", width: 30 },
  ];
  let solde = 0;
  for (const e of [...entries].sort((a, b) => a.operation_date.localeCompare(b.operation_date))) {
    solde += e.amount_cents;
    const c = e.category_code ? cat.get(e.category_code) : undefined;
    journal.addRow({
      date: new Date(`${e.operation_date}T00:00:00Z`),
      compte: ACCOUNT_LABEL[e.account],
      suite: e.statement_seq ?? "",
      libelle: e.description,
      contrepartie: e.counterparty ?? "",
      communication: e.communication ?? "",
      recette: e.amount_cents > 0 ? e.amount_cents / 100 : null,
      depense: e.amount_cents < 0 ? -e.amount_cents / 100 : null,
      solde: solde / 100,
      categorie: c?.label ?? "À CLASSER",
      poste: c ? (c.annex_post ?? "Virement interne") : "",
      piece: e.piece_number ?? "",
      pj: e.attachment_count || (needsPiece(e) ? "MANQUANTE" : ""),
      note: e.notes ?? "",
    });
  }
  journal.getColumn("date").numFmt = "dd/mm/yyyy";
  styleHeader(journal);

  // --- Annexe B ------------------------------------------------------------
  const a = computeAnnexB(entries, categories);
  const annexe = wb.addWorksheet("Annexe B");
  annexe.columns = [{ width: 34 }, { width: 14 }, { width: 4 }, { width: 34 }, { width: 14 }];
  annexe.addRow([`Comptes annuels ${year} — Annexe B`]).font = { bold: true, size: 13 };
  annexe.addRow(["État des recettes et des dépenses"]);
  annexe.addRow([]);
  const head = annexe.addRow(["Dépenses", "", "", "Recettes", ""]);
  head.font = { bold: true };
  const flat = (lines: typeof a.depenses) =>
    lines.flatMap((l) => [
      { label: l.post, cents: l.totalCents, bold: true },
      ...l.details.map((d) => ({ label: `   - ${d.label}`, cents: d.totalCents, bold: false })),
    ]);
  const left = flat(a.depenses);
  const right = flat(a.recettes);
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const l = left[i];
    const r = right[i];
    const row = annexe.addRow([
      l?.label ?? "", l ? l.cents / 100 : "", "",
      r?.label ?? "", r ? r.cents / 100 : "",
    ]);
    if (l?.bold) row.getCell(1).font = { bold: true };
    if (r?.bold) row.getCell(4).font = { bold: true };
  }
  const tot = annexe.addRow([
    "Total des dépenses", a.totalDepensesCents / 100, "",
    "Total des recettes", a.totalRecettesCents / 100,
  ]);
  tot.font = { bold: true };
  annexe.addRow([]);
  annexe.addRow([
    "Résultat de l'exercice", (a.totalRecettesCents - a.totalDepensesCents) / 100,
  ]).font = { bold: true };
  if (a.unclassified.count > 0) {
    annexe.addRow([
      `Attention : ${a.unclassified.count} opération(s) non classée(s), absentes de ce tableau.`,
    ]).font = { color: { argb: "FFB45309" } };
  }
  annexe.getColumn(2).numFmt = EURO;
  annexe.getColumn(5).numFmt = EURO;

  // --- Factures émises -----------------------------------------------------
  const fac = wb.addWorksheet("Factures émises", { views: [{ state: "frozen", ySplit: 1 }] });
  fac.columns = [
    { header: "Type", key: "type", width: 14 },
    { header: "Numéro", key: "numero", width: 12 },
    { header: "Date", key: "date", width: 12 },
    { header: "Échéance", key: "echeance", width: 12 },
    { header: "Client", key: "client", width: 30 },
    { header: "Montant", key: "montant", width: 12, style: { numFmt: EURO } },
    { header: "Statut", key: "statut", width: 12 },
    { header: "Payée le", key: "payee", width: 12 },
    { header: "Communication", key: "comm", width: 22 },
  ];
  const STATUS: Record<string, string> = { sent: "À payer", paid: "Payée", cancelled: "Annulée" };
  for (const i of invoices ?? []) {
    fac.addRow({
      type: i.kind === "credit_note" ? "Note de crédit" : "Facture",
      numero: i.number,
      date: new Date(`${i.issued_on}T00:00:00Z`),
      echeance: i.due_on ? new Date(`${i.due_on}T00:00:00Z`) : null,
      client: (i.recipient_snapshot as { name?: string } | null)?.name ?? "",
      montant: i.total_cents / 100,
      statut: STATUS[i.status] ?? i.status,
      payee: i.paid_at ? new Date(i.paid_at) : null,
      comm: i.structured_comm ?? "",
    });
  }
  for (const k of ["date", "echeance", "payee"]) fac.getColumn(k).numFmt = "dd/mm/yyyy";
  styleHeader(fac);

  // --- Pièces manquantes ---------------------------------------------------
  const pm = wb.addWorksheet("Pièces manquantes");
  pm.columns = [
    { header: "Date", key: "date", width: 12 },
    { header: "Libellé", key: "libelle", width: 46 },
    { header: "Catégorie", key: "categorie", width: 22 },
    { header: "Montant", key: "montant", width: 12, style: { numFmt: EURO } },
  ];
  for (const e of entries.filter((x) => needsPiece(x) && x.attachment_count === 0)) {
    pm.addRow({
      date: new Date(`${e.operation_date}T00:00:00Z`),
      libelle: e.description,
      categorie: e.category_code ? cat.get(e.category_code)?.label : "À classer",
      montant: -e.amount_cents / 100,
    });
  }
  pm.getColumn("date").numFmt = "dd/mm/yyyy";
  styleHeader(pm);

  const buffer = await wb.xlsx.writeBuffer();
  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="XP-Comptabilite-${year}.xlsx"`,
    },
  });
}

function styleHeader(ws: ExcelJS.Worksheet) {
  const row = ws.getRow(1);
  row.font = { bold: true };
  row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F1EE" } };
}
