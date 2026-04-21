package dev.stuten.vps.models.enums;

/**
 * Status of an individual contribution
 */
public enum ContributionStatus {
    PENDING("pending"),
    APPROVED("approved"),
    REJECTED("rejected"),
    SKIPPED("skipped"),
    NEEDS_REVISION("needs_revision");

    private final String value;

    ContributionStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static ContributionStatus fromValue(String value) {
        for (ContributionStatus status : values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown status: " + value);
    }
}