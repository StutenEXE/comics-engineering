package dev.stuten.vps.services.utils;

import dev.stuten.vps.web.ErrorCode;
import dev.stuten.vps.web.ErrorResponse;
import dev.stuten.vps.web.middleware.AuthContext;
import dev.stuten.vps.web.middleware.AuthMiddleware;
import dev.stuten.vps.web.middleware.Role;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

/**
 * Authorization checks for services. Each method either returns or throws an
 * HTTP error (401 if not logged in, 403 if not allowed).
 */
public class AuthServiceUtil {

    private AuthServiceUtil() {
    }

    /**
     * @return the current session, 401 if the user is not logged in
     */
    public static AuthContext requireSession(Context ctx) {
        AuthContext auth = AuthMiddleware.getCurrentSession(ctx);
        if (auth == null) {
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, ErrorCode.NOT_AUTHENTICATED, "User must be logged in");
        }
        return auth;
    }

    /**
     * @return the current user's ID, 401 if the user is not logged in
     */
    public static Integer requireUserId(Context ctx) {
        return Integer.parseInt(requireSession(ctx).userId());
    }

    /**
     * 401 if not logged in, 403 with the given message if not an admin
     */
    public static void requireAdmin(Context ctx, String forbiddenMessage) {
        requireSession(ctx);
        if (!AuthMiddleware.hasRole(ctx, Role.ADMIN)) {
            ErrorResponse.send(HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN, forbiddenMessage);
        }
    }

    /**
     * 401 if not logged in, 403 with the given message if the current user is
     * neither the owner of the resource nor an admin
     */
    public static void requireSelfOrAdmin(Context ctx, Integer ownerId, String forbiddenMessage) {
        Integer userId = requireUserId(ctx);
        if (!userId.equals(ownerId) && !AuthMiddleware.hasRole(ctx, Role.ADMIN)) {
            ErrorResponse.send(HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN, forbiddenMessage);
        }
    }
}
