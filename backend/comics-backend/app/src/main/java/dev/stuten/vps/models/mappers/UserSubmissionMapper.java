package dev.stuten.vps.models.mappers;

import static dev.stuten.vps.jooq.tables.UserSubmissions.USER_SUBMISSIONS;
import static dev.stuten.vps.jooq.tables.Users.USERS;

import java.util.List;

import org.jooq.Record;

import dev.stuten.vps.jooq.tables.records.UserSubmissionsRecord;
import dev.stuten.vps.models.dtos.UserDTO;
import dev.stuten.vps.models.dtos.UserSubmissionDTO;
import dev.stuten.vps.models.dtos.UserSubmissionDTO.UserSubmissionAction;
import dev.stuten.vps.models.dtos.UserSubmissionDTO.UserSubmissionType;
import dev.stuten.vps.models.mappers.utils.MappingUtils;

public class UserSubmissionMapper {

    public static UserSubmissionDTO mapToDTO(Record r) {
        // Map child user submissions
        List<UserSubmissionDTO> children = MappingUtils.getMultipleDTOFromRecord(r, "usersubmissions",
                UserSubmissionMapper::mapToDTO);

        // Map parent user submission
        UserSubmissionDTO parent = MappingUtils.getSingleDTOFromRecord(r, USER_SUBMISSIONS,
                UserSubmissionMapper::mapToDTO);

        // Map user
        UserDTO user = MappingUtils.getSingleDTOFromRecord(r, USERS, UserMapper::mapToDTO);

        UserSubmissionsRecord userSubmissionRecord = r.into(USER_SUBMISSIONS);
        UserSubmissionDTO dto = new UserSubmissionDTO(
                userSubmissionRecord.getId(),
                user,
                parent,
                children,
                UserSubmissionType.valueOf(userSubmissionRecord.getSubmissionType().getLiteral()),
                UserSubmissionAction.valueOf(userSubmissionRecord.getSubmissionAction().getLiteral()),
                userSubmissionRecord.getSubmissionData(),
                userSubmissionRecord.getNote(),
                userSubmissionRecord.getValidated(),
                userSubmissionRecord.getCreatedAt());
        return dto;
    }

}
