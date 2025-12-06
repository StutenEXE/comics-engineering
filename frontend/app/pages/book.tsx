import { useBookByIdQuery } from "~/store/services/api";
import type { Route } from "../+types/root";
import { EditionCard } from "~/components/cards/EditionCard";
import { IssueCard } from "~/components/cards/IssueCard";
import { createError } from "~/utils/error";
import { compareDates } from "~/utils/date";
import { PageHeaderComponent } from "~/components/headers/pageHeader";
import { PageTemplate } from "~/components/templates/pageTemplate";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Book ${params.id}` },
    { name: "description", content: `Viewing book ${params.id}` },
  ];
}

export default function BookPage({ params }: { params : { id: number}}) {
  
  const { data, isLoading, error } = useBookByIdQuery({ id: params.id });
  const book = data?.book ?? null;
  const err = createError(error)



  return (
    <PageTemplate hasImg={true} imgUrl={book?.editions[0].imgUrl} imgAlt={book?.name}>
      { isLoading && (
        <div className="flex items-center justify-center">
            <h1 className="text-3xl text-gray-500">Loading book...</h1>
        </div>
      )}
      { err && (
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-3xl text-gray-500">Error while fetching book</h1>
            <h3 className="text-xl text-red-400">
              [Code: {err.status}] { err.error }
            </h3> 
        </div>
      )}
      { (!isLoading && !error) && (
        <>
          <PageHeaderComponent title={book?.name} subtitle={`${book?.serie?.name} (#${book?.number}/${book?.serie?.nvolumes})`} 
            createdAt={book?.createdAt} modifiedAt={book?.modifiedAt} addedBy={book?.addedBy?.username} />
          <div className="flex flex-col gap-2">
            <h3 className="text-xl text-gray-200 font-semibold">Description :</h3>
            <p>
              {book?.desc}
            </p>
          </div>
          <div className="flex gap-2 flex-col">
            <h3 className="text-xl text-gray-200 font-semibold">Editions :</h3>
            <div className="flex gap-2 p-2 border border-gray-500 rounded-lg overflow-x-scroll snap-x snap-proximity">
              {  book?.editions && book.editions
                // Sort in descending order (latest edition first)
                .sort((bk1, bk2) => compareDates(bk2.parutionDate, bk2.parutionDate))
                .map((ed) => {
                return (
                  <EditionCard className="w-25 snap-center hover:bg-gray-700 pb-1 rounded-sm" 
                    key={ed.id} edition={ed} /> 
                )
              }) }
            </div>
          </div>
          <div className="flex gap-2 flex-col">
            <h3 className="text-xl text-gray-200 font-semibold">Issues :</h3>
            <div className="max-h-40 flex flex-col gap-0 p-2 border border-gray-500 rounded-lg overflow-y-scroll snap-y snap-proximity">
              { book?.issues && [...book.issues]
                // Sort in ascending order (oldest issue first)
                .sort((is1, is2) => compareDates(is1.parutionDate, is2.parutionDate))
                .map((is) => {
                  return (
                    <IssueCard className="w-25 snap-center hover:bg-gray-700 pb-1 rounded-sm" 
                      key={is.id} issue={is} /> 
                  )
                }) }
            </div>
          </div>
        </>
      )}
    </PageTemplate>
  );
}