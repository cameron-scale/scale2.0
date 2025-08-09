const express = require('express');
const router = express.Router();

// This module provides stubbed endpoints for QuickBooks integration.
// In a real implementation, you would perform OAuth and call the Intuit
// API to fetch data such as accounts, customers, invoices, and bills.

// Simulated connection state. In production, store tokens securely.
let connected = false;

// GET /api/quickbooks/status – returns whether the user is connected.
router.get('/status', (req, res) => {
  res.json({ connected });
});

// POST /api/quickbooks/connect – simulate OAuth connection.
router.post('/connect', (req, res) => {
  connected = true;
  res.json({ connected });
});

// POST /api/quickbooks/disconnect – simulate disconnecting the account.
router.post('/disconnect', (req, res) => {
  connected = false;
  res.json({ connected });
});

// GET /api/quickbooks/accounts – returns a list of accounts.
router.get('/accounts', (req, res) => {
  if (!connected) return res.status(401).json({ error: 'QuickBooks not connected' });
  // Dummy account data. Replace with actual QuickBooks API call.
  const accounts = [
    { id: '1', name: 'Checking Account', balance: 12000.55 },
    { id: '2', name: 'Savings Account', balance: 5400.12 },
  ];
  res.json({ accounts });
});

// GET /api/quickbooks/customers – returns a list of customers.
router.get('/customers', (req, res) => {
  if (!connected) return res.status(401).json({ error: 'QuickBooks not connected' });
  const customers = [
    { id: 'c1', name: 'John Doe', balance: 300.0 },
    { id: 'c2', name: 'Acme Corp', balance: 0.0 },
  ];
  res.json({ customers });
});

// POST /api/quickbooks/invoices – create a new invoice (stub).
router.post('/invoices', (req, res) => {
  if (!connected) return res.status(401).json({ error: 'QuickBooks not connected' });
  const invoice = req.body;
  // In real implementation, send invoice to QuickBooks API
  res.json({ message: 'Invoice created (stub)', invoice });
});

module.exports = router;
