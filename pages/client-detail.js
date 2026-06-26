/* =============================================
   AgencyOS — Client Detail Page
   ============================================= */

import Store from '../store.js';
import Router from '../router.js';

const SERVICE_MAP = {
  'social-media': 'Social Media', 'ads': 'Ads', 'design': 'Design',
  'website': 'Website', 'content': 'Content', 'seo': 'SEO',
  'email': 'Email', 'branding': 'Branding'
};

export default function renderClientDetail(container, params) {
  const client = Store.getById('clients', params.id);

  if (!client) {
    container.innerHTML = `<div class="empty-state"><h3>Client not found</h3><a href="#/clients" class="btn btn-primary">Back to Clients</a></div>`;
    return;
  }

  const projects = Store.getProjectsByClient(client.id);
  const fee = client.monthlyFee ? Number(client.monthlyFee).toLocaleString() : '—';

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">${esc(client.name)}</h1>
        <p class="page-subtitle">${esc(client.businessType)} · <span class="status-badge status-${client.status}">${client.status}</span></p>
      </div>
      <div class="header-actions">
        <a href="#/clients/${client.id}/edit" class="btn btn-secondary">Edit</a>
        <button class="btn btn-danger" id="delete-client-btn">Delete</button>
      </div>
    </div>

    <div class="detail-grid">
      <div class="card detail-info">
        <h3>Client Information</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Contact Person</span>
            <span class="info-value">${client.contactPerson ? esc(client.contactPerson) : '—'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Phone</span>
            <span class="info-value">${client.phone ? esc(client.phone) : '—'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Email</span>
            <span class="info-value">${client.email ? esc(client.email) : '—'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Monthly Fee</span>
            <span class="info-value">${fee} ${client.monthlyFee ? 'MMK' : ''}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Start Date</span>
            <span class="info-value">${client.startDate ? new Date(client.startDate).toLocaleDateString() : '—'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Status</span>
            <span class="info-value"><span class="status-badge status-${client.status}">${client.status}</span></span>
          </div>
        </div>
        ${client.services && client.services.length > 0 ? `
          <div class="info-item" style="margin-top:14px">
            <span class="info-label">Services</span>
            <div class="service-tags">${client.services.map(s => `<span class="mini-badge">${SERVICE_MAP[s] || s}</span>`).join('')}</div>
          </div>
        ` : ''}
        ${client.notes ? `
          <div class="info-item" style="margin-top:14px">
            <span class="info-label">Notes</span>
            <p class="info-notes">${esc(client.notes)}</p>
          </div>
        ` : ''}
      </div>

      <div class="card detail-projects">
        <div class="card-header-row">
          <h3>Projects (${projects.length})</h3>
          <a href="#/projects/new?client=${client.id}" class="btn btn-small btn-primary">+ New Project</a>
        </div>
        ${projects.length === 0 ? `
          <div class="empty-state-mini">
            <p>No projects yet for this client.</p>
            <a href="#/projects/new?client=${client.id}" class="btn btn-primary" style="margin-top:10px">+ Create First Project</a>
          </div>
        ` : `
          <div class="project-table">
            ${projects.map(p => `
              <a href="#/projects/${p.id}" class="project-row">
                <div class="project-row-info">
                  <span class="project-row-name">${esc(p.name)}</span>
                  <span class="project-row-type">${SERVICE_MAP[p.serviceType] || p.serviceType}</span>
                </div>
                <div class="project-row-meta">
                  <span class="priority-dot priority-${p.priority}"></span>
                  <span class="status-badge status-${p.status}">${p.status}</span>
                  ${p.deadline ? `<span class="project-row-date">${new Date(p.deadline).toLocaleDateString()}</span>` : ''}
                </div>
              </a>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  // Delete client
  container.querySelector('#delete-client-btn').addEventListener('click', () => {
    if (confirm(`Delete "${client.name}"? This will NOT delete their projects.`)) {
      Store.delete('clients', client.id);
      Router.navigate('#/clients');
    }
  });
}

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
