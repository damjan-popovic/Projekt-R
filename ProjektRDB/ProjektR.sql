PGDMP                       }            my_database    17.2    17.2                0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            	           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            
           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false                       1262    16616    my_database    DATABASE     �   CREATE DATABASE my_database WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';
    DROP DATABASE my_database;
                     postgres    false            �            1259    16629    accommodation    TABLE     �   CREATE TABLE public.accommodation (
    accommodationid integer NOT NULL,
    name text NOT NULL,
    numofrooms integer,
    capacity integer,
    numofbeds integer,
    numofbathrooms integer,
    accrating numeric DEFAULT 0,
    hostid integer
);
 !   DROP TABLE public.accommodation;
       public         heap r       postgres    false            �            1259    16628 !   accommodation_accommodationid_seq    SEQUENCE     �   CREATE SEQUENCE public.accommodation_accommodationid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 8   DROP SEQUENCE public.accommodation_accommodationid_seq;
       public               postgres    false    220                       0    0 !   accommodation_accommodationid_seq    SEQUENCE OWNED BY     g   ALTER SEQUENCE public.accommodation_accommodationid_seq OWNED BY public.accommodation.accommodationid;
          public               postgres    false    219            �            1259    16618    host    TABLE     �   CREATE TABLE public.host (
    hostid integer NOT NULL,
    hostname text NOT NULL,
    hostsurname text DEFAULT ''::text,
    hostrating numeric DEFAULT 0
);
    DROP TABLE public.host;
       public         heap r       postgres    false            �            1259    16617    host_hostid_seq    SEQUENCE     �   CREATE SEQUENCE public.host_hostid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.host_hostid_seq;
       public               postgres    false    218                       0    0    host_hostid_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.host_hostid_seq OWNED BY public.host.hostid;
          public               postgres    false    217            �            1259    16644    location    TABLE     �   CREATE TABLE public.location (
    locationid integer NOT NULL,
    geolength numeric,
    geowidth numeric,
    accommodationid integer
);
    DROP TABLE public.location;
       public         heap r       postgres    false            �            1259    16643    location_locationid_seq    SEQUENCE     �   CREATE SEQUENCE public.location_locationid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.location_locationid_seq;
       public               postgres    false    222                       0    0    location_locationid_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.location_locationid_seq OWNED BY public.location.locationid;
          public               postgres    false    221            d           2604    16632    accommodation accommodationid    DEFAULT     �   ALTER TABLE ONLY public.accommodation ALTER COLUMN accommodationid SET DEFAULT nextval('public.accommodation_accommodationid_seq'::regclass);
 L   ALTER TABLE public.accommodation ALTER COLUMN accommodationid DROP DEFAULT;
       public               postgres    false    219    220    220            a           2604    16621    host hostid    DEFAULT     j   ALTER TABLE ONLY public.host ALTER COLUMN hostid SET DEFAULT nextval('public.host_hostid_seq'::regclass);
 :   ALTER TABLE public.host ALTER COLUMN hostid DROP DEFAULT;
       public               postgres    false    217    218    218            f           2604    16647    location locationid    DEFAULT     z   ALTER TABLE ONLY public.location ALTER COLUMN locationid SET DEFAULT nextval('public.location_locationid_seq'::regclass);
 B   ALTER TABLE public.location ALTER COLUMN locationid DROP DEFAULT;
       public               postgres    false    222    221    222                      0    16629    accommodation 
   TABLE DATA           �   COPY public.accommodation (accommodationid, name, numofrooms, capacity, numofbeds, numofbathrooms, accrating, hostid) FROM stdin;
    public               postgres    false    220   c                 0    16618    host 
   TABLE DATA           I   COPY public.host (hostid, hostname, hostsurname, hostrating) FROM stdin;
    public               postgres    false    218   9!                 0    16644    location 
   TABLE DATA           T   COPY public.location (locationid, geolength, geowidth, accommodationid) FROM stdin;
    public               postgres    false    222   �!                  0    0 !   accommodation_accommodationid_seq    SEQUENCE SET     P   SELECT pg_catalog.setval('public.accommodation_accommodationid_seq', 22, true);
          public               postgres    false    219                       0    0    host_hostid_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.host_hostid_seq', 22, true);
          public               postgres    false    217                       0    0    location_locationid_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.location_locationid_seq', 22, true);
          public               postgres    false    221            j           2606    16637     accommodation accommodation_pkey 
   CONSTRAINT     k   ALTER TABLE ONLY public.accommodation
    ADD CONSTRAINT accommodation_pkey PRIMARY KEY (accommodationid);
 J   ALTER TABLE ONLY public.accommodation DROP CONSTRAINT accommodation_pkey;
       public                 postgres    false    220            h           2606    16627    host host_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.host
    ADD CONSTRAINT host_pkey PRIMARY KEY (hostid);
 8   ALTER TABLE ONLY public.host DROP CONSTRAINT host_pkey;
       public                 postgres    false    218            l           2606    16651    location location_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.location
    ADD CONSTRAINT location_pkey PRIMARY KEY (locationid);
 @   ALTER TABLE ONLY public.location DROP CONSTRAINT location_pkey;
       public                 postgres    false    222            m           2606    16638 '   accommodation accommodation_hostid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.accommodation
    ADD CONSTRAINT accommodation_hostid_fkey FOREIGN KEY (hostid) REFERENCES public.host(hostid);
 Q   ALTER TABLE ONLY public.accommodation DROP CONSTRAINT accommodation_hostid_fkey;
       public               postgres    false    4712    218    220            n           2606    16652 &   location location_accommodationid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.location
    ADD CONSTRAINT location_accommodationid_fkey FOREIGN KEY (accommodationid) REFERENCES public.accommodation(accommodationid);
 P   ALTER TABLE ONLY public.location DROP CONSTRAINT location_accommodationid_fkey;
       public               postgres    false    222    4714    220               �  x���Mn�@��է(i��=��FX" GY���2=cw[�nC�,�X�
E�8
�'GH�G�*
[^�z��}��k]���O�ju�d	N �)?1D E��Z�p~|���<	��r��@VQjC�0ɝ&��m��qTS��!�S}`�~>���B�C�-^PC&Wk��n�]b�-Yת[�T��g!<�*���dv�78�3�31�l�zO����᰹X@�sE��ϝ�7ʴ��b{S�ܖșKˁ�Y�tP���F풅8�����:g���+m�$���놽r�+~����t�b	/m�+������wEQ'Y
AR��%7��X�I��;e$��;Iy$J�,��_aʣiʧp���S>�<�h�4�XBJUu�g�6[�l�w߿���~����Dk�o� ~����s�O��3{m4��ϔ��k���c��]�N;8�h,ލ���p2]         �   x�uα
�@���S������P�"�:������޻�µ��'!?c#^��h�0�Wź8w�q��x��a�;�V(������J:`
��S>qj�E並k�E/F}<C��b�0�Д��ĸ���z��s�I�5q��L�9��X�l��b���v��D���O         �   x�m�ɍE1��E�=�e�c�����R��d�d�y�"��X6��tw���HW�$+J�>�0�&����E�Ң����c���ͮz%F�LQ-��J�➤��Ѧ�Q3d`��%��yC��*���6'lRج�ia��&���>��߮�s���.Ln6��]��w���P�     