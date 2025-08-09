document.addEventListener('DOMContentLoaded', () => {
  refreshMetrics();
  loadEmails();
  populateApps();
  wireChat();
  renderCharts();
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

/* Populate Integrated Apps */
function populateApps() {
  const apps = [
    'QuickBooks','Outlook','GoDaddy','Salesforce','Webflow','SEOptimer','AccessiBe',
    'Converge Pay','Talech','Zapier','Adobe Acrobat','Google Analytics',
    'Google Calendar','ChatGPT','Zoom','Calendly'
  ];
  const grid = document.getElementById('apps-grid');
  apps.forEach(name => {
    const card = document.createElement('div');
    card.className = 'app-card';
    card.textContent = name;
    card.addEventListener('click', () => {
      alert(`${name} module not yet implemented`);
    });
    grid.appendChild(card);
  });
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
    options:{ plugins:{legend:{display:false}}, scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(255,255,255,0.08)'}}}}
  });
  // Leads & Conversions
  new Chart(document.getElementById('chartLeads'), {
    type:'bar',
    data:{
      labels: monthLabels(8),
      datasets:[
        { label:'Leads', data:fakeSeries(8,20,60), backgroundColor:'rgba(103,210,255,0.6)' },
        { label:'Wins', data:fakeSeries(8,5,20), backgroundColor:'rgba(154,230,180,0.6)' }
      ]
    },
    options:{ plugins:{legend:{display:false}}, scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(255,255,255,0.08)'}}}}
  });
  // Channel Performance
  new Chart(document.getElementById('chartChannels'), {
    type:'bar',
    data:{
      labels:['Organic','Paid','Email','Referral','Direct'],
      datasets:[{ data:fakeSeries(5, 50, 200),
        backgroundColor:['#67d2ff','#9ae6b4','#ffd666','#bdb2ff','#ffa4a4'] }]
    },
    options:{ plugins:{legend:{display:false}}, scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(255,255,255,0.08)'}}}}
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
function escapeHTML(s){
  return s.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
}

