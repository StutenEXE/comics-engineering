package dev.stuten.vps.web.routers.utils;

public class APIPathBuilder {

    private static final String GENERIC_STUB = "/api/comics";
    
    private static final String PUBLIC_STUB =  GENERIC_STUB + "/pub";
    private static final String PRIVATE_STUB =  GENERIC_STUB + "/prv";
    private static final String ADMIN_STUB =  GENERIC_STUB + "/adm";

    public static String getPublicGenericPath() {
        return ADMIN_STUB + "/*";
    }
    public static String getPrivateGenericPath() {
        return ADMIN_STUB + "/*";
    }
    public static String getAdminGenericPath() {
        return ADMIN_STUB + "/*";
    }

    public static String buildPublicPath(String uri) {
        return PUBLIC_STUB + uri;
    }

    public static String buildPrivatePath(String uri) {
        return PRIVATE_STUB + uri;
    }

    public static String buildAdminPath(String uri) {
        return ADMIN_STUB + uri;
    }

}
