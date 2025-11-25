import { requestLatestBookUpdates, type Book } from "~/models/book";
import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";

const latestBooks: Book[] = [];

let numBooks = 0;

const requestBooks = async () => {
  const resp = await requestLatestBookUpdates(numBooks, 10);
  latestBooks.push(...resp);
  numBooks += resp.length;
}

// Execute function on load
requestBooks();

export function Landing() {
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">
          <h1 className="text-4xl font-bold">Latest Book Updates</h1>
        </header>
        <div className="max-w-[600px] w-full space-y-6 px-4">
          <ul className="space-y-4">
            {latestBooks.map((book) => (
              <li key={book.id} className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                <h2 className="text-2xl font-semibold">{book.name} (#{book.number})</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{book.desc}</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                  Added by {book.addedBy.username} on {book.createdAt.toDateString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}

