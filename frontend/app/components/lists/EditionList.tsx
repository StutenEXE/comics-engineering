import type { Edition } from "~/models/edition";
import { EditionCard } from "../cards/EditionCard";
import { compareDates } from "~/utils/date";
import { GenericList } from "./GenericList";


interface EditionListProps {
    editionList: Edition[] | null | undefined
    descOrder?: boolean
    className?: string
}

export function EditionList({ editionList, descOrder, className }: EditionListProps) {
    const mapper = (ed: Edition) =>  (
        <EditionCard className="w-25 snap-center hover:bg-gray-700 pb-1 rounded-sm" 
            key={ed.id} edition={ed} /> 
    )
        
    const list = !editionList ? [] : [...editionList]
        // Sorting list
        .sort((ed1, ed2) => {
            if (descOrder) {
                // Sort in descending order (newest issue first)
                return compareDates(ed2.parutionDate, ed1.parutionDate) 
            }
            // Sort in ascending order (oldest issue first) (default)
            return compareDates(ed1.parutionDate, ed2.parutionDate)
        })

    return(
        <>
            <GenericList 
                list={list} 
                emptyMsg="No editions linked"
                elemGenerator={mapper}
                className={className}
            />
        </>
    )
}