import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { todayInBrussels } from "@/lib/format";
import { loadCategories } from "../../data";
import { EntryForm } from "../entry-form";

export const metadata = { title: "Nouvelle opération" };

export default async function NewEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ sens?: string }>;
}) {
  await requireRole("admin");
  const { sens } = await searchParams;
  const supabase = await createClient();
  const categories = await loadCategories(supabase);
  const direction = sens === "recette" ? "recette" : "depense";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/compta"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Journal
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {direction === "depense" ? "Nouvelle dépense" : "Nouvelle recette"}
        </h1>
        <p className="text-muted-foreground">
          La pièce justificative se joint à l&apos;étape suivante.
        </p>
      </div>
      <EntryForm
        id={null}
        categories={categories}
        values={{
          account: "banque",
          operation_date: todayInBrussels(),
          sens: direction,
          montant: "",
          description: "",
          category_code: "",
          counterparty: "",
          communication: "",
          notes: "",
        }}
      />
    </div>
  );
}
