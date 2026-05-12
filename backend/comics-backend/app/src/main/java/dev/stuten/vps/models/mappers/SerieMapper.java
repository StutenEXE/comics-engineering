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

    @SuppressWarnings("null")
    public static SerieDTO mapToDTO(Record r) {
        // Map books
        List<SimpleBookDTO> books = MappingUtils.getMultipleDTOFromRecord(r, "books", BookMapper::mapToSimpleDTO);
        // Map user
        SimpleUserDTO user = MappingUtils.getSingleDTOFromRecord(r, USERS, UserMapper::mapToSimpleDTO);
        SerieDTO dto = SerieDTO.builder()
                .id(r.get(getFieldName(SERIES.ID), Integer.class))
                .name(r.get(getFieldName(SERIES.NAME), String.class))
                .ongoing(r.get(getFieldName(SERIES.ONGOING), Boolean.class))
                .oneshot(r.get(getFieldName(SERIES.ONESHOT), Boolean.class))
                .nvolumes(r.get(getFieldName(SERIES.NVOLUMES), Short.class))
                .startDate(r.get(getFieldName(SERIES.START_DATE), LocalDate.class))
                .endDate(r.get(getFieldName(SERIES.END_DATE), LocalDate.class))
                .books(books)
                .createdAt(r.get(getFieldName(SERIES.CREATED_AT), LocalDateTime.class))
                .modifiedAt(r.get(getFieldName(SERIES.MODIFIED_AT), LocalDateTime.class))
                .addedBy(user)
                .build();
        return dto;
    }

    public static SimpleSerieDTO mapToSimpleDTO(Record r) {
        return SimpleSerieDTO.builder()
                .id(r.get(getFieldName(SERIES.ID), Integer.class))
                .name(r.get(getFieldName(SERIES.NAME), String.class))
                .ongoing(r.get(getFieldName(SERIES.ONGOING), Boolean.class))
                .oneshot(r.get(getFieldName(SERIES.ONESHOT), Boolean.class))
                .nvolumes(r.get(getFieldName(SERIES.NVOLUMES), Short.class))
                .startDate(r.get(getFieldName(SERIES.START_DATE), LocalDate.class))
                .endDate(r.get(getFieldName(SERIES.END_DATE), LocalDate.class))
                .build();
    }

    // public static SerieDTO mapGenericMapToDTO(Map<String, Object> map) {
    // SerieDTO dto = new SerieDTO(
    // (Integer) map.get("id"),
    // (String) map.get("name"),
    // (Boolean) map.get("ongoing"),
    // (Boolean) map.get("oneshot"),
    // ((Integer) map.get("nvolumes")).shortValue(),
    // MappingUtils.stringToLocalDate((String) map.get("startDate")),
    // MappingUtils.stringToLocalDate((String) map.get("endDate")),
    // (List<SimpleBookDTO>) map.get("books"),
    // MappingUtils.stringToLocalDateTime((String) map.get("createdAt")),
    // MappingUtils.stringToLocalDateTime((String) map.get("modifiedAt")),
    // UserMapper.mapGenericMapToSimpleDTO((Map<String, Object>)
    // map.get("addedBy")));
    // return dto;
    // }

    // public static SimpleSerieDTO mapGenericMapToSimpleDTO(Map<String, Object>
    // map) {
    // SimpleSerieDTO dto = new SimpleSerieDTO(
    // (Integer) map.get("id"),
    // (String) map.get("name"),
    // (Boolean) map.get("ongoing"),
    // (Boolean) map.get("oneshot"),
    // map.get("nvolumes") == null ? null
    // : ((Integer) map.get("nvolumes")).shortValue(),
    // MappingUtils.stringToLocalDate((String) map.get("startDate")),
    // MappingUtils.stringToLocalDate((String) map.get("endDate")));
    // return dto;
    // }
}
