import { useEffect, useState } from "react";
import { BookCard } from "~/components/cards/BookCard";
import { useToast } from "~/components/toast/toast";
import { useLatestBooksQuery } from "~/store/services/api";
import type { Route } from "../+types/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Know Your Stash" },
    { name: "description", content: "Welcome to Know Your Stash !" },
  ];
}


const BOOKS_PER_PAGE = 3;

export default function LandingPage() {
  const [page, setPage] = useState(0);
  
  // Calculate from and to based on current page
  const from = page * BOOKS_PER_PAGE;
  
  // Fetch books for current page
  const { data, isLoading, error } = useLatestBooksQuery({ from, limit: BOOKS_PER_PAGE });
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
    toast.error("Error while loading books")
  }, [error])

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">
          <h1 className="text-xl">Latest additions our library</h1>
        </header>
        
        {isLoading && <p className="text-gray-500">Loading books...</p>}
        
        <div className="flex flex-col items-center">
          {books.length > 0 ? (
            <>
              <ul className="flex gap-4">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </ul>
            </>
          ) : (
            !isLoading && <p className="text-gray-500">No books found</p>
          )}
          <div className="flex gap-4 justify-center mt-8">
            <button
              onClick={handlePreviousPage}
              disabled={page === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer 
              disabled:cursor-not-allowed disabled:bg-gray-400 hover:bg-blue-600 transition"
            >
              Previous
            </button>
            <span className="flex items-center px-4 py-2">
              Page {page + 1}
            </span>
            <button
              onClick={handleNextPage}
              disabled={books.length < BOOKS_PER_PAGE}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer 
              disabled:cursor-not-allowed disabled:bg-gray-400 hover:bg-blue-600 transition"
            >
              Next
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}