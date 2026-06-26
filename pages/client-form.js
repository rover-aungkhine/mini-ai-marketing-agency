/* =============================================
   AgencyOS — Client Add/Edit Form
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
  { value: 'lead', label: 'Lead' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' }
];

export default function renderClientForm(container, params = {}) {
  const isEdit = !!params.id;
  const client = isEdit ? Store.getById('clients', params.id) : null;

  if (isEdit && !client) {
    container.innerHTML = `<div class="empty-state"><h3>Client not found</h3><a href="#/clients" class="btn btn-primary">Back to Clients</a></div>`;
    return;
  }

  const currentServices = client ? (client.services || []) : [];

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">${isEdit ? 'Edit Client' : 'Add New Client'}</h1>
        <p class="page-subtitle">${isEdit ? 'Update client information' : 'Fill in the client details below'}</p>
      </div>
      <a href="${isEdit ? `#/clients/${params.id}/overview` : '#/clients'}" class="btn btn-secondary">← Back</a>
    </div>

    <div class="card form-card-wide">
      <form id="client-form" novalidate>
        <div class="form-grid">
          <div class="field">
            <label for="name">Client / Brand Name <span class="required">*</span></label>
            <input type="text" id="name" placeholder="e.g. Mandalay Tea House" value="${esc(client?.name || '')}" required>
            <span class="error-msg"></span>
          </div>
          <div class="field">
            <label for="businessType">Business Type <span class="required">*</span></label>
            <input type="text" id="businessType" placeholder="e.g. café, boutique, clinic" value="${esc(client?.businessType || '')}" required>
            <span class="error-msg"></span>
          </div>
          <div class="field">
            <label for="contactPerson">Contact Person</label>
            <input type="text" id="contactPerson" placeholder="e.g. Ma Htwe" value="${esc(client?.contactPerson || '')}">
          </div>
          <div class="field">
            <label for="phone">Phone</label>
            <input type="text" id="phone" placeholder="e.g. 09-123456789" value="${esc(client?.phone || '')}">
          </div>
          <div class="field">
            <label for="email">Email</label>
            <input type="email" id="email" placeholder="e.g. htwe@example.com" value="${esc(client?.email || '')}">
          </div>
          <div class="field">
            <label for="monthlyFee">Monthly Fee (MMK)</label>
            <input type="number" id="monthlyFee" placeholder="e.g. 500000" value="${client?.monthlyFee || ''}">
          </div>
          <div class="field">
            <label for="startDate">Start Date</label>
            <input type="date" id="startDate" value="${client?.startDate || ''}">
          </div>
          <div class="field">
            <label for="status">Status</label>
            <select id="status">
              ${STATUS_OPTIONS.map(s => `
                <option value="${s.value}" ${(client?.status || 'active') === s.value ? 'selected' : ''}>${s.label}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <div class="field" style="margin-top: 18px;">
          <label>Services Purchased</label>
          <div class="checkbox-grid" id="services-check">
            ${SERVICE_OPTIONS.map(s => `
              <label class="checkbox-label">
                <input type="checkbox" name="services" value="${s.value}" ${currentServices.includes(s.value) ? 'checked' : ''}>
                <span>${s.label}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <div class="field" style="margin-top: 18px;">
          <label for="notes">Notes</label>
          <textarea id="notes" rows="3" placeholder="Internal notes about this client...">${esc(client?.notes || '')}</textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">${isEdit ? 'Update Client' : 'Add Client'}</button>
          <a href="${isEdit ? `#/clients/${params.id}` : '#/clients'}" class="btn btn-secondary">Cancel</a>
        </div>
      </form>
    </div>
  `;

  const form = container.querySelector('#client-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFormErrors(form);

    const name = form.querySelector('#name').value.trim();
    const businessType = form.querySelector('#businessType').value.trim();

    if (!name) { showFieldError(form, 'name', 'Client name is required.'); return; }
    if (!businessType) { showFieldError(form, 'businessType', 'Business type is required.'); return; }

    const services = Array.from(form.querySelectorAll('input[name="services"]:checked')).map(cb => cb.value);

    const data = {
      name,
      businessType,
      contactPerson: form.querySelector('#contactPerson').value.trim(),
      phone: form.querySelector('#phone').value.trim(),
      email: form.querySelector('#email').value.trim(),
      monthlyFee: form.querySelector('#monthlyFee').value ? Number(form.querySelector('#monthlyFee').value) : null,
      startDate: form.querySelector('#startDate').value || null,
      status: form.querySelector('#status').value,
      services,
      notes: form.querySelector('#notes').value.trim()
    };

    if (isEdit) {
      Store.update('clients', params.id, data);
      Router.navigate(`#/clients/${params.id}/overview`);
    } else {
      const created = Store.create('clients', data);
      Store.ensureWorkspace(created);
      Router.navigate(`#/clients/${created.id}/overview`);
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
