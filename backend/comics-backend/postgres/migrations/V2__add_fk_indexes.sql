-- V2 : Indexes on the foreign keys used by joins, filters and cascading deletes.
-- Postgres does not index foreign keys automatically.
-- Users are soft-deleted (is_deleted), so user_id / added_by are only indexed where they are queried.
--
-- Not CONCURRENTLY : tables are small so the write lock lasts milliseconds, and running in a
-- transaction makes the migration all-or-nothing.

-- Collections & stats (WHERE user_id = ?)
CREATE INDEX IF NOT EXISTS edition_ownership_user_id_idx ON edition_ownership (user_id);
-- "Do I own this edition", edition deletion
CREATE INDEX IF NOT EXISTS edition_ownership_edition_id_idx ON edition_ownership (edition_id);

-- Editions of a book (book page multiset, issue counts), book deletion cascade
CREATE INDEX IF NOT EXISTS editions_book_id_idx ON editions (book_id);
-- Editions of a publisher, publisher deletion
CREATE INDEX IF NOT EXISTS editions_publisher_id_idx ON editions (publisher_id);

-- Books of a serie, serie deletion
CREATE INDEX IF NOT EXISTS books_series_id_idx ON books (series_id);
-- Issues of an issue serie, issue serie deletion
CREATE INDEX IF NOT EXISTS issues_series_id_idx ON issues (series_id);

-- Books of an issue (lookups by book_id are covered by the (book_id, issue_id) primary key)
CREATE INDEX IF NOT EXISTS books_issues_issue_id_idx ON books_issues (issue_id);

-- Contributions of a bundle, bundle deletion cascade
CREATE INDEX IF NOT EXISTS contributions_bundle_id_idx ON contributions (bundle_id);
-- Bundles of a submitter
CREATE INDEX IF NOT EXISTS contribution_bundles_submitter_id_idx ON contribution_bundles (submitter_id);
-- Moderation queue : only pending contributions are looked up often
CREATE INDEX IF NOT EXISTS contributions_pending_idx ON contributions (id) WHERE status = 'pending';
