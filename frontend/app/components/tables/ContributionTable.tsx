import { useTranslation } from "~/i18n/i18n";
import { getContributionName, type Contribution } from "~/models/contribution";
import type { Error } from "~/utils/error";
import { GenericTable, type ColumnDef } from "./GenericTable";
import { ContributionStatusBadge } from "../badges/ContributionStatusBadge";
import { createColumnHelper } from "@tanstack/react-table";

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
  const { t, locale } = useTranslation();

  // Define columns
  const col = createColumnHelper<Contribution>();
  const columns = [
    col.accessor("id", {
      header: t("contribution.id"),
    }),
    col.accessor("action", {
      header: t("contribution.action"),
      cell: (info) => t(`contribution.enum.action.${info.getValue()}`),
    }),
    col.accessor("entityType", {
      header: t("contribution.type"),
      cell: (info) =>
        t(`contribution.enum.type.${info.getValue()}`, { capitalize: true }),
    }),
    col.accessor("proposedData", {
      header: t("contribution.item"),
      cell: (info) => {
        const c = info.row.original;
        const name = getContributionName(c, locale);
        // If the action has a link to something, create a link towards it
        if (c.resolvedEntityId || c.entityId) {
          return (
            <a
              href={`${c.entityType}/${c.resolvedEntityId || c.entityId}`}
              className="hover:underline"
            >
              {name}&nbsp;<span className="font-normal">↗</span>
            </a>
          );
        }
        return name;
      },
    }),
    col.accessor("bundle.createdAt", {
      header: t("contribution.date"),
      cell: (info) => info.getValue().toLocaleDateString(locale),
    }),
    col.accessor("status", {
      header: t("contribution.status"),
      cell: (info) => <ContributionStatusBadge status={info.getValue()} />,
    }),
  ];

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
      columns={columns}
      isLoading={isLoading}
      emptyMessage={t("contribution.nonefound")}
      error={error}
    />
  );
}
