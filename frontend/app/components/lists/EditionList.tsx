import type { Edition } from "~/models/edition";
import { EditionCard } from "../cards/EditionCard";
import { compareDates } from "~/utils/date";


interface EditionListProps {
    editionList: Edition[] | null | undefined
    descOrder?: boolean
    className?: string
}

export function EditionList({ editionList, descOrder, className }: EditionListProps) {
    return(
        <div className={`flex gap-2 p-2 overflow-hidden snap-x snap-proximity ${className}`}>
            { // Copy to not rearrange original list  
            editionList && [...editionList]
                .sort((ed1, ed2) => {
                    if (descOrder) {
                        // Sort in descending order (newest issue first)
                        return compareDates(ed2.parutionDate, ed1.parutionDate) 
                    }
                    // Sort in ascending order (oldest issue first) (default)
                    return compareDates(ed1.parutionDate, ed2.parutionDate)
                })
                .map((ed) => {
                    return (
                        <EditionCard className="w-25 snap-center hover:bg-gray-700 pb-1 rounded-sm" 
                        key={ed.id} edition={ed} /> 
                    )
                })
            }
        </div>
    )
}