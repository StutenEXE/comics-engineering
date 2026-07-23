import { parseToSimpleBook, type SimpleBook } from "./book"
import { parseToSimpleUser, parseToUser, type SimpleUser, type User } from "./user"

export interface Serie {
    id: number,
    name: string,
    ongoing: boolean,
    oneshot: boolean,
    nvolumes: number,
    books: SimpleBook[],
    createdAt: string,
    modifiedAt: string,
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
        books: data.books?.map((bk: Record<string, any>) => parseToSimpleBook(bk)) ?? [],
        createdAt: data.createdAt,
        modifiedAt: data.modifiedAt,
        addedBy: data.addedBy ? parseToSimpleUser(data.addedBy) : null
    }
}

export interface SimpleSerie {
    id: number,
    name: string,
    ongoing: boolean,
    oneshot: boolean,
    nvolumes: number,
}

export function parseToSimpleSerie(data: Record<string, any>): SimpleSerie {
    return {
        id: data.id,
        name: data.name,
        ongoing: data.ongoing,
        oneshot: data.oneshot,
        nvolumes: data.nvolumes,
    }
}

export interface ContributionSerie {
    id?: number,
    name: string,
    ongoing: boolean,
    oneshot: boolean,
    nvolumes?: number,
}

export function isSerie(serie: Serie | SimpleSerie | ContributionSerie): serie is Serie {
    return (serie as Serie).createdAt !== undefined;
}

export function simplifySerie(ser: Serie): SimpleSerie {
    return parseToSimpleSerie(ser)
}

export function simpleSerieToSerie(ser: SimpleSerie): Serie {
    return parseToSerie(ser)
}