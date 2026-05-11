package dev.stuten.vps.web.middleware;

import java.util.Objects;
import java.util.UUID;

import io.lettuce.core.RedisClient;
import io.lettuce.core.RedisURI;
import io.lettuce.core.api.sync.RedisCommands;

public final class SessionStore {

    public static final String COOKIE_SESSION_KEY = "session_id";

    public static final String SESSION_PREFIX = "comics-session:";

    // private static final RedisClient redisClient = RedisClient.create(
    // RedisURI.Builder.redis(System.getenv("REDIS_URL"))
    // .withAuthentication(System.getenv("REDIS_USER"),
    // System.getenv("REDIS_PASSWORD"))
    // .build());

    public static final RedisURI uri = RedisURI.Builder
            .redis(Objects.requireNonNull(System.getenv("REDIS_HOST"), "REDIS_HOST not set"))
            .withPort(6379)
            .withAuthentication(
                    Objects.requireNonNull(System.getenv("REDIS_USER"), "REDIS_USER not set"),
                    Objects.requireNonNull(System.getenv("REDIS_PASSWORD"), "REDIS_PASSWORD not set").toCharArray())
            .build();

    private static final RedisClient redisClient = RedisClient.create(uri);

    private static final RedisCommands<String, String> redis = redisClient.connect().sync();

    private static final int TTL_SECONDS = 30 * 60; // 30 minutes sliding session

    private SessionStore() {
    }

    // Create a random key for the session
    public static String createSessionKey() {
        UUID uuid = UUID.randomUUID();
        return SESSION_PREFIX + uuid.toString();
    }

    // Save a session
    public static void save(String token, Integer userId, Role role) {
        String value = userId + ":" + role.name();
        redis.setex(token, TTL_SECONDS, value);
    }

    // Find a session
    public static Session find(String token) {
        String value = redis.get(token);
        if (value == null) {
            return null;
        }

        String[] parts = value.split(":");
        if (parts.length != 2) {
            return null;
        }

        return new Session(parts[0], Role.valueOf(parts[1]));
    }

    // Refresh TTL
    public static void refresh(String token) {
        redis.expire(token, TTL_SECONDS);
    }

    // Delete session (logout)
    public static void delete(String token) {
        redis.del(token);
    }
}
