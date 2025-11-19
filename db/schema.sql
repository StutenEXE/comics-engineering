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
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Books (relational)
CREATE TABLE IF NOT EXISTS books (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	"desc" TEXT,
	number INTEGER,
	series_id BIGINT REFERENCES series(id) ON DELETE SET NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Editions
CREATE TABLE IF NOT EXISTS editions (
	id SERIAL PRIMARY KEY,
	publisher_id BIGINT REFERENCES publishers(id) ON DELETE SET NULL,
	book_id BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
	added_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
	isbn VARCHAR(20),
	ean VARCHAR(20),
	url TEXT,
	img_url TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Book ownership (composed primary key)
CREATE TABLE IF NOT EXISTS book_ownership (
	user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
	read BOOLEAN NOT NULL DEFAULT FALSE,
	gift BOOLEAN NOT NULL DEFAULT FALSE,
	buy_price NUMERIC(10,2),
	date TIMESTAMPTZ,
	PRIMARY KEY (user_id, book_id)
);

-- Wishlist (composed primary key)
CREATE TABLE IF NOT EXISTS wishlist (
	user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
	PRIMARY KEY (user_id, book_id)
);