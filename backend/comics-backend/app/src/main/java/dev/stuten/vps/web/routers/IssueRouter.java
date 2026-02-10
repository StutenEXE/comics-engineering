package dev.stuten.vps.web.routers;

import dev.stuten.vps.services.IssueService;
import dev.stuten.vps.web.routers.utils.APIPathBuilder;
import io.javalin.Javalin;

public class IssueRouter implements Router {

    @Override
    public void register(Javalin app) {
        app.get(APIPathBuilder.buildPublicPath("/issues"), IssueService::getById);
        app.get(APIPathBuilder.buildPublicPath("/issues/book"), IssueService::getByBookId);
    }
    
    
}
