-- create db status table

CREATE TABLE db_status (
    db_id INTEGER,
    timestamp timestamp, 
    status_int INTEGER default 0
);

-- build index for
CREATE INDEX time_status_int_idx ON db_status (timestamp, status_int);

CREATE TABLE db_config (
    id serial PRIMARY KEY,
    postgres_url VARCHAR (500) UNIQUE NOT NULL
);