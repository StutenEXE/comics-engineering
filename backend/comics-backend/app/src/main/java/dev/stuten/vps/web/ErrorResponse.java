package dev.stuten.vps.web;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.javalin.http.HttpResponseException;
import io.javalin.http.HttpStatus;

public class ErrorResponse {

    public record ErrorObject(
        @JsonProperty("error") String error,
        @JsonProperty("message") String message
    ) {}


    public static void send(HttpStatus code, String error, String message) {
         throw new HttpResponseException(code, error, Map.of("error", error, "message", message));
    }
}
