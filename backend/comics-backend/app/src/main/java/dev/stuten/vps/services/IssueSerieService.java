package dev.stuten.vps.services;

import static dev.stuten.vps.services.utils.RequestServiceUtil.requireFound;
import static dev.stuten.vps.services.utils.RequestServiceUtil.requireId;

import java.util.Map;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.models.daos.IssueSerieDAO;
import dev.stuten.vps.models.dtos.full.IssueSerieDTO;
import dev.stuten.vps.web.ErrorCode;
import io.javalin.http.Context;

public class IssueSerieService {

    private IssueSerieService() {}

    private static IssueSerieDAO dao = new IssueSerieDAO(
            JooqProvider.get());

    public static void getByID(Context ctx) {
        Integer id = requireId(ctx);
        IssueSerieDTO issueSerie = requireFound(dao.findById(id), ErrorCode.ISSUESERIE_NOT_FOUND, "Issue serie", id);

        ctx.json(Map.of("issueSerie", issueSerie));
    }
}
