/* =============================================
   AgencyOS — Projects List Page
   ============================================= */

import Store from '../store.js';

const SERVICE_MAP = {
  'social-media': 'Social Media', 'ads': 'Ads', 'design': 'Design',
  'website': 'Website', 'content': 'Content', 'seo': 'SEO',
  'email': 'Email', 'branding': 'Branding'
};

export default function renderProjects(container) {
  const allProjects = Store.getProjects();
  const clients = Store.getClients();
  const statuses = ['all', 'draft', 'in-progress', 'review', 'completed', 'archived'];

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Projects</h1>
        <p class="page-subtitle">${allProjects.length} project${allProjects.length !== 1 ? 's' : ''} total</p>
      </div>
      <a href="#/projects/new" class="btn btn-primary">+ New Project</a>
    </div>

    <div class="filter-bar">
      <input type="text" id="project-search" class="search-input" placeholder="Search projects...">
      <select id="client-filter" class="filter-select">
        <option value="all">All Clients</option>
        ${clients.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}
      </select>
      <div class="filter-pills" id="status-filter">
        ${statuses.map(s => `
          <button class="pill ${s === 'all' ? 'active' : ''}" data-status="${s}">
            ${s === 'all' ? 'All' : s.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        `).join('')}
      </div>
    </div>

    <div id="projects-list" class="projects-list"></div>
  `;

  const list = container.querySelector('#projects-list');
  const searchInput = container.querySelector('#project-search');
  const clientFilter = container.querySelector('#client-filter');
  const pills = container.querySelectorAll('.pill');

  let currentStatus = 'all';
  let currentClient = 'all';
  let currentQuery = '';

  function renderList() {
    let filtered = [...allProjects];

    if (currentStatus !== 'all') {
      filtered = filtered.filter(p => p.status === currentStatus);
    }
    if (currentClient !== 'all') {
      filtered = filtered.filter(p => p.clientId === currentClient);
    }
    if (currentQuery) {
      const q = currentQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        Store.getClientName(p.clientId).toLowerCase().includes(q)
      );
    }

    if (filtered.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <h3>${currentQuery || currentStatus !== 'all' || currentClient !== 'all' ? 'No projects match your filter' : 'No projects yet'}</h3>
          <p>${currentQuery || currentStatus !== 'all' || currentClient !== 'all' ? 'Try adjusting your filters.' : 'Create your first project to get started.'}</p>
          ${!currentQuery && currentStatus === 'all' && currentClient === 'all' ? '<a href="#/projects/new" class="btn btn-primary" style="margin-top:12px">+ New Project</a>' : ''}
        </div>
      `;
      return;
    }

    list.innerHTML = `
      <div class="project-table project-table-header">
        <div class="project-row">
          <div class="project-row-info"><span>Project</span></div>
          <div class="project-row-meta"><span>Client</span><span>Type</span><span>Status</span><span>Deadline</span></div>
        </div>
      </div>
      <div class="project-table">
        ${filtered.map(p => {
          const clientName = Store.getClientName(p.clientId);
          return `
            <a href="#/projects/${p.id}" class="project-row">
              <div class="project-row-info">
                <span class="project-row-name">${esc(p.name)}</span>
              </div>
              <div class="project-row-meta">
                <span class="project-row-client">${esc(clientName)}</span>
                <span class="project-row-type">${SERVICE_MAP[p.serviceType] || p.serviceType}</span>
                <span class="status-badge status-${p.status}">${p.status}</span>
                <span class="project-row-date">${p.deadline ? new Date(p.deadline).toLocaleDateString() : '—'}</span>
              </div>
            </a>
          `;
        }).join('')}
      </div>
    `;
  }

  searchInput.addEventListener('input', (e) => { currentQuery = e.target.value; renderList(); });
  clientFilter.addEventListener('change', (e) => { currentClient = e.target.value; renderList(); });
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

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
