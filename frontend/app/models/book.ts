import type { Serie } from "./serie"
import type { User } from "./user"
import type { Edition } from "./edition";

export interface Book {
 	id: number,
	name: string,
	desc: string,
	number: number,
	voContent: string,
	serie: Partial<Serie>,
	editions: Partial<Edition>[],
	createdAt: Date,
	modifiedAt: Date,
	addedBy: User
}