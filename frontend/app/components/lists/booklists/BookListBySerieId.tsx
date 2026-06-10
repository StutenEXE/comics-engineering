import { useTranslation } from "~/i18n/i18n";
import type { Book } from "~/models/book";
import { useBookBySerieIdQuery } from "~/store/services/api";
import { createError } from "~/utils/error";
import { BookList } from "./BookList";

interface BookListBySerieIdProps {
  serieId: number | null | undefined;
  toIgnore?: Book | null | undefined;
  descOrder?: boolean;
  className?: string;
}

export function BookListBySerieId({
  serieId,
  toIgnore,
  descOrder,
  className,
}: BookListBySerieIdProps) {
  const { t } = useTranslation();

  if (!serieId) {
    return (
      <BookList
        bookList={[]}
        error={{
          status: 0,
          details: {
            error: t("loader.serie.nodata"),
          },
        }}
        className={className}
      />
    );
  }

  const { data, isLoading, error } = useBookBySerieIdQuery({ id: serieId });
  const books = data?.books ?? null;
  const err = createError(error);

  return (
    <BookList
      bookList={books?.filter((bk) => !toIgnore || bk.id !== toIgnore.id)}
      isLoading={isLoading}
      error={err}
      className={className}
    />
  );
}
