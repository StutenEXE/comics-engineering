import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { TranslationKeys } from "~/i18n/i18n";

// Error details sent by the API
// - code : stable error code, translated with the "apierror.<code>" i18n key
// - message : english debug message, never displayed as-is to users
// - field : (optional) form field the error relates to
export interface ApiErrorDetails {
  code: string;
  message?: string;
  field?: string;
}

export interface Error {
  status: number | string;
  details: ApiErrorDetails;
}

const UNKNOWN_ERROR_CODE = "unknown";

const UNKNOWN_ERROR: Error = {
  status: 0,
  details: {
    code: UNKNOWN_ERROR_CODE,
  },
};

export function createError(
  error: FetchBaseQueryError | SerializedError | undefined,
): Error | undefined {
  if (error === undefined) {
    return undefined;
  }
  // Is a FetchbaseQueryError
  if ("status" in error) {
    // Server could not be reached, there is no response body
    if (error.status === "FETCH_ERROR" || error.status === "TIMEOUT_ERROR") {
      return {
        status: error.status,
        details: { code: "network", message: error.error },
      };
    }
    const details = (
      error.data as { details?: Partial<ApiErrorDetails> } | undefined
    )?.details;
    return {
      status: error.status,
      details: {
        code: details?.code || UNKNOWN_ERROR_CODE,
        message: details?.message,
        field: details?.field,
      },
    };
  }
  return UNKNOWN_ERROR;
}

// Retreives the error details from either an already parsed error, or a raw RTK Query error
// (e.g. the one thrown by a mutation's unwrap())
export function getApiErrorDetails(
  error: unknown,
): ApiErrorDetails | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }
  // Already parsed error
  if ("details" in error && (error as Error).details?.code) {
    return (error as Error).details;
  }
  return createError(error as FetchBaseQueryError)?.details;
}

// Translates an API error into a user friendly message
// Falls back on fallbackKey if the error code is unknown or has no translation
export function translateApiError(
  error: unknown,
  t: (key: TranslationKeys) => string,
  fallbackKey: TranslationKeys = "apierror.unknown",
): string {
  const code = getApiErrorDetails(error)?.code;
  if (!code || code === UNKNOWN_ERROR_CODE) {
    return t(fallbackKey);
  }
  const key = `apierror.${code}` as TranslationKeys;
  const message = t(key);
  // The translation function returns the key itself when no translation exists
  return message === key ? t(fallbackKey) : message;
}

// Displays an API error in a form : under the related field if the API sent one that
// exists in the form, as a toast otherwise
export function showApiFormError<T extends FieldValues>(
  error: unknown,
  t: (key: TranslationKeys) => string,
  setError: UseFormSetError<T>,
  formFields: Path<T>[],
  toastError: (message: string) => void,
  fallbackKey?: TranslationKeys,
): void {
  const message = translateApiError(error, t, fallbackKey);
  const field = getApiErrorDetails(error)?.field as Path<T> | undefined;
  if (field && formFields.includes(field)) {
    setError(field, { type: "server", message }, { shouldFocus: true });
  } else {
    toastError(message);
  }
}
