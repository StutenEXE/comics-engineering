package dev.stuten.vps.services;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
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
import dev.stuten.vps.models.dtos.template.IdDTO;
import dev.stuten.vps.web.ErrorResponse;
import dev.stuten.vps.web.middleware.AuthMiddleware;
import dev.stuten.vps.web.middleware.Role;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class ContributionService {

    private ContributionService() {
    }

    private static ContributionDAO contributionDAO = new ContributionDAO(JooqProvider.get());
    private static ContributionBundleDAO contributionBundleDAO = new ContributionBundleDAO(JooqProvider.get());

    private static ContributableDAO<? extends IdDTO> getDAOFromEntityType(ContributionTypeEnum type) {
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

    protected static <T extends IdDTO> void createContribution(SimpleContributionDTO<T> contrib) {
        // If we are updating or deleting save previous entity state
        if (contrib.getAction() != ContributionActionEnum.create) {
            ContributableDAO<? extends IdDTO> targetDAO = getDAOFromEntityType(contrib.getEntityType());
            Optional<T> entity = (Optional<T>) targetDAO.findById(contrib.getEntityId());
            if (entity.isEmpty()) {
                throw new RuntimeException("Cannot find entity of type %s and of id %d"
                        .formatted(contrib.getEntityType(), contrib.getId()));
            }
            contrib.setEntitySnapshot(entity.get());
        }
        // Create
        contributionDAO.create(contrib);
    }

    private static void approveContribution(ContributionDTO<? extends IdDTO> contribution)
            throws OperationNotSupportedException {
        // Get all local refs of the contribution bundle to check for dependencies
        // between contributions in the same bundle
        Optional<ContributionBundleDTO> bundle = contributionBundleDAO.findById(contribution.getBundle().getId());
        if (bundle.isEmpty()) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, "Error",
                    "Contribution bundle not found for contribution");
            return;
        }
        Map<Integer, Integer> localRefs = new HashMap<>();
        bundle.get().getContributions().stream()
                .filter(c -> c.getLocalRef() != null)
                .forEach(c -> localRefs.put(c.getLocalRef(), c.getResolvedEntityId()));
        // Get target DAO based on contribution entity type
        ContributableDAO<? extends IdDTO> targetDAO = getDAOFromEntityType(contribution.getEntityType());
        // Apply proposed changes to target entity and get resolved entity ID (in case
        // of creation)
        Optional<Integer> result = targetDAO.applyContribution(
                contribution.getAction(),
                contribution.getProposedData(),
                localRefs,
                bundle.get().getSubmitter());

        if (result.isEmpty()) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, "Error",
                    "Failed to apply contribution changes to target entity");
        }
        // Applying changes to target entity was successful, update contribution with
        // resolved entity ID if it was a creation
        if (contribution.getAction() == ContributionActionEnum.create) {
            contributionDAO.updateResolvedEntityId(contribution.getId(), result.get());
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

        Optional<ContributionDTO<? extends IdDTO>> contribution = contributionDAO.findById(updateDTO.contributionId());
        if (contribution.isEmpty()) {
            String message = String.format("Contributino of id %s not found", updateDTO.contributionId());
            ErrorResponse.send(HttpStatus.NOT_FOUND, "Contribution not found", message);
        }
        // If the new status changes nothing
        ContributionStatusEnum previousStatus = contribution.get().getStatus();
        if (previousStatus == updateDTO.newStatus()) {
            String message = "Contribution already has this status %s".formatted(previousStatus);
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Contribution already has status", message);
        }
        // Update status
        Boolean updated = contributionDAO.updateStatus(updateDTO.contributionId(), updateDTO.newStatus());
        if (!updated) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, "Error", "Failed to update contribution status");
        }

        ContributionDTO<?> updatedContrib = contributionDAO.findById(updateDTO.contributionId()).get();

        // Special handling for approval - if contribution is approved, we need to apply
        // the proposed changes to the target entity
        if (updatedContrib.getStatus() == ContributionStatusEnum.approved) {
            try {
                approveContribution(updatedContrib);
            } catch (Exception e) {
                contributionDAO.updateStatus(updateDTO.contributionId(), previousStatus);
                System.out.print(Arrays.asList(e.getStackTrace()));
                ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, "Error", e.getMessage());
            }
        }

        ctx.status(HttpStatus.OK);
    }

    public static void getBySubmitterId(Context ctx) {
        // Retreive submitter ID from request
        Integer submitterId;
        try {
            submitterId = Integer.parseInt(ctx.queryParam("id"));
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Missing ID or NaN ID");
            return; // For compiler
        }

        // Retreive books
        List<ContributionDTO<? extends IdDTO>> contributions = contributionDAO.findBySubmitterId(submitterId);

        ctx.json(Map.of("contributions", contributions));
    }
}
