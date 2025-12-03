import { useBookByIdQuery } from "~/store/services/api";
import type { Route } from "../+types/root";
import { EditionCard } from "~/components/cards/EditionCard";
import { IssueCard } from "~/components/cards/IssueCard";
import { createError } from "~/utils/error";

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
    <main className="flex flex-col items-center pt-8">
      <div className="max-w-500 w-1/2 ">
        <div className="w-full flex gap-4 relative">
          <div className="w-2/5 pr-6">
            <img src={book?.editions[0].imgUrl ?? "/placeholder.jpg" } alt={book?.name ?? "placeholder"} />
          </div>
          <div className="w-3/5 border-l pl-6 flex flex-col gap-4">
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
                <div>
                  <h1 className="text-3xl font-bold">{book?.name}</h1>
                  <h3 className="text-xl text-gray-400 italic">
                    {book?.serie?.name} (#{book?.number}/{book?.serie?.nvolumes})
                  </h3> 
                </div>
                <div className="-mt-2 -mb-2 flex justify-end items-center gap-2">
                  <p className="text-xs">
                      Added by <b>{book?.addedBy?.username}</b> the <b>{book?.createdAt.toLocaleDateString("fr")}</b>
                  </p>
                  <p className="text-xs">
                      Last modification : <b>{book?.modifiedAt.toLocaleDateString("fr")}</b>
                  </p>
                </div> 
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl text-gray-200 font-semibold">Description :</h3>
                  <p>
                    {book?.desc}
                  </p>
                </div>
                <div className="flex gap-2 flex-col">
                  <h3 className="text-xl text-gray-200 font-semibold">Editions :</h3>
                  <div className="flex gap-2 p-2 border border-gray-500 rounded-lg overflow-hidden snap-x snap-proximity">
                    {  book?.editions?.map((ed) => {
                      return (
                        <EditionCard className="w-25 snap-center hover:bg-gray-700 pb-1 rounded-sm" 
                          key={ed.id} edition={ed} /> 
                      )
                    })
                  }
                  </div>
                </div>
                <div className="flex gap-2 flex-col">
                  <h3 className="text-xl text-gray-200 font-semibold">Issues :</h3>
                  <div className="flex flex-col gap-0 p-2 border border-gray-500 rounded-lg overflow-hidden snap-y snap-proximity">
                    {  book?.issues?.map((is) => {
                      return (
                        <IssueCard className="w-25 snap-center hover:bg-gray-700 pb-1 rounded-sm" 
                          key={is.id} issue={is} /> 
                      )
                    }) }
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}