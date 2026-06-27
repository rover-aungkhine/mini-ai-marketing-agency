/* =============================================
   AgencyOS — Internal Team Page
   ============================================= */

import Store from '../store.js';
import { icon } from './icons.js';

const ROLES = [
  'Account Executive',
  'Creative Director',
  'Copywriter',
  'Designer',
  'Digital Marketer',
  'Media Buyer',
  'Strategist',
  'Video Editor',
  'Project Manager'
];

const STATUSES = ['active', 'freelance', 'inactive'];

export default function renderTeam(container) {
  let currentView = localStorage.getItem('agencyos_team_view') || 'directory';
  let currentRole = 'all';
  let currentStatus = 'all';
  let currentQuery = '';

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Team</h1>
        <p class="page-subtitle">Internal roles, capacity, and task ownership</p>
      </div>
      <button type="button" class="btn btn-primary" id="add-team-member-btn">+ Add Member</button>
    </div>

    <div class="team-tabs" role="group" aria-label="Team views">
      <button type="button" class="btn btn-small ${currentView === 'directory' ? 'active' : ''}" data-team-view="directory">Directory</button>
      <button type="button" class="btn btn-small ${currentView === 'workload' ? 'active' : ''}" data-team-view="workload">Workload</button>
    </div>

    <div id="team-form-slot"></div>

    <div class="filter-bar team-filter-bar">
      <input type="text" class="search-input" id="team-search" placeholder="Search team...">
      <select class="filter-select" id="team-role-filter">
        <option value="all">All Roles</option>
        ${ROLES.map(role => `<option value="${role}">${role}</option>`).join('')}
      </select>
      <select class="filter-select" id="team-status-filter">
        <option value="all">All Statuses</option>
        ${STATUSES.map(status => `<option value="${status}">${formatLabel(status)}</option>`).join('')}
      </select>
    </div>

    <div id="team-content"></div>
  `;

  const content = container.querySelector('#team-content');
  const formSlot = container.querySelector('#team-form-slot');
  const tabs = container.querySelectorAll('[data-team-view]');

  function render() {
    tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.teamView === currentView));
    const members = filterMembers(Store.getTeamMembers(), currentQuery, currentRole, currentStatus);
    if (currentView === 'directory') {
      content.innerHTML = renderDirectory(members);
      bindDirectoryCards(container, formSlot, render);
    } else {
      content.innerHTML = renderWorkload(members);
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      currentView = tab.dataset.teamView;
      localStorage.setItem('agencyos_team_view', currentView);
      render();
    });
  });

  container.querySelector('#team-search').addEventListener('input', (event) => {
    currentQuery = event.target.value;
    render();
  });

  container.querySelector('#team-role-filter').addEventListener('change', (event) => {
    currentRole = event.target.value;
    render();
  });

  container.querySelector('#team-status-filter').addEventListener('change', (event) => {
    currentStatus = event.target.value;
    render();
  });

  container.querySelector('#add-team-member-btn').addEventListener('click', () => {
    renderMemberForm(formSlot, null, () => {
      formSlot.innerHTML = '';
      render();
    });
  });

  render();
}

function filterMembers(members, query, role, status) {
  const q = query.trim().toLowerCase();
  return members.filter(member => {
    const matchesQuery = !q ||
      member.name.toLowerCase().includes(q) ||
      member.role.toLowerCase().includes(q) ||
      (member.department || '').toLowerCase().includes(q) ||
      (member.skills || []).some(skill => skill.toLowerCase().includes(q));
    const matchesRole = role === 'all' || member.role === role;
    const matchesStatus = status === 'all' || member.status === status;
    return matchesQuery && matchesRole && matchesStatus;
  });
}

function renderDirectory(members) {
  if (members.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-icon">${icon('team', 'empty-icon-svg')}</div>
        <h3>No team members found</h3>
        <p>Adjust filters or add your first internal team member.</p>
      </div>
    `;
  }

  const workload = Store.getTeamWorkload();
  return `
    <div class="team-grid">
      ${members.map(member => {
        const load = workload.find(item => item.member.id === member.id);
        return `
          <button type="button" class="team-card" data-member-id="${member.id}">
            <div class="team-card-top">
              <div class="team-avatar">${initials(member.name)}</div>
              <span class="status-badge status-${member.status}">${formatLabel(member.status)}</span>
            </div>
            <h3>${esc(member.name)}</h3>
            <p>${esc(member.role)} · ${esc(member.department || 'Agency')}</p>
            <div class="team-skill-list">
              ${(member.skills || []).slice(0, 4).map(skill => `<span class="mini-badge">${esc(skill)}</span>`).join('')}
            </div>
            <div class="team-card-meta">
              <span>${load?.assignedTasks.length || 0} active tasks</span>
              <span>${Number(member.weeklyCapacity) || 40}h/week</span>
            </div>
          </button>
        `;
      }).join('')}
    </div>
  `;
}

function renderWorkload(members) {
  const rows = Store.getTeamWorkload().filter(row => members.some(member => member.id === row.member.id));
  if (rows.length === 0) {
    return `<div class="empty-state-mini"><p>No workload data for this filter.</p></div>`;
  }

  return `
    <div class="team-workload-list">
      ${rows.map(row => {
        const upcoming = [...row.assignedTasks]
          .sort((a, b) => String(a.dueDate || '9999').localeCompare(String(b.dueDate || '9999')))
          .slice(0, 3);
        return `
          <div class="workload-row">
            <div class="workload-person">
              <div class="team-avatar">${initials(row.member.name)}</div>
              <div>
                <strong>${esc(row.member.name)}</strong>
                <span>${esc(row.member.role)}</span>
              </div>
            </div>
            <div class="workload-meter">
              <div class="workload-meter-bar">
                <div class="workload-meter-fill ${row.loadStatus}" style="width:${Math.min(row.loadPercent, 120)}%"></div>
              </div>
              <span>${row.estimatedHours}h / ${row.weeklyCapacity}h · ${row.loadPercent}%</span>
            </div>
            <span class="load-badge ${row.loadStatus}">${formatLabel(row.loadStatus)}</span>
            <div class="workload-tasks">
              ${upcoming.length === 0 ? '<span class="muted">No active assigned tasks</span>' : upcoming.map(task => `
                <a href="#/projects/${task.projectId}" class="workload-task-link">
                  ${esc(task.title)} <span>${esc(task.projectName)}${task.dueDate ? ` · ${formatDate(task.dueDate)}` : ''}</span>
                </a>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function bindDirectoryCards(container, formSlot, onSaved) {
  container.querySelectorAll('.team-card').forEach(card => {
    card.addEventListener('click', () => {
      const member = Store.getById('teamMembers', card.dataset.memberId);
      if (member) renderMemberForm(formSlot, member, onSaved);
    });
  });
}

function renderMemberForm(container, member, onSaved) {
  const isEdit = !!member;
  container.innerHTML = `
    <div class="card team-form-card">
      <div class="card-header-row">
        <h3>${isEdit ? 'Edit Team Member' : 'Add Team Member'}</h3>
        <button type="button" class="btn btn-small" id="close-team-form">Close</button>
      </div>
      <form id="team-member-form" novalidate>
        <div class="form-grid">
          <div class="field">
            <label for="team-name">Name <span class="required">*</span></label>
            <input type="text" id="team-name" value="${esc(member?.name || '')}" required>
            <span class="error-msg"></span>
          </div>
          <div class="field">
            <label for="team-role">Role</label>
            <select id="team-role">
              ${ROLES.map(role => `<option value="${role}" ${(member?.role || 'Designer') === role ? 'selected' : ''}>${role}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label for="team-department">Department</label>
            <input type="text" id="team-department" value="${esc(member?.department || '')}" placeholder="Creative, Content, Performance...">
          </div>
          <div class="field">
            <label for="team-status">Status</label>
            <select id="team-status">
              ${STATUSES.map(status => `<option value="${status}" ${(member?.status || 'active') === status ? 'selected' : ''}>${formatLabel(status)}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label for="team-email">Email</label>
            <input type="email" id="team-email" value="${esc(member?.email || '')}">
          </div>
          <div class="field">
            <label for="team-phone">Phone</label>
            <input type="text" id="team-phone" value="${esc(member?.phone || '')}">
          </div>
          <div class="field">
            <label for="team-capacity">Weekly Capacity</label>
            <input type="number" id="team-capacity" min="0" value="${member?.weeklyCapacity || 40}">
          </div>
          <div class="field">
            <label for="team-skills">Skills</label>
            <input type="text" id="team-skills" value="${esc((member?.skills || []).join(', '))}" placeholder="Ad copy, Meta Ads, Motion">
          </div>
        </div>
        <div class="field" style="margin-top:14px">
          <label for="team-notes">Notes</label>
          <textarea id="team-notes" rows="2">${esc(member?.notes || '')}</textarea>
        </div>
        ${isEdit ? renderMemberAssignments(member.id) : ''}
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">${isEdit ? 'Update Member' : 'Create Member'}</button>
          ${isEdit ? '<button type="button" class="btn btn-danger" id="delete-team-member">Delete</button>' : ''}
        </div>
      </form>
    </div>
  `;

  container.querySelector('#close-team-form').addEventListener('click', () => {
    container.innerHTML = '';
  });

  const form = container.querySelector('#team-member-form');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = form.querySelector('#team-name').value.trim();
    if (!name) {
      showFieldError(form, 'team-name', 'Name is required.');
      return;
    }

    const data = {
      name,
      role: form.querySelector('#team-role').value,
      department: form.querySelector('#team-department').value.trim(),
      email: form.querySelector('#team-email').value.trim(),
      phone: form.querySelector('#team-phone').value.trim(),
      status: form.querySelector('#team-status').value,
      skills: form.querySelector('#team-skills').value.split(',').map(s => s.trim()).filter(Boolean),
      weeklyCapacity: Number(form.querySelector('#team-capacity').value) || 40,
      notes: form.querySelector('#team-notes').value.trim()
    };

    if (isEdit) Store.update('teamMembers', member.id, data);
    else Store.create('teamMembers', data);
    showToast(isEdit ? 'Team member updated.' : 'Team member created.');
    onSaved();
  });

  container.querySelector('#delete-team-member')?.addEventListener('click', () => {
    if (!confirm(`Delete "${member.name}"? Existing tasks will keep legacy assignee text only.`)) return;
    Store.getProjects().forEach(project => {
      const tasks = (project.tasks || []).map(task =>
        task.assigneeId === member.id
          ? { ...task, assigneeId: '', assignee: member.name }
          : task
      );
      Store.update('projects', project.id, { tasks });
    });
    Store.delete('teamMembers', member.id);
    showToast('Team member deleted.');
    onSaved();
  });
}

function renderMemberAssignments(memberId) {
  const tasks = Store.getTeamWorkload()
    .find(row => row.member.id === memberId)?.assignedTasks || [];
  return `
    <div class="member-assignment-panel">
      <h4>Current Assignments</h4>
      ${tasks.length === 0 ? '<p class="muted">No active tasks assigned.</p>' : tasks.map(task => `
        <a href="#/projects/${task.projectId}" class="member-assignment-item">
          <span>${esc(task.title)}</span>
          <small>${esc(task.projectName)} · ${esc(task.clientName)}</small>
        </a>
      `).join('')}
    </div>
  `;
}

function showFieldError(form, fieldId, message) {
  const field = form.querySelector(`#${fieldId}`);
  field.classList.add('error');
  const error = field.parentElement.querySelector('.error-msg');
  if (error) {
    error.textContent = message;
    error.classList.add('visible');
  }
}

function initials(name) {
  return (name || '').split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatLabel(value) {
  return value.replace('-', ' ').replace(/\b\w/g, char => char.toUpperCase());
}

function showToast(message) {
  if (typeof window.showToast === 'function') window.showToast(message);
}

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
