package dev.stuten.vps.services;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.models.daos.ContributionBundleDAO;
import dev.stuten.vps.models.dtos.full.ContributionBundleDTO;
import dev.stuten.vps.models.dtos.request.UpdateContributionBundleStatusDTO;
import dev.stuten.vps.models.dtos.simple.SimpleContributionBundleDTO;
import dev.stuten.vps.models.dtos.simple.SimpleContributionDTO;
import dev.stuten.vps.models.dtos.template.IdDTO;
import dev.stuten.vps.web.ErrorResponse;
import dev.stuten.vps.web.middleware.AuthContext;
import dev.stuten.vps.web.middleware.AuthMiddleware;
import dev.stuten.vps.web.middleware.Role;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class ContributionBundleService {

    private ContributionBundleService() {
    }

    private static ContributionBundleDAO dao = new ContributionBundleDAO(JooqProvider.get());

    public static void submit(Context ctx) {
        AuthContext auth = AuthMiddleware.getCurrentSession(ctx);
        if (auth == null) {
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, "Unauthorized", "User must be logged in");
            return;
        }

        ContributionBundleDTO bundle;
        try {
            bundle = ctx.bodyAsClass(ContributionBundleDTO.class);
        } catch (Exception e) {
            e.printStackTrace();
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Invalid JSON body");
            return;
        }

        // Validate bundle
        if (bundle.getSubmitter().getId() != Integer.parseInt(auth.userId())
                && !AuthMiddleware.hasRole(ctx, Role.ADMIN)) {
            ErrorResponse.send(HttpStatus.FORBIDDEN, "Forbidden", "You can only submit contributions for yourself");
            return;
        }
        if (bundle.getContributions() == null || bundle.getContributions().isEmpty()) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Contributions cannot be empty");
            return;
        }

        // Validate contributions
        for (SimpleContributionDTO<? extends IdDTO> contrib : bundle.getContributions()) {
            if (contrib.getEntityType() == null || contrib.getAction() == null) {
                ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request",
                        "Each contribution must have entityType and action");
                return;
            }
        }

        // Create contribution bundle
        Optional<Integer> bundleId = dao.create(bundle);
        if (bundleId.isEmpty()) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, "Contribution bundle not created", "");
            return;
        }
        // Create contributions
        for (SimpleContributionDTO<? extends IdDTO> contrib : bundle.getContributions()) {
            try {
                contrib.setBundleId(bundleId.get());
                ContributionService.createContribution(contrib);
            } catch (Exception e) {
                dao.delete(bundleId.get());
                ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, "Error creating contribution", e.getMessage());
                return;
            }
        }

        ContributionBundleDTO newBundle = dao.findById(bundleId.get()).get();

        ctx.status(HttpStatus.CREATED).json(Map.of("bundle", newBundle));
    }

    public static void update(Context ctx) {
        AuthContext auth = AuthMiddleware.getCurrentSession(ctx);
        if (auth == null) {
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, "Unauthorized", "User must be logged in");
            return;
        }

        ContributionBundleDTO bundle;
        try {
            bundle = ctx.bodyAsClass(ContributionBundleDTO.class);
        } catch (Exception e) {
            e.printStackTrace();
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Invalid JSON body");
            return;
        }

        // Validate bundle
        if (bundle.getSubmitter().getId() != Integer.parseInt(auth.userId())
                && !AuthMiddleware.hasRole(ctx, Role.ADMIN)) {
            ErrorResponse.send(HttpStatus.FORBIDDEN, "Forbidden", "You can only update contributions for yourself");
            return;
        }

        // Update contribution bundle
        Boolean updated = dao.update(bundle);
        if (!updated) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, "Contribution bundle not updated", "");
            return;
        }

        ctx.status(HttpStatus.CREATED).json(Map.of("bundle", bundle));
    }

    public static void updateStatus(Context ctx) {
        if (!AuthMiddleware.isAuthenticated(ctx)) {
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, "Unauthorized", "User must be logged in");
            return;
        }
        if (!AuthMiddleware.hasRole(ctx, Role.ADMIN)) {
            ErrorResponse.send(HttpStatus.FORBIDDEN, "Forbidden", "Only admins can update bundle status");
            return;
        }

        UpdateContributionBundleStatusDTO statusDTO;
        try {
            statusDTO = ctx.bodyAsClass(UpdateContributionBundleStatusDTO.class);
        } catch (Exception e) {
            e.printStackTrace();
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Invalid JSON body");
            return;
        }

        boolean updated = dao.updateStatus(statusDTO.bundleId(), statusDTO.newStatus());
        if (!updated) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, "Contribution bundle status not updated", "");
            return;
        }

        ctx.status(HttpStatus.OK);
    }

    public static void getById(Context ctx) {
        // Retrieve ID from request
        Integer id;
        try {
            id = Integer.parseInt(ctx.queryParam("id"));
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Missing ID or NaN ID");
            return; // For compiler
        }

        // Retrieve bundle
        Optional<ContributionBundleDTO> bundle = dao.findById(id);
        if (bundle.isEmpty()) {
            String message = String.format("Contribution bundle of id %s not found", id);
            ErrorResponse.send(HttpStatus.NOT_FOUND, "Contribution bundle not found", message);
        }

        ctx.json(Map.of("bundle", bundle));
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

        // Retrieve bundles
        List<ContributionBundleDTO> bundles = dao.findBySubmitterId(submitterId);

        ctx.json(Map.of("bundles", bundles));
    }

    public static void getAll(Context ctx) {
        Integer from, limit;
        try {
            from = Integer.parseInt(ctx.queryParam("from"));
            limit = Integer.parseInt(ctx.queryParam("limit"));
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request",
                    "Missing 'from' or 'limit' or NaN 'from' or 'limit'");
            return; // For compiler
        }
        if (from < 0 || limit <= 0) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "", "'from' < 0 or 'limit' <= 0");
        }

        // Retreive users
        List<SimpleContributionBundleDTO> bundles = dao.getSimpleBundles(from, limit);

        ctx.json(Map.of("bundles", bundles));
    }

}
