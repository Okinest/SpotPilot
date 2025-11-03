# 🎵 Spotify Profile Viewer

Une application web interactive permettant de visualiser et gérer votre profil Spotify, vos artistes suivis, et de rechercher du contenu musical.

![Spotify](https://img.shields.io/badge/Spotify-1DB954?style=for-the-badge&logo=spotify&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Fonctionnalités

- 🔐 **Authentification sécurisée** via OAuth 2.0 avec PKCE
- 👤 **Affichage du profil** utilisateur Spotify
- 🎤 **Liste des artistes suivis** avec détails (followers, genres)
- 🔍 **Recherche de morceaux et d'artistes**
- ➕ **Suivre/Ne plus suivre** des artistes directement depuis l'application
- 🎧 **Lecteur intégré** pour écouter des extraits de morceaux
- 💾 **Gestion automatique** des tokens d'authentification
- 🎨 **Interface moderne** inspirée du design Spotify

## 🚀 Technologies utilisées

- **TypeScript** - Langage de programmation typé
- **Vite** - Build tool et serveur de développement rapide
- **Tailwind CSS** - Framework CSS utilitaire (via CDN)
- **Spotify Web API** - API officielle Spotify
- **OAuth 2.0 + PKCE** - Authentification sécurisée

## 📋 Prérequis

- [Node.js](https://nodejs.org/) (version 18 ou supérieure)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- Un compte [Spotify Developer](https://developer.spotify.com/dashboard/)

## ⚙️ Configuration

### 1. Créer une application Spotify

1. Rendez-vous sur le [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Cliquez sur "Create app"
3. Remplissez les informations :
   - **App name** : Spotify Profile Viewer (ou autre nom)
   - **App description** : Application pour visualiser mon profil Spotify
   - **Redirect URI** : `http://127.0.0.1:5173/callback`
   - **API/SDKs** : Web API
4. Acceptez les conditions et créez l'application
5. Notez votre **Client ID**

### 2. Configuration du projet

1. Clonez le projet ou téléchargez-le
2. Ouvrez le fichier `src/script.ts`
3. Remplacez le `clientId` à la ligne 4 par votre propre Client ID Spotify :

```typescript
const clientId = "VOTRE_CLIENT_ID_ICI";
```

## 📦 Installation

```bash
# Installer les dépendances
npm install
```

## 🏃‍♂️ Lancement

### Mode développement

```bash
npm run dev
```

L'application sera accessible à l'adresse : `http://127.0.0.1:5173`

### Build de production

```bash
npm run build
```

Les fichiers de production seront générés dans le dossier `dist/`

### Aperçu de la production

```bash
npm run preview
```

## 🎯 Utilisation

1. **Connexion** : Cliquez sur "Sign in with Spotify"
2. **Autorisation** : Autorisez l'application à accéder à vos données Spotify
3. **Navigation** : 
   - Visualisez votre profil et vos informations
   - Parcourez vos artistes suivis
   - Utilisez la barre de recherche pour trouver des morceaux ou artistes
   - Cliquez sur un morceau pour afficher le lecteur intégré
   - Suivez ou ne suivez plus des artistes directement depuis les résultats de recherche

## 📁 Structure du projet

```
exercice_api/
├── src/
│   ├── script.ts              # Point d'entrée principal
│   ├── authCodeWithPkce.ts    # Gestion OAuth 2.0 avec PKCE
│   ├── tokenManager.ts        # Gestion des tokens d'accès
│   ├── types.d.ts             # Définitions TypeScript
│   └── style.css              # Styles personnalisés
├── public/                    # Ressources statiques
├── index.html                 # Page HTML principale
├── package.json               # Dépendances et scripts
├── tsconfig.json              # Configuration TypeScript
└── README.md                  # Documentation
```

## 🔑 API Spotify utilisées

L'application utilise les endpoints suivants de l'API Spotify :

- `GET /v1/me` - Récupération du profil utilisateur
- `GET /v1/me/following` - Liste des artistes suivis
- `GET /v1/search` - Recherche de morceaux et artistes
- `PUT /v1/me/following` - Suivre un artiste
- `DELETE /v1/me/following` - Ne plus suivre un artiste
- `GET /v1/me/following/contains` - Vérifier si l'utilisateur suit des artistes

## 🔒 Sécurité

- **PKCE (Proof Key for Code Exchange)** : Implémentation sécurisée de l'OAuth 2.0
- **Tokens stockés localement** : Les tokens d'accès sont stockés dans le localStorage
- **Validation automatique** : Les tokens expirés sont automatiquement détectés et supprimés
- **Scopes limités** : Seules les permissions nécessaires sont demandées :
  - `user-read-private` - Lecture du profil
  - `user-read-email` - Lecture de l'email
  - `user-follow-read` - Lecture des artistes suivis
  - `user-follow-modify` - Modification des artistes suivis

## 🎨 Personnalisation

L'application utilise le thème Spotify avec les couleurs principales :
- Vert Spotify : `#1db954`
- Fond noir : `#000000`
- Gris foncé : `#181818`

Pour personnaliser les couleurs, modifiez les classes Tailwind dans `index.html` et les styles personnalisés dans la balise `<style>`.

## 🐛 Résolution de problèmes

### L'application ne se connecte pas

- Vérifiez que votre Client ID est correct dans `src/script.ts`
- Vérifiez que l'URL de redirection `http://127.0.0.1:5173/callback` est bien configurée dans votre application Spotify Developer Dashboard
- Vérifiez que le serveur de développement tourne bien sur `127.0.0.1:5173`


### Erreur de token expiré

- Le token est automatiquement supprimé et vous serez redirigé vers la page de connexion
- Reconnectez-vous simplement à l'application


---

**Note** : Cette application nécessite un compte Spotify actif pour fonctionner. Les fonctionnalités disponibles dépendent du type de compte (Free ou Premium).

