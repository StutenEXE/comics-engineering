package dev.stuten.vps.services;

import java.util.Map;
import java.util.Optional;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.models.daos.IssueSerieDAO;
import dev.stuten.vps.models.dtos.full.IssueSerieDTO;
import dev.stuten.vps.web.ErrorResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class IssueSerieService {
     private IssueSerieService() {}

    private static IssueSerieDAO dao = new IssueSerieDAO(
            JooqProvider.get());

    // TODO : Refactor function ?
    public static void getByID(Context ctx) {
        // Retreive ID from request
        Integer id;
        try {
            id = Integer.parseInt(ctx.queryParam("id"));
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Missing ID or NaN ID");
            return; // For compiler
        }

        // Get issue serie by id
        Optional<IssueSerieDTO> issueSerie = dao.findById(id);
        if (issueSerie.isEmpty()) {
            String message = String.format("Issue serie of id %s not found", id);
            ErrorResponse.send(HttpStatus.NOT_FOUND, "Issue serie not found", message);
        }

        ctx.json(Map.of("issueSerie", issueSerie));
    }
}
