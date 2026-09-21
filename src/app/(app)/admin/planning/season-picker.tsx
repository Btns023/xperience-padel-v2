"use client";

import { useRouter } from "next/navigation";

/** Choix de la saison affichée dans le planning. */
export function SeasonPicker({
  seasons,
  current,
}: {
  seasons: { id: string; name: string }[];
  current: string | null;
}) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Saison</span>
      <select
        value={current ?? ""}
        onChange={(e) => router.push(`/admin/planning?saison=${e.target.value}`)}
        className="h-9 rounded-md border bg-background px-2 text-sm"
      >
        {seasons.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </label>
  );
}
