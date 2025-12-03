import { useCallback, useState } from "react";
import { Link } from "react-router";
import type { Edition } from "~/models/edition";

type EditionCardProps = {
    edition: Edition;
    className?: string;
};

export function EditionCard({edition, className}: EditionCardProps) {
    
    return (
        <Link to={`/edition/${edition.id}`}>
            <div className={`flex flex-col items-center justify-between ${className}`}>
                <div className="p-1 flex-shrink-0">
                    <img
                        src={edition.imgUrl}
                        alt={`${edition.book?.name}-${edition.publisher?.name}-${edition.parutionDate.getFullYear()}`}
                        className="w-full h-full object-cover rounded"
                    />
                </div>
                <div className="p-1 flex flex-col items-center">
                    <h3 className="text-sm font-semibold">{edition.publisher?.name}</h3>
                    <h4 className="text-sm italic">{edition.parutionDate.toLocaleDateString("fr")}</h4>
                </div>
            </div>
        </Link>
    );
}