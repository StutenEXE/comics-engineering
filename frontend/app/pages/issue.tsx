import { useIssueByIdQuery } from "~/store/services/api";
import type { Route } from "../+types/root";
import { EditionCard } from "~/components/cards/EditionCard";
import { IssueCard } from "~/components/cards/IssueCard";
import { createError } from "~/utils/error";
import { BookCard } from "~/components/cards/BookCard";
import { LinkButton } from "~/components/buttons/LinkButton";
import { dateToVerboseDateString } from "~/utils/date";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Issue ${params.id}` },
    { name: "description", content: `Viewing issue ${params.id}` },
  ];
}

export default function IssuePage({ params }: { params : { id: number}}) {
  
  const { data, isLoading, error } = useIssueByIdQuery({ id: params.id });
  const issue = data?.issue ?? null;
  const err = createError(error)



  return (
    <main className="flex flex-col items-center pt-8">
      <div className="max-w-500 w-1/2 ">
        <div className="w-full flex flex-col gap-4 relative items-center">
          <div className="w-3/5 pl-6 flex flex-col gap-4">
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
                <div>
                  <h1 className="text-3xl font-bold">{issue?.name}</h1>
                  <h3 className="text-xl text-gray-400 italic">
                    {issue?.issueSerie?.name}
                  </h3> 
                </div>
                <div className="-mt-2 -mb-2 flex justify-end items-center gap-2">
                  <p className="text-xs">
                      Added by <b>{issue?.addedBy?.username}</b> the <b>{issue?.createdAt.toLocaleDateString("fr")}</b>
                  </p>
                  <p className="text-xs">
                      Last modification : <b>{issue?.modifiedAt.toLocaleDateString("fr")}</b>
                  </p>
                </div> 
                <div className="flex gap-2 items-center">
                  <h3 className="text-xl text-gray-200 font-semibold">Parution date :</h3>
                  <p className="text-xl text-gray-200">
                    {dateToVerboseDateString("en-EN", issue?.parutionDate)}
                  </p>
                </div>
                <div className="flex gap-2 flex-col">
                  <h3 className="text-xl text-gray-200 font-semibold">Books :</h3>
                  <div className="flex gap-2 p-2 border border-gray-500 rounded-lg overflow-hidden snap-x snap-proximity">
                    {  issue?.books?.map((bk) => {
                      return (
                        <BookCard className="w-25 snap-center hover:bg-gray-700 pb-1 rounded-sm" 
                          key={bk.id} book={bk} /> 
                      )
                    })
                  }
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="w-3/5 ml-11 flex gap-4">
            <LinkButton
                path={`/issue_serie/${issue?.issueSerie?.id}`}
                disabled={isLoading}
            >
                Go to issue serie
            </LinkButton>
          </div>
        </div>
      </div>
    </main>
  );
}