"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { formatEuros } from "@/lib/format";
import type { Invoice, InvoiceLine } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addLine,
  updateLine,
  deleteLine,
  updateInvoiceMeta,
  issueInvoice,
  markPaid,
  markUnpaid,
  deleteDraft,
  createCreditNote,
} from "./actions";

function Sm({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "…" : label}
    </Button>
  );
}

export function MetaForm({ invoice }: { invoice: Invoice }) {
  return (
    <form
      action={updateInvoiceMeta.bind(null, invoice.id)}
      className="flex flex-wrap items-end gap-3 rounded-lg border p-4"
    >
      <div className="flex flex-col gap-1">
        <Label htmlFor="issued_on" className="text-xs">
          Date d&apos;émission
        </Label>
        <Input
          id="issued_on"
          name="issued_on"
          type="date"
          defaultValue={invoice.issued_on}
          className="h-8"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <Label htmlFor="vat_note" className="text-xs">
          Mention TVA
        </Label>
        <Input
          id="vat_note"
          name="vat_note"
          defaultValue={invoice.vat_note}
          className="h-8"
        />
      </div>
      <div className="flex w-full flex-col gap-1">
        <Label htmlFor="notes" className="text-xs">
          Notes (bas de facture)
        </Label>
        <Input
          id="notes"
          name="notes"
          defaultValue={invoice.notes ?? ""}
          className="h-8"
        />
      </div>
      <Sm label="Enregistrer" />
    </form>
  );
}

function LineRow({ invoiceId, line }: { invoiceId: string; line: InvoiceLine }) {
  return (
    <form
      action={updateLine.bind(null, invoiceId, line.id)}
      className="flex flex-wrap items-end gap-2 border-b py-2 last:border-b-0"
    >
      <div className="flex min-w-52 flex-1 flex-col gap-1">
        <span className="text-xs text-muted-foreground">Description</span>
        <Input
          name="description"
          defaultValue={line.description}
          className="h-8"
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Qté</span>
        <Input
          name="quantity"
          type="number"
          min={1}
          defaultValue={line.quantity}
          className="h-8 w-16"
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">PU (€)</span>
        <Input
          name="unit_price"
          inputMode="decimal"
          defaultValue={(line.unit_price_cents / 100).toString()}
          className="h-8 w-24"
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Remise (€)</span>
        <Input
          name="discount"
          inputMode="decimal"
          defaultValue={(line.discount_cents / 100).toString()}
          className="h-8 w-24"
        />
      </div>
      <span className="w-24 pb-1.5 text-right text-sm tabular-nums">
        {formatEuros(line.amount_cents)}
      </span>
      <Sm label="OK" />
      <button
        type="submit"
        formAction={deleteLine.bind(null, invoiceId, line.id)}
        className="pb-1.5 text-xs text-destructive underline-offset-4 hover:underline"
      >
        Suppr.
      </button>
    </form>
  );
}

export function LinesEditor({
  invoiceId,
  lines,
}: {
  invoiceId: string;
  lines: InvoiceLine[];
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="mb-2 text-sm font-medium">Lignes</p>
      <div className="flex flex-col">
        {lines.map((l) => (
          <LineRow key={l.id} invoiceId={invoiceId} line={l} />
        ))}
      </div>
      <form action={addLine.bind(null, invoiceId)} className="mt-3">
        <Sm label="+ Ajouter une ligne" />
      </form>
    </div>
  );
}

export function InvoiceActions({ invoice }: { invoice: Invoice }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border p-4">
      <Link
        href={`/facture/${invoice.id}`}
        className={buttonVariants({ variant: "outline", size: "sm" })}
        target="_blank"
      >
        Aperçu / PDF (imprimer)
      </Link>

      {invoice.status === "draft" ? (
        <>
          <form action={issueInvoice.bind(null, invoice.id)}>
            <Sm label="Émettre (numéroter + marquer envoyée)" />
          </form>
          <form action={deleteDraft.bind(null, invoice.id)}>
            <button
              type="submit"
              className="text-xs text-destructive underline-offset-4 hover:underline"
            >
              Supprimer le brouillon
            </button>
          </form>
        </>
      ) : null}

      {invoice.status === "sent" && invoice.kind === "invoice" ? (
        <>
          <form action={markPaid.bind(null, invoice.id)}>
            <Sm label="Marquer payée" />
          </form>
          <form action={createCreditNote.bind(null, invoice.id)}>
            <Button type="submit" variant="destructive" size="sm">
              Note de crédit (annuler + rembourser)
            </Button>
          </form>
        </>
      ) : null}

      {invoice.status === "paid" ? (
        <>
          <form action={markUnpaid.bind(null, invoice.id)}>
            <button
              type="submit"
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              Annuler le pointage du paiement
            </button>
          </form>
          <form action={createCreditNote.bind(null, invoice.id)}>
            <Button type="submit" variant="destructive" size="sm">
              Note de crédit (rembourser)
            </Button>
          </form>
        </>
      ) : null}
    </div>
  );
}
