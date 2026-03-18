document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('startBtn');
  const err = document.getElementById('errorMsg');
  btn.textContent = 'Please wait...';
  btn.disabled = true;
  err.textContent = '';

  const data = {
    name:   document.getElementById('name').value.trim(),
    email:  document.getElementById('email').value.trim(),
    class:  parseInt(document.getElementById('class').value),
    school: document.getElementById('school').value.trim()
  };

  try {
    const res = await fetch('/api/students/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.success) {
      sessionStorage.setItem('studentId', result.studentId);
      sessionStorage.setItem('studentClass', data.class);
      sessionStorage.setItem('studentName', data.name);
      window.location.href = '/test';
    } else {
      err.textContent = result.message || 'Registration failed. Try again.';
      btn.textContent = 'Start Test'; btn.disabled = false;
    }
  } catch {
    err.textContent = 'Server error. Please try again.';
    btn.textContent = 'Start Test'; btn.disabled = false;
  }
});
