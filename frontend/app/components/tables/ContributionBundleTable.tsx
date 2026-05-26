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

function getBundleColumns(
  onContibutionClick?: (b: ContributionBundle) => void,
): ColumnDef<ContributionBundle>[] {
  const { t, locale } = useTranslation();

  return [
    {
      key: "id",
      header: t("cbundle.id"),
      searchable: true,
      cellRenderer: (b) => b.id,
      getValue: (b) => String(b.id),
    },
    {
      key: "submitter",
      header: t("cbundle.submitter"),
      searchable: true,
      cellRenderer: (b) => (
        <span className="hover:underline cursor-pointer">
          {b.submitter?.username} <span className="font-normal">↗</span>
        </span>
      ),
      getValue: (b) => b.submitter?.username || "",
    },
    {
      key: "note",
      header: t("cbundle.note"),
      searchable: true,
      cellRenderer: (b) => b.note,
      getValue: (b) => b.note,
    },
    {
      key: "date",
      header: t("cbundle.date"),
      cellRenderer: (b) =>
        b.createdAt
          ? b.createdAt.toLocaleDateString(locale)
          : t("generic.uknown"),
    },
    {
      key: "status",
      header: t("cbundle.status"),
      searchable: true,
      cellRenderer: (b) => <BundleStatusBadge status={b.status} />,
      getValue: (b) => b.status,
    },
    {
      key: "contributions",
      header: t("cbundle.contributions"),
      cellRenderer: (b) => (
        <span
          className="hover:underline cursor-pointer"
          onClick={() => onContibutionClick?.(b)}
        >
          {t("cbundle.action.seeContributions")} ({b.contributions.length})
        </span>
      ),
    },
  ];
}

interface ContributionBundleTableProps {
  bundleList: ContributionBundle[] | null | undefined;
  addActions: boolean;
  onContributionClick?: (b: ContributionBundle) => void;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  error?: Error;
  className?: string;
}

export function ContributionBundleTable({
  bundleList,
  onContributionClick,
  onPageChange,
  isLoading,
  error,
}: ContributionBundleTableProps) {
  const { t } = useTranslation();
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
      // b.status = newStatus;
    });
  };

  const actionGenerator = (b: ContributionBundle) => {
    // If is not the author of the bundle and if is not an admin, show no actions
    if (user && user?.id !== b.submitter?.id && !user?.isAdmin) {
      return <></>;
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
            triggerUpdateStatus(b, ContributionBundleStatusEnum.NEEDS_REVISION)
          }
          className="text-purple-400/70 cursor-pointer"
        />
      </div>
    );
  };

  return (
    <GenericTable
      list={
        bundleList
          ? [...bundleList]?.sort(
              (b1, b2) => b2.createdAt.getTime() - b1.createdAt.getTime(),
            )
          : []
      }
      columns={getBundleColumns(onContributionClick)}
      addActions={true}
      actionGenerator={actionGenerator}
      onPageChange={onPageChange}
      isLoading={isLoading}
      emptyMessage={t("cbundle.nonefound")}
      error={error}
    />
  );
}
