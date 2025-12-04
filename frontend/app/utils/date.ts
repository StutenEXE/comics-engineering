
export function compareDates(a: Date, b: Date) {
    return a.getTime() - b.getTime()
}

export function dateToVerboseDateString(lang: string, date: Date | undefined) {
    if (date === undefined) {
        return ""
    } 
    return date.toLocaleDateString(lang, {
        weekday: undefined,
        year: "numeric",
        month: "long",
        day: "numeric"
    })
}