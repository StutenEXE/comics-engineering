package dev.stuten.vps.services;

import java.util.Map;
import java.util.Optional;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.models.daos.EditionDAO;
import dev.stuten.vps.models.dtos.EditionDTO;
import dev.stuten.vps.web.ErrorResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class EditionService {
    private EditionService() {}

    private static EditionDAO dao = new EditionDAO(
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

        // Get edition by id
        Optional<EditionDTO> edition = dao.findById(id);
        if (edition.isEmpty()) {
            String message = String.format("Edition of id %s not found", id);
            ErrorResponse.send(HttpStatus.NOT_FOUND, "Edition not found", message);
        }

        ctx.json(Map.of("edition", edition));
    }
}
