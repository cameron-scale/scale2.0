document.addEventListener('DOMContentLoaded', async () => {
  await loadMetrics();
  renderAllCharts();
});
let METRICS = {};
async function loadMetrics(){
  try{
    const res = await fetch('/api/dashboard/metrics');
    METRICS = await res.json();
    const gross = document.getElementById('gross-revenue');
    if(gross){ gross.textContent = money(METRICS.totalRevenue); }
    const donutValue = document.getElementById('donut-value');
    if(donutValue){
      const growth = pctDelta(METRICS.revenueThisMonth, METRICS.revenueLastMonth);
      donutValue.textContent = `${growth >= 0 ? '▲' : '▼'} ${Math.abs(growth)}%`;
    }
  }catch(e){ console.error('Metrics error',e); }
}
function renderAllCharts(){
  const months = monthLabels(8);
  // Big chart (bar + line)
  new Chart(document.getElementById('chartBig'), {
    type:'bar',
    data:{
      labels:months,
      datasets:[
        { label:'Revenue', data:fakeSeries(8,15000,25000).map((v,i)=> i === 7 && METRICS.revenueThisMonth ? METRICS.revenueThisMonth : v), backgroundColor:'rgba(103,210,255,0.6)', borderRadius:4 },
        { type:'line', label:'Growth %', data:fakeSeries(8,-5,15), borderColor:'rgba(154,230,180,1)', yAxisID:'y1', tension:.3 }
      ]
    },
    options:{
      scales:{
        y:{ grid:{color:'rgba(255,255,255,0.08)'}, ticks:{color:'#8ba9ce'} },
        y1:{ position:'right', grid:{display:false}, ticks:{color:'#8ba9ce', callback:v=>v+'%'}},
        x:{ grid:{display:false}, ticks:{color:'#8ba9ce'} }
      },
      plugins:{ legend:{display:false} }
    }
  });
  // Donut chart
  new Chart(document.getElementById('chartDonut'), {
    type:'doughnut',
    data:{
      labels:['Organic','Paid','Referral','Direct','Email'],
      datasets:[{ data:fakeSeries(5,10,50), backgroundColor:['#67d2ff','#9ae6b4','#ffd666','#bdb2ff','#ffa4a4'], borderWidth:1 }]
    },
    options:{ cutout:'60%', plugins:{ legend:{display:false} }}
  });
  // Mini bar chart
  new Chart(document.getElementById('chartMiniBar'), {
    type:'bar',
    data:{ labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], datasets:[{ data:fakeSeries(7,5,20), backgroundColor:'rgba(103,210,255,0.7)', borderRadius:3 }]},
    options:{ plugins:{ legend:{display:false}}, scales:{ x:{grid:{display:false}, ticks:{display:false}}, y:{grid:{display:false}, ticks:{display:false}} }}
  });
  // Leads & Wins bar chart
  new Chart(document.getElementById('chartBar1'), {
    type:'bar',
    data:{ labels:months, datasets:[
        { data:fakeSeries(8,20,60), backgroundColor:'rgba(103,210,255,0.7)', borderRadius:3 },
        { data:fakeSeries(8,5,20), backgroundColor:'rgba(154,230,180,0.7)', borderRadius:3 }
      ]},
    options:{ plugins:{ legend:{display:false}}, scales:{ x:{grid:{display:false}, ticks:{color:'#8ba9ce'}}, y:{grid:{color:'rgba(255,255,255,0.08)'}, ticks:{color:'#8ba9ce'}}}}
  });
  // Channel performance bar chart
  new Chart(document.getElementById('chartBar2'), {
    type:'bar',
    data:{ labels:['Organic','Paid','Email','Referral','Direct'], datasets:[{ data:fakeSeries(5,100,300), backgroundColor:['#67d2ff','#9ae6b4','#ffd666','#bdb2ff','#ffa4a4'], borderRadius:3 }]},
    options:{ plugins:{ legend:{display:false}}, scales:{ x:{grid:{display:false}, ticks:{color:'#8ba9ce'}}, y:{grid:{color:'rgba(255,255,255,0.08)'}, ticks:{color:'#8ba9ce'}}}}
  });
}
function money(v){ return `$${Number(v||0).toLocaleString()}`; }
function pctDelta(a,b){ return b ? Math.round(((a-b)/b)*100) : 0; }
function monthLabels(n){
  const names=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const d=new Date(); const out=[];
  for(let i=n-1;i>=0;i--){ const dt=new Date(d.getFullYear(), d.getMonth()-i, 1); out.push(names[dt.getMonth()]); }
  return out;
}
function fakeSeries(n,min,max){ return Array.from({length:n},()=>Math.floor(min + Math.random()*(max-min))); }
