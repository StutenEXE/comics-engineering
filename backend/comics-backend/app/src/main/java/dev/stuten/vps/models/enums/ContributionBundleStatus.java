package dev.stuten.vps.models.enums;

/**
 * Status of a contribution bundle
 */
public enum ContributionBundleStatus {
    PENDING("pending"),
    APPROVED("approved"),
    REJECTED("rejected"),
    NEEDS_REVISION("needs_revision");

    private final String value;

    ContributionBundleStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static ContributionBundleStatus fromValue(String value) {
        for (ContributionBundleStatus status : values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown status: " + value);
    }
}