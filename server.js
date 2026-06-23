const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Mot de passe admin (change-le !) ──────────────────────────────────────────
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'redskins2024';

// ── Chemins ───────────────────────────────────────────────────────────────────
const DATA_FILE = path.join(__dirname, 'data', 'produits.json');

// ── Middlewares ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '50mb' })); // 50mb pour les photos base64
app.use(express.static(__dirname));       // sert index.html, admin.html, etc.

// ── Helpers ───────────────────────────────────────────────────────────────────
function lireProduits() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function ecrireProduits(produits) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(produits, null, 2), 'utf8');
}

function authAdmin(req, res, next) {
  const mdp = req.headers['x-admin-password'];
  if (mdp !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  next();
}

// ── ROUTES PRODUITS ───────────────────────────────────────────────────────────

// GET /api/produits — liste tous les produits (public)
app.get('/api/produits', (req, res) => {
  res.json(lireProduits());
});

// GET /api/produits/:id — un produit (public)
app.get('/api/produits/:id', (req, res) => {
  const p = lireProduits().find(p => p.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Produit introuvable' });
  res.json(p);
});

// POST /api/produits — ajouter (admin)
app.post('/api/produits', authAdmin, (req, res) => {
  const produits = lireProduits();
  const produit  = req.body;
  if (!produit.id) produit.id = produit.marque.toLowerCase() + '-' + Date.now();
  produits.push(produit);
  ecrireProduits(produits);
  res.json({ success: true, produit });
});

// PUT /api/produits/:id — modifier (admin)
app.put('/api/produits/:id', authAdmin, (req, res) => {
  const produits = lireProduits();
  const i = produits.findIndex(p => p.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Produit introuvable' });
  produits[i] = { ...produits[i], ...req.body };
  ecrireProduits(produits);
  res.json({ success: true, produit: produits[i] });
});

// DELETE /api/produits/:id — supprimer (admin)
app.delete('/api/produits/:id', authAdmin, (req, res) => {
  const produits = lireProduits().filter(p => p.id !== req.params.id);
  ecrireProduits(produits);
  res.json({ success: true });
});

// ── ROUTE AUTH ────────────────────────────────────────────────────────────────

// POST /api/login — vérifier le mot de passe admin
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: 'Mot de passe incorrect' });
  }
});

// ── FALLBACK : toutes les autres routes → index.html ─────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── DÉMARRAGE ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Serveur Redskins démarré sur le port ${PORT}`);
});
