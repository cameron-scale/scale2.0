const express = require('express');
const router = express.Router();

// This module provides stubbed endpoints for Salesforce integration.
// A real implementation would authenticate with Salesforce and
// perform operations such as creating leads, opportunities,
// and querying accounts.

let connected = false;

router.get('/status', (req, res) => {
  res.json({ connected });
});

router.post('/connect', (req, res) => {
  connected = true;
  res.json({ connected });
});

router.post('/disconnect', (req, res) => {
  connected = false;
  res.json({ connected });
});

// GET /api/salesforce/leads – return dummy leads list
router.get('/leads', (req, res) => {
  if (!connected) return res.status(401).json({ error: 'Salesforce not connected' });
  const leads = [
    { id: 'L1', name: 'BigCo', stage: 'Prospecting', value: 20000 },
    { id: 'L2', name: 'Startup Inc.', stage: 'Qualification', value: 5000 },
  ];
  res.json({ leads });
});

// POST /api/salesforce/leads – create a new lead
router.post('/leads', (req, res) => {
  if (!connected) return res.status(401).json({ error: 'Salesforce not connected' });
  const lead = req.body;
  res.json({ message: 'Lead created (stub)', lead });
});

module.exports = router;
