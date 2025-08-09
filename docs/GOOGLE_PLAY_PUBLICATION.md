# 📱 Publication sur Google Play Store - Dart's Bli

Guide complet pour publier l'application Dart's Bli sur Google Play Store.

## 📋 **Prérequis**

### 1. Compte Google Play Console
- **Coût :** 25$ (paiement unique à vie)
- **Inscription :** [play.google.com/console](https://play.google.com/console)
- **Délai :** Validation du compte sous 24-48h

### 2. Informations requises
- Nom de l'app, description, captures d'écran
- Icône haute résolution (512x512px)
- Privacy Policy (obligatoire)
- Informations de contact

## 🔨 **Étapes de Publication**

### 1. Build de Production
```bash
# Generate production AAB (pas APK pour Play Store)
eas build --platform android --profile production
```

### 2. Configuration app.json
Vérifier que ces champs sont bien configurés dans `app.json` :
```json
{
  "expo": {
    "android": {
      "package": "com.nolyo.dartsbli",
      "versionCode": 1,
      "permissions": []
    }
  }
}
```

### 3. Upload sur Play Console

**A. Créer l'app :**
- Nom : "Dart's Bli" 
- Package : `com.nolyo.dartsbli`
- Catégorie : Jeux > Sports

**B. Upload du AAB :**
- Section "Release" > "Production"
- Upload du fichier AAB généré par EAS
- Définir les release notes

### 4. Store Listing

**Informations de base :**
- **Titre :** Dart's Bli
- **Description courte :** App de fléchettes pour compter les points (80 caractères max)
- **Description longue :** Plus détaillée (4000 caractères max)

**Assets visuels requis :**
- **Captures d'écran :** 2-8 screenshots (différentes tailles d'écran)
- **Icône :** 512x512px
- **Bannière :** 1024x500px (optionnel mais recommandé)

**Exemple de description courte :**
"Comptez vos points aux fléchettes facilement. Parties 501/301, multijoueurs, hors ligne."

**Exemple de description longue :**
```
🎯 Dart's Bli - L'application parfaite pour vos parties de fléchettes !

FONCTIONNALITÉS :
• Parties 501 et 301 points
• Support multi-joueurs
• Gestion automatique des tours
• Sauvegarde locale des parties
• Mode hors ligne complet
• Finition simple ou double finish
• Interface intuitive et rapide

COMMENT JOUER :
1. Créez une nouvelle partie
2. Ajoutez vos joueurs
3. Choisissez le mode (501 ou 301)
4. Commencez à compter !

PARFAIT POUR :
• Parties entre amis
• Tournois de fléchettes
• Entraînement personnel
• Clubs de fléchettes

Aucune connexion internet requise. Vos données restent privées sur votre appareil.
```

### 5. Classification du Contenu
- Remplir le questionnaire sur le contenu
- Pour une app de fléchettes : généralement "Tous publics"
- Aucun contenu sensible ou publicitaire

### 6. Privacy Policy
**Options :**
- Générateur gratuit : [privacypolicytemplate.net](https://privacypolicytemplate.net)
- [privacy-policy-template.com](https://privacy-policy-template.com)

**Points clés à mentionner :**
- Données stockées localement uniquement
- Aucune collecte de données personnelles
- Aucun partage avec des tiers
- Contact pour questions : votre email

## 🚀 **Processus de Publication**

### Release en Étapes (Recommandé)

#### 1. Internal Testing (optionnel)
- Upload initial pour tests internes
- Testez vous-même l'AAB depuis Play Console

#### 2. Closed Testing (optionnel)  
- Tests avec liste d'emails (vos amis actuels)
- Maximum 2000 testeurs

#### 3. Open Testing (optionnel)
- Beta publique
- Feedback avant release officielle

#### 4. Production
- Publication officielle pour tous

### Commandes pour les mises à jour futures
```bash
# 1. Incrémenter la version dans app.json
# "version": "1.0.1" (version name)
# "android.versionCode": 2 (doit toujours augmenter)

# 2. Build nouvelle version
eas build --platform android --profile production

# 3. Upload via Play Console + Release notes obligatoires

# 4. Push une mise à jour OTA (optionnel)
eas update --channel production --message "Bug fixes and improvements"
```

## 💡 **Bonnes Pratiques**

### Versioning
- **Version Name :** "1.0.0" (visible aux utilisateurs)
- **Version Code :** 1, 2, 3... (interne, doit toujours augmenter)

### Assets
- Screenshots sur différents devices (téléphone, tablette)
- Icône sans texte (Google ajoute automatiquement le nom)
- Description SEO-friendly avec mots-clés : "fléchettes", "darts", "compteur", "score"

### Tests avant publication
- Testez l'AAB sur différents appareils
- Vérifiez les permissions demandées
- Testez les updates OTA
- Vérifiez que l'app fonctionne hors ligne

### Screenshots recommandés
1. Écran d'accueil
2. Création d'une partie
3. Interface de jeu en cours
4. Tableau des scores
5. Paramètres du jeu

## ⏱️ **Timeline**

1. **Setup compte Google :** 1-2 jours
2. **Préparation assets :** 1-2 jours  
3. **Première soumission :** 2-3 jours de review Google
4. **Mises à jour futures :** Quelques heures à 24h

## 🔄 **EAS Update + Play Store**

Une fois publié, vous pourrez pousser des mises à jour instantanées :

```bash
# Les utilisateurs Play Store recevront les updates via :
eas update --channel production --message "Bug fixes and improvements"
```

**Avantage :** Updates instantanées sans passer par la review Google pour les changements JavaScript !

## 📝 **Checklist avant publication**

- [ ] Compte Google Play Console créé et validé (25$)
- [ ] Build production AAB généré avec EAS
- [ ] Icône 512x512px créée
- [ ] 2-8 screenshots pris
- [ ] Privacy Policy rédigée et hébergée
- [ ] Description courte et longue écrites
- [ ] Classification de contenu remplie
- [ ] Tests de l'AAB effectués
- [ ] Release notes préparées

## 🆘 **Support et Resources**

- **Documentation officielle :** [developer.android.com/distribute](https://developer.android.com/distribute)
- **EAS Build docs :** [docs.expo.dev/build](https://docs.expo.dev/build)
- **Play Console Help :** [support.google.com/googleplay](https://support.google.com/googleplay)

---

**Note :** Ce processus est pour la première publication. Les mises à jour ultérieures sont beaucoup plus simples !