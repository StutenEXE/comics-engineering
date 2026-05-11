package dev.stuten.vps.web.routers;

import dev.stuten.vps.services.ContributionBundleService;
import dev.stuten.vps.services.ContributionService;
import dev.stuten.vps.web.routers.utils.APIPathBuilder;
import io.javalin.Javalin;

public class ContributionRouter implements Router {

    @Override
    public void register(Javalin app) {
        // Public endpoints 
        app.get(APIPathBuilder.buildPublicPath("/contribution/submitter"), ContributionService::getBySubmitterId);

        // Private endpoints
        app.post(APIPathBuilder.buildPrivatePath("/contribute"), ContributionBundleService::submit);

        // Admin endpoints
        app.post(APIPathBuilder.buildAdminPath("/contribution/update-status"), ContributionService::updateStatus);
    }
}