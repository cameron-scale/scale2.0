document.addEventListener('DOMContentLoaded', async () => {
  await refreshMetrics();
  await loadEmails();
  renderCharts();
  wireChat();
});
let METRICS = {};
async function refreshMetrics() { … fetch('/api/dashboard/metrics') … update KPIs … }
async function loadEmails() { … fetch('/api/emails') … }
function wireChat() { … fetch('/api/chat') … }
function renderCharts() { … Chart.js line and bar charts … }
// helpers: money(), pctDelta(), monthLabels(), etc.
