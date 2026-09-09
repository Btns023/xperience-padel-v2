"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { formatEuros } from "@/lib/format";
import { GROUP_STATUS_LABEL, type GroupStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  assignRegistration,
  unassignRegistration,
  updateGroup,
  deleteGroup,
  reopenGroup,
  confirmGroup,
  type ConfirmState,
} from "./actions";
import { generateInvoicesForGroup } from "@/app/(app)/admin/factures/actions";
import { CancellationActions } from "@/app/(app)/admin/demandes/cancel-actions";

export type RegView = {
  id: string;
  level_mismatch: boolean;
  cancelRequested: boolean;
  lateCancellation: boolean;
  unit_price_cents: number | null;
  player: string;
  level: string;
  billedTo: string;
};

export type GroupView = {
  id: string;
  label: string | null;
  size: number | null;
  status: GroupStatus;
};

const orangeBadge =
  "border-transparent bg-orange-500/15 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300";

function SubmitSm({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "…" : label}
    </Button>
  );
}

export function AssignForm({
  slotId,
  reg,
  groups,
}: {
  slotId: string;
  reg: RegView;
  groups: GroupView[];
}) {
  const [target, setTarget] = useState("new");
  return (
    <div className="flex flex-col gap-2 rounded-md border p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium">{reg.player}</span>
          <span className="text-muted-foreground">{reg.level}</span>
          {reg.level_mismatch ? (
            <Badge className={orangeBadge}>écart de niveau</Badge>
          ) : null}
          {reg.cancelRequested ? (
            <Badge variant="destructive">annulation demandée</Badge>
          ) : null}
          {reg.lateCancellation ? (
            <Badge variant="outline">annulation tardive — dû</Badge>
          ) : null}
          <span className="text-xs text-muted-foreground">· {reg.billedTo}</span>
        </div>
        <form
          action={assignRegistration.bind(null, slotId, reg.id, target)}
          className="flex items-center gap-2"
        >
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="h-8 rounded-md border bg-background px-2 text-sm"
          >
            <option value="new">→ Nouveau groupe</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                → {g.label ?? "Groupe"}
              </option>
            ))}
          </select>
          <SubmitSm label="Assigner" />
        </form>
      </div>
      {reg.cancelRequested ? (
        <div className="border-t pt-2">
          <CancellationActions registrationId={reg.id} slotId={slotId} />
        </div>
      ) : null}
    </div>
  );
}

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Confirmation…" : "Confirmer l'effectif → Validée"}
    </Button>
  );
}

export function GroupCard({
  slotId,
  group,
  members,
  pricingModel,
  invoiced,
}: {
  slotId: string;
  group: GroupView;
  members: RegView[];
  pricingModel: string;
  invoiced: boolean;
}) {
  const [state, confirmAction] = useActionState<ConfirmState, FormData>(
    confirmGroup.bind(null, slotId, group.id),
    {},
  );
  const confirmed = group.status === "confirmed";
  const manual = pricingModel === "flat" || pricingModel === "unit";

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{group.label ?? "Groupe"}</span>
        <Badge variant={confirmed ? "default" : "secondary"}>
          {GROUP_STATUS_LABEL[group.status]}
        </Badge>
        <span className="text-xs text-muted-foreground">
          effectif {confirmed && group.size ? group.size : members.length}{" "}
          joueur(s)
        </span>
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucun joueur. Assigne des demandes à ce groupe ci-dessus.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {members.map((m) => (
            <li key={m.id} className="flex flex-col gap-1.5 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{m.player}</span>
                  <span className="text-muted-foreground">{m.level}</span>
                  {m.level_mismatch ? (
                    <Badge className={orangeBadge}>écart</Badge>
                  ) : null}
                  {m.cancelRequested ? (
                    <Badge variant="destructive">annulation demandée</Badge>
                  ) : null}
                  {m.lateCancellation ? (
                    <Badge variant="outline">tardive — dû</Badge>
                  ) : null}
                  {m.unit_price_cents != null ? (
                    <span className="tabular-nums text-muted-foreground">
                      {formatEuros(m.unit_price_cents)} / joueur
                    </span>
                  ) : null}
                </span>
                {!confirmed ? (
                  <form action={unassignRegistration.bind(null, slotId, m.id)}>
                    <button
                      type="submit"
                      className="text-xs text-destructive underline-offset-4 hover:underline"
                    >
                      Retirer
                    </button>
                  </form>
                ) : null}
              </div>
              {m.cancelRequested ? (
                <CancellationActions registrationId={m.id} slotId={slotId} />
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {confirmed ? (
        <div className="flex flex-wrap items-center gap-3 border-t pt-3">
          {invoiced ? (
            <Link
              href="/admin/factures"
              className="text-sm underline underline-offset-4"
            >
              Facturé ✓ — voir les factures
            </Link>
          ) : (
            <form action={generateInvoicesForGroup.bind(null, group.id, slotId)}>
              <Button type="submit" size="sm">
                Facturer ce groupe
              </Button>
            </form>
          )}
          <form action={reopenGroup.bind(null, slotId, group.id)}>
            <Button type="submit" variant="outline" size="sm">
              Rouvrir le groupe
            </Button>
          </form>
        </div>
      ) : (
        <>
          <form
            action={updateGroup.bind(null, slotId, group.id)}
            className="flex flex-wrap items-end gap-3 border-t pt-3"
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs" htmlFor={`label-${group.id}`}>
                Nom du groupe
              </label>
              <Input
                id={`label-${group.id}`}
                name="label"
                defaultValue={group.label ?? ""}
                className="h-8 w-40"
              />
            </div>
            <SubmitSm label="Enregistrer" />
          </form>

          {members.length > 0 ? (
            <form
              action={confirmAction}
              className="flex flex-col gap-3 border-t pt-3"
            >
              <p className="text-xs text-muted-foreground">
                {manual
                  ? "Ce produit n'a pas de grille par effectif — saisis le prix par joueur (€)."
                  : `Effectif = ${members.length} joueur(s). Prix par joueur calculé automatiquement selon la grille ; laisse « auto », ou force un montant (prorata…).`}
              </p>
              <div className="flex flex-col gap-2">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 text-sm">
                    <span className="w-40 truncate text-muted-foreground">
                      {m.player}
                    </span>
                    <Input
                      name={`price_${m.id}`}
                      inputMode="decimal"
                      placeholder={manual ? "€" : "auto"}
                      className="h-8 w-28"
                    />
                  </div>
                ))}
              </div>
              {state.error ? (
                <p className="text-sm text-destructive">{state.error}</p>
              ) : null}
              <div>
                <ConfirmButton />
              </div>
            </form>
          ) : null}

          <form
            action={deleteGroup.bind(null, slotId, group.id)}
            className="border-t pt-3"
          >
            <button
              type="submit"
              className="text-xs text-destructive underline-offset-4 hover:underline"
            >
              Supprimer ce groupe
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export function CreateGroupButton({
  action,
}: {
  action: () => Promise<void>;
}) {
  return (
    <form action={action}>
      <SubmitSm label="+ Nouveau groupe" />
    </form>
  );
}
