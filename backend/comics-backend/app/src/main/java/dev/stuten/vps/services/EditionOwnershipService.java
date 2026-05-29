package dev.stuten.vps.services;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.models.daos.OwnedEditionDAO;
import dev.stuten.vps.models.dtos.full.OwnedEditionDTO;
import dev.stuten.vps.web.ErrorResponse;
import dev.stuten.vps.web.middleware.AuthContext;
import dev.stuten.vps.web.middleware.AuthMiddleware;
import dev.stuten.vps.web.middleware.Role;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class EditionOwnershipService {

    private EditionOwnershipService() {
    }

    private static OwnedEditionDAO dao = new OwnedEditionDAO(
            JooqProvider.get());

    public static void create(Context ctx) {
        OwnedEditionDTO dto = ctx.bodyAsClass(OwnedEditionDTO.class);

        // Validate that the person creating the owned edition is the owner or an admin
        AuthContext auth = AuthMiddleware.getCurrentSession(ctx);
        if (auth == null) {
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, "Invalid session", "No valid session found");
            return;
        }
        if (!auth.userId().equals(dto.getUser().getId().toString()) && !auth.role().equals(Role.ADMIN)) {
            ErrorResponse.send(HttpStatus.FORBIDDEN, "Forbidden", "You can only create owned editions for yourself");
            return;
        }

        // Create owned edition
        Optional<Integer> ownedEditionId = dao.create(dto);

        // If owned edition was not created
        if (ownedEditionId.isEmpty()) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, "Owned edition not created", "");
        }
        OwnedEditionDTO newOwnedEdition = dao.findOwnedById(ownedEditionId.get()).get();

        // Send back account info to the client
        ctx.json(Map.of("ownedEdition", newOwnedEdition));
    }

    public static void update(Context ctx) {
        OwnedEditionDTO dto = ctx.bodyAsClass(OwnedEditionDTO.class);

        // Validate that the person creating the owned edition is the owner or an admin
        AuthContext auth = AuthMiddleware.getCurrentSession(ctx);
        if (auth == null) {
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, "Invalid session", "No valid session found");
            return;
        }
        if (!auth.userId().equals(dto.getUser().getId().toString()) && !auth.role().equals(Role.ADMIN)) {
            ErrorResponse.send(HttpStatus.FORBIDDEN, "Forbidden", "You can only create owned editions for yourself");
            return;
        }

        // Update owned edition
        Boolean updated = dao.update(dto);

        if (!updated) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, "Error", "Failed to update owned edition");
            return;
        }

        // Retreive new ownership in db
        Optional<OwnedEditionDTO> newOe = dao.findOwnedById(dto.getId());

        ctx.status(HttpStatus.CREATED).json(Map.of("ownedEdition", newOe.get()));
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
        List<OwnedEditionDTO> ownedEditions = dao.findOwnedByUserId(userID);

        ctx.json(Map.of("ownedEditions", ownedEditions));
    }
}