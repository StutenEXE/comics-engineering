import { capitalize } from "@mui/material"
import z from "zod"

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

export function zDateRequired(error: string) {
    return z.preprocess(
        (val) => (val instanceof Date && isNaN(val.getTime()) ? undefined : val),
        z.date({ error: error })
    ) as z.ZodType<Date>;
}

export function zDateOptional() {
    return z.preprocess(
        (val) => (val instanceof Date && isNaN(val.getTime()) ? null : val),
        z.date().nullable().optional()
    ) as z.ZodType<Date | null | undefined>;
}

export function toHtmlInputString(d: Date | undefined | null): string {
    if (!d || isNaN(d.getTime())) {
        return ""
    }
    var z  = (n: number) =>  ('0' + n).slice(-2);

    return `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}`; 
}

export function toYYYYmmDD(d: Date | undefined | null): string {
    if (!d || isNaN(d.getTime())) {
        return ""
    }
    if (typeof d === "string") {
        return d
    }
    return d.toISOString().split('T')[0];
}