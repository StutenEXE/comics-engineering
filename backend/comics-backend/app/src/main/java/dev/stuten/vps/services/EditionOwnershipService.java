package dev.stuten.vps.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.models.daos.OwnedEditionDAO;
import dev.stuten.vps.models.dtos.full.OwnedEditionDTO;
import dev.stuten.vps.models.dtos.response.UserMonthlyReadingStatsDTO;
import dev.stuten.vps.models.dtos.response.UserMonthlyReadingStatsDTO.ReadingPerMonthStats;
import dev.stuten.vps.models.dtos.response.UserMonthlySpendingStatsDTO;
import dev.stuten.vps.models.dtos.response.UserMonthlySpendingStatsDTO.SpendingPerMonthStats;
import dev.stuten.vps.models.dtos.response.UserReadingStatsDTO;
import dev.stuten.vps.models.dtos.response.UserSpendingStatsDTO;
import dev.stuten.vps.models.dtos.simple.SimpleOwnedEditionDTO;
import dev.stuten.vps.services.utils.PriceServiceUtils;
import dev.stuten.vps.web.ErrorResponse;
import dev.stuten.vps.web.middleware.AuthContext;
import dev.stuten.vps.web.middleware.AuthMiddleware;
import dev.stuten.vps.web.middleware.Role;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class EditionOwnershipService {

    private EditionOwnershipService() {
    }

    private static OwnedEditionDAO dao = new OwnedEditionDAO(
            JooqProvider.get());

    public static void create(Context ctx) {
        OwnedEditionDTO dto = ctx.bodyAsClass(OwnedEditionDTO.class);

        // Validate that the person creating the owned edition is the owner or an admin
        AuthContext auth = AuthMiddleware.getCurrentSession(ctx);
        if (auth == null) {
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, "Invalid session", "No valid session found");
            return;
        }
        if (!auth.userId().equals(dto.getUser().getId().toString()) && !auth.role().equals(Role.ADMIN)) {
            ErrorResponse.send(HttpStatus.FORBIDDEN, "Forbidden", "You can only create owned editions for yourself");
            return;
        }

        // Create owned edition
        Optional<Integer> ownedEditionId = dao.create(dto);

        // If owned edition was not created
        if (ownedEditionId.isEmpty()) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, "Owned edition not created", "");
        }
        OwnedEditionDTO newOwnedEdition = dao.findOwnedById(ownedEditionId.get()).get();

        // Send back account info to the client
        ctx.json(Map.of("ownedEdition", newOwnedEdition));
    }

    public static void update(Context ctx) {
        OwnedEditionDTO dto = ctx.bodyAsClass(OwnedEditionDTO.class);

        // Validate that the person updating the owned edition is the owner or an admin
        AuthContext auth = AuthMiddleware.getCurrentSession(ctx);
        if (auth == null) {
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, "Invalid session", "No valid session found");
            return;
        }
        if (!auth.userId().equals(dto.getUser().getId().toString()) && !auth.role().equals(Role.ADMIN)) {
            ErrorResponse.send(HttpStatus.FORBIDDEN, "Forbidden", "You can only update owned editions for yourself");
            return;
        }

        // Update owned edition
        Boolean updated = dao.update(dto);

        if (!updated) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, "Error", "Failed to update owned edition");
            return;
        }

        // Retreive new ownership in db
        Optional<OwnedEditionDTO> newOe = dao.findOwnedById(dto.getId());

        ctx.status(HttpStatus.CREATED).json(Map.of("ownedEdition", newOe.get()));
    }

    public static void remove(Context ctx) {
        // Retreive ownership ID from request
        Integer ownershipID;
        try {
            ownershipID = Integer.parseInt(ctx.queryParam("id"));
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Missing ID or NaN ID");
            return; // For compiler
        }

        Optional<OwnedEditionDTO> optOe = dao.findOwnedById(ownershipID);
        if (optOe.isEmpty()) {
            ErrorResponse.send(HttpStatus.NOT_FOUND, "Ownership not found",
                    "This ownerhip relation has not been found");
            return;
        }
        OwnedEditionDTO oe = optOe.get();

        // Validate that the person deleting the owned edition is the owner or an admin
        AuthContext auth = AuthMiddleware.getCurrentSession(ctx);
        if (auth == null) {
            ErrorResponse.send(HttpStatus.UNAUTHORIZED, "Invalid session", "No valid session found");
            return;
        }
        if (!auth.userId().equals(oe.getUser().getId().toString()) && !auth.role().equals(Role.ADMIN)) {
            ErrorResponse.send(HttpStatus.FORBIDDEN, "Forbidden", "You can only remove owned editions for yourself");
            return;
        }

        // Delete owned edition (remove from collection)
        Boolean removed = dao.delete(oe);

        if (!removed) {
            ErrorResponse.send(HttpStatus.INTERNAL_SERVER_ERROR, "Error", "Failed to remove owned edition");
            return;
        }

        ctx.status(HttpStatus.OK);
    }

    public static void getById(Context ctx) {
        // Retreive user ID from request
        Integer id;
        try {
            id = Integer.parseInt(ctx.queryParam("id"));
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Missing ID or NaN ID");
            return; // For compiler
        }

        // Retreive owned editions
        Optional<OwnedEditionDTO> ownedEdition = dao.findOwnedById(id);
        if (ownedEdition.isEmpty()) {
            String message = String.format("Owned edition of id %s not found", id);
            ErrorResponse.send(HttpStatus.NOT_FOUND, "Owned edition not found", message);
            return;
        }

        ctx.json(Map.of("ownedEdition", ownedEdition));
    }

    public static void getByUserID(Context ctx) {
        // Retreive user ID from request
        Integer userID;
        try {
            userID = Integer.parseInt(ctx.queryParam("id"));
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Missing ID or NaN ID");
            return;
        }

        /*
         * // Pagination
         * PaginationDTO pagination = PaginationServiceUtil.getFromContext(ctx);
         * if (pagination == null) {
         * return;
         * }
         * // Filtering
         * OwnedEditionFilterDTO filter = FilteringServiceUtil.getFromContext(ctx,
         * OwnedEditionFilterDTO.class);
         * // Sorting
         * 
         * @SuppressWarnings({ "nullness", "null" })
         * SortingDTO<OwnedEditionSortingFields> sorting =
         * SortingServiceUtil.getFromContext(ctx,
         * OwnedEditionSortingFields.class);
         */
        // Retrieve owned editions
        List<OwnedEditionDTO> ownedEditions = dao.findOwnedByUserId(userID);

        ctx.json(Map.of("ownedEditions", ownedEditions));
    }

    public static void getUserSpendingStats(Context ctx) {
        // Retreive user ID from request
        Integer userID;
        try {
            userID = Integer.parseInt(ctx.queryParam("id"));
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Missing ID or NaN ID");
            return; // For compiler
        }

        // Retrieve owned editions
        List<SimpleOwnedEditionDTO> oeditions = dao.findSimpleOwnedByUserId(userID);

        // If no oeditions returned, exit early to simplify the following logic
        if (oeditions.size() == 0) {
            ctx.json(
                    Map.of("stats", new UserSpendingStatsDTO(
                            new BigDecimal("0.00"), new BigDecimal("0.00"), new BigDecimal("0.00"),
                            new BigDecimal("0.00"),
                            new BigDecimal("0.00"), new BigDecimal("0.00"),
                            null, null, null, null)));
            return;
        }

        // Total prices
        BigDecimal totalPurchasePrice = new BigDecimal("0.00");
        BigDecimal totalFees = new BigDecimal("0.00");
        BigDecimal totalRetailPrice = new BigDecimal("0.00");
        // Most/best of something variables
        SimpleOwnedEditionDTO mostCostly = oeditions.get(0),
                bestDealByPrice = oeditions.get(0),
                bestDealByReduction = oeditions.get(0),
                mostValuable = oeditions.get(0);

        for (SimpleOwnedEditionDTO oe : oeditions) {
            // Prices
            totalPurchasePrice = totalPurchasePrice.add(oe.getPurchasePrice());
            totalFees = totalFees.add(oe.getFees());
            totalRetailPrice = totalRetailPrice.add(oe.getRetailPrice());

            // Most costly
            BigDecimal spent = PriceServiceUtils.calculateCost(oe);
            BigDecimal highestSpending = PriceServiceUtils.calculateCost(mostCostly);
            if (highestSpending.compareTo(spent) < 0) {
                mostCostly = oe;
            }
            // Most valuable
            if (mostValuable.getRetailPrice().compareTo(oe.getRetailPrice()) < 0) {
                mostValuable = oe;
            }

            // Deals, not applicable to gifts
            if (oe.getGift()) {
                continue;
            }
            // Best deal by price
            BigDecimal deal = PriceServiceUtils.calculateSavings(oe);
            BigDecimal bestDeal = PriceServiceUtils.calculateSavings(bestDealByPrice);
            if (bestDeal.compareTo(deal) < 0) {
                bestDealByPrice = oe;
            }

            // Best deal by reduction
            BigDecimal dealRed = PriceServiceUtils.calculateReduction(oe);
            BigDecimal bestReduction = PriceServiceUtils.calculateReduction(bestDealByReduction);
            if (bestReduction.compareTo(dealRed) < 0) {
                bestDealByReduction = oe;
            }
        }

        BigDecimal totalSpent = totalPurchasePrice.add(totalFees);
        BigDecimal totalSavings = totalRetailPrice.subtract(totalSpent);
        BigDecimal totalSavingsPercentage = totalSavings.multiply(new BigDecimal(100)).divide(totalRetailPrice,
                RoundingMode.HALF_UP);

        UserSpendingStatsDTO stats = new UserSpendingStatsDTO(
                totalSpent, totalPurchasePrice, totalFees, totalRetailPrice,
                totalSavings, totalSavingsPercentage,
                mostCostly, mostValuable, bestDealByPrice, bestDealByReduction);

        ctx.json(Map.of("stats", stats));
    }

    public static void getUserMonthlySpendingStats(Context ctx) {
        // Retreive user ID from request
        Integer userID;
        try {
            userID = Integer.parseInt(ctx.queryParam("id"));
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Missing ID or NaN ID");
            return; // For compiler
        }

        // Retrieve owned editions
        List<SimpleOwnedEditionDTO> oeditions = dao.findSimpleOwnedByUserId(userID);

        // Spending per month
        Map<String, Map<SpendingPerMonthStats, BigDecimal>> readingPerMonth = new HashMap<String, Map<SpendingPerMonthStats, BigDecimal>>();

        for (SimpleOwnedEditionDTO oe : oeditions) {
            // Update the month to month spending (yyyy-MM-01)
            String yearmonth = oe.getDate().format(DateTimeFormatter.ofPattern("yyyy-MM")) + "-01";
            // Create month if not created yet
            if (!readingPerMonth.containsKey(yearmonth)) {
                readingPerMonth.put(yearmonth, new HashMap<SpendingPerMonthStats, BigDecimal>(
                        Map.of(SpendingPerMonthStats.TOTAL_PURCHASE_PRICE, new BigDecimal("0.00"),
                                SpendingPerMonthStats.TOTAL_FEES, new BigDecimal("0.00"),
                                SpendingPerMonthStats.TOTAL_SPENT, new BigDecimal("0.00"),
                                SpendingPerMonthStats.TOTAL_BOOKS_BOUGHT, new BigDecimal("0"),
                                SpendingPerMonthStats.TOTAL_BOOKS_GIFTED, new BigDecimal("0"),
                                SpendingPerMonthStats.TOTAL_BOOKS_ADDED, new BigDecimal("0"))));
            }
            Map<SpendingPerMonthStats, BigDecimal> monthStats = readingPerMonth.get(yearmonth);

            // Add price infos
            monthStats.put(SpendingPerMonthStats.TOTAL_PURCHASE_PRICE,
                    monthStats.get(SpendingPerMonthStats.TOTAL_PURCHASE_PRICE)
                            .add(oe.getPurchasePrice()));
            monthStats.put(SpendingPerMonthStats.TOTAL_FEES,
                    monthStats.get(SpendingPerMonthStats.TOTAL_FEES).add(oe.getFees()));
            monthStats.put(SpendingPerMonthStats.TOTAL_SPENT,
                    monthStats.get(SpendingPerMonthStats.TOTAL_SPENT).add(oe.getPurchasePrice().add(oe.getFees())));

            // Add books infos
            monthStats.put(SpendingPerMonthStats.TOTAL_BOOKS_ADDED,
                    monthStats.get(SpendingPerMonthStats.TOTAL_BOOKS_ADDED)
                            .add(new BigDecimal(1)));
            if (oe.getGift()) {
                monthStats.put(SpendingPerMonthStats.TOTAL_BOOKS_GIFTED,
                        monthStats.get(SpendingPerMonthStats.TOTAL_BOOKS_GIFTED)
                                .add(new BigDecimal(1)));
            } else {
                monthStats.put(SpendingPerMonthStats.TOTAL_BOOKS_BOUGHT,
                        monthStats.get(SpendingPerMonthStats.TOTAL_BOOKS_BOUGHT)
                                .add(new BigDecimal(1)));
            }
        }

        UserMonthlySpendingStatsDTO stats = new UserMonthlySpendingStatsDTO(readingPerMonth);
        ctx.json(Map.of("stats", stats));
    }

    public static void getUserReadingStats(Context ctx) {
        // Retreive user ID from request
        Integer userID;
        try {
            userID = Integer.parseInt(ctx.queryParam("id"));
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Missing ID or NaN ID");
            return; // For compiler
        }

        // Retrieve owned editions & issue mapping
        List<OwnedEditionDTO> oeditions = dao.findOwnedByUserId(userID);
        Map<Integer, Integer> mapEdIssues = dao.findAllNumberOfIssuesLinked(oeditions);

        String distancePrecision = "0.0000";

        // If no oeditions returned, exit early to simplify the following logic
        if (oeditions.size() == 0) {
            ctx.json(
                    Map.of("stats",
                            new UserReadingStatsDTO(0, 0, 0, 0, 0, 0,
                                    new BigDecimal(distancePrecision), new BigDecimal(distancePrecision),
                                    new BigDecimal("0.00"), new BigDecimal("0.00"))));
            return;
        }

        // Books
        Integer totalBooks = oeditions.size();
        Integer totalBooksRead = 0;
        // Pages
        Integer totalPages = 0;
        Integer totalPagesRead = 0;
        // Issues
        Integer totalIssues = 0;
        Integer totalIssuesRead = 0;
        // Distance
        BigDecimal totalDistance = new BigDecimal(distancePrecision);
        BigDecimal distanceRead = new BigDecimal(distancePrecision);
        // Value read
        BigDecimal totalValue = new BigDecimal("0.00");
        BigDecimal valueRead = new BigDecimal("0.00");

        for (OwnedEditionDTO oe : oeditions) {
            // Calculate read/not read stats
            Integer nPages = oe.getEdition().getNpages();
            totalPages += nPages;
            totalIssues += mapEdIssues.get(oe.getEdition().getId());
            BigDecimal distanceCm = new BigDecimal(nPages).multiply(oe.getEdition().getDimensions().height());
            BigDecimal distanceM = distanceCm.divide(new BigDecimal(100), RoundingMode.HALF_UP);
            totalDistance = totalDistance.add(distanceM);
            totalValue = totalValue.add(oe.getRetailPrice());

            if (!oe.getRead())
                continue;

            // Calculate read stats
            totalBooksRead++;
            totalPagesRead += oe.getEdition().getNpages();
            totalIssuesRead += mapEdIssues.get(oe.getEdition().getId());
            distanceRead = distanceRead.add(distanceM);
            valueRead = valueRead.add(oe.getRetailPrice());
        }

        Integer totalBooksNotRead = totalBooks - totalBooksRead;
        Integer totalPagesNotRead = totalPages - totalPagesRead;
        Integer totalIssuesNotRead = totalIssues - totalIssuesRead;
        BigDecimal distanceNotRead = totalDistance.subtract(distanceRead);
        BigDecimal valueNotRead = totalValue.subtract(valueRead);

        UserReadingStatsDTO stats = new UserReadingStatsDTO(
                totalBooksRead, totalBooksNotRead,
                totalIssuesRead, totalIssuesNotRead,
                totalPagesRead, totalPagesNotRead,
                distanceRead, distanceNotRead,
                valueRead, valueNotRead);

        ctx.json(Map.of("stats", stats));
    }

    public static void getUserMonthlyReadingStats(Context ctx) {
        // Retreive user ID from request
        Integer userID;
        try {
            userID = Integer.parseInt(ctx.queryParam("id"));
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Missing ID or NaN ID");
            return; // For compiler
        }

        // Retrieve owned editions
        List<OwnedEditionDTO> oeditions = dao.findOwnedByUserId(userID);
        Map<Integer, Integer> mapEdIssues = dao.findAllNumberOfIssuesLinked(oeditions);

        // Spending per month
        Map<String, Map<ReadingPerMonthStats, Integer>> readingPerMonth = new HashMap<String, Map<ReadingPerMonthStats, Integer>>();
        Integer booksReadWithNoDate = 0;

        for (OwnedEditionDTO oe : oeditions) {
            if (!oe.getRead()) {
                continue;
            }
            if (oe.getDateRead() == null) {
                booksReadWithNoDate++;
                continue;
            }
            // Update the month to month spending (yyyy-MM-01)
            String yearmonth = oe.getDateRead().format(DateTimeFormatter.ofPattern("yyyy-MM")) + "-01";
            // Create month if not created yet
            if (!readingPerMonth.containsKey(yearmonth)) {
                readingPerMonth.put(yearmonth, new HashMap<ReadingPerMonthStats, Integer>(
                        Map.of(ReadingPerMonthStats.NUMBER_BOOKS_READ, 0,
                                ReadingPerMonthStats.NUMBER_ISSUES_READ, 0,
                                ReadingPerMonthStats.NUMBER_PAGES_READ, 0)));
            }
            Map<ReadingPerMonthStats, Integer> monthStats = readingPerMonth.get(yearmonth);
            monthStats.put(ReadingPerMonthStats.NUMBER_BOOKS_READ,
                    monthStats.get(ReadingPerMonthStats.NUMBER_BOOKS_READ) + 1);
            monthStats.put(ReadingPerMonthStats.NUMBER_ISSUES_READ,
                    monthStats.get(ReadingPerMonthStats.NUMBER_ISSUES_READ) + mapEdIssues.get(oe.getEdition().getId()));
            monthStats.put(ReadingPerMonthStats.NUMBER_PAGES_READ,
                    monthStats.get(ReadingPerMonthStats.NUMBER_PAGES_READ) + oe.getEdition().getNpages());
        }

        UserMonthlyReadingStatsDTO stats = new UserMonthlyReadingStatsDTO(readingPerMonth, booksReadWithNoDate);
        ctx.json(Map.of("stats", stats));
    }
}
