import { parseDataToBook, type Book } from "./book"
import { parseDataToPublisher, type Publisher } from "./publisher"
import { parseDataToUser, type User } from "./user"

export interface Edition {
    id: number,
    isbn: string,
    ean: string,
    price: number,
    url: string,
    imgUrl: string,
    coverType: string,
    parutionDate: Date,
    publisher: Publisher | null,
    book: Book | null,
    createdAt: Date,
    modifiedAt: Date,
    addedBy: User | null
}

// Utility function to transform the api data to an instance of Edition
export function parseDataToEdition(data: Record<string, any>): Edition {
    return {
        id: data.id,
        isbn: data.isbn,
        ean: data.ean,
        price: data.price,
        url: data.url,
        imgUrl: data.imgUrl,
        coverType: data.coverType,
        parutionDate: new Date(data.parutionDate),
        publisher: data.publisher ? parseDataToPublisher(data.publisher) : null,
        book: data.book ? parseDataToBook(data.book) : null,
        createdAt: new Date(data.createdAt),
        modifiedAt: new Date(data.modifiedAt),
        addedBy: data.addedBy ? parseDataToUser(data.addedBy) : null
    }
}