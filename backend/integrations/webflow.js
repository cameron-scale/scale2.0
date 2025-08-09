const express = require('express');
const router = express.Router();

// This module provides stubbed endpoints for Webflow integration.
// In a real implementation, authenticate with Webflow API to fetch
// analytics, form submissions, and site performance data.

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

// GET /api/webflow/analytics – returns dummy site analytics
router.get('/analytics', (req, res) => {
  if (!connected) return res.status(401).json({ error: 'Webflow not connected' });
  const analytics = {
    visitors: 1234,
    pageViews: 3456,
    bounceRate: 0.42,
    avgSessionDuration: 120,
  };
  res.json({ analytics });
});

// GET /api/webflow/forms – returns dummy form submissions
router.get('/forms', (req, res) => {
  if (!connected) return res.status(401).json({ error: 'Webflow not connected' });
  const submissions = [
    { id: 'form1', name: 'Jane Doe', message: 'Interested in your services', submittedAt: '2025-08-07T12:00:00Z' },
    { id: 'form2', name: 'John Smith', message: 'Requesting a quote', submittedAt: '2025-08-06T08:30:00Z' },
  ];
  res.json({ submissions });
});

module.exports = router;
