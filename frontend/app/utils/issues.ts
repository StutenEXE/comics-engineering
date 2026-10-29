interface ReleasedIssue {
  id: number;
  number: number;
  parutionDate?: string | null;
}

/**
 * Release order : by release date (undated issues last), then by number for a same date,
 * then by id so that the order is always the same
 */
export function compareIssuesByRelease(
  a: ReleasedIssue,
  b: ReleasedIssue,
): number {
  if (a.parutionDate !== b.parutionDate) {
    if (!a.parutionDate) return 1;
    if (!b.parutionDate) return -1;
    // ISO dates (YYYY-MM-DD) : the text order is the chronological one
    return a.parutionDate < b.parutionDate ? -1 : 1;
  }
  return (a.number ?? 0) - (b.number ?? 0) || a.id - b.id;
}

export interface NumberRange {
  start: number;
  end: number;
}

/**
 * Groups issue numbers into ranges of consecutive numbers (duplicates, ex : variants, are merged).
 * Precise : [1, 2, 3, 5] gives 1-3 and 5, a missing number always splits a range.
 */
export function toNumberRanges(numbers: number[]): NumberRange[] {
  const sorted = [...new Set(numbers.filter((n) => n != null))].sort(
    (a, b) => a - b,
  );
  const ranges: NumberRange[] = [];
  for (const n of sorted) {
    const last = ranges[ranges.length - 1];
    if (last && n === last.end + 1) {
      last.end = n;
    } else {
      ranges.push({ start: n, end: n });
    }
  }
  return ranges;
}

interface FormatRangesOptions {
  // Between two ranges of the same issue serie
  rangeSeparator?: string;
}

/**
 * Condensed issue numbers, ex : [1, 2, 3, 4, 5, 8, 9, 10] -> "#1–5 + #8–10"
 */
export function formatNumberRanges(
  numbers: number[],
  { rangeSeparator = " + " }: FormatRangesOptions = {},
): string {
  return toNumberRanges(numbers)
    .map((r) => (r.start === r.end ? `#${r.start}` : `#${r.start}–${r.end}`))
    .join(rangeSeparator);
}

interface RangeIssue {
  number: number;
  issueSerieName?: string;
}

interface FormatIssueRangesOptions extends FormatRangesOptions {
  // Between two issue series
  serieSeparator?: string;
  // False when the issue serie is obvious from the context (ex : on its page)
  showSerieName?: boolean;
}

/**
 * Condensed issues, grouped by issue serie (in order of first appearance),
 * ex : "Batman #1–5 + #8–10 · Nightwing #1"
 */
export function formatIssueRanges(
  issues: RangeIssue[],
  {
    serieSeparator = " · ",
    showSerieName = true,
    ...options
  }: FormatIssueRangesOptions = {},
): string {
  const numbersBySerie = new Map<string, number[]>();
  for (const issue of issues) {
    const serie = showSerieName ? (issue.issueSerieName ?? "") : "";
    numbersBySerie.set(serie, [
      ...(numbersBySerie.get(serie) ?? []),
      issue.number,
    ]);
  }
  return [...numbersBySerie.entries()]
    .map(([serie, numbers]) =>
      [serie, formatNumberRanges(numbers, options)].filter(Boolean).join(" "),
    )
    .join(serieSeparator);
}
