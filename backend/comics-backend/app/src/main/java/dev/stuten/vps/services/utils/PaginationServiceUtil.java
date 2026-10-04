package dev.stuten.vps.services.utils;

import dev.stuten.vps.models.dtos.request.search.PaginationDTO;
import dev.stuten.vps.web.ErrorCode;
import dev.stuten.vps.web.ErrorResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class PaginationServiceUtil {

    private PaginationServiceUtil() {
    }

    /**
     * Reads the mandatory "from" and "limit" query parameters.
     *
     * @return the pagination, 400 if a parameter is missing, NaN, or out of
     *         bounds ('from' < 0 or 'limit' <= 0)
     */
    public static PaginationDTO getFromContext(Context ctx) {
        PaginationDTO pagination;
        try {
            pagination = new PaginationDTO(
                    Integer.parseInt(ctx.queryParam("from")),
                    Integer.parseInt(ctx.queryParam("limit")));
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_PAGINATION,
                    "Missing 'from' or 'limit' or NaN 'from' or 'limit'");
            return null; // For compiler
        }

        if (pagination.getFrom() < 0 || pagination.getLimit() <= 0) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_PAGINATION, "'from' < 0 or 'limit' <= 0");
        }

        return pagination;
    }

    /**
     * Same as getFromContext, but pagination is optional : if neither "from" nor
     * "limit" is given, returns null (meaning "no pagination", see
     * DAO.selectPage).
     */
    public static PaginationDTO getOptionalFromContext(Context ctx) {
        if (ctx.queryParam("from") == null && ctx.queryParam("limit") == null) {
            return null;
        }
        return getFromContext(ctx);
    }
}
