import { useCallback, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "~/i18n/i18n";
import type { SimpleBook } from "~/models/book";

type BookCardProps = {
    book: SimpleBook | undefined | null
    className?: string;
};

export function BookCard({ book, className }: BookCardProps) {
    const { t } = useTranslation();

    if (!book) {
        return
    }
    
    return (
        <Link to={`/book/${book.id}`}>
            <div className={`h-full flex flex-col items-center justify-between ${className}`}>
                <div className="p-1 flex-shrink-0">
                    <img
                        src={book.imgUrl}
                        alt={book.name}
                        className="w-full h-full object-cover rounded"
                    />
                </div>
                <div className="flex flex-col items-center justify-between">
                    <h3 className="font-semibold text-center text-sm">{book.name}</h3>
                    <h4 className="text-center sm:text-sm">{book.serieName}</h4>
                    <h4 className="text-center sm:text-sm italic">{t("generic.volume", { capitalize: true })} {book.number}</h4>
                </div>
            </div>
        </Link>
    );
}