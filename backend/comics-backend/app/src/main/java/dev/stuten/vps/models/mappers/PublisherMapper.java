package dev.stuten.vps.models.mappers;

import static dev.stuten.vps.jooq.tables.Publishers.PUBLISHERS;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.jooq.Record;
import org.jooq.TableField;

import dev.stuten.vps.jooq.tables.records.PublishersRecord;
import dev.stuten.vps.models.dtos.full.PublisherDTO;
import dev.stuten.vps.models.dtos.simple.SimpleEditionDTO;
import dev.stuten.vps.models.dtos.simple.SimplePublisherDTO;
import dev.stuten.vps.models.mappers.utils.MappingUtils;

public class PublisherMapper {
    private static Map<TableField<PublishersRecord, ? extends Object>, String> fieldMapping = Map.of(
        PUBLISHERS.ID, "publisher_id",
        PUBLISHERS.NAME, "publisher_name",
        PUBLISHERS.CREATED_AT, "publisher_created_at",
        PUBLISHERS.MODIFIED_AT, "publisher_modified_at"
    );

    public static String getFieldName(TableField<PublishersRecord, ? extends Object> field) {
        return fieldMapping.get(field);
    }

    public static PublisherDTO mapToDTO(Record r) {
        // Map editions
        List<SimpleEditionDTO> editions = MappingUtils.getMultipleDTOFromRecord(r, "editions", EditionMapper::mapToSimpleDTO);
        // Map publisher
        PublisherDTO dto = new PublisherDTO(
                (Integer) r.get(getFieldName(PUBLISHERS.ID)),
                (String) r.get(getFieldName(PUBLISHERS.NAME)),
                editions,
                (LocalDateTime) r.get(getFieldName(PUBLISHERS.CREATED_AT)),
                (LocalDateTime) r.get(getFieldName(PUBLISHERS.MODIFIED_AT)));
        return dto;
    }
    
    public static SimplePublisherDTO mapToSimpleDTO(Record r) {
        SimplePublisherDTO dto = new SimplePublisherDTO(
                (Integer) r.get(getFieldName(PUBLISHERS.ID)),
                (String) r.get(getFieldName(PUBLISHERS.NAME)));
        return dto;
    }



}
