package dev.stuten.vps.models.daos;

import java.util.Map;
import java.util.Optional;

import javax.naming.OperationNotSupportedException;

import org.jooq.DSLContext;

import dev.stuten.vps.jooq.enums.ContributionActionEnum;
import dev.stuten.vps.models.dtos.simple.SimpleUserDTO;
import dev.stuten.vps.models.dtos.template.IdDTO;

public abstract class ContributableDAO<T extends IdDTO> extends DAO {
    public ContributableDAO(DSLContext dsl) {
        super(dsl);
    }

    protected void replaceLocalRef(IdDTO dto, Map<Integer, Integer> localRefs)
            throws OperationNotSupportedException {
        Integer proposedObjId = dto.getId();
        if (proposedObjId < 0) {
            Integer replacementObjId = localRefs.get(proposedObjId);
            if (replacementObjId == null) {
                throw new OperationNotSupportedException(
                        "Trying to contribute an item before dependency is contributed (local ref not replaced)");
            }
            dto.setId(replacementObjId);
        }
    }

    protected abstract void replaceLocalRefs(T proposal, Map<Integer, Integer> localRefs)
            throws OperationNotSupportedException;

    protected abstract void insertUser(T proposal, SimpleUserDTO user);

    public abstract Optional<Integer> create(T dto);

    public abstract boolean update(T dto);

    public abstract boolean delete(T dto);

    public abstract Optional<T> findById(Integer id);

    public Optional<Integer> applyContribution(ContributionActionEnum action, IdDTO proposal,
            Map<Integer, Integer> localRefs, SimpleUserDTO submitter) throws OperationNotSupportedException {
        T realProposal = (T) proposal;
        replaceLocalRefs(realProposal, localRefs);
        insertUser(realProposal, submitter);
        switch (action) {
            case create:
                return create(realProposal);
            case update:
                return update(realProposal) ? Optional.of(proposal.getId()) : Optional.empty();
            case delete:
                return delete(realProposal) ? Optional.of(proposal.getId()) : Optional.empty();
            default:
                return Optional.empty();
        }
    }
}
