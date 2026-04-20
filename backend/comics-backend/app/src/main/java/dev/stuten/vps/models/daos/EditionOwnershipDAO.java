package dev.stuten.vps.models.daos;

import static dev.stuten.vps.jooq.tables.EditionOwnership.EDITION_OWNERSHIP;
import static dev.stuten.vps.jooq.tables.Editions.EDITIONS;
import static dev.stuten.vps.jooq.tables.Users.USERS;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.RecordMapper;
import org.jooq.SelectFieldOrAsterisk;
import org.jooq.SelectJoinStep;

import dev.stuten.vps.models.dtos.full.OwnedEditionDTO;
import dev.stuten.vps.models.mappers.OwnedEditionMapper;

public class EditionOwnershipDAO extends DAO {

    public EditionOwnershipDAO(DSLContext dsl) {
        super(dsl);
    }

    @SuppressWarnings("unchecked")
    @Override
    protected RecordMapper<? super Record, OwnedEditionDTO> getDefaultMapper() {
        return OwnedEditionMapper::mapToDTO;
    }

    @Override
    protected Collection<SelectFieldOrAsterisk> getSimpleSelectFields() {
        return List.of(
                EDITION_OWNERSHIP.ID.as(OwnedEditionMapper.getFieldName(EDITION_OWNERSHIP.ID)),
                EDITION_OWNERSHIP.DATE.as(OwnedEditionMapper.getFieldName(EDITION_OWNERSHIP.DATE)),
                EDITION_OWNERSHIP.READ.as(OwnedEditionMapper.getFieldName(EDITION_OWNERSHIP.READ)),
                EDITION_OWNERSHIP.DATE_READ.as(OwnedEditionMapper.getFieldName(EDITION_OWNERSHIP.DATE_READ)),
                EDITION_OWNERSHIP.GIFT.as(OwnedEditionMapper.getFieldName(EDITION_OWNERSHIP.GIFT)),
                EDITION_OWNERSHIP.SIGNED.as(OwnedEditionMapper.getFieldName(EDITION_OWNERSHIP.SIGNED)),
                EDITION_OWNERSHIP.PURCHASE_PRICE.as(OwnedEditionMapper.getFieldName(EDITION_OWNERSHIP.PURCHASE_PRICE)),
                EDITION_OWNERSHIP.FEES.as(OwnedEditionMapper.getFieldName(EDITION_OWNERSHIP.FEES)),
                EDITION_OWNERSHIP.RETAIL_PRICE.as(OwnedEditionMapper.getFieldName(EDITION_OWNERSHIP.RETAIL_PRICE)),
                EDITION_OWNERSHIP.NOTE.as(OwnedEditionMapper.getFieldName(EDITION_OWNERSHIP.NOTE)));
    }

    protected SelectJoinStep<? extends Record> getSimpleFromClause() {
        return DSL().select(getSimpleSelectFields()).from(EDITION_OWNERSHIP);
    };

    @SuppressWarnings({ "unchecked", "rawtypes" })
    @Override
    protected SelectJoinStep getFullFromClause() {
        return DSL().select(getSimpleSelectFields())
                .select(new EditionDAO(this.DSL()).getSimpleSelectFields())
                .select(new UserDAO(this.DSL()).getSimpleSelectFields())
                .from(EDITION_OWNERSHIP)
                .leftJoin(EDITIONS).on(EDITION_OWNERSHIP.EDITION_ID.eq(EDITIONS.ID))
                .leftJoin(USERS).on(EDITION_OWNERSHIP.USER_ID.eq(USERS.ID));
    }

    public Optional<Integer> create(OwnedEditionDTO dto) {
        return DSL().insertInto(EDITION_OWNERSHIP)
                .set(EDITION_OWNERSHIP.EDITION_ID, dto.edition().id())
                .set(EDITION_OWNERSHIP.USER_ID, dto.user().id())
                .set(EDITION_OWNERSHIP.DATE, dto.date())
                .set(EDITION_OWNERSHIP.READ, dto.read())
                .set(EDITION_OWNERSHIP.DATE_READ, dto.dateRead())
                .set(EDITION_OWNERSHIP.GIFT, dto.gift())
                .set(EDITION_OWNERSHIP.SIGNED, dto.signed())
                .set(EDITION_OWNERSHIP.PURCHASE_PRICE, dto.purchasePrice())
                .set(EDITION_OWNERSHIP.FEES, dto.fees())
                .set(EDITION_OWNERSHIP.RETAIL_PRICE, dto.retailPrice())
                .set(EDITION_OWNERSHIP.NOTE, dto.note())
                .returning(EDITION_OWNERSHIP.ID)
                .fetchOptional()
                .map(record -> record.get(EDITION_OWNERSHIP.ID));
    }

    public Optional<OwnedEditionDTO> findById(Integer id) {
        return super.selectOne(EDITION_OWNERSHIP.ID.eq(id));
    }

    public List<OwnedEditionDTO> findByUserId(Integer userId) {
        return super.selectMany(EDITION_OWNERSHIP.USER_ID.eq(userId));
    }
}