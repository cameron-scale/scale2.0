const express = require('express');
const router = express.Router();

// This module provides stubbed endpoints for GoDaddy integration.
// A real implementation would authenticate with GoDaddy's API to
// manage domains, products, subscriptions and billing.

let connected = false;

// Returns current connection status
router.get('/status', (req, res) => {
  res.json({ connected });
});

// Simulate connecting to GoDaddy
router.post('/connect', (req, res) => {
  connected = true;
  res.json({ connected });
});

// Simulate disconnecting from GoDaddy
router.post('/disconnect', (req, res) => {
  connected = false;
  res.json({ connected });
});

// GET /api/godaddy/products – return dummy products
router.get('/products', (req, res) => {
  if (!connected) return res.status(401).json({ error: 'GoDaddy not connected' });
  const products = [
    { id: 'prod1', name: 'Domain Registration', price: 12.99 },
    { id: 'prod2', name: 'Email Hosting', price: 4.99 },
  ];
  res.json({ products });
});

// GET /api/godaddy/subscriptions – return dummy subscriptions
router.get('/subscriptions', (req, res) => {
  if (!connected) return res.status(401).json({ error: 'GoDaddy not connected' });
  const subscriptions = [
    { id: 'sub1', product: 'Domain Registration', nextBilling: '2025-09-01', amount: 12.99 },
    { id: 'sub2', product: 'Email Hosting', nextBilling: '2025-08-15', amount: 4.99 },
  ];
  res.json({ subscriptions });
});

module.exports = router;
