import { parseDataToBook, type Book } from "./book"
import { parseDataToUser, type User } from "./user"

export interface Serie {
    id: string,
    name: string,
    ongoing: boolean,
    oneshot: boolean,
    nvolumes: number,
    books: Book[],
    createdAt: Date,
    modifiedAt: Date,
    addedBy: User
}

// Utility function to transform the api data to an instance of Serie
export function parseDataToSerie(data: Record<string, any>): Serie {
    return {
        id: data.id,
        name: data.name,
        ongoing: data.ongoing,
        oneshot: data.oneshot,
        nvolumes: data.nvolumes,
        books: data.books?.map((bk: Record<string, any>) => parseDataToBook(bk)) ?? [],
        createdAt: new Date(data.createdAt),
        modifiedAt: new Date(data.modifiedAt),
        addedBy: parseDataToUser(data.addedBy)
    }
}