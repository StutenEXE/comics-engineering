import { useCallback, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "~/i18n/i18n";
import type { SimpleBook } from "~/models/book";

type BookCardProps = {
  book: SimpleBook | undefined | null;
  className?: string;
};

export function BookCard({ book, className }: BookCardProps) {
  const { t } = useTranslation();

  if (!book) return null;

  return (
    <Link to={`/book/${book.id}`} className={`group block ${className}`}>
      <div className="h-full flex flex-col rounded-lg border border-white/8 bg-white/3 hover:border-indigo-500/30 hover:bg-white/5 transition-all overflow-hidden">
        {/* Cover */}
        <div className="relative overflow-hidden bg-white/5 aspect-[2/3]">
          <img
            src={book.imgUrl}
            alt={book.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Subtle gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-0.5 px-2.5 py-2">
          <p className="text-xs text-white/40 truncate">{book.serieName}</p>
          <h3 className="text-sm font-medium text-white/80 leading-snug line-clamp-2">
            {book.name}
          </h3>
          <p className="text-xs text-indigo-300/60 mt-0.5">
            {t("generic.volume", { capitalize: true })} {book.number}
          </p>
        </div>
      </div>
    </Link>
  );
}
