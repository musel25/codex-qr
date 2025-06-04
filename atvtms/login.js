const form = document.getElementById('login-form');
const errorEl = document.getElementById('login-error');

form.onsubmit = async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      window.location.href = 'index.html';
    } else {
      errorEl.textContent = 'Invalid credentials';
      errorEl.classList.remove('hidden');
    }
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  }
};
