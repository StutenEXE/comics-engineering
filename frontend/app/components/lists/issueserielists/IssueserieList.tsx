import { SerieCard } from "~/components/cards/SerieCard";
import { useTranslation } from "~/i18n/i18n";
import {
  isIssueSerie,
  simplifyIssueSerie,
  type IssueSerie,
  type SimpleIssueSerie,
} from "~/models/issue-serie";
import { type SimpleSerie } from "~/models/serie";
import type { Error } from "~/utils/error";
import { GenericList } from "../GenericList";
import { IssueSerieCard } from "~/components/cards/IssueSerieCard";

interface IssueserieListProps {
  issueserieList?: IssueSerie[] | SimpleIssueSerie[];
  isLoading?: boolean;
  error?: Error;
  className?: string;
}

export function IssueserieList({
  issueserieList,
  isLoading,
  error,
  className,
}: IssueserieListProps) {
  const { t } = useTranslation();

  const mapper = (is: SimpleIssueSerie) => (
    <IssueSerieCard
      className="w-[100%] snap-center hover:bg-gray-700 pb-1 rounded-sm"
      key={is?.id}
      issueserie={is}
    />
  );

  const list =
    !issueserieList || issueserieList.length === 0
      ? []
      : !isIssueSerie(issueserieList[0])
        ? (issueserieList as SimpleIssueSerie[])
        : (issueserieList as IssueSerie[]).map(simplifyIssueSerie);

  return (
    <>
      <GenericList
        list={list}
        emptyMsg={t("issueserie.nonefound")}
        elemGenerator={mapper}
        vertical
        isLoading={isLoading}
        className={className}
      />
    </>
  );
}
