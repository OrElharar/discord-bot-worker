

CREATE TABLE hyperactive_roles (
    id          TEXT PRIMARY KEY,
    level       INT NOT NULL
);
insert into hyperactive_roles (id, level) VALUES ('supervisor', 4), ('instructor', 3), ('teaching-assistant', 2), ('student', 1);

CREATE TABLE hyperactive_users (
 id                           TEXT PRIMARY KEY CHECK (id ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'),
 name                         TEXT NOT NULL,
 password                     TEXT NOT NULL,
 role_id                      TEXT,
 createdAt                    timestamp NOT NULL DEFAULT NOW(),
 FOREIGN KEY (role_id) REFERENCES hyperactive_roles (id)  ON DELETE NO ACTION
);
