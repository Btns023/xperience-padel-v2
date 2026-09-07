"use client";

import { deletePlayer } from "./actions";

export function DeletePlayerButton({ id }: { id: string }) {
  return (
    <form action={deletePlayer.bind(null, id)}>
      <button
        type="submit"
        className="text-sm text-destructive underline-offset-4 hover:underline"
      >
        Supprimer
      </button>
    </form>
  );
}
