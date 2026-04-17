package dev.stuten.vps.models.mappers;

import static dev.stuten.vps.jooq.tables.IssueSeries.ISSUE_SERIES;
import static dev.stuten.vps.jooq.tables.Users.USERS;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

import org.jooq.Record;
import org.jooq.TableField;

import dev.stuten.vps.jooq.tables.records.IssueSeriesRecord;
import dev.stuten.vps.models.dtos.full.IssueSerieDTO;
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
            ISSUE_SERIES.ADDED_BY, "issue_serie_added_by",
            ISSUE_SERIES.CREATED_AT, "issue_serie_created_at",
            ISSUE_SERIES.MODIFIED_AT, "issue_serie_modified_at");

    public static String getFieldName(TableField<IssueSeriesRecord, ? extends Object> field) {
        return fieldMapping.get(field);
    }

    public static IssueSerieDTO mapToDTO(Record r) {
        // Map issues
        List<SimpleIssueDTO> issues = MappingUtils.getMultipleDTOFromRecord(r, "issues", IssueMapper::mapToSimpleDTO);
        // Map user
        SimpleUserDTO user = MappingUtils.getSingleDTOFromRecord(r, USERS, UserMapper::mapToSimpleDTO);
        // Map issue serie
        IssueSerieDTO dto = new IssueSerieDTO(
                (Integer) r.get(getFieldName(ISSUE_SERIES.ID)),
                (String) r.get(getFieldName(ISSUE_SERIES.NAME)),
                (String) r.get(getFieldName(ISSUE_SERIES.DESC)),
                (LocalDate) r.get(getFieldName(ISSUE_SERIES.START_DATE)),
                (LocalDate) r.get(getFieldName(ISSUE_SERIES.END_DATE)),
                issues,
                (OffsetDateTime) r.get(getFieldName(ISSUE_SERIES.CREATED_AT)),
                (OffsetDateTime) r.get(getFieldName(ISSUE_SERIES.MODIFIED_AT)),
                user);
        return dto;
    }

    public static SimpleIssueSerieDTO mapToSimpleDTO(Record r) {
        SimpleIssueSerieDTO dto = new SimpleIssueSerieDTO(
                (Integer) r.get(getFieldName(ISSUE_SERIES.ID)),
                (String) r.get(getFieldName(ISSUE_SERIES.NAME)),
                (String) r.get(getFieldName(ISSUE_SERIES.DESC)),
                (LocalDate) r.get(getFieldName(ISSUE_SERIES.START_DATE)),
                (LocalDate) r.get(getFieldName(ISSUE_SERIES.END_DATE)));
        return dto;
    }

}
