/* =============================================
   AgencyOS — Project Add/Edit Form
   ============================================= */

import Store from '../store.js';
import Router from '../router.js';

const SERVICE_OPTIONS = [
  { value: 'social-media', label: 'Social Media Management' },
  { value: 'ads', label: 'Paid Advertising' },
  { value: 'design', label: 'Graphic Design' },
  { value: 'website', label: 'Website Development' },
  { value: 'content', label: 'Content Creation' },
  { value: 'seo', label: 'SEO' },
  { value: 'email', label: 'Email Marketing' },
  { value: 'branding', label: 'Branding' }
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' }
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

const APPROVAL_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'revision-needed', label: 'Revision Needed' }
];

export default function renderProjectForm(container, params = {}) {
  const isEdit = !!params.id;
  const project = isEdit ? Store.getById('projects', params.id) : null;

  if (isEdit && !project) {
    container.innerHTML = `<div class="empty-state"><h3>Project not found</h3><a href="#/projects" class="btn btn-primary">Back to Projects</a></div>`;
    return;
  }

  const clients = Store.getClients();
  // Pre-select client from query param or from project
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const preselectedClient = project?.clientId || urlParams.get('client') || '';

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">${isEdit ? 'Edit Project' : 'New Project'}</h1>
        <p class="page-subtitle">${isEdit ? 'Update project details' : 'Create a new project for a client'}</p>
      </div>
      <a href="${isEdit ? `#/projects/${params.id}` : '#/projects'}" class="btn btn-secondary">← Back</a>
    </div>

    <div class="card form-card-wide">
      <form id="project-form" novalidate>
        <div class="form-grid">
          <div class="field">
            <label for="name">Project Name <span class="required">*</span></label>
            <input type="text" id="name" placeholder="e.g. June Social Media Package" value="${esc(project?.name || '')}" required>
            <span class="error-msg"></span>
          </div>
          <div class="field">
            <label for="clientId">Client <span class="required">*</span></label>
            <select id="clientId" required>
              <option value="">-- Select Client --</option>
              ${clients.map(c => `
                <option value="${c.id}" ${preselectedClient === c.id ? 'selected' : ''}>${esc(c.name)}</option>
              `).join('')}
            </select>
            <span class="error-msg"></span>
          </div>
          <div class="field">
            <label for="serviceType">Service Type</label>
            <select id="serviceType">
              ${SERVICE_OPTIONS.map(s => `
                <option value="${s.value}" ${(project?.serviceType || 'social-media') === s.value ? 'selected' : ''}>${s.label}</option>
              `).join('')}
            </select>
          </div>
          <div class="field">
            <label for="priority">Priority</label>
            <select id="priority">
              ${PRIORITY_OPTIONS.map(p => `
                <option value="${p.value}" ${(project?.priority || 'medium') === p.value ? 'selected' : ''}>${p.label}</option>
              `).join('')}
            </select>
          </div>
          <div class="field">
            <label for="startDate">Start Date</label>
            <input type="date" id="startDate" value="${project?.startDate || ''}">
          </div>
          <div class="field">
            <label for="deadline">Deadline</label>
            <input type="date" id="deadline" value="${project?.deadline || ''}">
          </div>
          <div class="field">
            <label for="status">Status</label>
            <select id="status">
              ${STATUS_OPTIONS.map(s => `
                <option value="${s.value}" ${(project?.status || 'draft') === s.value ? 'selected' : ''}>${s.label}</option>
              `).join('')}
            </select>
          </div>
          <div class="field">
            <label for="approvalStatus">Approval Status</label>
            <select id="approvalStatus">
              ${APPROVAL_OPTIONS.map(a => `
                <option value="${a.value}" ${(project?.approvalStatus || 'pending') === a.value ? 'selected' : ''}>${a.label}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <div class="field" style="margin-top: 18px;">
          <label for="scope">Scope / Deliverables</label>
          <textarea id="scope" rows="2" placeholder="e.g. 12 posts, 4 stories, 2 ad copies">${esc(project?.scope || '')}</textarea>
        </div>

        <div class="field" style="margin-top: 18px;">
          <label for="internalNotes">Internal Notes</label>
          <textarea id="internalNotes" rows="2" placeholder="Notes for your team only...">${esc(project?.internalNotes || '')}</textarea>
        </div>

        <div class="field" style="margin-top: 18px;">
          <label for="clientNotes">Client-Facing Notes</label>
          <textarea id="clientNotes" rows="2" placeholder="Notes to share with the client...">${esc(project?.clientNotes || '')}</textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">${isEdit ? 'Update Project' : 'Create Project'}</button>
          <a href="${isEdit ? `#/projects/${params.id}` : '#/projects'}" class="btn btn-secondary">Cancel</a>
        </div>
      </form>
    </div>
  `;

  const form = container.querySelector('#project-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFormErrors(form);

    const name = form.querySelector('#name').value.trim();
    const clientId = form.querySelector('#clientId').value;

    if (!name) { showFieldError(form, 'name', 'Project name is required.'); return; }
    if (!clientId) { showFieldError(form, 'clientId', 'Please select a client.'); return; }

    const data = {
      name,
      clientId,
      serviceType: form.querySelector('#serviceType').value,
      priority: form.querySelector('#priority').value,
      startDate: form.querySelector('#startDate').value || null,
      deadline: form.querySelector('#deadline').value || null,
      status: form.querySelector('#status').value,
      approvalStatus: form.querySelector('#approvalStatus').value,
      scope: form.querySelector('#scope').value.trim(),
      internalNotes: form.querySelector('#internalNotes').value.trim(),
      clientNotes: form.querySelector('#clientNotes').value.trim(),
      generatedContent: project?.generatedContent || null,
      tasks: project?.tasks || []
    };

    if (isEdit) {
      Store.update('projects', params.id, data);
      Router.navigate(`#/projects/${params.id}`);
    } else {
      const created = Store.create('projects', data);
      Router.navigate(`#/projects/${created.id}`);
    }
  });
}

function showFieldError(form, fieldId, msg) {
  const field = form.querySelector(`#${fieldId}`);
  field.classList.add('error');
  const errSpan = field.parentElement.querySelector('.error-msg');
  if (errSpan) { errSpan.textContent = msg; errSpan.classList.add('visible'); }
}

function clearFormErrors(form) {
  form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  form.querySelectorAll('.error-msg').forEach(el => { el.textContent = ''; el.classList.remove('visible'); });
}

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
