package dev.stuten.vps.models.mappers.utils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.jooq.JSONB;
import org.jooq.Record;
import org.jooq.RecordMapper;
import org.jooq.Result;
import org.jooq.impl.TableImpl;
import org.jspecify.annotations.Nullable;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

public final class MappingUtils {

    private MappingUtils() {
    }

    public static <T extends Record, @Nullable R> R getSingleDTOFromRecord(Record r, TableImpl<T> table,
            RecordMapper<Record, R> mapper) {
        R dto = r.map(mapper);
        return dto;
    }

    public static <R> List<R> getMultipleDTOFromRecord(Record r, String fieldName, RecordMapper<Record, R> mapper) {
        List<R> dtos = Arrays.asList();
        if (r.field(fieldName) != null) {
            Result<Record> records = r.get(fieldName, Result.class);
            dtos = records.stream()
                    .map(mapper)
                    .toList();
        }
        return dtos;
    }

    private static final TypeReference<Map<String, Object>> MAP_TYPE_REF = new TypeReference<Map<String, Object>>() {};

    public static Map<String, Object> jsonbToMap(JSONB jsonb) {
        if (jsonb == null) return null;
        try {
            return new ObjectMapper().readValue(jsonb.data(), MAP_TYPE_REF);
        } catch (Exception e) {
            return null;
        }
    }

    public static JSONB mapToJsonb(Map<String, Object> map) {
        if (map == null) return null;
        try {
            return JSONB.valueOf(new ObjectMapper().writeValueAsString(map));
        } catch (Exception e) {
            return null;
        }
    }

    private static final DateTimeFormatter LOCAL_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter LOCAL_DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    public static LocalDate stringToLocalDate(String date) {
        if (date == null) return null;
        return LocalDate.parse(date, LOCAL_DATE_FORMATTER);
    }

    public static LocalDateTime stringToLocalDateTime(String dateTime) {
        if (dateTime == null) return null;
        return LocalDateTime.parse(dateTime, LOCAL_DATETIME_FORMATTER);
    }
}
