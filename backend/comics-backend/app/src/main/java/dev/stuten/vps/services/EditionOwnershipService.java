package dev.stuten.vps.services;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.models.daos.EditionOwnershipDAO;
import dev.stuten.vps.models.dtos.full.OwnedEditionDTO;
import dev.stuten.vps.web.ErrorResponse;
import dev.stuten.vps.web.middleware.Role;
import dev.stuten.vps.web.middleware.Session;
import dev.stuten.vps.web.middleware.SessionStore;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class EditionOwnershipService {
    
    private EditionOwnershipService() {}

    private static EditionOwnershipDAO dao = new EditionOwnershipDAO(
            JooqProvider.get());

    public static void create(Context ctx) {
        OwnedEditionDTO dto = ctx.bodyAsClass(OwnedEditionDTO.class);

        // Validate that the person creating the owned edition is the owner or an admin
        Session session = SessionStore.find(ctx.cookie(SessionStore.COOKIE_SESSION_KEY));
        if (session == null) {
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, "Invalid session", "No valid session found");
            return;
        }
        if (!session.userId().equals(dto.user().id().toString()) && !session.role().equals(Role.ADMIN)) {
            ErrorResponse.send(HttpStatus.FORBIDDEN, "Forbidden", "You can only create owned editions for yourself");
            return;
        }

        // Create owned edition
        Optional<Integer> ownedEditionId = dao.create(dto);

        // If owned edition was not created
        if (ownedEditionId.isEmpty()) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, "Owned edition not created", "");
        }
        OwnedEditionDTO newOwnedEdition = dao.findById(ownedEditionId.get()).get();

        // Send back account info to the client
        ctx.json(Map.of("ownedEdition", newOwnedEdition));
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

        // Get owned edition by id
        Optional<OwnedEditionDTO> edition = dao.findById(id);
        if (edition.isEmpty()) {
            String message = String.format("OwnedEdition of id %s not found", id);
            ErrorResponse.send(HttpStatus.NOT_FOUND, "OwnedEdition not found", message);
        }

        ctx.json(Map.of("ownedEdition", edition.get()));
    }

    public static void getByUserID(Context ctx) {
        // Retreive user ID from request
        Integer userID;
        try {
            userID = Integer.parseInt(ctx.queryParam("id"));
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Missing ID or NaN ID");
            return; // For compiler
        }

        // Retreive owned editions
        List<OwnedEditionDTO> ownedEditions = dao.findByUserId(userID);

        ctx.json(Map.of("ownedEditions", ownedEditions));
    }
}