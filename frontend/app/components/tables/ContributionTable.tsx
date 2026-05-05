import { useTranslation } from "~/i18n/i18n";
import {
  getContributionColumns,
  type Contribution,
} from "~/models/contribution";
import type { Error } from "~/utils/error";
import { GenericTable } from "./GenericTable";

interface ContributionTableProps {
  contributionList: Contribution[] | null | undefined;
  isLoading?: boolean;
  error?: Error;
  className?: string;
}

export function ContributionTable({
  contributionList,
  isLoading,
  error,
}: ContributionTableProps) {
  const { t } = useTranslation();
  return (
    <GenericTable
      list={
        contributionList
          ? [...contributionList]?.sort(
              (c1, c2) =>
                c2.bundle.createdAt.getTime() - c1.bundle.createdAt.getTime(),
            )
          : []
      }
      columns={getContributionColumns()}
      isLoading={isLoading}
      emptyMessage={t("contribution.table.empty")}
      error={error}
    />
  );
}
