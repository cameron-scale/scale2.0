document.addEventListener('DOMContentLoaded', () => {
  loadMetrics();
  loadEmails();
  populateApps();
  const chatForm = document.getElementById('chat-form');
  chatForm.addEventListener('submit', handleChatSubmit);
});

async function loadMetrics() {
  try {
    const res = await fetch('http://localhost:3001/api/dashboard/metrics');
    const data = await res.json();
    const container = document.getElementById('metrics-container');
    container.innerHTML = '';
    Object.keys(data).forEach((key) => {
      const card = document.createElement('div');
      card.className = 'card';
      const valueEl = document.createElement('div');
      valueEl.className = 'value';
      valueEl.textContent = formatMetricValue(key, data[key]);
      const labelEl = document.createElement('div');
      labelEl.className = 'label';
      labelEl.textContent = formatLabel(key);
      card.appendChild(valueEl);
      card.appendChild(labelEl);
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Failed to load metrics', err);
  }
}

async function loadEmails() {
  try {
    const res = await fetch('http://localhost:3001/api/emails');
    const data = await res.json();
    const list = document.getElementById('email-list');
    list.innerHTML = '';
    data.emails.forEach((email) => {
      const li = document.createElement('li');
      const subject = document.createElement('div');
      subject.className = 'email-subject';
      subject.textContent = email.subject;
      const meta = document.createElement('div');
      meta.className = 'email-meta';
      const date = new Date(email.receivedDate);
      meta.textContent = `${email.from} — ${date.toLocaleString()}`;
      li.appendChild(subject);
      li.appendChild(meta);
      list.appendChild(li);
    });
  } catch (err) {
    console.error('Failed to load emails', err);
  }
}

function populateApps() {
  const apps = [
    'QuickBooks',
    'Outlook',
    'GoDaddy',
    'Salesforce',
    'Webflow',
    'SEOptimer',
    'AccessiBe',
    'Converge Pay',
    'Talech',
    'Zapier',
    'Adobe Acrobat',
    'Google Analytics',
    'Google Calendar',
    'ChatGPT',
    'Zoom',
    'Calendly',
  ];
  const grid = document.getElementById('apps-grid');
  apps.forEach((name) => {
    const card = document.createElement('div');
    card.className = 'app-card';
    const label = document.createElement('div');
    label.className = 'app-name';
    label.textContent = name;
    card.appendChild(label);
    card.addEventListener('click', () => {
      alert(`${name} module not yet implemented.`);
    });
    grid.appendChild(card);
  });
}

async function handleChatSubmit(event) {
  event.preventDefault();
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  appendChatMessage('user', text);
  input.value = '';
  try {
    // Fetch current metrics as context for the chatbot
    const metricsRes = await fetch('http://localhost:3001/api/dashboard/metrics');
    const metrics = await metricsRes.json();
    const res = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, context: metrics }),
    });
    const data = await res.json();
    appendChatMessage('ai', data.reply || data.error || 'No response');
  } catch (err) {
    console.error('Chat error', err);
    appendChatMessage('ai', 'An error occurred while processing your request.');
  }
}

function appendChatMessage(role, content) {
  const container = document.getElementById('chat-container');
  const msg = document.createElement('div');
  msg.className = `chat-message ${role}`;
  msg.textContent = content;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

function formatMetricValue(key, value) {
  // Format numbers as currency or counts depending on the metric
  if (/revenue/i.test(key)) {
    return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return Number(value).toLocaleString();
}

function formatLabel(key) {
  // Convert camelCase keys into human‑friendly labels
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^(.)/, (m) => m.toUpperCase())
    .replace(/\b([A-Z]+)\b/g, (m) => m.toUpperCase());
}
