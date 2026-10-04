package dev.stuten.vps.services;

import static dev.stuten.vps.services.utils.RequestServiceUtil.requireFound;
import static dev.stuten.vps.services.utils.RequestServiceUtil.requireId;

import java.util.Map;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.models.daos.PublisherDAO;
import dev.stuten.vps.models.dtos.full.PublisherDTO;
import dev.stuten.vps.web.ErrorCode;
import io.javalin.http.Context;

public class PublisherService {

    private PublisherService() {}

    private static PublisherDAO dao = new PublisherDAO(
            JooqProvider.get());

    public static void getByID(Context ctx) {
        Integer id = requireId(ctx);
        PublisherDTO publisher = requireFound(dao.findById(id), ErrorCode.PUBLISHER_NOT_FOUND, "Publisher", id);

        ctx.json(Map.of("publisher", publisher));
    }
}
