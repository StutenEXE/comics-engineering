package dev.stuten.vps.web.routers;

import dev.stuten.vps.services.PublisherService;
import dev.stuten.vps.web.routers.utils.APIPathBuilder;
import io.javalin.Javalin;

public class PublisherRouter implements Router {

    @Override
    public void register(Javalin app) {
        app.get(APIPathBuilder.buildPublicPath("/publishers"), PublisherService::getByID);
    }
    
}
