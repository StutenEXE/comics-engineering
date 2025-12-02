import { parseDataToBook, type Book } from "./book"
import { parseDataToIssueSerie, type IssueSerie } from "./issue-serie"
import { parseDataToUser, type User } from "./user"

export interface Issue {
    id: number,
    name: string,
    number: number,
    parutionDate: Date,
    issueSerie: Partial<IssueSerie> | null,
    books: Partial<Book>[]
    createdAt: Date,
    modifiedAt: Date,
    addedBy: User
}

// Utility function to transform the api data to an instance of Issue
export function parseDataToIssue(data: Record<string, any>): Issue {
    return {
        id: data.id,
        name: data.name,
        number: data.number,
        parutionDate: data.parutionDate,
        issueSerie: data.issueSerie ? parseDataToIssueSerie(data.issueSerie) : null,
        books: data.books?.map((bk: Record<string, any>) => parseDataToBook(bk)) ?? [],
        createdAt: new Date(data.createdAt),
        modifiedAt: new Date(data.modifiedAt),
        addedBy: parseDataToUser(data.addedBy)
    }
}