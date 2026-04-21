package dev.stuten.vps.models.mappers;

import static dev.stuten.vps.jooq.tables.Books.BOOKS;
import static dev.stuten.vps.jooq.tables.Editions.EDITIONS;
import static dev.stuten.vps.jooq.tables.Publishers.PUBLISHERS;
import static dev.stuten.vps.jooq.tables.Series.SERIES;
import static dev.stuten.vps.jooq.tables.Users.USERS;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

import org.jooq.Record;
import org.jooq.TableField;

import dev.stuten.vps.models.dtos.full.EditionDTO;
import dev.stuten.vps.models.dtos.simple.SimpleBookDTO;
import dev.stuten.vps.models.dtos.simple.SimpleEditionDTO;
import dev.stuten.vps.models.dtos.simple.SimplePublisherDTO;
import dev.stuten.vps.models.dtos.simple.SimpleSerieDTO;
import dev.stuten.vps.models.dtos.simple.SimpleUserDTO;
import dev.stuten.vps.models.mappers.utils.MappingUtils;

public class EditionMapper {
        private static Map<TableField<? extends Record, ? extends Object>, String> fieldMapping = Map.ofEntries(
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
                        Map.entry(PUBLISHERS.NAME, "edition_publisher_name"),
                        Map.entry(EDITIONS.BOOK_ID, "edition_book_id"),
                        Map.entry(EDITIONS.ADDED_BY, "edition_added_by"),
                        Map.entry(EDITIONS.CREATED_AT, "edition_created_at"),
                        Map.entry(EDITIONS.MODIFIED_AT, "edition_modified_at"));

        public static String getFieldName(TableField<? extends Record, ? extends Object> field) {
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
                                r.get(getFieldName(EDITIONS.CREATED_AT), LocalDateTime.class),
                                r.get(getFieldName(EDITIONS.MODIFIED_AT), LocalDateTime.class),
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
                                r.get(getFieldName(PUBLISHERS.NAME), String.class),
                                r.get(getFieldName(EDITIONS.BOOK_ID), Integer.class));
                return dto;
        }

        public static EditionDTO mapGenericMapToDTO(Map<String, Object> map) {
                EditionDTO dto = new EditionDTO(
                                (Integer) map.get("id"),
                                (String) map.get("isbn"),
                                (String) map.get("ean"),
                                (Integer) map.get("npages"),
                                (Float) map.get("price"),
                                (String) map.get("url"),
                                (String) map.get("imgUrl"),
                                (String) map.get("coverType"),
                                MappingUtils.stringToLocalDate((String) map.get("parutionDate")),
                                PublisherMapper.mapGenericMapToSimpleDTO((Map<String, Object>) map.get("publisher")),
                                BookMapper.mapGenericMapToSimpleDTO((Map<String, Object>) map.get("book")),
                                SerieMapper.mapGenericMapToSimpleDTO((Map<String, Object>) map.get("serie")),
                                MappingUtils.stringToLocalDateTime((String) map.get("createdAt")),
                                MappingUtils.stringToLocalDateTime((String) map.get("modifiedAt")),
                                UserMapper.mapGenericMapToSimpleDTO((Map<String, Object>) map.get("addedBy")));
                return dto;
        }

        public static SimpleEditionDTO mapGenericMapToSimpleDTO(Map<String, Object> map) {
                SimpleEditionDTO dto = new SimpleEditionDTO(
                                (Integer) map.get("id"),
                                (String) map.get("isbn"),
                                (String) map.get("ean"),
                                (Integer) map.get("npages"),
                                (Float) map.get("price"),
                                (String) map.get("url"),
                                (String) map.get("imgUrl"),
                                (String) map.get("coverType"),
                                MappingUtils.stringToLocalDate((String) map.get("parutionDate")),
                                (Integer) map.get("publisherId"),
                                (String) map.get("publisherName"),
                                (Integer) map.get("bookId"));
                return dto;
        }
}
