package dev.stuten.vps.models.mappers;

import static dev.stuten.vps.jooq.tables.IssueSeries.ISSUE_SERIES;
import static dev.stuten.vps.jooq.tables.Users.USERS;

import java.util.List;

import org.jooq.Record;

import dev.stuten.vps.jooq.tables.records.IssueSeriesRecord;
import dev.stuten.vps.models.dtos.IssueDTO;
import dev.stuten.vps.models.dtos.IssueSerieDTO;
import dev.stuten.vps.models.dtos.UserDTO;
import dev.stuten.vps.models.mappers.utils.MappingUtils;

public class IssueSerieMapper {

    public static IssueSerieDTO mapToDTO(Record r) {
        // Map issues
        List<IssueDTO> issues = MappingUtils.getMultipleDTOFromRecord(r, "issues", IssueMapper::mapToDTO); 

        // Map user
        UserDTO user = MappingUtils.getSingleDTOFromRecord(r, USERS, UserMapper::mapToDTO); 

        IssueSeriesRecord issueRecord = r.into(ISSUE_SERIES);
        IssueSerieDTO dto = new IssueSerieDTO(
                issueRecord.getId(),
                issueRecord.getName(),
                issueRecord.getDesc(),
                issueRecord.getVoStart(),
                issueRecord.getVoEnd(),
                issues,
                issueRecord.getCreatedAt(),
                issueRecord.getModifiedAt(),
                user);
        return dto;
    }

}
