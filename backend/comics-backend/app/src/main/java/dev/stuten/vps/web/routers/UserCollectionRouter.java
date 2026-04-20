package dev.stuten.vps.web.routers;

import dev.stuten.vps.services.EditionOwnershipService;
import dev.stuten.vps.web.routers.utils.APIPathBuilder;
import io.javalin.Javalin;

public class UserCollectionRouter implements Router {

    @Override
    public void register(Javalin app) {
        // Private
        app.get(APIPathBuilder.buildPrivatePath("/collection/get"), EditionOwnershipService::getByID);
        app.post(APIPathBuilder.buildPrivatePath("/collection/add"), EditionOwnershipService::create);
    }
    
}
