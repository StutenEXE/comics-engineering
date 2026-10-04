package dev.stuten.vps.services;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.models.daos.BookDAO;
import dev.stuten.vps.models.daos.IssueDAO;
import dev.stuten.vps.models.daos.IssueSerieDAO;
import dev.stuten.vps.models.daos.PublisherDAO;
import dev.stuten.vps.models.daos.SerieDAO;
import dev.stuten.vps.models.dtos.request.search.PaginationDTO;
import dev.stuten.vps.services.utils.PaginationServiceUtil;
import dev.stuten.vps.web.ErrorCode;
import dev.stuten.vps.web.ErrorResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

/**
 * Search endpoints. Every endpoint takes a "query" parameter, and optional
 * "from" and "limit" parameters for pagination (no pagination if omitted).
 */
public class SearchService {

    private SearchService() {
    }

    // Too broad queries (shorter than this) return no results
    private static final int MIN_QUERY_LENGTH = 3;

    /**
     * A search on one type of entity
     */
    @FunctionalInterface
    private interface Searcher {
        List<?> search(String query, PaginationDTO pagination);
    }

    private static BookDAO bookDao = new BookDAO(
            JooqProvider.get());

    private static SerieDAO serieDao = new SerieDAO(
            JooqProvider.get());

    private static PublisherDAO publisherDao = new PublisherDAO(
            JooqProvider.get());

    private static IssueDAO issueDao = new IssueDAO(
            JooqProvider.get());

    private static IssueSerieDAO issueSeriesDao = new IssueSerieDAO(
            JooqProvider.get());

    // Entities that can be searched with searchAll, by type name
    private static final Map<String, Searcher> SEARCHABLE_TYPES = Map.of(
            "books", bookDao::searchByName,
            "series", serieDao::searchByName,
            "issues", issueDao::searchByName,
            "issueseries", issueSeriesDao::searchByName);

    public static void searchAll(Context ctx) {
        String query = getQuery(ctx);
        PaginationDTO pagination = PaginationServiceUtil.getOptionalFromContext(ctx);
        String typesParam = ctx.queryParam("types");
        List<String> types = typesParam == null ? List.of() : Arrays.asList(typesParam.split(","));

        // Every type is always in the response, empty if not requested
        Map<String, Object> results = new HashMap<>();
        results.put("editions", List.of());
        SEARCHABLE_TYPES.forEach((type, searcher) -> results.put(type,
                types.contains(type) ? search(searcher, query, MIN_QUERY_LENGTH, pagination) : List.of()));

        ctx.json(results);
    }

    public static void searchBooks(Context ctx) {
        respond(ctx, "books", bookDao::searchByName, MIN_QUERY_LENGTH);
    }

    public static void searchSeries(Context ctx) {
        respond(ctx, "series", serieDao::searchByName, MIN_QUERY_LENGTH);
    }

    public static void searchPublishers(Context ctx) {
        // Here broad queries are handled
        respond(ctx, "publishers", publisherDao::searchByName, 0);
    }

    public static void searchIssueSeries(Context ctx) {
        respond(ctx, "issueSeries", issueSeriesDao::searchByName, MIN_QUERY_LENGTH);
    }

    /**
     * Reads the query and pagination from the request, runs the search and sends
     * the results under the given key
     */
    private static void respond(Context ctx, String key, Searcher searcher, int minQueryLength) {
        String query = getQuery(ctx);
        PaginationDTO pagination = PaginationServiceUtil.getOptionalFromContext(ctx);

        ctx.json(Map.of(key, search(searcher, query, minQueryLength, pagination)));
    }

    private static List<?> search(Searcher searcher, String query, int minQueryLength, PaginationDTO pagination) {
        if (query.length() < minQueryLength) {
            return List.of();
        }
        return searcher.search(query, pagination);
    }

    private static String getQuery(Context ctx) {
        String query = ctx.queryParam("query");
        if (query == null) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, ErrorCode.MISSING_QUERY, "Missing query");
        }
        return query;
    }
}
