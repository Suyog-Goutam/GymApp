/* DammiGYM — Weight Tracker with Chart */
window.DG = window.DG || {};

DG.Weight = (() => {
  let chart = null;

  function render() {
    const session = DG.Auth.currentUser();
    const user = DG.Auth.currentUserData();
    const logs = DG.Storage.getLogs(session.id, 'weight');
    const latest = logs.length ? logs[logs.length - 1].weight : (user?.profile?.weight || 0);
    const first = logs.length ? logs[0].weight : latest;
    const change = (latest - first).toFixed(1);
    const bmi = DG.Utils.calcBMI(latest, user?.profile?.height || 170);
    const bmiCat = DG.Utils.bmiCategory(parseFloat(bmi));

    return `
    <div class="page">
      <div class="page-header"><h1>Weight</h1></div>
      <div class="page-content stagger">
        <!-- Stats -->
        <div class="grid-3 mb-lg">
          <div class="card" style="text-align:center;padding:14px">
            <div class="card-value" style="font-size:1.2rem">${latest}</div>
            <div class="card-label">Current (kg)</div>
          </div>
          <div class="card" style="text-align:center;padding:14px">
            <div class="card-value" style="font-size:1.2rem;color:${parseFloat(change) <= 0 ? 'var(--success)' : 'var(--error)'}">${change > 0 ? '+' : ''}${change}</div>
            <div class="card-label">Change (kg)</div>
          </div>
          <div class="card" style="text-align:center;padding:14px">
            <div class="card-value" style="font-size:1.2rem">${bmi}</div>
            <div class="card-label">${bmiCat}</div>
          </div>
        </div>

        <!-- Chart -->
        <div class="card mb-lg">
          <h4 class="mb-md">Progress Chart</h4>
          <div style="position:relative;height:220px">
            <canvas id="weight-chart"></canvas>
          </div>
        </div>

        <!-- Log Weight -->
        <div class="card">
          <h4 class="mb-md">Log Today's Weight</h4>
          <div style="display:flex;gap:8px">
            <input type="number" class="form-input" id="weight-input" placeholder="e.g. 79.5" min="30" max="300" step="0.1" value="${latest}">
            <button class="btn btn-primary" onclick="DG.Weight.logWeight()">Save</button>
          </div>
        </div>

        <!-- History -->
        ${logs.length > 0 ? `
          <h4 class="mt-lg mb-md">Recent History</h4>
          ${logs.slice(-10).reverse().map(l => `
            <div class="log-item">
              <span class="log-item-name">${DG.Utils.formatDate(l.date)}</span>
              <span class="log-item-value">${l.weight} kg</span>
            </div>
          `).join('')}
        ` : ''}
      </div>
    </div>`;
  }

  function logWeight() {
    const val = parseFloat(document.getElementById('weight-input')?.value);
    if (!DG.Utils.isValidNum(val, 30, 300)) { DG.UI.toast('Enter a valid weight (30-300 kg)', 'error'); return; }

    const session = DG.Auth.currentUser();
    const today = DG.Utils.today();

    DG.Storage.updateLogByDate(session.id, 'weight', today, { date: today, weight: val });

    // Also update profile weight
    DG.Storage.updateUser(session.id, {
      profile: { ...DG.Auth.currentUserData().profile, weight: val }
    });

    DG.UI.toast('Weight logged! ⚖️', 'success');
    DG.App.refresh();
  }

  function init() {
    setTimeout(renderChart, 100);
  }

  function renderChart() {
    const canvas = document.getElementById('weight-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    const session = DG.Auth.currentUser();
    const logs = DG.Storage.getLogs(session.id, 'weight');
    const last30 = logs.slice(-30);

    if (chart) chart.destroy();

    chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: last30.map(l => DG.Utils.formatDate(l.date)),
        datasets: [{
          label: 'Weight (kg)',
          data: last30.map(l => l.weight),
          borderColor: '#ff1a1a',
          backgroundColor: 'rgba(255, 26, 26, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#ff1a1a',
          pointBorderColor: '#ff1a1a',
          pointHoverRadius: 6,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a1a1a',
            titleColor: '#fff',
            bodyColor: '#a0a0a0',
            borderColor: 'rgba(255,26,26,0.3)',
            borderWidth: 1,
            padding: 10
          }
        },
        scales: {
          x: {
            ticks: { color: '#555', font: { size: 10 }, maxRotation: 45 },
            grid: { color: 'rgba(255,255,255,0.03)' }
          },
          y: {
            ticks: { color: '#555', font: { size: 10 } },
            grid: { color: 'rgba(255,255,255,0.05)' }
          }
        }
      }
    });
  }

  return { render, init, logWeight };
})();
