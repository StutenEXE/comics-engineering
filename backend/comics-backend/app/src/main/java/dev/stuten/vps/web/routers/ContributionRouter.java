package dev.stuten.vps.web.routers;

import dev.stuten.vps.services.ContributionBundleService;
import dev.stuten.vps.services.ContributionService;
import dev.stuten.vps.web.routers.utils.APIPathBuilder;
import io.javalin.Javalin;

public class ContributionRouter implements Router {

    @Override
    public void register(Javalin app) {
        // Public endpoints
        app.get(APIPathBuilder.buildPublicPath("/contributions/stats"), ContributionService::getStats);
        app.get(APIPathBuilder.buildPublicPath("/contributions/submitter"), ContributionService::getBySubmitterId);
        app.get(APIPathBuilder.buildPublicPath("/contributions/submitter/stats"),
                ContributionService::getStatsBySubmitterId);

        // Private endpoints
        app.post(APIPathBuilder.buildPrivatePath("/contribute"), ContributionBundleService::submit);
        app.post(APIPathBuilder.buildPrivatePath("/bundles/update"), ContributionBundleService::update);

        // Admin endpoints
        app.get(APIPathBuilder.buildAdminPath("/bundles"), ContributionBundleService::getById);
        app.get(APIPathBuilder.buildAdminPath("/bundles/all"), ContributionBundleService::getAll);
        app.post(APIPathBuilder.buildAdminPath("/contributions/create"), ContributionService::create);
        app.post(APIPathBuilder.buildAdminPath("/contributions/update"), ContributionService::update);
        app.post(APIPathBuilder.buildAdminPath("/contributions/update-status"), ContributionService::updateStatus);
        app.post(APIPathBuilder.buildAdminPath("/bundles/update-status"), ContributionBundleService::updateStatus);
    }
}