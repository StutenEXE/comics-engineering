import { Link } from "react-router";
import { useTranslation } from "~/i18n/i18n";
import { buildIssueShortName, type SimpleIssue } from "~/models/issue";



type IssueCardProps = {
    issue: SimpleIssue | null | undefined;
    className?: string;
};

export function IssueCard({issue, className}: IssueCardProps) {
    const { locale } = useTranslation();
    if (!issue) {
        return
    }
    return (
        <Link to={`/issue/${issue.id}`}>
            <div className={`p-1 w-full flex justify-between ${className}`}>
                <p>{buildIssueShortName(issue)}</p> 
                <p className="text-gray-500">{issue.parutionDate.toLocaleDateString(locale)}</p>
            </div>
        </Link>
    )
}