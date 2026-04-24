package dev.stuten.vps.models.dtos.simple.deserializer;

import java.io.IOException;
import java.util.Map;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.ObjectCodec;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;

import dev.stuten.vps.jooq.enums.ContributionActionEnum;
import dev.stuten.vps.jooq.enums.ContributionStatusEnum;
import dev.stuten.vps.jooq.enums.ContributionTypeEnum;
import dev.stuten.vps.models.dtos.full.BookDTO;
import dev.stuten.vps.models.dtos.full.EditionDTO;
import dev.stuten.vps.models.dtos.full.IssueDTO;
import dev.stuten.vps.models.dtos.full.IssueSerieDTO;
import dev.stuten.vps.models.dtos.full.PublisherDTO;
import dev.stuten.vps.models.dtos.full.SerieDTO;
import dev.stuten.vps.models.dtos.simple.SimpleContributionDTO;
import dev.stuten.vps.models.dtos.template.IdDTO;

public class SimpleContributionDTODeserializer extends JsonDeserializer<SimpleContributionDTO<?>> {

    private static final Map<ContributionTypeEnum, Class<? extends IdDTO>> ENTITY_TYPE_MAP = Map.ofEntries(
            Map.entry(ContributionTypeEnum.book, BookDTO.class),
            Map.entry(ContributionTypeEnum.serie, SerieDTO.class),
            Map.entry(ContributionTypeEnum.edition, EditionDTO.class),
            Map.entry(ContributionTypeEnum.issue, IssueDTO.class),
            Map.entry(ContributionTypeEnum.issueserie, IssueSerieDTO.class),
            Map.entry(ContributionTypeEnum.publisher, PublisherDTO.class));

    @Override
    public SimpleContributionDTO<?> deserialize(JsonParser p, DeserializationContext ctx) throws IOException {
        ObjectCodec codec = p.getCodec();
        JsonNode node = codec.readTree(p);
        // Resolve entityType
        ContributionTypeEnum entityType = codec.treeToValue(node.get("entityType"), ContributionTypeEnum.class);
        Class<? extends IdDTO> dataClass = ENTITY_TYPE_MAP.getOrDefault(entityType, IdDTO.class);

        // Deserialize the typed fields
        IdDTO proposedData = deserializeNode(node.get("proposedData"), dataClass, codec);
        IdDTO entitySnapshot = deserializeNode(node.get("entitySnapshot"), dataClass, codec);

        // dBuild the DTO manually
        return SimpleContributionDTO.builder()
                .bundleId(nullableInt(node, "bundleId"))
                .localRef(nullableInt(node, "localRef"))
                .entityType(entityType)
                .action(codec.treeToValue(node.get("action"), ContributionActionEnum.class))
                .entityId(nullableInt(node, "entityId"))
                .proposedData(proposedData)
                .entitySnapshot(entitySnapshot)
                .status(node.has("status") && !node.get("status").isNull()
                        ? codec.treeToValue(node.get("status"), ContributionStatusEnum.class)
                        : null)
                .resolvedEntityId(nullableInt(node, "resolvedEntityId"))
                .build();
    }

    private IdDTO deserializeNode(JsonNode node, Class<? extends IdDTO> clazz, ObjectCodec codec) throws JsonProcessingException {
        if (node == null || node.isNull())
            return null;
        return codec.treeToValue(node, clazz);
    }

    private Integer nullableInt(JsonNode node, String field) {
        JsonNode f = node.get(field);
        return (f == null || f.isNull()) ? null : f.intValue();
    }

}
