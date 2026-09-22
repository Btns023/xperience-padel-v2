"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { registerAttachment } from "../actions";

const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Dépôt d'une pièce justificative (PDF ou photo). Le fichier part
 * directement du navigateur vers le bucket privé « pieces » (la RLS le
 * réserve à l'académie), puis la pièce est enregistrée côté serveur.
 * Sur téléphone, le sélecteur propose aussi l'appareil photo.
 */
export function PieceUpload({ entryId, year }: { entryId: string; year: number }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    try {
      for (const file of Array.from(files)) {
        if (file.size > MAX_BYTES) {
          throw new Error(`« ${file.name} » dépasse 10 Mo.`);
        }
        const safe = file.name.normalize("NFD").replace(/[^\w.-]+/g, "_");
        const path = `${year}/${entryId}/${crypto.randomUUID()}-${safe}`;
        const { error: upErr } = await supabase.storage
          .from("pieces")
          .upload(path, file, { contentType: file.type || undefined });
        if (upErr) throw new Error(upErr.message);
        const res = await registerAttachment(entryId, {
          path,
          name: file.name,
          type: file.type,
          size: file.size,
        });
        if (res.error) throw new Error(res.error);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Envoi impossible.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-dashed p-5 text-center text-sm transition-colors hover:bg-muted/50">
        <span className="font-medium">
          {busy ? "Envoi en cours…" : "Joindre une pièce justificative"}
        </span>
        <span className="text-xs text-muted-foreground">
          PDF ou photo, 10 Mo maximum — sur téléphone, tu peux photographier le ticket.
        </span>
        <input
          ref={input}
          type="file"
          accept="application/pdf,image/*"
          multiple
          disabled={busy}
          onChange={(e) => onFiles(e.target.files)}
          className="sr-only"
        />
      </label>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
