
export type ScrapeResult = IsbnResult | IssueResult | IssueSerieResult | BookResult | EditionResult

function getTypecheckedData(res: ScrapeResult) {
    switch (res.resultType) {
        case ("isbn"): return res.result
        case ("issue"): return res.result
        case ("issueserie"): return res.result
        case ("book"): return res.result
        case ("edition"): return res.result
    }
}

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
        parutiontDate: string
        covertDate: string
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
}