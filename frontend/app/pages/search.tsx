import { useState } from "react";
import type { Route } from "../+types/root";
import { useSearchBooksAndSeriesByNameQuery } from "~/store/services/api";
import { createError } from "~/utils/error";
import {
  simpleSerieToSerie,
  simplifySerie,
  type Serie,
  type SimpleSerie,
} from "~/models/serie";
import type { Book } from "~/models/book";
import { deepCopy } from "~/utils/object";
import { CollapsableSerieList } from "~/components/lists/serielists/CollapsableSerieList";
import { useTranslation } from "~/i18n/i18n";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Search` },
    { name: "description", content: `Search comics & series` },
  ];
}

export default function SearchPage() {
  const { t } = useTranslation();

  const [query, setQuery] = useState("");
  // Fetch data from query
  const { data, error, isLoading } = useSearchBooksAndSeriesByNameQuery({
    query,
  });
  const books = data?.books ?? [];
  const series = data?.series ?? [];
  const err = createError(error);

  const serieIds = new Set();
  // Not const because it will be modified
  let allSeries: Serie[] = [...deepCopy(series), ...deepCopy(books)]
    // Get all series contained in books
    .flatMap((el: Serie | Book) => {
      if ((el as Book).serie) {
        return (el as Book).serie;
      }
      return el as Serie;
    })
    // Filter out possibly null series (shouldn't exist but checking doesn't hurt)
    .filter((ser) => ser !== null)
    // Remove duplicates
    .filter(({ id }) => !serieIds.has(id) && serieIds.add(id))
    .map((ser) => simpleSerieToSerie(ser));

  // For each book returned by the search, we want to add it to it's serie
  books.forEach((bk) => {
    if (!bk?.serie?.id) {
      return;
    }
    // Find the book's serie only
    let ser = allSeries.find((ser) => ser.id === bk?.serie?.id);
    // We do not want to add the book to the serie if the serie already knows it
    if (ser?.books.find((bk2) => bk.id === bk2.id)) {
      return;
    }
    // Deep copy for later modification
    ser?.books.push(deepCopy(bk));
  });

  // For each serie now complete, we need to ensure that all books have a reference towards it's serie
  allSeries.forEach((ser) => {
    ser?.books.forEach((bk) => {
      bk.serieId = ser.id;
    });
  });

  const handleQueryChange = (event: any) => {
    const value = event.target.value;
    setQuery(value);
  };

  return (
    <main className="flex flex-col items-center pt-8">
      <div className="max-w-500 w-1/2 mb-4">
        <div className="w-full flex flex-col items-center">
          <div className="w-1/2 mb-4 ">
            <label htmlFor="text" className="block font-semibold mb-2">
              {t("search.header")}
            </label>
            <input
              type="text"
              id="search"
              name="search"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t("search.placeholder")}
              onChange={handleQueryChange}
            />
          </div>
          <div className="w-full flex flex-col items-center">
            {query.trim().length < 3 && <p>{t("search.atleast3chars")}</p>}
            {query.trim().length >= 3 && (
              <CollapsableSerieList
                serieList={allSeries}
                isLoading={isLoading}
                error={err}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
