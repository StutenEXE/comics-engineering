// Where an item of a comparison is : in both compared items, or only in one of them
export type DiffSide = "common" | "onlyA" | "onlyB";

export interface DiffEntry<T> {
  key: number;
  item: T;
  side: DiffSide;
}

export type DiffCounts = Record<DiffSide, number>;

/**
 * Merges the items of A and B (matched by id) into one list, each item tagged with the side(s) having it
 * @param sort order of the merged list (input order of A then B if omitted)
 */
export function diffById<T extends { id: number }>(
  itemsA: T[],
  itemsB: T[],
  sort?: (a: T, b: T) => number,
): DiffEntry<T>[] {
  const idsA = new Set(itemsA.map((it) => it.id));
  const idsB = new Set(itemsB.map((it) => it.id));

  // One occurrence per id, even if a side lists an item twice
  const merged = new Map<number, T>();
  for (const it of [...itemsA, ...itemsB]) {
    if (!merged.has(it.id)) merged.set(it.id, it);
  }

  const items = [...merged.values()];
  if (sort) items.sort(sort);

  return items.map((item) => ({
    key: item.id,
    item,
    side: !idsB.has(item.id) ? "onlyA" : !idsA.has(item.id) ? "onlyB" : "common",
  }));
}

export function countDiff(entries: DiffEntry<unknown>[]): DiffCounts {
  const counts: DiffCounts = { common: 0, onlyA: 0, onlyB: 0 };
  entries.forEach((entry) => counts[entry.side]++);
  return counts;
}

/**
 * Share of the items present on both sides, in [0, 1] (0 when there is no item)
 */
export function overlapRatio(counts: DiffCounts): number {
  const total = counts.common + counts.onlyA + counts.onlyB;
  return total === 0 ? 0 : counts.common / total;
}
