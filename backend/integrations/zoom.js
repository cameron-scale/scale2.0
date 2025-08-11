const express = require('express');
const axios = require('axios');

const router = express.Router();

// Track connection state in memory. In a real implementation, you would persist tokens
// securely and handle refresh logic.
let connected = false;

// GET /api/zoom/status – returns whether Zoom is connected
router.get('/status', (req, res) => {
  res.json({ connected });
});

// POST /api/zoom/connect – initiate OAuth flow
// Responds with a URL that the frontend can redirect the user to in order to authorize Zoom.
router.post('/connect', (req, res) => {
  const clientId = process.env.ZOOM_CLIENT_ID || '<ZOOM_CLIENT_ID>';
  // Use the configured redirect URI or fall back to the production callback on Render
  const redirectUri = process.env.ZOOM_REDIRECT_URI ||
    'https://scale2-0.onrender.com/api/zoom/callback';
  const authorizationUrl =
    `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  res.json({ url: authorizationUrl });
});

// GET /api/zoom/callback – Zoom will redirect back here after the user authorizes the app.
// In a real application, you would exchange the authorization code for an access token.
// Here we simply mark the connection as complete and redirect to the home page.
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  // TODO: Exchange code for access token using client secret
  // For now, we set connected = true to simulate a successful connection
  connected = true;
  // Redirect the user back to the main dashboard after connecting
  res.redirect('/');
});

// POST /api/zoom/disconnect – disconnect from Zoom
router.post('/disconnect', (req, res) => {
  connected = false;
  res.json({ connected });
});

// GET /api/zoom/meetings – return meetings if connected
router.get('/meetings', (req, res) => {
  if (!connected) {
    return res.status(401).json({ error: 'Zoom not connected' });
  }
  // Dummy meetings; replace with actual API call using stored tokens
  const meetings = [
    { id: 'm1', topic: 'Strategy Review', start: '2025-08-09T20:00:00Z', duration: 60 },
    { id: 'm2', topic: 'Client Demo', start: '2025-08-11T17:30:00Z', duration: 45 },
  ];
  res.json(meetings);
});

// POST /api/zoom/meetings – schedule a meeting (stub)
router.post('/meetings', (req, res) => {
  if (!connected) {
    return res.status(401).json({ error: 'Zoom not connected' });
  }
  const meeting = req.body;
  res.json({ message: 'Meeting scheduled (stub)', meeting });
});

module.exports = router;