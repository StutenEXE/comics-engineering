import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { capitalize } from "./strings";

export interface Error {
    status: number | string;
    error: string;
}

const UNKNOWN_ERROR = {
    status: 0,
    error: "Unkown error"
}

export function createError(error: FetchBaseQueryError | SerializedError | undefined): Error | undefined {
    if (error === undefined) {
        return undefined
    }
    // Is a FetchbaseQueryError
    if ('data' in error){
        let err = error.data as Error
        return {
            status: error.status,
            error: capitalize(err.error)
        }
    }
    return UNKNOWN_ERROR
}

