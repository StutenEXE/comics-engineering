package dev.stuten.vps.services;

import java.util.Map;
import java.util.Optional;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.models.daos.SerieDAO;
import dev.stuten.vps.models.dtos.full.SerieDTO;
import dev.stuten.vps.web.ErrorResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class SerieService {

    private static SerieDAO dao = new SerieDAO(
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

        // Get serie by id
        Optional<SerieDTO> serie = dao.findById(id);
        if (serie.isEmpty()) {
            String message = String.format("Serie of id %s not found", id);
            ErrorResponse.send(HttpStatus.NOT_FOUND, "Serie not found", message);
        }

        ctx.json(Map.of("serie", serie));
    }

}
