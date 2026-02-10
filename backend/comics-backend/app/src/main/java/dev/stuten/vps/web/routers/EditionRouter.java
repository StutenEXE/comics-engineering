package dev.stuten.vps.web.routers;

import dev.stuten.vps.services.EditionService;
import dev.stuten.vps.web.routers.utils.APIPathBuilder;
import io.javalin.Javalin;

public class EditionRouter implements Router {

    @Override
    public void register(Javalin app) {
        app.get(APIPathBuilder.buildPublicPath("/editions"), EditionService::getByID);
    }
    
}
