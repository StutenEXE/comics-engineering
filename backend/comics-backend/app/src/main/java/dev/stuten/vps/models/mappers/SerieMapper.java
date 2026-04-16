package dev.stuten.vps.models.mappers;

import static dev.stuten.vps.jooq.tables.Series.SERIES;
import static dev.stuten.vps.jooq.tables.Users.USERS;

import java.util.List;

import org.jooq.Record;

import dev.stuten.vps.jooq.tables.records.SeriesRecord;
import dev.stuten.vps.models.dtos.BookDTO;
import dev.stuten.vps.models.dtos.SerieDTO;
import dev.stuten.vps.models.dtos.UserDTO;
import dev.stuten.vps.models.mappers.utils.MappingUtils;

public class SerieMapper {

    public static SerieDTO mapToDTO(Record r) {
        // Map books
        List<BookDTO> books = MappingUtils.getMultipleDTOFromRecord(r, "books", BookMapper::mapToDTO);

        // Map user
        UserDTO user = MappingUtils.getSingleDTOFromRecord(r, USERS, UserMapper::mapToDTO);

        SeriesRecord serieRecord = r.into(SERIES);
        SerieDTO dto = new SerieDTO(
                serieRecord.getId(),
                serieRecord.getName(),
                serieRecord.getOngoing(),
                serieRecord.getOneshot(),
                serieRecord.getNvolumes(),
                serieRecord.getStartDate(),
                serieRecord.getEndDate(),
                books,
                serieRecord.getCreatedAt(),
                serieRecord.getModifiedAt(),
                user);
        return dto;
    }

}
