package dev.stuten.vps.services.utils;

import dev.stuten.vps.models.dtos.request.search.PaginationDTO;
import dev.stuten.vps.web.ErrorResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class PaginationServiceUtil {
    /**
     * Parse pagination parameters from the HTTP context and return a populated
     * PaginationDTO. This method reads the "from" and "limit" query
     * parameters, converts them to integers and sets them on a new
     * PaginationDTO instance.
     *
     * If either parameter is missing or not a valid integer, an error
     * response is sent with status 400 (Bad Request) and the method returns
     * null.
     *
     * @param ctx the Javalin HTTP context containing query parameters
     * @return a PaginationDTO with "from" and "limit" set, or null if the
     *         request was invalid (an error response is sent to the client in that
     *         case)
     */
    public static PaginationDTO getFromContext(Context ctx) {
        PaginationDTO pagination = new PaginationDTO();

        try {
            pagination.setPage(Integer.parseInt(ctx.queryParam("page")));
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Missing page or NaN page (pagination)");
            return null;
        }

        try {
            pagination.setSize(Integer.parseInt(ctx.queryParam("size")));
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Missing size or NaN size (pagination)");
            return null;
        }

        return pagination;
    }
}
