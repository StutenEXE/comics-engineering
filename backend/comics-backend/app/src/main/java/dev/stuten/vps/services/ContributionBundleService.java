package dev.stuten.vps.services;

import static dev.stuten.vps.services.utils.RequestServiceUtil.requireBody;
import static dev.stuten.vps.services.utils.RequestServiceUtil.requireFound;
import static dev.stuten.vps.services.utils.RequestServiceUtil.requireId;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.db.Transactions;
import dev.stuten.vps.models.daos.ContributionBundleDAO;
import dev.stuten.vps.models.dtos.full.ContributionBundleDTO;
import dev.stuten.vps.models.dtos.request.UpdateContributionBundleStatusDTO;
import dev.stuten.vps.models.dtos.simple.SimpleContributionBundleDTO;
import dev.stuten.vps.models.dtos.simple.SimpleContributionDTO;
import dev.stuten.vps.models.dtos.template.IdDTO;
import dev.stuten.vps.services.utils.AuthServiceUtil;
import dev.stuten.vps.services.utils.PaginationServiceUtil;
import dev.stuten.vps.web.ErrorCode;
import dev.stuten.vps.web.ErrorResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class ContributionBundleService {

    private ContributionBundleService() {
    }

    private static ContributionBundleDAO dao = new ContributionBundleDAO(JooqProvider.get());

    public static void submit(Context ctx) {
        AuthServiceUtil.requireSession(ctx);
        ContributionBundleDTO bundle = requireBody(ctx, ContributionBundleDTO.class);

        // Validate bundle
        AuthServiceUtil.requireSelfOrAdmin(ctx, bundle.getSubmitter().getId(),
                "You can only submit contributions for yourself");
        if (bundle.getContributions() == null || bundle.getContributions().isEmpty()) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, ErrorCode.BUNDLE_EMPTY, "Contributions cannot be empty");
        }

        // Validate contributions
        for (SimpleContributionDTO<? extends IdDTO> contrib : bundle.getContributions()) {
            if (contrib.getEntityType() == null || contrib.getAction() == null) {
                ErrorResponse.send(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_REQUEST,
                        "Each contribution must have entityType and action");
            }
        }

        // Create the bundle and its contributions in a single transaction : if one
        // contribution fails, nothing is created
        Integer bundleId = Transactions.run(tx -> {
            // Create contribution bundle
            Optional<Integer> createdId = new ContributionBundleDAO(tx.dsl()).create(bundle);
            if (createdId.isEmpty()) {
                ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.BUNDLE_NOT_CREATED, "");
            }
            // Create contributions
            for (SimpleContributionDTO<? extends IdDTO> contrib : bundle.getContributions()) {
                contrib.setBundleId(createdId.get());
                try {
                    ContributionService.createContribution(contrib, tx);
                } catch (Exception e) {
                    ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.BUNDLE_NOT_CREATED,
                            e.getMessage());
                }
            }
            return createdId.get();
        });

        ContributionBundleDTO newBundle = dao.findById(bundleId).get();

        ctx.status(HttpStatus.CREATED).json(Map.of("bundle", newBundle));
    }

    public static void update(Context ctx) {
        AuthServiceUtil.requireSession(ctx);
        ContributionBundleDTO bundle = requireBody(ctx, ContributionBundleDTO.class);

        // Validate bundle
        AuthServiceUtil.requireSelfOrAdmin(ctx, bundle.getSubmitter().getId(),
                "You can only update contributions for yourself");

        // Update contribution bundle
        Boolean updated = dao.update(bundle);
        if (!updated) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.BUNDLE_NOT_UPDATED, "");
        }

        ctx.status(HttpStatus.CREATED).json(Map.of("bundle", bundle));
    }

    public static void updateStatus(Context ctx) {
        AuthServiceUtil.requireAdmin(ctx, "Only admins can update bundle status");
        UpdateContributionBundleStatusDTO statusDTO = requireBody(ctx, UpdateContributionBundleStatusDTO.class);

        boolean updated = dao.updateStatus(statusDTO.bundleId(), statusDTO.newStatus());
        if (!updated) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.BUNDLE_STATUS_NOT_UPDATED, "");
        }

        ctx.status(HttpStatus.OK);
    }

    public static void getById(Context ctx) {
        Integer id = requireId(ctx);
        ContributionBundleDTO bundle = requireFound(dao.findById(id), ErrorCode.BUNDLE_NOT_FOUND,
                "Contribution bundle", id);

        ctx.json(Map.of("bundle", bundle));
    }

    public static void getBySubmitterId(Context ctx) {
        List<ContributionBundleDTO> bundles = dao.findBySubmitterId(requireId(ctx));

        ctx.json(Map.of("bundles", bundles));
    }

    public static void getAll(Context ctx) {
        List<SimpleContributionBundleDTO> bundles = dao.getSimpleBundles(PaginationServiceUtil.getFromContext(ctx));

        ctx.json(Map.of("bundles", bundles));
    }

}
