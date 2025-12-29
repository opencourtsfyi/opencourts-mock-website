/* global window, document, fetch */
(function () {
  const OpenCourts = {};

  function qs(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  async function loadDatasets() {
    const candidates = [
      // When running on /datasets/*
      '../data/datasets.json',
      // When running on site root
      './data/datasets.json',
      // When running from a nested path
      '/data/datasets.json',
      '/opencourts-mock-website/data/datasets.json'
    ];

    let lastError = null;
    for (const url of candidates) {
      try {
        const res = await fetch(url);
        if (res.ok) return res.json();
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error('Unable to load datasets.json');
  }

  function normalize(text) {
    return (text || '').toString().trim().toLowerCase();
  }

  function matchesQuery(dataset, query) {
    const q = normalize(query);
    if (!q) return true;
    const hay = normalize([
      dataset.title,
      dataset.description,
      (dataset.tags || []).join(' '),
      dataset.jurisdiction?.state,
      dataset.jurisdiction?.county,
      dataset.court_level,
      dataset.court_type,
      dataset.license,
    ].filter(Boolean).join(' '));
    return hay.includes(q);
  }

  function uniqueValues(datasets, pick) {
    const set = new Set();
    for (const d of datasets) {
      const val = pick(d);
      if (val) set.add(val);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }

  function datasetCard(dataset) {
    const tags = (dataset.tags || []).slice(0, 4);
    const pills = tags.map(t => `<span class="pill">${escapeHtml(t)}</span>`).join('');

    const badges = (dataset.badges || []).map(b => {
      const cls = b.level === 'good' ? 'good' : (b.level === 'warn' ? 'warn' : '');
      return `<span class="badge ${cls}">${escapeHtml(b.label)}</span>`;
    }).join('');

    const detailHref = escapeAttr(resolveSiteHref(dataset.detail_page));

    return `
      <article class="panel">
        <div class="panel-body">
          <div class="kv" style="justify-content: space-between;">
            <div class="muted">${escapeHtml(dataset.jurisdiction?.state || 'Multi-state')} · ${escapeHtml(dataset.court_type || 'Court data')}</div>
            <div class="muted">${escapeHtml(dataset.license || '')}</div>
          </div>
          <h3 style="margin: 10px 0 8px;">
            <a href="${detailHref}">${escapeHtml(dataset.title)}</a>
          </h3>
          <p class="muted" style="margin: 0 0 10px;">${escapeHtml(dataset.description || '')}</p>
          <div class="kv" style="margin-bottom: 10px;">${badges}</div>
          <div class="kv">${pills}</div>
        </div>
      </article>
    `;
  }

  function resolveSiteHref(path) {
    const clean = (path || '').toString().replace(/^\/+/, '');
    const markers = ['/datasets/', '/api-docs/', '/api/', '/data/', '/assets/'];

    let root = window.location.pathname || '/';
    for (const marker of markers) {
      const idx = root.indexOf(marker);
      if (idx !== -1) {
        root = root.slice(0, idx + 1);
        break;
      }
    }

    if (!root.endsWith('/')) {
      root = root.slice(0, root.lastIndexOf('/') + 1);
    }

    return `${root}${clean}`;
  }

  function escapeHtml(s) {
    return (s || '').toString()
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function escapeAttr(s) {
    return escapeHtml(s).replaceAll(' ', '%20');
  }

  OpenCourts.renderFeatured = async function renderFeatured({ mountId, limit }) {
    const datasets = await loadDatasets();
    const mount = document.getElementById(mountId);
    if (!mount) return;
    mount.innerHTML = datasets.slice(0, limit || 3).map(datasetCard).join('');
  };

  OpenCourts.renderCatalog = async function renderCatalog({ mountId, filtersId }) {
    const datasets = await loadDatasets();
    const mount = document.getElementById(mountId);
    const filtersMount = document.getElementById(filtersId);
    if (!mount || !filtersMount) return;

    const stateOptions = uniqueValues(datasets, d => d.jurisdiction?.state);
    const courtTypeOptions = uniqueValues(datasets, d => d.court_type);
    const licenseOptions = uniqueValues(datasets, d => d.license);

    const initial = {
      q: qs('q'),
      state: qs('state'),
      court_type: qs('court_type'),
      license: qs('license'),
    };

    filtersMount.innerHTML = `
      <div class="filters panel">
        <div class="panel-body">
          <h2 style="margin-top: 0;">Filter</h2>
          <div style="display: grid; gap: 10px;">
            <div>
              <label for="filter-q">Search</label>
              <input id="filter-q" type="search" placeholder="Search datasets" value="${escapeHtml(initial.q)}" />
            </div>
            <div>
              <label for="filter-state">State</label>
              <select id="filter-state">
                <option value="">All</option>
                ${stateOptions.map(s => `<option value="${escapeHtml(s)}" ${s === initial.state ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label for="filter-court">Court type</label>
              <select id="filter-court">
                <option value="">All</option>
                ${courtTypeOptions.map(s => `<option value="${escapeHtml(s)}" ${s === initial.court_type ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label for="filter-license">License</label>
              <select id="filter-license">
                <option value="">All</option>
                ${licenseOptions.map(s => `<option value="${escapeHtml(s)}" ${s === initial.license ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}
              </select>
            </div>
            <div class="muted" id="result-count"></div>
          </div>
        </div>
      </div>
    `;

    const qInput = document.getElementById('filter-q');
    const stateSelect = document.getElementById('filter-state');
    const courtSelect = document.getElementById('filter-court');
    const licenseSelect = document.getElementById('filter-license');
    const resultCount = document.getElementById('result-count');

    function apply() {
      const q = qInput.value || '';
      const state = stateSelect.value || '';
      const court_type = courtSelect.value || '';
      const license = licenseSelect.value || '';

      const filtered = datasets
        .filter(d => matchesQuery(d, q))
        .filter(d => !state || d.jurisdiction?.state === state)
        .filter(d => !court_type || d.court_type === court_type)
        .filter(d => !license || d.license === license);

      mount.innerHTML = filtered.map(datasetCard).join('') || `<div class="panel"><div class="panel-body">No datasets match those filters.</div></div>`;
      resultCount.textContent = `${filtered.length} dataset(s)`;

      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (state) params.set('state', state);
      if (court_type) params.set('court_type', court_type);
      if (license) params.set('license', license);

      const url = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', url);
    }

    for (const el of [qInput, stateSelect, courtSelect, licenseSelect]) {
      el.addEventListener('input', apply);
      el.addEventListener('change', apply);
    }

    apply();
  };

  window.OpenCourts = OpenCourts;
})();
