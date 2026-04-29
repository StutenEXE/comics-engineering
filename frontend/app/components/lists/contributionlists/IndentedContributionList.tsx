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
    <div className="snap-center pb-1 rounded-sm">
      <div className="flex">
        <div className="flex">
          {buttons?.add && (
            <MdAdd
              size={20}
              onClick={() => onAdd(c)}
              className="cursor-pointer hover:text-green-500"
            />
          )}
          {buttons?.edit && (
            <MdModeEdit
              size={20}
              onClick={() => onEdit(c)}
              className="cursor-pointer hover:text-blue-500"
            />
          )}
          {buttons?.delete && (
            <MdDelete
              size={20}
              onClick={() => onRemove(c)}
              className="cursor-pointer hover:text-red-500"
            />
          )}
        </div>
        <div className="flex" style={{ marginLeft: `${indent * 25}px` }}>
          <div className="flex gap-2">
            {indent > 0 && <PiArrowElbowDownRightBold size={18} />}
            <p className="flex gap-2">
              {c.id && (
                <>
                  <span className="w-20 text-center">[{c.id}]</span>-
                </>
              )}
              <span className="w-20 text-center">{t(c.entityType)}</span>-
              <span className="w-20 text-center">{t(c.action)}</span>-
              <span className="max-w text-center">
                {getContributionName(c, locale)}
              </span>
            </p>
          </div>
        </div>
      </div>
      {c.children && c.children.length > 0 && (
        <GenericList
          list={c.children}
          emptyMsg=""
          elemGenerator={(c: ContributionTree) => mapper(c, indent++)}
          vertical
        />
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
