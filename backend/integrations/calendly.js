const express = require('express');
const router = express.Router();

let connected = false;

// GET /api/calendly/status
router.get('/status', (req, res) => {
  res.json({ connected });
});

// POST /api/calendly/connect
router.post('/connect', (req, res) => {
  connected = true;
  res.json({ connected });
});

// POST /api/calendly/disconnect
router.post('/disconnect', (req, res) => {
  connected = false;
  res.json({ connected });
});

// GET /api/calendly/events – list upcoming bookings
router.get('/events', (req, res) => {
  if (!connected) return res.status(401).json({ error: 'Calendly not connected' });
  const events = [
    { id: 'cal1', name: 'Consultation Call', start: '2025-08-13T16:00:00Z', end: '2025-08-13T16:30:00Z' },
    { id: 'cal2', name: 'Demo Session', start: '2025-08-14T18:00:00Z', end: '2025-08-14T19:00:00Z' },
  ];
  res.json(events);
});

// POST /api/calendly/events – create a new booking
router.post('/events', (req, res) => {
  if (!connected) return res.status(401).json({ error: 'Calendly not connected' });
  const event = req.body;
  res.json({ message: 'Calendly event created (stub)', event });
});

module.exports = router;
