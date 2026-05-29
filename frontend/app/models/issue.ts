import { parseToSimpleBook, type SimpleBook } from "./book"
import { parseToSimpleIssueSerie, type SimpleIssueSerie } from "./issue-serie"
import { parseToSimpleUser, type SimpleUser } from "./user"

export interface Issue {
    id: number,
    name: string,
    number: number,
    coverDate: Date,
    parutionDate: Date,
    issueSerie: SimpleIssueSerie | null,
    books: SimpleBook[]
    createdAt: Date,
    modifiedAt: Date,
    addedBy: SimpleUser | null
}

// Utility function to transform the api data to an instance of Issue
export function parseToIssue(data: Record<string, any>): Issue {
    return {
        id: data.id,
        name: data.name,
        number: data.number,
        coverDate: new Date(data.coverDate),
        parutionDate: new Date(data.parutionDate),
        issueSerie: data.issueSerie ? parseToSimpleIssueSerie(data.issueSerie) : null,
        books: data.books?.map((bk: Record<string, any>) => parseToSimpleBook(bk)) ?? [],
        createdAt: new Date(data.createdAt),
        modifiedAt: new Date(data.modifiedAt),
        addedBy: data.addedBy ? parseToSimpleUser(data.addedBy) : null
    }
}

export interface SimpleIssue {
    id: number,
    name: string,
    number: number,
    coverDate: Date,
    parutionDate: Date,
    issueSerieId?: number,
    issueSerieName?: string
}

export function parseToSimpleIssue(data: Record<string, any>): SimpleIssue {
    return {
        id: data.id,
        name: data.name,
        number: data.number,
        coverDate: new Date(data.coverDate),
        parutionDate: new Date(data.parutionDate),
        issueSerieId: data.issueSerieId,
        issueSerieName: data.issueSerieName
    }
}

export interface ContributionIssue {
    id?: number,
    name: string,
    number: number,
    coverDate: string,
    parutionDate: string,
    issueSerie: { id: number, name: string }
}

export function isSimpleIssue(issue: Issue | SimpleIssue | ContributionIssue): issue is SimpleIssue {
    return (issue as SimpleIssue).issueSerieId !== undefined;
}

export function issueToSimpleIssue(issue: Issue): SimpleIssue {
    return {
        id: issue.id,
        name: issue.name,
        number: issue.number,
        coverDate: issue.coverDate,
        parutionDate: issue.parutionDate,
        issueSerieId: issue.issueSerie ? issue.issueSerie.id : undefined,
        issueSerieName: issue.issueSerie ? issue.issueSerie.name : undefined
    }
}

export function buildIssueShortName(is: Issue | SimpleIssue | undefined): string {
    if (!is) {
        return "";
    }
    let shortTitle =`${isSimpleIssue(is) ? is.issueSerieName : is.issueSerie?.name}`
    return `${shortTitle} #${is.number}`
}