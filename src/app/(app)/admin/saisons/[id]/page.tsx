import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Season } from "@/lib/types";
import { updateSeason, type FormState } from "../actions";
import { SeasonForm } from "../season-form";

export const metadata = { title: "Modifier une saison" };

export default async function EditSaisonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("seasons").select("*").eq("id", id).single();
  if (!data) notFound();
  const season = data as Season;

  const action = updateSeason.bind(null, id) as (
    prev: FormState,
    formData: FormData,
  ) => Promise<FormState>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/saisons"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Saisons
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{season.name}</h1>
      </div>
      <SeasonForm action={action} season={season} submitLabel="Enregistrer" />
    </div>
  );
}
