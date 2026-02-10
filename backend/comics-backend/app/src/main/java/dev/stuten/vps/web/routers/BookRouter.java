package dev.stuten.vps.web.routers;

import dev.stuten.vps.services.BookService;
import dev.stuten.vps.web.routers.utils.APIPathBuilder;
import io.javalin.Javalin;

public class BookRouter implements Router {

    @Override
    public void register(Javalin app) {
        app.get(APIPathBuilder.buildPublicPath("/books"), BookService::getByID);
        app.get(APIPathBuilder.buildPublicPath("/books/serie"), BookService::getBySerieID);
        app.get(APIPathBuilder.buildPublicPath("/books/latest"), BookService::getLatest);
    }
    
}
