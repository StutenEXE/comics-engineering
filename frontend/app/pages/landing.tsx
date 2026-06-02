import { useEffect, useState } from "react";
import { BookCard } from "~/components/cards/BookCard";
import { useToast } from "~/components/toast/Toast";
import { useLatestBooksQuery } from "~/store/services/api";
import type { Route } from "../+types/root";
import { GenericButton } from "~/components/buttons/GenericButton";
import {
  BsArrowLeft,
  BsArrowLeftCircle,
  BsArrowRight,
  BsArrowRightCircle,
} from "react-icons/bs";
import { useTranslation } from "~/i18n/i18n";
import { GenericPageTemplate } from "~/components/templates/GenericPageTemplate";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Know Your Stash" },
    { name: "description", content: "Welcome to Know Your Stash !" },
  ];
}

const BOOKS_PER_PAGE = 12;

export default function LandingPage() {
  const { t } = useTranslation();

  const [page, setPage] = useState(0);
  const from = page * BOOKS_PER_PAGE;

  const { data, error, isFetching } = useLatestBooksQuery({
    from,
    limit: BOOKS_PER_PAGE,
  });
  const books = data?.books ?? [];

  const toast = useToast();
  useEffect(() => {
    if (!error) return;
    toast.error(t("loader.book.error"));
  }, [error]);

  return (
    <GenericPageTemplate>
      {/* Hero */}
      <div className="flex flex-col items-center gap-3 text-center max-w-lg">
        <h1 className="text-3xl font-semibold text-white/90">
          {t("landing.title")}
        </h1>
        <p className="text-sm text-white/40">{t("landing.subtitle")}</p>
      </div>

      {/* Grid */}
      <div className="w-full max-w-5xl flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-widest text-white/40">
            {t("landing.latestBooks")}
          </span>
          <span className="text-xs text-white/25">
            {t("landing.page")} {page + 1}
          </span>
        </div>

        {/* Loading */}
        {isFetching && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {Array.from({ length: BOOKS_PER_PAGE }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] rounded-lg bg-white/5 border border-white/8 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Books */}
        {!isFetching && books.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!isFetching && books.length === 0 && (
          <div className="flex items-center justify-center py-24 border border-white/8 rounded-lg">
            <p className="text-sm text-white/25 italic">
              {t("book.nonefound")}
            </p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <GenericButton
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80 disabled:opacity-20 disabled:cursor-not-allowed px-4 py-2 rounded-md transition-all"
          >
            <BsArrowLeft size={16} />
          </GenericButton>

          <span className="text-xs text-white/30 tabular-nums min-w-16 text-center">
            {t("landing.page")} {page + 1}
          </span>

          <GenericButton
            onClick={() => setPage((p) => p + 1)}
            disabled={books.length < BOOKS_PER_PAGE}
            className="bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80 disabled:opacity-20 disabled:cursor-not-allowed px-4 py-2 rounded-md transition-all"
          >
            <BsArrowRight size={16} />
          </GenericButton>
        </div>
      </div>
    </GenericPageTemplate>
  );
}
