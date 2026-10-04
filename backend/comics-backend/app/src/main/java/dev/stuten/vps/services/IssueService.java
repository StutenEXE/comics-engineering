package dev.stuten.vps.services;

import static dev.stuten.vps.services.utils.RequestServiceUtil.requireFound;
import static dev.stuten.vps.services.utils.RequestServiceUtil.requireId;

import java.util.List;
import java.util.Map;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.models.daos.IssueDAO;
import dev.stuten.vps.models.dtos.full.IssueDTO;
import dev.stuten.vps.web.ErrorCode;
import io.javalin.http.Context;

public class IssueService {

    private IssueService() {
    }

    private static IssueDAO dao = new IssueDAO(
            JooqProvider.get());

    public static void getById(Context ctx) {
        Integer id = requireId(ctx);
        IssueDTO issue = requireFound(dao.findById(id), ErrorCode.ISSUE_NOT_FOUND, "Issue", id);

        ctx.json(Map.of("issue", issue));
    }

    public static void getByBookId(Context ctx) {
        List<IssueDTO> issues = dao.findByBookId(requireId(ctx));

        ctx.json(Map.of("issues", issues));
    }

    public static void getBySerieId(Context ctx) {
        List<IssueDTO> issues = dao.findBySerieId(requireId(ctx));

        ctx.json(Map.of("issues", issues));
    }

}
