package dev.stuten.vps.web;

// Stable, machine-readable error codes sent to the client.
// The frontend translates them (i18n key "apierror.<code>").
// Codes are a contract with the frontend : never rename one, add a new one instead.
public enum ErrorCode {
    // Generic
    INVALID_REQUEST("generic.invalid_request"),
    NOT_FOUND("generic.not_found"),
    MISSING_ID("generic.missing_id"),
    MISSING_QUERY("generic.missing_query"),
    INVALID_PAGINATION("generic.invalid_pagination"),
    INTERNAL("generic.internal"),

    // Auth
    NOT_AUTHENTICATED("auth.not_authenticated"),
    INVALID_SESSION("auth.invalid_session"),
    INVALID_CREDENTIALS("auth.invalid_credentials"),
    USER_DELETED("auth.user_deleted"),
    FORBIDDEN("auth.forbidden"),

    // User
    USER_NOT_FOUND("user.not_found"),
    USER_NOT_CREATED("user.not_created"),
    USER_NOT_UPDATED("user.not_updated"),
    USER_NOT_DELETED("user.not_deleted"),
    USER_NOT_RECYCLED("user.not_recycled"),
    USERNAME_REQUIRED("user.username_required"),
    EMAIL_REQUIRED("user.email_required"),
    EMAIL_TAKEN("user.email_taken"),
    PASSWORD_TOO_SHORT("user.password_too_short"),
    WRONG_PASSWORD("user.wrong_password"),

    // Entities
    BOOK_NOT_FOUND("book.not_found"),
    EDITION_NOT_FOUND("edition.not_found"),
    ISSUE_NOT_FOUND("issue.not_found"),
    ISSUESERIE_NOT_FOUND("issueserie.not_found"),
    PUBLISHER_NOT_FOUND("publisher.not_found"),
    SERIE_NOT_FOUND("serie.not_found"),

    // Collection (owned editions)
    OEDITION_NOT_FOUND("oedition.not_found"),
    OEDITION_NOT_CREATED("oedition.not_created"),
    OEDITION_NOT_UPDATED("oedition.not_updated"),
    OEDITION_NOT_REMOVED("oedition.not_removed"),

    // Contributions
    CONTRIBUTION_NOT_FOUND("contribution.not_found"),
    CONTRIBUTION_NOT_UPDATED("contribution.not_updated"),
    CONTRIBUTION_NOT_APPLIED("contribution.not_applied"),
    CONTRIBUTION_SAME_STATUS("contribution.same_status"),
    CONTRIBUTION_ALREADY_CLOSED("contribution.already_closed"),

    // Contribution bundles
    BUNDLE_NOT_FOUND("bundle.not_found"),
    BUNDLE_EMPTY("bundle.empty"),
    BUNDLE_NOT_CREATED("bundle.not_created"),
    BUNDLE_NOT_UPDATED("bundle.not_updated"),
    BUNDLE_STATUS_NOT_UPDATED("bundle.status_not_updated");

    private final String code;

    ErrorCode(String code) {
        this.code = code;
    }

    public String code() {
        return code;
    }
}
