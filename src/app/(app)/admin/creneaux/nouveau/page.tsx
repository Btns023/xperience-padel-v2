import Link from "next/link";
import { createSlot } from "../actions";
import { loadSlotFormData } from "../loaders";
import { SlotForm } from "../slot-form";

export const metadata = { title: "Nouveau créneau" };

export default async function NouveauCreneauPage() {
  const data = await loadSlotFormData();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/creneaux"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Créneaux
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Nouveau créneau
        </h1>
      </div>

      {data.seasons.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Crée d&apos;abord une{" "}
          <Link href="/admin/saisons/nouvelle" className="underline">
            saison
          </Link>
          .
        </p>
      ) : (
        <SlotForm
          action={createSlot}
          submitLabel="Créer le créneau"
          {...data}
        />
      )}
    </div>
  );
}
