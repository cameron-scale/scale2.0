const express = require('express');
const router = express.Router();

// This module provides stubbed endpoints for Outlook integration.
// In a real implementation, you would authenticate with Microsoft Graph
// and fetch emails, send messages, and manage calendars.

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

// GET /api/outlook/messages – return dummy recent messages
router.get('/messages', (req, res) => {
  if (!connected) return res.status(401).json({ error: 'Outlook not connected' });
  const messages = [
    {
      id: 'msg1',
      subject: 'Welcome to Scale 2.0',
      from: 'support@example.com',
      receivedDateTime: '2025-08-07T10:00:00Z',
    },
    {
      id: 'msg2',
      subject: 'Your invoice is due',
      from: 'billing@vendor.com',
      receivedDateTime: '2025-08-06T09:30:00Z',
    },
  ];
  res.json({ messages });
});

// POST /api/outlook/send – send an email (stub)
router.post('/send', (req, res) => {
  if (!connected) return res.status(401).json({ error: 'Outlook not connected' });
  const { to, subject, body } = req.body;
  res.json({ message: 'Email sent (stub)', to, subject, body });
});

module.exports = router;
