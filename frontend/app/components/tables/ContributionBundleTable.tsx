import { createColumnHelper } from "@tanstack/react-table";
import { BiRevision, BiSolidDislike, BiSolidLike } from "react-icons/bi";
import { useTranslation } from "~/i18n/i18n";
import {
  ContributionBundleStatusEnum,
  type SimpleContributionBundle,
} from "~/models/contributionBundle";
import { useAppSelector } from "~/store/hooks";
import { useUpdateBundleStatusMutation } from "~/store/services/api";
import { type Error } from "~/utils/error";
import { BundleStatusBadge } from "../badges/BundleStatusBadge";
import { useToast } from "../toast/Toast";
import { GenericTable } from "./GenericTable";

interface ContributionBundleTableProps {
  bundleList: SimpleContributionBundle[] | null | undefined;
  addActions: boolean;
  onContributionClick?: (b: SimpleContributionBundle) => void;
  onPageChange?: (page: number) => void;
  onSuccesfulStatusUpdate?: (
    b: SimpleContributionBundle,
    newStatus: ContributionBundleStatusEnum,
  ) => void;
  isLoading?: boolean;
  error?: Error;
  className?: string;
}

export function ContributionBundleTable({
  bundleList,
  onContributionClick,
  onSuccesfulStatusUpdate,
  isLoading,
  error,
}: ContributionBundleTableProps) {
  const { t, locale } = useTranslation();
  const toast = useToast();
  const { user } = useAppSelector((state) => state.user);

  const [updateStatus] = useUpdateBundleStatusMutation();

  const triggerUpdateStatus = (
    b: SimpleContributionBundle,
    newStatus: ContributionBundleStatusEnum,
  ) => {
    updateStatus({ bundleId: b.id, newStatus }).then((res) => {
      if ("error" in res) {
        toast.error(t("cbundle.toast.statusupdateerror"));
        return;
      }
      toast.success(t("cbundle.toast.statusupdated"));
      onSuccesfulStatusUpdate?.(b, newStatus);
    });
  };

  // Define columns
  const col = createColumnHelper<SimpleContributionBundle>();
  const columns = [
    col.accessor("id", {
      header: t("cbundle.id"),
    }),
    col.accessor("submitterUsername", {
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
    col.accessor((row) => row.createdAt.toLocaleDateString(locale), {
      header: t("cbundle.date"),
      enableColumnFilter: false,
    }),
    col.accessor((row) => t(`cbundle.enum.status.${row.status}`), {
      header: t("cbundle.status"),
      cell: ({ row }) => <BundleStatusBadge status={row.original.status} />,
      meta: {
        filterType: "single",
        options: Object.values(ContributionBundleStatusEnum).map((status) =>
          t(`cbundle.enum.status.${status}`),
        ),
        placeholder: t("cbundle.status.select"),
      },
    }),
    col.accessor(
      (row) =>
        `${t("cbundle.action.seeContributions")} (${row.nContributions})`,
      {
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
      list={
        bundleList
          ? [...bundleList]?.sort(
              (b1, b2) => b2.createdAt.getTime() - b1.createdAt.getTime(),
            )
          : []
      }
      columns={columns}
      isLoading={isLoading}
      emptyMessage={t("cbundle.nonefound")}
      error={error}
    />
  );
}
