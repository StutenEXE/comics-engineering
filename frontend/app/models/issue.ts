import { parseDataToBook, type Book } from "./book"
import { parseDataToIssueSerie, type IssueSerie } from "./issue-serie"
import { parseDataToUser, type User } from "./user"

export interface Issue {
    id: number,
    name: string,
    number: number,
    coverDate: Date,
    parutionDate: Date,
    isAnnual: boolean,
    isBackup: boolean, // not returned by api
    hasBackup: boolean,
    backupName: string,
    issueSerie: IssueSerie | null,
    books: Book[]
    createdAt: Date,
    modifiedAt: Date,
    addedBy: User
}

// Utility function to transform the api data to an instance of Issue
export function parseDataToIssue(data: Record<string, any>): Issue {
    return {
        id: data.id,
        name: data.name,
        number: data.number,
        coverDate: new Date(data.coverDate),
        parutionDate: new Date(data.parutionDate),
        isAnnual: data.isAnnual,
        isBackup: false,
        hasBackup: data.hasBackup,
        backupName: data.backupName,
        issueSerie: data.issueSerie ? parseDataToIssueSerie(data.issueSerie) : null,
        books: data.books?.map((bk: Record<string, any>) => parseDataToBook(bk)) ?? [],
        createdAt: new Date(data.createdAt),
        modifiedAt: new Date(data.modifiedAt),
        addedBy: parseDataToUser(data.addedBy)
    }
}

export function createBackupFromIssue(is: Issue): Issue | null {
    if (!is.hasBackup) {
        return null
    }
    let backup = {
        ...is,
        name: is.backupName,
        isBackup: true,
        hasBackup: false,
        backupName: ""
    }
    return backup
}

export function buildIssueShortName(is: Issue | null): string {
    if (!is) {
        return "";
    }
    let shortTitle = `${is.issueSerie?.name}` 
    if (is.isAnnual) {
        shortTitle = `${shortTitle} ${is.parutionDate.getFullYear} Annual`
    }
    if (is.isBackup) {
        shortTitle = `${shortTitle} (backup)`
    }
    return `${shortTitle} #${is.number}`
}