const express = require('express');
const router = express.Router();

// Simple in‑memory connection flag. In a real integration, you would
// store OAuth tokens or API keys for the user here.
let connected = false;

// Check connection status
router.get('/status', (req, res) => {
  res.json({ connected });
});

// Simulate connecting to Duda. In a real implementation you would
// redirect the user to Duda's OAuth page and handle the callback.
router.post('/connect', (req, res) => {
  connected = true;
  res.json({ connected });
});

// Simulate disconnecting from Duda
router.post('/disconnect', (req, res) => {
  connected = false;
  res.json({ connected });
});

// Build a website for the user. Accepts business name and description.
router.post('/build', (req, res) => {
  if (!connected) {
    return res.status(401).json({ error: 'Duda not connected' });
  }
  const { businessName, description } = req.body;
  // In a real implementation, call the Duda API to create a site here.
  res.json({ message: `A new website for ${businessName} is being generated. Once finished, you can edit it via your project manager.` });
});

// Edit an existing Duda site. Accepts a list of changes.
router.post('/edit', (req, res) => {
  if (!connected) {
    return res.status(401).json({ error: 'Duda not connected' });
  }
  const { changes } = req.body;
  // In a real implementation, this would call Duda's API to apply changes.
  res.json({ message: 'Your requested edits have been sent to your project manager.', changes });
});

module.exports = router;