package dev.stuten.vps.web.middleware;

import io.javalin.http.Context;
import io.javalin.http.HttpResponseException;
import io.javalin.http.HttpStatus;

import java.util.HashMap;

public class AuthMiddleware {

    public static void authenticate(Context ctx) {

        String auth = ctx.cookie("session_id");
        if (auth == null || auth.isEmpty()) {
            throw new HttpResponseException(HttpStatus.UNAUTHORIZED, "Missing token", new HashMap<String,String>());
        }

        // Removing session prefix
        String token = auth.substring(SessionStore.SESSION_PREFIX.length());

        // Example Redis lookup
        Session session = SessionStore.find(token);
        if (session == null) {
            throw new HttpResponseException(HttpStatus.UNAUTHORIZED, "Invalid session", new HashMap<String,String>());
        }

        // Sliding expiration
        SessionStore.refresh(token);

        ctx.attribute("auth", new AuthContext(
                session.userId(),
                session.role()));
    }
}