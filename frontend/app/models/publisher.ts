import { parseDataToEdition, type Edition } from "./edition"

export interface Publisher {
    id: number,
    name: string,
    editions: Edition[],
    createdAt: Date,
    modifiedAt: Date
}

// Utility function to transform the api data to an instance of Publisher
export function parseDataToPublisher(data: Record<string, any>): Publisher {
    console.log("Parsing publisher data:", data);
    return {
        id: data.id,
        name: data.name,
        editions: data.editions?.map((ed: Record<string, any>) => parseDataToEdition(ed)) ?? [],
        createdAt: new Date(data.createdAt),
        modifiedAt: new Date(data.modifiedAt)
    }
}