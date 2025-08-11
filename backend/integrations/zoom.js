const express = require('express');
const axios = require('axios');

const router = express.Router();

// Keep connection state and tokens in memory for demonstration. In production
// store tokens securely and refresh them as needed.
let connected = false;
let zoomAccessToken = null;
let zoomRefreshToken = null;

// GET /api/zoom/status – return whether Zoom is connected.
router.get('/status', (req, res) => {
  res.json({ connected });
});

// POST /api/zoom/connect – initiate OAuth flow. Returns a URL to redirect the user to.
router.post('/connect', (req, res) => {
  const clientId = process.env.ZOOM_CLIENT_ID || '<ZOOM_CLIENT_ID>';
  const redirectUri = process.env.ZOOM_REDIRECT_URI ||
    'https://scale2-0.onrender.com/api/zoom/callback';
  const authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  res.json({ url: authUrl });
});

// GET /api/zoom/callback – handle OAuth callback and exchange code for tokens.
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('Missing authorization code');
  }
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  const redirectUri = process.env.ZOOM_REDIRECT_URI ||
    'https://scale2-0.onrender.com/api/zoom/callback';
  try {
    const tokenResp = await axios.post('https://zoom.us/oauth/token', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      },
      auth: {
        username: clientId,
        password: clientSecret,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    zoomAccessToken = tokenResp.data.access_token;
    zoomRefreshToken = tokenResp.data.refresh_token;
    connected = true;
    return res.redirect('/');
  } catch (err) {
    console.error('Zoom OAuth error:', err.response?.data || err.message);
    return res.status(500).send('Error exchanging authorization code');
  }
});

// POST /api/zoom/disconnect – clear tokens and mark as disconnected.
router.post('/disconnect', (req, res) => {
  connected = false;
  zoomAccessToken = null;
  zoomRefreshToken = null;
  res.json({ connected });
});

// Helper to fetch meetings from Zoom API if token available.
async function fetchZoomMeetings() {
  if (!zoomAccessToken) {
    return null;
  }
  try {
    const resp = await axios.get('https://api.zoom.us/v2/users/me/meetings', {
      headers: {
        Authorization: `Bearer ${zoomAccessToken}`,
      },
    });
    return resp.data.meetings || resp.data;
  } catch (err) {
    console.error('Zoom API error:', err.response?.data || err.message);
    return null;
  }
}

// GET /api/zoom/meetings – return meetings from Zoom or stub data.
router.get('/meetings', async (req, res) => {
  if (!connected) {
    return res.status(401).json({ error: 'Zoom not connected' });
  }
  const meetings = await fetchZoomMeetings();
  if (meetings) {
    return res.json(meetings);
  }
  // Fallback to dummy data if API call fails
  const dummy = [
    { id: 'm1', topic: 'Strategy Review', start: '2025-08-09T20:00:00Z', duration: 60 },
    { id: 'm2', topic: 'Client Demo', start: '2025-08-11T17:30:00Z', duration: 45 },
  ];
  return res.json(dummy);
});

// POST /api/zoom/meetings – schedule a meeting or stub.
router.post('/meetings', async (req, res) => {
  if (!connected) {
    return res.status(401).json({ error: 'Zoom not connected' });
  }
  const meeting = req.body;
  if (zoomAccessToken) {
    try {
      const resp = await axios.post('https://api.zoom.us/v2/users/me/meetings', meeting, {
        headers: {
          Authorization: `Bearer ${zoomAccessToken}`,
          'Content-Type': 'application/json',
        },
      });
      return res.json(resp.data);
    } catch (err) {
      console.error('Create Zoom meeting error:', err.response?.data || err.message);
      // fall through to stub
    }
  }
  return res.json({ message: 'Meeting scheduled (stub)', meeting });
});

module.exports = router;
