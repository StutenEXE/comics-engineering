import { parseDataToSerie, type Serie } from "./serie"
import { parseDataToUser, type User } from "./user"
import { parseDataToEdition, type Edition } from "./edition";
import { parseDataToIssue, type Issue } from "./issue";

export interface Book {
 	id: number,
	name: string,
	desc: string,
	number: number,
	voContent: string,
	serie: Serie | null,
	editions: Edition[],
	issues: Issue[],
	createdAt: Date,
	modifiedAt: Date,
	addedBy: User
}

// Utility function to transform the api data to an instance of Book
export function parseDataToBook(data: Record<string, any>): Book {
	return {
		id: data.id,
		name: data.name,
		desc: data.desc,
		number: data.number,
		voContent: data.voContent,
		serie: data.serie ? parseDataToSerie(data.serie) : null,
		editions: data.editions?.map((ed: Record<string, any>) => parseDataToEdition(ed)) ?? [],
		issues: data.issues?.map((is: Record<string, any>) => parseDataToIssue(is)) ?? [],
		createdAt: new Date(data.createdAt),
		modifiedAt: new Date(data.modifiedAt),
		addedBy: parseDataToUser(data.addedBy)
	}
}