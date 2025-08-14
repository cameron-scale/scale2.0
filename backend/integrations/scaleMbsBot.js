const express = require('express');
const router = express.Router();

// This integration stub represents the Scale MBS Bot API. In a real implementation,
// you would use the provided service and admin keys stored in environment variables
// (e.g. SCALE_MBS_SERVICE_KEY, SCALE_MBS_ADMIN_KEY) to authenticate with the
// external API and perform actions such as sending messages or retrieving data.
// For now, this stub simply tracks a connection state and returns placeholder
// responses so the frontend can be wired up without waiting for the full API
// integration. Replace the placeholder logic with real API calls once the
// external API documentation and endpoints are available.

let connected = false;

// GET /status – returns whether the Scale MBS Bot is connected
router.get('/status', (req, res) => {
  res.json({ connected });
});

// POST /connect – simulate connecting to the Scale MBS Bot API
router.post('/connect', (req, res) => {
  connected = true;
  res.json({ connected });
});

// POST /disconnect – simulate disconnecting from the Scale MBS Bot API
router.post('/disconnect', (req, res) => {
  connected = false;
  res.json({ connected });
});

// GET /messages – return a list of recent messages from the bot (placeholder)
router.get('/messages', (req, res) => {
  if (!connected) {
    return res.status(401).json({ error: 'Scale MBS Bot not connected' });
  }
  // Placeholder messages; replace with real data from the API once available
  const messages = [
    { id: 'msg1', from: 'ScaleMBSBot', text: 'Welcome to Scale MBS Bot!', timestamp: Date.now() - 60000 },
    { id: 'msg2', from: 'ScaleMBSBot', text: 'Ask me anything about your business.', timestamp: Date.now() - 30000 },
  ];
  res.json({ messages });
});

// POST /send – send a message to the bot (placeholder)
router.post('/send', (req, res) => {
  if (!connected) {
    return res.status(401).json({ error: 'Scale MBS Bot not connected' });
  }
  const { message } = req.body;
  // In a real implementation, you would forward the message to the external API
  // using the service/admin keys. Here we just echo back a response.
  res.json({ reply: `Scale MBS Bot received: ${message}` });
});

module.exports = router;