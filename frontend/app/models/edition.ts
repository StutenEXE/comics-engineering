import type { Book } from "./book"
import type { Publisher } from "./publisher"
import type { User } from "./user"

export type Edition = {
    id: number,
    isbn: string,
    ean: string,
    imgUrl: string,
    parutionDate: Date,
    publisher: Partial<Publisher>,
    book: Partial<Book>,
    createdAt: Date,
    modifiedAt: Date,
    addedBy: User
}