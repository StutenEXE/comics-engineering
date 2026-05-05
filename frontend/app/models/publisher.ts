import { parseToSimpleEdition, type SimpleEdition } from "./edition"

export interface Publisher {
    id: number,
    name: string,
    editions: SimpleEdition[],
    createdAt: Date,
    modifiedAt: Date
}

// Utility function to transform the api data to an instance of Publisher
export function parseToPublisher(data: Record<string, any>): Publisher {
    return {
        id: data.id,
        name: data.name,
        editions: data.editions?.map((ed: Record<string, any>) => parseToSimpleEdition(ed)) ?? [],
        createdAt: new Date(data.createdAt),
        modifiedAt: new Date(data.modifiedAt)
    }
}
export interface SimplePublisher {
    id: number,
    name: string
}

export function parseToSimplePublisher(data: Record<string, any>): SimplePublisher {
    return {
        id: data.id,
        name: data.name
    }
}

export function publisherToSimplePublisher(pub: Publisher): SimplePublisher {
    return parseToSimplePublisher(pub)
}