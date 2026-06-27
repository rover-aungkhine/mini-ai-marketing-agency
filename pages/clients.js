/* =============================================
   AgencyOS — Clients List Page
   ============================================= */

import Store from '../store.js';

export default function renderClients(container) {
  const allClients = Store.getClients();
  const statuses = ['all', 'active', 'lead', 'paused', 'completed'];

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Clients</h1>
        <p class="page-subtitle">${allClients.length} client${allClients.length !== 1 ? 's' : ''} total</p>
      </div>
      <a href="#/clients/new" class="btn btn-primary">+ Add Client</a>
    </div>

    <div class="filter-bar">
      <input type="text" id="client-search" class="search-input" placeholder="Search clients...">
      <div class="filter-pills" id="status-filter">
        ${statuses.map(s => `
          <button class="pill ${s === 'all' ? 'active' : ''}" data-status="${s}">
            ${s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        `).join('')}
      </div>
    </div>

    <div id="clients-grid" class="clients-grid"></div>
  `;

  const grid = container.querySelector('#clients-grid');
  const searchInput = container.querySelector('#client-search');
  const pills = container.querySelectorAll('.pill');

  let currentStatus = 'all';
  let currentQuery = '';

  function renderList() {
    let filtered = currentStatus === 'all'
      ? allClients
      : allClients.filter(c => c.status === currentStatus);

    if (currentQuery) {
      const q = currentQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.businessType.toLowerCase().includes(q) ||
        (c.contactPerson && c.contactPerson.toLowerCase().includes(q))
      );
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <h3>${currentQuery || currentStatus !== 'all' ? 'No clients match your filter' : 'No clients yet'}</h3>
          <p>${currentQuery || currentStatus !== 'all' ? 'Try adjusting your search or filter.' : 'Add your first client to get started.'}</p>
          ${!currentQuery && currentStatus === 'all' ? '<a href="#/clients/new" class="btn btn-primary" style="margin-top:12px">+ Add Client</a>' : ''}
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(c => {
      const projects = Store.getProjectsByClient(c.id);
      const projectCount = projects.length;
      const fee = c.monthlyFee ? Number(c.monthlyFee).toLocaleString() : '—';

      return `
        <a href="#/clients/${c.id}/overview" class="client-card">
          <div class="client-card-top">
            <h3 class="client-name">${esc(c.name)}</h3>
            <span class="status-badge status-${c.status}">${c.status}</span>
          </div>
          <div class="client-card-type">${esc(c.businessType)}</div>
          <div class="client-card-meta">
            <span>${c.contactPerson ? esc(c.contactPerson) : 'No contact'}</span>
            <span>${projectCount} project${projectCount !== 1 ? 's' : ''}</span>
          </div>
          ${c.monthlyFee ? `<div class="client-card-fee">${fee} MMK/mo</div>` : ''}
          <div class="client-card-services">
            ${(c.services || []).map(s => `<span class="mini-badge">${formatService(s)}</span>`).join('')}
          </div>
        </a>
      `;
    }).join('');
  }

  // Search
  searchInput.addEventListener('input', (e) => {
    currentQuery = e.target.value;
    renderList();
  });

  // Status filter
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentStatus = pill.dataset.status;
      renderList();
    });
  });

  renderList();
}

function formatService(s) {
  const map = {
    'social-media': 'Social Media',
    'ads': 'Ads',
    'design': 'Design',
    'website': 'Website',
    'content': 'Content',
    'seo': 'SEO',
    'email': 'Email',
    'branding': 'Branding'
  };
  return map[s] || s;
}

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
