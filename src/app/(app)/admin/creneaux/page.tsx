import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatTime, weekdayLabel } from "@/lib/format";
import { SLOT_STATUS_LABEL, type Slot } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
            Chaque créneau appartient à une saison et un produit. Le joueur choisit
            son créneau ; l&apos;étiquette de niveau est visible de tous.
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
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Créneau</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Saison</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Cap.</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {slots.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/creneaux/${s.id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {weekdayLabel(s.weekday)} {formatTime(s.start_time)}
                    </Link>
                    <span className="block text-xs font-normal text-muted-foreground">
                      {s.locations?.name ?? "lieu ?"}
                      {s.coaches
                        ? ` · ${s.coaches.first_name} ${s.coaches.last_name}`
                        : ""}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {s.products?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {s.seasons?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {s.level_note ||
                      [s.min_level_code, s.max_level_code]
                        .filter(Boolean)
                        .join("–") ||
                      "—"}
                  </TableCell>
                  <TableCell className="tabular-nums">{s.capacity}</TableCell>
                  <TableCell>
                    <Badge
                      variant={s.status === "open" ? "default" : "secondary"}
                    >
                      {SLOT_STATUS_LABEL[s.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
