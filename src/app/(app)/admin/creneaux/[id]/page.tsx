import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Slot } from "@/lib/types";
import { updateSlot, type FormState } from "../actions";
import { loadSlotFormData } from "../loaders";
import { SlotForm } from "../slot-form";

export const metadata = { title: "Modifier un créneau" };

export default async function EditCreneauPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("slots").select("*").eq("id", id).single();
  if (!data) notFound();
  const slot = data as Slot;

  const formData = await loadSlotFormData();
  const action = updateSlot.bind(null, id) as (
    prev: FormState,
    fd: FormData,
  ) => Promise<FormState>;

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
          Modifier le créneau
        </h1>
      </div>
      <SlotForm
        action={action}
        slot={slot}
        submitLabel="Enregistrer"
        {...formData}
      />
    </div>
  );
}
