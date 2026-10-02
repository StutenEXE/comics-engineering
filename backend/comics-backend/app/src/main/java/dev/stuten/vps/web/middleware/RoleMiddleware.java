package dev.stuten.vps.web.middleware;

import io.javalin.http.Context;
import io.javalin.http.Handler;
import dev.stuten.vps.web.ErrorCode;
import dev.stuten.vps.web.ErrorResponse;
import io.javalin.http.HttpStatus;


public final class RoleMiddleware {

    private RoleMiddleware() {
    }

    public static Handler require(Role requiredRole) {
        return ctx -> check(ctx, requiredRole);
    }

    public static Handler requireAny(Role... roles) {
        return ctx -> checkAny(ctx, roles);
    }

    private static void check(Context ctx, Role required) {
        AuthContext auth = ctx.attribute("auth");
        if (auth == null) {
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, ErrorCode.NOT_AUTHENTICATED, "Not authenticated");
        }

        if (!hasRole(auth.role(), required)) {
            ErrorResponse.send(HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN, "Insufficient role");
        }
    }

    private static void checkAny(Context ctx, Role... roles) {
        AuthContext auth = ctx.attribute("auth");
        if (auth == null) {
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, ErrorCode.NOT_AUTHENTICATED, "Not authenticated");
        }

        for (Role role : roles) {
            if (hasRole(auth.role(), role)) {
                return;
            }
        }

        ErrorResponse.send(HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN, "Insufficient role");
    }

    private static boolean hasRole(Role userRole, Role required) {
        // ADMIN > USER
        if (userRole == Role.ADMIN)
            return true;
        return userRole == required;
    }
}
