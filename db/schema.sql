-- Schema generated from db/mcd.puml (and manually edited)

-- Users
CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
	username TEXT NOT NULL,
	email TEXT NOT NULL UNIQUE,
	password TEXT NOT NULL,
	is_admin BOOLEAN DEFAULT FALSE NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- IssueSeries
CREATE TABLE IF NOT EXISTS issue_series (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	"desc" TEXT,
	vo_start DATE NOT NULL,
	vo_end DATE,
	added_by INT REFERENCES users(id) ON DELETE SET NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Issues
CREATE TABLE IF NOT EXISTS issues (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	number INTEGER,
	cover_date DATE,
	parution_date DATE,
	series_id INT REFERENCES issue_series(id) ON DELETE SET NULL,
	added_by INT REFERENCES users(id) ON DELETE SET NULL,
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
	nvolumes SMALLINT,
	vo_start DATE NOT NULL,
	vo_end DATE,
	added_by INT REFERENCES users(id) ON DELETE SET NULL,
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
	img_url TEXT,
	series_id INT REFERENCES series(id) ON DELETE SET NULL,
	added_by INT REFERENCES users(id) ON DELETE SET null,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Editions
CREATE TABLE IF NOT EXISTS editions (
	id SERIAL PRIMARY KEY,
	publisher_id INT REFERENCES publishers(id) ON DELETE SET NULL,
	book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
	isbn VARCHAR(20),
	ean VARCHAR(20),
	price REAL,
	url TEXT,
	img_url TEXT,
	cover_type TEXT,
	parution_date DATE,
	added_by INT REFERENCES users(id) ON DELETE SET NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Edition ownership (not composed primary key if edition is deleted)
CREATE TABLE IF NOT EXISTS edition_ownership (
	id SERIAL PRIMARY KEY,
	user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	edition_id INT NOT NULL REFERENCES editions(id) ON DELETE SET NULL,
	date TIMESTAMPTZ NOT NULL DEFAULT now(),
	read BOOLEAN NOT NULL DEFAULT FALSE,
	date_read DATE,
	gift BOOLEAN NOT NULL DEFAULT FALSE,
	signed BOOLEAN NOT NULL DEFAULT FALSE,
	purchase_price NUMERIC(10,2),
	fees NUMERIC(10,2),
	retail_price NUMERIC(10,2),
	note TEXT
);

-- Wishlist (composed primary key)
CREATE TABLE IF NOT EXISTS wishlist (
	user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
	PRIMARY KEY (user_id, book_id)
);

-- Books-Issues
CREATE TABLE IF NOT EXISTS books_issues (
	book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
	issue_id INT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
	PRIMARY KEY (book_id, issue_id)
);

-- Submission Types
CREATE TYPE submission_type_enum AS ENUM ('book', 'serie', 'edition', 'issue', 'issueserie', 'publisher', 'link_book_issue');
-- Submission Action
CREATE TYPE submission_action_enum AS ENUM ('create', 'update', 'delete');

-- User Submissions
CREATE TABLE IF NOT EXISTS user_submissions (
	id SERIAL PRIMARY KEY,
	user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	related_to INT REFERENCES user_submissions(id) ON DELETE SET NULL,
	submission_type submission_type_enum NOT NULL,
	submission_action submission_action_enum  NOT NULL,
	submission_data JSONB NOT NULL,
	note TEXT,
	validated BOOLEAN,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);