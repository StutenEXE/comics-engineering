package dev.stuten.vps.models.mappers;

import static dev.stuten.vps.jooq.tables.IssueSeries.ISSUE_SERIES;
import static dev.stuten.vps.jooq.tables.Issues.ISSUES;
import static dev.stuten.vps.jooq.tables.Users.USERS;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

import org.jooq.Record;
import org.jooq.TableField;

import dev.stuten.vps.jooq.tables.records.IssuesRecord;
import dev.stuten.vps.models.dtos.full.IssueDTO;
import dev.stuten.vps.models.dtos.simple.SimpleBookDTO;
import dev.stuten.vps.models.dtos.simple.SimpleIssueDTO;
import dev.stuten.vps.models.dtos.simple.SimpleIssueSerieDTO;
import dev.stuten.vps.models.dtos.simple.SimpleUserDTO;
import dev.stuten.vps.models.mappers.utils.MappingUtils;

public class IssueMapper {
    private static Map<TableField<IssuesRecord, ? extends Object>, String> fieldMapping = Map.of(
            ISSUES.ID, "issue_id",
            ISSUES.NAME, "issue_name",
            ISSUES.NUMBER, "issue_number",
            ISSUES.COVER_DATE, "issue_cover_date",
            ISSUES.PARUTION_DATE, "issue_parution_date",
            ISSUES.SERIES_ID, "issue_issue_series_id",
            ISSUES.ADDED_BY, "issue_added_by",
            ISSUES.CREATED_AT, "issue_created_at",
            ISSUES.MODIFIED_AT, "issue_modified_at"
        );

    public static String getFieldName(TableField<IssuesRecord, ? extends Object> field) {
        return fieldMapping.get(field);
    }

    public static IssueDTO mapToDTO(Record r) {
        // Map issue serie
        SimpleIssueSerieDTO issueSerie = MappingUtils.getSingleDTOFromRecord(r, ISSUE_SERIES, IssueSerieMapper::mapToSimpleDTO);
        // Map books
        List<SimpleBookDTO> books = MappingUtils.getMultipleDTOFromRecord(r, "books", BookMapper::mapToSimpleDTO);
        // Map user
        SimpleUserDTO user = MappingUtils.getSingleDTOFromRecord(r, USERS, UserMapper::mapToSimpleDTO);

        IssueDTO dto = new IssueDTO(
                (Integer) r.get(getFieldName(ISSUES.ID)),
                (String) r.get(getFieldName(ISSUES.NAME)),
                (Integer) r.get(getFieldName(ISSUES.NUMBER)),
                (LocalDate) r.get(getFieldName(ISSUES.COVER_DATE)),
                (LocalDate) r.get(getFieldName(ISSUES.PARUTION_DATE)),
                issueSerie,
                books,
                (OffsetDateTime) r.get(getFieldName(ISSUES.CREATED_AT)),
                (OffsetDateTime) r.get(getFieldName(ISSUES.MODIFIED_AT)),
                user);
        return dto;
    }

    public static SimpleIssueDTO mapToSimpleDTO(Record r) {
        SimpleIssueDTO dto = new SimpleIssueDTO(
                (Integer) r.get(getFieldName(ISSUES.ID)),
                (String) r.get(getFieldName(ISSUES.NAME)),
                (Integer) r.get(getFieldName(ISSUES.NUMBER)),
                (LocalDate) r.get(getFieldName(ISSUES.COVER_DATE)),
                (LocalDate) r.get(getFieldName(ISSUES.PARUTION_DATE)),
                (Integer) r.get(getFieldName(ISSUES.SERIES_ID)));
        return dto;
    }

}
