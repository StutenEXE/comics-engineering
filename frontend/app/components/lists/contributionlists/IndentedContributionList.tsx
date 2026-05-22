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
import type { AnyARecord } from "dns";
import type { SimpleIssue } from "~/models/issue";

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

  const getLinkedIssues = (c: SimpleContribution) => {
    return (c.proposedData?.issues ?? []) as SimpleIssue[];
  };

  const getCriticalLinkedIssues = (c: SimpleContribution) => {
    return c.proposedData?.issues?.filter((li: SimpleIssue) => li.id < 0) ?? [];
  };

  const formatIssueRef = (li: any) =>
    li.localRef
      ? `${t("generic.local")}: ${li.name ?? li.localRef}`
      : `#${li.id} ${li.name ?? ""}`;

  const groupLinkedIssuesBySerie = (issues: any[]) => {
    const groups = new Map<string, { title: string; items: any[] }>();
    issues.forEach((li) => {
      const key =
        li.issueSerieId != null
          ? `serie-${li.issueSerieId}`
          : li.issueSerieLocalRef != null
            ? `local-${li.issueSerieLocalRef}`
            : `other`;
      const title =
        li.issueSerieName ??
        (li.issueSerieLocalRef
          ? `${t("generic.local")} ${t("issue.form.serie")}`
          : t("book.form.issueSerieUnknown"));
      const existing = groups.get(key);
      if (existing) {
        existing.items.push(li);
      } else {
        groups.set(key, { title, items: [li] });
      }
    });
    return Array.from(groups.values());
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
            {c.entityType === ContributionTypeEnum.BOOK &&
              // Admin and non admin users have different views :
              // Admin sees only the critical issues remaining to create for proper linking
              // Non admin sees all the linked issues, to understand the dependencies
              ((!adminActions && getLinkedIssues(c).length > 0) ||
                (adminActions && getCriticalLinkedIssues(c).length > 0)) && (
                <span className="flex flex-col gap-2 px-2 py-2 bg-amber-500/10 text-amber-100">
                  <span className="text-[10px] uppercase tracking-widest text-amber-200">
                    {adminActions ? t("contribution.book.criticalIssues") : t("contribution.book.linkedIssues")}
                  </span>
                  {groupLinkedIssuesBySerie(adminActions ? getCriticalLinkedIssues(c) : getLinkedIssues(c)).map(
                    (group, idx) => (
                      <span
                        key={idx}
                        className="flex flex-wrap items-center gap-2 text-[10px] rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-100"
                      >
                        <span className="font-semibold text-amber-200">
                          {group.title}:
                        </span>
                        {group.items.slice(0, 2).map((li, liIdx) => (
                          <span key={liIdx}>
                            {li.name ?? formatIssueRef(li)}
                          </span>
                        ))}
                        {group.items.length > 2 && (
                          <span>+{group.items.length - 2} more</span>
                        )}
                      </span>
                    ),
                  )}
                </span>
              )}
            {c.status && (
              <>
                <ContributionStatusBadge status={c.status} />
              </>
            )}
            {adminActions &&
              c.status !== ContributionStatusEnum.APPROVED &&
              c.status !== ContributionStatusEnum.REJECTED && (
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

  const childrenIds = new Set<number>();
  const parentList = list
    // Assign children
    .map((c) => {
      const { localRef, entityType } = c;
      const key = findKeyForEntityType(entityType);
      const children: ContributionTree[] = [];
      if (key) {
        // For each contribution, we find if it's dependent
        list.forEach((c2) => {
          const localItem = c2.proposedData[key];
          if (localItem && localItem.id === localRef) {
            childrenIds.add(c2.id);
            children.push(c2);
          }
        });
      }

      c.children = children;
      return c;
    })
    // Filter out element that are children
    .filter((c) => !childrenIds.has(c.id))
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
