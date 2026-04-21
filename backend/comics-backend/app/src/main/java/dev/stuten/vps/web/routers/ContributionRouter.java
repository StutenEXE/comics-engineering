package dev.stuten.vps.web.routers;

import dev.stuten.vps.services.ContributionService;
import dev.stuten.vps.web.routers.utils.APIPathBuilder;
import io.javalin.Javalin;

public class ContributionRouter implements Router {

    @Override
    public void register(Javalin app) {
        // Private endpoints
        app.post(APIPathBuilder.buildPrivatePath("/contribute"), ContributionService::submitBundle);
    }
}