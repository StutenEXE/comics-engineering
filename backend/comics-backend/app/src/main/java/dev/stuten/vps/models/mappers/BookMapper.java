package dev.stuten.vps.models.mappers;

import static dev.stuten.vps.jooq.tables.Series.SERIES;
import static dev.stuten.vps.jooq.tables.Users.USERS;

import java.util.List;

import org.jooq.Record;

import dev.stuten.vps.jooq.tables.Books;
import dev.stuten.vps.jooq.tables.records.BooksRecord;
import dev.stuten.vps.models.dtos.BookDTO;
import dev.stuten.vps.models.dtos.EditionDTO;
import dev.stuten.vps.models.dtos.IssueDTO;
import dev.stuten.vps.models.dtos.SerieDTO;
import dev.stuten.vps.models.dtos.UserDTO;
import dev.stuten.vps.models.mappers.utils.MappingUtils;

public class BookMapper {

    public static BookDTO mapToDTO(Record r) {
        // Map serie
        SerieDTO serie = MappingUtils.getSingleDTOFromRecord(r, SERIES, SerieMapper::mapToDTO);

        // Map to editions
        List<EditionDTO> editions = MappingUtils.getMultipleDTOFromRecord(r, "editions", EditionMapper::mapToDTO);

        // Map issues
        List<IssueDTO> issues = MappingUtils.getMultipleDTOFromRecord(r, "issues", IssueMapper::mapToDTO);

        // Map user
        UserDTO user = MappingUtils.getSingleDTOFromRecord(r, USERS, UserMapper::mapToDTO);

        // Map book 
        BooksRecord bookRecord = r.into(Books.BOOKS);
        BookDTO dto = new BookDTO(
                bookRecord.getId(),
                bookRecord.getName(),
                bookRecord.getDesc(),
                bookRecord.getNumber(), 
                bookRecord.getVoContent(),
                bookRecord.getImgUrl(),
                serie,
                editions,
                issues,
                bookRecord.getCreatedAt(),
                bookRecord.getModifiedAt(),
                user);
        return dto;
    }

}
