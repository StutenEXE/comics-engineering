package dev.stuten.vps.models.dtos.request.search;

import static dev.stuten.vps.jooq.tables.Books.BOOKS;
import static dev.stuten.vps.jooq.tables.EditionOwnership.EDITION_OWNERSHIP;
import static dev.stuten.vps.jooq.tables.Publishers.PUBLISHERS;
import static dev.stuten.vps.jooq.tables.Series.SERIES;

import org.jooq.Record;
import org.jooq.TableField;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum OwnedEditionSortingFields {
    @JsonProperty("bookName")
    BOOK_NAME(BOOKS.NAME),
    @JsonProperty("serieName")
    SERIE_NAME(SERIES.NAME),
    @JsonProperty("volume")
    VOLUME(BOOKS.NUMBER),
    @JsonProperty("publisherName")
    PUBLISHER_NAME(PUBLISHERS.NAME),
    @JsonProperty("addDate")
    ADD_DATE(EDITION_OWNERSHIP.DATE),
    @JsonProperty("read")
    READ(EDITION_OWNERSHIP.READ);

    private TableField<? extends Record, ?> field;

    OwnedEditionSortingFields(TableField<? extends Record, ?> field) {
        this.field = field;
    }

    public TableField<? extends Record, ?> getTableField() {
        return this.field;
    }
}