package dev.stuten.vps.services;

import java.util.Map;
import java.util.Optional;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.models.daos.ContributionBundleDAO;
import dev.stuten.vps.models.dtos.full.ContributionBundleDTO;
import dev.stuten.vps.models.dtos.simple.SimpleContributionDTO;
import dev.stuten.vps.models.dtos.template.IdDTO;
import dev.stuten.vps.web.ErrorResponse;
import dev.stuten.vps.web.middleware.AuthContext;
import dev.stuten.vps.web.middleware.AuthMiddleware;
import dev.stuten.vps.web.middleware.Role;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class ContributionBundleService {

    private ContributionBundleService() {}

    private static ContributionBundleDAO bundleDAO = new ContributionBundleDAO(JooqProvider.get());

    public static void submitBundle(Context ctx) {
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
        if (bundle.getSubmitter().getId() != Integer.parseInt(auth.userId()) && !AuthMiddleware.hasRole(ctx, Role.ADMIN)) {
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
        Optional<Integer> bundleId = bundleDAO.create(bundle);
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
                bundleDAO.delete(bundleId.get());
                ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, "Error creating contribution", e.getMessage());
                return;
            }
        }

        ContributionBundleDTO newBundle = bundleDAO.findById(bundleId.get()).get();

        ctx.status(HttpStatus.CREATED).json(Map.of("bundle", newBundle));
    }

    public static void getBundle(Context ctx) {
        Integer bundleId;
        try {
            bundleId = Integer.parseInt(ctx.pathParam("id"));
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "ID must be an integer");
            return;
        }

        Optional<ContributionBundleDTO> bundleOpt = bundleDAO.findById(bundleId);
        if (bundleOpt.isEmpty()) {
            String message = String.format("Contribution bundle of id %s not found", bundleId);
            ErrorResponse.send(HttpStatus.NOT_FOUND, "Contribution bundle not found", message);
            return;
        }

        ctx.json(Map.of("bundle", bundleOpt.get()));
    }
}
