package dev.stuten.vps.models.mappers.utils;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.jooq.JSONB;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.NullNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import dev.stuten.vps.jooq.enums.ContributionActionEnum;
import dev.stuten.vps.jooq.enums.ContributionTypeEnum;

/**
 * Keeps the data stored with a contribution small :
 * - proposed data : only the fields a contribution can apply. Derived data
 * (a publisher's editions, a serie's books, audit fields...) is removed
 * - entity snapshot :
 * - create : nothing
 * - update : the previous value of the fields changed by the proposal only
 * - delete : the deleted entity, without derived data
 *
 * /!\ Must stay in sync with postgres/migrations/V3__compact_contribution_data.sql
 * which applied the same rules to the existing contributions
 */
public final class ContributionDataUtils {

    private ContributionDataUtils() {
    }

    private static final ObjectMapper MAPPER = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);

    // Set by the database or at approval time, never applied from a proposal
    private static final List<String> COMMON_DERIVED_FIELDS = List.of("createdAt", "modifiedAt", "addedBy");

    // Relations owned by another entity, never applied from a proposal
    // (book.issues is kept : approving a book links it to its issues)
    private static final Map<ContributionTypeEnum, List<String>> DERIVED_FIELDS = Map.ofEntries(
            Map.entry(ContributionTypeEnum.book, List.of("editions")),
            Map.entry(ContributionTypeEnum.serie, List.of("books")),
            Map.entry(ContributionTypeEnum.edition, List.of()),
            Map.entry(ContributionTypeEnum.issue, List.of("books")),
            Map.entry(ContributionTypeEnum.issueserie, List.of("issues", "books")),
            Map.entry(ContributionTypeEnum.publisher, List.of("editions")));

    /**
     * @return The entity data without its derived fields, null if there is no
     *         data
     */
    public static ObjectNode compact(ContributionTypeEnum type, Object entity) {
        if (entity == null) {
            return null;
        }
        JsonNode node = entity instanceof JsonNode json ? json.deepCopy() : MAPPER.valueToTree(entity);
        if (!node.isObject()) {
            return null;
        }
        ObjectNode compacted = (ObjectNode) node;
        compacted.remove(COMMON_DERIVED_FIELDS);
        compacted.remove(DERIVED_FIELDS.getOrDefault(type, List.of()));
        return compacted;
    }

    /**
     * @param snapshot The entity as it is before the contribution is applied
     * @param proposal The proposed entity
     * @return What must be kept of the entity's previous state (see class doc)
     */
    public static ObjectNode buildSnapshot(ContributionTypeEnum type, ContributionActionEnum action,
            Object snapshot, Object proposal) {
        ObjectNode previous = compact(type, snapshot);
        if (previous == null || action == ContributionActionEnum.create) {
            return null;
        }
        if (action == ContributionActionEnum.delete) {
            return previous;
        }
        // Update : keep the previous values of the changed fields only
        ObjectNode proposed = compact(type, proposal);
        Iterator<Entry<String, JsonNode>> fields = previous.fields();
        while (fields.hasNext()) {
            Entry<String, JsonNode> field = fields.next();
            JsonNode proposedValue = proposed == null ? null : proposed.get(field.getKey());
            if (sameValue(field.getValue(), proposedValue)) {
                fields.remove();
            }
        }
        return previous;
    }

    public static JSONB toJsonb(JsonNode node) {
        return node == null ? null : JSONB.valueOf(node.toString());
    }

    public static JsonNode fromJsonb(JSONB jsonb) {
        if (jsonb == null) {
            return null;
        }
        try {
            return MAPPER.readTree(jsonb.data());
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Two values are the same when :
     * - both are references (objects with an id) to the same id
     * - both are lists of references to the same ids, whatever their order
     * - both are equal, numbers being compared by value (1.50 = 1.5)
     * A missing value is the same as null
     */
    private static boolean sameValue(JsonNode a, JsonNode b) {
        a = a == null ? NullNode.instance : a;
        b = b == null ? NullNode.instance : b;
        if (isReference(a) && isReference(b)) {
            return sameValue(a.get("id"), b.get("id"));
        }
        if (isReferenceList(a) && isReferenceList(b)) {
            return sortedIds(a).equals(sortedIds(b));
        }
        return a.equals(NUMERIC_VALUE_COMPARATOR, b);
    }

    private static boolean isReference(JsonNode node) {
        return node.isObject() && node.hasNonNull("id");
    }

    private static boolean isReferenceList(JsonNode node) {
        if (!node.isArray()) {
            return false;
        }
        for (JsonNode element : node) {
            if (!isReference(element)) {
                return false;
            }
        }
        return true;
    }

    private static List<String> sortedIds(JsonNode references) {
        List<String> ids = new ArrayList<>();
        references.forEach(reference -> ids.add(reference.get("id").asText()));
        ids.sort(Comparator.naturalOrder());
        return ids;
    }

    private static final Comparator<JsonNode> NUMERIC_VALUE_COMPARATOR = (a, b) -> {
        if (a.isNumber() && b.isNumber()) {
            return a.decimalValue().compareTo(b.decimalValue());
        }
        return a.equals(b) ? 0 : 1;
    };
}
