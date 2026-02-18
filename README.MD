
## DESTKTOP ##

Vite
React
TS
node

## Web ##

React
TS
Vite
JWT
Service Workers (offline)

## Backend ##

Node
TS
Express
Prisma
PostgreSQL
FHIR Adapter
RAMQ Adapter

## Raison ##

✔️ Réduction massive de la complexité
✔️ Partage de types et règles métier
✔️ Facilité de maintenance
✔️ Parfait pour un SI médical sérieux

## Structure ##

            ┌──────────────┐
            │  Backend API │
            │ TS + Node.js │
            └───────▲──────┘
                    │
        ┌───────────┴───────────┐
        │                       │
┌──────────────┐        ┌──────────────┐
│ Desktop App  │        │  Web App     │
│ TS           │        │ TS (React)   │
└──────────────┘        └──────────────┘



|Email	                |Mot de passe	|Rôle	         |Permissions sur le dossier        |
|-----------------------|---------------|----------------|----------------------------------|
|medecin@medical.local	|Password123!	|MEDECIN_GENERAL |lecture, ajout, modification      |
|infirmier@medical.local|Password123!	|INFIRMIER	 |lecture, ajout                    |
|patient@medical.local	|Password123!	|PATIENT	 |lecture seulement                 |
|admin@medical.local	|Password123!	|ADMIN	         |aucune autorisation sur le dossier|
|-----------------------|---------------|----------------|----------------------------------|

