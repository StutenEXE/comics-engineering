package dev.stuten.vps.services;

import java.util.Map;
import java.util.Optional;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.models.daos.UserSubmissionDAO;
import dev.stuten.vps.models.dtos.UserSubmissionDTO;
import dev.stuten.vps.web.ErrorResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class UserSubmissionService {

    private UserSubmissionService() {}

    private static UserSubmissionDAO dao = new UserSubmissionDAO(
            JooqProvider.get());

    public static void create(Context ctx) {
        UserSubmissionDTO mainSubmission = ctx.bodyAsClass(UserSubmissionDTO.class);
        // At least one user is logged in 
        // Integer userId = Integer.parseInt(AuthMiddleware.getCurrentSession(ctx).userId());
    
        // Create main submission in database
        Optional<UserSubmissionDTO> optMainSubmission = dao.create(mainSubmission);
        if (optMainSubmission.isEmpty()) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, "Could not create submission", "Main submission could not be created");
            return; // for compiler
        }

        UserSubmissionDTO newMainSubmission = optMainSubmission.get();

        // Create related submissions
        for (UserSubmissionDTO relatedSubmission : mainSubmission.childSubmissions()) {
            // Assign main submission
            relatedSubmission = new UserSubmissionDTO(relatedSubmission, newMainSubmission);
            Optional<UserSubmissionDTO> optRelatedSubmission = dao.create(relatedSubmission);
            if (optRelatedSubmission.isEmpty()) {
                ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, "Could not create submission", "Related submission could not be created");
                return; // for compiler
            }
            // Add the new submission to the main submission
            newMainSubmission.childSubmissions().add(optRelatedSubmission.get());
        }

        ctx.json(Map.of("submission", newMainSubmission));
    }
}
