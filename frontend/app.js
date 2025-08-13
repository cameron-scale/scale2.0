// Kick off initialization once the DOM is ready.
// The dashboard now requires authentication before it is shown. We first
// display a login/signup overlay. After the user logs in or completes
// the signup conversation, we call initDashboard().
async function initDashboard() {
  try {
    await initializeConnections();
    populateApps();
    refreshMetrics();
    loadEmails();
    wireChat();
    renderCharts();
    buildLinkList();
    // Show the link modal after initialization so the user can connect services
    showLinkModal();
  } catch (err) {
    console.error('Dashboard initialization failed', err);
  }
}

// Initialize authentication flow when DOM is ready. If the user is not logged
// in, show the authentication overlay; otherwise go straight to the dashboard.
async function initAuth() {
  if (!localStorage.getItem('loggedIn')) {
    const overlay = document.getElementById('auth-overlay');
    if (overlay) overlay.style.display = 'flex';
    setupAuth();
  } else {
    // Already logged in
    hideAuthOverlay();
    await initDashboard();
  }
}

document.addEventListener('DOMContentLoaded', initAuth);
if (document.readyState !== 'loading') {
  initAuth();
}

// Set up handlers for login and signup buttons
function setupAuth() {
  const loginBtn = document.getElementById('login-button');
  const signupBtn = document.getElementById('signup-button');
  const loginForm = document.getElementById('login-form');
  const loginContainer = document.getElementById('login-container');
  const signupContainer = document.getElementById('signup-container');
  if (loginBtn) {
    loginBtn.onclick = () => {
      if (loginForm) loginForm.style.display = 'block';
      if (signupContainer) signupContainer.style.display = 'none';
    };
  }
  if (signupBtn) {
    signupBtn.onclick = () => {
      if (loginForm) loginForm.style.display = 'none';
      if (loginContainer) loginContainer.style.display = 'none';
      if (signupContainer) signupContainer.style.display = 'block';
      startSignup();
    };
  }
  const loginSubmit = document.getElementById('login-submit');
  if (loginSubmit) {
    loginSubmit.onclick = () => {
      // In this prototype we do not validate credentials.  Simply store a flag
      // and proceed to dashboard.
      localStorage.setItem('loggedIn', 'true');
      hideAuthOverlay();
      initDashboard();
    };
  }
}

// Signup conversation logic
let signupStep = 0;
let signupAnswers = {};
const signupQuestions = [
  { text: "What is your business type?", key: "businessType" },
  { text: "Briefly describe your business.", key: "businessDescription" },
  { text: "Select the services you need to connect:", key: "services", type: "multi" }
];

function startSignup() {
  signupStep = 0;
  signupAnswers = {};
  // Clear chat box
  const chatBox = document.getElementById('chat-box');
  if (chatBox) chatBox.innerHTML = '';
  showNextSignupQuestion();
}

function showNextSignupQuestion() {
  const chatBox = document.getElementById('chat-box');
  const signupInput = document.getElementById('signup-input');
  const selectServices = document.getElementById('select-services');
  if (!chatBox) return;
  const current = signupQuestions[signupStep];
  if (!current) {
    // Completed all questions
    handleSelectedServices();
    return;
  }
  // Display AI question
  const aiMsg = document.createElement('div');
  aiMsg.className = 'chat-message ai';
  aiMsg.textContent = current.text;
  chatBox.appendChild(aiMsg);
  chatBox.scrollTop = chatBox.scrollHeight;
  // Multi-select question
  if (current.type === 'multi') {
    if (signupInput) signupInput.style.display = 'none';
    if (selectServices) selectServices.style.display = 'block';
    const container = document.getElementById('service-options');
    if (container) {
      container.innerHTML = '';
      services.forEach(svc => {
        const div = document.createElement('div');
        const chk = document.createElement('input');
        chk.type = 'checkbox';
        chk.value = svc.slug;
        chk.id = `svc-${svc.slug}`;
        const label = document.createElement('label');
        label.textContent = svc.name;
        label.htmlFor = chk.id;
        div.appendChild(chk);
        div.appendChild(label);
        container.appendChild(div);
      });
    }
    const servicesSubmit = document.getElementById('services-submit');
    if (servicesSubmit) {
      servicesSubmit.onclick = () => {
        const selected = [];
        if (container) {
          container.querySelectorAll('input[type="checkbox"]').forEach(input => {
            if (input.checked) selected.push(input.value);
          });
        }
        signupAnswers[current.key] = selected;
        signupStep++;
        if (selectServices) selectServices.style.display = 'none';
        showNextSignupQuestion();
      };
    }
  } else {
    // Text answer question
    if (signupInput) signupInput.style.display = 'block';
    if (selectServices) selectServices.style.display = 'none';
    const answerInput = document.getElementById('signup-answer');
    const answerButton = document.getElementById('signup-submit');
    if (answerInput) answerInput.value = '';
    if (answerButton) {
      answerButton.onclick = () => {
        const val = answerInput.value.trim();
        if (!val) return;
        // Display user message
        const userMsg = document.createElement('div');
        userMsg.className = 'chat-message user';
        userMsg.textContent = val;
        chatBox.appendChild(userMsg);
        chatBox.scrollTop = chatBox.scrollHeight;
        signupAnswers[current.key] = val;
        signupStep++;
        showNextSignupQuestion();
      };
    }
  }
}

function handleSelectedServices() {
  const chatBox = document.getElementById('chat-box');
  if (chatBox) {
    const doneMsg = document.createElement('div');
    doneMsg.className = 'chat-message ai';
    doneMsg.textContent = "Great! We'll connect your services and build your website.";
    chatBox.appendChild(doneMsg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  const selected = signupAnswers.services || [];
  // Sequentially connect services. We ignore errors and placeholders.
  (async () => {
    for (const slug of selected) {
      try {
        await connectService(slug);
      } catch (e) {
        console.warn('Service connection failed for', slug);
      }
    }
    // Show Duda placeholder message
    const dudaMsg = document.getElementById('duda-message');
    const signupInput = document.getElementById('signup-input');
    const selectServices = document.getElementById('select-services');
    if (signupInput) signupInput.style.display = 'none';
    if (selectServices) selectServices.style.display = 'none';
    if (dudaMsg) dudaMsg.style.display = 'block';
    const finishBtn = document.getElementById('duda-done');
    if (finishBtn) {
      finishBtn.onclick = () => {
        localStorage.setItem('loggedIn', 'true');
        hideAuthOverlay();
        initDashboard();
        showTutorial();
      };
    }
  })();
}

function hideAuthOverlay() {
  const overlay = document.getElementById('auth-overlay');
  if (overlay) overlay.style.display = 'none';
}

function showTutorial() {
  const overlay = document.getElementById('tutorial-overlay');
  if (overlay) overlay.style.display = 'flex';
  const closeBtn = document.getElementById('tutorial-close');
  if (closeBtn) {
    closeBtn.onclick = () => {
      overlay.style.display = 'none';
    };
  }
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
         // Initialize metric variables. We'll attempt to fetch real data from
         // connected services. If nothing is connected or a call fails, we
         // fall back to zero values.
         let revenueThisMonth = 0;
         let revenueLastMonth = 0;
         let totalRevenue = 0;
         let unpaidBills = 0;
         let totalClients = 0;
         let activeLeads = 0;

         // If QuickBooks is connected, fetch accounts and customers to
         // populate revenue and client counts.
         if (connections.quickbooks) {
           try {
             const accRes = await fetch('/api/quickbooks/accounts');
             if (accRes.ok) {
               const accData = await accRes.json();
               // The QuickBooks API may return data under different keys depending on whether
               // we're hitting the sandbox API or our stub. Normalize to an array.
               const list = accData.Account || accData.accounts || [];
               list.forEach(acc => {
                 const bal = parseFloat(acc.Balance || acc.balance || 0);
                 if (!isNaN(bal)) {
                   totalRevenue += bal;
                 }
               });
               revenueThisMonth = totalRevenue;
               revenueLastMonth = 0;
             }
             const custRes = await fetch('/api/quickbooks/customers');
             if (custRes.ok) {
               const custData = await custRes.json();
               const custList = custData.Customer || custData.customers || [];
               totalClients = custList.length;
             }
           } catch (err) {
             console.warn('QuickBooks metric fetch failed', err);
           }
         }

         // If Zoom is connected, count upcoming meetings as active leads.
         if (connections.zoom) {
           try {
             const meetRes = await fetch('/api/zoom/meetings');
             if (meetRes.ok) {
               const meets = await meetRes.json();
               // The Zoom API returns an array of meetings or an object with meetings property.
               if (Array.isArray(meets)) {
                 activeLeads += meets.length;
               } else if (Array.isArray(meets.meetings)) {
                 activeLeads += meets.meetings.length;
               }
             }
           } catch (err) {
             console.warn('Zoom meeting fetch failed', err);
           }
         }

         // Update the DOM with our computed metrics. Use fallback to 0 if NaN.
         document.getElementById('revenueThisMonth').textContent = money(revenueThisMonth);
         document.getElementById('revenueLastMonth').textContent = money(revenueLastMonth);
         document.getElementById('totalRevenue').textContent = money(totalRevenue);
         document.getElementById('unpaidBills').textContent = unpaidBills;
         document.getElementById('totalClients').textContent = totalClients;
         document.getElementById('activeLeads').textContent = activeLeads;
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
  (async () => {
    // Default to random data. If QuickBooks is connected, compute a simple
    // revenue series by distributing the total account balance over 12 months.
    let revenueData = fakeSeries(12, 8000, 20000);
    if (connections.quickbooks) {
      try {
        const res = await fetch('/api/quickbooks/accounts');
        if (res.ok) {
          const data = await res.json();
          const list = data.Account || data.accounts || [];
          let total = 0;
          list.forEach(acc => {
            const bal = parseFloat(acc.Balance || acc.balance || 0);
            if (!isNaN(bal)) total += bal;
          });
          revenueData = Array.from({ length: 12 }, () => total / 12);
        }
      } catch (err) {
        console.warn('Revenue chart data fetch failed', err);
      }
    }
    new Chart(document.getElementById('chartRevenue'), {
      type:'line',
      data:{
        labels: monthLabels(12),
        datasets:[
          { label:'Revenue', data: revenueData, fill:true,
            backgroundColor:'rgba(103,210,255,0.2)', borderColor:'rgba(103,210,255,1)', tension:.3 },
          { label:'Cost', data: fakeSeries(12, 3000, 8000), fill:true,
            backgroundColor:'rgba(154,230,180,0.2)', borderColor:'rgba(154,230,180,1)', tension:.3 }
        ]
      },
      options:{ plugins:{legend:{display:false}}, scales:{x:{grid:{display:false}}, y:{grid:{color:'rgba(255,255,255,0.08)'}}}}
    });
  })();
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
