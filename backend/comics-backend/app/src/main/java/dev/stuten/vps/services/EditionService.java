package dev.stuten.vps.services;

import static dev.stuten.vps.services.utils.RequestServiceUtil.requireFound;
import static dev.stuten.vps.services.utils.RequestServiceUtil.requireId;
import static dev.stuten.vps.services.utils.RequestServiceUtil.requireIntParam;

import java.util.Map;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.models.daos.EditionDAO;
import dev.stuten.vps.models.daos.OwnedEditionDAO;
import dev.stuten.vps.models.dtos.full.EditionDTO;
import dev.stuten.vps.models.dtos.response.EditionRelationToUserDTO;
import dev.stuten.vps.web.ErrorCode;
import io.javalin.http.Context;

public class EditionService {
    private EditionService() {
    }

    private static EditionDAO dao = new EditionDAO(
            JooqProvider.get());

    private static OwnedEditionDAO oeDao = new OwnedEditionDAO(JooqProvider.get());

    public static void getByID(Context ctx) {
        Integer id = requireId(ctx);
        EditionDTO edition = requireFound(dao.findById(id), ErrorCode.EDITION_NOT_FOUND, "Edition", id);

        ctx.json(Map.of("edition", edition));
    }

    public static void getRelationToUser(Context ctx) {
        Integer userId = requireIntParam(ctx, "userId");
        Integer editionId = requireIntParam(ctx, "editionId");

        Boolean isOwned = oeDao.doesUserOwnEdition(userId, editionId);

        EditionRelationToUserDTO relation = new EditionRelationToUserDTO(editionId, userId, isOwned);
        ctx.json(Map.of("relation", relation));
    }
}
