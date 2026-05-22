import { useTranslation } from "~/i18n/i18n";
import { getContributionName, type Contribution } from "~/models/contribution";
import type { Error } from "~/utils/error";
import { GenericTable, type ColumnDef } from "./GenericTable";
import { ContributionStatusBadge } from "../badges/ContributionStatusBadge";

function getContributionColumns(): ColumnDef<Contribution>[] {
  const { t, locale } = useTranslation();
  return [
    {
      key: "id",
      header: t("contribution.id"),
      searchable: true,
      cellRenderer: (c) => c.id,
      getValue: (c) => String(c.id),
    },
    {
      key: "action",
      header: t("contribution.action"),
      searchable: true,
      cellRenderer: (c) => t(`contribution.enum.action.${c.action}`),
      getValue: (c) => c.action,
    },
    {
      key: "type",
      header: t("contribution.type"),
      searchable: true,
      cellRenderer: (c) => t(`contribution.enum.type.${c.entityType}`, { capitalize: true }),
      getValue: (c) => c.entityType,
    },
    {
      key: "item",
      header: t("contribution.item"),
      searchable: true,
      cellRenderer: (c) => {
        const name = getContributionName(c, locale);
        // If the action has a link to something
        if (c.resolvedEntityId || c.entityId) {
          return (
            <a
              href={`${c.entityType}/${c.resolvedEntityId || c.entityId}`}
              className="hover:underline"
            >
              {name} 
              <span className="font-normal"> ↗</span>
            </a>
          );
        }
        return name;
      },
      getValue: (c) => getContributionName(c, locale),
    },
    {
      key: "date",
      header: t("contribution.date"),
      cellRenderer: (c) =>
        c.bundle.createdAt
          ? c.bundle.createdAt.toLocaleDateString(locale)
          : t("generic.uknown"),
    },
    {
      key: "status",
      header: t("contribution.status"),
      searchable: true,
      cellRenderer: (c) => <ContributionStatusBadge status={c.status} />,
      getValue: (c) => c.status,
    },
  ];
}

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
      emptyMessage={t("contribution.nonefound")}
      error={error}
    />
  );
}
