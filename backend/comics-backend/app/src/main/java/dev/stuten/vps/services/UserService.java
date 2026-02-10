package dev.stuten.vps.services;

import java.util.Optional;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.models.daos.UserDAO;
import dev.stuten.vps.models.dtos.UserDTO;
import dev.stuten.vps.models.dtos.UserWithPasswordDTO;
import dev.stuten.vps.web.ErrorResponse;
import dev.stuten.vps.web.middleware.Role;
import dev.stuten.vps.web.middleware.SessionStore;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class UserService {

    private UserService() {}

    private static UserDAO dao = new UserDAO(
            JooqProvider.get());

    public static void SignupService(Context ctx) {
        UserWithPasswordDTO dto = ctx.bodyAsClass(UserWithPasswordDTO.class);

        // If email already in use
        if (dao.findByEmail(dto.email()).isPresent()) {
            ErrorResponse.send(HttpStatus.CONFLICT, "Email already in use", "");
        }

        // Create user
        Optional<UserDTO> optUser = dao.create(dto);

        // If user was not created
        if (optUser.isEmpty()) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, "Account not created", "");
        }
        UserDTO newUser = optUser.get();

        // Log in user
        String sessionKey = SessionStore.createSessionKey();
        SessionStore.save(SessionStore.createSessionKey(), newUser.id(), newUser.isAdmin() ? Role.ADMIN : Role.USER);
        ctx.cookie("session_id", sessionKey);

        // Send back account info to the client
        ctx.json(newUser);
        System.out.println("New user:" + dto.email());
    }

    public static void LoginService(Context ctx) {
        UserWithPasswordDTO dto = ctx.bodyAsClass(UserWithPasswordDTO.class);

        // Database lookup
        Optional<UserWithPasswordDTO> optUser = dao.findByEmailWithPassword(dto.email());
        // No user found
        if (optUser.isEmpty()) {
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, "Invalid credentials", "");
        }

        UserWithPasswordDTO userPwd = optUser.get();
        // Check password validity
        if (!UserDAO.checkPassword(userPwd.password(), dto.password())) {
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, "Invalid credentials", "");
        }

        // Remove password for safety
        UserDTO user = UserDAO.removePassword(userPwd);

        // Log in user
        String sessionKey = SessionStore.createSessionKey();
        SessionStore.save(sessionKey, user.id(), user.isAdmin() ? Role.ADMIN : Role.USER);
        ctx.cookie("session_id", sessionKey);

        // Send back account info to the client
        ctx.json(user);
        System.out.println("Log in:" + dto.email());
    }
}
