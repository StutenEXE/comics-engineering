import { type Issue } from "~/models/issue";
import { compareDates } from "~/utils/date";
import { IssueCard } from "../../cards/IssueCard";
import { GenericList } from "../GenericList";
import type { Error } from "~/utils/error";


interface IssueListProps {
    issueList: Issue[] | null | undefined
    descOrder?: boolean
    isLoading?: boolean
    error?: Error
    className?: string
}

export function IssueList({ issueList, descOrder, isLoading, error, className }: IssueListProps) {
    const mapper = (is: Issue) => (
        <IssueCard className="w-25 snap-center hover:bg-gray-700 pb-1 rounded-sm" 
                key={is?.id} issue={is} />
    ) 
    
    const list = !issueList ? [] : [...issueList]
        // Sorting list
        .sort((is1, is2) => {
            if (descOrder) {
                // Sort in descending order (newest issue first)
                return compareDates(is2.parutionDate, is1.parutionDate) 
            }
            // Sort in ascending order (oldest issue first) (default)
            return compareDates(is1.parutionDate, is2.parutionDate)
        })

    return(
        <>
            <GenericList 
                list={list} 
                emptyMsg={isLoading ? "Loading issues..." : 
                    error ? error.details.error :  
                    "No issues linked"}
                elemGenerator={mapper}
                vertical
                className={className}
            />
        </>
    )
}