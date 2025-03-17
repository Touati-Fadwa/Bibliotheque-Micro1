# Étape 1 : Utiliser une image officielle de Node.js pour construire l'application React
FROM node:18

# Étape 2 : Définir le répertoire de travail dans l'image Docker
WORKDIR /app

# Étape 3 : Copier les fichiers package.json et package-lock.json pour installer les dépendances
COPY package*.json ./
RUN npm install  # Installer les dépendances du projet

# Étape 4 : Copier tout le reste du code source dans l'image Docker
COPY . .

# Étape 5 : Construire l'application React
RUN npm run build

# Étape 6 : Installer un serveur pour servir l'application construite
RUN npm install -g serve

# Étape 7 : Servir l'application React avec 'serve'
CMD ["serve", "-s", "build"]