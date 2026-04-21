package dev.stuten.vps.models.daos;

import static dev.stuten.vps.jooq.tables.ContributionBundles.CONTRIBUTION_BUNDLES;
import static dev.stuten.vps.jooq.tables.Contributions.CONTRIBUTIONS;
import static dev.stuten.vps.jooq.tables.Users.USERS;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.RecordMapper;
import org.jooq.SelectFieldOrAsterisk;
import org.jooq.SelectJoinStep;

import dev.stuten.vps.jooq.enums.ContributionStatusEnum;
import dev.stuten.vps.models.dtos.full.ContributionDTO;
import dev.stuten.vps.models.dtos.simple.SimpleContributionDTO;
import dev.stuten.vps.models.mappers.ContributionMapper;
import dev.stuten.vps.models.mappers.utils.MappingUtils;

public class ContributionDAO extends DAO {

    public ContributionDAO(DSLContext dsl) {
        super(dsl);
    }

    @Override
    protected RecordMapper<? super Record, ContributionDTO> getDefaultMapper() {
        return ContributionMapper::mapToDTO;
    }

    @Override
    protected Collection<SelectFieldOrAsterisk> getSimpleSelectFields() {
        return List.of(
                CONTRIBUTIONS.ID.as(ContributionMapper.getFieldName(CONTRIBUTIONS.ID)),
                CONTRIBUTIONS.BUNDLE_ID.as(ContributionMapper.getFieldName(CONTRIBUTIONS.BUNDLE_ID)),
                CONTRIBUTIONS.LOCAL_REF.as(ContributionMapper.getFieldName(CONTRIBUTIONS.LOCAL_REF)),
                CONTRIBUTIONS.ENTITY_TYPE.as(ContributionMapper.getFieldName(CONTRIBUTIONS.ENTITY_TYPE)),
                CONTRIBUTIONS.ACTION.as(ContributionMapper.getFieldName(CONTRIBUTIONS.ACTION)),
                CONTRIBUTIONS.ENTITY_ID.as(ContributionMapper.getFieldName(CONTRIBUTIONS.ENTITY_ID)),
                CONTRIBUTIONS.PROPOSED_DATA.as(ContributionMapper.getFieldName(CONTRIBUTIONS.PROPOSED_DATA)),
                CONTRIBUTIONS.ENTITY_SNAPSHOT.as(ContributionMapper.getFieldName(CONTRIBUTIONS.ENTITY_SNAPSHOT)),
                CONTRIBUTIONS.STATUS.as(ContributionMapper.getFieldName(CONTRIBUTIONS.STATUS)),
                CONTRIBUTIONS.RESOLVED_ENTITY_ID.as(ContributionMapper.getFieldName(CONTRIBUTIONS.RESOLVED_ENTITY_ID)));
    }

    @Override
    protected SelectJoinStep<? extends Record> getSimpleFromClause() {
        return DSL().select(getSimpleSelectFields()).from(CONTRIBUTIONS);
    }

    @Override
    protected SelectJoinStep<? extends Record> getFullFromClause() {
        return DSL().select(getSimpleSelectFields())
                .select(new ContributionBundleDAO(this.DSL()).getSimpleSelectFields())
                .from(CONTRIBUTIONS)
                .leftJoin(CONTRIBUTION_BUNDLES).on(CONTRIBUTIONS.BUNDLE_ID.eq(CONTRIBUTION_BUNDLES.ID))
                // Special case for contribution bundles
                .leftJoin(USERS).on(CONTRIBUTION_BUNDLES.SUBMITTER_ID.eq(USERS.ID));
    }

    public Optional<Integer> create(Integer bundleId, SimpleContributionDTO dto) {
            return DSL().insertInto(CONTRIBUTIONS)
                    .set(CONTRIBUTIONS.BUNDLE_ID, bundleId)
                    .set(CONTRIBUTIONS.LOCAL_REF, dto.localRef())
                    .set(CONTRIBUTIONS.ENTITY_TYPE, dto.entityType())
                    .set(CONTRIBUTIONS.ACTION, dto.action())
                    .set(CONTRIBUTIONS.ENTITY_ID, dto.entityId())
                    .set(CONTRIBUTIONS.PROPOSED_DATA, MappingUtils.mapToJsonb(dto.proposedData()))
                    .set(CONTRIBUTIONS.ENTITY_SNAPSHOT, MappingUtils.mapToJsonb(dto.entitySnapshot()))
                    .set(CONTRIBUTIONS.STATUS, ContributionStatusEnum.pending)
                    .set(CONTRIBUTIONS.RESOLVED_ENTITY_ID, dto.resolvedEntityId())
                    .returning(CONTRIBUTIONS.ID)
                    .fetchOptional()
                    .map(record -> record.get(CONTRIBUTIONS.ID));
            }

    public Boolean updateStatus(Integer contributionId, ContributionStatusEnum newStatus) {
            return DSL().update(CONTRIBUTIONS)
                    .set(CONTRIBUTIONS.STATUS, newStatus)
                    .where(CONTRIBUTIONS.ID.eq(contributionId))
                    .execute() > 0;
    }

    public Boolean updateResolvedEntityId(Integer contributionId, Integer resolvedEntityId) {
        return DSL().update(CONTRIBUTIONS)
                .set(CONTRIBUTIONS.RESOLVED_ENTITY_ID, resolvedEntityId)
                .where(CONTRIBUTIONS.ID.eq(contributionId))
                .execute() > 0;
    }

    public Optional<ContributionDTO> findById(Integer id) {
        return getFullFromClause()
                .where(CONTRIBUTIONS.ID.eq(id))
                .fetchOptional()
                .map(getDefaultMapper());
    }
}
