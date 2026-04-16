package dev.stuten.vps.models.mappers;

import static dev.stuten.vps.jooq.tables.IssueSeries.ISSUE_SERIES;
import static dev.stuten.vps.jooq.tables.Issues.ISSUES;
import static dev.stuten.vps.jooq.tables.Users.USERS;

import java.util.List;

import org.jooq.Record;

import dev.stuten.vps.jooq.tables.records.IssuesRecord;
import dev.stuten.vps.models.dtos.BookDTO;
import dev.stuten.vps.models.dtos.IssueDTO;
import dev.stuten.vps.models.dtos.IssueSerieDTO;
import dev.stuten.vps.models.dtos.UserDTO;
import dev.stuten.vps.models.mappers.utils.MappingUtils;

public class IssueMapper {
    
    public static IssueDTO mapToDTO(Record r) {
        // Map issue serie
        IssueSerieDTO issueSerie = MappingUtils.getSingleDTOFromRecord(r, ISSUE_SERIES, IssueSerieMapper::mapToDTO);

        // Map books
        List<BookDTO> books = MappingUtils.getMultipleDTOFromRecord(r, "books", BookMapper::mapToDTO);
        
        // Map user
        UserDTO user = MappingUtils.getSingleDTOFromRecord(r, USERS, UserMapper::mapToDTO);

        IssuesRecord issueRecord = r.into(ISSUES);
        IssueDTO dto = new IssueDTO(
                issueRecord.getId(),
                issueRecord.getName(),
                issueRecord.getNumber(),
                issueRecord.getCoverDate(),
                issueRecord.getParutionDate(),
                issueSerie,
                books,
                issueRecord.getCreatedAt(),
                issueRecord.getModifiedAt(),
                user
        );
        return dto;
    }

}
