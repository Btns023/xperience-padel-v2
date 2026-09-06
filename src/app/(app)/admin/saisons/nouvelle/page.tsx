import Link from "next/link";
import { createSeason } from "../actions";
import { SeasonForm } from "../season-form";

export const metadata = { title: "Nouvelle saison" };

export default function NouvelleSaisonPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/saisons"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Saisons
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Nouvelle saison
        </h1>
      </div>
      <SeasonForm action={createSeason} submitLabel="Créer la saison" />
    </div>
  );
}
