import { createBackupFromIssue, type Issue } from "~/models/issue";
import { compareDates } from "~/utils/date";
import { IssueCard } from "../cards/IssueCard";


interface IssueListProps {
    issueList: Issue[] | null | undefined
    descOrder?: boolean
    className?: string
}

export function IssueList({ issueList, descOrder, className }: IssueListProps) {
    return(
        <div className={`max-h-40 flex flex-col gap-0 p-2 overflow-y-scroll snap-y snap-proximity ${className}`}>
            { // Copy to not rearrange original list  
            issueList && [...issueList]
            .sort((is1, is2) => {
                if (descOrder) {
                    // Sort in descending order (newest issue first)
                    return compareDates(is2.parutionDate, is1.parutionDate) 
                }
                // Sort in ascending order (oldest issue first) (default)
                return compareDates(is1.parutionDate, is2.parutionDate)
            })
            .map((is) => {
                if (!is.hasBackup) {
                    return is
                }
                return [ is, createBackupFromIssue(is) ]
            })
            .flat()
            .map((is) => {
                return (
                    <IssueCard className="w-25 snap-center hover:bg-gray-700 pb-1 rounded-sm" 
                        key={is?.id} issue={is} /> 
                )
            }) 
            }
        </div>
    )
}