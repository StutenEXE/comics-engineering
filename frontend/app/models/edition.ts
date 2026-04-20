import { parseToSimpleBook, type SimpleBook } from "./book"
import { parseToSimplePublisher, type SimplePublisher } from "./publisher"
import { parseToSimpleSerie, type SimpleSerie } from "./serie"
import { parseToSimpleUser, type SimpleUser } from "./user"

export interface Edition {
    id: number,
    isbn: string,
    ean: string,
    npages: number,
    price: number,
    url: string,
    imgUrl: string,
    coverType: string,
    parutionDate: Date,
    publisher: SimplePublisher | null,
    book: SimpleBook | null,
    serie: SimpleSerie | null,
    createdAt: Date,
    modifiedAt: Date,
    addedBy: SimpleUser | null
}

// Utility function to transform the api data to an instance of Edition
export function parseToEdition(data: Record<string, any>): Edition {
    return {
        id: data.id,
        isbn: data.isbn,
        ean: data.ean,
        npages: data.npages,
        price: data.price,
        url: data.url,
        imgUrl: data.imgUrl,
        coverType: data.coverType,
        parutionDate: new Date(data.parutionDate),
        publisher: data.publisher ? parseToSimplePublisher(data.publisher) : null,
        book: data.book ? parseToSimpleBook(data.book) : null,
        serie: data.serie ? parseToSimpleSerie(data.serie) : null,
        createdAt: new Date(data.createdAt),
        modifiedAt: new Date(data.modifiedAt),
        addedBy: data.addedBy ? parseToSimpleUser(data.addedBy) : null
    }
}

export interface SimpleEdition {
    id: number,
    isbn: string,
    ean: string,
    npages: number,
    price: number,
    url: string,
    imgUrl: string,
    coverType: string,
    parutionDate: Date,
    publisherId: number | null,
    publisherName: string | null,
    bookId: number | null
}

export function parseToSimpleEdition(data: Record<string, any>): SimpleEdition {
    return {
        id: data.id,
        isbn: data.isbn,
        ean: data.ean,
        npages: data.npages,
        price: data.price,
        url: data.url,
        imgUrl: data.imgUrl,
        coverType: data.coverType,
        parutionDate: new Date(data.parutionDate),
        publisherId: data.publisherId,
        publisherName: data.publisherName,
        bookId: data.bookId,
    }
}

export function isSimpleEdition(edition: Edition | SimpleEdition): edition is SimpleEdition {
    return (edition as SimpleEdition).publisherId !== undefined && (edition as SimpleEdition).bookId !== undefined
}

export function editionToSimpleEdition(edition: Edition): SimpleEdition {
    return {
        id: edition.id,
        isbn: edition.isbn,
        ean: edition.ean,
        npages: edition.npages,
        price: edition.price,
        url: edition.url,
        imgUrl: edition.imgUrl,
        coverType: edition.coverType,
        parutionDate: edition.parutionDate,
        publisherId: edition.publisher ? edition.publisher.id : null,
        publisherName: edition.publisher ? edition.publisher.name : null,
        bookId: edition.book ? edition.book.id : null,
    }
}
