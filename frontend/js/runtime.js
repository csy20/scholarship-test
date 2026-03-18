const LOCAL_API_BASE = 'http://localhost:3000/api';

const PAGE_ROUTES = Object.freeze({
  home: './index.html',
  test: './test.html',
  result: './result.html'
});

function getApiCandidates() {
  const candidates = [];

  if (window.location.protocol !== 'file:') {
    candidates.push(`${window.location.origin}/api`);
  }

  candidates.push(LOCAL_API_BASE);
  return [...new Set(candidates)];
}

async function apiFetch(path, options = {}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  let lastError;

  for (const base of getApiCandidates()) {
    try {
      const response = await fetch(`${base}${normalizedPath}`, options);

      if (response.status === 404 || response.status === 405) {
        lastError = new Error(`API endpoint unavailable at ${base}${normalizedPath}`);
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Scholarship API unavailable.');
}

function navigateTo(page) {
  window.location.href = PAGE_ROUTES[page] || PAGE_ROUTES.home;
}

window.appRuntime = {
  apiFetch,
  navigateTo,
  routes: PAGE_ROUTES,
  connectionError:
    'Could not reach the scholarship server. Run `npm start` in the project and keep the backend available on http://localhost:3000.'
};
