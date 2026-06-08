package dev.stuten.vps.services;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.models.daos.UserDAO;
import dev.stuten.vps.models.dtos.full.UserDTO;
import dev.stuten.vps.models.dtos.full.UserWithPasswordDTO;
import dev.stuten.vps.web.ErrorResponse;
import dev.stuten.vps.web.middleware.Role;
import dev.stuten.vps.web.middleware.Session;
import dev.stuten.vps.web.middleware.SessionStore;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class UserService {

    private UserService() {
    }

    private static UserDAO dao = new UserDAO(
            JooqProvider.get());

    public static void signupService(Context ctx) {
        UserWithPasswordDTO dto = ctx.bodyAsClass(UserWithPasswordDTO.class);
        // TODO : Validate email format, password strength, etc.

        // If email already in use
        if (dao.findByEmail(dto.getEmail()).isPresent()) {
            ErrorResponse.send(HttpStatus.CONFLICT, "Email already in use", "");
        }

        // Create user
        Optional<Integer> userId = dao.create(dto);

        // If user was not created
        if (userId.isEmpty()) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, "Account not created", "");
        }
        UserDTO newUser = dao.findById(userId.get()).get();

        // Log in user
        String sessionKey = SessionStore.createSessionKey();
        SessionStore.save(sessionKey, newUser.getId(), newUser.getIsAdmin() ? Role.ADMIN : Role.USER);
        ctx.cookie(SessionStore.COOKIE_SESSION_KEY, sessionKey);

        // Send back account info to the client
        ctx.json(Map.of("user", newUser));
    }

    public static void loginService(Context ctx) {
        UserWithPasswordDTO dto = ctx.bodyAsClass(UserWithPasswordDTO.class);

        // Database lookup
        Optional<UserWithPasswordDTO> optUser = dao.findByEmailWithPassword(dto.getEmail());
        // No user found
        if (optUser.isEmpty()) {
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, "Invalid credentials", "");
        }

        UserWithPasswordDTO userPwd = optUser.get();
        
        // Check if user has been deleted
        if (userPwd.getIsDeleted()) {
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, "User deleted", "");
        }
        // Check password validity
        if (!UserDAO.checkPassword(userPwd.getPassword(), dto.getPassword())) {
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, "Invalid credentials", "");
        }

        // Remove password for safety
        UserDTO user = UserDAO.removePassword(userPwd);

        // Log in user
        String sessionKey = SessionStore.createSessionKey();
        SessionStore.save(sessionKey, user.getId(), user.getIsAdmin() ? Role.ADMIN : Role.USER);
        ctx.cookie(SessionStore.COOKIE_SESSION_KEY, sessionKey);

        // Send back account info to the client
        ctx.json(Map.of("user", user));
    }

    public static void disconnect(Context ctx) {
        String sessionKey = ctx.cookie(SessionStore.COOKIE_SESSION_KEY);
        SessionStore.delete(sessionKey);
    }

    public static void refreshAuth(Context ctx) {
        // Retreive session key
        String sessionKey = ctx.cookie(SessionStore.COOKIE_SESSION_KEY);
        if (sessionKey == null || sessionKey.isBlank()) {
            ctx.removeCookie(SessionStore.COOKIE_SESSION_KEY);
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, "Invalid session", "No session key");
        }

        // Retreive session
        Session session = SessionStore.find(sessionKey);
        if (session == null) {
            ctx.removeCookie(SessionStore.COOKIE_SESSION_KEY);
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, "Invalid session", "Session terminated");
            return; // For compiler
        }

        // Get user in session
        Optional<UserDTO> user = dao.findById(Integer.parseInt(session.userId()));
        if (user.isEmpty() || user.get().getIsDeleted()) {
            ctx.removeCookie(SessionStore.COOKIE_SESSION_KEY);
            SessionStore.delete(sessionKey);
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, "Invalid session", "No user found for this session");
        }

        // Refresh session
        SessionStore.refresh(sessionKey);
        ctx.json(Map.of("user", user));
    }

    public static void getList(Context ctx) {
        Integer from, limit;
        try {
            from = Integer.parseInt(ctx.queryParam("from"));
            limit = Integer.parseInt(ctx.queryParam("limit"));
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request",
                    "Missing 'from' or 'limit' or NaN 'from' or 'limit'");
            return; // For compiler
        }

        if (from < 0 || limit <= 0) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "", "'from' < 0 or 'limit' <= 0");
        }

        // Retreive users
        List<UserDTO> users = dao.getUsers(from, limit);

        ctx.json(Map.of("users", users));
    }

    public static void delete(Context ctx) {
        // Retreive user ID from request
        Integer userId;
        try {
            userId = Integer.parseInt(ctx.queryParam("id"));
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Missing ID or NaN ID");
            return; // For compiler
        }

        Boolean deleted = dao.delete(userId);

        if (!deleted) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, "Error", "Failed to delete user");
            return;
        }

        ctx.status(HttpStatus.OK);
    }
}
