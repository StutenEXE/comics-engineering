package dev.stuten.vps.models.enums;

/**
 * Action being performed on an entity
 */
public enum ContributionAction {
    CREATE("create"),
    UPDATE("update"),
    DELETE("delete");

    private final String value;

    ContributionAction(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static ContributionAction fromValue(String value) {
        for (ContributionAction action : values()) {
            if (action.value.equalsIgnoreCase(value)) {
                return action;
            }
        }
        throw new IllegalArgumentException("Unknown action: " + value);
    }
}