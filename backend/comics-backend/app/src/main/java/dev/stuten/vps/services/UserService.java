package dev.stuten.vps.services;

import static dev.stuten.vps.services.utils.RequestServiceUtil.requireBody;
import static dev.stuten.vps.services.utils.RequestServiceUtil.requireFound;
import static dev.stuten.vps.services.utils.RequestServiceUtil.requireId;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.models.daos.UserDAO;
import dev.stuten.vps.models.dtos.full.UserDTO;
import dev.stuten.vps.models.dtos.full.UserWithPasswordDTO;
import dev.stuten.vps.models.dtos.request.UpdateUserDTO;
import dev.stuten.vps.models.dtos.response.PublicUserDTO;
import dev.stuten.vps.services.utils.AuthServiceUtil;
import dev.stuten.vps.services.utils.PaginationServiceUtil;
import dev.stuten.vps.web.ErrorCode;
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

    // 60 secs * 60 mins * 24 hours * 14 days = 14 days sliding session
    private static final int COOKIE_TTL_SECONDS = 60 * 60 * 24 * 14;

    public static void signupService(Context ctx) {
        UserWithPasswordDTO dto = ctx.bodyAsClass(UserWithPasswordDTO.class);
        // TODO : Validate email format, password strength, etc.

        // If email already in use
        if (dao.findByEmail(dto.getEmail()).isPresent()) {
            ErrorResponse.sendField(HttpStatus.CONFLICT, ErrorCode.EMAIL_TAKEN, "email", "");
        }

        // Create user
        Optional<Integer> userId = dao.create(dto);

        // If user was not created
        if (userId.isEmpty()) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.USER_NOT_CREATED, "");
        }
        UserDTO newUser = dao.findById(userId.get()).get();

        logIn(ctx, newUser);

        // Send back account info to the client
        ctx.json(Map.of("user", newUser));
    }

    public static void loginService(Context ctx) {
        UserWithPasswordDTO dto = ctx.bodyAsClass(UserWithPasswordDTO.class);

        // Database lookup
        Optional<UserWithPasswordDTO> optUser = dao.findByEmailWithPassword(dto.getEmail());
        // No user found
        if (optUser.isEmpty()) {
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS, "");
        }

        UserWithPasswordDTO userPwd = optUser.get();

        // Check if user has been deleted
        if (userPwd.getIsDeleted()) {
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, ErrorCode.USER_DELETED, "");
        }
        // Check password validity
        if (!UserDAO.checkPassword(userPwd.getPassword(), dto.getPassword())) {
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS, "");
        }

        // Remove password for safety
        UserDTO user = UserDAO.removePassword(userPwd);

        logIn(ctx, user);

        // Send back account info to the client
        ctx.json(Map.of("user", user));
    }

    /**
     * Creates a session for the user and sets the session cookie
     */
    private static void logIn(Context ctx, UserDTO user) {
        String sessionKey = SessionStore.createSessionKey();
        SessionStore.save(sessionKey, user.getId(), user.getIsAdmin() ? Role.ADMIN : Role.USER);
        ctx.cookie(SessionStore.COOKIE_SESSION_KEY, sessionKey, COOKIE_TTL_SECONDS);
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
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, ErrorCode.NOT_AUTHENTICATED, "No session key");
        }

        // Retreive session
        Session session = SessionStore.find(sessionKey);
        if (session == null) {
            ctx.removeCookie(SessionStore.COOKIE_SESSION_KEY);
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_SESSION, "Session terminated");
            return; // For compiler
        }

        // Get user in session
        Optional<UserDTO> user = dao.findById(Integer.parseInt(session.userId()));
        if (user.isEmpty() || user.get().getIsDeleted()) {
            ctx.removeCookie(SessionStore.COOKIE_SESSION_KEY);
            SessionStore.delete(sessionKey);
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_SESSION, "No user found for this session");
        }

        // Refresh session
        SessionStore.refresh(sessionKey);
        ctx.json(Map.of("user", user));
    }

    public static void getPublicProfile(Context ctx) {
        Integer userId = requireId(ctx);

        // Retreive user, deleted users are not visible
        Optional<UserDTO> optUser = dao.findById(userId).filter(u -> !u.getIsDeleted());
        UserDTO user = requireFound(optUser, ErrorCode.USER_NOT_FOUND, "User", userId);

        // Only send publicly visible information (no email)
        PublicUserDTO publicUser = PublicUserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .isAdmin(user.getIsAdmin())
                .createdAt(user.getCreatedAt())
                .build();

        ctx.json(Map.of("user", publicUser));
    }

    public static void update(Context ctx) {
        UpdateUserDTO dto = requireBody(ctx, UpdateUserDTO.class);

        // A user can only update their own profile, ID is taken from the session
        Integer userId = AuthServiceUtil.requireUserId(ctx);

        // Validate fields
        if (dto.username() == null || dto.username().isBlank()) {
            ErrorResponse.sendField(HttpStatus.BAD_REQUEST, ErrorCode.USERNAME_REQUIRED, "username", "Username is required");
        }
        if (dto.email() == null || dto.email().isBlank()) {
            ErrorResponse.sendField(HttpStatus.BAD_REQUEST, ErrorCode.EMAIL_REQUIRED, "email", "Email is required");
        }
        if (dto.newPassword() != null && !dto.newPassword().isBlank() && dto.newPassword().length() < 8) {
            ErrorResponse.sendField(HttpStatus.BAD_REQUEST, ErrorCode.PASSWORD_TOO_SHORT, "newPassword", "Password must be at least 8 characters");
        }

        // Check current password
        Optional<UserWithPasswordDTO> optUser = dao.findByIdWithPassword(userId);
        if (optUser.isEmpty() || optUser.get().getIsDeleted()) {
            ErrorResponse.send(HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND, "");
            return; // For compiler
        }
        if (dto.currentPassword() == null
                || !UserDAO.checkPassword(optUser.get().getPassword(), dto.currentPassword())) {
            ErrorResponse.sendField(HttpStatus.UNAUTHORIZED, ErrorCode.WRONG_PASSWORD, "currentPassword", "Current password is incorrect");
        }

        // If email already in use by another user
        Optional<UserDTO> emailOwner = dao.findByEmail(dto.email());
        if (emailOwner.isPresent() && !emailOwner.get().getId().equals(userId)) {
            ErrorResponse.sendField(HttpStatus.CONFLICT, ErrorCode.EMAIL_TAKEN, "email", "");
        }

        Boolean updated = dao.update(userId, dto.username().trim(), dto.email().trim(), dto.newPassword());
        if (!updated) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.USER_NOT_UPDATED, "Failed to update user");
        }

        // Send back updated account info to the client
        ctx.json(Map.of("user", dao.findById(userId).get()));
    }

    public static void getList(Context ctx) {
        List<UserDTO> users = dao.getUsers(PaginationServiceUtil.getFromContext(ctx));

        ctx.json(Map.of("users", users));
    }

    public static void delete(Context ctx) {
        Boolean deleted = dao.delete(requireId(ctx));

        if (!deleted) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.USER_NOT_DELETED, "Failed to delete user");
        }

        ctx.status(HttpStatus.OK);
    }

    public static void recycle(Context ctx) {
        Boolean recycled = dao.recycle(requireId(ctx));

        if (!recycled) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.USER_NOT_RECYCLED, "Failed to recycle user");
        }

        ctx.status(HttpStatus.OK);
    }
}
