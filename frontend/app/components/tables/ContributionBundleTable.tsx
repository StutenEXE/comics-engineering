import { BiRevision, BiSolidDislike, BiSolidLike } from "react-icons/bi";
import { useTranslation } from "~/i18n/i18n";
import {
  ContributionBundleStatusEnum,
  type ContributionBundle,
} from "~/models/contributionBundle";
import { useAppSelector } from "~/store/hooks";
import { useUpdateBundleStatusMutation } from "~/store/services/api";
import { type Error } from "~/utils/error";
import { deepCopy } from "~/utils/object";
import { BundleStatusBadge } from "../badges/BundleStatusBadge";
import { useToast } from "../toast/Toast";
import { GenericTable, type ColumnDef } from "./GenericTable";
import type { SimpleContribution } from "~/models/contribution";
import { createColumnHelper } from "@tanstack/react-table";

interface ContributionBundleTableProps {
  bundleList: ContributionBundle[] | null | undefined;
  addActions: boolean;
  onContributionClick?: (b: ContributionBundle) => void;
  onPageChange?: (page: number) => void;
  onSuccesfulStatusUpdate?: (
    b: ContributionBundle,
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
    b: ContributionBundle,
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
  const col = createColumnHelper<ContributionBundle>();
  const columns = [
    col.accessor("id", {
      header: t("cbundle.id"),
    }),
    col.accessor("submitter.username", {
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
    col.accessor("createdAt", {
      header: t("cbundle.date"),
      cell: (info) => info.getValue().toLocaleDateString(locale),
    }),
    col.accessor("status", {
      header: t("cbundle.status"),
      cell: (info) => <BundleStatusBadge status={info.getValue()} />,
    }),
    col.accessor("contributions", {
      header: t("cbundle.contributions"),
      cell: (info) => (
        <span
          className="hover:underline cursor-pointer"
          onClick={() => onContributionClick?.(info.row.original)}
        >
          {t("cbundle.action.seeContributions")} ({info.getValue().length})
        </span>
      ),
    }),
    col.display({
      id: "actions",
      cell: ({ row }) => {
        const b = row.original;
        // If is not the author of the bundle and if is not an admin, show no actions
        if (user && user?.id !== b.submitter?.id && !user?.isAdmin) {
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
