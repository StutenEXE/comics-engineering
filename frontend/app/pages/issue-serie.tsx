import { useIssueSerieByIdQuery } from "~/store/services/api";
import type { Route } from "../+types/root";
import { createError } from "~/utils/error";
import { BookCard } from "~/components/cards/BookCard";
import { compareDates, dateToMonthYearString, dateToVerboseDateString } from "~/utils/date";
import { IssueCard } from "~/components/cards/IssueCard";
import type { Book } from "~/models/book";
import { PageHeaderComponent } from "~/components/headers/PageHeader";
import { PageTemplate } from "~/components/templates/PageTemplate";
import { IssueList } from "~/components/lists/issuelists/IssueList";
import { BookList } from "~/components/lists/booklists/BookList";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Issue Serie ${params.id}` },
    { name: "description", content: `Viewing issue serie ${params.id}` },
  ];
}

export default function IssueSeriePage({ params }: { params : { id: number}}) {
  
  const { data, isLoading, error } = useIssueSerieByIdQuery({ id: params.id, withIssues: true, withUser: true });
  const issueSerie = data?.issueSerie ?? null;
  const err = createError(error)

  // Remove duplicate books by id
  const ids = new Set();
  const books: Book[] | undefined = issueSerie?.issues.flatMap(is => is.books)
    .filter(({ id }) => !ids.has(id) && ids.add(id))

  let subtitle = dateToMonthYearString("en-EN", issueSerie?.voStart)
  if (!issueSerie?.voEnd) { subtitle += " - Present" }
  else if (issueSerie?.voStart.getTime() === issueSerie?.voEnd.getTime()) {
    subtitle += " (Oneshot)"
  }
  else {
    subtitle += ` - ${dateToMonthYearString("en-EN", issueSerie?.voEnd)}`
  }

  return (
    <PageTemplate hasImg={false}>
      { isLoading && (
        <div className="flex items-center justify-center">
            <h1 className="text-3xl text-gray-500">Loading issue...</h1>
        </div>
      )}
      { err && (
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-3xl text-gray-500">Error while fetching issue</h1>
            <h3 className="text-xl text-red-400">
              [Code: {err.status}] { err.error }
            </h3> 
        </div>
      )}
      { (!isLoading && !error) && (
        <>
          <PageHeaderComponent headerTitle="Issue Serie" title={issueSerie?.name} subtitle={subtitle} 
            createdAt={issueSerie?.createdAt} modifiedAt={issueSerie?.modifiedAt} addedBy={issueSerie?.addedBy?.username} />
          <div className="flex flex-col gap-2">
            <h3 className="text-xl text-gray-200 font-semibold">Description :</h3>
            <p>
              {issueSerie?.desc}
            </p>
          </div>
          <div className="flex gap-2 flex-col">
            <h3 className="text-xl text-gray-200 font-semibold">Issues :</h3>
              <IssueList issueList={
                issueSerie?.issues.map((is) => {
                  // Since issueSerie is read-only, it's children are too,  nd we need to have a defined issueSerie here
                  // it is not sent back by the API (infinite loops in this case)
                  return {
                    ...is,
                    issueSerie: {...issueSerie}
                  }
              })} className="border border-gray-500 rounded-lg"/>
          </div>
          <div className="flex gap-2 flex-col">
            <h3 className="text-xl text-gray-200 font-semibold">Books :</h3>
            <BookList bookList={books} className="border border-gray-500 rounded-lg"/>
          </div>
        </>
      )}
    </PageTemplate>
  );
}