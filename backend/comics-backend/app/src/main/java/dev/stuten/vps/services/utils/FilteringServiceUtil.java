package dev.stuten.vps.services.utils;

import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;

import dev.stuten.vps.web.ErrorCode;
import dev.stuten.vps.web.ErrorResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class FilteringServiceUtil {
    private static final ObjectMapper mapper = new ObjectMapper();

    private FilteringServiceUtil() {
    }

    /**
     * Maps the query parameters to the given filter class.
     *
     * @return the filter, 400 if a parameter has an invalid value
     */
    public static <T> T getFromContext(Context ctx, Class<T> clazz) {
        Map<String, String> params = new HashMap<>();

        ctx.queryParamMap().forEach((k, v) -> {
            if (!v.isEmpty()) {
                params.put(k, v.getFirst());
            }
        });

        try {
            return mapper.convertValue(params, clazz);
        } catch (IllegalArgumentException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_REQUEST, "Invalid filter : " + e.getMessage());
            return null; // For compiler
        }
    }
}
