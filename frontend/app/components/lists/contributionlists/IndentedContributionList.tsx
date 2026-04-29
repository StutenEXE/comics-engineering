import { PiArrowElbowDownRightBold } from "react-icons/pi";
import { useTranslation } from "~/i18n/i18n";
import {
  contributionToSimpleContribution,
  ContributionTypeEnum,
  getContributionName,
  isSimpleContribution,
  type Contribution,
  type ContributionTree,
  type SimpleContribution,
} from "~/models/contribution";
import { type Error } from "~/utils/error";
import { GenericList } from "../GenericList";
import { MdAdd, MdDelete, MdModeEdit } from "react-icons/md";

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
  isLoading,
  error,
  className,
}: ContributionTreeListProps) {
  const { t, locale } = useTranslation();

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
  <div key={c.id} className="py-1">
    <div className="flex items-center gap-1 group">
      {/* Action buttons */}
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

      {/* Indented content */}
      <div className="flex items-center gap-2" style={{ marginLeft: `${indent * 20}px` }}>
        {indent > 0 && (
          <PiArrowElbowDownRightBold size={12} className="text-white/20 flex-shrink-0" />
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
            {t(c.entityType)}
          </span>
          <span className="w-px h-full bg-white/8" />
          <span className="px-2 py-1 text-white/40">
            {t(c.action)}
          </span>
          <span className="w-px h-full bg-white/8" />
          <span className="px-2 py-1 text-white/70">
            {getContributionName(c, locale)}
          </span>
        </div>
      </div>
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
      emptyMsg={t("cbundle.form.nocontributions")}
      elemGenerator={(c: ContributionTree) => mapper(c, 0)}
      vertical
      className={className}
    />
  );
}
