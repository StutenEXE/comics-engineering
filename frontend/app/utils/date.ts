import { capitalize } from "@mui/material"

export function compareDates(a: Date, b: Date): number {
    return a.getTime() - b.getTime()
}

export function dateToMonthYearString(lang: string, date: Date | undefined | null): string {
    if (date === undefined || date === null) {
        return ""
    } 
    return capitalize(date.toLocaleDateString(lang, {
        weekday: undefined,
        year: "numeric",
        month: "long",
        day: undefined
    }))
}

export function dateToVerboseDateString(lang: string, date: Date | undefined | null): string {
    if (date === undefined || date === null) {
        return ""
    } 
    return date.toLocaleDateString(lang, {
        weekday: undefined,
        year: "numeric",
        month: "long",
        day: "numeric"
    })
}