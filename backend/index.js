(() => {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const contents = fs.readFileSync(envPath, 'utf8');
    contents.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex < 0) return;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    });
  }
})();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

// Import integration routers
const quickbooksRouter = require('./integrations/quickbooks');
const outlookRouter = require('./integrations/outlook');
const godaddyRouter = require('./integrations/godaddy');
const salesforceRouter = require('./integrations/salesforce');
const seoptimerRouter = require('./integrations/seoptimer');
const webflowRouter = require('./integrations/webflow');
const accessibeRouter = require('./integrations/accessibe');
const convergepayRouter = require('./integrations/convergepay');
const talechRouter = require('./integrations/talech');
const zapierRouter = require('./integrations/zapier');
const acrobatRouter = require('./integrations/acrobat');
const googleanalyticsRouter = require('./integrations/googleanalytics');
const googlecalendarRouter = require('./integrations/googlecalendar');
const zoomRouter = require('./integrations/zoom');
const calendlyRouter = require('./integrations/calendly');
const assistantRouter = require('./integrations/assistant');

// New SMS Marketing integration
// Postscript SMS marketing integration
const postscriptRouter = require('./integrations/postscript');
const dudaRouter = require('./integrations/duda');

// Additional integrations: Slack for team chat and Asana for project management
const slackRouter = require('./integrations/slack');
const asanaRouter = require('./integrations/asana');
// Scale MBS Bot integration
const scaleMbsBotRouter = require('./integrations/scaleMbsBot');

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve the compiled frontend (static files)
const frontendDir = path.join(__dirname, '../frontend');
app.use(express.static(frontendDir));

/*
 * Dashboard Metrics Endpoint
 *
 * Returns a snapshot of high-level business metrics pulled from the
 * various third-party services. For now, this endpoint returns
 * placeholder values so that the frontend can be developed
 * independently of the API integrations. When you connect your
 * services (QuickBooks, Salesforce, etc.), replace the hardcoded
 * values below with calls into the respective service modules.
 */
app.get('/api/dashboard/metrics', async (req, res) => {
  try {
    const metrics = {
      revenueThisMonth: 12500.52,
      revenueLastMonth: 9850.75,
      totalRevenue: 256000.15,
      unpaidBills: 3,
      totalClients: 42,
      activeLeads: 7,
      websiteVisitorsToday: 543
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
      }
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
 * uses. To run this endpoint you will need to set OPENAI_API_KEY
 * environment variable. If no API key is configured, a fallback
 * response is provided.
 */
app.post('/api/chat', async (req, res) => {
  const { message, context } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.json({ reply: 'Chat service is not configured yet. Please set OPENAI_API_KEY in your .env file.' });
  }
  try {
    const systemPrompt =
      'You are Selene, an intelligent AI concierge for business owners. You have access to a variety of data sources—including QuickBooks, Outlook, Salesforce, Zoom, calendars, analytics, an SMS marketing service, and a website builder—and can use them to answer questions. ' +
      'You can also build beautiful websites through Duda and coordinate with a designated project manager for any edits or customizations. ' +
           'You can interact with team chat channels via Slack, manage projects with Asana, and chat with your internal Scale MBS bot for additional automation. ' +
      'Speak in a natural, friendly, and slightly seductive tone while remaining professional. When relevant, enrich your answers with diagrams, charts or images to help illustrate concepts. ' +
      'Use any context data provided to you (metrics, messages, account details) to craft helpful responses. If specific information is unavailable, politely let the user know.';
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message + (context ? `\n\nContext: ${JSON.stringify(context)}` : '') },
    ];
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

// Mount integration routers
app.use('/api/quickbooks', quickbooksRouter);
app.use('/api/outlook', outlookRouter);
app.use('/api/godaddy', godaddyRouter);
app.use('/api/salesforce', salesforceRouter);
app.use('/api/seoptimer', seoptimerRouter);
app.use('/api/webflow', webflowRouter);
app.use('/api/accessibe', accessibeRouter);
app.use('/api/convergepay', convergepayRouter);
app.use('/api/talech', talechRouter);
app.use('/api/zapier', zapierRouter);
app.use('/api/acrobat', acrobatRouter);
app.use('/api/googleanalytics', googleanalyticsRouter);
app.use('/api/googlecalendar', googlecalendarRouter);
app.use('/api/zoom', zoomRouter);
app.use('/api/calendly', calendlyRouter);
app.use('/api/assistant', assistantRouter);
app.use('/api/postscript', postscriptRouter);
app.use('/api/duda', dudaRouter);

// Mount Slack and Asana integrations
app.use('/api/slack', slackRouter);
    app.use('/api/asana', asanaRouter);
    // Mount Scale MBS Bot integration

// Mount Scale MBS Bot integration. This allows the frontend to check
// connection status, connect, disconnect, and send/receive messages. Replace
// the stub with real API calls once the external API documentation is
// available and the secret keys are set in the environment variables.
app.use('/api/scalembsbot', scaleMbsBotRouter);

// Catch-all route: serve index.html for non-API requests
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});
