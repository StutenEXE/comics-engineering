import { useCallback, useState } from "react";
import type { Book } from "~/models/book";

type BookCardProps = {
    book: Book;
};

export function BookCard({book}: BookCardProps) {
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
        <div className="w-50 border p-2 rounded-lg flex flex-col items-center justify-between">
            <div className="p-1 flex-shrink-0">
                <img
                    src={book.editions[0].imgUrl}
                    alt={book.name}
                    className="w-full h-full object-cover rounded"
                />
            </div>
            <div className="flex flex-col items-center">
                <h3 className="text- font-semibold">{book.name}</h3>
                <h4 className="text-sm italic">{book.serie?.name} (#{book.number})</h4>

                {/* <p className="mt-2 whitespace-pre-line text-lg font-bold">Description :</p>
                <p> {book.desc}</p>

                <p className="mt-2 whitespace-pre-line text-lg font-bold">Content :</p>
                <p>{book.voContent}</p> */}


                {/* <p className="mt-6 text-xs">
                    Added by <b>{book.addedBy?.username}</b> the <b>{book.createdAt.toLocaleDateString("fr")}</b>
                </p>
                <p className="text-xs">
                    Last modification : <b>{book.modifiedAt.toLocaleDateString("fr")}</b>
                </p> */}
            </div>
        </div>
    );
}