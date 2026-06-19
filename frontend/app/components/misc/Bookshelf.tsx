import { useState } from "react";
import { twMerge } from "tailwind-merge";
import type { OwnedEdition } from "~/models/ownedEdition";

interface BookshelfProps {
  oeditions?: OwnedEdition[];
  isLoading?: boolean;
}

export function Bookshelf({
  oeditions = [],
  isLoading = false,
}: BookshelfProps) {
  const [spineColorById, setSpineColorById] = useState<Map<number, string>>(
    new Map(),
  );

  //   oeditions.forEach((oe) => {
  //     getBookSpineColor(oe.edition.imgUrl).then((col) =>
  //       spineColorById.set(oe.id, col),
  //     );
  //   });

  return (
    <div className="flex flex-wrap w-full items-end border-10 border-orange-900 border-t-0">
      {oeditions.map((oe) => (
        <div
          key={oe.id}
          className={
            "min-h-fit flex flex-col gap-1 justify-end items-center py-1 border border-white text-white text-xs cursor-pointer hover:scale-102"
          }
          style={{
            width: `${oe.edition.dimensions.thickness * 10}px`,
            height: `${oe.edition.dimensions.height * 10}px`,
            backgroundImage: oe.edition.imgUrl,
          }}
        >
          <div className="h-[80%] w-full flex justify-center items-center">
            <span className="-rotate-90 whitespace-nowrap">
              {oe.edition.book?.name}
            </span>
          </div>
          <div className="h-[20%] w-full flex items-end justify-center font-bold">
            <span>{oe.edition.book?.number}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
