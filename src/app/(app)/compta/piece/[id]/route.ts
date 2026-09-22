import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Ouvre une pièce justificative : lien signé valable une minute vers le
 * bucket privé. La RLS limite la lecture à l'académie et au comptable.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: att } = await supabase
    .from("ledger_attachments")
    .select("storage_path, file_name")
    .eq("id", id)
    .single();
  if (!att) return new NextResponse("Pièce introuvable", { status: 404 });

  const { data, error } = await supabase.storage
    .from("pieces")
    .createSignedUrl(att.storage_path, 60);
  if (error || !data) {
    return new NextResponse("Pièce indisponible", { status: 404 });
  }
  return NextResponse.redirect(data.signedUrl);
}
