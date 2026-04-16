import { parseDataToBook, type Book } from "./book"
import { parseDataToIssueSerie, type IssueSerie } from "./issue-serie"
import { parseDataToUser, type User } from "./user"

export interface Issue {
    id: number,
    name: string,
    number: number,
    coverDate: Date,
    parutionDate: Date,
    issueSerie: IssueSerie | null,
    books: Book[]
    createdAt: Date,
    modifiedAt: Date,
    addedBy: User | null
}

// Utility function to transform the api data to an instance of Issue
export function parseDataToIssue(data: Record<string, any>): Issue {
    return {
        id: data.id,
        name: data.name,
        number: data.number,
        coverDate: new Date(data.coverDate),
        parutionDate: new Date(data.parutionDate),
        issueSerie: data.issueSerie ? parseDataToIssueSerie(data.issueSerie) : null,
        books: data.books?.map((bk: Record<string, any>) => parseDataToBook(bk)) ?? [],
        createdAt: new Date(data.createdAt),
        modifiedAt: new Date(data.modifiedAt),
        addedBy: data.addedBy ? parseDataToUser(data.addedBy) : null
    }
}

export function buildIssueShortName(is: Issue | null): string {
    if (!is) {
        return "";
    }
    let shortTitle = `${is.issueSerie?.name}` 
    return `${shortTitle} #${is.number}`
}