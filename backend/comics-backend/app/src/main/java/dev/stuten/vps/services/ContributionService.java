package dev.stuten.vps.services;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import javax.naming.OperationNotSupportedException;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.jooq.enums.ContributionActionEnum;
import dev.stuten.vps.jooq.enums.ContributionStatusEnum;
import dev.stuten.vps.jooq.enums.ContributionTypeEnum;
import dev.stuten.vps.models.daos.ContributableDAO;
import dev.stuten.vps.models.daos.ContributionBundleDAO;
import dev.stuten.vps.models.daos.ContributionDAO;
import dev.stuten.vps.models.dtos.full.ContributionBundleDTO;
import dev.stuten.vps.models.dtos.full.ContributionDTO;
import dev.stuten.vps.models.dtos.request.UpdateContributionStatusDTO;
import dev.stuten.vps.models.dtos.simple.SimpleContributionDTO;
import dev.stuten.vps.models.dtos.simple.SimpleUserDTO;
import dev.stuten.vps.web.ErrorResponse;
import dev.stuten.vps.web.middleware.AuthContext;
import dev.stuten.vps.web.middleware.AuthMiddleware;
import dev.stuten.vps.web.middleware.Role;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class ContributionService {

    private ContributionService() {
    }

    private static ContributionDAO contributionDAO = new ContributionDAO(JooqProvider.get());
    private static ContributionBundleDAO contributionBundleDAO = new ContributionBundleDAO(JooqProvider.get());

    private static ContributableDAO<? extends Record> getDAOFromEntityType(ContributionTypeEnum type) {
        return switch (type) {
            case ContributionTypeEnum.book -> BookService.getDAO();
            case ContributionTypeEnum.serie -> SerieService.getDAO();
            case ContributionTypeEnum.edition -> EditionService.getDAO();
            case ContributionTypeEnum.issue -> IssueService.getDAO();
            case ContributionTypeEnum.issueserie -> IssueSerieService.getDAO();
            case ContributionTypeEnum.publisher -> PublisherService.getDAO();
            case ContributionTypeEnum.link_book_issue -> BookService.getDAO(); // TODO CHANGE
        };
    }

    protected static void createContribution(Integer bundleId, SimpleContributionDTO contrib, AuthContext auth) {
        // Adding the submitter id
        SimpleUserDTO submitter = new SimpleUserDTO(Integer.parseInt(auth.userId()), "");
        contrib.proposedData().put("addedBy", submitter);

        contrib = new SimpleContributionDTO(
                null, bundleId, contrib.localRef(), contrib.entityType(), contrib.action(), contrib.entityId(),
                contrib.proposedData(),
                contrib.entitySnapshot(), contrib.status(), contrib.resolvedEntityId());
        contributionDAO.create(bundleId, contrib);
    }

    private static void approveContribution(ContributionDTO contribution) throws OperationNotSupportedException {
        // Get all local refs of the contribution bundle to check for dependencies
        // between contributions in the same bundle
        Optional<ContributionBundleDTO> bundle = contributionBundleDAO.findById(contribution.bundle().id());
        if (bundle.isEmpty()) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, "Error",
                    "Contribution bundle not found for contribution");
            return;
        }
        Map<Integer, Integer> localRefs = new HashMap<>();
        bundle.get().contributions().stream()
                .filter(c -> c.localRef() != null)
                .forEach(c -> localRefs.put(c.localRef(), c.resolvedEntityId()));
        // Get target DAO based on contribution entity type
        ContributableDAO<? extends Record> targetDAO = getDAOFromEntityType(contribution.entityType());
        // Apply proposed changes to target entity and get resolved entity ID (in case
        // of creation)
        Optional<Integer> result = targetDAO.applyContribution(contribution.action(),
                contribution.proposedData(), localRefs);
        if (result.isEmpty()) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, "Error",
                    "Failed to apply contribution changes to target entity");
        }
        // Applying changes to target entity was successful, update contribution with
        // resolved entity ID if it was a creation
        if (contribution.action() == ContributionActionEnum.create) {
            contributionDAO.updateResolvedEntityId(contribution.id(), result.get());
        }
    }

    public static void updateStatus(Context ctx) {
        if (!AuthMiddleware.isAuthenticated(ctx)) {
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, "Unauthorized", "User must be logged in");
            return;
        }
        if (!AuthMiddleware.hasRole(ctx, Role.ADMIN)) {
            ErrorResponse.send(HttpStatus.FORBIDDEN, "Forbidden", "Only admins can update contributions");
            return;
        }

        UpdateContributionStatusDTO updateDTO;
        try {
            updateDTO = ctx.bodyAsClass(UpdateContributionStatusDTO.class);
        } catch (Exception e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Invalid JSON body");
            return;
        }

        Boolean updated = contributionDAO.updateStatus(updateDTO.contributionId(), updateDTO.newStatus());
        if (!updated) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, "Error", "Failed to update contribution status");
        }

        ContributionDTO contribution;// = contributionDAO.findById(updateDTO.contributionId()).get();

        contribution = contributionDAO.findById(updateDTO.contributionId()).get();

        // Special handling for approval - if contribution is approved, we need to apply
        // the proposed changes to the target entity
        if (contribution.status() == ContributionStatusEnum.approved) {
            try {
                approveContribution(contribution);
            }
            catch(Exception e) {
                System.out.print(Arrays.asList(e.getStackTrace()));
                ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, "Error", e.getMessage());
            }
        }

        ctx.status(HttpStatus.OK);
    }
}
