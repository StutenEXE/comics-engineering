package dev.stuten.vps.models.mappers;

import static dev.stuten.vps.jooq.tables.Series.SERIES;
import static dev.stuten.vps.jooq.tables.Users.USERS;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.jooq.Record;
import org.jooq.TableField;

import dev.stuten.vps.jooq.tables.records.SeriesRecord;
import dev.stuten.vps.models.dtos.full.SerieDTO;
import dev.stuten.vps.models.dtos.simple.SimpleBookDTO;
import dev.stuten.vps.models.dtos.simple.SimpleSerieDTO;
import dev.stuten.vps.models.dtos.simple.SimpleUserDTO;
import dev.stuten.vps.models.mappers.utils.MappingUtils;

public class SerieMapper {
    private static Map<TableField<SeriesRecord, ? extends Object>, String> fieldMapping = Map.of(
            SERIES.ID, "serie_id",
            SERIES.NAME, "serie_name",
            SERIES.ONGOING, "serie_ongoing",
            SERIES.ONESHOT, "serie_oneshot",
            SERIES.NVOLUMES, "serie_nvolumes",
            SERIES.START_DATE, "serie_start_date",
            SERIES.END_DATE, "serie_end_date",
            SERIES.ADDED_BY, "serie_added_by",
            SERIES.CREATED_AT, "serie_created_at",
            SERIES.MODIFIED_AT, "serie_modified_at");

    public static String getFieldName(TableField<SeriesRecord, ? extends Object> field) {
        return fieldMapping.get(field);
    }

    public static SerieDTO mapToDTO(Record r) {
        // Map books
        List<SimpleBookDTO> books = MappingUtils.getMultipleDTOFromRecord(r, "books", BookMapper::mapToSimpleDTO);
        // Map user
        SimpleUserDTO user = MappingUtils.getSingleDTOFromRecord(r, USERS, UserMapper::mapToSimpleDTO);
        SerieDTO dto = new SerieDTO(
                (Integer) r.get(getFieldName(SERIES.ID)),
                (String) r.get(getFieldName(SERIES.NAME)),
                (Boolean) r.get(getFieldName(SERIES.ONGOING)),
                (Boolean) r.get(getFieldName(SERIES.ONESHOT)),
                (Short) r.get(getFieldName(SERIES.NVOLUMES)),
                (LocalDate) r.get(getFieldName(SERIES.START_DATE)),
                (LocalDate) r.get(getFieldName(SERIES.END_DATE)),
                books,
                (LocalDateTime) r.get(getFieldName(SERIES.CREATED_AT)),
                (LocalDateTime) r.get(getFieldName(SERIES.MODIFIED_AT)),
                user);
        return dto;
    }

    public static SimpleSerieDTO mapToSimpleDTO(Record r) {
        return new SimpleSerieDTO(
                (Integer) r.get(getFieldName(SERIES.ID)),
                (String) r.get(getFieldName(SERIES.NAME)),
                (Boolean) r.get(getFieldName(SERIES.ONGOING)),
                (Boolean) r.get(getFieldName(SERIES.ONESHOT)),
                (Short) r.get(getFieldName(SERIES.NVOLUMES)),
                (LocalDate) r.get(getFieldName(SERIES.START_DATE)),
                (LocalDate) r.get(getFieldName(SERIES.END_DATE)));
    }
}
