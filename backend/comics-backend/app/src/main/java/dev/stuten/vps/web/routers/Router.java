package dev.stuten.vps.web.routers;

import io.javalin.Javalin;

public interface Router {
    void register(Javalin app);
}
