package dev.stuten.vps.web.routers;

import dev.stuten.vps.services.BookService;
import io.javalin.Javalin;

public class BookRouter implements Router {

    @Override
    public void register(Javalin app) {
        app.get("/api/comics/pub/books", BookService::getByID);
    }
    
}
