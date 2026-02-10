package dev.stuten.vps.web.middleware;

import io.javalin.http.Context;
import io.javalin.http.Handler;
import io.javalin.http.HttpResponseException;
import io.javalin.http.HttpStatus;

import java.util.HashMap;

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
            throw new HttpResponseException(HttpStatus.UNAUTHORIZED, "Not authenticated",  new HashMap<String,String>());
        }

        if (!hasRole(auth.role(), required)) {
            throw new HttpResponseException(HttpStatus.FORBIDDEN, "Forbidden",  new HashMap<String,String>());
        }
    }

    private static void checkAny(Context ctx, Role... roles) {
        AuthContext auth = ctx.attribute("auth");
        if (auth == null) {
            throw new HttpResponseException(HttpStatus.UNAUTHORIZED, "Not authenticated",  new HashMap<String,String>());
        }

        for (Role role : roles) {
            if (hasRole(auth.role(), role)) {
                return;
            }
        }

        throw new HttpResponseException(HttpStatus.FORBIDDEN, "Forbidden",  new HashMap<String,String>());
    }

    private static boolean hasRole(Role userRole, Role required) {
        // ADMIN > USER
        if (userRole == Role.ADMIN)
            return true;
        return userRole == required;
    }
}
