package dev.stuten.vps.models.mappers;

import static dev.stuten.vps.jooq.tables.Books.BOOKS;
import static dev.stuten.vps.jooq.tables.Editions.EDITIONS;
import static dev.stuten.vps.jooq.tables.Publishers.PUBLISHERS;
import static dev.stuten.vps.jooq.tables.Series.SERIES;
import static dev.stuten.vps.jooq.tables.Users.USERS;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Map;

import org.jooq.Record;
import org.jooq.TableField;

import dev.stuten.vps.jooq.tables.records.EditionsRecord;
import dev.stuten.vps.models.dtos.full.EditionDTO;
import dev.stuten.vps.models.dtos.simple.SimpleBookDTO;
import dev.stuten.vps.models.dtos.simple.SimpleEditionDTO;
import dev.stuten.vps.models.dtos.simple.SimplePublisherDTO;
import dev.stuten.vps.models.dtos.simple.SimpleSerieDTO;
import dev.stuten.vps.models.dtos.simple.SimpleUserDTO;
import dev.stuten.vps.models.mappers.utils.MappingUtils;

public class EditionMapper {
    private static Map<TableField<EditionsRecord, ? extends Object>, String> fieldMapping = Map.ofEntries(
            Map.entry(EDITIONS.ID, "edition_id"),
            Map.entry(EDITIONS.ISBN, "edition_isbn"),
            Map.entry(EDITIONS.EAN, "edition_ean"),
            Map.entry(EDITIONS.NPAGES, "edition_npages"),
            Map.entry(EDITIONS.PRICE, "edition_price"),
            Map.entry(EDITIONS.URL, "edition_url"),
            Map.entry(EDITIONS.IMG_URL, "edition_img_url"),
            Map.entry(EDITIONS.COVER_TYPE, "edition_cover_type"),
            Map.entry(EDITIONS.PARUTION_DATE, "edition_parution_date"),
            Map.entry(EDITIONS.PUBLISHER_ID, "edition_publisher_id"),
            Map.entry(EDITIONS.BOOK_ID, "edition_book_id"),
            Map.entry(EDITIONS.ADDED_BY, "edition_added_by"),
            Map.entry(EDITIONS.CREATED_AT, "edition_created_at"),
            Map.entry(EDITIONS.MODIFIED_AT, "edition_modified_at"));

    public static String getFieldName(TableField<EditionsRecord, ? extends Object> field) {
        return fieldMapping.get(field);
    }

     public static EditionDTO mapToDTO(Record r) {
        // Map publisher
        SimplePublisherDTO publisher = MappingUtils.getSingleDTOFromRecord(r, PUBLISHERS,
                PublisherMapper::mapToSimpleDTO);
        // Map book
        SimpleBookDTO book = MappingUtils.getSingleDTOFromRecord(r, BOOKS, BookMapper::mapToSimpleDTO);
        // Map to serie
        SimpleSerieDTO serie = MappingUtils.getSingleDTOFromRecord(r, SERIES, SerieMapper::mapToSimpleDTO);
        // Map user
        SimpleUserDTO user = MappingUtils.getSingleDTOFromRecord(r, USERS, UserMapper::mapToSimpleDTO);
        // Map edition
        EditionDTO dto = new EditionDTO(
                r.get(getFieldName(EDITIONS.ID), Integer.class),
                r.get(getFieldName(EDITIONS.ISBN), String.class),
                r.get(getFieldName(EDITIONS.EAN), String.class),
                r.get(getFieldName(EDITIONS.NPAGES), Integer.class),
                r.get(getFieldName(EDITIONS.PRICE), Float.class),
                r.get(getFieldName(EDITIONS.URL), String.class),
                r.get(getFieldName(EDITIONS.IMG_URL), String.class),
                r.get(getFieldName(EDITIONS.COVER_TYPE), String.class),
                r.get(getFieldName(EDITIONS.PARUTION_DATE), LocalDate.class),
                publisher,
                book,
                serie,
                r.get(getFieldName(EDITIONS.CREATED_AT), OffsetDateTime.class),
                r.get(getFieldName(EDITIONS.MODIFIED_AT), OffsetDateTime.class),
                user);
        return dto;
    }

    public static SimpleEditionDTO mapToSimpleDTO(Record r) {
        SimpleEditionDTO dto = new SimpleEditionDTO(
                r.get(getFieldName(EDITIONS.ID), Integer.class),
                r.get(getFieldName(EDITIONS.ISBN), String.class),
                r.get(getFieldName(EDITIONS.EAN), String.class),
                r.get(getFieldName(EDITIONS.NPAGES), Integer.class),
                r.get(getFieldName(EDITIONS.PRICE), Float.class),
                r.get(getFieldName(EDITIONS.URL), String.class),
                r.get(getFieldName(EDITIONS.IMG_URL), String.class),
                r.get(getFieldName(EDITIONS.COVER_TYPE), String.class),
                r.get(getFieldName(EDITIONS.PARUTION_DATE), LocalDate.class),
                r.get(getFieldName(EDITIONS.PUBLISHER_ID), Integer.class),
                r.get(getFieldName(EDITIONS.BOOK_ID), Integer.class));
        return dto;
    }

}
