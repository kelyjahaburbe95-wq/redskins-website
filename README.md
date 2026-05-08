# 🔴 REDSKINS — Site Vitrine 3D

Site vitrine de la franchise Redskins, version 3D avec Three.js.

## Structure des fichiers

```
redskins-website/
├── index.html        ← Structure HTML de la page
├── css/
│   └── style.css     ← Tous les styles (mise en page, animations, responsive)
├── js/
│   └── main.js       ← Three.js 3D, curseur, tilt des cartes, scroll
└── README.md
```

## Librairies utilisées (CDN)

- **Three.js r128** — Fond 3D animé avec particules et formes géométriques
- **Google Fonts** — Bebas Neue, Barlow, Barlow Condensed

## Fonctionnalités

- 🎮 Fond 3D interactif (1800 particules + formes géométriques)
- 🖱️ Curseur personnalisé avec anneau rouge
- 🃏 Effet tilt 3D sur les cartes au survol
- ✨ Animations au scroll (fade in)
- 📱 Responsive mobile
- 🔴 Design fidèle à la marque Redskins

## Branches GitHub

| Branche | Description |
|---------|-------------|
| `main`  | Version 3D (principale) |
| `dev`   | Pour les futures modifications |

## Déploiement GitHub Pages

1. Va dans **Settings** du repo
2. Section **Pages**
3. Source → **Deploy from a branch** → `main` → `/ (root)`
4. Ton site sera en ligne sur `https://ton-username.github.io/redskins-website`
