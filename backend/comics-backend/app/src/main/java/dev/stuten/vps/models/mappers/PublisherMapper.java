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
            PUBLISHERS.MODIFIED_AT, "publisher_modified_at");

    public static String getFieldName(TableField<PublishersRecord, ? extends Object> field) {
        return fieldMapping.get(field);
    }

    @SuppressWarnings("null")
    public static PublisherDTO mapToDTO(Record r) {
        // Map editions
        List<SimpleEditionDTO> editions = MappingUtils.getMultipleDTOFromRecord(r, "editions",
                EditionMapper::mapToSimpleDTO);
        // Map publisher
        PublisherDTO dto = PublisherDTO.builder()
                .id(r.get(getFieldName(PUBLISHERS.ID), Integer.class))
                .name(r.get(getFieldName(PUBLISHERS.NAME), String.class))
                .editions(editions)
                .createdAt(r.get(getFieldName(PUBLISHERS.CREATED_AT), LocalDateTime.class))
                .modifiedAt(r.get(getFieldName(PUBLISHERS.MODIFIED_AT), LocalDateTime.class))
                .build();
        return dto;
    }

    @SuppressWarnings("null")
    public static SimplePublisherDTO mapToSimpleDTO(Record r) {
        SimplePublisherDTO dto = SimplePublisherDTO.builder()
                .id(r.get(getFieldName(PUBLISHERS.ID), Integer.class))
                .name(r.get(getFieldName(PUBLISHERS.NAME), String.class))
                .build();
        return dto;
    }

    // public static PublisherDTO mapGenericMapToDTO(Map<String, Object> map) {
    // // Map publisher
    // PublisherDTO dto = new PublisherDTO(
    // (Integer) map.get("id"),
    // (String) map.get("name"),
    // (List<SimpleEditionDTO>) map.get("editions"),
    // MappingUtils.stringToLocalDateTime((String) map.get("createdAt")),
    // MappingUtils.stringToLocalDateTime((String) map.get("modifiedAt")));
    // return dto;
    // }

    // public static SimplePublisherDTO mapGenericMapToSimpleDTO(Map<String, Object>
    // map) {
    // SimplePublisherDTO dto = new SimplePublisherDTO(
    // (Integer) map.get("id"),
    // (String) map.get("name"));
    // return dto;
    // }

}
