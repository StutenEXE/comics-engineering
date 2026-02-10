import { useSerieByIdQuery } from "~/store/services/api";
import type { Route } from "../+types/root";
import { createError } from "~/utils/error";
import { PageHeaderComponent } from "~/components/headers/PageHeader";
import { PageTemplate } from "~/components/templates/PageTemplate";
import { IssueList } from "~/components/lists/issuelists/IssueList";
import { BookList } from "~/components/lists/booklists/BookList";
import { dateToMonthYearString } from "~/utils/date";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Serie ${params.id}` },
    { name: "description", content: `Viewing serie ${params.id}` },
  ];
}

export default function IssueSeriePage({ params }: { params : { id: number}}) {
  
  const { data, isLoading, error } = useSerieByIdQuery({ id: params.id });
  const serie = data?.serie ?? null;
  const err = createError(error)

  let subtitle = dateToMonthYearString("en-EN", serie?.voStart)
    if (!serie?.voEnd && serie?.ongoing) { subtitle += " - Present" }
    else if (serie?.oneshot) {
      subtitle += " (Oneshot)"
    }
    else {
      subtitle += ` - ${dateToMonthYearString("en-EN", serie?.voEnd)}`
    }

  return (
    <PageTemplate hasImg={false}>
      { isLoading && (
        <div className="flex items-center justify-center">
            <h1 className="text-3xl text-gray-500">Loading serie...</h1>
        </div>
      )}
      { err && (
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-3xl text-gray-500">Error while fetching serie</h1>
            <h3 className="text-xl text-red-400">
              [Code: {err.status}] { err.details.message }
            </h3> 
        </div>
      )}
      { (!isLoading && !error) && (
        <>
          <PageHeaderComponent headerTitle="Issue Serie" title={serie?.name} subtitle={subtitle} 
            createdAt={serie?.createdAt} modifiedAt={serie?.modifiedAt} addedBy={serie?.addedBy?.username} />
          <div className="flex gap-2 flex-col">
            <h3 className="text-xl text-gray-200 font-semibold">Books ({serie?.books.length}/{serie?.ongoing ? "?" : serie?.nvolumes}) :</h3>
            <BookList bookList={serie?.books.map((bk) => {
                  // Since serie is read-only, it's children are too, and we need to have a defined serie here
                  // it is not sent back by the API (infinite loops in this case)
                  return {
                    ...bk,
                    serie: {...serie}
                  }
              })} className="border border-gray-500 rounded-lg"/>
          </div>
        </>
      )}
    </PageTemplate>
  );
}