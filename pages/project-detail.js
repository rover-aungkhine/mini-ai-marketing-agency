/* =============================================
   AgencyOS — Project Detail Page
   ============================================= */

import Store from '../store.js';
import Router from '../router.js';
import { generate, interpolate } from '../generator.js';
import renderTasks from './project-tasks.js';

const SERVICE_MAP = {
  'social-media': 'Social Media', 'ads': 'Ads', 'design': 'Design',
  'website': 'Website', 'content': 'Content', 'seo': 'SEO',
  'email': 'Email', 'branding': 'Branding'
};

export default function renderProjectDetail(container, params) {
  const project = Store.getById('projects', params.id);

  if (!project) {
    container.innerHTML = `<div class="empty-state"><h3>Project not found</h3><a href="#/projects" class="btn btn-primary">Back to Projects</a></div>`;
    return;
  }

  const client = Store.getById('clients', project.clientId);
  const hasContent = project.generatedContent && project.generatedContent.positioning;

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">${esc(project.name)}</h1>
        <p class="page-subtitle">
          ${client ? `<a href="#/clients/${client.id}" class="link-subtle">${esc(client.name)}</a> · ` : ''}
          ${SERVICE_MAP[project.serviceType] || project.serviceType} ·
          <span class="status-badge status-${project.status}">${project.status}</span>
          <span class="priority-dot priority-${project.priority}" title="${project.priority}"></span>
        </p>
      </div>
      <div class="header-actions">
        <a href="#/projects/${project.id}/edit" class="btn btn-secondary">Edit</a>
        <button class="btn btn-danger" id="delete-project-btn">Delete</button>
      </div>
    </div>

    <div class="detail-grid">
      <div class="card detail-info">
        <h3>Project Details</h3>
        <div class="info-grid">
          <div class="info-item"><span class="info-label">Service</span><span class="info-value">${SERVICE_MAP[project.serviceType] || project.serviceType}</span></div>
          <div class="info-item"><span class="info-label">Priority</span><span class="info-value"><span class="priority-dot priority-${project.priority}"></span> ${project.priority}</span></div>
          <div class="info-item"><span class="info-label">Start Date</span><span class="info-value">${project.startDate ? new Date(project.startDate).toLocaleDateString() : '—'}</span></div>
          <div class="info-item"><span class="info-label">Deadline</span><span class="info-value">${project.deadline ? new Date(project.deadline).toLocaleDateString() : '—'}</span></div>
          <div class="info-item"><span class="info-label">Status</span><span class="info-value"><span class="status-badge status-${project.status}">${project.status}</span></span></div>
          <div class="info-item"><span class="info-label">Approval</span><span class="info-value"><span class="status-badge approval-${project.approvalStatus}">${project.approvalStatus || 'pending'}</span></span></div>
        </div>
        ${project.scope ? `<div class="info-item" style="margin-top:14px"><span class="info-label">Scope</span><p class="info-notes">${esc(project.scope)}</p></div>` : ''}
        ${project.internalNotes ? `<div class="info-item" style="margin-top:14px"><span class="info-label">Internal Notes</span><p class="info-notes">${esc(project.internalNotes)}</p></div>` : ''}
        ${project.clientNotes ? `<div class="info-item" style="margin-top:14px"><span class="info-label">Client Notes</span><p class="info-notes">${esc(project.clientNotes)}</p></div>` : ''}
      </div>

      <div class="card detail-content">
        <div class="card-header-row">
          <h3>Generated Content</h3>
          <button class="btn btn-primary btn-small" id="generate-btn">
            ${hasContent ? 'Regenerate' : 'Generate Content'}
          </button>
        </div>

        <div id="generator-form" style="display:none;">
          <div class="form-grid" style="gap:12px;">
            <div class="field">
              <label for="gen-offer">Main Offer / Campaign Focus</label>
              <input type="text" id="gen-offer" placeholder="e.g. 20% off first order">
            </div>
            <div class="field">
              <label for="gen-audience">Target Audience</label>
              <input type="text" id="gen-audience" placeholder="e.g. young professionals 25-40" value="${esc(client?.businessType || '')}">
            </div>
            <div class="field">
              <label for="gen-platform">Platform</label>
              <select id="gen-platform">
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>
            <div class="field">
              <label for="gen-tone">Tone</label>
              <select id="gen-tone">
                <option value="friendly">Friendly</option>
                <option value="professional">Professional</option>
                <option value="premium">Premium</option>
                <option value="fun">Fun</option>
              </select>
            </div>
            <div class="field">
              <label for="gen-language">Language</label>
              <select id="gen-language">
                <option value="en">English</option>
                <option value="my">Burmese (မြန်မာ)</option>
              </select>
            </div>
          </div>
          <button class="btn btn-primary" id="run-generate-btn" style="margin-top:12px">Generate</button>
        </div>

        <div id="content-output">
          ${hasContent ? renderContentOutput(project.generatedContent) : `
            <div class="empty-state-mini">
              <p>No content generated yet. Click "Generate Content" to create marketing content for this project.</p>
            </div>
          `}
        </div>
      </div>

      <div id="tasks-section" class="detail-tasks"></div>
    </div>
  `;

  // Generate button toggle
  const genForm = container.querySelector('#generator-form');
  const genBtn = container.querySelector('#generate-btn');
  genBtn.addEventListener('click', () => {
    genForm.style.display = genForm.style.display === 'none' ? 'block' : 'none';
  });

  // Run generation
  container.querySelector('#run-generate-btn').addEventListener('click', () => {
    const offer = container.querySelector('#gen-offer').value.trim() || 'special offer';
    const audience = container.querySelector('#gen-audience').value.trim() || client?.businessType || 'customers';
    const platform = container.querySelector('#gen-platform').value;
    const tone = container.querySelector('#gen-tone').value;
    const language = container.querySelector('#gen-language').value;

    const ctx = {
      name: client?.name || project.name,
      type: client?.businessType || 'business',
      product: project.serviceType.replace('-', ' '),
      audience,
      offer,
      platform,
      platformLabel: platform === 'facebook' ? 'Facebook' : 'Instagram',
      tone,
      language
    };

    const content = generate(ctx);
    Store.update('projects', project.id, { generatedContent: content });
    container.querySelector('#content-output').innerHTML = renderContentOutput(content);
    genForm.style.display = 'none';
  });

  // Copy buttons
  container.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.btn-copy');
    if (copyBtn) {
      const targetId = copyBtn.dataset.target;
      const el = container.querySelector(`#${targetId}`);
      if (el) {
        navigator.clipboard.writeText(el.innerText).then(() => {
          copyBtn.textContent = 'Copied!';
          setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
        });
      }
    }
  });

  // Delete
  container.querySelector('#delete-project-btn').addEventListener('click', () => {
    if (confirm(`Delete "${project.name}"?`)) {
      Store.delete('projects', project.id);
      if (client) Router.navigate(`#/clients/${client.id}`);
      else Router.navigate('#/projects');
    }
  });

  // Render tasks
  const tasksContainer = container.querySelector('#tasks-section');
  if (tasksContainer) {
    const freshProject = Store.getById('projects', project.id);
    renderTasks(tasksContainer, freshProject);
  }
}

function renderContentOutput(content) {
  const sections = [
    { id: 'co-positioning', title: 'Brand Positioning Summary', body: `<p>${content.positioning}</p>` },
    { id: 'co-pillars', title: 'Content Pillars', body: `<ol>${content.pillars.map(p => `<li><strong>${p}</strong></li>`).join('')}</ol>` },
    { id: 'co-posts', title: 'Post Ideas', body: `<ol>${content.posts.map((p, i) => `<li><strong>Post ${i+1}:</strong> ${p}</li>`).join('')}</ol>` },
    { id: 'co-captions', title: 'Captions', body: content.captions.map((c, i) => `<p><strong>Caption ${i+1}:</strong><br>${c}</p>`).join('') },
    { id: 'co-ads', title: 'Ad Copy', body: content.ads.map((a, i) => `<p><strong>Ad ${i+1}:</strong><br>${a}</p>`).join('') },
    { id: 'co-creative', title: 'Creative Headline', body: `<p><strong>Headline:</strong><br>${content.creative}</p>` }
  ];

  return sections.map(s => `
    <div class="content-section">
      <div class="content-section-header">
        <h4>${s.title}</h4>
        <button class="btn btn-small btn-copy" data-target="${s.id}">Copy</button>
      </div>
      <div class="content-section-body" id="${s.id}">${s.body}</div>
    </div>
  `).join('');
}

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
