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
import { formatIssueRanges } from "~/utils/issues";
import {
  isSimpleIssue,
  type ContributionIssue,
  type SimpleIssue,
} from "~/models/issue";

interface LinkedIssue {
  id?: number;
  name?: string;
  number?: number;
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
    number: i.number,
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
    number: i.number,
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

// Condensed linked issues, one entry per issue serie, ex : ["Batman #1–5 + #8", "Nightwing #1"]
function formatLinkedIssuesBySerie(
  issues: LinkedIssue[],
  t: TranslationHook["t"],
): string[] {
  const issuesBySerie = new Map<string, { number: number; issueSerieName: string }[]>();
  for (const issue of issues) {
    if (issue.number == null) continue;
    const serie =
      issue.issueSerieName ??
      (issue.issueSerieLocalRef
        ? `${t("generic.local")} ${t("issue.form.serie")}`
        : t("book.form.issueSerieUnknown"));
    issuesBySerie.set(serie, [
      ...(issuesBySerie.get(serie) ?? []),
      { number: issue.number, issueSerieName: serie },
    ]);
  }
  return [...issuesBySerie.values()].map((serieIssues) =>
    formatIssueRanges(serieIssues),
  );
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
            "flex size-5 pointer-coarse:size-10 items-center justify-center rounded-md text-white/40 hover:bg-white/8 hover:text-white/90 transition-colors cursor-pointer focus-visible:outline-1 focus-visible:outline-indigo-400",
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
    const serieRanges = formatLinkedIssuesBySerie(displayedIssues, t);
    if (serieRanges.length === 0) return null;

    // Admins : one line per issue serie to create first
    if (adminActions) {
      return (
        <div className="flex flex-col pl-6 sm:pl-32 pb-0.5 text-[11px] text-amber-300/80">
          <span className="font-medium">
            {t("contribution.book.criticalIssues")}
          </span>
          {serieRanges.map((ranges) => (
            <p key={ranges} className="flex min-w-0 items-center gap-1.5">
              <MdWarningAmber size={13} className="shrink-0" />
              <span className="min-w-0 truncate" title={ranges}>
                {ranges}
              </span>
            </p>
          ))}
        </div>
      );
    }

    const issueRanges = serieRanges.join(" · ");
    return (
      <p className="flex min-w-0 items-center gap-1.5 pl-6 sm:pl-32 pb-0.5 text-[11px] text-indigo-300/60">
        <MdLink size={13} className="shrink-0" />
        <span className="min-w-0 truncate" title={issueRanges}>
          {issueRanges}
        </span>
      </p>
    );
  };

  const renderAdminStatusActions = () => {
    if (!adminActions || isClosed) return null;

    return (
      <div className="flex items-center gap-0.5 pointer-coarse:gap-1 pl-1 ml-1 border-l border-white/10">
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
            className="flex h-5 pointer-coarse:h-10 items-center gap-1 rounded border border-white/10 px-1.5 pointer-coarse:px-3 text-[11px] font-medium text-white/60 hover:bg-white/8 hover:text-white/90 transition-colors cursor-pointer focus-visible:outline-1 focus-visible:outline-indigo-400"
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
      <div className="group/row flex flex-col rounded px-1.5 py-0.5 hover:bg-white/4 focus-within:bg-white/4 transition-colors">
        <div className="flex h-6 pointer-coarse:h-10 min-w-0 items-center gap-2">
          {/* Collapse toggle (or spacer to keep names aligned) */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              aria-expanded={!collapsed}
              aria-label={t(collapsed ? "generic.expand" : "generic.collapse")}
              className="relative flex size-4 shrink-0 items-center justify-center rounded text-white/35 hover:text-white/70 cursor-pointer after:absolute after:-inset-1 after:content-[''] pointer-coarse:after:-inset-3"
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

          {/* Fixed width : names stay aligned between siblings */}
          <span className="w-24 shrink-0 truncate text-xs text-white/40">
            {t(`contribution.enum.type.${contribution.entityType}`)}
          </span>
          <span className="min-w-0 truncate text-[13px] text-white/75">
            {getContributionName(contribution, locale)}
          </span>
          {/* Meta, muted */}
          <span className="hidden sm:inline shrink-0 text-xs text-white/25">
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

          {/* Status + actions */}
          <div className="ml-auto flex shrink-0 items-center gap-1 pl-2">
            {contribution.status && (
              <ContributionStatusBadge
                status={contribution.status}
                className="py-0 text-[11px] leading-4"
              />
            )}
            {renderAdminStatusActions()}
            {renderActionButtons()}
          </div>
        </div>

        {renderLinkedIssues()}
      </div>

      {!collapsed && hasChildren && (
        <div className="ml-3.5 border-l border-white/8 pl-1.5">
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
      className={twMerge("gap-0 p-1.5", className)}
    />
  );
}
