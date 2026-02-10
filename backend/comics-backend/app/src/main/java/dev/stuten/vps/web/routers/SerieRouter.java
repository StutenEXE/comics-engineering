package dev.stuten.vps.web.routers;

import dev.stuten.vps.services.SerieService;
import dev.stuten.vps.web.routers.utils.APIPathBuilder;
import io.javalin.Javalin;

public class SerieRouter implements Router {

    @Override
    public void register(Javalin app) {
        app.get(APIPathBuilder.buildPublicPath("/series"), SerieService::getByID);
    }
    
}
