import { parseToSimpleBook, type SimpleBook } from "./book"
import { parseToSimpleIssueSerie, type SimpleIssueSerie } from "./issue-serie"
import { parseToSimpleUser, type SimpleUser } from "./user"

export interface Issue {
    id: number,
    name: string,
    number: number,
    coverDate: Date,
    parutionDate: Date,
    fandomUrl?: string,
    issueSerie?: SimpleIssueSerie,
    books: SimpleBook[]
    createdAt: Date,
    modifiedAt: Date,
    addedBy?: SimpleUser
}

// Utility function to transform the api data to an instance of Issue
export function parseToIssue(data: Record<string, any>): Issue {
    return {
        id: data.id,
        name: data.name,
        number: data.number,
        coverDate: new Date(data.coverDate),
        parutionDate: new Date(data.parutionDate),
        fandomUrl: data.fandomUrl,
        issueSerie: data.issueSerie ? parseToSimpleIssueSerie(data.issueSerie) : undefined,
        books: data.books?.map((bk: Record<string, any>) => parseToSimpleBook(bk)) ?? [],
        createdAt: new Date(data.createdAt),
        modifiedAt: new Date(data.modifiedAt),
        addedBy: data.addedBy ? parseToSimpleUser(data.addedBy) : undefined
    }
}

export interface SimpleIssue {
    id: number,
    name: string,
    number: number,
    coverDate: Date,
    parutionDate: Date,
    fandomUrl?: string,
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
        fandomUrl: data.fandomUrl,
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
    fandomUrl?: string,
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
        fandomUrl: issue.fandomUrl,
        issueSerieId: issue.issueSerie ? issue.issueSerie.id : undefined,
        issueSerieName: issue.issueSerie ? issue.issueSerie.name : undefined
    }
}

export function buildIssueShortName(is: Issue | SimpleIssue | undefined): string {
    if (!is) {
        return "";
    }
    let shortTitle = `${isSimpleIssue(is) ? is.issueSerieName : is.issueSerie?.name}`
    return `${shortTitle} #${is.number}`
}