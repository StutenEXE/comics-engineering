package dev.stuten.vps.web.routers;

import dev.stuten.vps.services.SearchService;
import dev.stuten.vps.web.routers.utils.APIPathBuilder;
import io.javalin.Javalin;

public class SearchRouter implements Router {

    @Override
    public void register(Javalin app) {
        app.get(APIPathBuilder.buildPublicPath("/search/books"), SearchService::searchBooks);
        app.get(APIPathBuilder.buildPublicPath("/search/series"), SearchService::searchSeries);
        app.get(APIPathBuilder.buildPublicPath("/search/publishers"), SearchService::searchPublishers);
        app.get(APIPathBuilder.buildPublicPath("/search/books_and_series"), SearchService::searchBooksAndSeries);
    }
    
}
