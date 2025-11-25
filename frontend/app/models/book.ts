import { API_PUB_BASE_URL, getRequest } from "~/services/api";
import type { Serie } from "./serie"
import type { User } from "./user"

export type Book = {
 	id: number,
	name: string,
	desc: string,
	number: number,
	serie: Partial<Serie>,
	createdAt: Date,
	modifiedAt: Date,
	addedBy: User
}

export async function requestLatestBookUpdates(from: number, limit: number): Promise<Book[]> {
    const BOOKS_URL = API_PUB_BASE_URL + "/books/latest";
    return getRequest<Book[]>(BOOKS_URL, { from, limit });
}