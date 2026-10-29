import { useMemo } from "react";
import { useTranslation } from "~/i18n/i18n.js";
import type { IssueSerie } from "~/models/issue-serie.js";
import { diffById } from "~/utils/compare.js";
import { toDDmmYYYY } from "~/utils/date.js";
import { formatNumberRanges } from "~/utils/issues.js";
import {
  BookDiffItem,
  ComparatorSection,
  compareBooksBySerie,
  DiffComparison,
  FieldsComparison,
} from "./ComparatorParts";

/**
 * Two issue series : the books collecting them (two issue series never share issues).
 * Everything comes with the issue series, no request.
 */
export function IssueSerieComparator({
  a,
  b,
}: {
  a: IssueSerie;
  b: IssueSerie;
}) {
  const { t, locale } = useTranslation();

  const books = useMemo(
    () => diffById(a.books, b.books, compareBooksBySerie),
    [a, b],
  );

  const date = (d?: string) => (d ? toDDmmYYYY(d, locale) : undefined);
  const endDate = (iss: IssueSerie) =>
    date(iss.endDate) ?? t("generic.present");
  const numbers = (iss: IssueSerie) =>
    formatNumberRanges(iss.issues.map((is) => is.number));

  return (
    <>
      <ComparatorSection title={t("compare.details")}>
        <FieldsComparison
          fields={[
            {
              label: t("issueserie.startDate"),
              a: date(a.startDate),
              b: date(b.startDate),
            },
            { label: t("issueserie.endDate"), a: endDate(a), b: endDate(b) },
            {
              label: t("issueserie.issues"),
              a: a.issues.length,
              b: b.issues.length,
            },
            { label: t("compare.numbers"), a: numbers(a), b: numbers(b) },
            { label: t("books"), a: a.books.length, b: b.books.length },
          ]}
        />
      </ComparatorSection>
      <ComparatorSection title={t("compare.collectedIn")}>
        <DiffComparison
          entries={books}
          renderItem={(book) => <BookDiffItem book={book} />}
        />
      </ComparatorSection>
    </>
  );
}
