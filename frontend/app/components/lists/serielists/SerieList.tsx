import { compareDates } from "~/utils/date";
import { GenericList } from "../GenericList";
import type { Error } from "~/utils/error";
import { useTranslation } from "~/i18n/i18n";
import {
  isSerie,
  simplifySerie,
  type Serie,
  type SimpleSerie,
} from "~/models/serie";
import { SerieCard } from "~/components/cards/SerieCard";

interface SerieListProps {
  serieList: Serie[] | SimpleSerie[] | null | undefined;
  isLoading?: boolean;
  error?: Error;
  className?: string;
}

export function SerieList({
  serieList,
  isLoading,
  error,
  className,
}: SerieListProps) {
  const { t } = useTranslation();

  const mapper = (s: SimpleSerie) => (
    <SerieCard
      className="w-[100%] snap-center hover:bg-gray-700 pb-1 rounded-sm"
      key={s?.id}
      serie={s}
    />
  );

  const list =
    !serieList || serieList.length === 0
      ? []
      : !isSerie(serieList[0])
        ? (serieList as SimpleSerie[])
        : (serieList as Serie[]).map(simplifySerie);

  return (
    <>
      <GenericList
        list={list}
        emptyMsg={t("serie.nonefound")}
        elemGenerator={mapper}
        vertical
        isLoading={isLoading}
        className={className}
      />
    </>
  );
}
