--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accommodation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accommodation (
    accommodationid integer NOT NULL,
    name text NOT NULL,
    numofrooms integer,
    capacity integer,
    numofbeds integer,
    numofbathrooms integer,
    accrating numeric DEFAULT 0,
    hostid integer
);


ALTER TABLE public.accommodation OWNER TO postgres;

--
-- Name: accommodation_accommodationid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.accommodation_accommodationid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.accommodation_accommodationid_seq OWNER TO postgres;

--
-- Name: accommodation_accommodationid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.accommodation_accommodationid_seq OWNED BY public.accommodation.accommodationid;


--
-- Name: host; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.host (
    hostid integer NOT NULL,
    hostname text NOT NULL,
    hostsurname text DEFAULT ''::text,
    hostrating numeric DEFAULT 0
);


ALTER TABLE public.host OWNER TO postgres;

--
-- Name: host_hostid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.host_hostid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.host_hostid_seq OWNER TO postgres;

--
-- Name: host_hostid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.host_hostid_seq OWNED BY public.host.hostid;


--
-- Name: location; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.location (
    locationid integer NOT NULL,
    geolength numeric,
    geowidth numeric,
    accommodationid integer
);


ALTER TABLE public.location OWNER TO postgres;

--
-- Name: location_locationid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.location_locationid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.location_locationid_seq OWNER TO postgres;

--
-- Name: location_locationid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.location_locationid_seq OWNED BY public.location.locationid;


--
-- Name: accommodation accommodationid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accommodation ALTER COLUMN accommodationid SET DEFAULT nextval('public.accommodation_accommodationid_seq'::regclass);


--
-- Name: host hostid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.host ALTER COLUMN hostid SET DEFAULT nextval('public.host_hostid_seq'::regclass);


--
-- Name: location locationid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location ALTER COLUMN locationid SET DEFAULT nextval('public.location_locationid_seq'::regclass);


--
-- PostgreSQL database dump complete
--

