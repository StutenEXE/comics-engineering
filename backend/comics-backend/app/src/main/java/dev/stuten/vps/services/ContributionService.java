package dev.stuten.vps.services;

import java.util.Map;
import java.util.Optional;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.models.daos.ContributionBundleDAO;
import dev.stuten.vps.models.daos.ContributionDAO;
import dev.stuten.vps.models.dtos.full.ContributionBundleDTO;
import dev.stuten.vps.models.dtos.simple.SimpleContributionDTO;
import dev.stuten.vps.web.ErrorResponse;
import dev.stuten.vps.web.middleware.AuthContext;
import dev.stuten.vps.web.middleware.AuthMiddleware;
import dev.stuten.vps.web.middleware.Role;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class ContributionService {

    private ContributionService() {}

    private static ContributionBundleDAO bundleDAO = new ContributionBundleDAO(JooqProvider.get());
    private static ContributionDAO contributionDAO = new ContributionDAO(JooqProvider.get());
    // private static ContributionReviewDAO reviewDAO = new ContributionReviewDAO(JooqProvider.get());

    // Entity DAOs for applying contributions
    // private static BookDAO bookDAO = new BookDAO(JooqProvider.get());
    // private static SerieDAO serieDAO = new SerieDAO(JooqProvider.get());
    // private static EditionDAO editionDAO = new EditionDAO(JooqProvider.get());
    // private static IssueDAO issueDAO = new IssueDAO(JooqProvider.get());
    // private static IssueSerieDAO issueSerieDAO = new IssueSerieDAO(JooqProvider.get());
    // private static PublisherDAO publisherDAO = new PublisherDAO(JooqProvider.get());

    /**
     * Submit a new contribution bundle
     */
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
            System.out.println("Error parsing contribution bundle submission: " + e.getMessage());
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Invalid JSON body");
            return;
        }

        // Validate bundle
        if (bundle.contributions() == null || bundle.contributions().isEmpty()) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Contributions cannot be empty");
            return;
        }
        if (bundle.submitter().id() != Integer.parseInt(auth.userId()) && !auth.role().equals(Role.ADMIN)) {
            ErrorResponse.send(HttpStatus.FORBIDDEN, "Forbidden", "You can only submit contributions for yourself");
            return;
        }

        // Validate contributions
        for (SimpleContributionDTO contrib : bundle.contributions()) {
            if (contrib.entityType() == null || contrib.action() == null) {
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
        for (SimpleContributionDTO contrib : bundle.contributions()) {
            try {
                contributionDAO.create(bundleId.get(), contrib);
            } catch (Exception e) {
                bundleDAO.delete(bundleId.get());
                ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, "Error creating contribution", e.getMessage());
                return;
            }
        }

        ContributionBundleDTO newBundle = bundleDAO.findById(bundleId.get()).get();

        ctx.status(HttpStatus.CREATED).json(Map.of("bundle", newBundle));
    }
}
