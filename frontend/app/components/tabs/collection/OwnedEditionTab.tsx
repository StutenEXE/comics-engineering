import { OwnedEditionTable } from "~/components/tables/OwnedEditionTable";
import type { OwnedEdition } from "~/models/ownedEdition";

interface OwnedEditionTabProps {
  ownedEditions: OwnedEdition[];
}

export function OwnedEditionTab({ ownedEditions }: OwnedEditionTabProps) {
  return (
    <div className="space-y-2">
      {/* {ownedEd?.map((oe) => (
            <div key={oe.id} className="flex flex-row items-center gap-4 p-3 border rounded dark:border-gray-700">
              <img
                src={oe.edition.imgUrl}
                alt={oe.edition.book?.name}
                className="w-16 h-24 object-cover rounded flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{oe.edition.book?.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{oe.edition.serie?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">{oe.edition.publisher?.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-600">{oe.edition.isbn}</p>
              </div>
            </div>
          ))} */}
      <OwnedEditionTable editionList={ownedEditions}></OwnedEditionTable>
    </div>
  );
}
