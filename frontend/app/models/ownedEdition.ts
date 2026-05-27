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

export function getOwnedEditionColumns(): ColumnDef<OwnedEdition>[] {
    const { t, locale } = useTranslation()
    return [
        {
            key: 'cover',
            header: t('oedition.cover'),
            searchable: false,
            cellRenderer: (oe) => createElement(
                "a",
                { className: "hover:underline", href: `/edition/${oe.edition.id}` },
                createElement("img", { src: oe.edition.imgUrl, className: 'max-h-[100px]' })
            ),
        },
        {
            key: 'edition.book.name',
            header: t('oedition.book.name'),
            searchable: true,
            cellRenderer: (oe) => createElement(
                "a",
                { className: "hover:underline", href: `/book/${oe.edition.book?.id}` },
                oe.edition.book?.name
            ),
            getValue: (oe) => oe.edition.book?.name || ""
        },
        {
            key: 'serie',
            header: t('oedition.serie.name'),
            searchable: true,
            cellRenderer: (oe) => createElement(
                "a",
                { className: "hover:underline", href: `/serie/${oe.edition.book?.serieId}` },
                oe.edition.serie?.name
            ),
            getValue: (oe) => oe.edition.serie?.name || ""
        },
        {
            key: 'volume',
            header: t('oedition.book.volume'),
            cellRenderer: (oe) => `${t('generic.volume', { capitalize: true })} ${oe.edition.book?.number}`
        },
        {
            key: 'addDate',
            header: t('oedition.addDate'),
            cellRenderer: (oe) => {
                return oe?.date.toLocaleDateString(locale)
            },
        },
        {
            key: 'read',
            header: t('oedition.read'),
            cellRenderer: (oe) => {
                return t(oe.read ? 'generic.yes' : 'generic.no', { capitalize: true })
            }
        }
    ]
}