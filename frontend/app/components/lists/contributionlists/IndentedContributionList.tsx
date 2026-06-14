import {
  BiRevision,
  BiSkipNextCircle,
  BiSolidDislike,
  BiSolidLike,
} from "react-icons/bi";
import { useEffect, useMemo, useState } from "react";
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
import { BsArrowsExpand, BsArrowsCollapse } from "react-icons/bs";

interface LinkedIssue {
  id?: number;
  name?: string;
  localRef?: string;
  issueSerieId?: number;
  issueSerieName?: string;
  issueSerieLocalRef?: string;
}

type ContributionReferenceKey = "book" | "serie" | "issueSerie";

type IssueInput = SimpleIssue | ContributionIssue;

type TranslationHook = ReturnType<typeof useTranslation>;

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

function isLocalEntityId(id: number | undefined): boolean {
  return id != null && id < 0;
}

function mapSimpleIssueToLinkedIssue(i: SimpleIssue): LinkedIssue {
  return {
    id: i.id >= 0 ? i.id : undefined,
    name: i.name,
    localRef: isLocalEntityId(i.id) ? String(i.id) : undefined,
    issueSerieId: i.issueSerieId! >= 0 ? i.issueSerieId : undefined,
    issueSerieName: i.issueSerieName,
    issueSerieLocalRef: isLocalEntityId(i.issueSerieId)
      ? String(i.issueSerieId)
      : undefined,
  };
}

function mapContributionIssueToLinkedIssue(i: ContributionIssue): LinkedIssue {
  return {
    id: i.id! >= 0 ? i.id : undefined,
    name: i.name,
    localRef: isLocalEntityId(i.id) ? String(i.id) : undefined,
    issueSerieId: i.issueSerie.id! >= 0 ? i.issueSerie.id : undefined,
    issueSerieName: i.issueSerie.name,
    issueSerieLocalRef: isLocalEntityId(i.issueSerie.id)
      ? String(i.issueSerie.id)
      : undefined,
  };
}

function mapIssueToLinkedIssue(issue: IssueInput): LinkedIssue {
  return isSimpleIssue(issue)
    ? mapSimpleIssueToLinkedIssue(issue)
    : mapContributionIssueToLinkedIssue(issue);
}

function getEntityKey(
  type: ContributionTypeEnum,
): ContributionReferenceKey | undefined {
  switch (type) {
    case ContributionTypeEnum.BOOK:
      return "book";
    case ContributionTypeEnum.SERIE:
      return "serie";
    case ContributionTypeEnum.ISSUE_SERIE:
      return "issueSerie";
    default:
      return undefined;
  }
}

interface ContributionReference {
  key: ContributionReferenceKey;
  id: number;
}

function getParentReference(
  c: SimpleContribution,
): ContributionReference | undefined {
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
}

function getIssueList(c: SimpleContribution): LinkedIssue[] {
  return c.proposedData?.issues?.map(mapIssueToLinkedIssue) ?? [];
}

function getCriticalIssueList(c: SimpleContribution): LinkedIssue[] {
  return getIssueList(c).filter((issue) => issue.localRef !== undefined);
}

function formatIssueReference(
  issue: LinkedIssue,
  t: TranslationHook["t"],
): string {
  return issue.localRef
    ? `${t("generic.local")}: ${issue.name ?? issue.localRef}`
    : `#${issue.id} ${issue.name ?? ""}`;
}

function groupIssuesBySerie(
  issues: LinkedIssue[],
  t: ReturnType<typeof useTranslation>["t"],
) {
  const groups = new Map<string, { title: string; items: LinkedIssue[] }>();

  issues.forEach((issue) => {
    const key =
      issue.issueSerieId != null
        ? `serie-${issue.issueSerieId}`
        : issue.issueSerieLocalRef != null
          ? `local-${issue.issueSerieLocalRef}`
          : "other";

    const title =
      issue.issueSerieName ??
      (issue.issueSerieLocalRef
        ? `${t("generic.local")} ${t("issue.form.serie")}`
        : t("book.form.issueSerieUnknown"));

    const existing = groups.get(key);
    if (existing) {
      existing.items.push(issue);
    } else {
      groups.set(key, { title, items: [issue] });
    }
  });

  return Array.from(groups.values());
}

function parseContributionList(
  contributionList: Contribution[] | SimpleContribution[] | null | undefined,
): SimpleContribution[] {
  if (!contributionList || contributionList.length === 0) {
    return [];
  }

  if (isSimpleContribution(contributionList[0])) {
    return (contributionList as SimpleContribution[]).map((contribution) => ({
      ...contribution,
    }));
  }

  return (contributionList as Contribution[]).map((contribution) => ({
    ...contributionToSimpleContribution(contribution),
  }));
}

interface ContributionTreeRowProps {
  contribution: ContributionTree;
  indent: number;
  buttons?: ContributionTreeListProps["buttons"];
  adminActions?: boolean;
  onAdd: (c: ContributionTree) => void;
  onEdit: (c: ContributionTree) => void;
  onRemove: (c: ContributionTree) => void;
  triggerUpdateStatus: (
    c: ContributionTree,
    newStatus: ContributionStatusEnum,
  ) => void;
  t: TranslationHook["t"];
  locale: TranslationHook["locale"];
}

function ContributionTreeRow({
  contribution,
  indent,
  buttons,
  adminActions,
  onAdd,
  onEdit,
  onRemove,
  triggerUpdateStatus,
  t,
  locale,
}: ContributionTreeRowProps) {
  const [collapsed, setCollapsed] = useState(false);
  const linkedIssues =
    contribution.entityType === ContributionTypeEnum.BOOK
      ? getIssueList(contribution)
      : [];
  const criticalIssues =
    contribution.entityType === ContributionTypeEnum.BOOK
      ? getCriticalIssueList(contribution)
      : [];
  const displayedIssues = adminActions ? criticalIssues : linkedIssues;
  const hasIssueInfo = displayedIssues.length > 0;

  const renderIssueGroups = () => {
    if (!hasIssueInfo) {
      return null;
    }

    const title = adminActions
      ? t("contribution.book.criticalIssues")
      : t("contribution.book.linkedIssues");

    return (
      <span className="flex flex-col gap-2 px-2 py-2 bg-amber-500/10 text-amber-100">
        <span className="text-[10px] uppercase tracking-widest text-amber-200">
          {title}
        </span>
        {groupIssuesBySerie(displayedIssues, t).map((group, idx) => (
          <span
            key={idx}
            className="flex flex-wrap items-center gap-2 text-[10px] rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-100"
          >
            <span className="font-semibold text-amber-200">{group.title}:</span>
            {group.items.slice(0, 2).map((issue, issueIdx) => (
              <span key={issueIdx}>
                {issue.name ?? formatIssueReference(issue, t)}
              </span>
            ))}
            {group.items.length > 2 && (
              <span>+{group.items.length - 2} more</span>
            )}
          </span>
        ))}
      </span>
    );
  };

  const renderAdminStatusActions = () => {
    if (
      !adminActions ||
      contribution.status === ContributionStatusEnum.APPROVED ||
      contribution.status === ContributionStatusEnum.REJECTED
    ) {
      return null;
    }

    return (
      <span className="flex gap-0.5 px-2 py-1 bg-white/5">
        <BiSolidLike
          size={16}
          onClick={() =>
            triggerUpdateStatus(contribution, ContributionStatusEnum.APPROVED)
          }
          className="text-green-400/70 cursor-pointer"
        />
        <BiSolidDislike
          size={16}
          onClick={() =>
            triggerUpdateStatus(contribution, ContributionStatusEnum.REJECTED)
          }
          className="text-red-400/70 cursor-pointer"
        />
        <BiRevision
          size={16}
          onClick={() =>
            triggerUpdateStatus(
              contribution,
              ContributionStatusEnum.NEEDS_REVISION,
            )
          }
          className="text-purple-400/70 cursor-pointer"
        />
        <BiSkipNextCircle
          size={16}
          onClick={() =>
            triggerUpdateStatus(contribution, ContributionStatusEnum.SKIPPED)
          }
          className="text-amber-400/70 cursor-pointer"
        />
      </span>
    );
  };

  const renderActionButtons = () => {
    if (
      contribution.status === ContributionStatusEnum.APPROVED ||
      contribution.status === ContributionStatusEnum.REJECTED
    ) {
      return null;
    }

    return (
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {buttons?.add && (
          <MdAdd
            size={16}
            onClick={() => onAdd(contribution)}
            className="cursor-pointer text-white/30 hover:text-emerald-400 transition-colors"
          />
        )}
        {buttons?.edit && (
          <MdModeEdit
            size={16}
            onClick={() => onEdit(contribution)}
            className="cursor-pointer text-white/30 hover:text-indigo-400 transition-colors"
          />
        )}
        {buttons?.delete && (
          <MdDelete
            size={16}
            onClick={() => onRemove(contribution)}
            className="cursor-pointer text-white/30 hover:text-rose-400 transition-colors"
          />
        )}
      </div>
    );
  };

  return (
    <div key={contribution.id} className="pb-1">
      <div className="flex items-center gap-1 group">
        {contribution.children && contribution.children.length > 0 ? (
          collapsed ? (
            <BsArrowsExpand
              onClick={() => setCollapsed(false)}
              size={12}
              className="text-white/20 flex-shrink-0 cursor-pointer hover:text-white/50"
            />
          ) : (
            <BsArrowsCollapse
              onClick={() => setCollapsed(true)}
              size={12}
              className="text-white/20 flex-shrink-0 cursor-pointer hover:text-white/50"
            />
          )
        ) : null}
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

          <div className="flex items-center gap-0 text-xs rounded-md overflow-hidden border border-white/8">
            {contribution.id && (
              <>
                <span className="px-2 py-1 bg-white/5 text-white/30 font-mono">
                  #{contribution.id}
                </span>
                <span className="w-px h-full bg-white/8" />
              </>
            )}
            <span className="px-2 py-1 bg-white/5 text-indigo-300/70 font-medium">
              {t(`contribution.enum.type.${contribution.entityType}`)}
            </span>
            <span className="w-px h-full bg-white/8" />
            <span className="px-2 py-1 text-white/40">
              {t(`contribution.enum.action.${contribution.action}`)}
            </span>
            <span className="w-px h-full bg-white/8" />
            <span className="px-2 py-1 text-white/70">
              {getContributionName(contribution, locale)}
            </span>
            {renderIssueGroups()}
            {contribution.status && (
              <ContributionStatusBadge
                className="ml-2"
                status={contribution.status}
              />
            )}
            {renderAdminStatusActions()}
          </div>
        </div>

        {renderActionButtons()}
      </div>

      {!collapsed &&
        contribution.children &&
        contribution.children.length > 0 && (
          <div className="ml-1 mt-1 border-l border-white/8 pl-1">
            <GenericList
              list={contribution.children.sort(
                (a, b) => (b.localRef || b.id) - (a.localRef || a.id),
              )}
              emptyMsg=""
              elemGenerator={(child: ContributionTree) => (
                <ContributionTreeRow
                  contribution={child}
                  indent={indent + 1}
                  buttons={buttons}
                  adminActions={adminActions}
                  onAdd={onAdd}
                  onEdit={onEdit}
                  onRemove={onRemove}
                  triggerUpdateStatus={triggerUpdateStatus}
                  t={t}
                  locale={locale}
                />
              )}
              vertical
            />
          </div>
        )}
    </div>
  );
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
  const [list, setList] = useState<SimpleContribution[]>(() =>
    parseContributionList(contributionList),
  );

  useEffect(() => {
    setList(parseContributionList(contributionList));
  }, [contributionList]);

  const triggerUpdateStatus = (
    c: ContributionTree,
    newStatus: ContributionStatusEnum,
  ) => {
    confirm({
      title: t("contribution.confirmstatuschange"),
      message: t(`contribution.confirmstatuschangemessage.${newStatus}`),
      onConfirm: async () => {
        const result = await updateStatus({ contributionId: c.id, newStatus });
        if ("error" in result) {
          toast.error(t("contribution.status.updateerror"));
          return;
        }
        toast.success(t("contribution.status.updated"));
        setList((previous) =>
          previous.map((item) =>
            item.id === c.id ? { ...item, status: newStatus } : item,
          ),
        );
      },
    });
  };

  const buildTree = (
    node: SimpleContribution,
    allItems: SimpleContribution[],
  ): ContributionTree => {
    const key = getEntityKey(node.entityType);
    const children = key
      ? allItems
          .filter((candidate) => {
            const localItem = candidate.proposedData?.[key] as
              | { id?: number }
              | undefined;
            return localItem?.id === node.localRef;
          })
          .map((candidate) => buildTree(candidate, allItems))
          .sort((a, b) => b.id - a.id)
      : [];

    return {
      ...node,
      children,
    };
  };

  const childIds = useMemo(() => {
    const ids = new Set<number>();

    list.forEach((candidate) => {
      const parentReference = getParentReference(candidate);
      if (!parentReference) {
        return;
      }

      const isChild = list.some(
        (parent) =>
          parent.localRef != null && parent.localRef === parentReference.id,
      );
      if (isChild) {
        ids.add(candidate.id);
      }
    });

    return ids;
  }, [list]);

  const parentList = useMemo(() => {
    return list
      .map((item) => buildTree(item, list))
      .filter((item) => !childIds.has(item.id))
      .sort((a, b) => b.id - a.id);
  }, [list, childIds]);

  return (
    <GenericList
      list={parentList.sort(
        (a, b) => (b.localRef || b.id) - (a.localRef || a.id),
      )}
      emptyMsg={t("contribution.nonefound")}
      elemGenerator={(c: ContributionTree) => (
        <ContributionTreeRow
          key={c.id}
          contribution={c}
          indent={0}
          buttons={buttons}
          adminActions={adminActions}
          onAdd={onAdd}
          onEdit={onEdit}
          onRemove={onRemove}
          triggerUpdateStatus={triggerUpdateStatus}
          t={t}
          locale={locale}
        />
      )}
      vertical
      className={className}
    />
  );
}
