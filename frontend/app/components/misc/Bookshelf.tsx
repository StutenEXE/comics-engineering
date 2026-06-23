import { useTranslation } from "~/i18n/i18n";
import type { OwnedEdition } from "~/models/ownedEdition";

interface BookshelfProps {
  oeditions?: OwnedEdition[];
  isLoading?: boolean;
}

export function Bookshelf({
  oeditions = [],
  isLoading = false,
}: BookshelfProps) {
  const { locale } = useTranslation();
  // Regroup by series (series sorted by ascending name)
  const sortedEditions = [...oeditions].sort((a, b) => {
    if (!a?.edition?.serie?.name) {
      return -1;
    }
    if (!b?.edition?.serie?.name) {
      return 1;
    }
    const serieComp = a?.edition?.serie?.name.localeCompare(
      b?.edition?.serie?.name,
    );
    if (serieComp !== 0) {
      return serieComp;
    }
    // If same serie, compare on vol number
    return a?.edition?.book?.number! - b?.edition?.book?.number!;
  });

  console.log(sortedEditions.map((e) => e.edition.book?.name));

  return (
    <div className="flex flex-wrap w-full items-end border-10 border-orange-900 border-t-0">
      {sortedEditions.map((oe) => (
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
