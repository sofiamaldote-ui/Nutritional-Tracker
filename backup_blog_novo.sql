--
-- PostgreSQL database dump
--

\restrict NPsbwb1hOAZf8Cj8VfXnSz32WBQFJjk9E8x50hS6SalGZahPIHC2yUYEf9ST5hg

-- Dumped from database version 16.15 (ef25dd3)
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: _system; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

CREATE SCHEMA _system;


ALTER SCHEMA _system OWNER TO neondb_owner;

--
-- Name: attachment_section; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.attachment_section AS ENUM (
    'exames',
    'cardapios'
);


ALTER TYPE public.attachment_section OWNER TO neondb_owner;

--
-- Name: category; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.category AS ENUM (
    'ebook',
    'receita',
    'video',
    'artigo'
);


ALTER TYPE public.category OWNER TO neondb_owner;

--
-- Name: consultation_type; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.consultation_type AS ENUM (
    'avaliacao_inicial',
    'cardapio',
    'reavaliacao'
);


ALTER TYPE public.consultation_type OWNER TO neondb_owner;

--
-- Name: publication_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.publication_status AS ENUM (
    'rascunho',
    'publicado'
);


ALTER TYPE public.publication_status OWNER TO neondb_owner;

--
-- Name: role; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.role AS ENUM (
    'nutricionista',
    'paciente'
);


ALTER TYPE public.role OWNER TO neondb_owner;

--
-- Name: sex; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.sex AS ENUM (
    'masculino',
    'feminino',
    'outro'
);


ALTER TYPE public.sex OWNER TO neondb_owner;

--
-- Name: visibility; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.visibility AS ENUM (
    'geral',
    'grupos',
    'pacientes'
);


ALTER TYPE public.visibility OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: replit_database_migrations_v1; Type: TABLE; Schema: _system; Owner: neondb_owner
--

CREATE TABLE _system.replit_database_migrations_v1 (
    id bigint NOT NULL,
    build_id text NOT NULL,
    deployment_id text NOT NULL,
    statement_count bigint NOT NULL,
    applied_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE _system.replit_database_migrations_v1 OWNER TO neondb_owner;

--
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE; Schema: _system; Owner: neondb_owner
--

CREATE SEQUENCE _system.replit_database_migrations_v1_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE _system.replit_database_migrations_v1_id_seq OWNER TO neondb_owner;

--
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE OWNED BY; Schema: _system; Owner: neondb_owner
--

ALTER SEQUENCE _system.replit_database_migrations_v1_id_seq OWNED BY _system.replit_database_migrations_v1.id;


--
-- Name: consultation_attachments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.consultation_attachments (
    id integer NOT NULL,
    consultation_id integer NOT NULL,
    section public.attachment_section NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    mime_type text,
    size_bytes integer,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.consultation_attachments OWNER TO neondb_owner;

--
-- Name: consultation_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.consultation_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.consultation_attachments_id_seq OWNER TO neondb_owner;

--
-- Name: consultation_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.consultation_attachments_id_seq OWNED BY public.consultation_attachments.id;


--
-- Name: consultations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.consultations (
    id integer NOT NULL,
    patient_id integer NOT NULL,
    type public.consultation_type NOT NULL,
    date text NOT NULL,
    weight real,
    height real,
    bmi real,
    waist_cm real,
    hip_cm real,
    abdomen_cm real,
    arm_cm real,
    thigh_cm real,
    calf_cm real,
    bioimpedance_pdf_path text,
    notes text,
    objective text,
    vet_kcal real,
    menu_pdf_path text,
    restrictions text,
    additional_guidance text,
    baseline_consultation_id integer,
    evolution_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.consultations OWNER TO neondb_owner;

--
-- Name: consultations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.consultations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.consultations_id_seq OWNER TO neondb_owner;

--
-- Name: consultations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.consultations_id_seq OWNED BY public.consultations.id;


--
-- Name: groups; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.groups (
    id integer NOT NULL,
    name text NOT NULL,
    color text DEFAULT '#4CAF50'::text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.groups OWNER TO neondb_owner;

--
-- Name: groups_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.groups_id_seq OWNER TO neondb_owner;

--
-- Name: groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.groups_id_seq OWNED BY public.groups.id;


--
-- Name: patient_groups; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.patient_groups (
    id integer NOT NULL,
    patient_id integer NOT NULL,
    group_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.patient_groups OWNER TO neondb_owner;

--
-- Name: patient_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.patient_groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patient_groups_id_seq OWNER TO neondb_owner;

--
-- Name: patient_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.patient_groups_id_seq OWNED BY public.patient_groups.id;


--
-- Name: patient_publication_views; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.patient_publication_views (
    id integer NOT NULL,
    patient_id integer NOT NULL,
    publication_id integer NOT NULL,
    viewed_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.patient_publication_views OWNER TO neondb_owner;

--
-- Name: patient_publication_views_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.patient_publication_views_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patient_publication_views_id_seq OWNER TO neondb_owner;

--
-- Name: patient_publication_views_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.patient_publication_views_id_seq OWNED BY public.patient_publication_views.id;


--
-- Name: patients; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.patients (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    birth_date text,
    sex public.sex,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.patients OWNER TO neondb_owner;

--
-- Name: patients_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.patients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patients_id_seq OWNER TO neondb_owner;

--
-- Name: patients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.patients_id_seq OWNED BY public.patients.id;


--
-- Name: publication_groups; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.publication_groups (
    id integer NOT NULL,
    publication_id integer NOT NULL,
    group_id integer NOT NULL
);


ALTER TABLE public.publication_groups OWNER TO neondb_owner;

--
-- Name: publication_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.publication_groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.publication_groups_id_seq OWNER TO neondb_owner;

--
-- Name: publication_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.publication_groups_id_seq OWNED BY public.publication_groups.id;


--
-- Name: publication_patients; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.publication_patients (
    id integer NOT NULL,
    publication_id integer NOT NULL,
    patient_id integer NOT NULL
);


ALTER TABLE public.publication_patients OWNER TO neondb_owner;

--
-- Name: publication_patients_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.publication_patients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.publication_patients_id_seq OWNER TO neondb_owner;

--
-- Name: publication_patients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.publication_patients_id_seq OWNED BY public.publication_patients.id;


--
-- Name: publications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.publications (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    category public.category NOT NULL,
    status public.publication_status DEFAULT 'rascunho'::public.publication_status NOT NULL,
    visibility public.visibility DEFAULT 'geral'::public.visibility NOT NULL,
    video_url text,
    pdf_path text,
    image_path text,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    link_url text
);


ALTER TABLE public.publications OWNER TO neondb_owner;

--
-- Name: publications_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.publications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.publications_id_seq OWNER TO neondb_owner;

--
-- Name: publications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.publications_id_seq OWNED BY public.publications.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    password_hash text NOT NULL,
    role public.role DEFAULT 'paciente'::public.role NOT NULL,
    patient_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: replit_database_migrations_v1 id; Type: DEFAULT; Schema: _system; Owner: neondb_owner
--

ALTER TABLE ONLY _system.replit_database_migrations_v1 ALTER COLUMN id SET DEFAULT nextval('_system.replit_database_migrations_v1_id_seq'::regclass);


--
-- Name: consultation_attachments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.consultation_attachments ALTER COLUMN id SET DEFAULT nextval('public.consultation_attachments_id_seq'::regclass);


--
-- Name: consultations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.consultations ALTER COLUMN id SET DEFAULT nextval('public.consultations_id_seq'::regclass);


--
-- Name: groups id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.groups ALTER COLUMN id SET DEFAULT nextval('public.groups_id_seq'::regclass);


--
-- Name: patient_groups id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.patient_groups ALTER COLUMN id SET DEFAULT nextval('public.patient_groups_id_seq'::regclass);


--
-- Name: patient_publication_views id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.patient_publication_views ALTER COLUMN id SET DEFAULT nextval('public.patient_publication_views_id_seq'::regclass);


--
-- Name: patients id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.patients ALTER COLUMN id SET DEFAULT nextval('public.patients_id_seq'::regclass);


--
-- Name: publication_groups id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.publication_groups ALTER COLUMN id SET DEFAULT nextval('public.publication_groups_id_seq'::regclass);


--
-- Name: publication_patients id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.publication_patients ALTER COLUMN id SET DEFAULT nextval('public.publication_patients_id_seq'::regclass);


--
-- Name: publications id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.publications ALTER COLUMN id SET DEFAULT nextval('public.publications_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: replit_database_migrations_v1; Type: TABLE DATA; Schema: _system; Owner: neondb_owner
--

INSERT INTO _system.replit_database_migrations_v1 (id, build_id, deployment_id, statement_count, applied_at) VALUES (1, 'ea7dd3e3-761c-43f8-bf7b-6a34bfa39041', 'b92bdd1e-405e-4abf-bb8b-d59165ad79f5', 2, '2026-07-20 20:21:21.331242+00');
INSERT INTO _system.replit_database_migrations_v1 (id, build_id, deployment_id, statement_count, applied_at) VALUES (2, '9c4da8fa-ea90-4c92-8520-9d46481933c3', 'b92bdd1e-405e-4abf-bb8b-d59165ad79f5', 2, '2026-07-20 20:59:32.156258+00');
INSERT INTO _system.replit_database_migrations_v1 (id, build_id, deployment_id, statement_count, applied_at) VALUES (3, 'a9f7acbe-531d-40ab-b21e-dbdd7fd0bdb0', 'b92bdd1e-405e-4abf-bb8b-d59165ad79f5', 2, '2026-07-20 21:03:01.589294+00');
INSERT INTO _system.replit_database_migrations_v1 (id, build_id, deployment_id, statement_count, applied_at) VALUES (4, '445b1077-2196-4e0a-8eef-7e72ce0b4f2b', 'b92bdd1e-405e-4abf-bb8b-d59165ad79f5', 2, '2026-07-21 00:14:17.99612+00');


--
-- Data for Name: consultation_attachments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.consultation_attachments (id, consultation_id, section, file_name, file_path, mime_type, size_bytes, uploaded_at) VALUES (1, 5, 'exames', 'bioimpedancia.pdf', '/objects/uploads/aee9ebe4-a0c2-40f3-8d51-ecee6506d7b3', 'application/pdf', NULL, '2026-07-21 00:14:40.207439+00');
INSERT INTO public.consultation_attachments (id, consultation_id, section, file_name, file_path, mime_type, size_bytes, uploaded_at) VALUES (2, 7, 'exames', 'Lancheira_20260629_104002_0000.pdf', '/objects/uploads/46deefd3-0529-42db-a582-5c3716192de9', 'application/pdf', 264721, '2026-07-21 00:15:18.078781+00');


--
-- Data for Name: consultations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (1, 1, 'avaliacao_inicial', '2026-05-15', 78.5, 165, 28.8, 88, 100, 90, 32, 56, 37, NULL, 'Paciente relata sedentarismo. Objetivo: perda de 10kg em 6 meses.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-15 18:28:22.946686+00', '2026-07-15 18:28:22.946686+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (2, 1, 'cardapio', '2026-05-15', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Déficit calórico moderado para emagrecimento saudável', 1600, NULL, 'Intolerância à lactose', 'Beber 2L de água por dia. Praticar caminhada 30min/dia.', NULL, NULL, '2026-07-15 18:28:22.95518+00', '2026-07-15 18:28:22.95518+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (3, 1, 'reavaliacao', '2026-06-15', 75.2, 165, 27.6, 85, 97, 87, 31, 54, 36, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'Excelente adesão ao plano. Paciente perdeu 3.3kg no primeiro mês.', '2026-07-15 18:28:22.960593+00', '2026-07-15 18:28:22.960593+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (4, 2, 'avaliacao_inicial', '2026-06-15', 72, 178, 22.7, 78, 92, 80, 34, 52, 36, NULL, 'Atleta amador. Objetivo: ganho de 5kg de massa muscular.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-15 18:28:22.966588+00', '2026-07-15 18:28:22.966588+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (5, 4, 'reavaliacao', '2026-07-16', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/objects/uploads/aee9ebe4-a0c2-40f3-8d51-ecee6506d7b3', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-17 01:45:46.278073+00', '2026-07-17 01:46:01.409+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (19, 26, 'avaliacao_inicial', '2026-07-29', 68.6, 164.5, 25.35, 76, 96.5, 87, 30, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 33,8
% Musculo - 29,1
% Gordura visceral - 8', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 11:41:18.202744+00', '2026-07-29 11:41:57.633+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (23, 30, 'avaliacao_inicial', '2026-07-29', 104.2, 190, 28.86, 97.5, 110, 99, 39, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 21
% Musculo - 37,1
% Gordura visceral - 10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 20:41:51.739038+00', '2026-07-29 20:42:44.666+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (6, 6, 'avaliacao_inicial', '2026-02-05', 51.9, 156, 21.33, 64, 88, 68, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-20 23:05:11.443708+00', '2026-07-20 23:05:41.273+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (11, 18, 'avaliacao_inicial', '2026-07-29', 59.6, 155, 24.81, 73, 100, 84.5, 28, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 36,1
% Musculo - 27,1
% Gordura visceral - 6', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 09:38:18.382355+00', '2026-07-29 09:39:48.527+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (29, 37, 'avaliacao_inicial', '2026-07-29', 83.1, 175, 27.13, 95, 119, 104, 35, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 42,3
% Musculo - 25,8
% Gordura visceral - 7', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 22:44:19.150908+00', '2026-07-29 22:45:01.062+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (9, 15, 'avaliacao_inicial', '2026-07-29', 58.1, 162, 22.14, 72, 97, 80, 26.5, NULL, NULL, NULL, 'Bioimpedancia 
% Gordura 27,3
%Musculo- 31,3', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 09:32:31.938613+00', '2026-07-29 09:33:57.937+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (7, 10, 'reavaliacao', '2026-07-18', 93.5, 177, 29.84, 96, 101.9, NULL, 32, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', '2026-07-20 23:07:34.684105+00', '2026-07-20 23:14:07.526+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (14, 21, 'avaliacao_inicial', '2026-07-29', 77.8, 170, 26.92, 85, 110, 90, 32, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 38,1
% Musculo - 26,9
% Gordura visceral - 7', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 10:10:43.978728+00', '2026-07-29 10:11:20.629+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (39, 47, 'avaliacao_inicial', '2026-07-29', 95.2, 190, 26.37, 90, 108, 93, 33.5, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 13,1
% Musculo - 41,2
% Gordura visceral - 7', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 23:30:05.407778+00', '2026-07-29 23:31:07.773+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (17, 24, 'avaliacao_inicial', '2026-07-29', 78.9, 180, 24.35, 81, 88.5, 83.5, 33, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 14,8
% Musculo - 41,4
% Gordura visceral - 7', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 11:25:25.593524+00', '2026-07-29 11:26:00.851+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (12, 19, 'avaliacao_inicial', '2026-07-29', 59.3, 172, 20.04, 72, 102, 85, 30, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 39,1
% Musculo - 25,9
% Gordura visceral -6', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 10:05:05.055891+00', '2026-07-29 10:05:55.421+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (28, 36, 'avaliacao_inicial', '2026-07-29', 81, 172, 27.38, 99, 102, 92, 32, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 27,1
% Musculo - 34,1
% Gordura visceral - 12', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 22:42:10.120457+00', '2026-07-29 22:42:50.562+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (20, 27, 'avaliacao_inicial', '2026-07-29', 64.4, 168, 22.82, 80, 94.5, 89.5, 30, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 25,4
% Musculo - 32,5
% Gordura visceral - 5 ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 20:33:50.596241+00', '2026-07-29 20:34:53.58+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (37, 45, 'avaliacao_inicial', '2026-07-29', 55.4, 162, 21.11, 76, 89, 78, 23, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 25,9
% Musculo - 31,5
% Gordura visceral - 4', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 23:16:04.733923+00', '2026-07-29 23:16:40.651+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (32, 40, 'avaliacao_inicial', '2026-07-29', 79.3, 157, 32.17, 81, 104, 91, 32, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 35,1
% Musculo - 29,1
% Gordura visceral - 6', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 22:51:24.424638+00', '2026-07-29 22:51:54.113+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (15, 22, 'avaliacao_inicial', '2026-07-29', 55, 155, 22.89, 69, 88, 81, 24.5, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 28,5
% Musculo - 32,6
% Gordura visceral - 3', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 11:20:33.093975+00', '2026-07-29 11:22:06.043+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (10, 17, 'avaliacao_inicial', '2026-07-29', 68, 171, 23.26, 83.5, 92, 88, 25, NULL, NULL, NULL, 'Bioimpedância 
% Gordura -  18,3
%Musculo-  36,9
% Gordura visceral 8', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 09:35:53.859552+00', '2026-07-29 09:37:22.828+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (24, 31, 'avaliacao_inicial', '2026-07-29', 74.4, 171, 25.44, 79, 94, 82, 33, NULL, NULL, NULL, 'Bioimpedância
% Gordura -  21,8
% Musculo - 38,7
% Gordura visceral - 8 ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 20:43:32.849144+00', '2026-07-29 20:44:11.521+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (33, 41, 'avaliacao_inicial', '2026-07-29', 72.4, 177, 23.11, 80, 107, 94, 28, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 40,8
% Musculo - 24,8
% Gordura visceral - 6', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 22:53:08.494562+00', '2026-07-29 22:53:50.321+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (18, 25, 'avaliacao_inicial', '2026-07-29', 71, 170, 24.57, 75, 105, 82, 32, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 33,5
% Musculo - 29,1
% Gordura visceral - ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 11:27:42.227203+00', '2026-07-29 11:28:36.875+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (13, 20, 'avaliacao_inicial', '2026-07-29', 66.6, 167, 23.88, 85, 83, 90, 28.4, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 30,7
% Musculo - 30,5
% Gordura visceral - 5', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 10:07:07.079177+00', '2026-07-29 10:08:53.829+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (34, 42, 'avaliacao_inicial', '2026-07-29', 75.4, 152, 32.64, 90, 107, 94, 32, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 44
% Musculo - 23,8
% Gordura visceral - 9', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 22:54:55.562649+00', '2026-07-29 22:55:21.166+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (27, 35, 'avaliacao_inicial', '2026-07-29', 58.8, 153, 25.12, 73, 99, 87, 25, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 37,2
% Musculo - 26,5
% Gordura visceral - 6', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 22:39:12.99312+00', '2026-07-29 22:40:18.132+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (26, 34, 'avaliacao_inicial', '2026-07-29', 72.4, 158, 29, 88, 100, 96, 32.8, NULL, NULL, NULL, 'Bioimpedância 
% Gordura -  28,2
%Musculo-  27,6
% Gordura visceral - 8 ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 22:36:23.718361+00', '2026-07-29 22:37:49.423+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (21, 28, 'avaliacao_inicial', '2026-07-29', 64, 160, 25, 72, 96, 79.5, 28, NULL, NULL, NULL, 'Bioimpedância
% Gordura -  34,1
% Musculo - 28,9
% Gordura visceral - 5', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 20:36:07.126292+00', '2026-07-29 20:37:37.32+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (16, 23, 'avaliacao_inicial', '2026-07-29', 68.6, 164.5, 25.35, 76, 86.8, 87, 30, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 38,8
% Musculo - 29,1
% Gordura visceral -8', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 11:23:38.346495+00', '2026-07-29 11:24:24.873+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (30, 38, 'avaliacao_inicial', '2026-07-29', 92.2, 169, 32.28, 96, 115, 90, 33, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 47,3
% Musculo - 23
% Gordura visceral - 10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 22:46:24.217414+00', '2026-07-29 22:47:04.717+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (31, 39, 'avaliacao_inicial', '2026-07-29', 74.4, 179, 23.22, 87, 98, 86, 30, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 14,6
% Musculo - 38,8
% Gordura visceral - 6', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 22:49:50.01775+00', '2026-07-29 22:50:29.418+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (25, 33, 'avaliacao_inicial', '2026-07-29', 72.5, 164, 26.96, 81.5, 104, 87, 29.5, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 34,5
% Musculo - 29,4
% Gordura visceral - 6', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 20:46:09.845522+00', '2026-07-29 20:46:46.169+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (36, 44, 'avaliacao_inicial', '2026-07-29', 68.8, 160, 26.87, 86, 102, 88.5, 30, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 41
% Musculo - 25,1
% Gordura visceral - 7', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 22:58:38.520944+00', '2026-07-29 23:14:58.209+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (40, 48, 'avaliacao_inicial', '2026-07-29', 68.2, 165, 25.05, 76, 102, 89, 26.5, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 34,2
% Musculo - 28,8
% Gordura visceral - 5', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 23:31:55.905914+00', '2026-07-29 23:32:37.672+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (38, 46, 'avaliacao_inicial', '2026-07-29', 110, 187, 31.46, 95, 114, 102, 35, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 17,8
% Musculo - 37,9
% Gordura visceral -  12', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 23:26:48.681437+00', '2026-07-29 23:28:54.17+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (8, 14, 'avaliacao_inicial', '2026-07-29', 51.1, 153, 21.83, 78, 95.5, 85, 20.5, NULL, NULL, NULL, 'Bioimpedância 
%Gordura - 37,7
% Músculo - 24,8
% Gordura visceral -  6', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 09:28:57.664112+00', '2026-07-30 16:25:02.221+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (41, 49, 'avaliacao_inicial', '2026-07-30', 69.3, 172, 23.42, 74, 102, 85, 30, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 39,1
%Músculo -25,9
% Visceral -6', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 16:09:01.34831+00', '2026-07-30 16:10:18.728+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (42, 50, 'avaliacao_inicial', '2026-07-30', 51.1, 153, 21.83, 78, 95.5, 83, 26.5, NULL, NULL, NULL, 'Bioimpedância 
%Gordura - 37,7
% Músculo - 24,8
% Gordura visceral -  6', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 16:25:53.193904+00', '2026-07-30 16:27:24.57+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (43, 51, 'avaliacao_inicial', '2026-07-30', 69.3, 172, 23.42, 74, 102, 85, 30, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 39,1
%Músculo -25,9
% Visceral -6', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 16:29:43.65824+00', '2026-07-30 16:30:23.891+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (44, 52, 'avaliacao_inicial', '2026-07-30', 51.1, 153, 21.83, 78, 95.5, 83, 26.4, NULL, NULL, NULL, 'Bioimpedância 
%Gordura - 37,7
% Músculo - 24,8
% Gordura visceral -  6', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 16:34:36.997254+00', '2026-07-30 16:35:47.107+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (22, 29, 'avaliacao_inicial', '2026-07-29', 110.4, 186, 31.91, 102.5, 102, 106, 36, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 34,9
% Músculo - 30,1
% Gordura visceral - 14', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 20:39:07.305943+00', '2026-07-30 16:41:36.856+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (35, 43, 'avaliacao_inicial', '2026-07-29', 65.8, 178, 20.77, 77.5, 102, 87, 35, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 32,1
% Músculo - 28,4
% Gordura visceral - 4', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 22:56:30.620376+00', '2026-07-30 18:30:23.802+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (45, 53, 'avaliacao_inicial', '2026-07-30', 66.6, 167, 23.88, 85, 83, 90, 28.4, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 30,7
% Musculo - 30,5
% Gordura visceral - 5', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 16:38:41.947104+00', '2026-07-30 16:40:51.166+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (46, 54, 'avaliacao_inicial', '2026-07-30', 110.4, 186, 31.91, 102.5, 102, 106, 36, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 34,9
% Músculo - 30,1
% Gordura visceral - 14', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 16:43:15.328369+00', '2026-07-30 16:43:51.468+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (57, 65, 'avaliacao_inicial', '2026-08-12', 63, 162, 24.01, 76, 98, 89, 26, NULL, NULL, NULL, 'Bioimpedância 
%Músculo -26
% Gordura - 36,7
%Visceral - 7', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-12 22:23:47.791499+00', '2026-08-12 22:36:28.403+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (63, 71, 'avaliacao_inicial', '2026-08-13', 81.2, 175, 26.51, 93.5, 100, 94.5, 32, NULL, NULL, NULL, 'Bioimpedância 
%Músculo -34,2
% Gordura - 26
%Visceral - 9', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-13 14:04:39.478303+00', '2026-08-13 14:05:20.101+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (62, 70, 'avaliacao_inicial', '2026-08-13', 66, 162, 25.15, 77, 101, 85, 28, NULL, NULL, NULL, 'Bioimpedância 
%Músculo -25,8
% Gordura - 39
%Visceral - 6', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-13 13:21:33.131434+00', '2026-08-13 21:57:12.178+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (61, 69, 'avaliacao_inicial', '2026-08-12', 114.5, 179, 35.74, 109, 118, 115, 37, NULL, NULL, NULL, 'Bioimpedância 
%Músculo -32,4
% Gordura - 32,4
%Visceral - 16', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-12 22:46:20.480732+00', '2026-08-13 21:57:40.698+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (58, 66, 'avaliacao_inicial', '2026-08-12', 70.4, 150, 31.29, 85, 104, 94.5, 33.5, NULL, NULL, NULL, 'Bioimpedância 
%Músculo -27,7
% Gordura - 39,1
%Visceral - 10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-12 22:40:26.949841+00', '2026-08-12 22:41:40.82+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (47, 55, 'avaliacao_inicial', '2026-07-30', 59.6, 155, 24.81, 73, 100, 84.5, 28, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 36,1
% Musculo - 27,1
% Gordura visceral - 6', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 17:13:19.396006+00', '2026-07-30 17:13:55.799+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (59, 67, 'avaliacao_inicial', '2026-08-12', 66.9, NULL, NULL, 77, 101, 85, 28, NULL, NULL, NULL, 'Bioimpedância 
%Músculo -25,8
% Gordura - 39
%Visceral - 6', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-12 22:42:36.646707+00', '2026-08-12 22:43:18.34+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (56, 63, 'avaliacao_inicial', '2026-08-12', 81.2, 175, 26.51, 93.5, 100, 94.5, 32, NULL, NULL, NULL, 'Bioimpedância 
%Músculo -34,2
% Gordura - 26
%Visceral - 9', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-12 22:21:36.729294+00', '2026-08-12 22:22:41.65+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (55, 64, 'avaliacao_inicial', '2026-08-12', 64.5, 155, 26.85, 83, 95, 87, 29, NULL, NULL, NULL, 'Bioimpedância 
%Músculo -27,6
% Gordura - 36,8
%Visceral - 8', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-12 22:07:44.520429+00', '2026-08-12 22:22:57.652+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (48, 56, 'avaliacao_inicial', '2026-07-30', 72.4, 171, 24.76, 80, 107, 94, 28, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 40,8
% Musculo - 24,8
% Gordura visceral - 6', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 17:37:12.404284+00', '2026-07-30 17:37:44.468+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (53, 61, 'avaliacao_inicial', '2026-07-30', 110, 187, 31.46, 95, 114, 102, 35, NULL, NULL, NULL, 'Bioimpedância 
% Gordura - 17,8 
% Músculo - 37,9 
% Gordura visceral -  12', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 21:17:58.538415+00', '2026-07-30 21:18:31.166+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (49, 57, 'avaliacao_inicial', '2026-07-30', 78.5, 162, 29.91, 86, 113, 93, 34, NULL, NULL, NULL, 'Bioimpedância 
% Músculo - 43,8
% Gordura - 29,4
%Visceral - ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 18:17:13.079475+00', '2026-07-30 18:29:04.281+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (50, 58, 'avaliacao_inicial', '2026-07-30', 65.8, 178, 20.77, 77.5, 102, 87, 35, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 32,1
% Músculo - 28,4
% Gordura visceral - 4', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 18:31:36.899885+00', '2026-07-30 18:32:02.898+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (54, 62, 'avaliacao_inicial', '2026-07-31', 55.4, 162, 21.11, 76, 89, 78, 23, NULL, NULL, NULL, 'Bioimpedância 
% Gordura - 25,9 
% Musculo - 31,5 
% Gordura visceral - 4', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-31 21:48:35.639967+00', '2026-07-31 21:49:06.246+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (60, 68, 'avaliacao_inicial', '2026-08-12', 55.4, 157, 22.48, 66, 78, 98.6, NULL, NULL, NULL, NULL, 'Bioimpedância 
%Músculo -27,9
% Gordura - 32,2
%Visceral - 6', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-12 22:44:34.053999+00', '2026-08-12 22:45:23.602+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (51, 59, 'avaliacao_inicial', '2026-07-30', 76.8, 160, 30, 84.5, 113, 95, 34.5, NULL, NULL, NULL, 'Bioimpedância
% Gordura - 46,7
% Músculo - 22,5
% Gordura visceral - 8', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 18:58:48.489506+00', '2026-07-30 19:00:49.43+00');
INSERT INTO public.consultations (id, patient_id, type, date, weight, height, bmi, waist_cm, hip_cm, abdomen_cm, arm_cm, thigh_cm, calf_cm, bioimpedance_pdf_path, notes, objective, vet_kcal, menu_pdf_path, restrictions, additional_guidance, baseline_consultation_id, evolution_notes, created_at, updated_at) VALUES (52, 60, 'avaliacao_inicial', '2026-07-30', 65.8, 178, 20.77, 77.5, 102, 87, 35, NULL, NULL, NULL, 'Bioimpedância 
% Gordura - 32,1 
% Músculo - 28,4 
% Gordura visceral - 4', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 21:14:35.437652+00', '2026-07-30 21:15:05.906+00');


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.groups (id, name, color, description, created_at, updated_at) VALUES (4, 'Cross', '#f1bd65', 'Bem-vindo(a) à área exclusiva do Cross! 💪  Este espaço foi criado para facilitar o acompanhamento da sua evolução e reunir conteúdos que vão complementar a sua rotina de treinos.  Aqui você terá acesso às suas avaliações e medidas, podendo acompanhar sua evolução ao longo do tempo, além de conteúdos exclusivos sobre nutrição, hábitos saudáveis, desempenho esportivo e outras informações que vão ajudar você a alcançar seus objetivos com mais consciência e consistência.  Acompanhe seu progresso, consulte os materiais sempre que precisar e aproveite esse espaço preparado especialmente para apoiar a sua jornada. Cada pequena evolução conta, e estou aqui para ajudar você em cada etapa desse processo.', '2026-07-20 20:36:11.358654+00', '2026-07-20 23:30:37.415+00');
INSERT INTO public.groups (id, name, color, description, created_at, updated_at) VALUES (5, 'Pacientes', '#2E5E4E', 'Bem-vindo(a) à sua área exclusiva de paciente! 💚  Pensando em tornar o seu acompanhamento ainda mais completo, criei este espaço para que você tenha tudo o que precisa em um só lugar.  Aqui você encontrará acesso às suas consultas, materiais exclusivos, e-books, guias práticos, receitas, orientações e outros conteúdos preparados com muito cuidado para ajudar você a manter uma rotina mais saudável, mesmo fora do consultório.  Meu objetivo é que este ambiente seja uma extensão da nossa consulta, oferecendo informações confiáveis, apoio e ferramentas que facilitem a sua jornada em direção aos seus objetivos.  Explore os materiais sempre que precisar e aproveite esse espaço, que foi criado especialmente para você. Conte comigo durante todo o processo!', '2026-07-20 20:36:31.947435+00', '2026-07-20 23:30:46.879+00');


--
-- Data for Name: patient_groups; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (8, 5, 5, '2026-07-20 22:59:48.796382+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (9, 6, 5, '2026-07-20 22:59:51.290412+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (10, 7, 5, '2026-07-20 22:59:52.519096+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (11, 8, 5, '2026-07-20 22:59:53.650575+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (12, 9, 5, '2026-07-20 22:59:54.841561+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (13, 10, 5, '2026-07-20 22:59:58.311864+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (14, 11, 5, '2026-07-20 23:03:46.181567+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (16, 13, 5, '2026-07-20 23:28:31.797507+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (57, 56, 4, '2026-07-30 17:54:26.342375+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (58, 55, 4, '2026-07-30 17:54:27.421154+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (59, 54, 4, '2026-07-30 17:54:28.310055+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (60, 53, 4, '2026-07-30 17:54:29.141926+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (61, 52, 4, '2026-07-30 17:54:29.996042+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (62, 51, 4, '2026-07-30 17:54:30.854763+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (63, 48, 4, '2026-07-30 17:54:31.644635+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (64, 47, 4, '2026-07-30 17:54:32.544595+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (67, 44, 4, '2026-07-30 17:54:35.009538+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (69, 42, 4, '2026-07-30 17:54:37.175242+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (70, 40, 4, '2026-07-30 17:54:37.78778+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (71, 39, 4, '2026-07-30 17:54:38.573203+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (72, 38, 4, '2026-07-30 17:54:39.207282+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (73, 37, 4, '2026-07-30 17:54:40.014223+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (74, 36, 4, '2026-07-30 17:54:40.785011+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (75, 35, 4, '2026-07-30 17:54:41.423123+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (76, 34, 4, '2026-07-30 17:54:42.11255+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (77, 33, 4, '2026-07-30 17:54:42.776895+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (78, 31, 4, '2026-07-30 17:54:43.415911+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (79, 30, 4, '2026-07-30 17:54:44.037902+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (80, 28, 4, '2026-07-30 17:54:44.665392+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (81, 27, 4, '2026-07-30 17:54:45.384209+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (82, 26, 4, '2026-07-30 17:54:45.980007+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (83, 25, 4, '2026-07-30 17:54:46.575618+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (84, 24, 4, '2026-07-30 17:54:47.198079+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (85, 22, 4, '2026-07-30 17:54:47.865005+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (86, 21, 4, '2026-07-30 17:54:48.459467+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (87, 17, 4, '2026-07-30 17:54:49.253351+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (88, 16, 4, '2026-07-30 17:54:49.998774+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (89, 15, 4, '2026-07-30 17:54:51.749328+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (91, 57, 4, '2026-07-30 18:41:51.327555+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (92, 59, 4, '2026-07-30 19:01:58.978337+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (93, 60, 4, '2026-07-30 21:16:23.072873+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (94, 61, 4, '2026-07-30 21:18:35.872392+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (95, 62, 4, '2026-07-31 21:50:23.539192+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (96, 57, 5, '2026-08-11 16:38:35.682259+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (97, 69, 4, '2026-08-13 13:09:16.22802+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (98, 68, 4, '2026-08-13 13:09:17.339094+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (100, 66, 4, '2026-08-13 13:09:19.471625+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (101, 65, 4, '2026-08-13 13:09:20.48315+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (102, 64, 4, '2026-08-13 13:09:21.524036+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (104, 70, 4, '2026-08-13 13:24:45.733119+00');
INSERT INTO public.patient_groups (id, patient_id, group_id, created_at) VALUES (105, 71, 4, '2026-08-13 14:05:44.8469+00');


--
-- Data for Name: patient_publication_views; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--



--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (5, 'Ana Carolina', 'tatipaulino@yahoo.com.br', '', '2012-05-17', 'feminino', 6, '2026-07-20 22:53:37.188931+00', '2026-07-20 22:53:37.188931+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (6, 'Giulia Rocha', 'giulanrocha@gmail.com', '', '2003-06-17', 'feminino', 7, '2026-07-20 22:55:12.266163+00', '2026-07-20 22:55:12.266163+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (7, 'Isadora Rodrigues', 'Isa.kl1@hotmail.com', '', '2000-08-14', 'feminino', 8, '2026-07-20 22:56:35.826794+00', '2026-07-20 22:56:35.826794+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (8, 'Nathália Batista', 'Nathabano@hotmail.com', '', '1998-03-16', 'feminino', 9, '2026-07-20 22:57:22.823842+00', '2026-07-20 22:57:22.823842+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (9, 'Renata Silva', 'renatagsilva2509@gmail.com', '', '1971-07-25', 'feminino', 10, '2026-07-20 22:58:12.293018+00', '2026-07-20 22:58:12.293018+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (10, 'Roberto Kenzo', 'erikahkato@gmail.com', '', '2012-06-08', NULL, 11, '2026-07-20 22:59:19.727688+00', '2026-07-20 22:59:19.727688+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (11, 'Rosangela Maldotti', 'rmaldotti02@gmail.com', '', '1967-02-10', 'feminino', 12, '2026-07-20 23:01:53.239815+00', '2026-07-20 23:01:53.239815+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (13, 'Sarah Sena', 'sarocss@gmail.com', '', '2000-05-05', 'feminino', 14, '2026-07-20 23:18:00.168601+00', '2026-07-20 23:18:00.168601+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (15, 'Daniela Souza', 'osa.dani@gmail.com', '', '', 'feminino', 16, '2026-07-29 09:32:18.711477+00', '2026-07-29 09:32:18.711477+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (16, 'Jessica Ribeiro', 'ribeirojbelmonte@gmail.com', '', '', 'feminino', 17, '2026-07-29 09:34:39.069064+00', '2026-07-29 09:34:39.069064+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (17, 'Fernando Araujo', 'fernando.araujo@hotmail.com', '', '', 'masculino', 18, '2026-07-29 09:35:41.250963+00', '2026-07-29 09:35:41.250963+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (21, 'Aline Cavalcante', 'alinecvital@gmail.com', '', '', 'feminino', 22, '2026-07-29 10:10:28.663718+00', '2026-07-29 10:10:28.663718+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (22, 'Jessyca Vieira ', 'vieirajessyva25@gmail.com', '', '', 'feminino', 23, '2026-07-29 11:20:09.020343+00', '2026-07-29 11:20:09.020343+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (24, 'Divaldo Rodrigues ', 'divaldo.rodrigues2020@gmail.com', '', '', 'masculino', 25, '2026-07-29 11:25:08.986382+00', '2026-07-29 11:25:08.986382+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (25, 'Tayná Pinheiro ', 'taynapinheiro@yahoo.com.br', '', '', 'feminino', 26, '2026-07-29 11:27:29.187738+00', '2026-07-29 11:27:29.187738+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (26, 'nairan oliveira', 'n_nagre@hotmail.com', '', '', 'feminino', 27, '2026-07-29 11:41:05.446485+00', '2026-07-29 11:41:05.446485+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (27, 'Telma Tavares', 'telma@ciclomed.com.br', '', '', 'feminino', 28, '2026-07-29 20:33:38.852337+00', '2026-07-29 20:33:38.852337+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (28, 'Thaina Zillig', 'thaina.zillig@outlook.com', '', '', 'feminino', 29, '2026-07-29 20:35:56.467152+00', '2026-07-29 20:35:56.467152+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (30, 'Matheus Agra', 'matheus.agra@gmail.com', '', '', 'masculino', 31, '2026-07-29 20:41:24.062367+00', '2026-07-29 20:41:24.062367+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (31, 'Victor Barros', 'victor.gustavo@outlook.com', '', '', 'masculino', 32, '2026-07-29 20:43:15.382216+00', '2026-07-29 20:43:15.382216+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (33, 'Mayara Rodrigues', 'may.almeidarodrigues@gmail.com', '', '', 'feminino', 34, '2026-07-29 20:45:58.29233+00', '2026-07-29 20:45:58.29233+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (34, 'Shirley Kivoslita', 'safk8010@gmail.com', '', '', 'feminino', 35, '2026-07-29 22:36:10.964902+00', '2026-07-29 22:36:10.964902+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (35, 'Sabrina Lima', 'sabrina.limaesteves@gmail.com', '', '', 'feminino', 36, '2026-07-29 22:38:59.229476+00', '2026-07-29 22:38:59.229476+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (36, 'Andre Vilarino', 'vilarinonegocios@gmail.com', '', '', 'masculino', 37, '2026-07-29 22:41:56.759681+00', '2026-07-29 22:41:56.759681+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (37, 'Thayná Ribeiro ', 'thaybiomedo@gmail.com', '', '', 'feminino', 38, '2026-07-29 22:44:05.536665+00', '2026-07-29 22:44:05.536665+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (38, 'Luciana Moreira', 'Lucianasmor247@gmail.com', '', '', 'feminino', 39, '2026-07-29 22:46:10.572743+00', '2026-07-29 22:46:10.572743+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (39, 'Udo Schenker', 'Udo@rapid.ind.br', '', '', 'masculino', 40, '2026-07-29 22:49:38.33725+00', '2026-07-29 22:49:38.33725+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (40, 'Jessica Soares', 'jessicanobre1234@gmail.com', '', '', 'feminino', 41, '2026-07-29 22:51:13.035771+00', '2026-07-29 22:51:13.035771+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (42, 'Andreia Zillig', 'andrea.rz@uol.com.br', '', '', 'feminino', 43, '2026-07-29 22:54:42.781523+00', '2026-07-29 22:54:42.781523+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (44, 'Ingrid lopes', 'ingredilopesf@gmail.com', '', '', 'feminino', 45, '2026-07-29 22:58:25.856654+00', '2026-07-29 22:58:25.856654+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (47, 'Bruno Machado', 'brunomachado@gmail.com', '', '', 'masculino', 48, '2026-07-29 23:29:52.855817+00', '2026-07-29 23:29:52.855817+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (48, 'Simone Guedes', 'sgs.enf@gmail.com', '', '', 'feminino', 49, '2026-07-29 23:31:43.768505+00', '2026-07-29 23:31:43.768505+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (51, 'Gabriela De Jesus', 'gaby_paixao@hotmail.com', '', '', 'feminino', 52, '2026-07-30 16:29:30.23613+00', '2026-07-30 16:29:30.23613+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (52, 'Luana Berton', 'Luaninha.c6@hotmail.com', '', '', 'feminino', 53, '2026-07-30 16:34:22.90833+00', '2026-07-30 16:34:22.90833+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (53, 'Gabriela Basilio ', 'gabsbasilio@hotmail.com', '', '', 'feminino', 54, '2026-07-30 16:38:26.213955+00', '2026-07-30 16:38:26.213955+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (54, 'Mário Toledo', 'marioluiz.lisboa@gmail.com', '', '', 'masculino', 55, '2026-07-30 16:43:02.774106+00', '2026-07-30 16:43:02.774106+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (55, 'Adriane Lima ', 'lima812601@gmail.com', '', '', 'feminino', 56, '2026-07-30 17:13:01.267573+00', '2026-07-30 17:13:01.267573+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (56, 'Flávia Longatti', 'flavialongatti@yahoo.com.br', '', '', 'feminino', 57, '2026-07-30 17:36:56.363744+00', '2026-07-30 17:36:56.363744+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (57, 'Barbara Souza', 'barbara.v.souza01@gmail.com', '', '', 'feminino', 58, '2026-07-30 18:16:42.973888+00', '2026-07-30 18:16:42.973888+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (59, ' Fabianne Vitoria', 'fabiannevitoriac@icloud.com', '', '', 'feminino', 60, '2026-07-30 18:58:30.532951+00', '2026-07-30 18:58:30.532951+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (60, 'Vanessa Fernades', 'vanessag.fernandes1@gmail.com', '', '', 'feminino', 61, '2026-07-30 21:14:02.297538+00', '2026-07-30 21:14:02.297538+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (61, 'Samuel Gregrorio', 'samugre@yahoo.com.br', '', '', 'masculino', 62, '2026-07-30 21:17:34.002885+00', '2026-07-30 21:17:34.002885+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (62, 'Clara Alice', 'claraalicemartins@gmail.com', '', '', 'feminino', 63, '2026-07-31 21:48:01.495649+00', '2026-07-31 21:48:01.495649+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (64, 'Renata Araujo', 'renatarepaginada@gmail.com', '', '', 'feminino', 65, '2026-08-12 22:07:29.491454+00', '2026-08-12 22:07:29.491454+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (65, 'Michelle Alcantara', 'michelleadvicacia@gmail.com', '', '', 'feminino', 66, '2026-08-12 22:23:35.688549+00', '2026-08-12 22:23:35.688549+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (66, 'Viviane Lopes', 'vivianemendonca85@hotmail.com', '', '', 'feminino', 67, '2026-08-12 22:39:31.170277+00', '2026-08-12 22:39:31.170277+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (68, 'Eliane Alencar', 'elianealencar@gmail.com', '', '', 'feminino', 69, '2026-08-12 22:44:24.24171+00', '2026-08-12 22:44:24.24171+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (69, 'Anderson Andrade', 'anderson_slip@hotmail.com', '', '', 'masculino', 70, '2026-08-12 22:46:08.122281+00', '2026-08-12 22:46:08.122281+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (70, 'Bianca Rodrigues ', 'biancaropedroso@gmail.com', '', '', 'feminino', 71, '2026-08-13 13:21:17.780962+00', '2026-08-13 13:21:17.780962+00');
INSERT INTO public.patients (id, name, email, phone, birth_date, sex, user_id, created_at, updated_at) VALUES (71, 'Gustavo Nunes', 'gnunes50@hotmail.com', '', '', 'masculino', 72, '2026-08-13 14:04:17.906636+00', '2026-08-13 14:04:17.906636+00');


--
-- Data for Name: publication_groups; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.publication_groups (id, publication_id, group_id) VALUES (4, 8, 5);
INSERT INTO public.publication_groups (id, publication_id, group_id) VALUES (5, 9, 5);
INSERT INTO public.publication_groups (id, publication_id, group_id) VALUES (7, 11, 5);
INSERT INTO public.publication_groups (id, publication_id, group_id) VALUES (8, 12, 5);
INSERT INTO public.publication_groups (id, publication_id, group_id) VALUES (9, 13, 5);
INSERT INTO public.publication_groups (id, publication_id, group_id) VALUES (10, 14, 5);
INSERT INTO public.publication_groups (id, publication_id, group_id) VALUES (11, 15, 5);
INSERT INTO public.publication_groups (id, publication_id, group_id) VALUES (12, 16, 5);
INSERT INTO public.publication_groups (id, publication_id, group_id) VALUES (13, 17, 5);
INSERT INTO public.publication_groups (id, publication_id, group_id) VALUES (14, 18, 5);
INSERT INTO public.publication_groups (id, publication_id, group_id) VALUES (15, 19, 5);
INSERT INTO public.publication_groups (id, publication_id, group_id) VALUES (16, 20, 5);
INSERT INTO public.publication_groups (id, publication_id, group_id) VALUES (17, 29, 5);
INSERT INTO public.publication_groups (id, publication_id, group_id) VALUES (18, 30, 5);
INSERT INTO public.publication_groups (id, publication_id, group_id) VALUES (19, 31, 5);


--
-- Data for Name: publication_patients; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--



--
-- Data for Name: publications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.publications (id, title, description, category, status, visibility, video_url, pdf_path, image_path, published_at, created_at, updated_at, link_url) VALUES (20, 'Ciclo feminino', '', 'ebook', 'publicado', 'grupos', NULL, '/objects/uploads/d76b3b98-694b-4d93-ba54-c83eea39d5e5', NULL, '2026-07-20 20:51:02.878+00', '2026-07-20 20:50:59.775232+00', '2026-07-20 20:51:02.878+00', NULL);
INSERT INTO public.publications (id, title, description, category, status, visibility, video_url, pdf_path, image_path, published_at, created_at, updated_at, link_url) VALUES (21, 'Guia alimentar para a população brasileira', '', 'artigo', 'publicado', 'geral', NULL, '/objects/uploads/4e5b4003-8abb-4db1-8b69-761538f1f1cb', NULL, '2026-07-20 20:57:29.388+00', '2026-07-20 20:57:20.168427+00', '2026-07-20 20:57:29.388+00', NULL);
INSERT INTO public.publications (id, title, description, category, status, visibility, video_url, pdf_path, image_path, published_at, created_at, updated_at, link_url) VALUES (22, 'Guia alimentar para crianças brasileiras menores de 2 anos', '', 'artigo', 'publicado', 'geral', NULL, '/objects/uploads/74252858-84d7-4726-8797-166461563c24', NULL, '2026-07-20 20:59:03.036+00', '2026-07-20 20:59:01.23436+00', '2026-07-20 20:59:03.036+00', NULL);
INSERT INTO public.publications (id, title, description, category, status, visibility, video_url, pdf_path, image_path, published_at, created_at, updated_at, link_url) VALUES (23, 'International Society of Sports Nutrition Position Stand: protein and exercise', '', 'artigo', 'publicado', 'geral', NULL, NULL, NULL, '2026-07-20 21:05:07.718+00', '2026-07-20 21:05:05.62025+00', '2026-07-20 21:05:07.72+00', 'https://link.springer.com/article/10.1186/s12970-017-0177-8');
INSERT INTO public.publications (id, title, description, category, status, visibility, video_url, pdf_path, image_path, published_at, created_at, updated_at, link_url) VALUES (8, 'Medidas antropométricas', '', 'ebook', 'publicado', 'grupos', NULL, '/objects/uploads/ca7189cf-25cf-434b-88eb-3dd3a2b6d266', NULL, '2026-07-20 20:39:01.372+00', '2026-07-20 20:38:52.029734+00', '2026-07-20 20:39:01.372+00', NULL);
INSERT INTO public.publications (id, title, description, category, status, visibility, video_url, pdf_path, image_path, published_at, created_at, updated_at, link_url) VALUES (24, 'Perguntas frequentes e equívocos sobre a suplementação de creatina: o que as evidências científicas realmente mostram?', '', 'artigo', 'publicado', 'geral', NULL, NULL, NULL, '2026-07-20 21:05:47.634+00', '2026-07-20 21:05:45.452422+00', '2026-07-20 21:05:47.634+00', 'https://link.springer.com/article/10.1186/s12970-021-00412-w');
INSERT INTO public.publications (id, title, description, category, status, visibility, video_url, pdf_path, image_path, published_at, created_at, updated_at, link_url) VALUES (9, 'Guia de compras', '', 'ebook', 'publicado', 'grupos', NULL, '/objects/uploads/11b84345-1294-47b5-aa61-658a14a91625', NULL, '2026-07-20 20:41:44.067+00', '2026-07-20 20:41:41.973466+00', '2026-07-20 20:41:44.068+00', NULL);
INSERT INTO public.publications (id, title, description, category, status, visibility, video_url, pdf_path, image_path, published_at, created_at, updated_at, link_url) VALUES (11, 'Guia de marmitas', '', 'ebook', 'publicado', 'grupos', NULL, '/objects/uploads/c6de0cf3-a7fd-4810-9cea-0017d2e1a979', NULL, '2026-07-20 20:43:33.841+00', '2026-07-20 20:42:50.718797+00', '2026-07-20 20:43:33.841+00', NULL);
INSERT INTO public.publications (id, title, description, category, status, visibility, video_url, pdf_path, image_path, published_at, created_at, updated_at, link_url) VALUES (12, 'Guia para o fnal de semana', '', 'ebook', 'publicado', 'grupos', NULL, '/objects/uploads/ae778868-5cc3-4766-8bec-9054dda61839', NULL, '2026-07-20 20:43:35.643+00', '2026-07-20 20:43:31.553587+00', '2026-07-20 20:43:35.643+00', NULL);
INSERT INTO public.publications (id, title, description, category, status, visibility, video_url, pdf_path, image_path, published_at, created_at, updated_at, link_url) VALUES (13, 'Guia de organização de lanches', '', 'ebook', 'publicado', 'grupos', NULL, '/objects/uploads/79590db5-41a8-49f4-a523-ae69e4f52ee0', NULL, '2026-07-20 20:44:49.843+00', '2026-07-20 20:44:46.921965+00', '2026-07-20 20:44:49.843+00', NULL);
INSERT INTO public.publications (id, title, description, category, status, visibility, video_url, pdf_path, image_path, published_at, created_at, updated_at, link_url) VALUES (14, 'Guia para viagens', '', 'ebook', 'publicado', 'grupos', NULL, '/objects/uploads/15b7d86e-0144-483a-ad30-741cad19d9b6', NULL, '2026-07-20 20:45:27.888+00', '2026-07-20 20:45:26.427368+00', '2026-07-20 20:45:27.888+00', NULL);
INSERT INTO public.publications (id, title, description, category, status, visibility, video_url, pdf_path, image_path, published_at, created_at, updated_at, link_url) VALUES (17, 'Lanches práticos', '', 'receita', 'publicado', 'grupos', NULL, '/objects/uploads/a57b7406-17fb-4c4b-9d84-e027108711cf', NULL, '2026-07-20 20:47:25.806+00', '2026-07-20 20:47:23.092728+00', '2026-07-20 20:47:25.806+00', NULL);
INSERT INTO public.publications (id, title, description, category, status, visibility, video_url, pdf_path, image_path, published_at, created_at, updated_at, link_url) VALUES (16, 'Sopas e caldos', '', 'receita', 'publicado', 'grupos', NULL, '/objects/uploads/04499ebe-d96b-44a0-8345-08e0f5d3a2cc', NULL, '2026-07-20 20:47:26.908+00', '2026-07-20 20:46:29.9518+00', '2026-07-20 20:47:26.908+00', NULL);
INSERT INTO public.publications (id, title, description, category, status, visibility, video_url, pdf_path, image_path, published_at, created_at, updated_at, link_url) VALUES (15, 'Receitas para o inverno', '', 'receita', 'publicado', 'grupos', NULL, '/objects/uploads/29d446c6-ffff-4a83-b5af-807387d2b965', NULL, '2026-07-20 20:47:28.432+00', '2026-07-20 20:46:00.334744+00', '2026-07-20 20:47:28.432+00', NULL);
INSERT INTO public.publications (id, title, description, category, status, visibility, video_url, pdf_path, image_path, published_at, created_at, updated_at, link_url) VALUES (18, 'Doces em equilíbrio', '', 'ebook', 'publicado', 'grupos', NULL, '/objects/uploads/0a6ad466-b98f-4bb4-a477-20fa696eb9e4', NULL, '2026-07-20 20:48:15.438+00', '2026-07-20 20:48:13.194067+00', '2026-07-20 20:48:15.438+00', NULL);
INSERT INTO public.publications (id, title, description, category, status, visibility, video_url, pdf_path, image_path, published_at, created_at, updated_at, link_url) VALUES (19, 'Lanches pré e pós treino', '', 'receita', 'publicado', 'grupos', NULL, '/objects/uploads/6349c0ec-307f-4663-8794-79ea675e34a7', NULL, '2026-07-20 20:48:55.877+00', '2026-07-20 20:48:53.273353+00', '2026-07-20 20:48:55.877+00', NULL);
INSERT INTO public.publications (id, title, description, category, status, visibility, video_url, pdf_path, image_path, published_at, created_at, updated_at, link_url) VALUES (25, 'Importância da alimentação adequada para o equilíbrio hormonal e da promoção da longevidade no Dia da Saúde e Nutrição', '', 'artigo', 'publicado', 'geral', NULL, NULL, NULL, '2026-07-20 21:06:26.62+00', '2026-07-20 21:06:24.700686+00', '2026-07-20 21:06:26.62+00', 'https://www.febrasgo.org.br/noticia/febrasgo-destaca-a-importancia-da-alimentacao-adequada-para-o-equilibrio-hormonal-e-da-promocao-da-longevidade-no-dia-da-saude-e-nutricao/?utm_source=chatgpt.com');
INSERT INTO public.publications (id, title, description, category, status, visibility, video_url, pdf_path, image_path, published_at, created_at, updated_at, link_url) VALUES (26, 'Nutrição e alimentação são pontos fundamentais à Saúde da Mulher', '', 'artigo', 'publicado', 'geral', NULL, NULL, NULL, '2026-07-20 21:07:02.347+00', '2026-07-20 21:06:58.327775+00', '2026-07-20 21:07:02.347+00', 'https://www.febrasgo.org.br/noticia/nutricao-e-alimentacao-sao-pontos-fundamentais-a-saude-da-mulher-alerta-especialista-da-febrasgo/?utm_source=chatgpt.com');
INSERT INTO public.publications (id, title, description, category, status, visibility, video_url, pdf_path, image_path, published_at, created_at, updated_at, link_url) VALUES (33, 'A roda da mudança comportamental: um novo método para caracterizar e projetar intervenções de mudança de comportamento.', '', 'artigo', 'publicado', 'geral', NULL, NULL, NULL, '2026-07-31 22:07:54.126+00', '2026-07-31 22:07:51.485287+00', '2026-07-31 22:07:54.126+00', 'https://link.springer.com/article/10.1186/1748-5908-6-42?utm_source');
INSERT INTO public.publications (id, title, description, category, status, visibility, video_url, pdf_path, image_path, published_at, created_at, updated_at, link_url) VALUES (30, 'Reeducação alimentar', '', 'ebook', 'publicado', 'grupos', NULL, '/objects/uploads/540abaa3-4343-456f-9d2b-5f3e50d70a8a', NULL, '2026-07-29 10:39:57.094+00', '2026-07-29 10:39:51.767967+00', '2026-07-29 10:39:57.094+00', NULL);
INSERT INTO public.publications (id, title, description, category, status, visibility, video_url, pdf_path, image_path, published_at, created_at, updated_at, link_url) VALUES (29, 'Hipertrofia feminina', '', 'ebook', 'publicado', 'grupos', NULL, '/objects/uploads/971db43b-82e2-42a5-b640-f8bb7cb92e4b', NULL, '2026-07-29 10:39:58.909+00', '2026-07-29 10:38:26.058502+00', '2026-07-29 10:39:58.909+00', NULL);
INSERT INTO public.publications (id, title, description, category, status, visibility, video_url, pdf_path, image_path, published_at, created_at, updated_at, link_url) VALUES (31, 'Nutrição e hipertrofia', '', 'ebook', 'publicado', 'grupos', NULL, '/objects/uploads/bdb39959-44f5-4be4-bf76-9bab950f5598', NULL, '2026-07-31 22:03:11.794+00', '2026-07-31 22:03:08.213958+00', '2026-07-31 22:03:11.794+00', NULL);
INSERT INTO public.publications (id, title, description, category, status, visibility, video_url, pdf_path, image_path, published_at, created_at, updated_at, link_url) VALUES (32, 'A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults ', '', 'artigo', 'publicado', 'geral', NULL, NULL, NULL, '2026-07-31 22:05:38.613+00', '2026-07-31 22:05:37.078418+00', '2026-07-31 22:05:38.613+00', 'https://bjsm.bmj.com/content/52/6/376?utm_source');
INSERT INTO public.publications (id, title, description, category, status, visibility, video_url, pdf_path, image_path, published_at, created_at, updated_at, link_url) VALUES (34, 'Dieta Saudável', '', 'artigo', 'publicado', 'geral', NULL, NULL, NULL, '2026-07-31 22:10:07.857+00', '2026-07-31 22:10:06.411812+00', '2026-07-31 22:10:07.857+00', 'https://www.who.int/en/news-room/fact-sheets/detail/healthy-diet?utm_source');
INSERT INTO public.publications (id, title, description, category, status, visibility, video_url, pdf_path, image_path, published_at, created_at, updated_at, link_url) VALUES (35, 'Organização Mundial da Saúde', '', 'artigo', 'publicado', 'geral', NULL, NULL, NULL, '2026-07-31 22:11:51.188+00', '2026-07-31 22:11:49.536462+00', '2026-07-31 22:11:51.188+00', 'https://www.who.int/health-topics/noncommunicable-diseases/physical-activity?utm_source');
INSERT INTO public.publications (id, title, description, category, status, visibility, video_url, pdf_path, image_path, published_at, created_at, updated_at, link_url) VALUES (37, 'Promoting a healthy diet for the WHO Eastern Mediterranean Region: user-friendly guide', '', 'artigo', 'publicado', 'geral', NULL, NULL, NULL, '2026-07-31 22:13:00.257+00', '2026-07-31 22:12:58.522684+00', '2026-07-31 22:13:00.258+00', 'https://platform.who.int/docs/default-source/mca-documents/policy-documents/guideline/IRQ-CH-38-02-GUIDELINE-2012-eng-WHO-Guideline-Promoting-Healthy-Diet.pdf?utm_source');
INSERT INTO public.publications (id, title, description, category, status, visibility, video_url, pdf_path, image_path, published_at, created_at, updated_at, link_url) VALUES (38, 'Aspectos da seletividade alimentar em crianças e adolescentes com transtorno do espectro autista ', '', 'artigo', 'publicado', 'geral', NULL, '/objects/uploads/e68cb2f3-b7ba-4c3b-bb44-083ccd76598b', NULL, '2026-07-31 22:17:24.416+00', '2026-07-31 22:17:18.597763+00', '2026-07-31 22:17:24.416+00', NULL);


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.session (sid, sess, expire) VALUES ('MSk2iTsIVgyAIheYT9UhJGvnRF6AiMZo', '{"cookie":{"originalMaxAge":604800000,"expires":"2026-08-21T23:32:26.026Z","secure":true,"httpOnly":true,"path":"/","sameSite":"none"},"userId":12,"role":"paciente","patientId":11}', '2026-08-21 23:33:16');
INSERT INTO public.session (sid, sess, expire) VALUES ('0qlYaTcFM90w2ildD5MRK2LE-QNKZnZi', '{"cookie":{"originalMaxAge":604800000,"expires":"2026-08-20T14:07:49.619Z","secure":true,"httpOnly":true,"path":"/","sameSite":"none"},"userId":72,"role":"paciente","patientId":71}', '2026-08-20 14:20:03');
INSERT INTO public.session (sid, sess, expire) VALUES ('dTbrbOCx5kSBnU3rhRgYYkJldG6xfz1Y', '{"cookie":{"originalMaxAge":604800000,"expires":"2026-08-26T16:22:39.704Z","secure":true,"httpOnly":true,"path":"/","sameSite":"none"},"userId":11,"role":"paciente","patientId":10}', '2026-08-26 16:25:29');
INSERT INTO public.session (sid, sess, expire) VALUES ('keqZ-7PsvOE5Dypw3yc5l3oEaLQ9EQWz', '{"cookie":{"originalMaxAge":604800000,"expires":"2026-08-18T16:38:23.429Z","secure":true,"httpOnly":true,"path":"/","sameSite":"none"},"userId":1,"role":"nutricionista","patientId":null}', '2026-08-21 21:14:58');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (1, 'maldotesofia@gmail.com', 'Dra. Sofia', '$2b$10$0J2khVwD36.E0kWtVeIqKuPYdLeHkloxycfQjRv4TDc/QuqwohlVK', 'nutricionista', NULL, '2026-07-15 18:28:22.425551+00', '2026-07-17 01:41:25.597+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (9, 'Nathabano@hotmail.com', 'Nathália Batista', '$2b$10$fho5vnbnmXJ15KALvzQBv.VCnymBsOLz0ZDx6pPzQl.3gDig08ZAq', 'paciente', '8', '2026-07-20 22:57:22.806422+00', '2026-08-14 21:11:46.02+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (14, 'sarocss@gmail.com', 'Sarah Sena', '$2b$10$qkQMMH98ndrzM4fOLpK1FOvTyQ2fyRiqotTPTSiMrf/xc7056O1Qi', 'paciente', '13', '2026-07-20 23:18:00.138334+00', '2026-08-14 21:10:00.849+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (12, 'rmaldotti02@gmail.com', 'Rosangela Maldotti', '$2b$10$040VyiVU6LqtSUp5omvm4utlqRaykqer2LBmw85VHaObg/2XyGsDm', 'paciente', '11', '2026-07-20 23:01:53.221883+00', '2026-08-14 21:13:29.467+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (11, 'erikahkato@gmail.com', 'Roberto Kenzo', '$2b$10$Rk.7uEiFazupOJJtrFTmf.l0grhQCouzfWmq7.tpp4o5VFJP4fnVG', 'paciente', '10', '2026-07-20 22:59:19.709881+00', '2026-08-19 16:24:27.432+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (29, 'thaina.zillig@outlook.com', 'Thaina Zillig', '$2b$10$wzadmuDpWIRnEbYIGi/2xe44uWQxJZIFwQcVXG9QBKqKBaQQTFLl2', 'paciente', '28', '2026-07-29 20:35:56.450124+00', '2026-07-30 16:12:05.861+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (7, 'giulanrocha@gmail.com', 'Giulia Rocha', '$2b$10$gXxpi2ji7.w23zMMF9P1f.f9RHjLjonBd1IrdC27NwsYdk/ximV06', 'paciente', '6', '2026-07-20 22:55:12.250588+00', '2026-07-20 23:04:01.165+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (8, 'Isa.kl1@hotmail.com', 'Isadora Rodrigues', '$2b$10$3EUXcbVAF0m6g8WpT5PYHup19.S5dZqAZZUzmYSuoz2Cd3IXaJo4C', 'paciente', '7', '2026-07-20 22:56:35.809379+00', '2026-08-14 21:10:54.162+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (10, 'renatagsilva2509@gmail.com', 'Renata Silva', '$2b$10$itJusI3WfCcN6JrblwJj5OIwzrUeB/uNHt6VVZI8TzFod2uHTGDa.', 'paciente', '9', '2026-07-20 22:58:12.277797+00', '2026-08-14 21:12:10.237+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (16, 'osa.dani@gmail.com', 'Daniela Souza', '$2b$10$XT3aYIaf3S7QKNb8u8T/FeJIoIio4AXSFFY4MhcGOlSmTdVhqScJC', 'paciente', '15', '2026-07-29 09:32:18.695562+00', '2026-07-30 15:47:27.361+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (18, 'fernando.araujo@hotmail.com', 'Fernando Araujo', '$2b$10$0HS8PEz3Uce0Kjm1zyGT.OoCfEeS2fqh/tfY/Sh7CyUrEAqwdgxGW', 'paciente', '17', '2026-07-29 09:35:41.234441+00', '2026-07-30 15:53:43.628+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (41, 'jessicanobre1234@gmail.com', 'Jessica Soares', '$2b$10$MQEfdXky8HqoCOHJmgxo3uF78zVfJBMZj/ESAHAlvKGJqh92fRHy.', 'paciente', '40', '2026-07-29 22:51:13.019087+00', '2026-07-30 17:19:05.325+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (53, 'Luaninha.c6@hotmail.com', 'Luana Berton', '$2b$10$xOjp55xupn0h.ZEURlSJG.m8/R8JbzI4ZslS.fnloMKJiHgQfSoEu', 'paciente', '52', '2026-07-30 16:34:22.876479+00', '2026-07-30 16:39:37.929+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (25, 'divaldo.rodrigues2020@gmail.com', 'Divaldo Rodrigues ', '$2b$10$55oNBrAAGtdt1sDsR/Vm/eh0ne0lfBlkJWvtTlx3rFKIYbGtjAVNS', 'paciente', '24', '2026-07-29 11:25:08.970544+00', '2026-07-30 16:02:26.54+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (26, 'taynapinheiro@yahoo.com.br', 'Tayná Pinheiro ', '$2b$10$3RhfzVZNvholar9lpHA5FOSY3TRcZrStJKBD3tkp4DYrv0uRmYfxm', 'paciente', '25', '2026-07-29 11:27:29.170967+00', '2026-07-30 16:03:51.378+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (27, 'n_nagre@hotmail.com', 'nairan oliveira', '$2b$10$cS9P5gWuaAtRM2iujIVfaumvDJf7Ah.zWjSnje9fv95pVnSi8ucAK', 'paciente', '26', '2026-07-29 11:41:05.420363+00', '2026-07-30 16:05:27.165+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (55, 'marioluiz.lisboa@gmail.com', 'Mário Toledo', '$2b$10$QY3PL9Tg2QhM/k2CTKsPeeyVCmV8w.cG4HA2F4qH1CS9X7AGYyd86', 'paciente', '54', '2026-07-30 16:43:02.75721+00', '2026-07-30 16:46:32.764+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (28, 'telma@ciclomed.com.br', 'Telma Tavares', '$2b$10$JfBjOx4wcc2ezEvhtxxE2.pg5h/C1nY0C/E9UnjSbcA8vDSbXbZQq', 'paciente', '27', '2026-07-29 20:33:38.820097+00', '2026-07-29 20:33:38.871+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (32, 'victor.gustavo@outlook.com', 'Victor Barros', '$2b$10$7PqM7hrcCUyrokmyNXCkZe2.gPf7FaMB1HV.YPmNN3RzhMzv4gzbC', 'paciente', '31', '2026-07-29 20:43:15.361915+00', '2026-07-30 16:22:20.618+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (52, 'gaby_paixao@hotmail.com', 'Gabriela De Jesus', '$2b$10$jDE1BQgDBr.Es39li3MRPebtcNphmyTBTHKwyikb5dJ2bTurAE8Ji', 'paciente', '51', '2026-07-30 16:29:30.219264+00', '2026-07-30 16:30:27.97+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (56, 'lima812601@gmail.com', 'Adriane Lima ', '$2b$10$Z2gsMQnTlpPoCgUh5bT.JO/0INqwIHRu1FwfEduEBnVGk6z0E6u2a', 'paciente', '55', '2026-07-30 17:13:01.235804+00', '2026-07-30 17:14:03.252+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (40, 'Udo@rapid.ind.br', 'Udo Schenker', '$2b$10$eTyzSfFZ5dDNeUxEYm9sVuea8QZm0952cxM0auCxWJmV6KfA0qb4m', 'paciente', '39', '2026-07-29 22:49:38.303612+00', '2026-07-30 17:17:43.101+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (22, 'alinecvital@gmail.com', 'Aline Cavalcante', '$2b$10$HY.ifFhUkNwPSJ9ARsqVXOHTHfj5J1H0IOkzuFkSkOacfrOgwKUoW', 'paciente', '21', '2026-07-29 10:10:28.647236+00', '2026-07-30 15:59:28.569+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (23, 'vieirajessyva25@gmail.com', 'Jessyca Vieira ', '$2b$10$xCHBqQTtlorVWtcb21d/GOpZw3IIKGVfHmO7Y1zFt3fxCkt8hQcJG', 'paciente', '22', '2026-07-29 11:20:08.987701+00', '2026-07-30 16:01:15.861+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (36, 'sabrina.limaesteves@gmail.com', 'Sabrina Lima', '$2b$10$A8NjEEM29jiF3u6yiFo63O1xhr7z71ZzlXN5jRwFlSF4ttwtBl302', 'paciente', '35', '2026-07-29 22:38:59.214156+00', '2026-07-30 16:58:40.931+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (38, 'thaybiomedo@gmail.com', 'Thayná Ribeiro ', '$2b$10$5eteyc43Q0W8/Oxk/fpQEOpQqBonCD4NPDIJcQnS7UMB3gl08NWja', 'paciente', '37', '2026-07-29 22:44:05.521231+00', '2026-07-30 17:01:12.48+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (39, 'Lucianasmor247@gmail.com', 'Luciana Moreira', '$2b$10$QXReuE4JJUxFJ87G.vYE5uViSIeYn6EeNz.mnAl229d4VJaGfZ8Da', 'paciente', '38', '2026-07-29 22:46:10.555704+00', '2026-07-30 17:05:27.67+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (58, 'barbara.v.souza01@gmail.com', 'Barbara Souza', '$2b$10$2.DsPVybbkQDtd8SSY5AW.XVi.cuVhdlyVrpihisKDaA2zvA9pCH.', 'paciente', '57', '2026-07-30 18:16:42.946857+00', '2026-07-30 18:29:10.384+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (45, 'ingredilopesf@gmail.com', 'Ingrid lopes', '$2b$10$7s.frypXcs3lUB9IVad7ZORGyotYWvfO/uUg2zMlhlgXPZDTaxlzm', 'paciente', '44', '2026-07-29 22:58:25.84078+00', '2026-07-30 17:41:10.917+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (49, 'sgs.enf@gmail.com', 'Simone Guedes', '$2b$10$GMPqh9Qc6fOAzKcniwhcEOGG7G.9Cx6cIyqdC8BSwi65EeJkpRnzG', 'paciente', '48', '2026-07-29 23:31:43.753337+00', '2026-07-30 17:44:15.478+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (48, 'brunomachado@gmail.com', 'Bruno Machado', '$2b$10$RuxK6peWrFz3gKQAwxDhzOilwJOh3hUC8GhjJuRTV0jIhlcbgOx1O', 'paciente', '47', '2026-07-29 23:29:52.840734+00', '2026-07-30 17:45:55.88+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (57, 'flavialongatti@yahoo.com.br', 'Flávia Longatti', '$2b$10$828PdIQ0kBf8mcgqZLtgJ.DJqfIq.tg2RUN7UGR.ISxnuiujbwOy6', 'paciente', '56', '2026-07-30 17:36:56.319762+00', '2026-07-30 17:56:02.903+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (61, 'vanessag.fernandes1@gmail.com', 'Vanessa Fernades', '$2b$10$Igw7lEOIG/CtW.LBaTDZq.CE24ZkaU8O2fPuCYXhY.uLCS4r2i8CC', 'paciente', '60', '2026-07-30 21:14:02.268951+00', '2026-07-30 21:14:02.311+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (34, 'may.almeidarodrigues@gmail.com', 'Mayara Rodrigues', '$2b$10$jXE/yafAbnuoAI9EVcvkOum1L/rdERdLvUL9NoZqSJu/sr..0woNm', 'paciente', '33', '2026-07-29 20:45:58.275843+00', '2026-07-30 16:48:52.704+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (17, 'ribeirojbelmonte@gmail.com', 'Jessica Ribeiro', '$2b$10$a88k1XMpp1BNsfIFYMbSauz6luxD9sjdUu/j96UYsz6aBBjYe/5my', 'paciente', '16', '2026-07-29 09:34:39.053192+00', '2026-07-30 15:49:48.904+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (31, 'matheus.agra@gmail.com', 'Matheus Agra', '$2b$10$.lZR3XQOwmpgJ96hPhj2oO4onnVyTmnujttvtVhKBqqXiCwb8Xgfu', 'paciente', '30', '2026-07-29 20:41:24.046247+00', '2026-07-30 16:21:17.112+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (54, 'gabsbasilio@hotmail.com', 'Gabriela Basilio ', '$2b$10$i4jarFk7AHeXIdhvkB0HD.lPDgdf/pbdGK9GPwwWehBRS4CYfjuMC', 'paciente', '53', '2026-07-30 16:38:26.181732+00', '2026-07-30 16:41:06.199+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (37, 'vilarinonegocios@gmail.com', 'Andre Vilarino', '$2b$10$oz09OW5M6ZsIySc7wRmPeu7bdgL7dIq0xjZmAt65yGdVW/fpJdm6.', 'paciente', '36', '2026-07-29 22:41:56.744153+00', '2026-07-30 17:00:03.183+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (35, 'safk8010@gmail.com', 'Shirley Kivoslita', '$2b$10$krITClQfsCME2hJE.GyVvO0.40MoncxgYWrRhhricYzMNR7dIUwV6', 'paciente', '34', '2026-07-29 22:36:10.938374+00', '2026-07-30 16:55:44.816+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (43, 'andrea.rz@uol.com.br', 'Andreia Zillig', '$2b$10$volFupRdYH4II3AnJ4huueQ7tzWz2G/ZKzFSwApPGIdyCX3k345U2', 'paciente', '42', '2026-07-29 22:54:42.765449+00', '2026-07-30 17:31:47.883+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (63, 'claraalicemartins@gmail.com', 'Clara Alice', '$2b$10$IFUFjirnHwoyZjPr8EVZ1.pGe0ejdL38dF15jLoU2lz209EWIq7nO', 'paciente', '62', '2026-07-31 21:48:01.469035+00', '2026-07-31 21:48:01.507+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (60, 'fabiannevitoriac@icloud.com', ' Fabianne Vitoria', '$2b$10$stVQJeEGbuXy7bx98rKjVONLFqbWjC1/TqRBASdjzzDLjGql0c8PS', 'paciente', '59', '2026-07-30 18:58:30.505764+00', '2026-07-30 19:00:54.648+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (62, 'samugre@yahoo.com.br', 'Samuel Gregrorio', '$2b$10$WiEwUwVcU1NVQxbr5knTHu9bJjfeqrxypxAPqUmx7xI/JywpeWYS2', 'paciente', '61', '2026-07-30 21:17:33.985188+00', '2026-07-30 21:43:17.542+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (65, 'renatarepaginada@gmail.com', 'Renata Araujo', '$2b$10$e5v9YaxETSLDwH8YmULAK..G.0IMzuimiejz6Q13QOrhxmULm5a.G', 'paciente', '64', '2026-08-12 22:07:29.474687+00', '2026-08-13 13:12:34.704+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (66, 'michelleadvicacia@gmail.com', 'Michelle Alcantara', '$2b$10$NN7IZACvrTTGMO5Z3f1/zOH3j9/xAafH7C3F2AijrA5p34tOauKFC', 'paciente', '65', '2026-08-12 22:23:35.668327+00', '2026-08-13 13:16:01.97+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (67, 'vivianemendonca85@hotmail.com', 'Viviane Lopes', '$2b$10$gdPw6txvTVnlMoabcNU/zeUjGs8DEWgu2EP/1Tg3PRtWGBSoIAIMi', 'paciente', '66', '2026-08-12 22:39:31.143407+00', '2026-08-13 13:17:45.665+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (6, 'tatipaulino@yahoo.com.br', 'Ana Carolina', '$2b$10$5mLtqgM.aIarG.QO7FV5F.0BnnrhDZcJ/u6flrK1bmbs.YRUyh0WK', 'paciente', '5', '2026-07-20 22:53:37.164436+00', '2026-08-14 21:08:09.831+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (69, 'elianealencar@gmail.com', 'Eliane Alencar', '$2b$10$okjlQt7VelKLg4pctjuZ3OxLlaW6Wr5IT0F9LPf8hGCU5NSuHnduO', 'paciente', '68', '2026-08-12 22:44:24.22413+00', '2026-08-13 13:19:40.267+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (71, 'biancaropedroso@gmail.com', 'Bianca Rodrigues ', '$2b$10$8Wfw74s4mT9sm/PdSANzPOr6/CkFKqPnRJzpyYMwPEiEXy5MBbsca', 'paciente', '70', '2026-08-13 13:21:17.727301+00', '2026-08-13 13:23:16.996+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (72, 'gnunes50@hotmail.com', 'Gustavo Nunes', '$2b$10$aY1u1c1YJ08V.cPk4UqfsuAlUoaMHq.QrsfSXB/ESHgTi3O4iDyJW', 'paciente', '71', '2026-08-13 14:04:17.878358+00', '2026-08-13 14:05:28.474+00');
INSERT INTO public.users (id, email, name, password_hash, role, patient_id, created_at, updated_at) VALUES (70, 'anderson_slip@hotmail.com', 'Anderson Andrade', '$2b$10$4wJviNo6PmclaLq2dbZwzuiZWV/BOMbNDdPQ5P96KSWSk2q6cJcrS', 'paciente', '69', '2026-08-12 22:46:08.105964+00', '2026-08-13 21:58:32.061+00');


--
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE SET; Schema: _system; Owner: neondb_owner
--

SELECT pg_catalog.setval('_system.replit_database_migrations_v1_id_seq', 4, true);


--
-- Name: consultation_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.consultation_attachments_id_seq', 2, true);


--
-- Name: consultations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.consultations_id_seq', 63, true);


--
-- Name: groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.groups_id_seq', 5, true);


--
-- Name: patient_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.patient_groups_id_seq', 105, true);


--
-- Name: patient_publication_views_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.patient_publication_views_id_seq', 1, false);


--
-- Name: patients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.patients_id_seq', 71, true);


--
-- Name: publication_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.publication_groups_id_seq', 19, true);


--
-- Name: publication_patients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.publication_patients_id_seq', 1, false);


--
-- Name: publications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.publications_id_seq', 38, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 72, true);


--
-- Name: replit_database_migrations_v1 replit_database_migrations_v1_pkey; Type: CONSTRAINT; Schema: _system; Owner: neondb_owner
--

ALTER TABLE ONLY _system.replit_database_migrations_v1
    ADD CONSTRAINT replit_database_migrations_v1_pkey PRIMARY KEY (id);


--
-- Name: consultation_attachments consultation_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.consultation_attachments
    ADD CONSTRAINT consultation_attachments_pkey PRIMARY KEY (id);


--
-- Name: consultations consultations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.consultations
    ADD CONSTRAINT consultations_pkey PRIMARY KEY (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: patient_groups patient_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.patient_groups
    ADD CONSTRAINT patient_groups_pkey PRIMARY KEY (id);


--
-- Name: patient_publication_views patient_publication_views_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.patient_publication_views
    ADD CONSTRAINT patient_publication_views_pkey PRIMARY KEY (id);


--
-- Name: patients patients_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_email_unique UNIQUE (email);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: publication_groups publication_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.publication_groups
    ADD CONSTRAINT publication_groups_pkey PRIMARY KEY (id);


--
-- Name: publication_patients publication_patients_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.publication_patients
    ADD CONSTRAINT publication_patients_pkey PRIMARY KEY (id);


--
-- Name: publications publications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.publications
    ADD CONSTRAINT publications_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_replit_database_migrations_v1_build_id; Type: INDEX; Schema: _system; Owner: neondb_owner
--

CREATE UNIQUE INDEX idx_replit_database_migrations_v1_build_id ON _system.replit_database_migrations_v1 USING btree (build_id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict NPsbwb1hOAZf8Cj8VfXnSz32WBQFJjk9E8x50hS6SalGZahPIHC2yUYEf9ST5hg

