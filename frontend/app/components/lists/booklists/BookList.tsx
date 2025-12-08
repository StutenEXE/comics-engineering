import { BookCard } from "../../cards/BookCard";
import type { Book } from "~/models/book";
import { GenericList } from "../GenericList";
import type { Error } from "~/utils/error";

interface BookListProps {
    bookList: Book[] | null | undefined
    descOrder?: boolean
    isLoading?: boolean
    error?: Error
    className?: string
}

export function BookList({ bookList, isLoading, error, className }: BookListProps) {
    const mapper = (bk: Book) =>  (
        <BookCard className="w-25 snap-center hover:bg-gray-700 pb-1 rounded-sm" 
           key={bk.id} book={bk} /> 
    )

    const list = !bookList ? [] : [...bookList]

    return(
        <>
            <GenericList 
                list={list} 
                emptyMsg={isLoading ? "Loading books..." : 
                    error ? error.error :  
                    "No books linked"}
                elemGenerator={mapper}
                className={className}
            />
        </>
    )
}