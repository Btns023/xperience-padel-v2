import { createClient } from "@/lib/supabase/server";
import type {
  Coach,
  Location,
  PadelLevel,
  Product,
  Season,
} from "@/lib/types";

/** Charge les référentiels nécessaires au formulaire de créneau. */
export async function loadSlotFormData() {
  const supabase = await createClient();
  const [seasons, products, locations, coaches, levels] = await Promise.all([
    supabase.from("seasons").select("*").order("starts_on", { ascending: false }),
    supabase.from("products").select("*").eq("active", true).order("position"),
    supabase.from("locations").select("*").eq("active", true).order("name"),
    supabase.from("coaches").select("*").eq("active", true).order("last_name"),
    supabase.from("padel_levels").select("*").order("rank"),
  ]);

  return {
    seasons: (seasons.data ?? []) as Season[],
    products: (products.data ?? []) as Product[],
    locations: (locations.data ?? []) as Location[],
    coaches: (coaches.data ?? []) as Coach[],
    levels: (levels.data ?? []) as PadelLevel[],
  };
}
