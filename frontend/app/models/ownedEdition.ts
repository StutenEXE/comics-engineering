import { parseToEdition, type Edition, type EditionDTO } from "./edition"
import { parseToUser, type User } from "./user"

export interface OwnedEdition {
    id: number,
    date: string,
    read: boolean,
    dateRead?: string,
    gift: boolean,
    signed: boolean,
    purchasePrice: number,
    fees: number,
    retailPrice: number,
    note: string,
    edition: Edition,
    user: User,
}

// Utility function to transform the api data to an instance of Edition
export function parseToOwnedEdition(data: Record<string, any>): OwnedEdition {
    return {
        id: data.id,
        date: data.date,
        read: data.read,
        dateRead: data.dateRead,
        gift: data.gift,
        signed: data.signed,
        purchasePrice: data.purchasePrice,
        fees: data.fees,
        retailPrice: data.retailPrice,
        note: data.note,
        edition: parseToEdition(data.edition),
        user: parseToUser(data.user),
    }
}

export interface OwnedEditionDTO {
    id: number,
    date: string,
    read: boolean,
    dateRead: string,
    gift: boolean,
    signed: boolean,
    purchasePrice: number,
    fees?: number,
    retailPrice: number,
    note: string,
    edition: EditionDTO,
    user: User,
}

export interface SimpleOwnedEdition {
    id: number,
    date: string,
    read: boolean,
    dateRead?: string,
    gift: boolean,
    signed: boolean,
    purchasePrice: number,
    fees: number,
    retailPrice: number,
    note: string,
    editionId: number,
}