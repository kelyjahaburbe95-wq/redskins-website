const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tmdkdsrvprwasoykgpoa.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_AuaFVLzaeu73N9U-i7f2VQ_sjo9coIa';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

async function supabaseCall(method, path, body = null) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=representation' : 'return=representation'
    },
    body: body ? JSON.stringify(body) : null
  });
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

// Convertir les champs du produit pour Supabase
function toSupabase(p) {
  return {
    id: p.id,
    nom: p.nom,
    marque: p.marque,
    ref: p.ref || '',
    categorie: p.categorie || '',
    description: p.desc || p.description || '',
    prix: p.prix || 0,
    prix_reduit: p.prixReduit || null,
    promo_actif: p.promoActif || false,
    promo_label: p.promoLabel || '',
    tailles: p.tailles || [],
    couleurs: p.couleurs || [],
    photos: p.photos || [],
    page: p.page || '',
    created_at: p.created_at || new Date().toISOString()
  };
}

// Convertir de Supabase vers le format du site
function fromSupabase(p) {
  return {
    id: p.id,
    nom: p.nom,
    marque: p.marque,
    ref: p.ref,
    categorie: p.categorie,
    desc: p.description,
    prix: p.prix,
    prixReduit: p.prix_reduit,
    promoActif: p.promo_actif,
    promoLabel: p.promo_label,
    tailles: p.tailles || [],
    couleurs: p.couleurs || [],
    photos: p.photos || [],
    page: p.page,
    created_at: p.created_at
  };
}

// GET tous les produits
app.get('/api/produits', async (req, res) => {
  try {
    const data = await supabaseCall('GET', '/produits?order=created_at.desc');
    res.json(data.map(fromSupabase));
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// GET produits par marque
app.get('/api/produits/marque/:marque', async (req, res) => {
  try {
    const data = await supabaseCall('GET', `/produits?marque=eq.${encodeURIComponent(req.params.marque)}&order=created_at.desc`);
    res.json(data.map(fromSupabase));
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// GET produit par ID
app.get('/api/produits/:id', async (req, res) => {
  try {
    const data = await supabaseCall('GET', `/produits?id=eq.${req.params.id}`);
    if (!data.length) return res.status(404).json({ error: 'Produit non trouvé' });
    res.json(fromSupabase(data[0]));
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// POST ajouter un produit
app.post('/api/produits', async (req, res) => {
  try {
    const produit = toSupabase({
      ...req.body,
      id: req.body.id || req.body.marque.toLowerCase() + '-' + Date.now()
    });
    const data = await supabaseCall('POST', '/produits', produit);
    res.json({ success: true, produit: data[0] ? fromSupabase(data[0]) : produit });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT modifier un produit
app.put('/api/produits/:id', async (req, res) => {
  try {
    const produit = toSupabase(req.body);
    await supabaseCall('PATCH', `/produits?id=eq.${req.params.id}`, produit);
    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE supprimer un produit
app.delete('/api/produits/:id', async (req, res) => {
  try {
    await supabaseCall('DELETE', `/produits?id=eq.${req.params.id}`);
    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Serveur Redskins Franconville démarré sur le port ${PORT}`);
});
