# Santé Québec — Système d'information médical

Plateforme de gestion des dossiers médicaux destinée aux professionnels de la santé du Québec. Elle permet la consultation, la création et la gestion de dossiers patients, consultations, prescriptions, observations médicales et hospitalisations, avec un contrôle d'accès basé sur les rôles.

---

## Stack technique

| Couche          | Technologie                                          |
|-----------------|------------------------------------------------------|
| Web App         | Next.js 16, React 19, TypeScript, Tailwind CSS 4     |
| App bureau      | Electron 40, Vite 7, React 19, React Router 7        |
| Backend         | Node.js, Express 5, TypeScript                       |
| ORM             | Prisma 7                                             |
| Base de données | PostgreSQL (Neon)                                    |
| Auth            | JWT (jsonwebtoken + bcrypt)                          |
| Tests           | Jest + Supertest                                     |

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Santé Québec                       │
│                                                      │
│  ┌──────────────┐   ┌──────────────┐                 │
│  │  Web App     │   │  App bureau  │                 │
│  │  Next.js 16  │   │  Electron 40 │                 │
│  │  (Vercel)    │   │  (local)     │                 │
│  └──────┬───────┘   └──────┬───────┘                 │
│         │  HTTPS           │  charge le web-app      │
│         └──────────┬───────┘                         │
│                    ▼                                 │
│           ┌────────────────┐                         │
│           │   API Express  │                         │
│           │   Node.js/TS   │                         │
│           │   (Vercel)     │                         │
│           └───────┬────────┘                         │
│                   │ Prisma                           │
│           ┌───────▼────────┐                         │
│           │  PostgreSQL     │                         │
│           │  (Neon)         │                         │
│           └────────────────┘                         │
└──────────────────────────────────────────────────────┘
```

---

## Structure du projet

```
Sante-Quebec/
├── api/                        # Backend Express
│   ├── prisma/
│   │   ├── schema.prisma       # Modèles de données
│   │   └── seed.ts             # Données de test
│   └── src/
│       ├── controllers/        # Logique des routes
│       ├── services/           # Logique métier
│       ├── middlewares/        # Auth, permissions, urgence
│       ├── routes/             # Définition des endpoints
│       ├── utils/              # Prisma client, audit
│       └── __tests__/          # Tests Jest
│
├── web-app/                    # Frontend Next.js (déployé sur Vercel)
│   └── src/
│       ├── app/                # Pages (App Router)
│       ├── components/         # Composants UI
│       ├── hooks/              # Hooks personnalisés
│       └── lib/                # Client API, types, auth
│
└── desktop-app/                # Application bureau Electron
    ├── electron/               # Processus principal Electron
    │   └── main.ts
    └── renderer/               # Interface React (Vite)
        └── src/
            ├── pages/          # Pages de l'app
            ├── components/     # Sidebar, layout
            └── lib/            # API, auth, types, rôles
```

---

## URLs de production

| Service      | URL                                          |
|--------------|----------------------------------------------|
| Web App      | https://sante-quebec.vercel.app              |
| Backend API  | https://sante-quebec-be.vercel.app           |
| Base données | Neon PostgreSQL (via Prisma)                 |

---

## Endpoints API

### Authentification
| Méthode | Route            | Description                          |
|---------|------------------|--------------------------------------|
| POST    | `/auth/login`    | Connexion — retourne un JWT (8h)     |
| POST    | `/auth/register` | Création de compte                   |
| GET     | `/auth/me`       | Infos de l'utilisateur connecté      |

### Patients & Dossiers
| Méthode | Route                                    | Description                        |
|---------|------------------------------------------|------------------------------------|
| GET     | `/patients/dossiers`                     | Dossiers accessibles               |
| GET     | `/patients/dossier/:id`                  | Profil du patient                  |
| PUT     | `/patients/dossier/:id`                  | Modifier le profil                 |
| PUT     | `/patients/dossier/:id/medecin-traitant` | Assigner un médecin traitant       |

### Données médicales
| Méthode    | Route                              | Description             |
|------------|------------------------------------|-------------------------|
| GET / POST | `/consultations/dossier/:id`       | Consultations           |
| GET / POST | `/observations/dossier/:id`        | Observations            |
| GET / POST | `/prescriptions/dossier/:id`       | Prescriptions           |
| GET / POST | `/hospitalisations/dossier/:id`    | Hospitalisations        |

### Autres
| Méthode | Route                              | Description                         |
|---------|------------------------------------|-------------------------------------|
| GET     | `/medecins`                        | Liste des médecins                  |
| GET     | `/urgence/recherche/:numAssurance` | Rechercher un patient (urgence)     |
| POST    | `/urgence/dossier/:id`             | Activer un accès d'urgence          |
| GET     | `/admin/users`                     | Liste des comptes (ADMIN)           |
| POST    | `/admin/users`                     | Créer un compte (ADMIN)             |
| PUT     | `/admin/users/:id`                 | Modifier un compte (ADMIN)          |
| DELETE  | `/admin/users/:id`                 | Supprimer un compte (ADMIN)         |

---

## Rôles et permissions

| Rôle                | Dossiers | Consultations | Observations | Prescriptions | Urgence | Admin |
|---------------------|:--------:|:-------------:|:------------:|:-------------:|:-------:|:-----:|
| MEDECIN_GENERAL     | R / W    | R / W         | R / W        | R / W         | ✅      | ❌    |
| MEDECIN_SPECIALISTE | R / W    | R / W         | R / W        | R / W         | ✅      | ❌    |
| INFIRMIER           | R        | R             | R / W        | R             | ❌      | ❌    |
| PHARMACIEN          | R        | R             | R            | R             | ❌      | ❌    |
| AMBULANCIER         | ❌       | ❌            | ❌           | ❌            | ✅      | ❌    |
| PATIENT             | R (sien) | R             | ❌           | R             | ❌      | ❌    |
| ADMIN               | ❌       | ❌            | ❌           | ❌            | ✅      | ✅    |

> R = Lecture, W = Écriture

---

## Comptes de test (seed)

Tous les comptes ont le mot de passe : **`Password123!`**

> Les emails sont insensibles à la casse (ex: `Admin@Sante-Quebec.LOCAL` fonctionne).

### Professionnels de santé

| Email                                    | Nom               | Rôle                |
|------------------------------------------|-------------------|---------------------|
| `admin@sante-quebec.local`               | Pierre Gagnon     | ADMIN               |
| `jean.tremblay@sante-quebec.local`       | Dr Jean Tremblay  | MEDECIN_GENERAL     |
| `sophie.lavoie@sante-quebec.local`       | Dre Sophie Lavoie | MEDECIN_SPECIALISTE |
| `david.chen@sante-quebec.local`          | Dr David Chen     | MEDECIN_GENERAL     |
| `marie.roy@sante-quebec.local`           | Marie Roy         | INFIRMIER           |
| `luc.bouchard@sante-quebec.local`        | Luc Bouchard      | INFIRMIER           |
| `anne.girard@sante-quebec.local`         | Anne Girard       | PHARMACIEN          |
| `marc.pelletier@sante-quebec.local`      | Marc Pelletier    | AMBULANCIER         |

### Comptes patients (quelques exemples)

| Email                              | Nom               |
|------------------------------------|-------------------|
| `luc.gagné@patient.local`          | Luc Gagné         |
| `suzanne.bélanger@patient.local`   | Suzanne Bélanger  |
| `michel.côté@patient.local`        | Michel Côté       |
| `isabelle.fortin@patient.local`    | Isabelle Fortin   |
| `rené.ouellet@patient.local`       | René Ouellet      |

---

## Installation locale

### Prérequis
- Node.js 20+
- npm
- Un compte [Neon](https://neon.tech) (ou PostgreSQL local)

### 1. Cloner le projet
```bash
git clone <url-du-repo>
cd Sante-Quebec
```

### 2. Backend
```bash
cd api
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Remplir DATABASE_URL et JWT_SECRET_KEY dans .env

# Synchroniser le schéma et générer le client Prisma
npx prisma db push
npx prisma generate

# Charger les données de test
npm run prisma:seed

# Démarrer en développement
npm run dev
```

### 3. Web App
```bash
cd web-app
npm install

# Configurer la variable d'environnement
echo "NEXT_PUBLIC_API_URL=https://sante-quebec-be.vercel.app" > .env

# Démarrer en développement
npm run dev
```

### 4. App bureau (Electron)
```bash
cd desktop-app
npm install

# Compiler et lancer
npm run build:electron
npm start
```

> L'app bureau charge directement `https://sante-quebec.vercel.app` — aucune configuration supplémentaire requise.

---

## Tests

```bash
cd api
npm test
```

---

## Déploiement

| Service  | Usage             | URL de production                        |
|----------|-------------------|------------------------------------------|
| Vercel   | Backend Express   | https://sante-quebec-be.vercel.app       |
| Vercel   | Frontend Next.js  | https://sante-quebec.vercel.app          |
| Neon     | Base de données   | https://neon.tech                        |

### Variables d'environnement requises

**Backend (`api/`)** :
```
DATABASE_URL=postgresql://...
JWT_SECRET_KEY=...
NODE_ENV=production
```

**Frontend (`web-app/`)** :
```
NEXT_PUBLIC_API_URL=https://sante-quebec-be.vercel.app
```

---

## Sécurité

- Authentification JWT sur toutes les routes protégées (expiration 8h)
- Hash des mots de passe avec bcrypt
- Contrôle d'accès par rôle (RBAC) via middleware
- Emails normalisés en minuscules (insensible à la casse)
- Journal d'audit pour toutes les actions sur les dossiers (`JournalAudit`)
- Accès d'urgence traçable avec horodatage (`AccesUrgence`)
- CORS restreint à `https://sante-quebec.vercel.app`
- Ne jamais committer le fichier `.env`
