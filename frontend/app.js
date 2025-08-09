document.addEventListener('DOMContentLoaded', async () => {
  await refreshMetrics();
  await loadEmails();
  renderCharts(); // draws pretty charts from current metrics (placeholder if none)
  wireChat();
});

let METRICS = {};

async function refreshMetrics(){
  try{
    const res = await fetch('/api/dashboard/metrics');
    METRICS = await res.json();

    setText('rev-mtd', money(METRICS.revenueThisMonth));
    setText('rev-last', money(METRICS.revenueLastMonth));
    setText('rev-total', money(METRICS.totalRevenue));
    setText('unpaid-bills', money(METRICS.unpaidBills || 0));
    

    // simple deltas (placeholder calc)
    const delta = pctDelta(METRICS.revenueThisMonth, METRICS.revenueLastMonth);
    setText('rev-mtd-delta', delta >= 0 ? `▲ ${delta}% vs last` : `▼ ${Math.abs(delta)}% vs last`);
    setText('rev-last-delta', `Close rate: ${(METRICS.closeRate || 0)}%`);
  }catch(e){ console.error(e); }
}

async function loadEmails(){
  try{
    const res = await fetch('/api/emails');
    const data = await res.json();
    const list = document.getElementById('email-list');
    list.innerHTML = '';
    (data.emails || []).forEach(e => {
      const li = document.createElement('li');
      li.innerHTML = `<div class="email-subject">${escapeHTML(e.subject)}</div>
        <div class="email-meta">${escapeHTML(e.from)} — ${new Date(e.receivedDate).toLocaleString()}</div>`;
      list.appendChild(li);
    });
  }catch(e){ console.error(e); }
}

function wireChat(){
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const text = input.value.trim();
    if(!text) return;
    pushChat('user', text);
    input.value = '';
    try{
      const ctx = METRICS;
      const res = await fetch('/api/chat', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ message:text, context:ctx })
      });
      const data = await res.json();
      pushChat('ai', data.reply || data.error || '(no reply)');
    }catch(err){
      console.error(err);
      pushChat('ai', 'Error talking to assistant.');
    }
  });
}

function pushChat(role,text){
  const box = document.getElementById('chat-container');
  const div = document.createElement('div');
  div.className = 'bubble ' + role;
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function renderCharts(){
  const ctx1 = document.getElementById('chartRevenue');
  const ctx2 = document.getElementById('chartLeads');
  const ctx3 = document.getElementById('chartChannels');

  const revSeries = fakeSeries(12, 20000, (METRICS.revenueThisMonth||0));
  new Chart(ctx1, {
    type:'line',
    data:{ labels: monthLabels(12),
      datasets:[{
        label:'Revenue', data:revSeries,
        tension:.35, fill:true,
        backgroundColor:'rgba(103,210,255,0.15)',
        borderColor:'rgba(103,210,255,1)', borderWidth:2,
        pointRadius:0
      }]
    },
    options:{ plugins:{legend:{display:false}}, scales:{x:{grid:{display:false}}, y:{grid:{color:'rgba(255,255,255,0.06)'}}}}
  });

  new Chart(ctx2, {
    type:'bar',
    data:{ labels: monthLabels(8),
      datasets:[
        { label:'Leads', data:fakeSeries(8, 40, 50), backgroundColor:'rgba(154,230,180,0.5)' },
        { label:'Wins',  data:fakeSeries(8, 10, 15), backgroundColor:'rgba(103,210,255,0.5)' }
      ]},
    options:{ plugins:{legend:{display:false}}, scales:{x:{grid:{display:false}}, y:{grid:{color:'rgba(255,255,255,0.06)'}}}}
  });

  new Chart(ctx3, {
    type:'bar',
    data:{ labels:['Organic','Paid','Email','Referral','Direct'],
      datasets:[{ label:'Sessions', data:fakeSeries(5, 100, 300), backgroundColor:[
        'rgba(103,210,255,0.7)',
        'rgba(154,230,180,0.7)',
        'rgba(255,214,102,0.7)',
        'rgba(189,178,255,0.7)',
        'rgba(255,164,164,0.7)'
      ]}]},
    options:{ plugins:{legend:{display:false}}, scales:{x:{grid:{display:false}}, y:{grid:{color:'rgba(255,255,255,0.06)'}}}}
  });
}

/* ---------- helpers ---------- */
function setText(id, value){ const el=document.getElementById(id); if(el) el.textContent=value; }
function money(v){ return `$${Number(v||0).toLocaleString(undefined,{minimumFractionDigits:0})}`; }
function pctDelta(a,b){ if(!b) return 0; return Math.round(((a-b)/b)*100); }
function monthLabels(n){
  const m=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const d=new Date();
  const out=[];
  for(let i=n-1;i>=0;i--){
    const x=new Date(d.getFullYear(), d.getMonth()-i, 1);
    out.push(m[x.getMonth()]);
  }
  return out;
}
function fakeSeries(n, min, max){
  return Array.from({length:n},()=>Math.floor(min + Math.random()*(max-min)));
}
function escapeHTML(s){
  return (s||'').replace(/[&<>"']/g, c => ({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#039;'
  })[c]);
}
