package dev.stuten.vps.models.mappers;

import static dev.stuten.vps.jooq.tables.Series.SERIES;
import static dev.stuten.vps.jooq.tables.Users.USERS;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.jooq.Record;
import org.jooq.TableField;

import dev.stuten.vps.jooq.tables.Books;
import dev.stuten.vps.jooq.tables.records.BooksRecord;
import dev.stuten.vps.models.dtos.full.BookDTO;
import dev.stuten.vps.models.dtos.simple.SimpleBookDTO;
import dev.stuten.vps.models.dtos.simple.SimpleEditionDTO;
import dev.stuten.vps.models.dtos.simple.SimpleIssueDTO;
import dev.stuten.vps.models.dtos.simple.SimpleSerieDTO;
import dev.stuten.vps.models.dtos.simple.SimpleUserDTO;
import dev.stuten.vps.models.mappers.utils.MappingUtils;

public class BookMapper {
    private static Map<TableField<BooksRecord, ? extends Object>, String> fieldMapping = Map.of(
            Books.BOOKS.ID, "book_id",
            Books.BOOKS.NAME, "book_name",
            Books.BOOKS.DESC, "book_desc",
            Books.BOOKS.NUMBER, "book_number",
            Books.BOOKS.VO_CONTENT, "book_vo_content",
            Books.BOOKS.IMG_URL, "book_img_url",
            Books.BOOKS.SERIES_ID, "book_series_id",
            Books.BOOKS.ADDED_BY, "book_added_by",
            Books.BOOKS.CREATED_AT, "book_created_at",
            Books.BOOKS.MODIFIED_AT, "book_modified_at");

    public static String getFieldName(TableField<BooksRecord, ? extends Object> field) {
        return fieldMapping.get(field);
    }

    public static BookDTO mapToDTO(Record r) {
        // Map serie
        SimpleSerieDTO serie = MappingUtils.getSingleDTOFromRecord(r, SERIES, SerieMapper::mapToSimpleDTO);
        // Map to editions
        List<SimpleEditionDTO> editions = MappingUtils.getMultipleDTOFromRecord(r, "editions",
                EditionMapper::mapToSimpleDTO);
        // Map issues
        List<SimpleIssueDTO> issues = MappingUtils.getMultipleDTOFromRecord(r, "issues", IssueMapper::mapToSimpleDTO);
        // Map user
        SimpleUserDTO user = MappingUtils.getSingleDTOFromRecord(r, USERS, UserMapper::mapToSimpleDTO);
        // Map book
        BookDTO dto = new BookDTO(
                (Integer) r.get(getFieldName(Books.BOOKS.ID)),
                (String) r.get(getFieldName(Books.BOOKS.NAME)),
                (String) r.get(getFieldName(Books.BOOKS.DESC)),
                (Integer) r.get(getFieldName(Books.BOOKS.NUMBER)),
                (String) r.get(getFieldName(Books.BOOKS.VO_CONTENT)),
                (String) r.get(getFieldName(Books.BOOKS.IMG_URL)),
                serie,
                editions,
                issues,
                (LocalDateTime) r.get(getFieldName(Books.BOOKS.CREATED_AT)),
                (LocalDateTime) r.get(getFieldName(Books.BOOKS.MODIFIED_AT)),
                user);
        return dto;
    }

    public static SimpleBookDTO mapToSimpleDTO(Record r) {
        SimpleBookDTO dto = new SimpleBookDTO(
                (Integer) r.get(getFieldName(Books.BOOKS.ID)),
                (String) r.get(getFieldName(Books.BOOKS.NAME)),
                (String) r.get(getFieldName(Books.BOOKS.DESC)),
                (Integer) r.get(getFieldName(Books.BOOKS.NUMBER)),
                (String) r.get(getFieldName(Books.BOOKS.VO_CONTENT)),
                (String) r.get(getFieldName(Books.BOOKS.IMG_URL)),
                (Integer) r.get(getFieldName(Books.BOOKS.SERIES_ID))
        );
        return dto;
    }
}
