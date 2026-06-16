type ResultType = "isbn" | "issue" | "issueSerie" | "book" | "edition"

export type ScrapeResult = IsbnResult | IssueResult | IssueSerieResult | BookResult | EditionResult

// export function getTypecheckedData(res: ScrapeResult, type: ResultType) {
//     if (res.resultType === type) {
//         return res.result
//     }
// }

interface IsbnResult {
    resultType: "isbn"
    result: {
        book: BookResultData
        edition: EditionResultData
    }
}

interface IssueResult {
    resultType: "issue"
    result: {
        name: string
        number: number
        parutionDate: string
        coverDate: string
    }
}

interface IssueSerieResult {
    resultType: "issueserie"
    result: {
        name: string
        description: string
        startDate: string
        endDate: string
    }
}

interface BookResult {
    resultType: "book"
    result: BookResultData
}

interface BookResultData {
    title: string
    description: string
    cover: string
    authors: string[]
}

interface EditionResult {
    resultType: "edition"
    result: EditionResultData
}

interface EditionResultData {
    isbn10: string
    isbn13: string
    publisher: string
    pageCount: number
    cover: string
    publishDate: string
    dimensions: {
        height: number
        width: number
        thickness: number
    }
}