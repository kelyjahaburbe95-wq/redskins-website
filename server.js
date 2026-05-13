const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'produits.json');

app.use(cors());
app.use(express.json({ limit: '50mb' })); // 50mb pour les images base64
app.use(express.static(__dirname)); // Servir les fichiers HTML/CSS/JS

// ── Lire les produits ──
function readProduits() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

// ── Sauvegarder les produits ──
function saveProduits(produits) {
  if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(produits, null, 2));
}

// ── API Routes ──

// GET tous les produits
app.get('/api/produits', (req, res) => {
  const produits = readProduits();
  res.json(produits);
});

// GET produits par marque
app.get('/api/produits/marque/:marque', (req, res) => {
  const produits = readProduits();
  const filtered = produits.filter(p =>
    p.marque.toLowerCase() === req.params.marque.toLowerCase()
  );
  res.json(filtered);
});

// GET un produit par ID
app.get('/api/produits/:id', (req, res) => {
  const produits = readProduits();
  const produit = produits.find(p => p.id === req.params.id);
  if (!produit) return res.status(404).json({ error: 'Produit non trouvé' });
  res.json(produit);
});

// POST ajouter un produit
app.post('/api/produits', (req, res) => {
  const produits = readProduits();
  const nouveau = {
    ...req.body,
    id: req.body.id || req.body.marque.toLowerCase() + '-' + Date.now(),
    createdAt: new Date().toISOString()
  };
  produits.push(nouveau);
  saveProduits(produits);
  res.json({ success: true, produit: nouveau });
});

// PUT modifier un produit
app.put('/api/produits/:id', (req, res) => {
  const produits = readProduits();
  const index = produits.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Produit non trouvé' });
  produits[index] = { ...produits[index], ...req.body };
  saveProduits(produits);
  res.json({ success: true, produit: produits[index] });
});

// DELETE supprimer un produit
app.delete('/api/produits/:id', (req, res) => {
  let produits = readProduits();
  const initial = produits.length;
  produits = produits.filter(p => p.id !== req.params.id);
  if (produits.length === initial) return res.status(404).json({ error: 'Produit non trouvé' });
  saveProduits(produits);
  res.json({ success: true });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur Redskins Franconville démarré sur le port ${PORT}`);
});
