package dev.stuten.vps.models.mappers;

import static dev.stuten.vps.jooq.tables.IssueSeries.ISSUE_SERIES;
import static dev.stuten.vps.jooq.tables.Users.USERS;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.jooq.Record;
import org.jooq.TableField;

import dev.stuten.vps.jooq.tables.records.IssueSeriesRecord;
import dev.stuten.vps.models.dtos.full.IssueSerieDTO;
import dev.stuten.vps.models.dtos.simple.SimpleBookDTO;
import dev.stuten.vps.models.dtos.simple.SimpleIssueDTO;
import dev.stuten.vps.models.dtos.simple.SimpleIssueSerieDTO;
import dev.stuten.vps.models.dtos.simple.SimpleUserDTO;
import dev.stuten.vps.models.mappers.utils.MappingUtils;

public class IssueSerieMapper {
    private static Map<TableField<IssueSeriesRecord, ? extends Object>, String> fieldMapping = Map.of(
            ISSUE_SERIES.ID, "issue_serie_id",
            ISSUE_SERIES.NAME, "issue_serie_name",
            ISSUE_SERIES.DESC, "issue_serie_desc",
            ISSUE_SERIES.START_DATE, "issue_serie_start_date",
            ISSUE_SERIES.END_DATE, "issue_serie_end_date",
            ISSUE_SERIES.FANDOM_URL, "issue_serie_fandom_url",
            ISSUE_SERIES.ADDED_BY, "issue_serie_added_by",
            ISSUE_SERIES.CREATED_AT, "issue_serie_created_at",
            ISSUE_SERIES.MODIFIED_AT, "issue_serie_modified_at");

    public static String getFieldName(TableField<IssueSeriesRecord, ? extends Object> field) {
        return fieldMapping.get(field);
    }

    @SuppressWarnings("null")
    public static IssueSerieDTO mapToDTO(Record r) {
        // Map issues
        List<SimpleIssueDTO> issues = MappingUtils.getMultipleDTOFromRecord(r, "issues", IssueMapper::mapToSimpleDTO);
        // Map books
        List<SimpleBookDTO> books = MappingUtils.getMultipleDTOFromRecord(r, "books", BookMapper::mapToSimpleDTO);
        // Map user
        SimpleUserDTO user = MappingUtils.getSingleDTOFromRecord(r, USERS, UserMapper::mapToSimpleDTO);
        // Map issue serie
        IssueSerieDTO dto = IssueSerieDTO.builder()
                .id(r.get(getFieldName(ISSUE_SERIES.ID), Integer.class))
                .name(r.get(getFieldName(ISSUE_SERIES.NAME), String.class))
                .desc(r.get(getFieldName(ISSUE_SERIES.DESC), String.class))
                .startDate(r.get(getFieldName(ISSUE_SERIES.START_DATE), LocalDate.class))
                .endDate(r.get(getFieldName(ISSUE_SERIES.END_DATE), LocalDate.class))
                .fandomUrl(r.get(getFieldName(ISSUE_SERIES.FANDOM_URL), String.class))
                .issues(issues)
                .books(books)
                .createdAt(r.get(getFieldName(ISSUE_SERIES.CREATED_AT), LocalDateTime.class))
                .modifiedAt(r.get(getFieldName(ISSUE_SERIES.MODIFIED_AT), LocalDateTime.class))
                .addedBy(user)
                .build();
        return dto;
    }

    @SuppressWarnings("null")
    public static SimpleIssueSerieDTO mapToSimpleDTO(Record r) {
        SimpleIssueSerieDTO dto = SimpleIssueSerieDTO.builder()
                .id(r.get(getFieldName(ISSUE_SERIES.ID), Integer.class))
                .name(r.get(getFieldName(ISSUE_SERIES.NAME), String.class))
                .desc(r.get(getFieldName(ISSUE_SERIES.DESC), String.class))
                .startDate(r.get(getFieldName(ISSUE_SERIES.START_DATE), LocalDate.class))
                .endDate(r.get(getFieldName(ISSUE_SERIES.END_DATE), LocalDate.class))
                .fandomUrl(r.get(getFieldName(ISSUE_SERIES.FANDOM_URL), String.class))
                .build();
        return dto;
    }

    // public static IssueSerieDTO mapGenericMapToDTO(Map<String, Object> map) {
    // IssueSerieDTO dto = new IssueSerieDTO(
    // (Integer) map.get("id"),
    // (String) map.get("name"),
    // (String) map.get("desc"),
    // MappingUtils.stringToLocalDate((String) map.get("startDate")),
    // MappingUtils.stringToLocalDate((String) map.get("endDate")),
    // ((List<Map<String, Object>>)
    // map.get("issues")).stream().map(IssueMapper::mapGenericMapToSimpleDTO).toList(),
    // ((List<Map<String, Object>>)
    // map.get("books")).stream().map(BookMapper::mapGenericMapToSimpleDTO).toList(),
    // MappingUtils.stringToLocalDateTime((String) map.get("createdAt")),
    // MappingUtils.stringToLocalDateTime((String) map.get("modifiedAt")),
    // UserMapper.mapGenericMapToSimpleDTO((Map<String, Object>)
    // map.get("addedBy")));
    // return dto;
    // }

    // public static SimpleIssueSerieDTO mapGenericMapToSimpleDTO(Map<String,
    // Object> map) {
    // SimpleIssueSerieDTO dto = new SimpleIssueSerieDTO(
    // (Integer) map.get("id"),
    // (String) map.get("name"),
    // (String) map.get("desc"),
    // MappingUtils.stringToLocalDate((String) map.get("startDate")),
    // MappingUtils.stringToLocalDate((String) map.get("endDate")));
    // return dto;
    // }

}
