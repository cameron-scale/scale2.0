const express = require('express');
const axios = require('axios');

const router = express.Router();

/**
 * Integration for the Scale MBS Bot API.
 *
 * This module exposes a set of routes to connect, disconnect, fetch
 * messages, and send messages through the external Scale MBS Bot API.
 * The API requires two credentials: a service account key for reading
 * messages and an admin key for sending messages. These credentials
 * should be stored in environment variables `SCALE_MBS_SERVICE_KEY` and
 * `SCALE_MBS_ADMIN_KEY` respectively.  An optional environment variable
 * `SCALE_MBS_API_BASE_URL` can be used to change the API host; it
 * defaults to `https://api.scalembsbot.com`.
 *
 * If the keys or API endpoint are missing, the routes will fall back
 * to returning placeholder data so the front‑end remains functional
 * during development.
 */

// Track whether the external API has been connected.  This simply gates
// access to the other endpoints; no external requests are made until
// connected is set to true.
let connected = false;

/**
 * Build a complete URL to the Scale MBS Bot API.  If the base URL ends
 * with a slash and the provided path starts with a slash, the extra
 * slash is removed to avoid duplication.  If the base URL is not
 * defined, fall back to a sensible default.
 *
 * @param {string} path The path to append to the base URL
 * @returns {string} The full URL
 */
function buildUrl(path) {
  const base = process.env.SCALE_MBS_API_BASE_URL || 'https://api.scalembsbot.com';
  const cleanBase = base.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

/**
 * Retrieve recent messages from the external API.  Uses the service key
 * if available; otherwise returns placeholder data.  All API errors
 * are caught so that the app does not crash during development.
 *
 * @returns {Promise<Array>} An array of message objects
 */
async function fetchMessages() {
  const serviceKey = process.env.SCALE_MBS_SERVICE_KEY;
  // If there is no service key configured, return stubbed data
  if (!serviceKey) {
    return [
      { id: 'msg1', from: 'ScaleMBSBot', text: 'Welcome to Scale MBS Bot!', timestamp: Date.now() - 60000 },
      { id: 'msg2', from: 'ScaleMBSBot', text: 'Ask me anything about your business.', timestamp: Date.now() - 30000 },
    ];
  }
  try {
    const response = await axios.get(buildUrl('/messages'), {
      headers: {
        Authorization: `Bearer ${serviceKey}`,
      },
    });
    const data = response.data;
    // The API may return an object with a `messages` property or an array
    return Array.isArray(data) ? data : data.messages || [];
  } catch (err) {
    console.error('Failed to fetch messages from Scale MBS Bot API:', err.message);
    // Fall back to placeholder messages on failure
    return [
      { id: 'msg1', from: 'ScaleMBSBot', text: 'Welcome to Scale MBS Bot!', timestamp: Date.now() - 60000 },
      { id: 'msg2', from: 'ScaleMBSBot', text: 'Ask me anything about your business.', timestamp: Date.now() - 30000 },
    ];
  }
}

/**
 * Send a message to the external API.  Uses the admin key if
 * available; otherwise echoes the input.  All API errors are caught
 * so that the app does not crash during development.
 *
 * @param {string} message The message to send
 * @returns {Promise<Object>} The API response or an echo reply
 */
async function sendMessageToApi(message) {
  const adminKey = process.env.SCALE_MBS_ADMIN_KEY;
  if (!adminKey) {
    return { reply: `Scale MBS Bot received: ${message}` };
  }
  try {
    const response = await axios.post(
      buildUrl('/messages'),
      { message },
      {
        headers: {
          Authorization: `Bearer ${adminKey}`,
        },
      },
    );
    return response.data;
  } catch (err) {
    console.error('Failed to send message to Scale MBS Bot API:', err.message);
    return { reply: `Scale MBS Bot received: ${message}` };
  }
}

// Check the current connection status
router.get('/status', (req, res) => {
  res.json({ connected });
});

// Connect to the Scale MBS Bot API.  In reality this might involve
// validating the provided keys or performing an OAuth handshake.  For
// now we simply set the `connected` flag and return success.
router.post('/connect', (req, res) => {
  connected = true;
  res.json({ connected });
});

// Disconnect from the Scale MBS Bot API and clear any cached state
router.post('/disconnect', (req, res) => {
  connected = false;
  res.json({ connected });
});

// Get messages.  Must be connected first.
router.get('/messages', async (req, res) => {
  if (!connected) {
    return res.status(401).json({ error: 'Scale MBS Bot not connected' });
  }
  const messages = await fetchMessages();
  res.json({ messages });
});

// Send a message.  Must be connected first.
router.post('/send', async (req, res) => {
  if (!connected) {
    return res.status(401).json({ error: 'Scale MBS Bot not connected' });
  }
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  const reply = await sendMessageToApi(message);
  res.json(reply);
});

module.exports = router;