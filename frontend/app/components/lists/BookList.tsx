import { BookCard } from "../cards/BookCard";
import type { Book } from "~/models/book";
import { GenericList } from "./GenericList";


interface BookListProps {
    bookList: Book[] | null | undefined
    descOrder?: boolean
    className?: string
}

export function BookList({ bookList, descOrder, className }: BookListProps) {
    const mapper = (bk: Book) =>  (
        <BookCard className="w-25 snap-center hover:bg-gray-700 pb-1 rounded-sm" 
           key={bk.id} book={bk} /> 
    )

    const list = !bookList ? [] : [...bookList]

    return(
        <>
            <GenericList 
                list={list} 
                emptyMsg="No books linked"
                elemGenerator={mapper}
                className={className}
            />
        </>
    )
}