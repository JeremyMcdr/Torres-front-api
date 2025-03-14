-- Script de création des tables pour l'application TP_CSID
USE TP_CSID;

-- Table pour le CA par pays et par année
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CA_PAYS_ANNEE]') AND type in (N'U'))
BEGIN
    CREATE TABLE CA_PAYS_ANNEE (
        ID INT IDENTITY(1,1) PRIMARY KEY,
        Pays NVARCHAR(100) NOT NULL,
        Annee INT NOT NULL,
        CA DECIMAL(18, 2) NOT NULL,
        CONSTRAINT UC_CA_PAYS_ANNEE UNIQUE (Pays, Annee)
    );
    
    -- Insertion de données de test
    INSERT INTO CA_PAYS_ANNEE (Pays, Annee, CA) VALUES 
    ('France', 2021, 1250000.00),
    ('France', 2022, 1350000.00),
    ('France', 2023, 1450000.00),
    ('Allemagne', 2021, 980000.00),
    ('Allemagne', 2022, 1050000.00),
    ('Allemagne', 2023, 1120000.00),
    ('Espagne', 2021, 750000.00),
    ('Espagne', 2022, 820000.00),
    ('Espagne', 2023, 890000.00),
    ('Italie', 2021, 680000.00),
    ('Italie', 2022, 720000.00),
    ('Italie', 2023, 790000.00),
    ('Royaume-Uni', 2021, 950000.00),
    ('Royaume-Uni', 2022, 1020000.00),
    ('Royaume-Uni', 2023, 1080000.00);
END

-- Table pour le CA par vendeur et par année
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CA_VENDEUR_ANNEE]') AND type in (N'U'))
BEGIN
    CREATE TABLE CA_VENDEUR_ANNEE (
        ID INT IDENTITY(1,1) PRIMARY KEY,
        Groupe_Vendeur NVARCHAR(100) NOT NULL,
        Annee INT NOT NULL,
        CA DECIMAL(18, 2) NOT NULL,
        CONSTRAINT UC_CA_VENDEUR_ANNEE UNIQUE (Groupe_Vendeur, Annee)
    );
    
    -- Insertion de données de test
    INSERT INTO CA_VENDEUR_ANNEE (Groupe_Vendeur, Annee, CA) VALUES 
    ('Équipe A', 2021, 850000.00),
    ('Équipe A', 2022, 920000.00),
    ('Équipe A', 2023, 980000.00),
    ('Équipe B', 2021, 750000.00),
    ('Équipe B', 2022, 810000.00),
    ('Équipe B', 2023, 870000.00),
    ('Équipe C', 2021, 650000.00),
    ('Équipe C', 2022, 700000.00),
    ('Équipe C', 2023, 760000.00),
    ('Équipe D', 2021, 550000.00),
    ('Équipe D', 2022, 600000.00),
    ('Équipe D', 2023, 650000.00);
END

-- Table pour le pourcentage de commandes par commercial
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[POURCENTAGE_COMMANDES_COMMERCIAL]') AND type in (N'U'))
BEGIN
    CREATE TABLE POURCENTAGE_COMMANDES_COMMERCIAL (
        ID INT IDENTITY(1,1) PRIMARY KEY,
        Commercial NVARCHAR(100) NOT NULL,
        Annee INT NOT NULL,
        Nombre_Offres INT NOT NULL,
        Nombre_Commandes INT NOT NULL,
        Pourcentage_Commandes DECIMAL(5, 2) NOT NULL,
        CONSTRAINT UC_POURCENTAGE_COMMANDES_COMMERCIAL UNIQUE (Commercial, Annee)
    );
    
    -- Insertion de données de test
    INSERT INTO POURCENTAGE_COMMANDES_COMMERCIAL (Commercial, Annee, Nombre_Offres, Nombre_Commandes, Pourcentage_Commandes) VALUES 
    ('Dupont', 2021, 120, 45, 37.50),
    ('Dupont', 2022, 135, 52, 38.52),
    ('Dupont', 2023, 150, 62, 41.33),
    ('Martin', 2021, 110, 40, 36.36),
    ('Martin', 2022, 125, 48, 38.40),
    ('Martin', 2023, 140, 56, 40.00),
    ('Durand', 2021, 100, 35, 35.00),
    ('Durand', 2022, 115, 42, 36.52),
    ('Durand', 2023, 130, 50, 38.46),
    ('Leroy', 2021, 90, 30, 33.33),
    ('Leroy', 2022, 105, 37, 35.24),
    ('Leroy', 2023, 120, 45, 37.50);
END

-- Table pour le pourcentage de motifs par année
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[POURCENTAGE_MOTIFS_ANNEE]') AND type in (N'U'))
BEGIN
    CREATE TABLE POURCENTAGE_MOTIFS_ANNEE (
        ID INT IDENTITY(1,1) PRIMARY KEY,
        Motif_Commande NVARCHAR(100) NOT NULL,
        Annee INT NOT NULL,
        Nombre_Commandes INT NOT NULL,
        Pourcentage DECIMAL(5, 2) NOT NULL,
        CONSTRAINT UC_POURCENTAGE_MOTIFS_ANNEE UNIQUE (Motif_Commande, Annee)
    );
    
    -- Insertion de données de test
    INSERT INTO POURCENTAGE_MOTIFS_ANNEE (Motif_Commande, Annee, Nombre_Commandes, Pourcentage) VALUES 
    ('Renouvellement', 2021, 80, 40.00),
    ('Renouvellement', 2022, 90, 38.00),
    ('Renouvellement', 2023, 100, 37.00),
    ('Nouveau client', 2021, 60, 30.00),
    ('Nouveau client', 2022, 75, 32.00),
    ('Nouveau client', 2023, 85, 31.00),
    ('Expansion', 2021, 40, 20.00),
    ('Expansion', 2022, 50, 21.00),
    ('Expansion', 2023, 60, 22.00),
    ('Remplacement', 2021, 20, 10.00),
    ('Remplacement', 2022, 22, 9.00),
    ('Remplacement', 2023, 27, 10.00);
END

-- Table pour les objectifs commerciaux par année
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CA_OBJECTIF_COMMERCIAL_ANNEE]') AND type in (N'U'))
BEGIN
    CREATE TABLE CA_OBJECTIF_COMMERCIAL_ANNEE (
        ID INT IDENTITY(1,1) PRIMARY KEY,
        Groupe_Vendeur NVARCHAR(100) NOT NULL,
        Annee INT NOT NULL,
        Objectif_Commercial DECIMAL(18, 2) NOT NULL,
        CA DECIMAL(18, 2) NOT NULL,
        CONSTRAINT UC_CA_OBJECTIF_COMMERCIAL_ANNEE UNIQUE (Groupe_Vendeur, Annee)
    );
    
    -- Insertion de données de test
    INSERT INTO CA_OBJECTIF_COMMERCIAL_ANNEE (Groupe_Vendeur, Annee, Objectif_Commercial, CA) VALUES 
    ('Équipe A', 2021, 900000.00, 850000.00),
    ('Équipe A', 2022, 950000.00, 920000.00),
    ('Équipe A', 2023, 1000000.00, 980000.00),
    ('Équipe B', 2021, 800000.00, 750000.00),
    ('Équipe B', 2022, 850000.00, 810000.00),
    ('Équipe B', 2023, 900000.00, 870000.00),
    ('Équipe C', 2021, 700000.00, 650000.00),
    ('Équipe C', 2022, 750000.00, 700000.00),
    ('Équipe C', 2023, 800000.00, 760000.00),
    ('Équipe D', 2021, 600000.00, 550000.00),
    ('Équipe D', 2022, 650000.00, 600000.00),
    ('Équipe D', 2023, 700000.00, 650000.00);
END 