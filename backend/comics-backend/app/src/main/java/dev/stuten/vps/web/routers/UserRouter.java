package dev.stuten.vps.web.routers;

import dev.stuten.vps.services.UserService;
import io.javalin.Javalin;

public class UserRouter implements Router {

    @Override
    public void register(Javalin app) {
        // app.get("/pub/example", ctx -> ctx.json("public example"));
        // app.get("/prv/example", ctx -> ctx.json("private example"));
        // app.get("/adm/example", ctx -> ctx.json("admin example"));

        app.post("/api/comics/pub/signup", UserService::SignupService);
        app.post("/api/comics/pub/login", UserService::LoginService);
    }
    
}
