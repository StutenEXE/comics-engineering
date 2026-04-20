import { parseToSimpleBook, type SimpleBook } from "./book"
import { parseToSimpleIssue, type SimpleIssue } from "./issue"
import { parseToSimpleUser, type SimpleUser } from "./user"

export interface IssueSerie {
    id: number,
    name: string,
    desc: string,
    startDate: Date,
    endDate: Date | null,
    issues: SimpleIssue[],
    books: SimpleBook[],
    createdAt: Date,
    modifiedAt: Date,
    addedBy: SimpleUser | null
}

// Utility function to transform the api data to an instance of Issue
export function parseToIssueSerie(data: Record<string, any>): IssueSerie {
    return {
        id: data.id,
        name: data.name,
        desc: data.desc,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null, 
        issues: data.issues?.map((i: Record<string, any>) =>  parseToSimpleIssue(i)) ?? [],
        books: data.books?.map((b: Record<string, any>) => parseToSimpleBook(b)) ?? [],
        createdAt: new Date(data.createdAt),
        modifiedAt: new Date(data.modifiedAt),
        addedBy: data.addedBy ? parseToSimpleUser(data.addedBy) : null  
    }
}

export interface SimpleIssueSerie {
    id: number,
    name: string,
    desc: string,
    startDate: Date,
    endDate: Date | null
}

export function parseToSimpleIssueSerie(data: Record<string, any>): SimpleIssueSerie {
    return {
        id: data.id,
        name: data.name,
        desc: data.desc,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null
    }
}