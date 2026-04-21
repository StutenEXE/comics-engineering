package dev.stuten.vps.models.daos;

import java.util.Map;
import java.util.Optional;

import javax.naming.OperationNotSupportedException;

import org.jooq.DSLContext;

import dev.stuten.vps.jooq.enums.ContributionActionEnum;

public abstract class ContributableDAO<T> extends DAO {
    public ContributableDAO(DSLContext dsl) {
        super(dsl);
    }

    protected void replaceLocalRef(Map<String, Object> objMap, Map<Integer, Integer> localRefs)
            throws OperationNotSupportedException {
        Integer proposedObjId = (Integer) objMap.get("id");
        Integer replacementObjId = localRefs.get(proposedObjId);
        System.out.println("TEST ON APPROVAL : " + proposedObjId + " / " + replacementObjId);
        if (proposedObjId < 0) {
            if (replacementObjId == null) {
                throw new OperationNotSupportedException(
                        "Trying to contribute an item before dependency is contributed (local ref not replaced)");
            }
            objMap.put("id", replacementObjId);
        }
    }

    public abstract void replaceLocalRefs(Map<String, Object> proposedData, Map<Integer, Integer> localRefs)
            throws OperationNotSupportedException;

    protected abstract T mapProposedDataToDTO(Map<String, Object> proposedData);

    protected abstract Integer getIdFromDTO(T dto);

    public abstract Optional<Integer> create(T dto);

    public abstract boolean update(T dto);

    public abstract boolean delete(T dto);

    public abstract Optional<T> findById(Integer id);

    public Optional<Integer> applyContribution(ContributionActionEnum action, Map<String, Object> proposedData,
            Map<Integer, Integer> localRefs) throws OperationNotSupportedException {
        replaceLocalRefs(proposedData, localRefs);
        T proposal = mapProposedDataToDTO(proposedData);
        switch (action) {
            case create:
                return create(proposal);
            case update:
                return update(proposal) ? Optional.of(getIdFromDTO(proposal)) : Optional.empty();
            case delete:
                return delete(proposal) ? Optional.of(getIdFromDTO(proposal)) : Optional.empty();
            default:
                return Optional.empty();
        }
    }
}
