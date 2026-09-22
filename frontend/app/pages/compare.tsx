import { SearchInput } from "app/components/inputs/SearchInput";
import { useState } from "react";
import { useSearchParams } from "react-router";
import {
  Comparator,
  type Comparable,
} from "~/components/comparators/Comparator.js";
import { GenericPageTemplate } from "~/components/templates/GenericPageTemplate";
import { useTranslation } from "~/i18n/i18n.js";
import { type Book } from "~/models/book.js";
import type { Edition } from "~/models/edition.js";
import type { IssueSerie } from "~/models/issue-serie.js";
import type { Issue } from "~/models/issue.js";
import type { Serie } from "~/models/serie.js";
import { useLazySearchBooksSeriesIssuesIssueseriesByNameQuery } from "~/store/services/api.js";
import { toDDmmYYYY } from "~/utils/date.js";
import type { Route } from "./+types/compare";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Comparator` },
    { name: "description", content: `Compare items` },
  ];
}

export default function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const itA = searchParams.get("itemA");
  const itB = searchParams.get("itemB");

  const [search, { data, isFetching, error }] =
    useLazySearchBooksSeriesIssuesIssueseriesByNameQuery();

  const triggerSearch = (query: string) => {
    search({ query });
  };

  const noData =
    (data?.books.length ?? 0) +
      (data?.series.length ?? 0) +
      (data?.issues.length ?? 0) +
      (data?.issueseries.length ?? 0) ===
    0;

  type SearchResultItem =
    | { type: "book"; data: Book }
    | { type: "serie"; data: Serie }
    | { type: "issue"; data: Issue }
    | { type: "issueserie"; data: IssueSerie };

  const allData: SearchResultItem[] = [
    ...(data?.books ?? []).map(
      (bk): SearchResultItem => ({
        type: "book",
        data: bk,
      }),
    ),
    ...(data?.series ?? []).map(
      (se): SearchResultItem => ({
        type: "serie",
        data: se,
      }),
    ),
    ...(data?.issues ?? []).map(
      (is): SearchResultItem => ({
        type: "issue",
        data: is,
      }),
    ),
    ...(data?.issueseries ?? []).map(
      (iss): SearchResultItem => ({
        type: "issueserie",
        data: iss,
      }),
    ),
  ].sort((a, b) => a.data.name.length - b.data.name.length);

  const [itemA, setItemA] = useState<Comparable | undefined>(undefined);
  const [itemB, setItemB] = useState<Comparable | undefined>(undefined);

  return (
    <GenericPageTemplate>
      <div className="grid grid-cols-2">
        <SearchInput triggerSearch={triggerSearch} />
        <div className="max-h-100 border border-white/40 rounded-md overflow-y-auto">
          {allData.map((obj) => {
            switch (obj.type) {
              case "book":
                return (
                  <BookRow
                    bk={obj.data}
                    setItemA={setItemA}
                    setItemB={setItemB}
                    aPresent={itemA !== undefined}
                    bPresent={itemB !== undefined}
                  />
                );
              case "serie":
                return (
                  <SerieRow
                    ser={obj.data}
                    setItemA={setItemA}
                    setItemB={setItemB}
                    aPresent={itemA !== undefined}
                    bPresent={itemB !== undefined}
                  />
                );
            }
          })}
        </div>
      </div>
      <Comparator
        itemA={itemA}
        itemB={itemB}
        removeItemA={() => setItemA(undefined)}
        removeItemB={() => setItemB(undefined)}
      />
    </GenericPageTemplate>
  );
}

type BaseRowProps = {
  setItemA: (item: Comparable) => void;
  setItemB: (item: Comparable) => void;
  aPresent: boolean;
  bPresent: boolean;
};

function EditionRow({
  ed,
  setItemA,
  setItemB,
  aPresent,
  bPresent,
}: BaseRowProps & { ed: Edition }) {
  const { t, locale } = useTranslation();

  const label = `${ed.book?.name} (${toDDmmYYYY(ed.parutionDate, locale)})`;

  const item: Comparable = {
    label: label,
    data: ed,
    type: "edition",
  };
  return (
    <Row
      item={item}
      type={t("edition")}
      label={label}
      setItemA={setItemA}
      setItemB={setItemB}
      aPresent={aPresent}
      bPresent={bPresent}
    />
  );
}

function BookRow({
  bk,
  setItemA,
  setItemB,
  aPresent,
  bPresent,
}: BaseRowProps & { bk: Book }) {
  const { t } = useTranslation();

  const volNumber = bk.serie?.oneshot
    ? ""
    : `${bk.number}/${bk.serie?.nvolumes}`;
  const label = `${bk.name}  - ${bk.serie?.name} (${volNumber})`;

  const item: Comparable = {
    label: label,
    data: bk,
    type: "book",
  };
  return (
    <Row
      item={item}
      type={t("book")}
      label={label}
      setItemA={setItemA}
      setItemB={setItemB}
      aPresent={aPresent}
      bPresent={bPresent}
    />
  );
}

function SerieRow({
  ser,
  setItemA,
  setItemB,
  aPresent,
  bPresent,
}: BaseRowProps & { ser: Serie }) {
  const { t } = useTranslation();

  const label = `${ser.name}`;

  const item: Comparable = {
    label: label,
    data: ser,
    type: "serie",
  };
  return (
    <Row
      item={item}
      type={t("serie")}
      label={label}
      setItemA={setItemA}
      setItemB={setItemB}
      aPresent={aPresent}
      bPresent={bPresent}
    />
  );
}

function Row({
  item,
  type,
  label,
  setItemA,
  setItemB,
  aPresent,
  bPresent,
}: BaseRowProps & { item: Comparable; type: string; label: string }) {
  return (
    <div className="w-full py-1 text-sm grid grid-cols-16 text-xs border-b border-white/40 items-center hover:bg-white/10">
      <span className="col-span-2 flex justify-center text-white/30 border-r border-white/40">
        {type}
      </span>
      <span className="col-span-10 px-2 truncate">{label}</span>
      <div className="col-span-4 px-1 flex justify-between items-center border-l border-white/40">
        <button
          onClick={() => setItemA(item)}
          className="px-1 py-0.5 bg-blue-600/50 border border-blue-500/50 hover:bg-blue-400/50 rounded cursor-pointer"
        >
          {aPresent ? "Replace A" : "Set as A"}
        </button>
        <button
          onClick={() => setItemB(item)}
          className="px-1 py-0.5 bg-blue-600/50 border border-blue-500/50 hover:bg-blue-400/50 rounded cursor-pointer"
        >
          {bPresent ? "Replace B" : "Set as B"}
        </button>
      </div>
    </div>
  );
}
