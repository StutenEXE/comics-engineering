import { useTranslation } from "~/i18n/i18n"
import { parseToEdition, type Edition, type EditionDTO } from "./edition"
import type { ColumnDef } from "~/components/tables/GenericTable"
import { createElement } from "react"
import { parseToUser, type User } from "./user"

export interface OwnedEdition {
    id: number,
    date: Date,
    read: boolean,
    dateRead?: Date,
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
        date: new Date(data.date),
        read: data.read,
        dateRead: data.dateRead ? new Date(data.dateRead) : undefined,
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
    date: Date,
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