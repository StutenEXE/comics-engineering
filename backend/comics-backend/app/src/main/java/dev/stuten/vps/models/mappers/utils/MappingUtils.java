package dev.stuten.vps.models.mappers.utils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.jooq.JSONB;
import org.jooq.Record;
import org.jooq.RecordMapper;
import org.jooq.Result;
import org.jooq.impl.TableImpl;
import org.jspecify.annotations.Nullable;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import dev.stuten.vps.jooq.enums.ContributionTypeEnum;
import dev.stuten.vps.models.dtos.full.BookDTO;
import dev.stuten.vps.models.dtos.full.EditionDTO;
import dev.stuten.vps.models.dtos.full.IssueDTO;
import dev.stuten.vps.models.dtos.full.IssueSerieDTO;
import dev.stuten.vps.models.dtos.full.PublisherDTO;
import dev.stuten.vps.models.dtos.full.SerieDTO;
import dev.stuten.vps.models.dtos.template.IdDTO;

public final class MappingUtils {

    private MappingUtils() {
    }

    public static <T extends Record, @Nullable R> R getSingleDTOFromRecord(Record r, TableImpl<T> table,
            RecordMapper<Record, R> mapper) {
        R dto = r.map(mapper);
        return dto;
    }

    public static <R> List<R> getMultipleDTOFromRecord(Record r, String fieldName, RecordMapper<Record, R> mapper) {
        List<R> dtos = Arrays.asList();
        if (r.field(fieldName) != null) {
            Result<Record> records = r.get(fieldName, Result.class);
            dtos = records.stream()
                    .map(mapper)
                    .toList();
        }
        return dtos;
    }

    @SuppressWarnings("null")
    private static final Map<ContributionTypeEnum, TypeReference<? extends IdDTO>> IDDTO_TYPE_REF = Map.ofEntries(
            Map.entry(ContributionTypeEnum.book, new TypeReference<BookDTO>() {
            }),
            Map.entry(ContributionTypeEnum.serie, new TypeReference<SerieDTO>() {
            }),
            Map.entry(ContributionTypeEnum.edition, new TypeReference<EditionDTO>() {
            }),
            Map.entry(ContributionTypeEnum.issue, new TypeReference<IssueDTO>() {
            }),
            Map.entry(ContributionTypeEnum.issueserie, new TypeReference<IssueSerieDTO>() {
            }),
            Map.entry(ContributionTypeEnum.publisher, new TypeReference<PublisherDTO>() {
            }));

    public static IdDTO jsonbToIdDTO(JSONB jsonb, ContributionTypeEnum type) {
        if (jsonb == null)
            return null;
        try {
            return new ObjectMapper().readValue(jsonb.data(), IDDTO_TYPE_REF.get(type));
        } catch (Exception e) {
            return null;
        }
    }

    public static JSONB mapToJsonb(Object map) {
        if (map == null)
            return null;
        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());
            mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
            return JSONB.valueOf(mapper.writeValueAsString(map));
        } catch (Exception e) {
            return null;
        }
    }

    private static final DateTimeFormatter LOCAL_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter LOCAL_DATETIME_FORMATTER = DateTimeFormatter
            .ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    public static LocalDate stringToLocalDate(String date) {
        if (date == null)
            return null;
        return LocalDate.parse(date, LOCAL_DATE_FORMATTER);
    }

    public static LocalDateTime stringToLocalDateTime(String dateTime) {
        if (dateTime == null)
            return null;
        return LocalDateTime.parse(dateTime, LOCAL_DATETIME_FORMATTER);
    }
}
