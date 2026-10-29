import { useMemo } from "react";
import { useTranslation } from "~/i18n/i18n.js";
import type { Book } from "~/models/book.js";
import { diffById } from "~/utils/compare.js";
import { compareIssuesByRelease, formatIssueRanges } from "~/utils/issues.js";
import {
  ComparatorSection,
  DiffComparison,
  FieldsComparison,
  IssueDiffItem,
} from "./ComparatorParts";

/**
 * Two books : the issues they collect.
 * Everything comes with the books, no request.
 */
export function BookComparator({ a, b }: { a: Book; b: Book }) {
  const { t } = useTranslation();

  const issues = useMemo(
    () => diffById(a.issues, b.issues, compareIssuesByRelease),
    [a, b],
  );

  const volume = (bk: Book) =>
    bk.serie?.oneshot ? t("serie.oneshot") : bk.number;
  const content = (bk: Book) =>
    formatIssueRanges([...bk.issues].sort(compareIssuesByRelease));
  const publishers = (bk: Book) =>
    [...new Set(bk.editions.map((ed) => ed.publisherName).filter(Boolean))]
      .sort()
      .join(", ");

  return (
    <>
      <ComparatorSection title={t("compare.details")}>
        <FieldsComparison
          fields={[
            { label: t("book.serie"), a: a.serie?.name, b: b.serie?.name },
            { label: t("book.number"), a: volume(a), b: volume(b) },
            { label: t("book.voContent"), a: a.voContent, b: b.voContent },
            { label: t("compare.content"), a: content(a), b: content(b) },
            {
              label: t("book.issues"),
              a: a.issues.length,
              b: b.issues.length,
            },
            {
              label: t("book.editions"),
              a: a.editions.length,
              b: b.editions.length,
            },
            {
              label: t("compare.publishers"),
              a: publishers(a),
              b: publishers(b),
            },
          ]}
        />
      </ComparatorSection>
      <ComparatorSection title={t("book.issues")}>
        <DiffComparison
          entries={issues}
          layout="split"
          renderItem={(issue) => <IssueDiffItem issue={issue} />}
        />
      </ComparatorSection>
    </>
  );
}
