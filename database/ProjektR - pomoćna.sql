CREATE TABLE accommodation (
    accommodationid varchar NOT NULL,
    name varchar NOT NULL,
    numofrooms integer,
    capacity integer,
    numofbeds integer,
    numofbathrooms integer,
    accrating varchar DEFAULT 0,
    hostid integer
);

CREATE TABLE host (
    hostid varchar NOT NULL,
    hostname varchar NOT NULL,
    hostsurname varchar DEFAULT ''::text,
    hostrating varchar DEFAULT 0
);

CREATE TABLE location (
    locationid varchar NOT NULL,
    geolength numeric,
    geowidth numeric,
    accommodationid integer
);