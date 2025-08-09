const express = require('express');
const router = express.Router();

let connected = false;

// GET /api/googlecalendar/status
router.get('/status', (req, res) => {
  res.json({ connected });
});

// POST /api/googlecalendar/connect
router.post('/connect', (req, res) => {
  connected = true;
  res.json({ connected });
});

// POST /api/googlecalendar/disconnect
router.post('/disconnect', (req, res) => {
  connected = false;
  res.json({ connected });
});

// GET /api/googlecalendar/events – list upcoming events
router.get('/events', (req, res) => {
  if (!connected) return res.status(401).json({ error: 'Google Calendar not connected' });
  const events = [
    { id: 'evt1', title: 'Weekly Sales Meeting', start: '2025-08-10T15:00:00Z', end: '2025-08-10T16:00:00Z' },
    { id: 'evt2', title: 'Project Kickoff', start: '2025-08-12T18:00:00Z', end: '2025-08-12T19:00:00Z' },
  ];
  res.json(events);
});

// POST /api/googlecalendar/events – create a new event
router.post('/events', (req, res) => {
  if (!connected) return res.status(401).json({ error: 'Google Calendar not connected' });
  const event = req.body;
  res.json({ message: 'Event created (stub)', event });
});

module.exports = router;
