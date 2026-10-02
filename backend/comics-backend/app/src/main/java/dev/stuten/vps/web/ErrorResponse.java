package dev.stuten.vps.web;

import java.util.HashMap;
import java.util.Map;

import io.javalin.http.HttpResponseException;
import io.javalin.http.HttpStatus;

// Error bodies sent to the client have the following "details" :
// - code : stable error code, translated by the frontend (see ErrorCode)
// - message : english debug message, never displayed as-is to users
// - field : (optional) form field the error relates to
public class ErrorResponse {

    private ErrorResponse() {
    }

    public static Map<String, String> buildDetails(ErrorCode code, String message, String field) {
        Map<String, String> details = new HashMap<>();
        details.put("code", code.code());
        details.put("message", message == null ? "" : message);
        if (field != null) {
            details.put("field", field);
        }
        return details;
    }

    // Fallback code for errors that were not thrown with an explicit code
    public static ErrorCode codeFromStatus(int status) {
        return switch (status) {
            case 400 -> ErrorCode.INVALID_REQUEST;
            case 401 -> ErrorCode.NOT_AUTHENTICATED;
            case 403 -> ErrorCode.FORBIDDEN;
            case 404 -> ErrorCode.NOT_FOUND;
            default -> ErrorCode.INTERNAL;
        };
    }

    public static void send(HttpStatus status, ErrorCode code, String message) {
        throw new HttpResponseException(status, code.code(), buildDetails(code, message, null));
    }

    // Error related to a specific field of a form
    public static void sendField(HttpStatus status, ErrorCode code, String field, String message) {
        throw new HttpResponseException(status, code.code(), buildDetails(code, message, field));
    }
}
