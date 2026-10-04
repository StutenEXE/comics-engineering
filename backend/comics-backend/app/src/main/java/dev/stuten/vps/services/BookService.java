package dev.stuten.vps.services;

import static dev.stuten.vps.services.utils.RequestServiceUtil.requireFound;
import static dev.stuten.vps.services.utils.RequestServiceUtil.requireId;

import java.util.List;
import java.util.Map;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.models.daos.BookDAO;
import dev.stuten.vps.models.dtos.full.BookDTO;
import dev.stuten.vps.models.dtos.simple.SimpleBookDTO;
import dev.stuten.vps.services.utils.PaginationServiceUtil;
import dev.stuten.vps.web.ErrorCode;
import io.javalin.http.Context;

public class BookService {

    private BookService() {}

    private static BookDAO dao = new BookDAO(
            JooqProvider.get());

    public static void getByID(Context ctx) {
        Integer id = requireId(ctx);
        BookDTO book = requireFound(dao.findById(id), ErrorCode.BOOK_NOT_FOUND, "Book", id);

        ctx.json(Map.of("book", book));
    }

    public static void getBySerieID(Context ctx) {
        List<BookDTO> books = dao.findBySerieId(requireId(ctx));

        ctx.json(Map.of("books", books));
    }

    public static void getLatest(Context ctx) {
        List<SimpleBookDTO> books = dao.findLatest(PaginationServiceUtil.getFromContext(ctx));

        ctx.json(Map.of("books", books));
    }
}
