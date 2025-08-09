const express = require('express');
const router = express.Router();

let connected = false;

// GET /api/googleanalytics/status – returns whether connected
router.get('/status', (req, res) => {
  res.json({ connected });
});

// POST /api/googleanalytics/connect – simulate OAuth connection
router.post('/connect', (req, res) => {
  connected = true;
  res.json({ connected });
});

// POST /api/googleanalytics/disconnect – simulate disconnect
router.post('/disconnect', (req, res) => {
  connected = false;
  res.json({ connected });
});

// GET /api/googleanalytics/realtime – returns dummy realtime analytics
router.get('/realtime', (req, res) => {
  if (!connected) return res.status(401).json({ error: 'Google Analytics not connected' });
  const data = {
    activeUsers: 125,
    pageViewsPerMinute: 34,
  };
  res.json(data);
});

// GET /api/googleanalytics/reports – returns dummy aggregated reports
router.get('/reports', (req, res) => {
  if (!connected) return res.status(401).json({ error: 'Google Analytics not connected' });
  const report = {
    sessions: 1200,
    pageViews: 3500,
    avgSessionDuration: 180,
  };
  res.json(report);
});

module.exports = router;
