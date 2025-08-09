const express = require('express');
const router = express.Router();

// Simulated connection state. In production, store tokens securely.
let connected = false;

// GET /api/convergepay/status - returns whether the user is connected.
router.get('/status', (req, res) => {
  res.json({ connected });
});

// POST /api/convergepay/connect - simulate OAuth connection.
router.post('/connect', (req, res) => {
  connected = true;
  res.json({ connected });
});

// POST /api/convergepay/disconnect - simulate disconnecting the account.
router.post('/disconnect', (req, res) => {
  connected = false;
  res.json({ connected });
});

// GET /api/convergepay/transactions - returns a list of transactions.
router.get('/transactions', (req, res) => {
  if (!connected) return res.status(401).json({ error: 'Converge Pay not connected' });
  // Dummy transaction data. Replace with actual Converge Pay API call.
  const transactions = [
    { id: 'tx1', amount: 120.0, currency: 'USD', status: 'completed', date: '2025-08-08' },
    { id: 'tx2', amount: 75.5, currency: 'USD', status: 'pending', date: '2025-08-07' },
  ];
  res.json(transactions);
});

// POST /api/convergepay/charge - create a new transaction (charge).
router.post('/charge', (req, res) => {
  if (!connected) return res.status(401).json({ error: 'Converge Pay not connected' });
  const charge = req.body;
  // In a real implementation, send charge to Converge Pay here.
  res.json({ message: 'Charge processed', charge });
});

module.exports = router;
