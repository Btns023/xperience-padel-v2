"use client";

import { Button } from "@/components/ui/button";
import { confirmCancellation, dismissCancellation } from "./actions";

export function CancellationActions({
  registrationId,
  slotId,
}: {
  registrationId: string;
  slotId?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <form action={confirmCancellation.bind(null, registrationId, slotId)}>
        <Button type="submit" variant="destructive" size="sm">
          Confirmer l&apos;annulation
        </Button>
      </form>
      <form action={dismissCancellation.bind(null, registrationId, slotId)}>
        <button
          type="submit"
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          Refuser
        </button>
      </form>
    </div>
  );
}
