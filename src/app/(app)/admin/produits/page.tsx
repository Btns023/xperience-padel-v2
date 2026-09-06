import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatEuros } from "@/lib/format";
import {
  PRICING_MODEL_LABEL,
  PRODUCT_CATEGORY_LABEL,
  type PriceTier,
  type Product,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Produits & tarifs" };

export default async function ProduitsPage() {
  const supabase = await createClient();
  const [{ data: productsData }, { data: tiersData }] = await Promise.all([
    supabase.from("products").select("*").order("position"),
    supabase.from("price_tiers").select("*").eq("active", true),
  ]);

  const products = (productsData ?? []) as Product[];
  const tiers = (tiersData ?? []) as PriceTier[];
  const tiersByProduct = new Map<string, PriceTier[]>();
  for (const t of tiers) {
    const list = tiersByProduct.get(t.product_id) ?? [];
    list.push(t);
    tiersByProduct.set(t.product_id, list);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Produits &amp; tarifs</h1>
        <p className="text-muted-foreground">
          Formules proposées et grille tarifaire, pré-remplies d&apos;après le
          site actuel.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {products.map((p) => {
          const pt = (tiersByProduct.get(p.id) ?? []).sort(
            (a, b) => a.position - b.position,
          );
          return (
            <Link
              key={p.id}
              href={`/admin/produits/${p.id}`}
              className="rounded-lg border p-4 transition-colors hover:border-foreground/20"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{p.name}</span>
                <Badge variant="secondary">
                  {PRODUCT_CATEGORY_LABEL[p.category]}
                </Badge>
                {!p.active ? <Badge>Inactif</Badge> : null}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {PRICING_MODEL_LABEL[p.pricing_model]}
                {p.default_session_count
                  ? ` · ${p.default_session_count} séances`
                  : ""}
                {` · ${p.default_session_minutes} min`}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                {pt.map((t) => (
                  <span key={t.id} className="text-muted-foreground">
                    {t.label} —{" "}
                    <span className="font-medium text-foreground tabular-nums">
                      {formatEuros(t.amount_cents)}
                    </span>
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
