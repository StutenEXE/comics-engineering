import type { Book } from "./book"
import type { User } from "./user"

export interface Serie {
    id: string,
    name: string,
    ongoing: boolean,
    oneshot: boolean,
    nvolumes: number,
    books: Partial<Book>[],
    createdAt: Date,
    modifiedAt: Date,
    addedBy: User
}