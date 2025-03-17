
# Bibliothèque ISET Tozeur

Application de gestion de bibliothèque pour l'ISET Tozeur.

## Structure du Projet

Ce projet est organisé en trois dossiers principaux:

- **front**: Contient l'interface utilisateur
- **back**: Contient le serveur backend et l'API
- **database**: Contient les scripts SQL et instructions pour la base de données

## Prérequis

- Node.js (v14 ou supérieur)
- PostgreSQL (v12 ou supérieur)

## Installation

### 1. Base de données

Suivez les instructions dans `database/setup.md` pour configurer la base de données PostgreSQL.

### 2. Backend

```bash
cd back
npm install
cp .env.example .env
# Modifiez le fichier .env avec vos paramètres
npm start
```

Le serveur sera accessible à l'adresse `http://localhost:3000`.

### 3. Frontend

Le frontend est une simple application HTML/CSS/JS qui peut être servie par n'importe quel serveur web statique.

Pour un développement rapide, vous pouvez utiliser l'extension Live Server de VS Code ou exécuter:

```bash
cd front
npx serve
```

Puis visitez `http://localhost:5000` dans votre navigateur.

## Fonctionnalités

### Connexion

- Les utilisateurs peuvent se connecter en tant qu'administrateur ou étudiant
- Identifiants administrateur: 
  - Email: `admin@iset.tn`
  - Mot de passe: `admin123`

### Espace administrateur

- Ajouter de nouveaux étudiants avec leurs informations personnelles
- Créer des identifiants de connexion pour les étudiants

### Espace étudiant

- Connexion avec email et mot de passe
- Page d'accueil pour l'étudiant

## Développement futur

- Gestion des livres (ajout, modification, suppression)
- Système d'emprunt et de retour de livres
- Notifications pour les retards
- Interface de recherche avancée

## Licence

Ce projet est la propriété de l'ISET Tozeur.
