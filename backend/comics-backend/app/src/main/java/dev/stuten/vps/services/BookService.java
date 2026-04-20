package dev.stuten.vps.services;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.models.daos.BookDAO;
import dev.stuten.vps.models.dtos.full.BookDTO;
import dev.stuten.vps.models.dtos.simple.SimpleBookDTO;
import dev.stuten.vps.web.ErrorResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class BookService {
    
    private BookService() {}

    private static BookDAO dao = new BookDAO(
            JooqProvider.get());

    public static void getByID(Context ctx) {
        // Retreive ID from request
        Integer id;
        try {
            id = Integer.parseInt(ctx.queryParam("id"));
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Missing ID or NaN ID");
            return; // For compiler
        }

        // Get book by id
        Optional<BookDTO> book = dao.findById(id);
        if (book.isEmpty()) {
            String message = String.format("Book of id %s not found", id);
            ErrorResponse.send(HttpStatus.NOT_FOUND, "Book not found", message);
        }

        ctx.json(Map.of("book", book));
    }

    public static void getBySerieID(Context ctx) {
        // Retreive serie ID from request
        Integer serieID;
        try {
            serieID = Integer.parseInt(ctx.queryParam("id"));
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Missing ID or NaN ID");
            return; // For compiler
        }

        // Retreive books
        List<BookDTO> books = dao.findBySerieId(serieID);

        ctx.json(Map.of("books", books));
    }

    public static void getLatest(Context ctx) {
        Integer from, limit;
        try {
            from = Integer.parseInt(ctx.queryParam("from"));
            limit = Integer.parseInt(ctx.queryParam("limit"));
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Missing 'from' or 'limit' or NaN 'from' or 'limit'");
            return; // For compiler
        }

        if (from < 0 || limit <= 0) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "", "'from' < 0 or 'limit' <= 0");
        }

        // Retreive books
        List<SimpleBookDTO> books = dao.findLatest(from, limit);

        ctx.json(Map.of("books", books));
    }
}
