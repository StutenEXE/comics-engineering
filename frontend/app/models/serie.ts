import { parseToSimpleBook, type SimpleBook } from "./book"
import { parseToSimpleUser, parseToUser, type SimpleUser, type User } from "./user"

export interface Serie {
    id: number,
    name: string,
    ongoing: boolean,
    oneshot: boolean,
    nvolumes: number,
    startDate: Date,
    endDate: Date | null,
    books: SimpleBook[],
    createdAt: Date,
    modifiedAt: Date,
    addedBy: SimpleUser | null
}

// Utility function to transform the api data to an instance of Serie
export function parseToSerie(data: Record<string, any>): Serie {
    return {
        id: data.id,
        name: data.name,
        ongoing: data.ongoing,
        oneshot: data.oneshot,
        nvolumes: data.nvolumes,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null, 
        books: data.books?.map((bk: Record<string, any>) => parseToSimpleBook(bk)) ?? [],
        createdAt: new Date(data.createdAt),
        modifiedAt: new Date(data.modifiedAt),
        addedBy: data.addedBy ? parseToSimpleUser(data.addedBy) : null
    }
}

export interface SimpleSerie {
    id: number,
    name: string,
    ongoing: boolean,
    oneshot: boolean,
    nvolumes: number,
    startDate: Date,
    endDate: Date | null,
}

export function parseToSimpleSerie(data: Record<string, any>): SimpleSerie {
    return {
        id: data.id,
        name: data.name,
        ongoing: data.ongoing,
        oneshot: data.oneshot,
        nvolumes: data.nvolumes,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null, 
    }
}

export interface ContributionSerie {
    id?: number,
    name: string,
    ongoing: boolean,
    oneshot: boolean,
    nvolumes?: number,
    startDate: string,
    endDate?: string,
}

export function simplifySerie(ser: Serie): SimpleSerie {
    return parseToSimpleSerie(ser)
}

export function simpleSerieToSerie(ser: SimpleSerie): Serie {
    return parseToSerie(ser)
}