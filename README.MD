# Santé Québec — Système d'information médical

Plateforme de gestion des dossiers médicaux destinée aux professionnels de la santé du Québec. Elle permet la consultation, la création et la gestion de dossiers patients, consultations, prescriptions, observations médicales et hospitalisations, avec un contrôle d'accès basé sur les rôles.

---

## Stack technique

| Couche      | Technologie                                      |
|-------------|--------------------------------------------------|
| Frontend    | Next.js 16, React 19, TypeScript, Tailwind CSS   |
| Backend     | Node.js, Express 5, TypeScript                   |
| ORM         | Prisma 7                                         |
| Base de données | PostgreSQL (Neon)                            |
| Auth        | JWT (jsonwebtoken + bcrypt)                      |
| Tests       | Jest + Supertest                                 |

---

## Architecture

```
┌─────────────────────────────────────────────┐
│               Santé Québec                  │
│                                             │
│  ┌──────────────┐       ┌────────────────┐  │
│  │  Web App     │──────▶│   API Express  │  │
│  │  Next.js 16  │  HTTP │   Node.js/TS   │  │
│  └──────────────┘       └───────┬────────┘  │
│                                 │ Prisma     │
│                         ┌───────▼────────┐  │
│                         │  PostgreSQL     │  │
│                         │  (Neon)         │  │
│                         └────────────────┘  │
└─────────────────────────────────────────────┘
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
└── web-app/                    # Frontend Next.js
    └── src/
        ├── app/                # Pages (App Router)
        ├── components/         # Composants UI
        ├── hooks/              # Hooks personnalisés
        └── lib/                # Client API, types, auth
```

---

## Endpoints API

| Méthode | Route                       | Description                        |
|---------|-----------------------------|------------------------------------|
| POST    | `/auth/login`               | Connexion (retourne un JWT)        |
| GET     | `/patients`                 | Liste des patients                 |
| GET     | `/patients/:id`             | Détail d'un patient                |
| GET/POST| `/consultations`            | Consultations médicales            |
| GET/POST| `/observations`             | Observations médicales             |
| GET/POST| `/prescriptions`            | Prescriptions                      |
| GET/POST| `/hospitalisations`         | Hospitalisations                   |
| POST    | `/urgence/acces`            | Accès d'urgence à un dossier       |

---

## Rôles et permissions

| Rôle                | Lecture | Ajout | Modification | Suppression |
|---------------------|:-------:|:-----:|:------------:|:-----------:|
| MEDECIN_GENERAL     | ✅      | ✅    | ✅           | ❌          |
| MEDECIN_SPECIALISTE | ✅      | ✅    | ✅           | ❌          |
| INFIRMIER           | ✅      | ✅    | ❌           | ❌          |
| PHARMACIEN          | ✅      | ❌    | ❌           | ❌          |
| AMBULANCIER         | ✅ (urgence) | ❌ | ❌          | ❌          |
| PATIENT             | ✅      | ❌    | ❌           | ❌          |
| ADMIN               | ❌      | ❌    | ❌           | ❌          |

---

## Installation locale

### Prérequis
- Node.js 20+
- npm
- Une base de données PostgreSQL (ou un compte [Neon](https://neon.tech))

### 1. Cloner le projet
```bash
git clone <url-du-repo>
cd Sante-Quebec
```

### 2. Backend
```bash
cd api
npm install

# Copier et configurer les variables d'environnement
cp .env.example .env
# Remplir DATABASE_URL, JWT_SECRET_KEY, PORT dans .env

# Appliquer les migrations et générer le client Prisma
npx prisma migrate dev
npx prisma generate

# (Optionnel) Charger les données de test
npm run prisma:seed

# Démarrer en développement
npm run dev
```

### 3. Frontend
```bash
cd web-app
npm install

# Copier et configurer les variables d'environnement
cp .env.example .env.local
# Remplir NEXT_PUBLIC_API_URL=http://localhost:3000

# Démarrer en développement
npm run dev
```

---

## Comptes de test (seed)

Tous les comptes ont le mot de passe : **`Password123!`**

### Professionnels de santé

| Email                                    | Nom               | Rôle                | Accès dossiers         |
|------------------------------------------|-------------------|---------------------|------------------------|
| `jean.tremblay@sante-quebec.local`       | Dr Jean Tremblay  | MEDECIN_GENERAL     | 20 patients            |
| `sophie.lavoie@sante-quebec.local`       | Dre Sophie Lavoie | MEDECIN_SPECIALISTE | 10 patients            |
| `david.chen@sante-quebec.local`          | Dr David Chen     | MEDECIN_GENERAL     | 12 patients            |
| `marie.roy@sante-quebec.local`           | Marie Roy         | INFIRMIER           | 20 patients            |
| `luc.bouchard@sante-quebec.local`        | Luc Bouchard      | INFIRMIER           | 10 patients            |
| `anne.girard@sante-quebec.local`         | Anne Girard       | PHARMACIEN          | Lecture seule (tous)   |
| `marc.pelletier@sante-quebec.local`      | Marc Pelletier    | AMBULANCIER         | Accès urgence          |
| `admin@sante-quebec.local`               | Pierre Gagnon     | ADMIN               | Aucun dossier          |

### Comptes patients

| Email                              | Nom               | Rôle    |
|------------------------------------|-------------------|---------|
| `luc.gagné@patient.local`          | Luc Gagné         | PATIENT |
| `suzanne.bélanger@patient.local`   | Suzanne Bélanger  | PATIENT |
| `michel.côté@patient.local`        | Michel Côté       | PATIENT |
| `isabelle.fortin@patient.local`    | Isabelle Fortin   | PATIENT |
| `rené.ouellet@patient.local`       | René Ouellet      | PATIENT |

---

## Tests

```bash
cd api
npm test
```

---

## Déploiement

| Service  | Usage             | Lien                        |
|----------|-------------------|-----------------------------|
| Neon     | Base de données   | https://neon.tech           |
| Railway  | Backend Express   | https://railway.app         |
| Vercel   | Frontend Next.js  | https://vercel.com          |

### Variables d'environnement requises

**Backend (`api/`)** :
```
DATABASE_URL=postgresql://...
JWT_SECRET_KEY=...
PORT=3000
NODE_ENV=production
```

**Frontend (`web-app/`)** :
```
NEXT_PUBLIC_API_URL=https://<url-railway>.up.railway.app
```

---

## Sécurité

- Authentification JWT sur toutes les routes protégées
- Hash des mots de passe avec bcrypt
- Contrôle d'accès par rôle (RBAC) via middleware
- Journal d'audit pour toutes les actions sur les dossiers (`JournalAudit`)
- Accès d'urgence traçable avec date de début/fin (`AccesUrgence`)
- Ne jamais committer le fichier `.env` — utiliser des variables d'environnement sur le serveur
