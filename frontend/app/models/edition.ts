import { toYYYYmmDD } from "~/utils/date"
import { parseToSimpleBook, type SimpleBook } from "./book"
import { parseToSimplePublisher, type SimplePublisher } from "./publisher"
import { parseToSimpleSerie, type SimpleSerie } from "./serie"
import { parseToSimpleUser, type SimpleUser } from "./user"

interface EditionDims {
    width: number,
    height: number,
    thickness: number,
}

export interface Edition {
    id: number,
    isbn: string,
    ean: string,
    npages: number,
    price: number,
    url: string,
    imgUrl: string,
    coverType: string,
    parutionDate: string,
    dimensions: EditionDims
    publisher?: SimplePublisher,
    book?: SimpleBook,
    serie?: SimpleSerie,
    createdAt: string,
    modifiedAt: string,
    addedBy?: SimpleUser
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
    parutionDate: string,
    dimensions: EditionDims,
    publisherId?: number,
    publisherName?: string,
    bookId?: number
}

export interface ContributionEdition {
    id?: number,
    isbn: string,
    ean?: string,
    npages?: number,
    price?: number,
    url: string,
    imgUrl: string,
    coverType: string,
    parutionDate: string,
    dimensions: EditionDims,
    publisher: { id: number, name: string },
    book: { id: number, name: string }
}

export interface EditionDTO {
    id: number,
    isbn: string,
    ean: string,
    npages: number,
    price: number,
    url: string,
    imgUrl: string,
    coverType: string,
    parutionDate: string,
    dimensions: EditionDims
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
        parutionDate: data.parutionDate,
        dimensions: data.dimensions,
        publisher: data.publisher ? parseToSimplePublisher(data.publisher) : undefined,
        book: data.book ? parseToSimpleBook(data.book) : undefined,
        serie: data.serie ? parseToSimpleSerie(data.serie) : undefined,
        createdAt: data.createdAt,
        modifiedAt: data.modifiedAt,
        addedBy: data.addedBy ? parseToSimpleUser(data.addedBy) : undefined
    }
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
        parutionDate: data.parutionDate,
        dimensions: data.dimensions,
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
        dimensions: edition.dimensions,
        publisherId: edition.publisher ? edition.publisher.id : undefined,
        publisherName: edition.publisher ? edition.publisher.name : undefined,
        bookId: edition.book ? edition.book.id : undefined,
    }
}

export function editionToDTO(edition: Edition): EditionDTO {
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
        dimensions: edition.dimensions
    }
}