import {
  getContributionColumns,
  type Contribution,
} from "~/models/contribution";
import { GenericTable } from "./GenericTable";
import type { Error } from "~/utils/error";
import { useTranslation } from "~/i18n/i18n";

interface ContributionTableProps {
  contributionList: Contribution[] | null | undefined;
  isLoading?: boolean;
  error?: Error;
  className?: string;
}

export function ContributionTable({
  contributionList: bundleList,
  isLoading,
  error,
}: ContributionTableProps) {
  const { t } = useTranslation();
  return (
    <GenericTable
      list={bundleList}
      columns={getContributionColumns()}
      isLoading={isLoading}
      emptyMessage={t("contribution.table.empty")}
      error={error}
    />
  );
}
