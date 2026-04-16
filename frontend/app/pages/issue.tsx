import { useIssueByIdQuery } from "~/store/services/api";
import type { Route } from "../+types/root";
import { createError } from "~/utils/error";
import { dateToMonthYearString, dateToVerboseDateString } from "~/utils/date";
import { PageHeaderComponent } from "~/components/headers/PageHeader";
import { PageTemplate } from "~/components/templates/PageTemplate";
import { buildIssueShortName } from "~/models/issue";
import { BookList } from "~/components/lists/booklists/BookList";
import type { Link } from "~/components/lists/LinkButtonList";

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

  const links: Link[] = [
    { name: "Go to issue serie", path: `/issue_serie/${issue?.issueSerie?.id}`, disabled: isLoading },
  ]

  return (
    <PageTemplate links={links}>
      { isLoading && (
        <div className="flex items-center justify-center">
            <h1 className="text-3xl text-gray-500">Loading issue...</h1>
        </div>
      )}
      { err && (
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-3xl text-gray-500">Error while fetching issue</h1>
            <h3 className="text-xl text-red-400">
              [Code: {err.status}] { err.details.message }
            </h3> 
        </div>
      )}
      { (!isLoading && !error) && (
        <>
          <PageHeaderComponent headerTitle="Issue" title={buildIssueShortName(issue)} subtitle={issue?.name} 
            createdAt={issue?.createdAt} modifiedAt={issue?.modifiedAt} addedBy={issue?.addedBy?.username} 
            links={links}
          />
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
            <h3 className="text-xl text-gray-200 font-semibold">Story&nbsp;:</h3>
            <p className="text-xl text-gray-200">
              {issue?.name}
            </p>
          </div>
          <div className="flex gap-2 flex-col">
            <h3 className="text-xl text-gray-200 font-semibold">Books :</h3>
            <BookList bookList={issue?.books} className="border border-gray-500 rounded-lg"/>
          </div>
        </>
      )}
    </PageTemplate>
  );
}