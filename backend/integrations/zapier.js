const express = require('express');
const router = express.Router();

// Simulated connection state. In production, store tokens securely.
let connected = false;

// GET /api/zapier/status - returns whether the user is connected.
router.get('/status', (req, res) => {
  res.json({ connected });
});

// POST /api/zapier/connect - simulate OAuth connection.
router.post('/connect', (req, res) => {
  connected = true;
  res.json({ connected });
});

// POST /api/zapier/disconnect - simulate disconnecting the account.
router.post('/disconnect', (req, res) => {
  connected = false;
  res.json({ connected });
});

// GET /api/zapier/triggers - returns a list of triggers.
router.get('/triggers', (req, res) => {
  if (!connected) return res.status(401).json({ error: 'Zapier not connected' });
  const triggers = [
    { id: 'trg1', event: 'new_sale', active: true },
    { id: 'trg2', event: 'new_lead', active: false },
  ];
  res.json(triggers);
});

// POST /api/zapier/triggers - create a new trigger.
router.post('/triggers', (req, res) => {
  if (!connected) return res.status(401).json({ error: 'Zapier not connected' });
  const trigger = req.body;
  res.json({ message: 'Trigger created', trigger });
});

module.exports = router;
