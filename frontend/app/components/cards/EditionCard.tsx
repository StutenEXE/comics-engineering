import { useCallback, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "~/i18n/i18n";
import type { SimpleEdition } from "~/models/edition";

type EditionCardProps = {
  edition: SimpleEdition | undefined | null;
  className?: string;
};

export function EditionCard({ edition, className }: EditionCardProps) {
  const { locale } = useTranslation();

  if (!edition) return null;

  return (
    <Link to={`/edition/${edition.id}`} className={`group block ${className}`}>
      <div className="h-full flex flex-col rounded-lg border border-white/8 bg-white/3 hover:border-indigo-500/30 hover:bg-white/5 transition-all overflow-hidden">
        {/* Cover */}
        <div className="relative overflow-hidden bg-white/5 aspect-[2/3]">
          <img
            src={edition.imgUrl}
            alt={`${edition.publisherName}-${edition.parutionDate.getFullYear()}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-0.5 px-2.5 py-2">
          <h3 className="text-sm font-medium text-white/80 truncate">
            {edition.publisherName}
          </h3>
          <p className="text-xs text-indigo-300/60">
            {edition.parutionDate.toLocaleDateString(locale)}
          </p>
        </div>
      </div>
    </Link>
  );
}
