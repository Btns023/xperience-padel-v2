import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { SEASON_STATUS_LABEL, type Season } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteSeason } from "./actions";

export const metadata = { title: "Saisons" };

export default async function SaisonsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .order("starts_on", { ascending: false });

  const seasons = (data ?? []) as Season[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Saisons</h1>
          <p className="text-muted-foreground">
            Une saison regroupe les créneaux et les inscriptions d&apos;une période.
          </p>
        </div>
        <Button render={<Link href="/admin/saisons/nouvelle" />}>Nouvelle saison</Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive">
          Erreur de chargement : {error.message}
        </p>
      ) : seasons.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucune saison. Crée la première pour commencer.
        </p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Inscriptions</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {seasons.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/saisons/${s.id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {s.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(s.starts_on)} → {formatDate(s.ends_on)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {s.registration_opens_on || s.registration_closes_on
                      ? `${formatDate(s.registration_opens_on)} → ${formatDate(
                          s.registration_closes_on,
                        )}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={s.status === "active" ? "default" : "secondary"}
                    >
                      {SEASON_STATUS_LABEL[s.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <form action={deleteSeason}>
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
