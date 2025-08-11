const express = require('express');
const axios = require('axios');

const router = express.Router();

// Basic in-memory connection state and tokens. In production these should
// be stored securely and refreshed periodically.
let connected = false;
let quickbooksAccessToken = null;
let quickbooksRefreshToken = null;
let quickbooksRealmId = null;

// GET /api/quickbooks/status – returns whether the user is connected.
router.get('/status', (req, res) => {
  res.json({ connected });
});

// POST /api/quickbooks/connect – initiate OAuth authorization. Returns
// a URL that the client should redirect the user to.
router.post('/connect', (req, res) => {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID || '<QB_CLIENT_ID>';
  const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI ||
    'https://scale2-0.onrender.com/api/quickbooks/callback';
  const scope = process.env.QUICKBOOKS_SCOPES || 'com.intuit.quickbooks.accounting';
  const state = Math.random().toString(36).substring(2);
  const authUrl =
    `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`;
  res.json({ url: authUrl });
});

// GET /api/quickbooks/callback – handle OAuth callback and exchange code for tokens.
router.get('/callback', async (req, res) => {
  const { code, realmId } = req.query;
  if (!code) {
    return res.status(400).send('Missing authorization code');
  }
  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;
  const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI ||
    'https://scale2-0.onrender.com/api/quickbooks/callback';
  try {
    const tokenUrl = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
    const body = `grant_type=authorization_code&code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    const tokenResp = await axios.post(tokenUrl, body, {
      auth: { username: clientId, password: clientSecret },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    quickbooksAccessToken = tokenResp.data.access_token;
    quickbooksRefreshToken = tokenResp.data.refresh_token;
    quickbooksRealmId = realmId;
    connected = true;
    return res.redirect('/');
  } catch (err) {
    console.error('QuickBooks OAuth error:', err.response?.data || err.message);
    return res.status(500).send('Error exchanging authorization code');
  }
});

// POST /api/quickbooks/disconnect – clear tokens and mark as disconnected.
router.post('/disconnect', (req, res) => {
  connected = false;
  quickbooksAccessToken = null;
  quickbooksRefreshToken = null;
  quickbooksRealmId = null;
  res.json({ connected });
});

// Helper to fetch data from QuickBooks API when tokens are available.
async function fetchFromQuickBooks(endpoint) {
  if (!quickbooksAccessToken || !quickbooksRealmId) {
    return null;
  }
  const url = `https://sandbox-quickbooks.api.intuit.com/v3/company/${quickbooksRealmId}/${endpoint}`;
  try {
    const resp = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${quickbooksAccessToken}`,
        Accept: 'application/json',
      },
    });
    return resp.data;
  } catch (err) {
    console.error('QuickBooks API error:', err.response?.data || err.message);
    return null;
  }
}

// GET /api/quickbooks/accounts – return accounts from QuickBooks or stub data.
router.get('/accounts', async (req, res) => {
  if (!connected) {
    return res.status(401).json({ error: 'QuickBooks not connected' });
  }
  const data = await fetchFromQuickBooks('account');
  if (data) {
    return res.json(data);
  }
  const accounts = [
    { id: '1', name: 'Checking Account', balance: 12000.55 },
    { id: '2', name: 'Savings Account', balance: 5400.12 },
  ];
  return res.json({ accounts });
});

// GET /api/quickbooks/customers – return customers from QuickBooks or stub data.
router.get('/customers', async (req, res) => {
  if (!connected) {
    return res.status(401).json({ error: 'QuickBooks not connected' });
  }
  const data = await fetchFromQuickBooks('customer');
  if (data) {
    return res.json(data);
  }
  const customers = [
    { id: 'c1', name: 'John Doe', balance: 300.0 },
    { id: 'c2', name: 'Acme Corp', balance: 0.0 },
  ];
  return res.json({ customers });
});

// POST /api/quickbooks/invoices – create invoice via API or stub.
router.post('/invoices', async (req, res) => {
  if (!connected) {
    return res.status(401).json({ error: 'QuickBooks not connected' });
  }
  const invoice = req.body;
  if (quickbooksAccessToken && quickbooksRealmId) {
    try {
      const url = `https://sandbox-quickbooks.api.intuit.com/v3/company/${quickbooksRealmId}/invoice?minorversion=65`;
      const response = await axios.post(url, invoice, {
        headers: {
          Authorization: `Bearer ${quickbooksAccessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      return res.json(response.data);
    } catch (err) {
      console.error('Create invoice error:', err.response?.data || err.message);
      // fall through to stub
    }
  }
  return res.json({ message: 'Invoice created (stub)', invoice });
});

module.exports = router;
