package dev.stuten.vps.models.daos;

import static dev.stuten.vps.jooq.tables.BooksIssues.BOOKS_ISSUES;
import static dev.stuten.vps.jooq.tables.EditionOwnership.EDITION_OWNERSHIP;
import static dev.stuten.vps.jooq.tables.Editions.EDITIONS;
import static org.jooq.impl.DSL.countDistinct;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.RecordMapper;
import org.jooq.SelectFieldOrAsterisk;
import org.jooq.SelectJoinStep;

import dev.stuten.vps.models.dtos.full.OwnedEditionDTO;
import dev.stuten.vps.models.dtos.simple.SimpleOwnedEditionDTO;
import dev.stuten.vps.models.mappers.OwnedEditionMapper;

public class OwnedEditionDAO extends EditionDAO {

    public OwnedEditionDAO(DSLContext dsl) {
        super(dsl);
    }

    @Override
    protected RecordMapper<? super Record, ?> getDefaultMapper() {
        return OwnedEditionMapper::mapToDTO;
    }

    protected Collection<SelectFieldOrAsterisk> getSimpleSelectFields(Boolean withEdition) {
        Collection<SelectFieldOrAsterisk> editionFields = new ArrayList<SelectFieldOrAsterisk>();
        if (withEdition) {
            editionFields.addAll(super.getSimpleSelectFields());
        } else {
            editionFields.add(
                    EDITION_OWNERSHIP.EDITION_ID.as(OwnedEditionMapper.getFieldName(EDITION_OWNERSHIP.EDITION_ID)));
        }
        editionFields.addAll(List.of(
                EDITION_OWNERSHIP.ID.as(OwnedEditionMapper.getFieldName(EDITION_OWNERSHIP.ID)),
                EDITION_OWNERSHIP.DATE.as(OwnedEditionMapper.getFieldName(EDITION_OWNERSHIP.DATE)),
                EDITION_OWNERSHIP.READ.as(OwnedEditionMapper.getFieldName(EDITION_OWNERSHIP.READ)),
                EDITION_OWNERSHIP.DATE_READ.as(OwnedEditionMapper.getFieldName(EDITION_OWNERSHIP.DATE_READ)),
                EDITION_OWNERSHIP.GIFT.as(OwnedEditionMapper.getFieldName(EDITION_OWNERSHIP.GIFT)),
                EDITION_OWNERSHIP.SIGNED.as(OwnedEditionMapper.getFieldName(EDITION_OWNERSHIP.SIGNED)),
                EDITION_OWNERSHIP.PURCHASE_PRICE.as(OwnedEditionMapper.getFieldName(EDITION_OWNERSHIP.PURCHASE_PRICE)),
                EDITION_OWNERSHIP.FEES.as(OwnedEditionMapper.getFieldName(EDITION_OWNERSHIP.FEES)),
                EDITION_OWNERSHIP.RETAIL_PRICE.as(OwnedEditionMapper.getFieldName(EDITION_OWNERSHIP.RETAIL_PRICE)),
                EDITION_OWNERSHIP.NOTE.as(OwnedEditionMapper.getFieldName(EDITION_OWNERSHIP.NOTE))));
        return editionFields;
    }

    @Override
    protected Collection<SelectFieldOrAsterisk> getSimpleSelectFields() {
        return this.getSimpleSelectFields(true);
    }

    protected SelectJoinStep<? extends Record> getSimpleFromClause() {
        return super.getSimpleFromClause()
                .leftJoin(EDITION_OWNERSHIP).on(EDITION_OWNERSHIP.EDITION_ID.eq(EDITIONS.ID));
    };

    @SuppressWarnings({ "rawtypes" })
    @Override
    protected SelectJoinStep getFullFromClause() {
        return super.getFullFromClause()
                // Special case for editions
                .leftJoin(EDITION_OWNERSHIP).on(EDITION_OWNERSHIP.EDITION_ID.eq(EDITIONS.ID));
    }

    public Optional<Integer> create(OwnedEditionDTO dto) {
        return DSL().insertInto(EDITION_OWNERSHIP)
                .set(EDITION_OWNERSHIP.EDITION_ID, dto.getEdition().getId())
                .set(EDITION_OWNERSHIP.USER_ID, dto.getUser().getId())
                .set(EDITION_OWNERSHIP.DATE, dto.getDate() == null ? null : dto.getDate().toLocalDateTime())
                .set(EDITION_OWNERSHIP.READ, dto.getRead())
                .set(EDITION_OWNERSHIP.DATE_READ, dto.getDateRead())
                .set(EDITION_OWNERSHIP.GIFT, dto.getGift())
                .set(EDITION_OWNERSHIP.SIGNED, dto.getSigned())
                .set(EDITION_OWNERSHIP.PURCHASE_PRICE, dto.getPurchasePrice())
                .set(EDITION_OWNERSHIP.FEES, dto.getFees())
                .set(EDITION_OWNERSHIP.RETAIL_PRICE, dto.getRetailPrice())
                .set(EDITION_OWNERSHIP.NOTE, dto.getNote())
                .returning(EDITION_OWNERSHIP.ID)
                .fetchOptional()
                .map(record -> record.get(EDITION_OWNERSHIP.ID));
    }

    public Boolean update(OwnedEditionDTO dto) {
        return DSL().update(EDITION_OWNERSHIP)
                .set(EDITION_OWNERSHIP.DATE, dto.getDate() == null ? null : dto.getDate().toLocalDateTime())
                .set(EDITION_OWNERSHIP.READ, dto.getRead())
                .set(EDITION_OWNERSHIP.DATE_READ, dto.getDateRead())
                .set(EDITION_OWNERSHIP.GIFT, dto.getGift())
                .set(EDITION_OWNERSHIP.SIGNED, dto.getSigned())
                .set(EDITION_OWNERSHIP.PURCHASE_PRICE, dto.getPurchasePrice())
                .set(EDITION_OWNERSHIP.FEES, dto.getFees())
                .set(EDITION_OWNERSHIP.RETAIL_PRICE, dto.getRetailPrice())
                .set(EDITION_OWNERSHIP.NOTE, dto.getNote())
                .where(EDITION_OWNERSHIP.ID.eq(dto.getId()))
                .execute() > 0;
    }

    public Boolean delete(OwnedEditionDTO dto) {
        return DSL().delete(EDITION_OWNERSHIP)
                .where(EDITION_OWNERSHIP.ID.eq(dto.getId()))
                .execute() > 0;
    }

    public Optional<OwnedEditionDTO> findOwnedById(Integer id) {
        return super.selectOne(EDITION_OWNERSHIP.ID.eq(id));
    }

    public List<OwnedEditionDTO> findOwnedByUserId(Integer userId) {
        return super.selectMany(EDITION_OWNERSHIP.USER_ID.eq(userId));
    }

    public List<SimpleOwnedEditionDTO> findSimpleOwnedByUserId(Integer userId) {
        return DSL().selectDistinct(this.getSimpleSelectFields(false))
                .from(EDITION_OWNERSHIP)
                .where(EDITION_OWNERSHIP.USER_ID.eq(userId))
                .fetch(OwnedEditionMapper::mapToSimpleDTO);
    }

    public Boolean doesUserOwnEdition(Integer userId, Integer editionId) {
        return super.selectOne(EDITION_OWNERSHIP.USER_ID.eq(userId).and(EDITION_OWNERSHIP.EDITION_ID.eq(editionId)))
                .isPresent();
    }

    @SuppressWarnings("null")
    public Map<Integer, Integer> findAllNumberOfIssuesLinked(List<OwnedEditionDTO> oes) {
        if (oes == null || oes.isEmpty()) {
            return Map.of();
        }

        List<Integer> editionIds = oes.stream()
                .map(oe -> oe.getEdition())
                .map(ed -> ed.getId())
                .distinct()
                .toList();

        if (editionIds.isEmpty()) {
            return Map.of();
        }

        return DSL()
                .select(
                        EDITIONS.ID,
                        countDistinct(BOOKS_ISSUES.ISSUE_ID).as("issue_count"))
                .from(EDITIONS)
                .leftJoin(BOOKS_ISSUES).on(BOOKS_ISSUES.BOOK_ID.eq(EDITIONS.BOOK_ID))
                .where(EDITIONS.ID.in(editionIds))
                .groupBy(EDITIONS.ID)
                .fetchMap(
                        EDITIONS.ID,
                        record -> record.get("issue_count", Integer.class));
    }
}