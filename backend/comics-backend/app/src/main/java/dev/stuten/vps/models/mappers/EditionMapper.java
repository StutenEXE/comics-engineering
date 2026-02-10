package dev.stuten.vps.models.mappers;

import static dev.stuten.vps.jooq.tables.Books.BOOKS;
import static dev.stuten.vps.jooq.tables.Editions.EDITIONS;
import static dev.stuten.vps.jooq.tables.Publishers.PUBLISHERS;
import static dev.stuten.vps.jooq.tables.Users.USERS;

import org.jooq.Record;

import dev.stuten.vps.jooq.tables.records.EditionsRecord;
import dev.stuten.vps.models.dtos.BookDTO;
import dev.stuten.vps.models.dtos.EditionDTO;
import dev.stuten.vps.models.dtos.PublisherDTO;
import dev.stuten.vps.models.dtos.UserDTO;
import dev.stuten.vps.models.mappers.utils.MappingUtils;

public class EditionMapper {

    public static EditionDTO mapToDTO(Record r) {
        // Map publisher        
        PublisherDTO publisher = MappingUtils.getSingleDTOFromRecord(r, PUBLISHERS, PublisherMapper::mapToDTO);

        // Map book
        BookDTO book = MappingUtils.getSingleDTOFromRecord(r, BOOKS, BookMapper::mapToDTO);

        // Map user
        UserDTO user = MappingUtils.getSingleDTOFromRecord(r, USERS, UserMapper::mapToDTO);

        EditionsRecord editionRecord = r.into(EDITIONS);
        EditionDTO dto = new EditionDTO(
                editionRecord.getId(),
                editionRecord.getIsbn(),
                editionRecord.getEan(),
                editionRecord.getPrice(),
                editionRecord.getUrl(),
                editionRecord.getImgUrl(),
                editionRecord.getCoverType(),
                editionRecord.getParutionDate(),
                publisher,
                book,
                editionRecord.getCreatedAt(),
                editionRecord.getModifiedAt(),
                user);
        return dto;
    }

}
