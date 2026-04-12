const form   = document.getElementById('registerForm');
const btn    = document.getElementById('startBtn');
const errBox = document.getElementById('errorMsg');
const { apiFetch, navigateTo, routes, connectionError } = window.appRuntime;

// ── Admin credentials (case-insensitive name check) ───────────────────────────
const ADMIN_NAME    = 'jageshwar sahu';
const ADMIN_CLASS   = 12;
const ADMIN_WHATSAPP = '9329847848';
const ADMIN_PASSWORD = 'Jaggu@20';

function showError(msg) {
  errBox.innerHTML = `<span>⚠️</span> ${msg}`;
}
function clearError() { errBox.innerHTML = ''; }

// ── Admin Panel Logic ─────────────────────────────────────────────────────────
const adminOverlay  = document.getElementById('adminOverlay');
const adminDash     = document.getElementById('adminDash');
const adminPwd      = document.getElementById('adminPwd');
const adminErr      = document.getElementById('adminErr');
const adminLogin    = document.getElementById('adminLogin');
const adminCancel   = document.getElementById('adminCancel');
const adminLogout   = document.getElementById('adminLogout');
const togglePwd     = document.getElementById('togglePwd');
const adminSearch   = document.getElementById('adminSearch');
const adminTableBody= document.getElementById('adminTableBody');

let allStudents = [];

function openAdminOverlay() {
  adminOverlay.style.display = 'flex';
  adminPwd.value = '';
  adminErr.innerHTML = '';
  setTimeout(() => adminPwd.focus(), 100);
}

function closeAdminOverlay() {
  adminOverlay.style.display = 'none';
}

togglePwd.addEventListener('click', () => {
  adminPwd.type = adminPwd.type === 'password' ? 'text' : 'password';
  togglePwd.textContent = adminPwd.type === 'password' ? '👁' : '🙈';
});

adminCancel.addEventListener('click', closeAdminOverlay);

adminOverlay.addEventListener('click', (e) => {
  if (e.target === adminOverlay) closeAdminOverlay();
});

adminPwd.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') adminLogin.click();
});

adminLogin.addEventListener('click', () => {
  if (adminPwd.value === ADMIN_PASSWORD) {
    closeAdminOverlay();
    showAdminDashboard();
  } else {
    adminErr.innerHTML = '<span>⚠️</span> Incorrect password. Try again.';
    adminPwd.value = '';
    adminPwd.focus();
  }
});

adminLogout.addEventListener('click', () => {
  adminDash.style.display = 'none';
  document.querySelector('.reg-card').style.display = '';
});

// ── Lucky Draw Logic ──────────────────────────────────────────────────────────
const luckySpinBtn   = document.getElementById('luckySpinBtn');
const luckySpinLabel = document.getElementById('luckySpinLabel');
const luckyDrumInner = document.getElementById('luckyDrumInner');
const luckyResetBtn  = document.getElementById('luckyResetBtn');

const WINNER_LABELS = ['1st Draw 🥇', '2nd Draw 🥈', '3rd Draw 🥉'];
let luckyWinners    = [null, null, null];   // stores winner objects
let isSpinning      = false;

function nextDrawSlot() {
  return luckyWinners.findIndex(w => w === null);
}

function updateWinnerSlots() {
  luckyWinners.forEach((w, i) => {
    const idx = i + 1;
    const nameEl = document.getElementById(`winnerName${idx}`);
    const metaEl = document.getElementById(`winnerMeta${idx}`);
    const slot   = document.getElementById(`winner${idx}`);
    if (w) {
      nameEl.textContent = w.name;
      metaEl.textContent = `Class ${w.class} · ${w.school}`;
      slot.classList.add('winner-filled');
    } else {
      nameEl.textContent = '—';
      metaEl.textContent = WINNER_LABELS[i];
      slot.classList.remove('winner-filled');
    }
  });

  const slot = nextDrawSlot();
  if (slot === -1) {
    luckySpinBtn.disabled = true;
    luckySpinLabel.textContent = '✅ All 3 Draws Done';
  } else {
    luckySpinBtn.disabled = false;
    luckySpinLabel.textContent = `🎰\u00a0 Draw ${slot + 1}${['st','nd','rd'][slot]} Lucky Winner`;
  }
}

function spinDraw() {
  const slot = nextDrawSlot();
  if (slot === -1 || isSpinning) return;

  // Pool: all registered students who haven't already won
  const pool = allStudents.filter(s => !luckyWinners.some(w => w && w._id === s._id));
  if (!pool.length) {
    luckyDrumInner.textContent = '😅 No students left!';
    return;
  }

  isSpinning = true;
  luckySpinBtn.disabled = true;
  luckyDrumInner.classList.add('spinning');

  // Roll through random names rapidly for 2.5 s then freeze on winner
  const winner = pool[Math.floor(Math.random() * pool.length)];
  let ticks = 0;
  const totalTicks = 28;
  const interval = setInterval(() => {
    const rand = pool[Math.floor(Math.random() * pool.length)];
    luckyDrumInner.textContent = rand.name;
    ticks++;
    if (ticks >= totalTicks) {
      clearInterval(interval);
      luckyDrumInner.textContent = winner.name;
      luckyDrumInner.classList.remove('spinning');
      luckyDrumInner.classList.add('winner-flash');
      setTimeout(() => luckyDrumInner.classList.remove('winner-flash'), 1200);

      luckyWinners[slot] = winner;
      updateWinnerSlots();
      isSpinning = false;
    }
  }, 80);
}

luckySpinBtn.addEventListener('click', spinDraw);

luckyResetBtn.addEventListener('click', () => {
  luckyWinners = [null, null, null];
  luckyDrumInner.textContent = '🎲 Press Spin!';
  luckyDrumInner.classList.remove('spinning', 'winner-flash');
  updateWinnerSlots();
});

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function renderTable(students) {
  if (!students.length) {
    adminTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:32px;">No students found.</td></tr>`;
    return;
  }
  adminTableBody.innerHTML = students.map((s, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${s.name}</strong></td>
      <td>${s.whatsapp || '—'}</td>
      <td>Class ${s.class}</td>
      <td>${s.school}</td>
      <td>${s.score !== null ? `${s.score} / ${s.total}` : '—'}</td>
      <td>${s.percentage !== null ? `<span class="pct-badge ${s.percentage >= 60 ? 'pct-pass' : 'pct-fail'}">${s.percentage}%</span>` : '—'}</td>
      <td>${formatDate(s.submittedAt)}</td>
    </tr>
  `).join('');
}

adminSearch.addEventListener('input', () => {
  const q = adminSearch.value.toLowerCase();
  const filtered = allStudents.filter(s =>
    s.name.toLowerCase().includes(q) ||
    (s.whatsapp || '').includes(q)
  );
  renderTable(filtered);
});

async function showAdminDashboard() {
  document.querySelector('.reg-card').style.display = 'none';
  adminDash.style.display = 'flex';

  try {
    const res  = await apiFetch('/students/all');
    const data = await res.json();
    allStudents = data.students || [];

    document.getElementById('totalCount').textContent = allStudents.length;

    const submitted = allStudents.filter(s => s.score !== null);
    document.getElementById('submittedCount').textContent = submitted.length;

    const avg = submitted.length
      ? Math.round(submitted.reduce((a, s) => a + s.percentage, 0) / submitted.length)
      : 0;
    document.getElementById('avgScore').textContent = submitted.length ? `${avg}%` : '—';

    renderTable(allStudents);
    luckyWinners = [null, null, null];
    updateWinnerSlots();
  } catch {
    adminTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--danger);padding:32px;">⚠️ Could not load student data.</td></tr>`;
  }
}

// ── Registration Form ─────────────────────────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError();

  const name     = document.getElementById('name').value.trim();
  const whatsapp = document.getElementById('whatsapp').value.trim();
  const cls      = parseInt(document.getElementById('class').value);
  const school   = document.getElementById('school').value.trim();

  if (!name || !whatsapp || !cls || !school) {
    return showError('Please fill in all fields.');
  }

  if (!/^\d{10}$/.test(whatsapp)) {
    return showError('Please enter a valid 10-digit WhatsApp number.');
  }

  // ── Admin detection ──────────────────────────────────────────────────────
  if (
    name.toLowerCase() === ADMIN_NAME &&
    cls === ADMIN_CLASS &&
    whatsapp === ADMIN_WHATSAPP
  ) {
    openAdminOverlay();
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Registering...';

  try {
    const res    = await apiFetch('/students/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, whatsapp, class: cls, school })
    });
    const result = await res.json();

    if (result.success) {
      sessionStorage.setItem('studentId',    result.studentId);
      sessionStorage.setItem('studentClass', cls);
      sessionStorage.setItem('studentName',  name);
      navigateTo('test');
    } else if (result.blocked) {
      document.querySelector('.reg-card').innerHTML = `
        <div style="text-align:center; padding: 16px 0;">
          <div style="font-size:3rem; margin-bottom:12px;">🔒</div>
          <h2 style="font-family:Sora,sans-serif; font-size:1.4rem; font-weight:800; color:#0f172a; margin-bottom:8px;">Already Attempted</h2>
          <p style="color:#64748b; font-size:.9rem; line-height:1.6; margin-bottom:20px;">
            This WhatsApp number has already been used.<br>Each number is allowed <strong>one attempt only</strong>.
          </p>
          <div style="background:#eef2ff; border-radius:14px; padding:18px; margin-bottom:20px;">
            <div style="font-size:.75rem; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px;">Your Previous Score</div>
            <div style="font-size:2.2rem; font-weight:800; color:#4f46e5; font-family:Sora,sans-serif;">${result.percentage}%</div>
            <div style="font-size:.9rem; color:#64748b; margin-top:4px;">${result.score} / ${result.total} correct</div>
          </div>
          <a href="${routes.home}" style="display:block; padding:14px; background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff; border-radius:12px; text-decoration:none; font-weight:700; font-size:.95rem;">
            Back to Home
          </a>
        </div>`;
    } else {
      showError(result.message || 'Registration failed. Please try again.');
      btn.disabled = false;
      btn.innerHTML = 'Start Test &nbsp;→';
    }
  } catch {
    showError(connectionError);
    btn.disabled = false;
    btn.innerHTML = 'Start Test &nbsp;→';
  }
});
