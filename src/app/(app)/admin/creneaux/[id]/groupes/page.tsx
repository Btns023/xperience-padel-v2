import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { formatTime, weekdayLabel } from "@/lib/format";
import { createGroup } from "./actions";
import {
  AssignForm,
  GroupCard,
  CreateGroupButton,
  type GroupView,
  type RegView,
} from "./groupes-client";

export const metadata = { title: "Constitution des groupes" };

type RegRow = {
  id: string;
  status: string;
  level_mismatch: boolean;
  cancel_requested_at: string | null;
  group_id: string | null;
  unit_price_cents: number | null;
  players: { first_name: string; last_name: string; level_code: string } | null;
  billed_to: { first_name: string | null; last_name: string | null } | null;
  organizations: { name: string } | null;
};

export default async function GroupesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id: slotId } = await params;
  const supabase = await createClient();

  const [{ data: slotData }, { data: regData }, { data: groupData }] =
    await Promise.all([
      supabase
        .from("slots")
        .select(
          "id, weekday, start_time, capacity, session_count, level_note, products(name, pricing_model), locations(name)",
        )
        .eq("id", slotId)
        .single(),
      supabase
        .from("registrations")
        .select(
          "id, status, level_mismatch, cancel_requested_at, group_id, unit_price_cents, players(first_name,last_name,level_code), billed_to:profiles(first_name,last_name), organizations(name)",
        )
        .eq("slot_id", slotId)
        .neq("status", "annulee"),
      supabase
        .from("groups")
        .select("id, label, size, status")
        .eq("slot_id", slotId)
        .order("label"),
    ]);

  if (!slotData) notFound();
  const slot = slotData as unknown as {
    weekday: number;
    start_time: string;
    capacity: number;
    session_count: number;
    level_note: string | null;
    products: { name: string; pricing_model: string } | null;
    locations: { name: string } | null;
  };
  const regs = (regData ?? []) as unknown as RegRow[];
  const groups = (groupData ?? []) as GroupView[];

  const toView = (r: RegRow): RegView => ({
    id: r.id,
    level_mismatch: r.level_mismatch,
    cancelRequested: !!r.cancel_requested_at,
    unit_price_cents: r.unit_price_cents,
    player: `${r.players?.first_name ?? ""} ${r.players?.last_name ?? ""}`.trim(),
    level: r.players?.level_code ?? "",
    billedTo:
      r.organizations?.name ??
      (`${r.billed_to?.first_name ?? ""} ${r.billed_to?.last_name ?? ""}`.trim() ||
        "—"),
  });

  const unassigned = regs.filter((r) => !r.group_id).map(toView);
  const membersByGroup = new Map<string, RegView[]>();
  for (const r of regs) {
    if (!r.group_id) continue;
    const list = membersByGroup.get(r.group_id) ?? [];
    list.push(toView(r));
    membersByGroup.set(r.group_id, list);
  }

  const pricingModel = slot.products?.pricing_model ?? "";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/admin/creneaux/${slotId}`}
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Modifier le créneau
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Constitution des groupes
        </h1>
        <p className="text-muted-foreground">
          {weekdayLabel(slot.weekday)} {formatTime(slot.start_time)} ·{" "}
          {slot.products?.name}
          {slot.locations ? ` · ${slot.locations.name}` : ""} · capacité{" "}
          {slot.capacity} · {slot.session_count} séances
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">
          Demandes à placer ({unassigned.length})
        </h2>
        {unassigned.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Toutes les demandes sont assignées.
          </p>
        ) : (
          unassigned.map((r) => (
            <AssignForm key={r.id} slotId={slotId} reg={r} groups={groups} />
          ))
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Groupes ({groups.length})</h2>
          <CreateGroupButton action={createGroup.bind(null, slotId)} />
        </div>
        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun groupe. Crée-en un, ou assigne une demande à « Nouveau groupe ».
          </p>
        ) : (
          groups.map((g) => (
            <GroupCard
              key={`${g.id}:${g.status}:${g.size}`}
              slotId={slotId}
              group={g}
              members={membersByGroup.get(g.id) ?? []}
              pricingModel={pricingModel}
            />
          ))
        )}
      </section>
    </div>
  );
}
