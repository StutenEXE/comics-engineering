package dev.stuten.vps.models.enums;

/**
 * Type of entity being contributed
 */
public enum ContributionEntityType {
    BOOK("book"),
    SERIE("serie"),
    EDITION("edition"),
    ISSUE("issue"),
    ISSUESERIE("issueserie"),
    PUBLISHER("publisher"),
    LINK_BOOK_ISSUE("link_book_issue");

    private final String value;

    ContributionEntityType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static ContributionEntityType fromValue(String value) {
        for (ContributionEntityType type : values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown entity type: " + value);
    }
}