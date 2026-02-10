package dev.stuten.vps.web.middleware;

import java.util.UUID;

import io.lettuce.core.RedisClient;
import io.lettuce.core.api.sync.RedisCommands;

public final class SessionStore {

    public static final String SESSION_PREFIX = "comics-session:";

    private static final RedisClient redisClient = RedisClient.create(System.getenv("COMICS_REDIS_URL"));
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
        redis.setex(SESSION_PREFIX + token, TTL_SECONDS, value);
    }

    // Find a session
    public static Session find(String token) {
        String value = redis.get(SESSION_PREFIX + token);
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
        redis.expire(SESSION_PREFIX + token, TTL_SECONDS);
    }

    // Delete session (logout)
    public static void delete(String token) {
        redis.del(SESSION_PREFIX + token);
    }
}
