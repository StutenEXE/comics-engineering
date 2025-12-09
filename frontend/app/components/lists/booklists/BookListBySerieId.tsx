import { useBookBySerieIdQuery } from "~/store/services/api";
import { createError } from "~/utils/error";
import { BookList } from "./BookList";
import type { Book } from "~/models/book";

interface BookListBySerieIdProps {
    serieId: number | null | undefined
    toIgnore?: Book | null | undefined
    descOrder?: boolean
    className?: string
}

export function BookListBySerieId({ serieId, toIgnore, descOrder, className }: BookListBySerieIdProps) {
    if (!serieId) {
        return(<BookList bookList={[]} error={{
            status: 0,
            error: "No serie found"
        }} className={className}/>)
    }

    const { data, isLoading, error } = useBookBySerieIdQuery({ id: serieId, withEditions: true, withSerie: true, withUser: false });
    const books = data?.books ?? null;
    const err = createError(error)

    return(
        <BookList bookList={books?.filter(bk => !toIgnore || bk.id !== toIgnore.id)} isLoading={isLoading} error={err} className={className}/>
    )
}