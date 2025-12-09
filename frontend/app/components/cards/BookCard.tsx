import { useCallback, useState } from "react";
import { Link } from "react-router";
import type { Book } from "~/models/book";

type BookCardProps = {
    book: Book | undefined | null
    className?: string;
};

export function BookCard({ book, className}: BookCardProps) {
    if (!book) {
        return
    }

    const [index, setIndex] = useState(0);
    const editions = book.editions ?? [];

    const onScroll = useCallback((event: React.WheelEvent) => {
        if (event.deltaY > 0) {
            setIndex(i => (i + 1) % editions.length);
        } else {
            setIndex(i => (i - 1 + editions.length) % editions.length);
        }
    }, [editions.length]);
    
    return (
        <Link to={`/book/${book.id}`}>
            <div className={`h-full flex flex-col items-center justify-between ${className}`}>
                <div className="p-1 flex-shrink-0">
                    <img
                        src={book.editions[0].imgUrl}
                        alt={book.name}
                        className="w-full h-full object-cover rounded"
                    />
                </div>
                <div className="flex flex-col items-center justify-between">
                    <h3 className="font-semibold text-center text-sm">{book.name}</h3>
                    <h4 className="text-center sm:text-sm italic">{book.serie?.name} (#{book.number})</h4>
                </div>
            </div>
        </Link>
    );
}