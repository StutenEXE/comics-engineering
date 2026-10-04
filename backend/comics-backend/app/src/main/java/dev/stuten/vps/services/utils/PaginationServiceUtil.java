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
     * Reads the "offset" (number of elements to skip) and "limit" (maximum
     * number of elements returned) query parameters. A missing parameter takes
     * its default value (see PaginationDTO).
     *
     * @return the pagination, 400 if a parameter is NaN or out of bounds
     *         ('offset' < 0, 'limit' <= 0 or 'limit' > PaginationDTO.MAX_LIMIT)
     */
    public static PaginationDTO getFromContext(Context ctx) {
        PaginationDTO pagination = new PaginationDTO();
        try {
            if (ctx.queryParam("offset") != null) {
                pagination.setOffset(Integer.parseInt(ctx.queryParam("offset")));
            }
            if (ctx.queryParam("limit") != null) {
                pagination.setLimit(Integer.parseInt(ctx.queryParam("limit")));
            }
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_PAGINATION, "NaN 'offset' or 'limit'");
        }

        if (pagination.getOffset() < 0 || pagination.getLimit() <= 0
                || pagination.getLimit() > PaginationDTO.MAX_LIMIT) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_PAGINATION,
                    "'offset' < 0 or 'limit' not in [1, %d]".formatted(PaginationDTO.MAX_LIMIT));
        }

        return pagination;
    }

    /**
     * Same as getFromContext, but pagination is optional : if neither "offset"
     * nor "limit" is given, returns null (meaning "no pagination", see
     * DAO.selectPage).
     */
    public static PaginationDTO getOptionalFromContext(Context ctx) {
        if (ctx.queryParam("offset") == null && ctx.queryParam("limit") == null) {
            return null;
        }
        return getFromContext(ctx);
    }
}
