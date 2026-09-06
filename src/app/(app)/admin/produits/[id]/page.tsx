import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  PRICING_MODEL_LABEL,
  PRODUCT_CATEGORY_LABEL,
  type PriceTier,
  type Product,
} from "@/lib/types";
import { ProductForm, TierList } from "../product-editor";

export const metadata = { title: "Produit" };

export default async function ProduitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: productData }, { data: tiersData }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("price_tiers").select("*").eq("product_id", id).order("position"),
  ]);

  if (!productData) notFound();
  const product = productData as Product;
  const tiers = (tiersData ?? []) as PriceTier[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/produits"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Produits &amp; tarifs
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {product.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {PRODUCT_CATEGORY_LABEL[product.category]} ·{" "}
          {PRICING_MODEL_LABEL[product.pricing_model]}
        </p>
      </div>

      <ProductForm product={product} />
      <TierList product={product} tiers={tiers} />
    </div>
  );
}
