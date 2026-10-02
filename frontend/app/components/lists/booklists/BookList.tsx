import { BookCard } from "../../cards/BookCard";
import {
  bookToSimpleBook,
  isSimpleBook,
  type Book,
  type SimpleBook,
} from "~/models/book";
import { GenericList } from "../GenericList";
import { translateApiError, type Error } from "~/utils/error";
import { useTranslation } from "~/i18n/i18n";

interface BookListProps {
  bookList: Book[] | SimpleBook[] | null | undefined;
  descOrder?: boolean;
  isLoading?: boolean;
  error?: Error;
  // Message shown when the list is empty (defaults to "no book found")
  emptyMsg?: string;
  className?: string;
}

export function BookList({
  bookList,
  isLoading,
  error,
  emptyMsg,
  className,
}: BookListProps) {
  const { t } = useTranslation();

  const mapper = (bk: SimpleBook) => (
    <BookCard
      className="w-35 snap-center hover:bg-gray-700 pb-1 rounded-sm"
      key={bk.id}
      book={bk}
    />
  );

  const list: SimpleBook[] =
    !bookList || bookList.length === 0
      ? []
      : isSimpleBook(bookList[0])
        ? (bookList as SimpleBook[])
        : (bookList as Book[]).map(bookToSimpleBook);

  return (
    <>
      <GenericList
        list={list}
        emptyMsg={
          isLoading
            ? t("loader.loading")
            : error
              ? translateApiError(error, t)
              : (emptyMsg ?? t("book.nonefound"))
        }
        elemGenerator={mapper}
        isLoading={isLoading}
        className={className}
      />
    </>
  );
}
