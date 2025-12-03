

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