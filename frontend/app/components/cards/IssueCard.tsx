import { Link } from "react-router";
import type { Issue } from "~/models/issue";



type IssueCardProps = {
    issue: Issue;
    className?: string;
};

export function IssueCard({issue, className}: IssueCardProps) {
    return (
        <Link to={`/issue/${issue.id}`}>
            <div className={`p-1 w-full flex justify-between ${className}`}>
                <p>{issue.name}</p> 
                <p>{issue.parutionDate.toLocaleDateString("fr")}</p>
            </div>
        </Link>
    )
}