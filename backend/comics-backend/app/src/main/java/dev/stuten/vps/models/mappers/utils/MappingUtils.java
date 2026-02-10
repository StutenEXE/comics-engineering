package dev.stuten.vps.models.mappers.utils;

import java.util.Arrays;
import java.util.List;

import org.jooq.Record;
import org.jooq.RecordMapper;
import org.jooq.Result;
import org.jooq.impl.TableImpl;
import org.jspecify.annotations.Nullable;

public final class MappingUtils {
    
    private MappingUtils() {}

    public static <T extends Record, @Nullable R> R getSingleDTOFromRecord(Record r, TableImpl<T> table, RecordMapper<Record, R> mapper) {
        T r2 = r.into(table);
        if (r2 == null) {
            return null;
        }
        R dto = r2.get(table.field(0)) != null ? r2.map(mapper) : null;
        return dto;
    }

    @SuppressWarnings("unchecked")
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

}
