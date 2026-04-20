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
	start_date DATE NOT NULL,
	end_date DATE,
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
	start_date DATE NOT NULL,
	end_date DATE,
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
	npages INT,
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


-----------------------------------
------- User Contributions --------
-----------------------------------

-- Contribution Bundle Status
CREATE TYPE contribution_bundle_status_enum AS ENUM ('pending', 'approved', 'rejected', 'needs_revision');
-- Contribution Types
CREATE TYPE contribution_type_enum AS ENUM ('book', 'serie', 'edition', 'issue', 'issueserie', 'publisher', 'link_book_issue');
-- Contribution Action
CREATE TYPE contribution_action_enum AS ENUM ('create', 'update', 'delete');

-- Contribution Status
CREATE TYPE contribution_status_enum AS ENUM ('pending', 'approved', 'rejected', 'skipped', 'needs_revision');

CREATE TABLE IF NOT EXISTS contribution_bundles (
	id SERIAL PRIMARY KEY,
	submitter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	status contribution_bundle_status_enum NOT NULL DEFAULT 'pending',
	note TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	modified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contributions (
	id SERIAL PRIMARY KEY,
	bundle_id INT NOT NULL REFERENCES contribution_bundles(id) ON DELETE CASCADE,
	local_ref TEXT, -- Reference to the local entity (e.g., book name, serie name, etc.) if needed
	entity_type contribution_type_enum NOT NULL,
	action contribution_action_enum NOT NULL,
	entity_id INT, -- null for create actions
	proposed_data JSONB NOT NULL, 
	entity_snapshot JSONB, -- JSON snapshot of the entity before modification (null for create actions)
	status contribution_status_enum NOT NULL DEFAULT 'pending',
	resolved_entity_id INT -- new entity ID after approval
);

CREATE TABLE IF NOT EXISTS contribution_reviews (
	id SERIAL PRIMARY KEY,
	contribution_id INT NOT NULL REFERENCES contributions(id) ON DELETE CASCADE,
	reviewer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	comment TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);