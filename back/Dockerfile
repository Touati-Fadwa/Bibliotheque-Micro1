# Étape 1 : Utiliser une image officielle de Node.js comme base
FROM node:18

# Étape 2 : Définir le répertoire de travail dans l'image Docker
WORKDIR /app

# Étape 3 : Copier les fichiers package.json et package-lock.json pour installer les dépendances
COPY package*.json ./
RUN npm install  # Installer les dépendances du projet

# Étape 4 : Copier tout le reste du code source dans l'image Docker
COPY . .

# Étape 5 : Exposer le port sur lequel l'application backend va fonctionner
EXPOSE 3000

# Étape 6 : Lancer l'application avec la commande 'npm start'
CMD ["npm", "start"]