import {
  BiRevision,
  BiSkipNextCircle,
  BiSolidDislike,
  BiSolidLike,
} from "react-icons/bi";
import { MdAdd, MdDelete, MdModeEdit } from "react-icons/md";
import { PiArrowElbowDownRightBold } from "react-icons/pi";
import { ContributionStatusBadge } from "~/components/badges/ContributionStatusBadge";
import { useConfirm } from "~/components/modals/ConfirmModalProvider";
import { useToast } from "~/components/toast/Toast";
import { useTranslation } from "~/i18n/i18n";
import {
  ContributionStatusEnum,
  contributionToSimpleContribution,
  ContributionTypeEnum,
  getContributionName,
  isSimpleContribution,
  type Contribution,
  type ContributionTree,
  type SimpleContribution,
} from "~/models/contribution";
import { useUpdateContributionStatusMutation } from "~/store/services/api";
import { type Error } from "~/utils/error";
import { GenericList } from "../GenericList";

interface ContributionTreeListProps {
  contributionList: Contribution[] | SimpleContribution[] | null | undefined;
  buttons?: {
    add: boolean;
    edit: boolean;
    delete: boolean;
  };
  onAdd?: (c: ContributionTree) => void;
  onEdit?: (c: ContributionTree) => void;
  onRemove?: (c: ContributionTree) => void;
  adminActions?: boolean;
  isLoading?: boolean;
  error?: Error;
  className?: string;
}

export function IndentedContributionList({
  contributionList,
  buttons,
  onAdd,
  onEdit,
  onRemove,
  adminActions,
  isLoading,
  error,
  className,
}: ContributionTreeListProps) {
  const { t, locale } = useTranslation();
  const toast = useToast();
  const confirm = useConfirm();

  const [updateStatus] = useUpdateContributionStatusMutation();

  const triggerUpdateStatus = (
    c: ContributionTree,
    newStatus: ContributionStatusEnum,
  ) => {
    confirm({
      title: t("contribution.confirmstatuschange"),
      message: t(`contribution.confirmstatuschangemessage.${newStatus}`),
      onConfirm: () => {
        updateStatus({ contributionId: c.id, newStatus: newStatus }).then(
          (res) => {
            if ("error" in res) {
              toast.error(t("contribution.statusupdaterror"));
              return;
            }
            toast.success(t("contribution.statusupdated"));
            c.status = newStatus;
          },
        );
      },
    });
  };

  onAdd ||= (c: ContributionTree) => {};
  onEdit ||= (c: ContributionTree) => {};
  onRemove ||= (c: ContributionTree) => {};

  const findKeyForEntityType = (
    t: ContributionTypeEnum,
  ): string | undefined => {
    switch (t) {
      case ContributionTypeEnum.BOOK:
        return "book";
      case ContributionTypeEnum.SERIE:
        return "serie";
      case ContributionTypeEnum.ISSUE_SERIE:
        return "issueSerie";
    }
    return undefined;
  };

  const mapper = (c: ContributionTree, indent: number) => (
    <div key={c.id} className="pb-1">
      <div className="flex items-center gap-1 group">
        {/* Indented content */}
        <div
          className="flex items-center gap-2"
          style={{ marginLeft: `${indent * 20}px` }}
        >
          {indent > 0 && (
            <PiArrowElbowDownRightBold
              size={12}
              className="text-white/20 flex-shrink-0"
            />
          )}

          {/* Row pill */}
          <div className="flex items-center gap-0 text-xs rounded-md overflow-hidden border border-white/8">
            {c.id && (
              <>
                <span className="px-2 py-1 bg-white/5 text-white/30 font-mono">
                  #{c.id}
                </span>
                <span className="w-px h-full bg-white/8" />
              </>
            )}
            <span className="px-2 py-1 bg-white/5 text-indigo-300/70 font-medium">
              {t(`contribution.enum.type.${c.entityType}`)}
            </span>
            <span className="w-px h-full bg-white/8" />
            <span className="px-2 py-1 text-white/40">
              {t(`contribution.enum.action.${c.action}`)}
            </span>
            <span className="w-px h-full bg-white/8" />
            <span className="px-2 py-1 text-white/70">
              {getContributionName(c, locale)}
            </span>
            {c.status && (
              <>
                <ContributionStatusBadge status={c.status} />
              </>
            )}
            {adminActions && c.status !== ContributionStatusEnum.APPROVED && c.status !== ContributionStatusEnum.REJECTED && (
              <span className="flex gap-0.5 px-2 py-1 bg-white/5">
                <BiSolidLike
                  size={16}
                  onClick={() =>
                    triggerUpdateStatus(c, ContributionStatusEnum.APPROVED)
                  }
                  className="text-green-400/70 cursor-pointer"
                />
                <BiSolidDislike
                  size={16}
                  onClick={() =>
                    triggerUpdateStatus(c, ContributionStatusEnum.REJECTED)
                  }
                  className="text-red-400/70 cursor-pointer"
                />
                <BiRevision
                  size={16}
                  onClick={() =>
                    triggerUpdateStatus(
                      c,
                      ContributionStatusEnum.NEEDS_REVISION,
                    )
                  }
                  className="text-purple-400/70 cursor-pointer"
                />
                <BiSkipNextCircle
                  size={16}
                  onClick={() =>
                    triggerUpdateStatus(c, ContributionStatusEnum.SKIPPED)
                  }
                  className="text-amber-400/70 cursor-pointer"
                />
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {c.status !== ContributionStatusEnum.APPROVED &&
          c.status !== ContributionStatusEnum.REJECTED && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {buttons?.add && (
                <MdAdd
                  size={16}
                  onClick={() => onAdd(c)}
                  className="cursor-pointer text-white/30 hover:text-emerald-400 transition-colors"
                />
              )}
              {buttons?.edit && (
                <MdModeEdit
                  size={16}
                  onClick={() => onEdit(c)}
                  className="cursor-pointer text-white/30 hover:text-indigo-400 transition-colors"
                />
              )}
              {buttons?.delete && (
                <MdDelete
                  size={16}
                  onClick={() => onRemove(c)}
                  className="cursor-pointer text-white/30 hover:text-rose-400 transition-colors"
                />
              )}
            </div>
          )}
      </div>

      {/* Children */}
      {c.children && c.children.length > 0 && (
        <div className="ml-1 mt-1 border-l border-white/8 pl-1">
          <GenericList
            list={c.children}
            emptyMsg=""
            elemGenerator={(c: ContributionTree) => mapper(c, indent + 1)}
            vertical
          />
        </div>
      )}
    </div>
  );

  const list =
    !contributionList || contributionList.length === 0
      ? []
      : isSimpleContribution(contributionList[0])
        ? (contributionList as ContributionTree[])
        : ((contributionList as Contribution[]).map(
            contributionToSimpleContribution,
          ) as ContributionTree[]);

  const childrenIds: number[] = [];
  const parentList = list
    // Assign children
    .map((c) => {
      const { localRef, entityType } = c;
      const key = findKeyForEntityType(entityType);
      const children: ContributionTree[] = [];
      if (key) {
        // For each contribution, we find if it's dependant
        list.forEach((c2) => {
          const localItem = c2.proposedData[key];
          if (localItem && localItem.id === localRef) {
            childrenIds.push(c2.id);
            children.push(c2);
          }
        });
      }
      c.children = children;
      return c;
    })
    // Filter out element that are children
    .filter((c) => !childrenIds.includes(c.id))
    .sort((c1, c2) => c2.id - c1.id);

  return (
    <GenericList
      list={parentList}
      emptyMsg={t("contribution.nonefound")}
      elemGenerator={(c: ContributionTree) => mapper(c, 0)}
      vertical
      className={className}
    />
  );
}
