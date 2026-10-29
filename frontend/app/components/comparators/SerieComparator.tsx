import { useMemo } from "react";
import { useTranslation } from "~/i18n/i18n.js";
import { issueToSimpleIssue, type SimpleIssue } from "~/models/issue.js";
import type { Serie } from "~/models/serie.js";
import { useIssueBySerieIdQuery } from "~/store/services/api.js";
import { diffById } from "~/utils/compare.js";
import { compareIssuesByRelease } from "~/utils/issues.js";
import {
  ComparatorSection,
  DiffComparison,
  FieldsComparison,
  IssueDiffItem,
} from "./ComparatorParts";

/**
 * Two series : the issues collected by their books.
 * One request per serie, both in parallel, and cached : replacing B does not reload A.
 */
export function SerieComparator({ a, b }: { a: Serie; b: Serie }) {
  const { t } = useTranslation();

  const queryA = useIssueBySerieIdQuery({ id: a.id });
  const queryB = useIssueBySerieIdQuery({ id: b.id });
  const isLoading = queryA.isFetching || queryB.isFetching;

  const issuesA = useMemo(
    () => queryA.data?.issues.map(issueToSimpleIssue) ?? [],
    [queryA.data],
  );
  const issuesB = useMemo(
    () => queryB.data?.issues.map(issueToSimpleIssue) ?? [],
    [queryB.data],
  );
  const issues = useMemo(
    () => diffById(issuesA, issuesB, compareIssuesByRelease),
    [issuesA, issuesB],
  );

  const status = (se: Serie) =>
    se.ongoing ? t("generic.ongoing") : t("compare.finished");
  const oneshot = (se: Serie) => (se.oneshot ? t("generic.yes") : t("generic.no"));
  // Unknown while loading
  const issueCount = (list: SimpleIssue[]) =>
    isLoading ? undefined : list.length;
  const issueSerieCount = (list: SimpleIssue[]) =>
    isLoading ? undefined : new Set(list.map((is) => is.issueSerieId)).size;

  return (
    <>
      <ComparatorSection title={t("compare.details")}>
        <FieldsComparison
          fields={[
            { label: t("compare.status"), a: status(a), b: status(b) },
            { label: t("serie.oneshot"), a: oneshot(a), b: oneshot(b) },
            { label: t("serie.nvolumes"), a: a.nvolumes, b: b.nvolumes },
            {
              label: t("serie.books"),
              a: a.books.length,
              b: b.books.length,
            },
            {
              label: t("issues"),
              a: issueCount(issuesA),
              b: issueCount(issuesB),
            },
            {
              label: t("issueseries"),
              a: issueSerieCount(issuesA),
              b: issueSerieCount(issuesB),
            },
          ]}
        />
      </ComparatorSection>
      <ComparatorSection title={t("issues")}>
        <DiffComparison
          entries={issues}
          isLoading={isLoading}
          layout="split"
          renderItem={(issue) => <IssueDiffItem issue={issue} />}
        />
      </ComparatorSection>
    </>
  );
}
