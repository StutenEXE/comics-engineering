package dev.stuten.vps.models.dtos.request.search;

import static dev.stuten.vps.jooq.tables.ContributionBundles.CONTRIBUTION_BUNDLES;
import static dev.stuten.vps.jooq.tables.Users.USERS;

import org.jooq.Field;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum ContributionBundleSortingFields implements SortableField {
    @JsonProperty("id")
    ID(CONTRIBUTION_BUNDLES.ID),
    @JsonProperty("submitter")
    SUBMITTER(USERS.USERNAME),
    @JsonProperty("note")
    NOTE(CONTRIBUTION_BUNDLES.NOTE),
    @JsonProperty("createdAt")
    CREATED_AT(CONTRIBUTION_BUNDLES.CREATED_AT),
    @JsonProperty("status")
    STATUS(CONTRIBUTION_BUNDLES.STATUS),
    @JsonProperty("nContributions")
    N_CONTRIBUTIONS(CONTRIBUTION_BUNDLES.N_CONTRIBUTIONS);

    private Field<?> field;

    ContributionBundleSortingFields(Field<?> field) {
        this.field = field;
    }

    @Override
    public Field<?> getTableField() {
        return this.field;
    }
}
