import { createColumnHelper } from "@tanstack/react-table";
import { BiRevision, BiSolidDislike, BiSolidLike } from "react-icons/bi";
import { useTranslation } from "~/i18n/i18n";
import {
  ContributionBundleStatusEnum,
  type SimpleContributionBundle,
} from "~/models/contributionBundle";
import { useAppSelector } from "~/store/hooks";
import {
  useBundleListQuery,
  useUpdateBundleStatusMutation,
} from "~/store/services/api";
import type { BundleSortField } from "~/store/services/apiModels";
import { createError, translateApiError } from "~/utils/error";
import { BundleStatusBadge } from "../badges/BundleStatusBadge";
import { useToast } from "../toast/Toast";
import { GenericTable } from "./GenericTable";
import { useServerTable } from "./useServerTable";
import { toDDmmYYYY } from "~/utils/date";

interface ContributionBundleTableProps {
  addActions: boolean;
  onContributionClick?: (b: SimpleContributionBundle) => void;
  onSuccesfulStatusUpdate?: (
    b: SimpleContributionBundle,
    newStatus: ContributionBundleStatusEnum,
  ) => void;
  className?: string;
}

export function ContributionBundleTable({
  onContributionClick,
  onSuccesfulStatusUpdate,
  className,
}: ContributionBundleTableProps) {
  const { t, locale } = useTranslation();
  const toast = useToast();
  const { user } = useAppSelector((state) => state.user);

  // Pagination, sorting and filtering are done by the API, newest bundles first
  const { control, request, filters } = useServerTable<BundleSortField>({
    initialSorting: [{ id: "createdAt", desc: true }],
  });

  // Fetch bundles for current page
  const { data, error, isLoading, isFetching, refetch } = useBundleListQuery(
    {
      ...request,
      // Only a full number is a valid ID filter
      id: /^\d+$/.test(filters.id ?? "") ? Number(filters.id) : undefined,
      submitter: filters.submitter,
      note: filters.note,
      status: filters.status,
    },
    { refetchOnMountOrArgChange: true },
  );
  const bundles = data?.items ?? [];

  const [updateStatus] = useUpdateBundleStatusMutation();

  const triggerUpdateStatus = (
    b: SimpleContributionBundle,
    newStatus: ContributionBundleStatusEnum,
  ) => {
    updateStatus({ bundleId: b.id, newStatus }).then((res) => {
      if ("error" in res) {
        toast.error(
          translateApiError(res.error, t, "cbundle.toast.statusupdateerror"),
        );
        return;
      }
      toast.success(t("cbundle.toast.statusupdated"));
      refetch();
      onSuccesfulStatusUpdate?.(b, newStatus);
    });
  };

  // Define columns
  const col = createColumnHelper<SimpleContributionBundle>();
  const columns = [
    col.accessor("id", {
      header: t("cbundle.id"),
    }),
    // Column IDs are the API sort fields and filter names
    col.accessor("submitterUsername", {
      id: "submitter",
      header: t("cbundle.submitter"),
      cell: (info) => (
        <span className="hover:underline cursor-pointer">
          {info.getValue()}&nbsp;<span className="font-normal">↗</span>
        </span>
      ),
    }),
    col.accessor("note", {
      header: t("cbundle.note"),
    }),
    col.accessor((row) => toDDmmYYYY(row.createdAt, locale), {
      id: "createdAt",
      header: t("cbundle.date"),
      enableColumnFilter: false,
    }),
    col.accessor("status", {
      id: "status",
      header: t("cbundle.status"),
      cell: ({ row }) => <BundleStatusBadge status={row.original.status} />,
      meta: {
        filterType: "single",
        options: Object.values(ContributionBundleStatusEnum).map((status) => ({
          label: t(`cbundle.enum.status.${status}`),
          value: status,
        })),
        placeholder: t("cbundle.status.select"),
      },
    }),
    col.accessor(
      (row) =>
        `${t("cbundle.action.seeContributions")} (${row.nContributions})`,
      {
        id: "nContributions",
        header: t("cbundle.contributions"),
        cell: (info) => (
          <span
            className="hover:underline cursor-pointer"
            onClick={() => onContributionClick?.(info.row.original)}
          >
            {info.getValue()}
          </span>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      },
    ),
    col.display({
      id: "actions",
      cell: ({ row }) => {
        const b = row.original;
        // If is not the author of the bundle and if is not an admin, show no actions
        if (user && user?.id !== b.submitterId && !user?.isAdmin) {
          return null;
        }
        return (
          <div className="flex gap-2">
            <BiSolidLike
              size={16}
              onClick={() =>
                triggerUpdateStatus(b, ContributionBundleStatusEnum.APPROVED)
              }
              className="text-green-400/70 cursor-pointer"
            />
            <BiSolidDislike
              size={16}
              onClick={() =>
                triggerUpdateStatus(b, ContributionBundleStatusEnum.REJECTED)
              }
              className="text-red-400/70 cursor-pointer"
            />
            <BiRevision
              size={16}
              onClick={() =>
                triggerUpdateStatus(
                  b,
                  ContributionBundleStatusEnum.NEEDS_REVISION,
                )
              }
              className="text-purple-400/70 cursor-pointer"
            />
          </div>
        );
      },
    }),
  ];

  return (
    <GenericTable
      list={bundles}
      columns={columns}
      isLoading={isLoading}
      isFetching={isFetching}
      emptyMessage={t("cbundle.nonefound")}
      error={createError(error)}
      className={className}
      server={{ ...control, rowCount: data?.total ?? 0 }}
    />
  );
}
