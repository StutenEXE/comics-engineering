package dev.stuten.vps.web;

import java.util.Arrays;
import java.util.List;

import dev.stuten.vps.web.middleware.AuthMiddleware;
import dev.stuten.vps.web.middleware.Role;
import dev.stuten.vps.web.middleware.RoleMiddleware;
import dev.stuten.vps.web.routers.BookRouter;
import dev.stuten.vps.web.routers.EditionRouter;
import dev.stuten.vps.web.routers.IssueRouter;
import dev.stuten.vps.web.routers.IssueSerieRouter;
import dev.stuten.vps.web.routers.PublisherRouter;
import dev.stuten.vps.web.routers.Router;
import dev.stuten.vps.web.routers.SearchRouter;
import dev.stuten.vps.web.routers.SerieRouter;
import dev.stuten.vps.web.routers.UserRouter;
import dev.stuten.vps.web.routers.UserSubmissionRouter;
import dev.stuten.vps.web.routers.utils.APIPathBuilder;
import io.javalin.Javalin;

public class Routes {

    @SuppressWarnings("null")
    private static List<Router> routers = Arrays.asList(
        new BookRouter(),
        new EditionRouter(),
        new IssueRouter(),
        new IssueSerieRouter(),
        new PublisherRouter(),
        new SerieRouter(),
        new UserRouter(),

        new UserSubmissionRouter(),

        new SearchRouter()
    );

    public static void register(Javalin app) {

        // Authentification required for these paths
        app.before(APIPathBuilder.getPrivateGenericPath(), AuthMiddleware::authenticate);
        app.before(APIPathBuilder.getAdminGenericPath(), AuthMiddleware::authenticate);

        // Has to be admin to access path (implicitly, prv accessible by any logged
        // user)
        app.before(APIPathBuilder.getAdminGenericPath(), RoleMiddleware.require(Role.ADMIN));

        // Register all routers
        for (Router router : routers) {
            router.register(app);
        }
    }
}
