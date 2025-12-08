import { useIssueByIdQuery } from "~/store/services/api";
import type { Route } from "../+types/root";
import { EditionCard } from "~/components/cards/EditionCard";
import { IssueCard } from "~/components/cards/IssueCard";
import { createError } from "~/utils/error";
import { BookCard } from "~/components/cards/BookCard";
import { LinkButton } from "~/components/buttons/LinkButton";
import { dateToMonthYearString, dateToVerboseDateString } from "~/utils/date";
import { PageHeaderComponent } from "~/components/headers/pageHeader";
import { PageTemplate } from "~/components/templates/pageTemplate";
import { buildIssueShortName } from "~/models/issue";

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
    <PageTemplate>
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
          <PageHeaderComponent title={buildIssueShortName(issue)} subtitle={issue?.name} 
              createdAt={issue?.createdAt} modifiedAt={issue?.modifiedAt} addedBy={issue?.addedBy?.username} />
          <div className="flex gap-2 items-center">
            <h3 className="text-xl text-gray-200 font-semibold">Parution date :</h3>
            <p className="text-xl text-gray-200">
              {dateToVerboseDateString("en-EN", issue?.parutionDate)}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <h3 className="text-xl text-gray-200 font-semibold">Cover date :</h3>
            <p className="text-xl text-gray-200">
              {dateToMonthYearString("en-EN", issue?.coverDate)}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <h3 className="text-xl text-gray-200 font-semibold">Story :</h3>
            <p className="text-xl text-gray-200">
              {issue?.name}
            </p>
          </div>
          { issue?.hasBackup && (
            <div className="flex gap-2 items-center">
              <h3 className="text-xl text-gray-200 font-semibold">Backup story :</h3>
              <p className="text-xl text-gray-200">
                {issue?.backupName}
              </p>
            </div>
          )}
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
      <div className="mt-4 flex gap-4">
        <LinkButton
            path={`/issue_serie/${issue?.issueSerie?.id}`}
            disabled={isLoading}
        >
            Go to issue serie
        </LinkButton>
      </div>
    </PageTemplate>
  );
}