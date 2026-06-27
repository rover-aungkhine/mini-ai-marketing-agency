/* =============================================
   AgencyOS — Dashboard Page
   ============================================= */

import Store from '../store.js';
import { icon } from './icons.js';

export default function renderDashboard(container) {
  const clients = Store.getClients();
  const teamMembers = Store.getTeamMembers();
  const workload = Store.getTeamWorkload();
  const activeClients = clients.filter(c => c.status === 'active').length;
  const activeTeamMembers = teamMembers.filter(m => m.status === 'active' || m.status === 'freelance').length;
  const overloadedMembers = workload.filter(w => w.loadStatus === 'overloaded').length;
  const actionQueue = Store.getAgencyActionQueue();
  const pendingApprovals = actionQueue.filter(a =>
    a.type === 'calendar' || a.type === 'creative' || a.type === 'overdue'
  ).length;
  const recent = Store.getRecentActivity(6);

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Your agency at a glance</p>
      </div>
      <a href="#/clients/new" class="btn btn-primary">+ Add Client</a>
    </div>

    <div class="stat-grid">
      <div class="stat-card" data-color="accent">
        <div class="stat-icon">${icon('clients', 'icon-stat')}</div>
        <div class="stat-info">
          <span class="stat-number">${clients.length}</span>
          <span class="stat-label">Total Clients</span>
        </div>
      </div>
      <div class="stat-card" data-color="success">
        <div class="stat-info">
          <span class="stat-number">${activeClients}</span>
          <span class="stat-label">Active Clients</span>
        </div>
      </div>
      <div class="stat-card" data-color="warning">
        <div class="stat-info">
          <span class="stat-number">${pendingApprovals}</span>
          <span class="stat-label">Pending Approvals</span>
        </div>
      </div>
      <div class="stat-card" data-color="info">
        <div class="stat-info">
          <span class="stat-number">${activeTeamMembers}</span>
          <span class="stat-label">Active Team</span>
        </div>
      </div>
      <div class="stat-card" data-color="danger">
        <div class="stat-info">
          <span class="stat-number">${overloadedMembers}</span>
          <span class="stat-label">Overloaded</span>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header-row">
          <h3>Needs Attention</h3>
          <span class="mini-badge">${actionQueue.length}</span>
        </div>
        ${actionQueue.length === 0 ? `
          <div class="empty-state-mini"><p>All caught up across your agency!</p></div>
        ` : `
          <div class="action-queue">
            ${actionQueue.map(a => `
              <a href="${a.href}" class="action-queue-item priority-${a.priority}">
                <span class="action-queue-label">${esc(a.clientName)} — ${esc(a.label)}</span>
                <span class="priority-badge priority-${a.priority}">${a.priority}</span>
              </a>
            `).join('')}
          </div>
        `}
      </div>

      <div class="card">
        <div class="card-header-row">
          <h3>Quick Actions</h3>
        </div>
        <div class="quick-actions">
          <a href="#/clients/new" class="action-btn">
            <span class="action-icon">${icon('clients', 'icon-sm')}</span>
            <span>New Client</span>
          </a>
          <a href="#/clients" class="action-btn">
            <span class="action-icon">${icon('overview', 'icon-sm')}</span>
            <span>View Clients</span>
          </a>
          <a href="#/team" class="action-btn">
            <span class="action-icon">${icon('team', 'icon-sm')}</span>
            <span>Manage Team</span>
          </a>
          <a href="#/projects" class="action-btn">
            <span class="action-icon">${icon('projects', 'icon-sm')}</span>
            <span>View Projects</span>
          </a>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:20px">
      <div class="card-header-row"><h3>Recent Activity</h3></div>
      <div class="activity-list">
        ${recent.length === 0 ? `
          <div class="empty-state-mini"><p>No activity yet. Add your first client to get started.</p></div>
        ` : recent.map(item => `
          <a href="#/${item.type === 'client' ? `clients/${item.id}/overview` : `${item.type}s/${item.id}`}" class="activity-item">
            <span class="activity-icon">${icon(item.type === 'client' ? 'clients' : 'brief', 'icon-sm')}</span>
            <div class="activity-info">
              <span class="activity-name">${esc(item.name)}</span>
              <span class="activity-meta">
                ${item.type === 'project' ? `${esc(item.clientName)} · ` : ''}
                <span class="status-badge status-${item.status}">${item.status}</span>
              </span>
            </div>
            <span class="activity-time">${timeAgo(item.updatedAt)}</span>
          </a>
        `).join('')}
      </div>
    </div>
  `;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
