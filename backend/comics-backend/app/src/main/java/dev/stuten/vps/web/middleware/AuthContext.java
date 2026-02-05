package dev.stuten.vps.web.middleware;

public record AuthContext(
    String userId,
    Role role
) {}
