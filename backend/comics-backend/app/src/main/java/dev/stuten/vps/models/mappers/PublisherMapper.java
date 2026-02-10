package dev.stuten.vps.models.mappers;

import static dev.stuten.vps.jooq.tables.Publishers.PUBLISHERS;

import java.util.List;

import org.jooq.Record;

import dev.stuten.vps.jooq.tables.records.PublishersRecord;
import dev.stuten.vps.models.dtos.EditionDTO;
import dev.stuten.vps.models.dtos.PublisherDTO;
import dev.stuten.vps.models.mappers.utils.MappingUtils;

public class PublisherMapper {

    public static PublisherDTO mapToDTO(Record r) {
        // Map editions
        List<EditionDTO> editions = MappingUtils.getMultipleDTOFromRecord(r, "editions", EditionMapper::mapToDTO);

        PublishersRecord publisherRecord = r.into(PUBLISHERS);
        PublisherDTO dto = new PublisherDTO(
                publisherRecord.getId(),
                publisherRecord.getName(),
                editions,
                publisherRecord.getCreatedAt(),
                publisherRecord.getModifiedAt());
        return dto;
    }

}
