import { API_PUB_BASE_URL, getRequest } from "~/services/api";
import type { Serie } from "./serie"
import type { User } from "./user"
import type { Edition } from "./edition";

export type Book = {
 	id: number,
	name: string,
	desc: string,
	voContent: string,
	serie: Partial<Serie>,
	editions: Partial<Edition>[],
	createdAt: Date,
	modifiedAt: Date,
	addedBy: User
}

export async function requestLatestBookUpdates(from: number, limit: number): Promise<Book[]> {
    const BOOKS_URL = API_PUB_BASE_URL + "/books/latest";
	const raw = await getRequest<{ books: Record<string, any>[] }>(BOOKS_URL, { from, limit });
	const books: Book[] = raw.books.map((item) => ({
		id: item.id,
		name: item.name,
		desc: item.desc,
		voContent: item.voContent,
		serie: item.serie,
		editions: item.editions,
		createdAt: new Date(item.createdAt),
		modifiedAt: new Date(item.modifiedAt),
		addedBy: item.addedBy
	}));
    return books;
}