# 🎯 Dart's Bli

- Sommaire
  - [📱 Description](#description)
  - [🔧 Prérequis](#prerequis)
  - [🚀 Installation](#installation)
  - [💻 Développement Local](#developpement-local)
    - [Lancer le serveur de développement](#lancer-le-serveur-de-developpement)
    - [Lancer sur des plateformes spécifiques](#lancer-sur-des-plateformes-specifiques)
    - [Tests](#tests)
  - [📱 Utilisation avec Expo Go sur Mobile](#utilisation-avec-expo-go-sur-mobile)
  - [📦 Build et Distribution](#build-et-distribution)
  - [🔄 Mises à jour et CI/CD](#mises-a-jour-et-cicd)
  - [🏗️ Structure du Projet](#structure-du-projet)
  - [🔧 Technologies Utilisées](#technologies-utilisees)
  - [📝 Scripts Disponibles](#scripts-disponibles)
  - [🐛 Débogage](#debogage)
  - [📄 Licence](#licence)
  - [👨‍💻 Auteur](#auteur)

Une application mobile de comptage de points pour les fléchettes, développée avec Expo et React Native.

<a id="description"></a>
## 📱 Description

Dart's Bli est une application de fléchettes qui permet de :
- Gérer des parties en 501 ou 301 points
- Suivre les scores de plusieurs joueurs
- Gérer les tours et la rotation des joueurs
- Sauvegarder les parties localement
- Jouer hors ligne (aucune connexion requise)
- Finition simple ou double finish

<a id="prerequis"></a>
## 🔧 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/) (version 18 ou supérieure)
- [pnpm](https://pnpm.io/) (gestionnaire de paquets recommandé)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

```bash
npm install -g pnpm
npm install -g @expo/cli
```

<a id="installation"></a>
## 🚀 Installation

1. Clonez le repository :
```bash
git clone <url-du-repo>
cd darts-bli
```

2. Installez les dépendances :
```bash
pnpm install
```

<a id="developpement-local"></a>
## 💻 Développement Local

<a id="lancer-le-serveur-de-developpement"></a>
### Lancer le serveur de développement

```bash
# Lancer le serveur de développement
pnpm start

# Ou avec expo directement
expo start
```

<a id="lancer-sur-des-plateformes-specifiques"></a>
### Lancer sur des plateformes spécifiques

```bash
# Android
pnpm run android
# ou
expo start --android

# iOS (macOS uniquement)
pnpm run ios
# ou  
expo start --ios

# Web
pnpm run web
# ou
expo start --web
```

<a id="tests"></a>
### Tests

```bash
# Lancer les tests en mode watch
pnpm test
```

<a id="utilisation-avec-expo-go-sur-mobile"></a>
## 📱 Utilisation avec Expo Go sur Mobile

### Installation d'Expo Go

1. Téléchargez l'application **Expo Go** :
   - [Android - Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)

### Connexion à l'application

1. Lancez le serveur de développement :
```bash
pnpm start
```

2. Un QR code apparaîtra dans le terminal et dans votre navigateur

3. Scannez le QR code :
   - **Android** : Ouvrez Expo Go et scannez le QR code
   - **iOS** : Utilisez l'appareil photo natif pour scanner le QR code

4. L'application se chargera automatiquement sur votre téléphone

### Développement en temps réel

- Les modifications du code sont automatiquement rechargées sur votre appareil
- Secouez votre téléphone pour ouvrir le menu de développement
- Le Hot Reload est activé par défaut

<a id="build-et-distribution"></a>
## 📦 Build et Distribution

### Configuration EAS

L'application utilise **EAS Build** pour générer les builds de production. La configuration se trouve dans `eas.json`.

### Build APK pour Android

#### 1. Installation d'EAS CLI

```bash
npm install -g eas-cli
```

#### 2. Connexion à votre compte Expo

```bash
eas login
```

#### 3. Build de preview (APK)

```bash
# Build APK pour test
eas build --platform android --profile preview
```

#### 4. Build de production

```bash
# Build AAB pour Google Play Store
eas build --platform android --profile production
```

#### 5. Téléchargement du build

Une fois le build terminé :
- Connectez-vous sur [expo.dev](https://expo.dev)
- Allez dans votre projet > Builds
- Téléchargez l'APK ou AAB généré

### Build iOS

```bash
# Build pour iOS (nécessite un compte développeur Apple)
eas build --platform ios --profile production
```

<a id="mises-a-jour-et-cicd"></a>
## 🔄 Mises à jour et CI/CD

### Mises à jour OTA (Over-The-Air)

L'application supporte les mises à jour OTA via **EAS Update** :

```bash
# Publier une mise à jour pour les builds de preview
eas update --channel preview --message "Première mise à jour"

# Publier une mise à jour pour la production  
eas update --channel production --message "Description de la mise à jour"
```

> **Note :** Utilisez `--channel preview` pour les APK générés avec le profil preview, et `--channel production` pour les builds de production.

### Configuration CI/CD

#### GitHub Actions (exemple)

Créez `.github/workflows/build.yml` :

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Setup pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8
        
    - name: Install dependencies
      run: pnpm install
      
    - name: Run tests
      run: pnpm test -- --coverage --watchAll=false
      
    - name: Setup EAS
      uses: expo/expo-github-action@v8
      with:
        eas-version: latest
        token: ${{ secrets.EXPO_TOKEN }}
        
    - name: Build Android APK
      run: eas build --platform android --profile preview --non-interactive
      if: github.ref == 'refs/heads/main'
```

#### Variables d'environnement requises

Dans votre CI/CD, configurez :
- `EXPO_TOKEN` : Token d'authentification Expo
- Autres variables selon vos besoins

### Automatisation des déploiements

```bash
# Script de déploiement automatique
#!/bin/bash

# Mise à jour de version
npm version patch

# Build pour toutes les plateformes
eas build --platform all --profile production

# Publication d'une mise à jour OTA
eas update --branch production --message "Version $(node -p "require('./package.json').version")"

# Commit et push des changements
git add .
git commit -m "Release version $(node -p "require('./package.json').version")"
git push origin main
```

<a id="structure-du-projet"></a>
## 🏗️ Structure du Projet

```
darts-bli/
├── app/                    # Pages (Expo Router)
│   ├── (tabs)/            # Navigation par onglets
│   ├── game/              # Écrans de jeu
│   └── _layout.tsx        # Layout principal
├── components/            # Composants réutilisables
│   ├── game/             # Composants spécifiques au jeu
│   └── Themed.tsx        # Composants avec thème
├── models/               # Logique métier
│   ├── game.ts          # Classe Game principale
│   ├── player.ts        # Gestion des joueurs
│   └── playerInRow.ts   # Gestion des tours
├── repository/          # Couche de persistance
├── types/              # Définitions TypeScript
├── constants/          # Constantes de l'application
├── assets/            # Images et ressources
├── app.json          # Configuration Expo
├── eas.json          # Configuration EAS Build
└── package.json      # Dépendances et scripts
```

<a id="technologies-utilisees"></a>
## 🔧 Technologies Utilisées

- **Expo SDK** ~49.0.15
- **React Native** 0.72.6
- **TypeScript** 5.1.3
- **Expo Router** 2.0.0 (navigation)
- **AsyncStorage** (persistance locale)
- **EAS Build** (builds natifs)
- **EAS Update** (mises à jour OTA)

<a id="scripts-disponibles"></a>
## 📝 Scripts Disponibles

```bash
# Développement
pnpm start          # Serveur de développement
pnpm run android    # Android
pnpm run ios        # iOS
pnpm run web        # Web

# Tests
pnpm test           # Tests en mode watch

# Build et déploiement
eas build --platform android --profile preview  # APK de test
eas build --platform android --profile production  # Build de production
eas update --channel preview  # Mise à jour OTA pour preview
eas update --channel production  # Mise à jour OTA pour production
```

<a id="debogage"></a>
## 🐛 Débogage

### Outils de développement

- **Flipper** : Débogage avancé
- **React Native Debugger** : Débogage React/Redux
- **Expo Dev Tools** : Outils intégrés Expo

### Logs

```bash
# Voir les logs Android
adb logcat

# Voir les logs iOS
xcrun simctl spawn booted log stream --predicate 'eventMessage contains "your-app"'

# Logs Expo
expo logs
```

<a id="licence"></a>
## 📄 Licence

Ce projet est sous licence privée. Tous droits réservés.

<a id="auteur"></a>
## 👨‍💻 Auteur

Made with ❤️ by **Nolyo**

---

Pour plus d'informations sur Expo, consultez la [documentation officielle](https://docs.expo.dev/).
