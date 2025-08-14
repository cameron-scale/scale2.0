const express = require('express');

// Stub integration for Postscript SMS marketing service.
// This router emulates connecting to Postscript and sending/receiving
// marketing messages. Postscript offers a free trial tier, which makes it
// a great starting option for small businesses. In a real
// implementation you would use Postscript's API to manage subscribers
// and campaigns. Here we simply manage an in-memory connection state
// and return dummy messages.

const router = express.Router();
let connected = false;

// GET /api/postscript/status – check if the service is connected
router.get('/status', (req, res) => {
  res.json({ connected });
});

// POST /api/postscript/connect – mark the service as connected
router.post('/connect', (req, res) => {
  connected = true;
  res.json({ connected });
});

// POST /api/postscript/disconnect – mark the service as disconnected
router.post('/disconnect', (req, res) => {
  connected = false;
  res.json({ connected });
});

// GET /api/postscript/messages – return a list of recent SMS messages
router.get('/messages', (req, res) => {
  if (!connected) {
    return res.status(401).json({ error: 'Postscript not connected' });
  }
  const messages = [
    {
      id: '1',
      to: '+15555550123',
      body: 'Exclusive offer: Get 20% off your next order with code LOVE20!',
      date: '2025-08-12T10:15:00Z'
    },
    {
      id: '2',
      to: '+15555550987',
      body: 'Thanks for joining our list! Stay tuned for upcoming promotions.',
      date: '2025-08-11T08:30:00Z'
    }
  ];
  res.json({ messages });
});

// POST /api/postscript/send – simulate sending a message via Postscript
router.post('/send', (req, res) => {
  if (!connected) {
    return res.status(401).json({ error: 'Postscript not connected' });
  }
  const { to, body } = req.body;
  if (!to || !body) {
    return res.status(400).json({ error: 'to and body are required' });
  }
  // In a real integration, we would call the Postscript API here. For now we
  // simply return the payload.
  res.json({ success: true, to, body });
});

module.exports = router;