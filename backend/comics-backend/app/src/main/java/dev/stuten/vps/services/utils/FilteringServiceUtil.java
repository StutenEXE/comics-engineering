package dev.stuten.vps.services.utils;

import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;

import io.javalin.http.Context;

public class FilteringServiceUtil {
    private static final ObjectMapper mapper = new ObjectMapper();

    public static <T> T getFromContext(Context ctx, Class<T> clazz) {
        Map<String, String> params = new HashMap<>();

        ctx.queryParamMap().forEach((k, v) -> {
            if (!v.isEmpty()) {
                params.put(k, v.getFirst());
            }
        });

        return mapper.convertValue(params, clazz);
    }
}
