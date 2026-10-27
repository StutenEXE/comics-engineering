import { Link } from "react-router";
import { twMerge } from "tailwind-merge";
import { useTranslation } from "~/i18n/i18n";
import type { SimpleBook } from "~/models/book";

type CompactBookCardProps = {
  book: SimpleBook | undefined | null;
  className?: string;
};

/**
 * One line book card (small cover + name), for narrow spaces such as side panels
 */
export function CompactBookCard({ book, className }: CompactBookCardProps) {
  const { t } = useTranslation();

  if (!book) return null;

  return (
    <Link
      to={`/book/${book.id}`}
      className={twMerge(
        "group flex items-center gap-2.5 rounded-md p-1.5 hover:bg-white/5 transition-colors",
        className,
      )}
    >
      <img
        src={book.imgUrl || "/placeholder.jpg"}
        alt={book.name}
        className="w-8 aspect-[2/3] shrink-0 rounded-sm border border-white/8 object-cover"
      />
      <div className="flex flex-col min-w-0">
        <p className="text-[11px] text-white/40 truncate">{book.serieName}</p>
        <h3 className="text-xs font-medium text-white/80 truncate group-hover:text-indigo-300 transition-colors">
          {book.name}
        </h3>
        <p className="text-[11px] text-indigo-300/60">
          {t("generic.volume", { capitalize: true })} {book.number}
        </p>
      </div>
    </Link>
  );
}
