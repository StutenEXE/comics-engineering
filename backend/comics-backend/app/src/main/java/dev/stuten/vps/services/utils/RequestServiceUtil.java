package dev.stuten.vps.services.utils;

import java.util.Optional;

import dev.stuten.vps.web.ErrorCode;
import dev.stuten.vps.web.ErrorResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

/**
 * Helpers to read and validate request data. Every "require" method either
 * returns a valid value or throws an HTTP error (see ErrorResponse), so callers
 * never have to check for null.
 */
public class RequestServiceUtil {

    private RequestServiceUtil() {
    }

    /**
     * @return the "id" query parameter, 400 if missing or NaN
     */
    public static Integer requireId(Context ctx) {
        return requireIntParam(ctx, "id");
    }

    /**
     * @return the given integer query parameter, 400 if missing or NaN
     */
    public static Integer requireIntParam(Context ctx, String name) {
        try {
            return Integer.parseInt(ctx.queryParam(name));
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, ErrorCode.MISSING_ID,
                    "Missing '%s' or NaN '%s'".formatted(name, name));
            return null; // For compiler
        }
    }

    /**
     * @return the request body parsed as the given class, 400 if invalid
     */
    public static <T> T requireBody(Context ctx, Class<T> clazz) {
        try {
            return ctx.bodyAsClass(clazz);
        } catch (Exception e) {
            e.printStackTrace();
            ErrorResponse.send(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_REQUEST, "Invalid JSON body");
            return null; // For compiler
        }
    }

    /**
     * @param entityName name used in the error message (ex : "Book")
     * @return the entity, 404 with the given code if empty
     */
    public static <T> T requireFound(Optional<T> entity, ErrorCode code, String entityName, Object id) {
        if (entity.isEmpty()) {
            ErrorResponse.send(HttpStatus.NOT_FOUND, code, "%s of id %s not found".formatted(entityName, id));
        }
        return entity.get();
    }
}
