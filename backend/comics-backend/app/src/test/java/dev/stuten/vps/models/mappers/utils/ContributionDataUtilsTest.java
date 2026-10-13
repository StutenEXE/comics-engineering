package dev.stuten.vps.models.mappers.utils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import dev.stuten.vps.jooq.enums.ContributionActionEnum;
import dev.stuten.vps.jooq.enums.ContributionTypeEnum;

class ContributionDataUtilsTest {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private static JsonNode json(String json) throws Exception {
        return MAPPER.readTree(json.replace('\'', '"'));
    }

    @Test
    void compactRemovesDerivedFields() throws Exception {
        JsonNode publisher = json("{'id': 1, 'name': 'Urban', 'editions': [{'id': 2}], 'createdAt': 'x', 'modifiedAt': 'x'}");
        assertEquals(json("{'id': 1, 'name': 'Urban'}"),
                ContributionDataUtils.compact(ContributionTypeEnum.publisher, publisher));

        // A book's issues are applied by the contribution, they are kept
        JsonNode book = json("{'id': 1, 'issues': [{'id': 3}], 'editions': [{'id': 2}], 'addedBy': {'id': 4}}");
        assertEquals(json("{'id': 1, 'issues': [{'id': 3}]}"),
                ContributionDataUtils.compact(ContributionTypeEnum.book, book));
    }

    @Test
    void createHasNoSnapshot() throws Exception {
        assertNull(ContributionDataUtils.buildSnapshot(ContributionTypeEnum.serie, ContributionActionEnum.create,
                json("{'id': 1}"), json("{'id': 1}")));
    }

    @Test
    void deleteKeepsTheWholeEntity() throws Exception {
        assertEquals(json("{'id': 1, 'name': 'Batman'}"),
                ContributionDataUtils.buildSnapshot(ContributionTypeEnum.serie, ContributionActionEnum.delete,
                        json("{'id': 1, 'name': 'Batman', 'books': [{'id': 2}]}"), json("{'id': 1}")));
    }

    @Test
    void updateKeepsThePreviousValueOfChangedFieldsOnly() throws Exception {
        JsonNode snapshot = json("""
                {'id': 1, 'name': 'Old', 'desc': null, 'number': 2, 'fandomUrl': 'url',
                 'serie': {'id': 5, 'name': 'Serie'}, 'issues': [{'id': 1}, {'id': 2}],
                 'dimensions': {'height': 24.00, 'width': 17.5}, 'editions': [{'id': 9}]}
                """);
        JsonNode proposal = json("""
                {'id': 1, 'name': 'New', 'desc': 'Added', 'number': 2,
                 'serie': {'id': 5, 'name': 'Renamed elsewhere'}, 'issues': [{'id': 2, 'name': 'x'}, {'id': 1}],
                 'dimensions': {'height': 24, 'width': 17.50}}
                """);
        // - name, desc changed
        // - fandomUrl removed (missing = null)
        // - number, serie (same id), issues (same ids), dimensions (same values) unchanged
        // - editions is derived
        assertEquals(json("{'name': 'Old', 'desc': null, 'fandomUrl': 'url'}"),
                ContributionDataUtils.buildSnapshot(ContributionTypeEnum.book, ContributionActionEnum.update,
                        snapshot, proposal));
    }

    @Test
    void updateWithoutChangesHasAnEmptySnapshot() throws Exception {
        assertEquals(json("{}"),
                ContributionDataUtils.buildSnapshot(ContributionTypeEnum.issue, ContributionActionEnum.update,
                        json("{'id': 1, 'name': 'A'}"), json("{'id': 1, 'name': 'A'}")));
    }

    @Test
    void referencesWithDifferentIdsAreChanges() throws Exception {
        assertEquals(json("{'issueSerie': {'id': 1}}"),
                ContributionDataUtils.buildSnapshot(ContributionTypeEnum.issue, ContributionActionEnum.update,
                        json("{'issueSerie': {'id': 1}}"), json("{'issueSerie': {'id': 2}}")));
        assertEquals(json("{'issues': [{'id': 1}]}"),
                ContributionDataUtils.buildSnapshot(ContributionTypeEnum.book, ContributionActionEnum.update,
                        json("{'issues': [{'id': 1}]}"), json("{'issues': [{'id': 1}, {'id': 2}]}")));
    }
}
