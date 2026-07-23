import { parseToSimpleBook, type SimpleBook } from "./book"
import { parseToSimpleIssue, type SimpleIssue } from "./issue"
import { parseToSimpleUser, type SimpleUser } from "./user"

export interface IssueSerie {
    id: number,
    name: string,
    desc: string,
    startDate: string,
    endDate?: string,
    fandomUrl?: string,
    issues: SimpleIssue[],
    books: SimpleBook[],
    createdAt: string,
    modifiedAt: string,
    addedBy?: SimpleUser
}

// Utility function to transform the api data to an instance of Issue
export function parseToIssueSerie(data: Record<string, any>): IssueSerie {
    return {
        id: data.id,
        name: data.name,
        desc: data.desc,
        startDate: data.startDate,
        endDate: data.endDate,
        fandomUrl: data.fandomUrl,
        issues: data.issues?.map((i: Record<string, any>) => parseToSimpleIssue(i)) ?? [],
        books: data.books?.map((b: Record<string, any>) => parseToSimpleBook(b)) ?? [],
        createdAt: data.createdAt,
        modifiedAt: data.modifiedAt,
        addedBy: data.addedBy ? parseToSimpleUser(data.addedBy) : undefined
    }
}

export interface SimpleIssueSerie {
    id: number,
    name: string,
    desc: string,
    startDate: string,
    endDate?: string,
    fandomUrl?: string,
}

export function parseToSimpleIssueSerie(data: Record<string, any>): SimpleIssueSerie {
    return {
        id: data.id,
        name: data.name,
        desc: data.desc,
        startDate: data.startDate,
        endDate: data.endDate,
        fandomUrl: data.fandomUrl
    }
}

export interface ContributionIssueSerie {
    id?: number,
    name: string,
    desc?: string,
    startDate: string,
    endDate?: string,
    fandomUrl?: string,
}

export function isIssueSerie(issueserie: IssueSerie | SimpleIssueSerie | ContributionIssueSerie): issueserie is IssueSerie {
    return (issueserie as IssueSerie).createdAt !== undefined;
}

export function simplifyIssueSerie(iser: IssueSerie): SimpleIssueSerie {
    return parseToSimpleIssueSerie(iser)
}
