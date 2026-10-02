package dev.stuten.vps.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.db.Transactions;
import dev.stuten.vps.db.Transactions.TransactionContext;
import dev.stuten.vps.jooq.enums.ContributionActionEnum;
import dev.stuten.vps.jooq.enums.ContributionStatusEnum;
import dev.stuten.vps.jooq.enums.ContributionTypeEnum;
import dev.stuten.vps.models.daos.BookDAO;
import dev.stuten.vps.models.daos.ContributableDAO;
import dev.stuten.vps.models.daos.ContributionBundleDAO;
import dev.stuten.vps.models.daos.ContributionDAO;
import dev.stuten.vps.models.daos.EditionDAO;
import dev.stuten.vps.models.daos.IssueDAO;
import dev.stuten.vps.models.daos.IssueSerieDAO;
import dev.stuten.vps.models.daos.PublisherDAO;
import dev.stuten.vps.models.daos.SerieDAO;
import dev.stuten.vps.models.dtos.full.ContributionBundleDTO;
import dev.stuten.vps.models.dtos.full.ContributionDTO;
import dev.stuten.vps.models.dtos.request.UpdateContributionStatusDTO;
import dev.stuten.vps.models.dtos.response.ContributionsStatsDTO;
import dev.stuten.vps.models.dtos.response.ContributionsStatsDTO.ContributionStatusStatsDTO;
import dev.stuten.vps.models.dtos.simple.SimpleContributionDTO;
import dev.stuten.vps.models.dtos.template.IdDTO;
import dev.stuten.vps.web.ErrorCode;
import dev.stuten.vps.web.ErrorResponse;
import dev.stuten.vps.web.middleware.AuthMiddleware;
import dev.stuten.vps.web.middleware.Role;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class ContributionService {

    private ContributionService() {
    }

    private static ContributionDAO contributionDAO = new ContributionDAO(JooqProvider.get());

    private static ContributableDAO<? extends IdDTO> getDAOFromEntityType(ContributionTypeEnum type,
            TransactionContext tx) {
        return switch (type) {
            case ContributionTypeEnum.book -> new BookDAO(tx.dsl(), tx.images());
            case ContributionTypeEnum.serie -> new SerieDAO(tx.dsl());
            case ContributionTypeEnum.edition -> new EditionDAO(tx.dsl(), tx.images());
            case ContributionTypeEnum.issue -> new IssueDAO(tx.dsl());
            case ContributionTypeEnum.issueserie -> new IssueSerieDAO(tx.dsl());
            case ContributionTypeEnum.publisher -> new PublisherDAO(tx.dsl());
        };
    }

    protected static <T extends IdDTO> Optional<Integer> createContribution(SimpleContributionDTO<T> contrib,
            TransactionContext tx) {
        contrib.setStatus(ContributionStatusEnum.pending);
        // If we are updating or deleting save previous entity state
        if (contrib.getAction() != ContributionActionEnum.create) {
            ContributableDAO<? extends IdDTO> targetDAO = getDAOFromEntityType(contrib.getEntityType(), tx);
            Optional<T> entity = (Optional<T>) targetDAO.findById(contrib.getEntityId());
            if (entity.isEmpty()) {
                throw new RuntimeException("Cannot find entity of type %s and of id %d"
                        .formatted(contrib.getEntityType(), contrib.getId()));
            }
            contrib.setEntitySnapshot(entity.get());
        }
        // Create
        Optional<Integer> result = new ContributionDAO(tx.dsl()).create(contrib);
        return result;
    }

    /**
     * Applies the proposed changes to the target entity. Must run inside the same
     * transaction as the status update, any error thrown rolls both back.
     */
    private static void approveContribution(ContributionDTO<? extends IdDTO> contribution, TransactionContext tx) {
        // Get all local refs of the contribution bundle to check for dependencies
        // between contributions in the same bundle
        Optional<ContributionBundleDTO> bundle = new ContributionBundleDAO(tx.dsl())
                .findById(contribution.getBundle().getId());
        if (bundle.isEmpty()) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.CONTRIBUTION_NOT_APPLIED,
                    "Contribution bundle not found for contribution");
            return;
        }
        Map<Integer, Integer> localRefs = new HashMap<>();
        bundle.get().getContributions().stream()
                .filter(c -> c.getLocalRef() != null)
                .forEach(c -> localRefs.put(c.getLocalRef(), c.getResolvedEntityId()));
        // Get target DAO based on contribution entity type
        ContributableDAO<? extends IdDTO> targetDAO = getDAOFromEntityType(contribution.getEntityType(), tx);
        // Apply proposed changes to target entity and get resolved entity ID (in case
        // of creation)
        Optional<Integer> result;
        try {
            result = targetDAO.applyContribution(
                    contribution.getAction(),
                    contribution.getProposedData(),
                    localRefs,
                    bundle.get().getSubmitter());
        } catch (Exception e) {
            e.printStackTrace();
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.CONTRIBUTION_NOT_APPLIED,
                    "Failed to apply contribution changes to target entity: %s".formatted(e.getMessage()));
            return;
        }

        if (result.isEmpty()) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.CONTRIBUTION_NOT_APPLIED,
                    "Failed to apply contribution changes to target entity");
            return;
        }
        // Applying changes to target entity was successful, update contribution with
        // resolved entity ID if it was a creation
        if (contribution.getAction() == ContributionActionEnum.create) {
            new ContributionDAO(tx.dsl()).updateResolvedEntityId(contribution.getId(), result.get());
        }
    }

    public static void create(Context ctx) {
        if (!AuthMiddleware.isAuthenticated(ctx)) {
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, ErrorCode.NOT_AUTHENTICATED, "User must be logged in");
            return;
        }

        SimpleContributionDTO<? extends IdDTO> contribution;
        try {
            contribution = ctx.bodyAsClass(SimpleContributionDTO.class);
        } catch (Exception e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_REQUEST, "Invalid JSON body");
            return;
        }
        SimpleContributionDTO<? extends IdDTO> newContribution = contribution;
        Optional<Integer> contributionId = Transactions.run(tx -> createContribution(newContribution, tx));

        ContributionDTO<? extends IdDTO> createdContribution = contributionDAO.findById(contributionId.get()).get();

        ctx.status(HttpStatus.CREATED).json(Map.of("contribution", createdContribution));
    }

    public static void update(Context ctx) {
        if (!AuthMiddleware.isAuthenticated(ctx)) {
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, ErrorCode.NOT_AUTHENTICATED, "User must be logged in");
            return;
        }

        SimpleContributionDTO<? extends IdDTO> contribution;
        try {
            contribution = ctx.bodyAsClass(SimpleContributionDTO.class);
        } catch (Exception e) {
            e.printStackTrace();
            ErrorResponse.send(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_REQUEST, "Invalid JSON body");
            return;
        }

        if (contribution.getStatus() == ContributionStatusEnum.approved
                || contribution.getStatus() == ContributionStatusEnum.rejected) {
            String message = "Cannot update contribution with already accepted or rejected status";
            ErrorResponse.send(HttpStatus.METHOD_NOT_ALLOWED, ErrorCode.CONTRIBUTION_ALREADY_CLOSED, message);
            return;
        }

        boolean updated = contributionDAO.update(contribution);
        if (!updated) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.CONTRIBUTION_NOT_UPDATED, "Failed to update contribution");
            return;
        }

        ctx.status(HttpStatus.CREATED).json(Map.of("contribution", contribution));
    }

    public static void updateStatus(Context ctx) {
        if (!AuthMiddleware.isAuthenticated(ctx)) {
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, ErrorCode.NOT_AUTHENTICATED, "User must be logged in");
            return;
        }
        if (!AuthMiddleware.hasRole(ctx, Role.ADMIN)) {
            ErrorResponse.send(HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN, "Only admins can update contributions");
            return;
        }

        UpdateContributionStatusDTO updateDTO;
        try {
            updateDTO = ctx.bodyAsClass(UpdateContributionStatusDTO.class);
        } catch (Exception e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_REQUEST, "Invalid JSON body");
            return;
        }

        Optional<ContributionDTO<? extends IdDTO>> contribution = contributionDAO.findById(updateDTO.contributionId());
        if (contribution.isEmpty()) {
            String message = String.format("Contribution of id %s not found", updateDTO.contributionId());
            ErrorResponse.send(HttpStatus.NOT_FOUND, ErrorCode.CONTRIBUTION_NOT_FOUND, message);
        }
        // If the new status changes nothing
        ContributionStatusEnum previousStatus = contribution.get().getStatus();
        if (previousStatus == updateDTO.newStatus()) {
            String message = "Contribution already has this status : %s".formatted(previousStatus);
            ErrorResponse.send(HttpStatus.METHOD_NOT_ALLOWED, ErrorCode.CONTRIBUTION_SAME_STATUS, message);
        }
        // If the contribution bundle is already accepted or rejected, we don't allow
        // status change of individual contributions
        if (previousStatus == ContributionStatusEnum.approved || previousStatus == ContributionStatusEnum.rejected) {
            String message = "Cannot change status of contribution with already accepted or rejected status";
            ErrorResponse.send(HttpStatus.METHOD_NOT_ALLOWED, ErrorCode.CONTRIBUTION_ALREADY_CLOSED, message);
        }
        // Status update and application of the changes are done in a single
        // transaction : if applying the contribution fails, the status is not changed
        Transactions.run(tx -> {
            ContributionDAO txContributionDAO = new ContributionDAO(tx.dsl());

            // Update status
            Boolean updated = txContributionDAO.updateStatus(updateDTO.contributionId(), updateDTO.newStatus());
            if (!updated) {
                ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.CONTRIBUTION_NOT_UPDATED,
                        "Failed to update contribution status");
            }

            Optional<ContributionDTO<?>> updatedContrib = txContributionDAO.findById(updateDTO.contributionId());
            if (updatedContrib.isEmpty()) {
                ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.CONTRIBUTION_NOT_UPDATED,
                        "Cannot find the updated contribution after status update");
            }

            // Special handling for approval - if contribution is approved, we need to apply
            // the proposed changes to the target entity
            if (updatedContrib.get().getStatus() == ContributionStatusEnum.approved) {
                approveContribution(updatedContrib.get(), tx);
            }
            return null;
        });

        ctx.status(HttpStatus.OK);
    }

    public static void getStats(Context ctx) {
        // Counts the total number of contributions
        Integer total = 0;
        // For each status of contribution, get all stats
        Map<ContributionStatusEnum, ContributionStatusStatsDTO> statusStats = new HashMap<ContributionStatusEnum, ContributionStatusStatsDTO>();

        // For each possible status, calculate stats
        for (ContributionStatusEnum status : ContributionStatusEnum.values()) {
            // For each possible contribution type, calculate stats
            Map<ContributionTypeEnum, Integer> typeStats = new HashMap<ContributionTypeEnum, Integer>();
            // Init for all types
            for (ContributionTypeEnum type : ContributionTypeEnum.values()) {
                typeStats.put(type, 0);
            }
            // Group count of contributions by type
            List<ContributionDTO<? extends IdDTO>> contributions = contributionDAO.findByStatus(status);
            contributions.forEach(c -> {
                Integer currentCount = typeStats.get(c.getEntityType());
                typeStats.put(c.getEntityType(), currentCount + 1);
            });
            // Calculate the total number of contributions for this status
            Integer totalStatus = contributions.size();
            statusStats.put(status, new ContributionStatusStatsDTO(totalStatus, typeStats));
            // Add number of contrib for this status to the total count
            total += totalStatus;
        }

        ctx.json(Map.of("stats", new ContributionsStatsDTO(total, statusStats)));
    }

    public static void getBySubmitterId(Context ctx) {
        // Retreive submitter ID from request
        Integer submitterId;
        try {
            submitterId = Integer.parseInt(ctx.queryParam("id"));
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, ErrorCode.MISSING_ID, "Missing ID or NaN ID");
            return; // For compiler
        }

        // Retreive contributions
        List<ContributionDTO<? extends IdDTO>> contributions = contributionDAO.findBySubmitterId(submitterId);

        ctx.json(Map.of("contributions", contributions));
    }

    public static void getStatsBySubmitterId(Context ctx) {
        // Retreive submitter ID from request
        Integer submitterId;
        try {
            submitterId = Integer.parseInt(ctx.queryParam("id"));
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, ErrorCode.MISSING_ID, "Missing ID or NaN ID");
            return; // For compiler
        }

        // Counts the total number of contributions
        Integer total = 0;
        // For each status of contribution, get all stats
        Map<ContributionStatusEnum, ContributionStatusStatsDTO> statusStats = new HashMap<ContributionStatusEnum, ContributionStatusStatsDTO>();
        // Get all contributions
        List<ContributionDTO<? extends IdDTO>> contributions = contributionDAO.findBySubmitterId(submitterId);

        // For each possible status, calculate stats
        for (ContributionStatusEnum status : ContributionStatusEnum.values()) {
            // Filter only the relevant contributions
            List<ContributionDTO<? extends IdDTO>> statusContributions = contributions.stream()
                    .filter(c -> c.getStatus() == status)
                    .toList();
            // For each possible contribution type, calculate stats
            Map<ContributionTypeEnum, Integer> typeStats = new HashMap<ContributionTypeEnum, Integer>();
            // Init for all types
            for (ContributionTypeEnum type : ContributionTypeEnum.values()) {
                typeStats.put(type, 0);
            }
            // Group count of contributions by type
            statusContributions.forEach(c -> {
                Integer currentCount = typeStats.get(c.getEntityType());
                typeStats.put(c.getEntityType(), currentCount + 1);
            });
            // Calculate the total number of contributions for this status
            Integer totalStatus = statusContributions.size();
            statusStats.put(status, new ContributionStatusStatsDTO(totalStatus, typeStats));
            // Add number of contrib for this status to the total count
            total += totalStatus;
        }

        ctx.json(Map.of("stats", new ContributionsStatsDTO(total, statusStats)));
    }
}
