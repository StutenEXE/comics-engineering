package dev.stuten.vps.models.daos;

import static dev.stuten.vps.jooq.tables.ContributionBundles.CONTRIBUTION_BUNDLES;
import static dev.stuten.vps.jooq.tables.Contributions.CONTRIBUTIONS;
import static dev.stuten.vps.jooq.tables.Users.USERS;
import static org.jooq.impl.DSL.multiset;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.RecordMapper;
import org.jooq.SelectFieldOrAsterisk;
import org.jooq.SelectJoinStep;

import dev.stuten.vps.jooq.enums.ContributionBundleStatusEnum;
import dev.stuten.vps.models.dtos.full.ContributionBundleDTO;
import dev.stuten.vps.models.mappers.ContributionBundleMapper;

public class ContributionBundleDAO extends DAO {

        public ContributionBundleDAO(DSLContext dsl) {
                super(dsl);
        }

        @Override
        protected RecordMapper<? super Record, ContributionBundleDTO> getDefaultMapper() {
                return ContributionBundleMapper::mapToDTO;
        }

        @Override
        protected Collection<SelectFieldOrAsterisk> getSimpleSelectFields() {
                return List.of(
                                CONTRIBUTION_BUNDLES.ID
                                                .as(ContributionBundleMapper.getFieldName(CONTRIBUTION_BUNDLES.ID)),
                                CONTRIBUTION_BUNDLES.STATUS
                                                .as(ContributionBundleMapper.getFieldName(CONTRIBUTION_BUNDLES.STATUS)),
                                CONTRIBUTION_BUNDLES.NOTE
                                                .as(ContributionBundleMapper.getFieldName(CONTRIBUTION_BUNDLES.NOTE)),
                                CONTRIBUTION_BUNDLES.SUBMITTER_ID
                                                .as(ContributionBundleMapper
                                                                .getFieldName(CONTRIBUTION_BUNDLES.SUBMITTER_ID)),
                                USERS.USERNAME.as(ContributionBundleMapper.getFieldName(USERS.USERNAME)),
                                CONTRIBUTION_BUNDLES.CREATED_AT
                                                .as(ContributionBundleMapper
                                                                .getFieldName(CONTRIBUTION_BUNDLES.CREATED_AT)),
                                CONTRIBUTION_BUNDLES.MODIFIED_AT
                                                .as(ContributionBundleMapper
                                                                .getFieldName(CONTRIBUTION_BUNDLES.MODIFIED_AT)));
        }

        @Override
        protected SelectJoinStep<? extends Record> getSimpleFromClause() {
                return DSL().selectDistinct(getSimpleSelectFields()).from(CONTRIBUTION_BUNDLES)
                                .leftJoin(USERS).on(CONTRIBUTION_BUNDLES.SUBMITTER_ID.eq(USERS.ID));
        }

        @Override
        protected SelectJoinStep<? extends Record> getFullFromClause() {
                return DSL().select(getSimpleSelectFields())
                                .select(multiset( // Contributions (1 to many)
                                                new ContributionDAO(this.DSL())
                                                                .getSimpleFromClause()
                                                                .where(CONTRIBUTIONS.BUNDLE_ID
                                                                                .eq(CONTRIBUTION_BUNDLES.ID)))
                                                .as("contributions"))
                                .select(new UserDAO(this.DSL()).getSimpleSelectFields())
                                .from(CONTRIBUTION_BUNDLES)
                                .leftJoin(USERS).on(CONTRIBUTION_BUNDLES.SUBMITTER_ID.eq(USERS.ID));
        }

        public Optional<Integer> create(ContributionBundleDTO dto) {
                return DSL().insertInto(CONTRIBUTION_BUNDLES)
                                .set(CONTRIBUTION_BUNDLES.STATUS, ContributionBundleStatusEnum.pending)
                                .set(CONTRIBUTION_BUNDLES.NOTE, dto.getNote())
                                .set(CONTRIBUTION_BUNDLES.SUBMITTER_ID, dto.getSubmitter().getId())
                                .returning(CONTRIBUTION_BUNDLES.ID)
                                .fetchOptional()
                                .map(record -> record.get(CONTRIBUTION_BUNDLES.ID));
        }

        public Boolean delete(Integer id) {
                return DSL().deleteFrom(CONTRIBUTION_BUNDLES)
                                .where(CONTRIBUTION_BUNDLES.ID.eq(id))
                                .execute() > 0;
        }

        public Optional<ContributionBundleDTO> findById(Integer id) {
                return super.selectOne(CONTRIBUTION_BUNDLES.ID.eq(id));
        }

        public List<ContributionBundleDTO> findBySubmitterId(Integer submitterId) {
                return super.selectMany(CONTRIBUTION_BUNDLES.SUBMITTER_ID.eq(submitterId));
        }

        public List<ContributionBundleDTO> getBundles(Integer from, Integer limit) {
                return getFullFromClause()
                                .offset(from)
                                .limit(limit)
                                .fetch(getDefaultMapper());
        }
}
