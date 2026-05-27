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
import {
  isSimpleIssue,
  type ContributionIssue,
  type SimpleIssue,
} from "~/models/issue";

interface LinkedIssue {
  id?: number;
  name?: string;
  localRef?: string;
  issueSerieId?: number;
  issueSerieName?: string;
  issueSerieLocalRef?: string;
}

function simpleIssueToLinkedIssue(i: SimpleIssue): LinkedIssue {
  return {
    id: i.id >= 0 ? i.id : undefined,
    name: i.name,
    localRef: i.id < 0 ? String(i.id) : undefined,
    issueSerieId: i.issueSerieId! >= 0 ? i.issueSerieId : undefined,
    issueSerieName: i.issueSerieName,
    issueSerieLocalRef:
      i.issueSerieId! < 0 ? String(i.issueSerieId) : undefined,
  };
}

function contributionIssueToLinkedIssue(i: ContributionIssue): LinkedIssue {
  return {
    id: i.id! >= 0 ? i.id : undefined,
    name: i.name,
    localRef: i.id! < 0 ? String(i.id) : undefined,
    issueSerieId: i.issueSerie.id! >= 0 ? i.issueSerie.id : undefined,
    issueSerieName: i.issueSerie.name,
    issueSerieLocalRef:
      i.issueSerie.id! < 0 ? String(i.issueSerie.id) : undefined,
  };
}

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
  onAdd = () => {},
  onEdit = () => {},
  onRemove = () => {},
  adminActions,
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
              toast.error(t("contribution.status.updateerror"));
              return;
            }
            toast.success(t("contribution.status.updated"));
            c.status = newStatus;
          },
        );
      },
    });
  };

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

  const getParentReference = (c: SimpleContribution) => {
    const proposedData = c.proposedData ?? {};

    if (proposedData.book?.id != null) {
      return { key: "book", id: proposedData.book.id };
    }

    if (proposedData.serie?.id != null) {
      return { key: "serie", id: proposedData.serie.id };
    }

    if (proposedData.issueSerie?.id != null) {
      return { key: "issueSerie", id: proposedData.issueSerie.id };
    }

    return undefined;
  };

  const getLinkedIssues = (c: SimpleContribution) => {
    const linkedIssues = (
      c.proposedData?.issues
        ? c.proposedData.issues.map((i: SimpleIssue | ContributionIssue) => {
            if (isSimpleIssue(i)) {
              return simpleIssueToLinkedIssue(i);
            } else {
              return contributionIssueToLinkedIssue(i);
            }
          })
        : []
    ) as LinkedIssue[];
    console.log("Linked issues for contribution", c.id, linkedIssues);
    return linkedIssues;
  };

  const getCriticalLinkedIssues = (c: SimpleContribution) => {
    return (
      c.proposedData?.issues?.filter(
        (li: LinkedIssue) => li.localRef !== undefined,
      ) ?? []
    );
  };

  const formatIssueRef = (li: LinkedIssue) =>
    li.localRef
      ? `${t("generic.local")}: ${li.name ?? li.localRef}`
      : `#${li.id} ${li.name ?? ""}`;

  const groupLinkedIssuesBySerie = (issues: LinkedIssue[]) => {
    const groups = new Map<string, { title: string; items: LinkedIssue[] }>();
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
                    {adminActions
                      ? t("contribution.book.criticalIssues")
                      : t("contribution.book.linkedIssues")}
                  </span>
                  {groupLinkedIssuesBySerie(
                    adminActions
                      ? getCriticalLinkedIssues(c)
                      : getLinkedIssues(c),
                  ).map((group, idx) => (
                    <span
                      key={idx}
                      className="flex flex-wrap items-center gap-2 text-[10px] rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-100"
                    >
                      <span className="font-semibold text-amber-200">
                        {group.title}:
                      </span>
                      {group.items.slice(0, 2).map((li, liIdx) => (
                        <span key={liIdx}>{li.name ?? formatIssueRef(li)}</span>
                      ))}
                      {group.items.length > 2 && (
                        <span>+{group.items.length - 2} more</span>
                      )}
                    </span>
                  ))}
                </span>
              )}
            {c.status && (
              <>
                <ContributionStatusBadge className="ml-2" status={c.status} />
              </>
            )}
            {/* Show action buttons if admin actions are enabled and if the contribution is not approved or rejected */}
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
        ? (contributionList as SimpleContribution[]).map((c) => ({
            ...c, // Deepcopy
          }))
        : (contributionList as Contribution[]).map((c) => ({
            ...contributionToSimpleContribution(c), // Deepcopy
          }));

  const buildTree = (node: SimpleContribution): ContributionTree => {
    const key = findKeyForEntityType(node.entityType);
    const children = key
      ? list
          .filter((candidate) => {
            const localItem = candidate.proposedData[key];
            return localItem && localItem.id === node.localRef;
          })
          .map((candidate) => buildTree(candidate))
          .sort((a, b) => b.id - a.id)
      : [];

    return {
      ...node,
      children,
    };
  };

  const childIds = new Set<number>();
  list.forEach((candidate) => {
    const parentReference = getParentReference(candidate);
    if (!parentReference) {
      return;
    }

    const isChild = list.some((potentialParent) => {
      return (
        potentialParent.localRef != null &&
        potentialParent.localRef === parentReference.id
      );
    });

    if (isChild) {
      childIds.add(candidate.id);
    }
  });

  const parentList = list
    .map((c) => buildTree(c))
    .filter((c) => !childIds.has(c.id))
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
