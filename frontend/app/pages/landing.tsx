import { useEffect, useState } from "react";
import { BookCard } from "~/components/cards/BookCard";
import { useToast } from "~/components/toast/Toast";
import { useLatestBooksQuery } from "~/store/services/api";
import type { Route } from "../+types/root";
import { GenericButton } from "~/components/buttons/GenericButton";
import { BsArrowLeft, BsArrowLeftCircle, BsArrowRight, BsArrowRightCircle } from "react-icons/bs";
import { useTranslation } from "~/i18n/i18n";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Know Your Stash" },
    { name: "description", content: "Welcome to Know Your Stash !" },
  ];
}


const BOOKS_PER_PAGE = 3;

export default function LandingPage() {
  const { t } = useTranslation();
  
  const [page, setPage] = useState(0);
  
  // Calculate from and to based on current page
  const from = page * BOOKS_PER_PAGE;
  
  // Fetch books for current page
  const { data, error, isFetching } = useLatestBooksQuery({ from, limit: BOOKS_PER_PAGE });
  const books = data?.books ?? [];

  const handleNextPage = () => {
    setPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(0, prev - 1));
  };

  const toast = useToast()
  useEffect(() => {
    if (error === undefined || error === null) {
      return
    }
    toast.error(t("loader.book.error"))
  }, [error])

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">
          <h1 className="text-xl">{t("landing.title")}</h1>
        </header>

        {isFetching && <p className="text-gray-500">{t("loader.book.loading")}</p>}
        
        <div className="flex flex-col items-center">
          {(!isFetching && books.length > 0) ? (
            <>
              <ul className="flex gap-4">
                {books.map((book) => (
                  <BookCard className="w-50 border rounded-lg p-2 hover:bg-gray-700" 
                    key={book.id} book={book} />
                ))}
              </ul>
            </>
          ) : (
            !isFetching && <p className="text-gray-500">{t("loader.book.nodata")}</p>
          )}
          <div className="flex gap-4 justify-center mt-8">
            <GenericButton
              onClick={handlePreviousPage}
              disabled={page === 0}
            >
               <BsArrowLeft size={20} />
            </GenericButton>
            <span className="flex items-center px-4 py-2">
              Page {page + 1}
            </span>
            <GenericButton
              onClick={handleNextPage}
              disabled={books.length < BOOKS_PER_PAGE}
            >
              <BsArrowRight size={20} />
            </GenericButton>
          </div>

        </div>
      </div>
    </main>
  );
}