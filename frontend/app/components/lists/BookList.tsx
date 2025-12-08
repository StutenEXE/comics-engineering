import { BookCard } from "../cards/BookCard";
import type { Book } from "~/models/book";


interface BookListProps {
    bookList: Book[] | null | undefined
    descOrder?: boolean
    className?: string
}

export function BookList({ bookList, descOrder, className }: BookListProps) {
    return(
        <div className={`flex gap-2 p-2 overflow-hidden snap-x snap-proximity ${className}`}>
            { // Copy to not rearrange original list  
            bookList && [...bookList]
                .map((bk) => {
                    return (
                        <BookCard className="w-25 snap-center hover:bg-gray-700 pb-1 rounded-sm" 
                        key={bk.id} book={bk} /> 
                    )
                })
            }
        </div>
    )
}