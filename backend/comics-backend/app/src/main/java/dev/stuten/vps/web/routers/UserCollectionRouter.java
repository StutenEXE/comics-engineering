package dev.stuten.vps.web.routers;

import dev.stuten.vps.services.EditionOwnershipService;
import dev.stuten.vps.web.routers.utils.APIPathBuilder;
import io.javalin.Javalin;

public class UserCollectionRouter implements Router {

        @Override
        public void register(Javalin app) {
                // Private
                app.post(APIPathBuilder.buildPrivatePath("/collection/add"), EditionOwnershipService::create);
                app.post(APIPathBuilder.buildPrivatePath("/collection/update"), EditionOwnershipService::update);
                app.delete(APIPathBuilder.buildPrivatePath("/collection/remove"), EditionOwnershipService::remove);
                app.get(APIPathBuilder.buildPrivatePath("/collection"), EditionOwnershipService::getByUserID);
                app.get(APIPathBuilder.buildPrivatePath("/collection/get"), EditionOwnershipService::getById);
                // -- Stats
                app.get(APIPathBuilder.buildPrivatePath("/collection/stats/spending"),
                                EditionOwnershipService::getUserSpendingStats);
                app.get(APIPathBuilder.buildPrivatePath("/collection/stats/spending/monthly"),
                                EditionOwnershipService::getUserMonthlySpendingStats);
                app.get(APIPathBuilder.buildPrivatePath("/collection/stats/reading"),
                                EditionOwnershipService::getUserReadingStats);
                app.get(APIPathBuilder.buildPrivatePath("/collection/stats/reading/monthly"),
                                EditionOwnershipService::getUserMonthlyReadingStats);
        }
}
