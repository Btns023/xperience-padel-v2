import { createClient } from "@/lib/supabase/server";
import type { Product, PromoCode } from "@/lib/types";
import { NewPromoForm, PromoRow } from "./promo-client";

export const metadata = { title: "Codes promo" };

export default async function CodesPromoPage() {
  const supabase = await createClient();
  const [{ data: promoData, error }, { data: productData }] = await Promise.all([
    supabase.from("promo_codes").select("*").order("code"),
    supabase.from("products").select("*").order("position"),
  ]);
  const promos = (promoData ?? []) as PromoCode[];
  const products = (productData ?? []) as Product[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Codes promo</h1>
        <p className="text-muted-foreground">
          Remise à montant fixe. Le client saisit le code à l&apos;inscription ;
          il est appliqué automatiquement à la facturation. Sans limite
          d&apos;usage ni d&apos;expiration.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">Erreur : {error.message}</p>
      ) : null}

      <div className="flex flex-col gap-4">
        {promos.map((p) => (
          <PromoRow key={`${p.id}:${p.updated_at}`} promo={p} products={products} />
        ))}
      </div>

      <NewPromoForm products={products} />
    </div>
  );
}
