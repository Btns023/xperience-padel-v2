import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select(
      "kind, number, issued_on, status, total_cents, structured_comm, paid_at, recipient_snapshot, invoice_lines(description)",
    )
    .neq("status", "draft")
    .order("issued_on", { ascending: true });

  const header = [
    "type",
    "numero",
    "date_emission",
    "client",
    "type_client",
    "tva_client",
    "libelle",
    "total_ttc_eur",
    "tva_eur",
    "moyen_paiement",
    "date_paiement",
    "statut",
    "communication_structuree",
  ];

  const rows = (data ?? []).map((r) => {
    const rcpt = (r.recipient_snapshot ?? {}) as Record<string, string>;
    const libelle = ((r.invoice_lines ?? []) as { description: string }[])
      .map((l) => l.description)
      .join(" ; ");
    return [
      r.kind === "credit_note" ? "note de crédit" : "facture",
      r.number ?? "",
      r.issued_on ?? "",
      rcpt.name ?? "",
      rcpt.type ?? "",
      rcpt.vat_number ?? "",
      libelle,
      (r.total_cents / 100).toFixed(2).replace(".", ","),
      "0,00",
      r.status === "paid" ? "virement" : "",
      r.paid_at ? String(r.paid_at).slice(0, 10) : "",
      r.status,
      r.structured_comm ?? "",
    ];
  });

  const csv = [header, ...rows]
    .map((line) => line.map(csvCell).join(";"))
    .join("\r\n");

  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="factures-xperience-padel.csv"`,
    },
  });
}
