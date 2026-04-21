package dev.stuten.vps.models.mappers;

import static dev.stuten.vps.jooq.tables.IssueSeries.ISSUE_SERIES;
import static dev.stuten.vps.jooq.tables.Issues.ISSUES;
import static dev.stuten.vps.jooq.tables.Users.USERS;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.jooq.Record;
import org.jooq.TableField;

import dev.stuten.vps.models.dtos.full.IssueDTO;
import dev.stuten.vps.models.dtos.simple.SimpleBookDTO;
import dev.stuten.vps.models.dtos.simple.SimpleIssueDTO;
import dev.stuten.vps.models.dtos.simple.SimpleIssueSerieDTO;
import dev.stuten.vps.models.dtos.simple.SimpleUserDTO;
import dev.stuten.vps.models.mappers.utils.MappingUtils;

public class IssueMapper {
    private static Map<TableField<? extends Record, ? extends Object>, String> fieldMapping = Map.of(
            ISSUES.ID, "issue_id",
            ISSUES.NAME, "issue_name",
            ISSUES.NUMBER, "issue_number",
            ISSUES.COVER_DATE, "issue_cover_date",
            ISSUES.PARUTION_DATE, "issue_parution_date",
            ISSUES.SERIES_ID, "issue_issue_series_id",
            ISSUE_SERIES.NAME, "issue_issue_series_name",
            ISSUES.ADDED_BY, "issue_added_by",
            ISSUES.CREATED_AT, "issue_created_at",
            ISSUES.MODIFIED_AT, "issue_modified_at");

    public static String getFieldName(TableField<? extends Record, ? extends Object> field) {
        return fieldMapping.get(field);
    }

    public static IssueDTO mapToDTO(Record r) {
        // Map issue serie
        SimpleIssueSerieDTO issueSerie = MappingUtils.getSingleDTOFromRecord(r, ISSUE_SERIES,
                IssueSerieMapper::mapToSimpleDTO);
        // Map books
        List<SimpleBookDTO> books = MappingUtils.getMultipleDTOFromRecord(r, "books", BookMapper::mapToSimpleDTO);
        // Map user
        SimpleUserDTO user = MappingUtils.getSingleDTOFromRecord(r, USERS, UserMapper::mapToSimpleDTO);

        IssueDTO dto = new IssueDTO(
                r.get(getFieldName(ISSUES.ID), Integer.class),
                r.get(getFieldName(ISSUES.NAME), String.class),
                r.get(getFieldName(ISSUES.NUMBER), Integer.class),
                r.get(getFieldName(ISSUES.COVER_DATE), LocalDate.class),
                r.get(getFieldName(ISSUES.PARUTION_DATE), LocalDate.class),
                issueSerie,
                books,
                r.get(getFieldName(ISSUES.CREATED_AT), LocalDateTime.class),
                r.get(getFieldName(ISSUES.MODIFIED_AT), LocalDateTime.class),
                user);
        return dto;
    }

    public static SimpleIssueDTO mapToSimpleDTO(Record r) {
        SimpleIssueDTO dto = new SimpleIssueDTO(
                r.get(getFieldName(ISSUES.ID), Integer.class),
                r.get(getFieldName(ISSUES.NAME), String.class),
                r.get(getFieldName(ISSUES.NUMBER), Integer.class),
                r.get(getFieldName(ISSUES.COVER_DATE), LocalDate.class),
                r.get(getFieldName(ISSUES.PARUTION_DATE), LocalDate.class),
                r.get(getFieldName(ISSUES.SERIES_ID), Integer.class),
                r.get(getFieldName(ISSUE_SERIES.NAME), String.class));
        return dto;
    }

    public static IssueDTO mapGenericMapToDTO(Map<String, Object> map) {
        IssueDTO dto = new IssueDTO(
                (Integer) map.get("id"),
                (String) map.get("name"),
                (Integer) map.get("number"),
                MappingUtils.stringToLocalDate((String) map.get("coverDate")),
                MappingUtils.stringToLocalDate((String) map.get("parutionDate")),
                IssueSerieMapper.mapGenericMapToSimpleDTO((Map<String, Object>) map.get("issueSerie")),
                ((List<Map<String, Object>>) map.get("books")).stream().map(BookMapper::mapGenericMapToSimpleDTO).toList(),
                MappingUtils.stringToLocalDateTime((String) map.get("createdAt")),
                MappingUtils.stringToLocalDateTime((String) map.get("modifiedAt")),
                UserMapper.mapGenericMapToSimpleDTO((Map<String, Object>) map.get("addedBy")));
        return dto;
    }

    public static SimpleIssueDTO mapGenericMapToSimpleDTO(Map<String, Object> map) {
        SimpleIssueDTO dto = new SimpleIssueDTO(
                (Integer) map.get("id"),
                (String) map.get("name"),
                (Integer) map.get("number"),
                MappingUtils.stringToLocalDate((String) map.get("coverDate")),
                MappingUtils.stringToLocalDate((String) map.get("parutionDate")),
                (Integer) map.get("seriesId"),
                (String) map.get("issueSerieName"));
        return dto;
    }
}
