import type { Error } from "~/utils/error";
import type { Serie } from "~/models/serie";
import { GenericList } from "./GenericList";
import { BookList } from "./booklists/BookList";
import { useState } from "react";
import { BsArrowsCollapse, BsArrowsExpand } from "react-icons/bs";


interface CollapsableSerieListProps {
    serieList: Serie[] | null | undefined
    descOrder?: boolean
    isLoading?: boolean
    error?: Error
    className?: string
}

export function CollapsableSerieList({ serieList, descOrder, isLoading, error, className }: CollapsableSerieListProps) {
    const mapper = (ser: Serie) => {
        const [ isOpened, setOpened ] = useState(ser?.books.length < ser?.nvolumes ? true : false)
        return (
            <div className="w-full border border-gray-500 rounded-lg">
                <div onClick={() => setOpened(!isOpened)} 
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-700 border border-gray-700"
                >
                    <h3 className="text-xl">{ser?.name}</h3>
                    {isOpened ? <BsArrowsCollapse size={25} />
                    : <BsArrowsExpand size={25} />}
                </div>
                { isOpened && <BookList key={ser?.id} bookList={ser?.books} /> }
            </div>
        )
    }

    console.log(serieList)

    const list = !serieList ? [] : [...serieList]
        // Sorting list
        .sort((ser1, ser2) => {
            if (descOrder) {
                // Sort in descending order (Z-a)
                return ser2?.name.localeCompare(ser1?.name)
            }
            // Sort in ascending order (a-Z) (default)
            return ser1?.name.localeCompare(ser2?.name)
        })

    return(
        <>
            <GenericList 
                list={list} 
                emptyMsg={isLoading ? "Loading..." : 
                    error ? error.error :  
                    "Nothing found"}
                elemGenerator={mapper}
                vertical
                className={`max-h-full w-full flex items-center ${className}`}
            />
        </>
    )
}