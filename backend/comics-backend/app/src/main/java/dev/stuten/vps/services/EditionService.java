package dev.stuten.vps.services;

import java.util.Map;
import java.util.Optional;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.models.daos.EditionDAO;
import dev.stuten.vps.models.daos.OwnedEditionDAO;
import dev.stuten.vps.models.dtos.full.EditionDTO;
import dev.stuten.vps.models.dtos.response.EditionRelationToUserDTO;
import dev.stuten.vps.web.ErrorResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class EditionService {
    private EditionService() {
    }

    private static EditionDAO dao = new EditionDAO(
            JooqProvider.get());

    private static OwnedEditionDAO oeDao = new OwnedEditionDAO(JooqProvider.get());

    protected static EditionDAO getDAO() {
        return dao;
    }

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

    public static void getRelationToUser(Context ctx) {
        // Retreive ID from request
        Integer userId, editionId;
        try {
            userId = Integer.parseInt(ctx.queryParam("userId"));
            editionId = Integer.parseInt(ctx.queryParam("editionId"));
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Missing ID or NaN ID");
            return; // For compiler
        }

        Boolean isOwned = oeDao.doesUserOwnEdition(userId, editionId);

        EditionRelationToUserDTO relation = new EditionRelationToUserDTO(editionId, userId, isOwned);
        ctx.json(Map.of("relation", relation));
    }
}
