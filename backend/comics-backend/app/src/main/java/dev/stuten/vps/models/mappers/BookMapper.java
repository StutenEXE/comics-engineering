package dev.stuten.vps.models.mappers;

import static dev.stuten.vps.jooq.tables.Books.BOOKS;
import static dev.stuten.vps.jooq.tables.Series.SERIES;
import static dev.stuten.vps.jooq.tables.Users.USERS;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.jooq.Record;
import org.jooq.TableField;

import dev.stuten.vps.models.dtos.full.BookDTO;
import dev.stuten.vps.models.dtos.simple.SimpleBookDTO;
import dev.stuten.vps.models.dtos.simple.SimpleEditionDTO;
import dev.stuten.vps.models.dtos.simple.SimpleIssueDTO;
import dev.stuten.vps.models.dtos.simple.SimpleSerieDTO;
import dev.stuten.vps.models.dtos.simple.SimpleUserDTO;
import dev.stuten.vps.models.mappers.utils.MappingUtils;

public class BookMapper {
        private static Map<TableField<? extends Record, ? extends Object>, String> fieldMapping = Map.ofEntries(
                        Map.entry(BOOKS.ID, "book_id"),
                        Map.entry(BOOKS.NAME, "book_name"),
                        Map.entry(BOOKS.DESC, "book_desc"),
                        Map.entry(BOOKS.NUMBER, "book_number"),
                        Map.entry(BOOKS.VO_CONTENT, "book_vo_content"),
                        Map.entry(BOOKS.IMG_URL, "book_img_url"),
                        Map.entry(BOOKS.SERIES_ID, "book_series_id"),
                        Map.entry(SERIES.NAME, "books_serie_name"),
                        Map.entry(BOOKS.ADDED_BY, "book_added_by"),
                        Map.entry(BOOKS.CREATED_AT, "book_created_at"),
                        Map.entry(BOOKS.MODIFIED_AT, "book_modified_at"));

        public static String getFieldName(TableField<? extends Record, ? extends Object> field) {
                return fieldMapping.get(field);
        }

        public static BookDTO mapToDTO(Record r) {
                // Map serie
                SimpleSerieDTO serie = MappingUtils.getSingleDTOFromRecord(r, SERIES, SerieMapper::mapToSimpleDTO);
                // Map to editions
                List<SimpleEditionDTO> editions = MappingUtils.getMultipleDTOFromRecord(r, "editions",
                                EditionMapper::mapToSimpleDTO);
                // Map issues
                List<SimpleIssueDTO> issues = MappingUtils.getMultipleDTOFromRecord(r, "issues",
                                IssueMapper::mapToSimpleDTO);
                // Map user
                SimpleUserDTO user = MappingUtils.getSingleDTOFromRecord(r, USERS, UserMapper::mapToSimpleDTO);
                // Map book
                BookDTO dto = BookDTO.builder()
                                .id(r.get(getFieldName(BOOKS.ID), Integer.class))
                                .name(r.get(getFieldName(BOOKS.NAME), String.class))
                                .desc(r.get(getFieldName(BOOKS.DESC), String.class))
                                .number(r.get(getFieldName(BOOKS.NUMBER), Integer.class))
                                .voContent(r.get(getFieldName(BOOKS.VO_CONTENT), String.class))
                                .imgUrl(r.get(getFieldName(BOOKS.IMG_URL), String.class))
                                .serie(serie)
                                .editions(editions)
                                .issues(issues)
                                .createdAt(r.get(getFieldName(BOOKS.CREATED_AT), LocalDateTime.class))
                                .modifiedAt(r.get(getFieldName(BOOKS.MODIFIED_AT), LocalDateTime.class))
                                .addedBy(user)
                                .build();
                return dto;
        }

        public static SimpleBookDTO mapToSimpleDTO(Record r) {
                SimpleBookDTO dto = SimpleBookDTO.builder()
                                .id(r.get(getFieldName(BOOKS.ID), Integer.class))
                                .name(r.get(getFieldName(BOOKS.NAME), String.class))
                                .desc(r.get(getFieldName(BOOKS.DESC), String.class))
                                .number(r.get(getFieldName(BOOKS.NUMBER), Integer.class))
                                .voContent(r.get(getFieldName(BOOKS.VO_CONTENT), String.class))
                                .imgUrl(r.get(getFieldName(BOOKS.IMG_URL), String.class))
                                .serieId(r.get(getFieldName(BOOKS.SERIES_ID), Integer.class))
                                .serieName(r.get(getFieldName(SERIES.NAME), String.class))
                                .build();
                return dto;
        }

        // public static BookDTO mapGenericMapToDTO(Map<String, Object> map) {
        //         // Map book
        //         BookDTO dto = BookDTO.builder()
        //                         .id((Integer) map.get("id"))
        //                         .desc((String) map.get("desc"))
        //                         .number((Integer) map.get("number"))
        //                         .voContent((String) map.get("voContent"))
        //                         .imgUrl((String) map.get("imgUrl"))
        //                         .serie(SerieMapper.mapGenericMapToSimpleDTO((Map<String, Object>) map.get("serie")))
        //                         .editions(map.get("editions") == null ? Arrays.asList()
        //                                         : ((List<Map<String, Object>>) map.get("editions")).stream()
        //                                                         .map(EditionMapper::mapGenericMapToSimpleDTO).toList())
        //                         .issues(map.get("issues") == null ? Arrays.asList()
        //                                         : ((List<Map<String, Object>>) map.get("issues")).stream()
        //                                                         .map(IssueMapper::mapGenericMapToSimpleDTO).toList())
        //                         .createdAt(MappingUtils.stringToLocalDateTime((String) map.get("createdAt")))
        //                         .modifiedAt(MappingUtils.stringToLocalDateTime((String) map.get("modifiedAt")))
        //                         .addedBy(UserMapper.mapGenericMapToSimpleDTO((Map<String, Object>) map.get("addedBy")))
        //                         .build();
        //         return dto;
        // }

        // public static SimpleBookDTO mapGenericMapToSimpleDTO(Map<String, Object> map) {
        //         SimpleBookDTO dto = new SimpleBookDTO(
        //                         (Integer) map.get("id"),
        //                         (String) map.get("name"),
        //                         (String) map.get("desc"),
        //                         (Integer) map.get("number"),
        //                         (String) map.get("voContent"),
        //                         (String) map.get("imgUrl"),
        //                         (Integer) map.get("seriesId"),
        //                         (String) map.get("serieName"));
        //         return dto;
        // }
}
