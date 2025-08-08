# Scale 2.0 Portal (Prototype)

This repository contains a **prototype** for the **Scale 2.0** business dashboard.  
It demonstrates a clean and modern web interface that aggregates data from a
number of third‑party services and exposes a ChatGPT‑powered assistant.  
The goal of this prototype is to provide a foundation that you can extend by
plugging in real API integrations for your accounting, sales, email, payment
processing, and marketing tools.

## Features

* **Dashboard metrics** – shows key business indicators such as revenue this month,
  last month, total revenue, unpaid bills, total clients, active leads and live
  website visitors.  The values are currently stubbed in the backend and can be
  replaced with calls into your preferred services (QuickBooks, Salesforce,
  Google Analytics, etc.).
* **Recent email list** – displays a list of recent emails sorted by importance.  
  This list is static in the prototype but can be wired up to Outlook or Gmail
  via the Microsoft Graph API.
* **Integrated apps** – a grid of all the third‑party apps you plan to
  integrate (QuickBooks, Outlook, GoDaddy, Salesforce, Webflow, SEOptimer,
  AccessiBe, Converge Pay, Talech, Zapier, Adobe Acrobat, Google Analytics,
  Google Calendar, ChatGPT, Zoom, Calendly).  Clicking an item shows a
  placeholder message.  You can create dedicated pages for each service and
  implement their respective actions as described in your specification.
* **Chat assistant** – an interactive chat powered by OpenAI’s GPT.  The
  assistant has access to the dashboard metrics for context and is designed to
  answer questions about your business.  To enable real responses you need to
  supply an OpenAI API key in your `.env` file.

## Architecture

The prototype is split into two parts:

### Backend (`scale2/backend`)

An [Express](https://expressjs.com/) server exposes a simple REST API.  It has
endpoints for retrieving dashboard metrics, recent emails and serving the chat
assistant.  The `/api/chat` endpoint demonstrates how to call the OpenAI API
using [`axios`](https://axios-http.com/) and the `OPENAI_API_KEY` environment
variable.  Replace the hard‑coded placeholders with real calls into the
corresponding service modules when you are ready to integrate QuickBooks,
Salesforce, Outlook, etc.

Configuration is handled via environment variables – see
[`backend/.env.example`](backend/.env.example) for a list of parameters you
should supply.  Copy this file to `.env` and fill in your credentials.

### Frontend (`scale2/frontend`)

A light‑weight single page application built with vanilla HTML, CSS and
JavaScript.  The design emphasizes clarity and readability: cards show metrics
at a glance, lists are neatly spaced, and the chat interface uses minimal
colors for comfortable reading.  All network requests go through the backend to
avoid exposing API keys or other sensitive data in the browser.

To run the frontend locally, simply open `index.html` in your browser.  When
developing, you may want to use a static file server such as
[`http-server`](https://www.npmjs.com/package/http-server) so that relative
paths resolve correctly.

## Running locally

1. **Install dependencies** for the backend:
   ```bash
   cd scale2/backend
   npm install
   ```

2. **Copy the environment file** and fill in your credentials:
   ```bash
   cp .env.example .env
   # Edit .env and provide API keys, client IDs and secrets.
   ```

3. **Start the backend** server:
   ```bash
   npm start
   ```
   The backend will run on `http://localhost:3001` by default.

4. **Open the frontend**:
   You can open `frontend/index.html` directly in your browser or serve it via a
   static file server.  Make sure the backend is running so that the frontend
   can retrieve data.

## Extending the prototype

This project intentionally leaves out the implementation details for each
integration.  Here are some notes on how to proceed:

* **QuickBooks Online API** – Use Intuit’s REST API with OAuth 2.0.  Implement
  functions to fetch invoices, bills, customers and transactions.  The
  QuickBooks API uses access tokens that expire after one hour and refresh
  tokens that roll over when used.  Make sure to handle token refresh and
  error responses gracefully【255158548026930†L187-L200】.  Store your client ID,
  client secret and redirect URI in environment variables and never expose them
  to the frontend【255158548026930†L291-L303】.
* **Outlook / Microsoft Graph** – Acquire an OAuth 2.0 access token via the
  Microsoft Authentication Library (MSAL) and include it as a Bearer token in
  the `Authorization` header【398172365301574†L148-L156】.  Follow the least
  privilege principle when requesting permissions【398172365301574†L160-L170】 and
  decide whether to use delegated or application permissions depending on
  whether a user is present【398172365301574†L172-L177】.  Implement API calls
  to list messages and calendar events; handle pagination and HTTP errors such
  as 429 (too many requests) gracefully【398172365301574†L215-L266】.
* **Salesforce** – Create a connected app with OAuth credentials.  Use named
  credentials to securely store tokens instead of hard‑coding them【221813627689553†L153-L156】.
  Enforce multi‑factor authentication for API users【221813627689553†L163-L170】,
  restrict access with IP whitelisting【221813627689553†L196-L203】 and monitor
  API usage and events【221813627689553†L186-L225】.
* **Other services** – For each additional integration (GoDaddy, Webflow,
  SEOptimer, AccessiBe, Converge Pay, Talech, Zapier, Acrobat, Google
  Analytics/Calendar, Zoom, Calendly), consult their API documentation for
  authentication flows and rate limits.  Always use HTTPS, store secrets
  server‑side and adhere to the principle of least privilege when requesting
  scopes.  When handling asynchronous operations (e.g. webhooks) make sure to
  validate incoming requests and authenticate them properly.

Once these integrations are implemented, update the dashboard metrics to pull
real data and expand the app modules to provide the full suite of actions
described in your requirements.

## Security considerations

This prototype is not production ready.  Before deploying anything similar
into a real environment, keep the following guidelines in mind:

* Always transmit data over TLS/HTTPS.  Configure your server to support modern
  versions of TLS and strong cipher suites.  Use certificates from a trusted
  certificate authority.
* Store API keys, secrets and tokens in environment variables or a secure
  secrets manager.  Never commit them to version control or expose them in
  client‑side code.
* Refresh OAuth tokens proactively and handle token expiration.  QuickBooks
  refresh tokens expire every 100 days and must be rotated【255158548026930†L187-L200】.
* Apply the principle of least privilege when requesting API scopes【398172365301574†L160-L169】.
  Only request the permissions your application truly needs, and prefer
  delegated permissions for interactive applications【398172365301574†L172-L177】.
* Enable multi‑factor authentication wherever possible to reduce the risk of
  unauthorized access【221813627689553†L163-L170】.
* Restrict IP access and use field‑level security to protect sensitive data
  within Salesforce【221813627689553†L196-L214】.
* Implement robust error handling and logging.  Both QuickBooks and Microsoft
  Graph provide detailed error responses【255158548026930†L206-L217】【398172365301574†L243-L266】.  Capture and
  interpret these errors, and never expose sensitive information in error
  messages returned to clients.

By following these guidelines and building upon the provided code, you can
develop a secure, scalable and user‑friendly dashboard that unifies all of your
business systems into a single portal.
