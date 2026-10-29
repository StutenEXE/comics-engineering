import { useMemo } from "react";
import { useTranslation } from "~/i18n/i18n.js";
import type { Issue } from "~/models/issue.js";
import { diffById } from "~/utils/compare.js";
import { toDDmmYYYY } from "~/utils/date.js";
import {
  BookDiffItem,
  ComparatorSection,
  compareBooksBySerie,
  DiffComparison,
  FieldsComparison,
} from "./ComparatorParts";

/**
 * Two issues : the books collecting them.
 * Everything comes with the issues, no request.
 */
export function IssueComparator({ a, b }: { a: Issue; b: Issue }) {
  const { t, locale } = useTranslation();

  const books = useMemo(
    () => diffById(a.books, b.books, compareBooksBySerie),
    [a, b],
  );

  const date = (d?: string) => (d ? toDDmmYYYY(d, locale) : undefined);

  return (
    <>
      <ComparatorSection title={t("compare.details")}>
        <FieldsComparison
          fields={[
            {
              label: t("issue.serie"),
              a: a.issueSerie?.name,
              b: b.issueSerie?.name,
            },
            { label: t("issue.number"), a: a.number, b: b.number },
            { label: t("issue.story"), a: a.name, b: b.name },
            {
              label: t("issue.coverDate"),
              a: date(a.coverDate),
              b: date(b.coverDate),
            },
            {
              label: t("issue.parutionDate"),
              a: date(a.parutionDate),
              b: date(b.parutionDate),
            },
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
