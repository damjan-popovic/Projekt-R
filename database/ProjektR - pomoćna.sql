CREATE TABLE host (
    hostid varchar NOT NULL,
    hostname varchar NOT NULL,
    hostsurname varchar DEFAULT ''::text,
    hostrating varchar DEFAULT 0,
    PRIMARY KEY(hostid)
);

CREATE TABLE accommodation (
    accommodationid varchar NOT NULL,
    name varchar NOT NULL,
    price varchar,
    numofrooms integer,
    capacity integer,
    numofbeds integer,
    numofbathrooms integer,
    accrating varchar DEFAULT 0,
    hostid varchar,
    PRIMARY KEY(accommodationid),
    FOREIGN KEY(hostid) REFERENCES host(hostid)
);

CREATE TABLE location (
    locationid varchar NOT NULL,
    geolength numeric,
    geowidth numeric,
    accommodationid varchar,
    PRIMARY KEY(locationid),
    FOREIGN KEY(accommodationid) REFERENCES accommodation(accommodationid)
);