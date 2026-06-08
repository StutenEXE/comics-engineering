import { forwardRef, useEffect, useImperativeHandle } from "react";
import { useTranslation } from "~/i18n/i18n";
import { getContributionName, type Contribution } from "~/models/contribution";
import { createError, type Error } from "~/utils/error";
import { GenericTable, type ColumnDef } from "./GenericTable";
import { ContributionStatusBadge } from "../badges/ContributionStatusBadge";
import { createColumnHelper } from "@tanstack/react-table";
import { useContributionBySubmitterIdQuery } from "~/store/services/api";
import { useAppSelector } from "~/store/hooks";

export interface ContributionTableHandle {
  refetch: () => void;
}

interface ContributionTableProps {
  className?: string;
  onRefetch?: (refetch: () => void) => void;
}

export const ContributionTable = forwardRef<
  ContributionTableHandle,
  ContributionTableProps
>(function ContributionTable({ className, onRefetch }, ref) {
  const { t, locale } = useTranslation();
  const { user } = useAppSelector((state) => state.user);

  // Fetch contributions
  const { data, isLoading, error, refetch } = useContributionBySubmitterIdQuery(
    user ? { id: user.id } : { id: 0 },
    { skip: !user }, // Doesn't execute if user is undefined
  );
  const err = createError(error);
  const contributions = data?.contributions;

  const triggerRefetch = () => refetch?.();

  useImperativeHandle(ref, () => ({ refetch: triggerRefetch }), [triggerRefetch]);

  useEffect(() => {
    if (!onRefetch) {
      return;
    }
    onRefetch(triggerRefetch);
  }, [onRefetch, triggerRefetch]);

  // Define columns
  const col = createColumnHelper<Contribution>();
  const columns = [
    col.accessor("id", {
      header: t("contribution.id"),
    }),
    col.accessor((row) => t(`contribution.enum.action.${row.action}`), {
      header: t("contribution.action"),
    }),
    col.accessor(
      (row) =>
        t(`contribution.enum.type.${row.entityType}`, { capitalize: true }),
      {
        header: t("contribution.type"),
      },
    ),
    col.accessor((row) => getContributionName(row, locale), {
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
    col.accessor((row) => row.bundle.createdAt.toLocaleDateString(locale), {
      header: t("contribution.date"),
    }),
    col.accessor((row) => t(`contribution.enum.status.${row.status}`), {
      header: t("contribution.status"),
      cell: ({ row }) => (
        <ContributionStatusBadge status={row.original.status} />
      ),
    }),
  ];

  return (
    <GenericTable
      list={
        contributions
          ? [...contributions]?.sort(
              (c1, c2) =>
                c2.bundle.createdAt.getTime() - c1.bundle.createdAt.getTime(),
            )
          : []
      }
      columns={columns}
      isLoading={isLoading}
      emptyMessage={t("contribution.nonefound")}
      error={err}
      className={className}
    />
  );
});
