// Kick off initialization once the DOM is ready.
// If the script loads before DOMContentLoaded, the listener will fire.  If
// the DOM has already loaded (because the script is at the bottom of the
// document), we also invoke initialization immediately.  This ensures
// initialization runs exactly once no matter when the script executes.
async function initDashboard() {
  try {
    await initializeConnections();
    populateApps();
    refreshMetrics();
    loadEmails();
    wireChat();
    renderCharts();
    buildLinkList();
    showLinkModal();
  } catch (err) {
    console.error('Dashboard initialization failed', err);
  }
}

// Initialize when DOMContentLoaded fires
document.addEventListener('DOMContentLoaded', initDashboard);

// Also initialize immediately if the DOM is already parsed (when this
// script is loaded at the end of the body, DOMContentLoaded may have
// already fired)
if (document.readyState !== 'loading') {
  initDashboard();
}

// Service definitions and connection state
const services = [
  { name: 'QuickBooks', slug: 'quickbooks' },
  { name: 'Outlook', slug: 'outlook' },
  { name: 'GoDaddy', slug: 'godaddy' },
  { name: 'Salesforce', slug: 'salesforce' },
  { name: 'Webflow', slug: 'webflow' },
  { name: 'SEOptimer', slug: 'seoptimer' },
  { name: 'AccessiBe', slug: 'accessibe' },
  { name: 'Converge Pay', slug: 'convergepay' },
  { name: 'Talech', slug: 'talech' },
  { name: 'Zapier', slug: 'zapier' },
  { name: 'Adobe Acrobat', slug: 'acrobat' },
  { name: 'Google Analytics', slug: 'googleanalytics' },
  { name: 'Google Calendar', slug: 'googlecalendar' },
  { name: 'ChatGPT', slug: 'assistant' },
  { name: 'Zoom', slug: 'zoom' },
  { name: 'Calendly', slug: 'calendly' }
];
const connections = {};

// Fetch status for each service
async function initializeConnections() {
  await Promise.all(services.map(async svc => {
    try {
      const res = await fetch(`/api/${svc.slug}/status`);
      const data = await res.json();
      connections[svc.slug] = !!data.connected;
    } catch (err) {
      connections[svc.slug] = false;
    }
  }));
}

/* Build link list in modal */
function buildLinkList() {
  const list = document.getElementById('link-list');
  list.innerHTML = '';
  services.forEach(svc => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = svc.name;
    const btn = document.createElement('button');
    btn.className = 'connect-btn';
    btn.dataset.slug = svc.slug;
    updateConnectButton(btn);
    btn.addEventListener('click', async () => {
      const slug = btn.dataset.slug;
      if (!connections[slug]) {
        await connectService(slug);
      } else {
        await disconnectService(slug);
      }
      updateConnectButton(btn);
      updateAppCards();
    });
    li.appendChild(span);
    li.appendChild(btn);
    list.appendChild(li);
  });
}

function updateConnectButton(btn) {
  const slug = btn.dataset.slug;
  if (connections[slug]) {
    btn.textContent = 'Connected';
    btn.classList.add('connected');
  } else {
    btn.textContent = 'Connect';
    btn.classList.remove('connected');
  }
}

async function connectService(slug) {
  try {
    // Call the backend to initiate the connection. Many integrations will return an
    // authorization URL. If a URL is provided, redirect the user to complete the
    // OAuth flow. Otherwise, update the connection state based on the response.
    const res = await fetch(`/api/${slug}/connect`, { method: 'POST' });
    const data = await res.json();
    if (data && data.url) {
      // Redirect the browser to the provider's authorization page. The backend
      // should set up a callback that redirects back to our dashboard once
      // authorization is complete.
      window.location.href = data.url;
    } else {
      connections[slug] = !!data.connected;
    }
  } catch (err) {
    console.error('Connect error', err);
  }
}

async function disconnectService(slug) {
  try {
    const res = await fetch(`/api/${slug}/disconnect`, { method: 'POST' });
    const data = await res.json();
    connections[slug] = !!data.connected;
  } catch (err) {
    console.error('Disconnect error', err);
  }
}

/* Show and hide modal */
function showLinkModal() {
  const modal = document.getElementById('link-modal');
  modal.style.display = 'flex';
}

function closeModal() {
  document.getElementById('link-modal').style.display = 'none';
}

// Close modal when close button clicked
 document.addEventListener('click', function(event) {
  if (event.target && event.target.id === 'close-modal') {
    closeModal();
  }
});

/* Populate Integrated Apps grid */
function populateApps() {
  const grid = document.getElementById('apps-grid');
  grid.innerHTML = '';
  services.forEach(svc => {
    const card = document.createElement('div');
    card.className = 'app-card';
    card.textContent = svc.name;
    card.dataset.slug = svc.slug;
    if (connections[svc.slug]) {
      card.classList.add('connected');
    }
    card.addEventListener('click', async () => {
      if (!connections[svc.slug]) {
        // connect service and update UI
        await connectService(svc.slug);
        const btn = document.querySelector(`.connect-btn[data-slug="${svc.slug}"]`);
        if (btn) updateConnectButton(btn);
        card.classList.add('connected');
      } else {
        openIntegration(svc.slug);
      }
    });
    grid.appendChild(card);
  });
}

/* Update App card statuses after connection changes */
function updateAppCards() {
  const cards = document.querySelectorAll('.app-card');
  cards.forEach(card => {
    const slug = card.dataset.slug;
    if (connections[slug]) {
      card.classList.add('connected');
    } else {
      card.classList.remove('connected');
    }
  });
}

/* Open integration details */
function openIntegration(slug) {
  // Hide dashboard cards except integration details
  document.querySelectorAll('main .card').forEach(el => {
    if (el.id !== 'integration-details') {
      el.style.display = 'none';
    }
  });
  const details = document.getElementById('integration-details');
  const title = document.getElementById('integration-title');
  const content = document.getElementById('integration-content');
  const svc = services.find(s => s.slug === slug);
  title.textContent = svc ? svc.name : slug;
  content.innerHTML = '<p>Loading...</p>';
  details.style.display = 'block';
  // Map of endpoints to call for each integration
  const endpointsMap = {
    quickbooks: ['accounts','customers'],
    outlook: ['messages'],
    godaddy: ['products','subscriptions'],
    salesforce: ['leads'],
    webflow: [],
    seoptimer: [],
    accessibe: [],
    convergepay: ['transactions'],
    talech: ['sales','inventory'],
    zapier: ['triggers'],
    acrobat: ['documents'],
    googleanalytics: ['realtime','reports'],
    googlecalendar: ['events'],
    zoom: ['meetings'],
    calendly: ['events'],
    assistant: [],
  };
  const endpoints = endpointsMap[slug] || [];
  if (endpoints.length === 0) {
    content.innerHTML = '<p>No data available for this integration.</p>';
  } else {
    Promise.all(endpoints.map(ep => fetch(`/api/${slug}/${ep}`).then(r => {
      if (!r.ok) throw new Error('request failed');
      return r.json();
    }).then(data => ({ ep, data })).catch(() => ({ ep, data: { error: 'Failed to load' } })))).then(results => {
      content.innerHTML = '';
      results.forEach(({ ep, data }) => {
        const section = document.createElement('div');
        const h3 = document.createElement('h3');
        h3.textContent = ep.charAt(0).toUpperCase() + ep.slice(1);
        section.appendChild(h3);
        const pre = document.createElement('pre');
        pre.textContent = JSON.stringify(data, null, 2);
        section.appendChild(pre);
        content.appendChild(section);
      });
    });
  }
}

/* Back to dashboard */
document.addEventListener('click', function(event) {
  if (event.target && event.target.id === 'back-to-dashboard') {
    document.querySelectorAll('main .card').forEach(el => {
      if (el.id === 'integration-details') {
        el.style.display = 'none';
      } else {
        el.style.display = '';
      }
    });
  }
});

/* Fetch metrics and update KPI cards */
async function refreshMetrics() {
  try {
    const res = await fetch('/api/dashboard/metrics');
    const data = await res.json();
    document.getElementById('revenueThisMonth').textContent = money(data.revenueThisMonth);
    document.getElementById('revenueLastMonth').textContent = money(data.revenueLastMonth);
    document.getElementById('totalRevenue').textContent = money(data.totalRevenue);
    document.getElementById('unpaidBills').textContent = data.unpaidBills;
    document.getElementById('totalClients').textContent = data.totalClients;
    document.getElementById('activeLeads').textContent = data.activeLeads;
  } catch (err) {
    console.error('Metrics error', err);
  }
}

/* Fetch recent emails */
async function loadEmails() {
  try {
    const res = await fetch('/api/emails');
    const data = await res.json();
    const list = document.getElementById('email-list');
    list.innerHTML = '';
    data.emails.forEach(email => {
      const li = document.createElement('li');
      li.innerHTML = `<div class="email-subject">${escapeHTML(email.subject)}</div>
        <div class="email-meta">${escapeHTML(email.from)} — ${new Date(email.receivedDate).toLocaleString()}</div>`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error('Email error', err);
  }
}

/* Chat assistant */
function wireChat() {
  const form = document.getElementById('chat-form');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const question = input.value.trim();
    if (!question) return;
    appendChat('user', question);
    input.value = '';
    try {
      const context = await (await fetch('/api/dashboard/metrics')).json();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, context })
      });
      const data = await res.json();
      appendChat('ai', data.reply || data.error || '(no reply)');
    } catch (err) {
      console.error('Chat error', err);
      appendChat('ai', 'An error occurred.');
    }
  });
}

function appendChat(role, text) {
  const container = document.getElementById('chat-container');
  const div = document.createElement('div');
  div.className = 'bubble ' + role;
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

/* Render three charts with Chart.js */
function renderCharts() {
  // Revenue Trend
  new Chart(document.getElementById('chartRevenue'), {
    type:'line',
    data:{
      labels: monthLabels(12),
      datasets:[
        { label:'Revenue', data: fakeSeries(12, 8000, 20000), fill:true,
          backgroundColor:'rgba(103,210,255,0.2)', borderColor:'rgba(103,210,255,1)', tension:.3 },
        { label:'Cost', data: fakeSeries(12, 3000, 8000), fill:true,
          backgroundColor:'rgba(154,230,180,0.2)', borderColor:'rgba(154,230,180,1)', tension:.3 }
      ]
    },
    options:{ plugins:{legend:{display:false}}, scales:{x:{grid:{display:false}}, y:{grid:{color:'rgba(255,255,255,0.08)'}}}}
  });
  // Leads & Conversions
  new Chart(document.getElementById('chartLeads'), {
    type:'bar',
    data:{
      labels: monthLabels(8),
      datasets:[
        { label:'Leads', data: fakeSeries(8,20,60), backgroundColor:'rgba(103,210,255,0.6)' },
        { label:'Wins', data: fakeSeries(8,5,20), backgroundColor:'rgba(154,230,180,0.6)' }
      ]
    },
    options:{ plugins:{legend:{display:false}}, scales:{x:{grid:{display:false}}, y:{grid:{color:'rgba(255,255,255,0.08)'}}}}
  });
  // Channel Performance
  new Chart(document.getElementById('chartChannels'), {
    type:'bar',
    data:{
      labels:['Organic','Paid','Email','Referral','Direct'],
      datasets:[{ data: fakeSeries(5, 50, 200), backgroundColor:['#67d2ff','#9ae6b4','#ffd666','#bdb2ff','#ffa4a4'] }]
    },
    options:{ plugins:{legend:{display:false}}, scales:{x:{grid:{display:false}}, y:{grid:{color:'rgba(255,255,255,0.08)'}}}}
  });
}

/* Helper functions */
function money(v){ return `$${Number(v||0).toLocaleString(undefined,{minimumFractionDigits:0})}`; }
function monthLabels(n){
  const names=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now=new Date(); const arr=[];
  for(let i=n-1;i>=0;i--){ const d=new Date(now.getFullYear(),now.getMonth()-i,1); arr.push(names[d.getMonth()]); }
  return arr;
}
function fakeSeries(n,min,max){ return Array.from({length:n},()=> Math.floor(min + Math.random()*(max-min))); }
function escapeHTML(s){ return s.replace(/[&<>"]|"|'/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch])); }
