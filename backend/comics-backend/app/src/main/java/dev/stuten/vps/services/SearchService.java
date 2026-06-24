package dev.stuten.vps.services;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import dev.stuten.vps.db.JooqProvider;
import dev.stuten.vps.models.daos.BookDAO;
import dev.stuten.vps.models.daos.IssueDAO;
import dev.stuten.vps.models.daos.IssueSerieDAO;
import dev.stuten.vps.models.daos.PublisherDAO;
import dev.stuten.vps.models.daos.SerieDAO;
import dev.stuten.vps.models.dtos.full.BookDTO;
import dev.stuten.vps.models.dtos.full.IssueDTO;
import dev.stuten.vps.models.dtos.full.IssueSerieDTO;
import dev.stuten.vps.models.dtos.full.PublisherDTO;
import dev.stuten.vps.models.dtos.full.SerieDTO;
import dev.stuten.vps.web.ErrorResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

public class SearchService {

    private SearchService() {
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

    public static void searchBooksSeriesIssuesIssueSeries(Context ctx) {
        // Retreive query from request
        String query = "";
        try {
            query = ctx.queryParam("query");
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Missing query");
            return; // For compiler
        }

        // Lists of elements to retreive
        List<BookDTO> books = Arrays.asList();
        List<SerieDTO> series = Arrays.asList();
        List<IssueDTO> issues = Arrays.asList();
        List<IssueSerieDTO> issueseries = Arrays.asList();

        // To broad queries are not handled
        if (query.length() < 3) {
            ctx.json(Map.of(
                    "books", books,
                    "series", series,
                    "issues", issues,
                    "issueseries", issueseries));
            return;
        }

        // Retreive books
        books = bookDao.searchByName(query);
        series = serieDao.searchByName(query);
        issues = issueDao.searchByName(query);
        issueseries = issueSeriesDao.searchByName(query);

        ctx.json(Map.of(
                "books", books,
                "series", series,
                "issues", issues,
                "issueseries", issueseries));
    }

    public static void searchBooks(Context ctx) {
        // Retreive query from request
        String query = "";
        try {
            query = ctx.queryParam("query");
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Missing query");
            return; // For compiler
        }

        // Lists of elements to retreive
        List<BookDTO> books = Arrays.asList();

        // To broad queries are not handled
        if (query.length() < 3) {
            ctx.json(Map.of("books", books));
            return;
        }

        // Retreive books
        books = bookDao.searchByName(query);

        ctx.json(Map.of("books", books));
    }

    public static void searchSeries(Context ctx) {
        // Retreive query from request
        String query = "";
        try {
            query = ctx.queryParam("query");
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Missing query");
            return; // For compiler
        }

        // Lists of elements to retreive
        List<SerieDTO> series = Arrays.asList();

        // To broad queries are not handled
        if (query.length() < 3) {
            ctx.json(Map.of("series", series));
            return;
        }

        // Retreive series
        series = serieDao.searchByName(query);

        ctx.json(Map.of("series", series));
    }

    public static void searchPublishers(Context ctx) {
        // Retreive query from request
        String query = "";
        try {
            query = ctx.queryParam("query");
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Missing query");
            return; // For compiler
        }

        // Retreive series - Here broad queries are handled
        List<PublisherDTO> publishers = publisherDao.searchByName(query);

        ctx.json(Map.of("publishers", publishers));
    }

    public static void searchIssueSeries(Context ctx) {
        // Retreive query from request
        String query = "";
        try {
            query = ctx.queryParam("query");
        } catch (NumberFormatException e) {
            ErrorResponse.send(HttpStatus.BAD_REQUEST, "Invalid request", "Missing query");
            return; // For compiler
        }

        // Lists of elements to retreive
        List<IssueSerieDTO> issueSeries = Arrays.asList();

        // To broad queries are not handled
        if (query.length() < 3) {
            ctx.json(Map.of("issueSeries", issueSeries));
            return;
        }

        // Retreive series - Here broad queries are handled
        issueSeries = issueSeriesDao.searchByName(query);

        ctx.json(Map.of("issueSeries", issueSeries));
    }
}
