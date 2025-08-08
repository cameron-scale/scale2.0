require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3001;
const path = require('path');

// Enable CORS for all origins. In production, restrict this to your frontend domain.
app.use(cors());

// Parse incoming JSON bodies
app.use(express.json());

/*
 * Serve the compiled frontend.  In production we host the static
 * assets from the `../frontend` directory.  When deployed, the
 * express server will respond with the index.html for any unknown
 * route so that the single page application can handle routing on
 * the client side.  This middleware is placed before the API
 * endpoints so that `/api/*` requests are still handled by the
 * handlers defined below.
 */
const frontendDir = path.join(__dirname, '../frontend');
app.use(express.static(frontendDir));

/*
 * Dashboard Metrics Endpoint
 *
 * Returns a snapshot of high‑level business metrics pulled from the
 * various third‑party services. For now, this endpoint returns
 * placeholder values so that the frontend can be developed
 * independently of the API integrations. When you connect your
 * services (QuickBooks, Salesforce, etc.), replace the hardcoded
 * values below with calls into the respective service modules.
 */
app.get('/api/dashboard/metrics', async (req, res) => {
  try {
    // TODO: Replace these placeholders with real API calls
    const metrics = {
      revenueThisMonth: 12500.52,
      revenueLastMonth: 9850.75,
      totalRevenue: 256000.15,
      unpaidBills: 3,
      totalClients: 42,
      activeLeads: 7,
      websiteVisitorsToday: 543,
      // Additional metrics can be added here
    };
    res.json(metrics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

/*
 * Recent Emails Endpoint
 *
 * Returns a list of recent emails. Each entry contains an id,
 * subject, sender, receivedDate and importance score. This data is
 * normally pulled from Outlook or Gmail via Microsoft Graph or
 * Google APIs. At the moment it returns dummy emails sorted by
 * importance so that the UI can be wired up.
 */
app.get('/api/emails', async (req, res) => {
  try {
    // TODO: Replace with real Outlook/Google email fetch
    const emails = [
      {
        id: '1',
        subject: 'Urgent: Overdue invoice from ACME Co.',
        from: 'billing@acme.example',
        receivedDate: '2025-08-07T15:45:00Z',
        importance: 0.95,
      },
      {
        id: '2',
        subject: 'Weekly marketing metrics report',
        from: 'marketing@example.com',
        receivedDate: '2025-08-07T12:30:00Z',
        importance: 0.7,
      },
      {
        id: '3',
        subject: 'Customer inquiry from John Smith',
        from: 'john.smith@example.com',
        receivedDate: '2025-08-06T08:15:00Z',
        importance: 0.6,
      },
    ];
    res.json({ emails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

/*
 * Chat Endpoint
 *
 * Uses the OpenAI GPT API to generate responses based on the
 * question asked by the user. The chat context can be augmented
 * with data from the dashboard and any other services your business
 * uses. To run this endpoint you will need to set the OPENAI_API_KEY
 * environment variable. If no API key is supplied, a fallback
 * response is provided.
 */
app.post('/api/chat', async (req, res) => {
  const { message, context } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Without an API key we cannot call the real OpenAI API. Provide a fallback.
    return res.json({ reply: 'Chat service is not configured yet. Please set OPENAI_API_KEY in your .env file.' });
  }
  try {
    // Compose the prompt. We include the optional context (e.g. dashboard
    // metrics) to give the model more information about the state of the
    // business.
    const systemPrompt =
      'You are an AI assistant integrated into a business dashboard. When asked questions, provide concise answers based on the available metrics and data. If information is unavailable, say so.';
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message + (context ? `\n\nContext: ${JSON.stringify(context)}` : '') },
    ];
    // Call OpenAI's chat/completions endpoint
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages,
        max_tokens: 200,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    const reply = response.data.choices[0].message.content.trim();
    res.json({ reply });
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
    res.status(500).json({ error: 'Failed to generate chat response' });
  }
});

/*
 * Placeholder endpoints for each integration. You can define
 * additional routes and handlers below. These handlers currently
 * return stubbed data. Replace them with calls into service
 * modules that wrap the third‑party APIs.
 */

app.get('/api/quickbooks/accounts', (req, res) => {
  res.json({ message: 'QuickBooks accounts endpoint not yet implemented' });
});

app.get('/api/salesforce/leads', (req, res) => {
  res.json({ message: 'Salesforce leads endpoint not yet implemented' });
});

// Serve index.html for any other GET request (client-side routing)
app.get('*', (req, res) => {
  // If the request starts with /api let the previous handlers respond with 404
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});
