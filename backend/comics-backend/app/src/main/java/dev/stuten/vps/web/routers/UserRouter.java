package dev.stuten.vps.web.routers;

import dev.stuten.vps.services.UserService;
import dev.stuten.vps.web.routers.utils.APIPathBuilder;
import io.javalin.Javalin;

public class UserRouter implements Router {

    @Override
    public void register(Javalin app) {
        // Public
        app.post(APIPathBuilder.buildPublicPath("/signup"), UserService::signupService);
        app.post(APIPathBuilder.buildPublicPath("/login"), UserService::loginService);
        app.get(APIPathBuilder.buildPublicPath("/disconnect"), UserService::disconnect);
        app.get(APIPathBuilder.buildPublicPath("/refresh"), UserService::refreshAuth);

        // Admin
        app.get(APIPathBuilder.buildAdminPath("/users/list"), UserService::getList);
        app.delete(APIPathBuilder.buildAdminPath("/users/delete"), UserService::delete);
        app.get(APIPathBuilder.buildAdminPath("/users/recycle"), UserService::recycle);
    }
    
}
