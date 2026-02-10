import { useEditionByIdQuery } from "~/store/services/api";
import type { Route } from "../+types/root";
import { createError } from "~/utils/error";
import { LinkButton } from "~/components/buttons/LinkButton";
import { PageTemplate } from "~/components/templates/PageTemplate";
import { PageHeaderComponent } from "~/components/headers/PageHeader";
import type { Link } from "~/components/lists/LinkButtonList";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Edition ${params.id}` },
    { name: "description", content: `Viewing edition ${params.id}` },
  ];
}

export default function EditionPage({ params }: { params : { id: number}}) {
  
  const { data, isLoading, error } = useEditionByIdQuery({ id: params.id });
  const edition = data?.edition ?? null;
  const err = createError(error)

  const links: Link[] = [
    { name: "Go to book", path: `/book/${edition?.book?.id}`, disabled: isLoading },
    { name: "Go to publisher", path: `/publisher/${edition?.publisher?.id}`, disabled: isLoading },
  ]

  return (
    <PageTemplate hasImg={true} imgUrl={edition?.imgUrl} imgAlt={edition?.book?.name} links={links}>  
      { isLoading && (
        <div className="flex items-center justify-center">
            <h1 className="text-3xl text-gray-500">Loading edition...</h1>
        </div>
      )}
      { err && (
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-3xl text-gray-500">Error while fetching edition</h1>
            <h3 className="text-xl text-red-400">
              [Code: {err.status}] { err.details.message }
            </h3> 
        </div>
      )}
      { (!isLoading && !error) && (
        <>
          <PageHeaderComponent headerTitle="Edition" title={edition?.book?.name} 
            subtitle={`${edition?.book?.serie?.name}  (#${edition?.book?.number}/${edition?.book?.serie?.nvolumes})`} 
            createdAt={edition?.createdAt} modifiedAt={edition?.modifiedAt} addedBy={edition?.addedBy?.username} 
            links={links}
          />
          <div className="flex gap-2 items-center">
            <h3 className="text-xl text-gray-200 font-semibold">EAN :</h3>
            <p className="text-xl text-gray-200">
              {edition?.ean}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <h3 className="text-xl text-gray-200 font-semibold">ISBN :</h3>
            <p className="text-xl text-gray-200">
              {edition?.isbn}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <h3 className="text-xl text-gray-200 font-semibold">Publisher :</h3>
            <p className="text-xl text-gray-200">
              {edition?.publisher?.name}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <h3 className="text-xl text-gray-200 font-semibold">Link :</h3>
            <a href={edition?.url} className="text-xl text-blue-400 hover:underline">
              {edition?.book?.name}
            </a>
          </div>
          <div className="flex gap-2 items-center">
            <h3 className="text-xl text-gray-200 font-semibold">Cover Type :</h3>
            <p className="text-xl text-gray-200"> 
              {edition?.coverType}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <h3 className="text-xl text-gray-200 font-semibold">Parution date :</h3>
            <p className="text-xl text-gray-200">
              {edition?.parutionDate.toLocaleDateString("fr")}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <h3 className="text-xl text-gray-200 font-semibold">Price :</h3>
            <p className="text-xl text-gray-200">
              {edition?.price.toPrecision(4)} €
            </p>
          </div>
        </>
      )}
    </PageTemplate>
  );
}