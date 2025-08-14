const express = require('express');
const router = express.Router();

// In‑memory connection state. In a real implementation, you would
// manage OAuth tokens and refresh them as needed.
let connected = false;

// GET /api/slack/status – return connection state
router.get('/status', (req, res) => {
  res.json({ connected });
});

// POST /api/slack/connect – simulate connecting to Slack. A real
// integration would redirect the user to Slack’s OAuth authorization URL.
router.post('/connect', (req, res) => {
  connected = true;
  res.json({ connected });
});

// POST /api/slack/disconnect – disconnect from Slack
router.post('/disconnect', (req, res) => {
  connected = false;
  res.json({ connected });
});

// GET /api/slack/channels – return a list of channels. Only works when
// connected; otherwise returns a 401.
router.get('/channels', (req, res) => {
  if (!connected) {
    return res.status(401).json({ error: 'Slack not connected' });
  }
  res.json({ channels: [
    { id: 'general', name: 'general' },
    { id: 'random', name: 'random' },
    { id: 'sales', name: 'sales-team' }
  ] });
});

// GET /api/slack/messages – return recent messages for a given channel.
// Accepts a query parameter `channelId`. In a real integration, you
// would pass this on to Slack’s conversations.history API.
router.get('/messages', (req, res) => {
  if (!connected) {
    return res.status(401).json({ error: 'Slack not connected' });
  }
  const { channelId } = req.query;
  const messages = [
    { user: 'U123', text: 'Hello team!', ts: '1691970000' },
    { user: 'U456', text: 'Quarterly numbers look great', ts: '1691973600' }
  ];
  res.json({ channelId: channelId || 'general', messages });
});

module.exports = router;