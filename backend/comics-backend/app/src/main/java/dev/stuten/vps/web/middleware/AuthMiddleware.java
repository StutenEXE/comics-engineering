package dev.stuten.vps.web.middleware;

import io.javalin.http.Context;
import dev.stuten.vps.web.ErrorCode;
import dev.stuten.vps.web.ErrorResponse;
import io.javalin.http.HttpStatus;


public final class AuthMiddleware {

    public static void authenticate(Context ctx) {
        String sessionKey = ctx.cookie(SessionStore.COOKIE_SESSION_KEY);
        if (sessionKey == null || sessionKey.isEmpty()) {
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, ErrorCode.NOT_AUTHENTICATED, "Missing token");
        }
        ;

        // Redis lookup
        Session session = SessionStore.find(sessionKey);
        if (session == null) {
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_SESSION, "Session not found");
        }

        // Sliding expiration
        SessionStore.refresh(sessionKey);

        ctx.attribute("auth", new AuthContext(
                session.userId(),
                session.role()));
    }

    public static AuthContext getCurrentSession(Context ctx) {
        return ctx.attribute("auth");
    }

    public static boolean isAuthenticated(Context ctx) {
        return getCurrentSession(ctx) != null;
    }

    public static boolean hasRole(Context ctx, Role requiredRole) {
        AuthContext auth = getCurrentSession(ctx);
        if (auth == null)
            return false;
        if (auth.role() == null)
            return false;
        return auth.role().equals(requiredRole);
    }
}