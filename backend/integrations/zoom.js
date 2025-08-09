const express = require('express');
const router = express.Router();

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

router.get('/meetings', (req, res) => {
  if (!connected) return res.status(401).json({ error: 'Zoom not connected' });
  const meetings = [
    { id: 'm1', topic: 'Strategy Review', start: '2025-08-09T20:00:00Z', duration: 60 },
    { id: 'm2', topic: 'Client Demo', start: '2025-08-11T17:30:00Z', duration: 45 },
  ];
  res.json(meetings);
});

router.post('/meetings', (req, res) => {
  if (!connected) return res.status(401).json({ error: 'Zoom not connected' });
  const meeting = req.body;
  res.json({ message: 'Meeting scheduled (stub)', meeting });
});

module.exports = router;
