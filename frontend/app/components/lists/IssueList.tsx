import { createBackupFromIssue, type Issue } from "~/models/issue";
import { compareDates } from "~/utils/date";
import { IssueCard } from "../cards/IssueCard";
import { GenericList } from "./GenericList";


interface IssueListProps {
    issueList: Issue[] | null | undefined
    descOrder?: boolean
    className?: string
}

export function IssueList({ issueList, descOrder, className }: IssueListProps) {
    const mapper = (is: Issue) => (
        <IssueCard className="w-25 snap-center hover:bg-gray-700 pb-1 rounded-sm" 
                key={is?.id} issue={is} />
    ) 
    
    const list = !issueList ? [] : [...issueList]
        // Creating backup issues 
        .map((is) => {
            if (!is.hasBackup) {
                return is
        }
            return [ is, createBackupFromIssue(is) ]
        })
        // Flattening nested lists
        .flat()
        // Removing null vals
        .filter(is => is !== null)
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
                emptyMsg="No issues linked"
                elemGenerator={mapper}
                vertical
                className={className}
            />
        </>
    )
}