import { useMemo } from "react";
import { useTranslation } from "~/i18n/i18n.js";
import { issueToSimpleIssue, type SimpleIssue } from "~/models/issue.js";
import { useIssueBySerieIdQuery } from "~/store/services/api.js";
import { diffById } from "~/utils/compare.js";
import { compareIssuesByRelease, formatIssueRanges } from "~/utils/issues.js";
import type { Comparable } from "./Comparator";
import {
  ComparatorSection,
  DiffComparison,
  FieldsComparison,
  IssueDiffItem,
} from "./ComparatorParts";

/**
 * Issues of any item : a book's, a serie's books', an issue serie's, or the issue itself.
 * Only a serie needs a request (cached, so replacing the other item does not reload it).
 */
export function useComparableIssues(item: Comparable): {
  issues: SimpleIssue[];
  isLoading: boolean;
} {
  const serieQuery = useIssueBySerieIdQuery(
    { id: item.data.id },
    { skip: item.type !== "serie" },
  );

  const issues = useMemo(() => {
    switch (item.type) {
      case "book":
      case "issueserie":
        return item.data.issues;
      case "issue":
        return [issueToSimpleIssue(item.data)];
      case "serie":
        return serieQuery.data?.issues.map(issueToSimpleIssue) ?? [];
    }
  }, [item, serieQuery.data]);

  return {
    issues,
    isLoading: item.type === "serie" && serieQuery.isFetching,
  };
}

/**
 * Two items of any types : the issues they contain
 */
export function IssueContentComparator({
  a,
  b,
}: {
  a: Comparable;
  b: Comparable;
}) {
  const { t } = useTranslation();

  const issuesA = useComparableIssues(a);
  const issuesB = useComparableIssues(b);
  const isLoading = issuesA.isLoading || issuesB.isLoading;

  const issues = useMemo(
    () => diffById(issuesA.issues, issuesB.issues, compareIssuesByRelease),
    [issuesA.issues, issuesB.issues],
  );

  // Unknown while loading
  const count = (list: SimpleIssue[]) => (isLoading ? undefined : list.length);
  const content = (list: SimpleIssue[]) =>
    isLoading ? undefined : formatIssueRanges([...list].sort(compareIssuesByRelease));

  return (
    <>
      <ComparatorSection title={t("compare.details")}>
        <FieldsComparison
          fields={[
            {
              label: t("issues"),
              a: count(issuesA.issues),
              b: count(issuesB.issues),
            },
            {
              label: t("compare.content"),
              a: content(issuesA.issues),
              b: content(issuesB.issues),
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
