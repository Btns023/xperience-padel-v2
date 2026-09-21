/**
 * Placement des blocs d'une journée de planning.
 *
 * Deux cours qui se chevauchent (deux terrains à la même heure) sont
 * répartis côte à côte, comme dans un agenda : chacun prend une « voie ».
 */

export type TimedSlot = { id: string; start: number; duration: number };

export type PlacedSlot = TimedSlot & {
  /** Position horizontale, en pourcentage de la largeur du jour. */
  left: number;
  width: number;
};

export function assignLanes(slots: TimedSlot[]): PlacedSlot[] {
  const sorted = [...slots].sort(
    (a, b) => a.start - b.start || a.duration - b.duration,
  );

  // Groupes de cours qui se chevauchent de proche en proche : la largeur se
  // partage à l'intérieur d'un groupe, pas sur toute la journée.
  const placed: PlacedSlot[] = [];
  let group: TimedSlot[] = [];
  let groupEnd = -1;

  const flush = () => {
    if (group.length === 0) return;
    const laneEnds: number[] = [];
    const lanes = new Map<string, number>();
    for (const s of group) {
      let lane = laneEnds.findIndex((end) => end <= s.start);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(0);
      }
      laneEnds[lane] = s.start + s.duration;
      lanes.set(s.id, lane);
    }
    const width = 100 / laneEnds.length;
    for (const s of group) {
      placed.push({ ...s, left: (lanes.get(s.id) ?? 0) * width, width });
    }
    group = [];
    groupEnd = -1;
  };

  for (const s of sorted) {
    if (group.length > 0 && s.start >= groupEnd) flush();
    group.push(s);
    groupEnd = Math.max(groupEnd, s.start + s.duration);
  }
  flush();

  return placed;
}
