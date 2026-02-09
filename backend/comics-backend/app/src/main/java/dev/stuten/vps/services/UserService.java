package dev.stuten.vps.services;

import java.util.Optional;

import org.eclipse.jetty.http.HttpStatus;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.models.daos.UserDAO;
import dev.stuten.vps.models.dtos.UserDTO;
import dev.stuten.vps.models.dtos.UserWithPasswordDTO;
import dev.stuten.vps.web.ErrorResponse;
import dev.stuten.vps.web.middleware.Role;
import dev.stuten.vps.web.middleware.SessionStore;
import io.javalin.http.Context;

public class UserService {

    private UserService() {
    }

    private static UserDAO dao = new UserDAO(
            JooqProvider.get());

    public static void SignupService(Context ctx) {
        UserWithPasswordDTO dto = ctx.bodyAsClass(UserWithPasswordDTO.class);

        // If email already in use
        if (dao.findByEmail(dto.email()).isPresent()) {
            ErrorResponse.send(HttpStatus.CONFLICT_409, "Email already in use", "");
        }

        // Create user 
        Optional<UserDTO> optUser = dao.create(dto);

        // If user was not created
        if (optUser.isEmpty()) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR_500, "Account not created", "");
        }
        UserDTO newUser = optUser.get();

        // Log in user
        SessionStore.save(SessionStore.createSessionKey(), newUser.id(), newUser.isAdmin() ? Role.ADMIN : Role.USER);

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
            ErrorResponse.send(HttpStatus.UNAUTHORIZED_401, "Invalid credentials", null);
        }

        UserWithPasswordDTO userPwd = optUser.get();
        // Check password validity
        if (!UserDAO.checkPassword(userPwd.password(), dto.password())) {
            ErrorResponse.send(HttpStatus.UNAUTHORIZED_401, "Invalid credentials", null);
        }

        // Remove password for safety
        UserDTO user = UserDAO.removePassword(userPwd);

        // Log in user
        SessionStore.save(SessionStore.createSessionKey(), user.id(), user.isAdmin() ? Role.ADMIN : Role.USER);

        // Send back account info to the client
        ctx.json(user);
        System.out.println("Log in:" + dto.email());
    }
}
