package dev.stuten.vps.web.routers;

import dev.stuten.vps.services.UserSubmissionService;
import dev.stuten.vps.web.routers.utils.APIPathBuilder;
import io.javalin.Javalin;

public class UserSubmissionRouter implements Router {

    @Override
    public void register(Javalin app) {
        app.post(APIPathBuilder.buildPrivatePath("/contribute"), UserSubmissionService::create);
    }
    
}
