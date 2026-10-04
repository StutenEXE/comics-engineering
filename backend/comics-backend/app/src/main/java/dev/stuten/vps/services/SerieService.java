package dev.stuten.vps.services;

import static dev.stuten.vps.services.utils.RequestServiceUtil.requireFound;
import static dev.stuten.vps.services.utils.RequestServiceUtil.requireId;

import java.util.Map;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.models.daos.SerieDAO;
import dev.stuten.vps.models.dtos.full.SerieDTO;
import dev.stuten.vps.web.ErrorCode;
import io.javalin.http.Context;

public class SerieService {

    private SerieService() {}

    private static SerieDAO dao = new SerieDAO(
            JooqProvider.get());

    public static void getByID(Context ctx) {
        Integer id = requireId(ctx);
        SerieDTO serie = requireFound(dao.findById(id), ErrorCode.SERIE_NOT_FOUND, "Serie", id);

        ctx.json(Map.of("serie", serie));
    }
}
