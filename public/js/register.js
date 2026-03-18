const form   = document.getElementById('registerForm');
const btn    = document.getElementById('startBtn');
const errBox = document.getElementById('errorMsg');

function showError(msg) {
  errBox.innerHTML = `<span>⚠️</span> ${msg}`;
}
function clearError() { errBox.innerHTML = ''; }

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError();

  const name   = document.getElementById('name').value.trim();
  const email  = document.getElementById('email').value.trim().toLowerCase();
  const cls    = parseInt(document.getElementById('class').value);
  const school = document.getElementById('school').value.trim();

  if (!name || !email || !cls || !school) {
    return showError('Please fill in all fields.');
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Registering...';

  try {
    const res    = await fetch('/api/students/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, class: cls, school })
    });
    const result = await res.json();

    if (result.success) {
      sessionStorage.setItem('studentId',    result.studentId);
      sessionStorage.setItem('studentClass', cls);
      sessionStorage.setItem('studentName',  name);
      window.location.href = '/test';
    } else if (result.blocked) {
      // Show already-attempted screen
      document.querySelector('.reg-card').innerHTML = `
        <div style="text-align:center; padding: 16px 0;">
          <div style="font-size:3rem; margin-bottom:12px;">🔒</div>
          <h2 style="font-family:Sora,sans-serif; font-size:1.4rem; font-weight:800; color:#0f172a; margin-bottom:8px;">Already Attempted</h2>
          <p style="color:#64748b; font-size:.9rem; line-height:1.6; margin-bottom:20px;">
            This email has already been used.<br>Each email is allowed <strong>one attempt only</strong>.
          </p>
          <div style="background:#eef2ff; border-radius:14px; padding:18px; margin-bottom:20px;">
            <div style="font-size:.75rem; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px;">Your Previous Score</div>
            <div style="font-size:2.2rem; font-weight:800; color:#4f46e5; font-family:Sora,sans-serif;">${result.percentage}%</div>
            <div style="font-size:.9rem; color:#64748b; margin-top:4px;">${result.score} / ${result.total} correct</div>
          </div>
          <a href="/" style="display:block; padding:14px; background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff; border-radius:12px; text-decoration:none; font-weight:700; font-size:.95rem;">
            Back to Home
          </a>
        </div>`;
    } else {
      showError(result.message || 'Registration failed. Please try again.');
      btn.disabled = false;
      btn.innerHTML = 'Start Test &nbsp;→';
    }
  } catch {
    showError('Connection error. Please check your internet and try again.');
    btn.disabled = false;
    btn.innerHTML = 'Start Test &nbsp;→';
  }
});
