package dev.stuten.vps.web.routers;

import dev.stuten.vps.services.ContributionBundleService;
import dev.stuten.vps.services.ContributionService;
import dev.stuten.vps.web.routers.utils.APIPathBuilder;
import io.javalin.Javalin;

public class ContributionRouter implements Router {

    @Override
    public void register(Javalin app) {
        // Public endpoints
        app.get(APIPathBuilder.buildPublicPath("/contributions/submitter"), ContributionService::getBySubmitterId);

        // Private endpoints
        app.post(APIPathBuilder.buildPrivatePath("/contribute"), ContributionBundleService::submit);
        app.post(APIPathBuilder.buildPrivatePath("/bundles/update"), ContributionBundleService::update);

        // Admin endpoints
        app.get(APIPathBuilder.buildAdminPath("/contributions/all"), ContributionBundleService::getAll);
        app.post(APIPathBuilder.buildAdminPath("/contributions/update-status"), ContributionService::updateStatus);
        app.post(APIPathBuilder.buildAdminPath("/bundles/update-status"), ContributionBundleService::updateStatus);
    }
}