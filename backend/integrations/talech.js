const express = require('express');
const router = express.Router();

// Simulated connection state. In production, store tokens securely.
let connected = false;

// GET /api/talech/status - returns whether the user is connected.
router.get('/status', (req, res) => {
  res.json({ connected });
});

// POST /api/talech/connect - simulate OAuth connection.
router.post('/connect', (req, res) => {
  connected = true;
  res.json({ connected });
});

// POST /api/talech/disconnect - simulate disconnecting the account.
router.post('/disconnect', (req, res) => {
  connected = false;
  res.json({ connected });
});

// GET /api/talech/sales - returns a list of sales.
router.get('/sales', (req, res) => {
  if (!connected) return res.status(401).json({ error: 'Talech not connected' });
  const sales = [
    { id: 'sale1', total: 200.0, date: '2025-08-07' },
    { id: 'sale2', total: 150.75, date: '2025-08-06' },
  ];
  res.json(sales);
});

// GET /api/talech/inventory - returns a list of inventory items.
router.get('/inventory', (req, res) => {
  if (!connected) return res.status(401).json({ error: 'Talech not connected' });
  const inventory = [
    { id: 'prod1', name: 'Widget A', stock: 20 },
    { id: 'prod2', name: 'Widget B', stock: 5 },
  ];
  res.json(inventory);
});

module.exports = router;
