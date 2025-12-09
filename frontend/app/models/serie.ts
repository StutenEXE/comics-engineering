import { parseDataToBook, type Book } from "./book"
import { parseDataToUser, type User } from "./user"

export interface Serie {
    id: number,
    name: string,
    ongoing: boolean,
    oneshot: boolean,
    nvolumes: number,
    voStart: Date,
    voEnd: Date | null,
    books: Book[],
    createdAt: Date,
    modifiedAt: Date,
    addedBy: User | null
}

// Utility function to transform the api data to an instance of Serie
export function parseDataToSerie(data: Record<string, any>): Serie {
    return {
        id: data.id,
        name: data.name,
        ongoing: data.ongoing,
        oneshot: data.oneshot,
        nvolumes: data.nvolumes,
        voStart: new Date(data.voStart),
        voEnd: data.voEnd ? new Date(data.voEnd) : null, 
        books: data.books?.map((bk: Record<string, any>) => parseDataToBook(bk)) ?? [],
        createdAt: new Date(data.createdAt),
        modifiedAt: new Date(data.modifiedAt),
        addedBy: data.addedBy ? parseDataToUser(data.addedBy) : null
    }
}