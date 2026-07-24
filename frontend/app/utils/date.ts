import dayjs from "dayjs"
import z from "zod"
import { capitalize } from "./strings"

export function compareDates(a: string, b: string): number {
    return dayjs(a).valueOf() - dayjs(b).valueOf()
}

export function dateToMonthYearString(date: string | undefined | null): string {
    if (date === undefined || date === null) {
        return ""
    }
    return capitalize(dayjs(date).format("MMMM YYYY"))
}

export function dateToShortMonthYearString(date: string | undefined | null): string {
    if (date === undefined || date === null) {
        return ""
    }
    return dayjs(date).format("MMM YYYY")
}

export function dateToVerboseDateString(date: string | undefined | null): string {
    if (date === undefined || date === null) {
        return ""
    }
    return dayjs(date).format("D MMMM YYYY")
}

export function zDateRequired(error: string) {
    return z.preprocess(
        (val: string) => dayjs(val).isValid() ? val : null,
        z.string({ error: error })
    ) as z.ZodType<string>;
}

export function zDateOptional() {
    return z.preprocess(
        (val: string) => dayjs(val).isValid() ? val : null,
        z.string().nullable().optional()
    ) as z.ZodType<string | null | undefined>;
}

export function toHtmlInputString(d: string | undefined | null): string {
    return toYYYYmmDD(d);
}

export function toYYYYmmDD(d: string | undefined | null): string {
    return dayjs(d).format("YYYY-MM-DD")
}

export function toDDmmYYYY(d: string, locale: string): string {
    return dayjs(d).locale(locale).format("DD/MM/YYYY");
}