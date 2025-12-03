import { useEditionByIdQuery } from "~/store/services/api";
import type { Route } from "../+types/root";
import { createError } from "~/utils/error";
import { GenericButton } from "~/components/buttons/GenericButton";
import { useNavigate } from "react-router";
import { LinkButton } from "~/components/buttons/LinkButton";

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

  const navigate = useNavigate()
  const gotoBook = () => {
    navigate(`/book/${edition?.book?.id}`);
  }

  const gotoPublisher = () => {
    navigate(`/publisher/${edition?.publisher?.id}`);
  }

  return (
    <main className="flex flex-col items-center pt-8">
      <div className="max-w-500 w-1/2 ">
        <div className="w-full flex gap-4 relative">
          <div className="w-2/5 pr-6">
            <img src={edition?.imgUrl ?? "/placeholder.jpg" } alt={edition?.book?.name ?? "placeholder"} />
          </div>
          <div className="w-3/5 border-l pl-6 flex flex-col gap-4">
            { isLoading && (
              <div className="flex items-center justify-center">
                  <h1 className="text-3xl text-gray-500">Loading edition...</h1>
              </div>
            )}
            { err && (
              <div className="flex flex-col items-center justify-center">
                  <h1 className="text-3xl text-gray-500">Error while fetching edition</h1>
                  <h3 className="text-xl text-red-400">
                    [Code: {err.status}] { err.error }
                  </h3> 
              </div>
            )}
            { (!isLoading && !error) && (<>
                <div>
                  <h1 className="text-3xl font-bold">{edition?.book?.name}</h1>
                  <h3 className="text-xl text-gray-400 italic">
                    {edition?.book?.serie?.name} (#{edition?.book?.number}/{edition?.book?.serie?.nvolumes})
                  </h3> 
                </div>
                <div className="-mt-2 -mb-2 flex justify-end items-center gap-2">
                  <p className="text-xs">
                      Added by <b>{edition?.addedBy?.username}</b> the <b>{edition?.createdAt.toLocaleDateString("fr")}</b>
                  </p>
                  <p className="text-xs">
                      Last modification : <b>{edition?.modifiedAt.toLocaleDateString("fr")}</b>
                  </p>
                </div> 
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
                  <h3 className="text-xl text-gray-200 font-semibold">Price :</h3>
                  <p className="text-xl text-gray-200">
                    {edition?.price} €
                  </p>
                </div>
              </>)
            }
          </div>
        </div>
        <div className="mt-4 flex gap-4">
            <LinkButton 
                onClick={gotoBook}
                disabled={isLoading}
            >
                Go to book
            </LinkButton>
            <LinkButton 
                onClick={gotoPublisher}
                disabled={isLoading}
            >
                Go to publisher
            </LinkButton>
        </div>
      </div>
    </main>
  );
}