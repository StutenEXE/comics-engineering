import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { capitalize } from "./strings";

export interface Error {
    status: number | string;
    details: {
        error: string;
        message?: string
    };
}

const UNKNOWN_ERROR = {
    status: 0,
    details: {
        error: "Unkown error"
    }
}

export function createError(error: FetchBaseQueryError | SerializedError | undefined): Error | undefined {
    if (error === undefined) {
        return undefined
    }
    console.log(error)
    // Is a FetchbaseQueryError
    if ('data' in error) {
        let err = error.data as Error
        return {
            status: error.status,
            details: {
                error: capitalize(err.details.error || ""),
                message: err.details.message ? capitalize(err.details.message) : undefined
            }
        }
    }
    return UNKNOWN_ERROR
}

