import {
  BiRevision,
  BiSkipNextCircle,
  BiSolidDislike,
  BiSolidLike,
} from "react-icons/bi";
import { useEffect, useMemo, useState } from "react";
import {
  MdAdd,
  MdDelete,
  MdExpandMore,
  MdLink,
  MdModeEdit,
  MdWarningAmber,
} from "react-icons/md";
import { twMerge } from "tailwind-merge";
import { Tooltip } from "~/components/misc/Tooltip";
import { ContributionStatusBadge } from "~/components/badges/ContributionStatusBadge";
import { useConfirm } from "~/components/modals/ConfirmModalProvider";
import { useToast } from "~/components/toast/Toast";
import { useTranslation, type TranslationKeys } from "~/i18n/i18n";
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
import { translateApiError, type Error } from "~/utils/error";
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

// Label of the "add" button : what will be created from this contribution
// (see ContributionBundleForm.addContributionFrom)
const addChildLabelKeys: Partial<Record<ContributionTypeEnum, TranslationKeys>> =
  {
    [ContributionTypeEnum.SERIE]: "cbundle.form.addBook",
    [ContributionTypeEnum.BOOK]: "cbundle.form.addEdition",
    [ContributionTypeEnum.ISSUE_SERIE]: "cbundle.form.addIssue",
    [ContributionTypeEnum.ISSUE]: "cbundle.form.addNextIssue",
  };

const ISSUES_PREVIEW_COUNT = 3;

interface IconActionProps {
  label: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}

// Icon-only button labelled through a tooltip, bigger on touch screens
function IconAction({ label, onClick, className, children }: IconActionProps) {
  return (
    <Tooltip
      delay={200}
      trigger={
        <button
          type="button"
          aria-label={label}
          onClick={onClick}
          className={twMerge(
            "flex size-6 pointer-coarse:size-10 items-center justify-center rounded text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer focus-visible:outline-1 focus-visible:outline-indigo-400",
            className,
          )}
        >
          {children}
        </button>
      }
      content={<p>{label}</p>}
    />
  );
}

interface ContributionTreeRowProps {
  contribution: ContributionTree;
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
  const children = contribution.children ?? [];
  const hasChildren = children.length > 0;

  const isClosed =
    contribution.status === ContributionStatusEnum.APPROVED ||
    contribution.status === ContributionStatusEnum.REJECTED;

  // Admins only care about the issues that must be created first
  const displayedIssues =
    contribution.entityType === ContributionTypeEnum.BOOK
      ? adminActions
        ? getCriticalIssueList(contribution)
        : getIssueList(contribution)
      : [];

  const addChildLabelKey = addChildLabelKeys[contribution.entityType];

  const renderLinkedIssues = () => {
    if (displayedIssues.length === 0) return null;

    return (
      <div
        className={twMerge(
          "flex w-full min-w-0 items-center gap-1 pl-[22px] text-xs",
          adminActions ? "text-amber-300" : "text-zinc-400",
        )}
      >
        {adminActions ? (
          <MdWarningAmber size={12} className="shrink-0" />
        ) : (
          <MdLink size={12} className="shrink-0" />
        )}
        <span className="min-w-0 truncate">
          <span className="font-medium">
            {adminActions
              ? t("contribution.book.criticalIssues")
              : t("contribution.book.linkedIssues")}
            {" : "}
          </span>
          {groupIssuesBySerie(displayedIssues, t)
            .map((group) => {
              const names = group.items
                .slice(0, ISSUES_PREVIEW_COUNT)
                .map((issue) => issue.name ?? formatIssueReference(issue, t));
              const more = group.items.length - ISSUES_PREVIEW_COUNT;
              return `${group.title} (${names.join(", ")}${
                more > 0
                  ? `, ${t("generic.andMore", { parameters: { n: more } })}`
                  : ""
              })`;
            })
            .join(" · ")}
        </span>
      </div>
    );
  };

  const renderAdminStatusActions = () => {
    if (!adminActions || isClosed) return null;

    return (
      <div className="flex items-center gap-0.5 pointer-coarse:gap-1 pr-1 mr-1 border-r border-zinc-800">
        <IconAction
          label={t("contribution.review.approve")}
          onClick={() =>
            triggerUpdateStatus(contribution, ContributionStatusEnum.APPROVED)
          }
          className="text-green-400 hover:text-green-300"
        >
          <BiSolidLike size={14} />
        </IconAction>
        <IconAction
          label={t("contribution.review.reject")}
          onClick={() =>
            triggerUpdateStatus(contribution, ContributionStatusEnum.REJECTED)
          }
          className="text-red-400 hover:text-red-300"
        >
          <BiSolidDislike size={14} />
        </IconAction>
        <IconAction
          label={t("contribution.review.revise")}
          onClick={() =>
            triggerUpdateStatus(
              contribution,
              ContributionStatusEnum.NEEDS_REVISION,
            )
          }
          className="text-purple-400 hover:text-purple-300"
        >
          <BiRevision size={14} />
        </IconAction>
        <IconAction
          label={t("contribution.review.skip")}
          onClick={() =>
            triggerUpdateStatus(contribution, ContributionStatusEnum.SKIPPED)
          }
          className="text-amber-400 hover:text-amber-300"
        >
          <BiSkipNextCircle size={14} />
        </IconAction>
      </div>
    );
  };

  const renderActionButtons = () => {
    if (isClosed) return null;

    // Desktop : revealed on row hover / keyboard focus (like GitHub, Linear). Touch : always visible
    return (
      <div className="flex items-center gap-0.5 pointer-coarse:gap-1 transition-opacity pointer-fine:opacity-0 pointer-fine:group-hover/row:opacity-100 pointer-fine:group-focus-within/row:opacity-100">
        {buttons?.add && addChildLabelKey && (
          <button
            type="button"
            onClick={() => onAdd(contribution)}
            className="flex h-6 pointer-coarse:h-10 items-center gap-0.5 rounded border border-zinc-700 px-1.5 pointer-coarse:px-3 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer focus-visible:outline-1 focus-visible:outline-indigo-400"
          >
            <MdAdd size={12} />
            {t(addChildLabelKey)}
          </button>
        )}
        {buttons?.edit && (
          <IconAction
            label={t("generic.edit")}
            onClick={() => onEdit(contribution)}
          >
            <MdModeEdit size={14} />
          </IconAction>
        )}
        {buttons?.delete && (
          <IconAction
            label={t("generic.remove")}
            onClick={() => onRemove(contribution)}
            className="hover:text-rose-400"
          >
            <MdDelete size={14} />
          </IconAction>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="group/row flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded px-1 py-0.5 hover:bg-zinc-900 focus-within:bg-zinc-900 transition-colors">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          {/* Collapse toggle (or spacer to keep names aligned) */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              aria-expanded={!collapsed}
              aria-label={t(collapsed ? "generic.expand" : "generic.collapse")}
              className="relative flex size-4 shrink-0 items-center justify-center rounded text-zinc-400 hover:text-zinc-200 cursor-pointer after:absolute after:-inset-1 after:content-[''] pointer-coarse:after:-inset-3"
            >
              <MdExpandMore
                size={16}
                className={twMerge(
                  "transition-transform",
                  collapsed && "-rotate-90",
                )}
              />
            </button>
          ) : (
            <span className="size-4 shrink-0" />
          )}

          <span
            className="shrink-0 rounded border border-sky-400/25 bg-sky-500/10 px-1 text-[11px] leading-4 font-medium text-sky-300"
          >
            {t(`contribution.enum.type.${contribution.entityType}`)}
          </span>
          <span className="truncate text-sm text-zinc-100">
            {getContributionName(contribution, locale)}
          </span>
          {/* Meta, muted */}
          <span className="shrink-0 text-xs text-zinc-400">
            {t(`contribution.enum.action.${contribution.action}`)}
            {contribution.id && (
              <span className="font-mono"> · #{contribution.id}</span>
            )}
            {collapsed && hasChildren && (
              <>
                {" · "}
                {t("contribution.list.hiddenChildren", {
                  parameters: { n: children.length },
                })}
              </>
            )}
          </span>
        </div>

        {/* Status + actions */}
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {contribution.status && (
            <ContributionStatusBadge
              status={contribution.status}
              className="py-0 text-[11px] leading-4"
            />
          )}
          {renderAdminStatusActions()}
          {renderActionButtons()}
        </div>

        {renderLinkedIssues()}
      </div>

      {!collapsed && hasChildren && (
        <div className="ml-[11px] border-l border-zinc-800 pl-1.5">
          {children
            .sort((a, b) => (b.localRef || b.id) - (a.localRef || a.id))
            .map((child) => (
              <ContributionTreeRow
                key={child.id}
                contribution={child}
                buttons={buttons}
                adminActions={adminActions}
                onAdd={onAdd}
                onEdit={onEdit}
                onRemove={onRemove}
                triggerUpdateStatus={triggerUpdateStatus}
                t={t}
                locale={locale}
              />
            ))}
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
      variant:
        newStatus === ContributionStatusEnum.REJECTED ? "danger" : "default",
      onConfirm: async () => {
        const result = await updateStatus({ contributionId: c.id, newStatus });
        if ("error" in result) {
          toast.error(
            translateApiError(
              result.error,
              t,
              "contribution.status.updateerror",
            ),
          );
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
      className={twMerge("gap-0.5 p-1", className)}
    />
  );
}
