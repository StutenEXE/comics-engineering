package dev.stuten.vps.services;

import java.util.Map;
import java.util.Optional;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.models.daos.PublisherDAO;
import dev.stuten.vps.models.dtos.PublisherDTO;
import dev.stuten.vps.web.ErrorResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class PublisherService {

    private PublisherService() {}

    private static PublisherDAO dao = new PublisherDAO(
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

        // Get publisher by id
        Optional<PublisherDTO> publisher = dao.findById(id);
        if (publisher.isEmpty()) {
            String message = String.format("Publisher of id %s not found", id);
            ErrorResponse.send(HttpStatus.NOT_FOUND, "Publisher not found", message);
        }

        ctx.json(Map.of("publisher", publisher));
    }
}
