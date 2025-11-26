import { requestLatestBookUpdates, type Book } from "~/models/book";
import { useEffect, useState } from "react";

export function Welcome() {
  const [books, setBooks] = useState<Book[]>([]);
  const [numBooks, setNumBooks] = useState(0);

  useEffect(() => {
    let isMounted = true;
    requestLatestBookUpdates(numBooks, 10)
      .then((newBooks) => {
        console.log("Fetched latest books:", newBooks);
        if (!isMounted) return;
        setBooks(newBooks);
        setNumBooks(newBooks.length);
      })
      .catch((err) => {
        console.error("Failed fetching latest books:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">
          <h1>Latest book updates</h1>
        </header>
        <div>
          <ul className="flex flex-col gap-4">
            {books.map((book) => (
              <li key={book.id} className="border p-4 rounded-lg">
                <h2 className="text-xl font-bold">{book.name}</h2>
                <h4 className="text-md italic">Series: {book.serie.name} (#{book.number})</h4>
                <p className="text-gray-600">{book.desc}</p>
                <p className="text-sm text-gray-500">Added on: {book.createdAt?.toLocaleDateString("fr")} by {book.addedBy?.username}</p>
              </li>
            ))}
          </ul>

        </div>
      </div>
    </main>
  );
}