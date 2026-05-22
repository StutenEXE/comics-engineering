import {
  editionToSimpleEdition,
  isSimpleEdition,
  type Edition,
  type SimpleEdition,
} from "~/models/edition";
import { EditionCard } from "../../cards/EditionCard";
import { compareDates } from "~/utils/date";
import { GenericList } from "../GenericList";
import { useTranslation } from "~/i18n/i18n";

interface EditionListProps {
  editionList: Edition[] | SimpleEdition[] | null | undefined;
  descOrder?: boolean;
  className?: string;
}

export function EditionList({
  editionList,
  descOrder,
  className,
}: EditionListProps) {
  const { t } = useTranslation();

  const mapper = (ed: SimpleEdition) => (
    <EditionCard
      className="w-30 snap-center hover:bg-gray-700 pb-1 rounded-sm"
      key={ed.id}
      edition={ed}
    />
  );

  const list = (
    !editionList || editionList.length === 0
      ? []
      : isSimpleEdition(editionList[0])
        ? ([...editionList] as SimpleEdition[])
        : (editionList as Edition[]).map(editionToSimpleEdition)
  )
    // Sorting list
    .sort((ed1, ed2) => {
      if (descOrder) {
        // Sort in descending order (newest issue first)
        return compareDates(ed2.parutionDate, ed1.parutionDate);
      }
      // Sort in ascending order (oldest issue first) (default)
      return compareDates(ed1.parutionDate, ed2.parutionDate);
    });

  return (
    <GenericList
      list={list}
      emptyMsg={t("loader.edition.nodata")}
      elemGenerator={mapper}
      className={className}
    />
  );
}
