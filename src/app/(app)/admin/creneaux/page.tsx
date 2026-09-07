import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatTime, weekdayLabel } from "@/lib/format";
import { SLOT_STATUS_LABEL, type Slot } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { deleteSlot } from "./actions";

export const metadata = { title: "Créneaux" };

type Row = Slot & {
  seasons: { name: string } | null;
  products: { name: string } | null;
  locations: { name: string } | null;
  coaches: { first_name: string; last_name: string } | null;
};

export default async function CreneauxPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("slots")
    .select(
      "*, seasons(name), products(name), locations(name), coaches(first_name,last_name)",
    )
    .order("weekday")
    .order("start_time");

  const slots = (data ?? []) as Row[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Créneaux</h1>
          <p className="text-muted-foreground">
            Chaque créneau appartient à une saison et un produit. Le joueur
            choisit son créneau ; l&apos;étiquette de niveau est visible de tous.
          </p>
        </div>
        <Link href="/admin/creneaux/nouveau" className={buttonVariants()}>
          Nouveau créneau
        </Link>
      </div>

      {error ? (
        <p className="text-sm text-destructive">Erreur : {error.message}</p>
      ) : slots.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucun créneau. Crée le premier après avoir défini une saison et vérifié
          les produits.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {slots.map((s) => {
            const level =
              s.level_note ||
              [s.min_level_code, s.max_level_code].filter(Boolean).join("–");
            return (
              <li
                key={s.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-lg border p-4"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/creneaux/${s.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {weekdayLabel(s.weekday)} {formatTime(s.start_time)}
                    </Link>
                    <Badge
                      variant={s.status === "open" ? "default" : "secondary"}
                    >
                      {SLOT_STATUS_LABEL[s.status]}
                    </Badge>
                    {level ? <Badge variant="outline">{level}</Badge> : null}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {s.products?.name ?? "—"} · {s.seasons?.name ?? "—"} ·
                    capacité {s.capacity}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {s.locations?.name ?? "lieu ?"}
                    {s.coaches
                      ? ` · ${s.coaches.first_name} ${s.coaches.last_name}`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/creneaux/${s.id}`}
                    className="text-sm underline underline-offset-4"
                  >
                    Modifier
                  </Link>
                  <form action={deleteSlot}>
                    <input type="hidden" name="id" value={s.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                    >
                      Supprimer
                    </Button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
