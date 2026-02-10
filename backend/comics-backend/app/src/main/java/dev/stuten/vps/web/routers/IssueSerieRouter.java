package dev.stuten.vps.web.routers;

import dev.stuten.vps.services.IssueSerieService;
import dev.stuten.vps.web.routers.utils.APIPathBuilder;
import io.javalin.Javalin;

public class IssueSerieRouter implements Router {

    @Override
    public void register(Javalin app) {
        app.get(APIPathBuilder.buildPublicPath("/issueseries"), IssueSerieService::getByID);
    }

}
