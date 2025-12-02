-- Schema generated from db/mcd.puml (and manually edited)

-- Users
CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
	username TEXT NOT NULL,
	email TEXT NOT NULL UNIQUE,
	password TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- IssueSeries
CREATE TABLE IF NOT EXISTS issue_series (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	"desc" TEXT,
	vo_start TIMESTAMPTZ NOT NULL,
	vo_end TIMESTAMPTZ,
	added_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Issues
CREATE TABLE IF NOT EXISTS issues (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	number INTEGER,
	parution_date TIMESTAMPTZ,
	series_id BIGINT REFERENCES issue_series(id) ON DELETE SET NULL,
	added_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Publishers
CREATE TABLE IF NOT EXISTS publishers (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL UNIQUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Serie
CREATE TABLE IF NOT EXISTS series (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	ongoing BOOLEAN NOT NULL DEFAULT FALSE,
	oneshot BOOLEAN NOT NULL DEFAULT FALSE,
	nvolumes TEXT,
	vo_start TIMESTAMPTZ,
	vo_end TIMESTAMPTZ,
	added_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Books (relational)
CREATE TABLE IF NOT EXISTS books (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	"desc" TEXT,
	number INTEGER,
	vo_content TEXT,
	series_id BIGINT REFERENCES series(id) ON DELETE SET NULL,
	added_by BIGINT REFERENCES users(id) ON DELETE SET null,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Editions
CREATE TABLE IF NOT EXISTS editions (
	id SERIAL PRIMARY KEY,
	publisher_id BIGINT REFERENCES publishers(id) ON DELETE SET NULL,
	book_id BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
	isbn VARCHAR(20),
	ean VARCHAR(20),
	url TEXT,
	img_url TEXT,
	parution_date TIMESTAMPTZ,
	added_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Edition ownership (not composed primary key if edition is deleted)
CREATE TABLE IF NOT EXISTS edition_ownership (
	id SERIAL PRIMARY KEY,
	user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	edition_id BIGINT NOT NULL REFERENCES editions(id) ON DELETE SET NULL,
	read BOOLEAN NOT NULL DEFAULT FALSE,
	gift BOOLEAN NOT NULL DEFAULT FALSE,
	buy_price NUMERIC(10,2),
	date TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Wishlist (composed primary key)
CREATE TABLE IF NOT EXISTS wishlist (
	user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	book_id BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
	PRIMARY KEY (user_id, book_id)
);

-- Books-Issues
CREATE TABLE IF NOT EXISTS books_issues (
	book_id BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
	issue_id BIGINT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
	PRIMARY KEY (book_id, issue_id)
);