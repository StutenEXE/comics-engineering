import { useBookByIdQuery } from "~/store/services/api";
import type { Route } from "../+types/root";
import { EditionCard } from "~/components/cards/EditionCard";
import { createError } from "~/utils/error";
import { compareDates } from "~/utils/date";
import { PageHeaderComponent } from "~/components/headers/PageHeader";
import { PageTemplate } from "~/components/templates/PageTemplate";
import { IssueList } from "~/components/lists/IssueList";
import { BookList } from "~/components/lists/BookList";
import { EditionList } from "~/components/lists/EditionList";

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
          <PageHeaderComponent headerTitle="Book" title={book?.name} subtitle={`${book?.serie?.name} (#${book?.number}/${book?.serie?.nvolumes})`} 
            createdAt={book?.createdAt} modifiedAt={book?.modifiedAt} addedBy={book?.addedBy?.username} />
          <div className="flex flex-col gap-2">
            <h3 className="text-xl text-gray-200 font-semibold">Description :</h3>
            <p>
              {book?.desc}
            </p>
          </div>
          <div className="flex gap-2 flex-col">
            <h3 className="text-xl text-gray-200 font-semibold">Editions :</h3>
            <EditionList editionList={book?.editions} className="border border-gray-500 rounded-lg"/>
          </div>
          <div className="flex gap-2 flex-col">
            <h3 className="text-xl text-gray-200 font-semibold">Issues :</h3>
              <IssueList issueList={book?.issues} className="border border-gray-500 rounded-lg" />
          </div>
        </>
      )}
    </PageTemplate>
  );
}