/* =============================================
   AgencyOS — Client Workspace Shell
   ============================================= */

import Store from '../store.js';
import Router from '../router.js';
import { WORKSPACE_SECTIONS, icon } from './icons.js';
import { renderWorkspaceSection } from './workspace-sections.js';

export default function renderClientWorkspace(container, params) {
  const section = params.section || 'overview';
  const client = Store.getClientWithWorkspace(params.id);

  if (!client) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Client not found</h3>
        <a href="#/clients" class="btn btn-primary">Back to Clients</a>
      </div>
    `;
    return;
  }

  const sectionMeta = WORKSPACE_SECTIONS.find(s => s.id === section) || WORKSPACE_SECTIONS[0];
  const query = parseQuery(location.hash);

  container.innerHTML = `
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="#/clients">Clients</a>
      <span class="breadcrumb-sep">/</span>
      <a href="#/clients/${client.id}/overview">${esc(client.name)}</a>
      ${section !== 'overview' ? `
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">${sectionMeta.label}</span>
      ` : ''}
    </nav>

    <div class="workspace-header">
      <div class="workspace-header-main">
        <h1 class="page-title">${esc(client.name)}</h1>
        <p class="page-subtitle">
          ${esc(client.businessType)}
          · <span class="status-badge status-${client.status}">${client.status}</span>
        </p>
      </div>
      <div class="header-actions">
        <a href="#/clients/${client.id}/edit" class="btn btn-secondary btn-small">Edit</a>
      </div>
    </div>

    <div class="workspace-tabs" role="tablist" aria-label="Workspace sections">
      ${WORKSPACE_SECTIONS.map(s => `
        <a href="#/clients/${client.id}/${s.id}"
           class="workspace-tab ${s.id === section ? 'active' : ''}"
           role="tab"
           aria-selected="${s.id === section}">
          ${icon(s.icon, 'icon-sm')}
          <span class="workspace-tab-label">${s.label}</span>
        </a>
      `).join('')}
    </div>

    <div id="workspace-content" class="workspace-content" role="tabpanel"></div>
  `;

  const content = container.querySelector('#workspace-content');
  renderWorkspaceSection(content, client, section, query);
}

function parseQuery(hash) {
  const qIndex = hash.indexOf('?');
  if (qIndex === -1) return {};
  const params = new URLSearchParams(hash.slice(qIndex + 1));
  const query = {};
  params.forEach((v, k) => { query[k] = v; });
  return query;
}

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
