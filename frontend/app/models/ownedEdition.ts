import { parseToEdition, type Edition } from "./edition"

export interface OwnedEdition {
    id: number,
    date: Date,
    read: boolean,
    dateRead: Date | null,
    gift: boolean,
    signed: boolean,
    purchasePrice: number | null,
    fees: number | null,
    retailPrice: number,
    notes: string,
    edition: Edition
}

// Utility function to transform the api data to an instance of Edition
export function parseToOwnedEdition(data: Record<string, any>): OwnedEdition {
    return {
        id: data.id,
        date: new Date(data.date),
        read: data.read,
        dateRead: data.dateRead ? new Date(data.dateRead) : null,
        gift: data.gift,
        signed: data.signed,
        purchasePrice: data.purchasePrice,
        fees: data.fees,
        retailPrice: data.retailPrice,
        notes: data.notes,
        edition: parseToEdition(data.edition)
    }
}
