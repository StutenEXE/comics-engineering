import { parseToSimpleEdition, type SimpleEdition } from "./edition";
import { parseToSimpleIssue, type SimpleIssue } from "./issue";
import { parseToSimpleSerie, type SimpleSerie } from "./serie";
import { parseToSimpleUser, type SimpleUser } from "./user";

export interface Book {
 	id: number,
	name: string,
	desc: string,
	number: number,
	voContent: string,
	imgUrl: string,
	serie: SimpleSerie | null,
	editions: SimpleEdition[],
	issues: SimpleIssue[],
	createdAt: Date,
	modifiedAt: Date,
	addedBy: SimpleUser | null
}

// Utility function to transform the api data to an instance of Book
export function parseToBook(data: Record<string, any>): Book {
	return {
		id: data.id,
		name: data.name,
		desc: data.desc,
		number: data.number,
		voContent: data.voContent,
		imgUrl: data.imgUrl,
		serie: data.serie ? parseToSimpleSerie(data.serie) : null,
		editions: data.editions?.map((ed: Record<string, any>) => parseToSimpleEdition(ed)) ?? [],
		issues: data.issues?.map((is: Record<string, any>) => parseToSimpleIssue(is)) ?? [],
		createdAt: new Date(data.createdAt),
		modifiedAt: new Date(data.modifiedAt),
		addedBy: data.addedBy ? parseToSimpleUser(data.addedBy) : null
	}
}

export interface SimpleBook {
 	id: number,
	name: string,
	desc: string,
	number: number,
	voContent: string,
	imgUrl: string,
	serieId: number | null,
	serieName: string | null
}

export function parseToSimpleBook(data: Record<string, any>): SimpleBook {
	return {
		id: data.id,
		name: data.name,
		desc: data.desc,
		number: data.number,
		voContent: data.voContent,
		imgUrl: data.imgUrl,
		serieId: data.serieId,
		serieName: data.serieName
	}
}

export interface ContributionBook {
	id?: number,
	name: string,
	desc?: string,
	number?: number,
	voContent?: string,
	imgUrl: string,
	serie: { id: number },
}

export function isSimpleBook(book: Book | SimpleBook): book is SimpleBook {
	return (book as SimpleBook).serieId !== undefined;
}

export function bookToSimpleBook(book: Book): SimpleBook {
	return {
		id: book.id,
		name: book.name,
		desc: book.desc,
		number: book.number,
		voContent: book.voContent,
		imgUrl: book.imgUrl,
		serieId: book.serie ? book.serie.id : null,
		serieName: book.serie ? book.serie.name : null,
	}
}
