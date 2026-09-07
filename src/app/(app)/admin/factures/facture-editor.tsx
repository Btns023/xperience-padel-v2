"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { formatDate, formatEuros } from "@/lib/format";
import type { Invoice, InvoiceLine, Payment } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addLine,
  updateLine,
  deleteLine,
  updateInvoiceMeta,
  issueInvoice,
  deleteDraft,
  createCreditNote,
} from "./actions";
import {
  recordPayment,
  deletePayment,
  toggleDunningPause,
  dunOne,
} from "./payment-actions";

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
      <div className="flex flex-col gap-1">
        <Label htmlFor="due_on" className="text-xs">
          Date d&apos;échéance
        </Label>
        <Input
          id="due_on"
          name="due_on"
          type="date"
          defaultValue={invoice.due_on ?? ""}
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

      {(invoice.status === "sent" || invoice.status === "paid") &&
      invoice.kind === "invoice" ? (
        <form action={createCreditNote.bind(null, invoice.id)}>
          <Button type="submit" variant="destructive" size="sm">
            Note de crédit (annuler + rembourser)
          </Button>
        </form>
      ) : null}
    </div>
  );
}

export function PaymentsPanel({
  invoice,
  payments,
}: {
  invoice: Invoice;
  payments: Payment[];
}) {
  const paid = payments.reduce((s, p) => s + p.amount_cents, 0);
  const remaining = invoice.total_cents - paid;

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium">Paiements</p>
        <p className="text-sm tabular-nums text-muted-foreground">
          Réglé {formatEuros(paid)} / {formatEuros(invoice.total_cents)} ·{" "}
          {remaining > 0 ? (
            <span className="text-foreground">
              reste {formatEuros(remaining)}
            </span>
          ) : (
            <span className="text-foreground">soldé</span>
          )}
        </p>
      </div>

      {payments.length > 0 ? (
        <ul className="flex flex-col gap-1.5 text-sm">
          {payments.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2"
            >
              <span>
                <span className="tabular-nums font-medium">
                  {formatEuros(p.amount_cents)}
                </span>{" "}
                <span className="text-muted-foreground">
                  · {formatDate(p.paid_on)} · {p.method}
                  {p.reference ? ` · ${p.reference}` : ""}
                </span>
              </span>
              <form action={deletePayment.bind(null, invoice.id, p.id)}>
                <button
                  type="submit"
                  className="text-xs text-destructive underline-offset-4 hover:underline"
                >
                  Retirer
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : null}

      <form
        action={recordPayment.bind(null, invoice.id)}
        className="flex flex-wrap items-end gap-3 border-t pt-3"
      >
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Montant (€)</span>
          <Input
            name="amount"
            inputMode="decimal"
            defaultValue={
              remaining > 0 ? (remaining / 100).toString() : ""
            }
            className="h-8 w-28"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Date</span>
          <Input
            name="paid_on"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="h-8"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Moyen</span>
          <Input name="method" defaultValue="virement" className="h-8 w-28" />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-xs text-muted-foreground">Référence</span>
          <Input
            name="reference"
            defaultValue={invoice.structured_comm ?? invoice.number ?? ""}
            className="h-8"
          />
        </div>
        <Sm label="Pointer le paiement" />
      </form>
    </div>
  );
}

export function DunningPanel({ invoice }: { invoice: Invoice }) {
  const flagged = invoice.dunning_count >= 3;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border p-4">
      <div className="flex flex-col text-sm">
        <span className="font-medium">Relances</span>
        <span className="text-muted-foreground">
          {invoice.dunning_count} envoyée(s)
          {invoice.last_dunned_at
            ? ` · dernière le ${formatDate(invoice.last_dunned_at)}`
            : ""}
          {invoice.due_on ? ` · échéance ${formatDate(invoice.due_on)}` : ""}
        </span>
      </div>
      {flagged ? (
        <span className="rounded-full border border-transparent bg-orange-500/15 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">
          signalée (≥ 3 relances)
        </span>
      ) : null}
      <div className="ml-auto flex items-center gap-3">
        <form action={dunOne.bind(null, invoice.id)}>
          <Button type="submit" variant="outline" size="sm">
            Relancer maintenant
          </Button>
        </form>
        <form
          action={toggleDunningPause.bind(
            null,
            invoice.id,
            !invoice.dunning_paused,
          )}
        >
          <button
            type="submit"
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            {invoice.dunning_paused
              ? "Réactiver les relances"
              : "Mettre les relances en pause"}
          </button>
        </form>
      </div>
    </div>
  );
}
