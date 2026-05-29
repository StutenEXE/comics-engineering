package dev.stuten.vps.services;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.models.daos.IssueDAO;
import dev.stuten.vps.models.dtos.full.IssueDTO;
import dev.stuten.vps.web.ErrorResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class IssueService {

    private IssueService() {
    }

    private static IssueDAO dao = new IssueDAO(
            JooqProvider.get());

    protected static IssueDAO getDAO() {
        return dao;
    }

    public static void getById(Context ctx) {
        // Retreive ID from request
        Integer id;
        try {
            id = Integer.parseInt(ctx.queryParam("id"));
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Missing ID or NaN ID");
            return; // For compiler
        }

        // Get issue by id
        Optional<IssueDTO> issue = dao.findById(id);
        if (issue.isEmpty()) {
            String message = String.format("Issue of id %s not found", id);
            ErrorResponse.send(HttpStatus.NOT_FOUND, "Issue not found", message);
        }

        ctx.json(Map.of("issue", issue));
    }

    public static void getByBookId(Context ctx) {
        // Retreive book ID from request
        Integer bookID;
        try {
            bookID = Integer.parseInt(ctx.queryParam("id"));
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Missing ID or NaN ID");
            return; // For compiler
        }

        // Retreive issues
        List<IssueDTO> issues = dao.findByBookId(bookID);

        ctx.json(Map.of("issues", issues));
    }

}
