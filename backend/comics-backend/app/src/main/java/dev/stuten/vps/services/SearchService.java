package dev.stuten.vps.services;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.models.daos.BookDAO;
import dev.stuten.vps.models.daos.SerieDAO;
import dev.stuten.vps.models.dtos.BookDTO;
import dev.stuten.vps.models.dtos.SerieDTO;
import dev.stuten.vps.web.ErrorResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class SearchService {
    
    private SearchService() {}

    private static BookDAO bookDao = new BookDAO(
            JooqProvider.get());

    private static SerieDAO serieDao = new SerieDAO(
            JooqProvider.get());

    public static void searchBooksAndSeries(Context ctx) {
        // Retreive query from request
        String query = "";
        try {
            query = ctx.queryParam("query");
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Missing query");
            return; // For compiler
        }

        // Lists of elements to retreive
        List<BookDTO> books = Arrays.asList();
        List<SerieDTO> series = Arrays.asList();

        // To broad queries are not handled
        if (query.length() < 3) {
            ctx.json(Map.of("books", books, "series", series));
            return;
        }

        // Retreive books
        books = bookDao.searchByName(query);
        series = serieDao.searchByName(query);

        ctx.json(Map.of("books", books, "series", series));
    }
}
