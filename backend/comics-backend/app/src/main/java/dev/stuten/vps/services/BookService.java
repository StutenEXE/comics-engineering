package dev.stuten.vps.services;

import java.util.Optional;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.models.daos.BookDAO;
import dev.stuten.vps.models.dtos.BookDTO;
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
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Missing ID or NaN ID", "");
            return; // For compiler
        }

        // Get book by id
        Optional<BookDTO> book = dao.findById(id);
        if (book.isEmpty()) {
            String message = String.format("Book of id %s not found", id);
            ErrorResponse.send(HttpStatus.NOT_FOUND, "Book not found", message);
        }

        ctx.json(book);
    }

}
