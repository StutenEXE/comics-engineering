package dev.stuten.vps.services.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import dev.stuten.vps.models.dtos.request.search.SortingDTO;
import io.javalin.http.Context;

public class SortingServiceUtil {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    private SortingServiceUtil() {
    }

    public static <T extends Enum<T>> SortingDTO<T> getFromContext(Context ctx, Class<T> enumClass) {

        SortingDTO<T> sorting = new SortingDTO<>();

        String field = ctx.queryParam("sortField");
        if (field != null) {
            sorting.setField(readEnum(field, enumClass));
        }

        String direction = ctx.queryParam("sortDirection");
        if (direction != null) {
            sorting.setOrder(readEnum(direction, SortingDTO.SortDirection.class));
        }

        return sorting;
    }

    private static <E extends Enum<E>> E readEnum(String value, Class<E> enumClass) {
        try {
            return objectMapper.readValue("\"" + value + "\"", enumClass);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException(
                    "Invalid value '" + value + "' for " + enumClass.getSimpleName(), e);
        }
    }
}
