package dev.stuten.vps.models.mappers;

import static dev.stuten.vps.jooq.tables.EditionOwnership.EDITION_OWNERSHIP;
import static dev.stuten.vps.jooq.tables.Editions.EDITIONS;
import static dev.stuten.vps.jooq.tables.Users.USERS;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

import org.jooq.Record;
import org.jooq.TableField;

import dev.stuten.vps.jooq.tables.records.EditionOwnershipRecord;
import dev.stuten.vps.models.dtos.full.EditionDTO;
import dev.stuten.vps.models.dtos.full.OwnedEditionDTO;
import dev.stuten.vps.models.dtos.simple.SimpleUserDTO;
import dev.stuten.vps.models.mappers.utils.MappingUtils;

public class OwnedEditionMapper {
    private static Map<TableField<EditionOwnershipRecord, ? extends Object>, String> fieldMapping = Map.ofEntries(
            Map.entry(EDITION_OWNERSHIP.ID, "ownededition_id"),
            Map.entry(EDITION_OWNERSHIP.EDITION_ID, "ownededition_edition_id"),
            Map.entry(EDITION_OWNERSHIP.USER_ID, "ownededition_user_id"),
            Map.entry(EDITION_OWNERSHIP.DATE, "ownededition_date"),
            Map.entry(EDITION_OWNERSHIP.READ, "ownededition_read"),
            Map.entry(EDITION_OWNERSHIP.DATE_READ, "ownededition_date_read"),
            Map.entry(EDITION_OWNERSHIP.GIFT, "ownededition_gift"),
            Map.entry(EDITION_OWNERSHIP.SIGNED, "ownededition_signed"),
            Map.entry(EDITION_OWNERSHIP.PURCHASE_PRICE, "ownededition_purchase_price"),
            Map.entry(EDITION_OWNERSHIP.FEES, "ownededition_fees"),
            Map.entry(EDITION_OWNERSHIP.RETAIL_PRICE, "ownededition_retail_price"),
            Map.entry(EDITION_OWNERSHIP.NOTE, "ownededition_note"));

    public static String getFieldName(TableField<EditionOwnershipRecord, ? extends Object> field) {
        return fieldMapping.get(field);
    }

    public static OwnedEditionDTO mapToDTO(Record r) {
        // Map edition
        EditionDTO edition = MappingUtils.getSingleDTOFromRecord(r, EDITIONS, EditionMapper::mapToDTO);
        // Map user
        SimpleUserDTO user = MappingUtils.getSingleDTOFromRecord(r, USERS, UserMapper::mapToSimpleDTO);
        // Map edition
        OwnedEditionDTO dto = new OwnedEditionDTO(
                r.get(getFieldName(EDITION_OWNERSHIP.ID), Integer.class),
                r.get(getFieldName(EDITION_OWNERSHIP.DATE), LocalDateTime.class),
                r.get(getFieldName(EDITION_OWNERSHIP.READ), Boolean.class),
                r.get(getFieldName(EDITION_OWNERSHIP.DATE_READ), LocalDate.class),
                r.get(getFieldName(EDITION_OWNERSHIP.GIFT), Boolean.class),
                r.get(getFieldName(EDITION_OWNERSHIP.SIGNED), Boolean.class),
                r.get(getFieldName(EDITION_OWNERSHIP.PURCHASE_PRICE), BigDecimal.class),
                r.get(getFieldName(EDITION_OWNERSHIP.FEES), BigDecimal.class),
                r.get(getFieldName(EDITION_OWNERSHIP.RETAIL_PRICE), BigDecimal.class),
                r.get(getFieldName(EDITION_OWNERSHIP.NOTE), String.class),
                edition,
                user);
        return dto;
    }
}
