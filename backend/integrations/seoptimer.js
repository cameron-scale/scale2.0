const express = require('express');
const router = express.Router();
let connected = false;

// Get connection status
router.get('/status', (req, res) => {
  res.json({ connected });
});

// Connect to SEOptimer
router.post('/connect', (req, res) => {
  connected = true;
  res.json({ message: 'Connected to SEOptimer' });
});

// Disconnect from SEOptimer
router.post('/disconnect', (req, res) => {
  connected = false;
  res.json({ message: 'Disconnected from SEOptimer' });
});

// Run a new SEO report
router.post('/run', (req, res) => {
  if (!connected) {
    return res.status(401).json({ error: 'Not connected to SEOptimer' });
  }
  // Simulate generating a report
  res.json({ reportId: 'report-123', status: 'completed' });
});

// Get recent SEO reports
router.get('/reports', (req, res) => {
  if (!connected) {
    return res.status(401).json({ error: 'Not connected to SEOptimer' });
  }
  // Return dummy report data
  res.json([
    { id: 'report-1', date: '2025-08-07', score: 85 },
    { id: 'report-2', date: '2025-07-30', score: 90 }
  ]);
});

module.exports = router;
