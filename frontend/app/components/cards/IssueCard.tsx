import { Link } from "react-router";
import { buildIssueShortName, type Issue } from "~/models/issue";



type IssueCardProps = {
    issue: Issue | null | undefined;
    className?: string;
};

export function IssueCard({issue, className}: IssueCardProps) {
    if (!issue) {
        return
    }
    return (
        <Link to={`/issue/${issue.id}`}>
            <div className={`p-1 w-full flex justify-between ${className}`}>
                <p>{buildIssueShortName(issue)}</p> 
                <p className="text-gray-500">{issue.parutionDate.toLocaleDateString("fr")}</p>
            </div>
        </Link>
    )
}