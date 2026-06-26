/* =============================================
   AgencyOS — Client Workspace Sections
   ============================================= */

import Store from '../store.js';
import Router from '../router.js';
import { generate } from '../generator.js';
import { WORKSPACE_SECTIONS, icon } from './icons.js';
import { renderCreatives, renderAds, renderAssets, renderDocs } from './workspace-ch5.js';
import { esc, buildClientCtx, bindEscapeClose, copyText } from './workspace-utils.js';

const PLATFORM_LABELS = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  twitter: 'Twitter/X',
  youtube: 'YouTube'
};

const CALENDAR_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending-client', label: 'Pending Client' },
  { value: 'approved', label: 'Approved' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' }
];

const CONTRACT_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'signed', label: 'Signed' },
  { value: 'active', label: 'Active' }
];

export function renderWorkspaceSection(container, client, section, query = {}) {
  const renderers = {
    overview: renderOverview,
    brief: renderBrief,
    strategy: renderStrategy,
    calendar: renderCalendar,
    creatives: renderCreatives,
    ads: renderAds,
    meetings: renderMeetings,
    assets: renderAssets,
    docs: renderDocs
  };

  const fn = renderers[section] || renderOverview;
  fn(container, client, query);
}

function renderOverview(container, client) {
  const ws = client.workspace;
  const progress = Store.getWorkspaceProgress(client);
  const actions = Store.getClientActionQueue(client.id);
  const projects = Store.getProjectsByClient(client.id);
  const fee = client.monthlyFee ? Number(client.monthlyFee).toLocaleString() : null;

  container.innerHTML = `
    <div class="workspace-section">
      <div class="client-summary-grid">
        <div class="card">
          <h3>Client Details</h3>
          <div class="info-grid">
            <div class="info-item"><span class="info-label">Contact</span><span class="info-value">${esc(client.contactPerson) || '—'}</span></div>
            <div class="info-item"><span class="info-label">Email</span><span class="info-value">${esc(client.email) || '—'}</span></div>
            <div class="info-item"><span class="info-label">Phone</span><span class="info-value">${esc(client.phone) || '—'}</span></div>
            <div class="info-item"><span class="info-label">Monthly Fee</span><span class="info-value">${fee ? `${fee} MMK` : '—'}</span></div>
          </div>
          <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
            <a href="#/clients/${client.id}/edit" class="btn btn-secondary btn-small">Edit Client</a>
            <button type="button" class="btn btn-secondary btn-small" id="export-workspace-btn">Export Summary</button>
          </div>
        </div>
        <div class="card">
          <h3>Workspace Progress</h3>
          <div class="progress-strip">
            ${WORKSPACE_SECTIONS.filter(s => s.id !== 'overview').map(s => `
              <a href="#/clients/${client.id}/${s.id}" class="progress-chip ${progress[s.id] ? 'done' : ''}">
                <span class="progress-dot"></span>
                ${s.label}
              </a>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="card" style="margin-top:20px">
        <div class="card-header-row">
          <h3>Needs Attention</h3>
          <span class="mini-badge">${actions.length} item${actions.length !== 1 ? 's' : ''}</span>
        </div>
        ${actions.length === 0 ? `
          <div class="empty-state-mini"><p>All caught up! No pending actions for this client.</p></div>
        ` : `
          <div class="action-queue">
            ${actions.map(a => `
              <a href="${a.href}" class="action-queue-item priority-${a.priority}">
                <span class="action-queue-icon">${icon('alert', 'icon-sm')}</span>
                <span class="action-queue-label">${esc(a.label)}</span>
                <span class="priority-badge priority-${a.priority}">${a.priority}</span>
              </a>
            `).join('')}
          </div>
        `}
      </div>

      <div class="dashboard-grid" style="margin-top:20px">
        <div class="card">
          <div class="card-header-row"><h3>Quick Links</h3></div>
          <div class="quick-actions">
            ${WORKSPACE_SECTIONS.filter(s => s.id !== 'overview').map(s => `
              <a href="#/clients/${client.id}/${s.id}" class="action-btn">
                <span class="action-icon">${icon(s.icon, 'icon-sm')}</span>
                <span>${s.label}</span>
              </a>
            `).join('')}
          </div>
        </div>
        <div class="card">
          <div class="card-header-row">
            <h3>Projects (${projects.length})</h3>
            <a href="#/projects/new?client=${client.id}" class="btn btn-small btn-secondary">+ Project</a>
          </div>
          ${projects.length === 0 ? `
            <div class="empty-state-mini"><p>No legacy projects linked.</p></div>
          ` : projects.slice(0, 4).map(p => `
            <a href="#/projects/${p.id}" class="activity-item">
              <span class="activity-icon">${icon('brief', 'icon-sm')}</span>
              <div class="activity-info">
                <span class="activity-name">${esc(p.name)}</span>
                <span class="status-badge status-${p.status}">${p.status}</span>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  container.querySelector('#export-workspace-btn')?.addEventListener('click', () => {
    const summary = Store.exportWorkspaceSummary(client.id);
    copyText(summary);
  });
}

function renderBrief(container, client) {
  const brief = client.workspace.brief;

  container.innerHTML = `
    <div class="workspace-section">
      <div class="section-intro">
        <h2>Brief & Contract</h2>
        <p>Structured project brief and contract status — not just file storage.</p>
      </div>

      <div class="card contract-status-card">
        <div class="card-header-row">
          <h3>Contract Status</h3>
          <div class="contract-status-pills" id="contract-status-pills">
            ${CONTRACT_STATUSES.map(s => `
              <button type="button" class="pill ${brief.contractStatus === s.value ? 'active' : ''}" data-status="${s.value}">${s.label}</button>
            `).join('')}
          </div>
        </div>
      </div>

      <form id="brief-form" class="card form-card-wide" style="margin-top:16px" novalidate>
        <div class="form-grid">
          <div class="field field-full">
            <label for="brief-goals">Project Goals</label>
            <textarea id="brief-goals" rows="3" placeholder="What should this engagement achieve?">${esc(brief.goals)}</textarea>
          </div>
          <div class="field field-full">
            <label for="brief-audience">Target Audience</label>
            <textarea id="brief-audience" rows="2" placeholder="Who are we trying to reach?">${esc(brief.audience)}</textarea>
          </div>
          <div class="field field-full">
            <label for="brief-deliverables">Deliverables</label>
            <textarea id="brief-deliverables" rows="2" placeholder="Posts per week, ad creatives, reports...">${esc(brief.deliverables)}</textarea>
          </div>
          <div class="field">
            <label for="brief-budget">Budget</label>
            <input type="text" id="brief-budget" value="${esc(brief.budget)}" placeholder="e.g. 500,000 MMK/mo">
          </div>
          <div class="field">
            <label for="brief-timeline">Timeline</label>
            <input type="text" id="brief-timeline" value="${esc(brief.timeline)}" placeholder="e.g. 3-month retainer">
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="ai-expand-brief">${icon('sparkles', 'icon-sm')} Expand from notes</button>
          <button type="submit" class="btn btn-primary">Save Brief</button>
        </div>
      </form>
    </div>
  `;

  container.querySelector('#brief-form').addEventListener('submit', (e) => {
    e.preventDefault();
    saveBrief(client.id);
    window.showToast('Brief saved');
  });

  container.querySelectorAll('#contract-status-pills .pill').forEach(pill => {
    pill.addEventListener('click', () => {
      Store.updateWorkspaceSection(client.id, 'brief', { contractStatus: pill.dataset.status });
      container.querySelectorAll('#contract-status-pills .pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      window.showToast('Contract status updated');
    });
  });

  container.querySelector('#ai-expand-brief').addEventListener('click', () => {
    const ctx = buildClientCtx(client);
    const pkg = generate(ctx);
    const goals = container.querySelector('#brief-goals');
    const audience = container.querySelector('#brief-audience');
    if (!goals.value.trim()) goals.value = pkg.positioning;
    if (!audience.value.trim()) audience.value = `Primary audience: ${ctx.audience}`;
    window.showToast('Brief expanded with AI suggestions');
  });
}

function saveBrief(clientId) {
  Store.updateWorkspaceSection(clientId, 'brief', {
    goals: document.getElementById('brief-goals')?.value.trim() || '',
    audience: document.getElementById('brief-audience')?.value.trim() || '',
    deliverables: document.getElementById('brief-deliverables')?.value.trim() || '',
    budget: document.getElementById('brief-budget')?.value.trim() || '',
    timeline: document.getElementById('brief-timeline')?.value.trim() || ''
  });
}

function renderStrategy(container, client) {
  const strategy = client.workspace.strategy;
  const pillars = (strategy.pillars || []).join('\n');

  container.innerHTML = `
    <div class="workspace-section">
      <div class="section-intro">
        <h2>Strategy & Planning</h2>
        <p>Positioning, content pillars, and platform focus for this client.</p>
      </div>
      <form id="strategy-form" class="card form-card-wide" novalidate>
        <div class="field field-full">
          <label for="strategy-positioning">Positioning Statement</label>
          <textarea id="strategy-positioning" rows="4" placeholder="How does this brand stand out?">${esc(strategy.positioning)}</textarea>
        </div>
        <div class="field field-full">
          <label for="strategy-pillars">Content Pillars (one per line)</label>
          <textarea id="strategy-pillars" rows="4" placeholder="Behind the Scenes&#10;Customer Stories&#10;Tips & How-Tos">${esc(pillars)}</textarea>
        </div>
        <div class="field field-full">
          <label>Platform Focus</label>
          <div class="checkbox-grid" id="platform-checkboxes">
            ${Object.entries(PLATFORM_LABELS).map(([val, label]) => `
              <label class="checkbox-label">
                <input type="checkbox" value="${val}" ${(strategy.platforms || []).includes(val) ? 'checked' : ''}>
                ${label}
              </label>
            `).join('')}
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="ai-generate-strategy">${icon('sparkles', 'icon-sm')} Generate from brief</button>
          <button type="submit" class="btn btn-primary">Save Strategy</button>
        </div>
      </form>
    </div>
  `;

  container.querySelector('#strategy-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const platforms = [...container.querySelectorAll('#platform-checkboxes input:checked')].map(cb => cb.value);
    const pillarLines = container.querySelector('#strategy-pillars').value.split('\n').map(s => s.trim()).filter(Boolean);
    Store.updateWorkspaceSection(client.id, 'strategy', {
      positioning: container.querySelector('#strategy-positioning').value.trim(),
      pillars: pillarLines,
      platforms
    });
    window.showToast('Strategy saved');
  });

  container.querySelector('#ai-generate-strategy').addEventListener('click', () => {
    const ctx = buildClientCtx(client);
    const pkg = generate(ctx);
    const pos = container.querySelector('#strategy-positioning');
    const pillarsEl = container.querySelector('#strategy-pillars');
    if (!pos.value.trim()) pos.value = pkg.positioning;
    if (!pillarsEl.value.trim()) pillarsEl.value = pkg.pillars.join('\n');
    window.showToast('Strategy generated from client context');
  });
}

function renderCalendar(container, client, query) {
  const calendar = client.workspace.calendar || [];
  const view = query.view === 'month' ? 'month' : 'week';
  const offset = Number(query.offset) || 0;
  const anchor = new Date();
  if (view === 'week') {
    anchor.setDate(anchor.getDate() + offset * 7);
  } else {
    anchor.setMonth(anchor.getMonth() + offset);
  }

  const weekStart = getWeekStart(anchor);
  const monthStart = getMonthStart(anchor);
  const periodLabel = view === 'week' ? formatWeekRange(weekStart) : formatMonthLabel(monthStart);
  const baseHash = `#/clients/${client.id}/calendar`;

  container.innerHTML = `
    <div class="workspace-section">
      <div class="section-toolbar">
        <div class="section-intro" style="margin:0">
          <h2>Content Calendar</h2>
          <p>${periodLabel}</p>
        </div>
        <div class="calendar-controls">
          <div class="view-toggle" role="group" aria-label="Calendar view">
            <a href="${baseHash}?view=week&offset=${offset}" class="pill ${view === 'week' ? 'active' : ''}">Week</a>
            <a href="${baseHash}?view=month&offset=${offset}" class="pill ${view === 'month' ? 'active' : ''}">Month</a>
          </div>
          <div class="calendar-nav">
            <a href="${baseHash}?view=${view}&offset=${offset - 1}" class="btn btn-small btn-secondary" aria-label="Previous">←</a>
            <a href="${baseHash}?view=${view}&offset=0" class="btn btn-small btn-secondary">Today</a>
            <a href="${baseHash}?view=${view}&offset=${offset + 1}" class="btn btn-small btn-secondary" aria-label="Next">→</a>
          </div>
          <button type="button" class="btn btn-cta" id="add-post-btn">${icon('plus', 'icon-sm')} Add Post</button>
        </div>
      </div>

      ${view === 'week' ? renderWeekGrid(calendar, weekStart, client.id) : renderMonthGrid(calendar, monthStart, client.id)}

      ${calendar.length === 0 ? `
        <div class="empty-state" style="margin-top:24px">
          ${icon('calendar', 'empty-icon-svg')}
          <h3>Nothing scheduled yet</h3>
          <p>Add your first post to start planning content for ${esc(client.name)}.</p>
          <button type="button" class="btn btn-cta" id="add-post-empty" style="margin-top:12px">${icon('plus', 'icon-sm')} Add Post</button>
        </div>
      ` : `
        <div class="card" style="margin-top:24px">
          <div class="card-header-row"><h3>All Posts (${calendar.length})</h3></div>
          <div class="calendar-list">
            ${[...calendar].sort((a, b) => (a.scheduledDate || '').localeCompare(b.scheduledDate || '')).map(p => `
              <button type="button" class="calendar-list-row" data-post-id="${p.id}">
                <span class="calendar-list-date">${p.scheduledDate ? new Date(p.scheduledDate + 'T12:00:00').toLocaleDateString() : 'No date'}</span>
                <span class="calendar-list-title">${esc(p.title) || 'Untitled'}</span>
                <span class="platform-badge">${PLATFORM_LABELS[p.platform] || p.platform}</span>
                <span class="status-badge status-cal-${p.status}">${formatStatus(p.status)}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `}

      <div id="post-panel" class="slide-panel" hidden>
        <div class="slide-panel-backdrop" id="panel-backdrop"></div>
        <div class="slide-panel-content">
          <div class="slide-panel-header">
            <h3 id="panel-title">Post Details</h3>
            <button type="button" class="btn-icon" id="close-panel" aria-label="Close">${icon('x', 'icon-sm')}</button>
          </div>
          <form id="post-form" class="slide-panel-form" novalidate>
            <input type="hidden" id="post-id">
            <div class="field">
              <label for="post-title">Title</label>
              <input type="text" id="post-title" required>
            </div>
            <div class="field">
              <label for="post-platform">Platform</label>
              <select id="post-platform">
                ${Object.entries(PLATFORM_LABELS).map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label for="post-date">Scheduled Date</label>
              <input type="date" id="post-date">
            </div>
            <div class="field">
              <label for="post-status">Status</label>
              <select id="post-status">
                ${CALENDAR_STATUSES.map(s => `<option value="${s.value}">${s.label}</option>`).join('')}
              </select>
            </div>
            <div class="field field-full">
              <label for="post-caption">Caption</label>
              <textarea id="post-caption" rows="4"></textarea>
            </div>
            <div class="field field-full">
              <label for="post-notes">Internal Notes</label>
              <textarea id="post-notes" rows="2"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" id="ai-caption-btn">${icon('sparkles', 'icon-sm')} Generate Caption</button>
              <button type="button" class="btn btn-secondary" id="copy-caption-btn">Copy Caption</button>
              <button type="button" class="btn btn-danger" id="delete-post-btn">Delete</button>
              <button type="submit" class="btn btn-primary">Save Post</button>
            </div>
            <div class="approval-bar" id="approval-bar" hidden>
              <button type="button" class="btn btn-secondary" data-approve="pending-client">Send for Approval</button>
              <button type="button" class="btn btn-cta" data-approve="approved">Approve</button>
              <button type="button" class="btn btn-primary" data-approve="published">Mark Published</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  const openPanel = (postId = null) => {
    const panel = container.querySelector('#post-panel');
    const post = postId ? calendar.find(p => p.id === postId) : null;
    panel.hidden = false;
    document.body.classList.add('panel-open');

    container.querySelector('#post-id').value = post?.id || '';
    container.querySelector('#post-title').value = post?.title || '';
    container.querySelector('#post-platform').value = post?.platform || 'instagram';
    container.querySelector('#post-date').value = post?.scheduledDate || new Date().toISOString().slice(0, 10);
    container.querySelector('#post-status').value = post?.status || 'draft';
    container.querySelector('#post-caption').value = post?.caption || '';
    container.querySelector('#post-notes').value = post?.notes || '';
    container.querySelector('#panel-title').textContent = post ? 'Edit Post' : 'New Post';
    container.querySelector('#delete-post-btn').style.display = post ? '' : 'none';
    container.querySelector('#approval-bar').hidden = !post;
  };

  const closePanel = () => {
    container.querySelector('#post-panel').hidden = true;
    document.body.classList.remove('panel-open');
  };

  container.querySelector('#add-post-btn')?.addEventListener('click', () => openPanel());
  container.querySelector('#add-post-empty')?.addEventListener('click', () => openPanel());
  container.querySelector('#close-panel').addEventListener('click', closePanel);
  container.querySelector('#panel-backdrop').addEventListener('click', closePanel);

  container.querySelectorAll('.calendar-post-card, .calendar-list-row, .calendar-month-post').forEach(el => {
    el.addEventListener('click', () => openPanel(el.dataset.postId));
  });

  container.querySelector('#post-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      title: container.querySelector('#post-title').value.trim(),
      platform: container.querySelector('#post-platform').value,
      scheduledDate: container.querySelector('#post-date').value,
      status: container.querySelector('#post-status').value,
      caption: container.querySelector('#post-caption').value.trim(),
      notes: container.querySelector('#post-notes').value.trim()
    };
    const existingId = container.querySelector('#post-id').value;
    if (existingId) {
      Store.updateCalendarItem(client.id, existingId, data);
    } else {
      Store.addCalendarItem(client.id, data);
    }
    window.showToast('Post saved');
    Router.navigate(`#/clients/${client.id}/calendar`);
  });

  container.querySelector('#delete-post-btn').addEventListener('click', () => {
    const id = container.querySelector('#post-id').value;
    if (id && confirm('Delete this post?')) {
      Store.deleteCalendarItem(client.id, id);
      closePanel();
      window.showToast('Post deleted');
      Router.navigate(`#/clients/${client.id}/calendar`);
    }
  });

  container.querySelector('#ai-caption-btn').addEventListener('click', () => {
    const ctx = buildClientCtx(client);
    ctx.platform = container.querySelector('#post-platform').value;
    ctx.platformLabel = PLATFORM_LABELS[ctx.platform] || ctx.platform;
    const pkg = generate(ctx);
    const captionEl = container.querySelector('#post-caption');
    if (!captionEl.value.trim()) captionEl.value = pkg.captions[0];
    const titleEl = container.querySelector('#post-title');
    if (!titleEl.value.trim()) titleEl.value = pkg.posts[0].replace(/&#\d+;/g, '').slice(0, 80);
    window.showToast('Caption generated');
  });

  container.querySelector('#copy-caption-btn').addEventListener('click', () => {
    copyText(container.querySelector('#post-caption').value);
  });

  bindEscapeClose(container, '#post-panel');

  container.querySelectorAll('[data-approve]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = container.querySelector('#post-id').value;
      if (!id) return;
      Store.updateCalendarItem(client.id, id, { status: btn.dataset.approve });
      window.showToast(`Status: ${formatStatus(btn.dataset.approve)}`);
      Router.navigate(`#/clients/${client.id}/calendar`);
    });
  });

  if (query.post) openPanel(query.post);
}

function renderMeetings(container, client) {
  const meetings = [...(client.workspace.meetings || [])].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  container.innerHTML = `
    <div class="workspace-section">
      <div class="section-toolbar">
        <div class="section-intro" style="margin:0">
          <h2>Meetings & Feedback</h2>
          <p>Meeting logs with AI summaries and follow-up drafts.</p>
        </div>
        <button type="button" class="btn btn-cta" id="add-meeting-btn">${icon('plus', 'icon-sm')} Log Meeting</button>
      </div>

      ${meetings.length === 0 ? `
        <div class="empty-state">
          ${icon('meetings', 'empty-icon-svg')}
          <h3>No meetings logged</h3>
          <p>Record client syncs, feedback sessions, and action items.</p>
          <button type="button" class="btn btn-cta" id="add-meeting-empty" style="margin-top:12px">${icon('plus', 'icon-sm')} Log First Meeting</button>
        </div>
      ` : `
        <div class="meeting-timeline">
          ${meetings.map(m => renderMeetingCard(m, client)).join('')}
        </div>
      `}

      <div id="meeting-panel" class="slide-panel" hidden>
        <div class="slide-panel-backdrop" id="meeting-backdrop"></div>
        <div class="slide-panel-content">
          <div class="slide-panel-header">
            <h3 id="meeting-panel-title">Log Meeting</h3>
            <button type="button" class="btn-icon" id="close-meeting-panel" aria-label="Close">${icon('x', 'icon-sm')}</button>
          </div>
          <form id="meeting-form" novalidate>
            <input type="hidden" id="meeting-id">
            <div class="field">
              <label for="meeting-title">Title</label>
              <input type="text" id="meeting-title" placeholder="e.g. Monthly sync" required>
            </div>
            <div class="field">
              <label for="meeting-date">Date</label>
              <input type="date" id="meeting-date" required>
            </div>
            <div class="field">
              <label for="meeting-duration">Duration (min)</label>
              <input type="number" id="meeting-duration" min="15" step="15" value="30">
            </div>
            <div class="field field-full">
              <label for="meeting-notes">Notes</label>
              <textarea id="meeting-notes" rows="5" placeholder="Key discussion points..."></textarea>
            </div>
            <div class="field field-full" id="summary-field" hidden>
              <label>AI Summary</label>
              <div class="ai-result" id="meeting-summary-display"></div>
            </div>
            <div class="field field-full" id="followup-field" hidden>
              <label>Follow-up Draft</label>
              <div class="ai-result" id="meeting-followup-display"></div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" id="ai-summary-btn">${icon('sparkles', 'icon-sm')} Summarize</button>
              <button type="button" class="btn btn-secondary" id="ai-followup-btn">${icon('sparkles', 'icon-sm')} Draft Follow-up</button>
              <button type="button" class="btn btn-danger" id="delete-meeting-btn">Delete</button>
              <button type="submit" class="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  const openMeeting = (meetingId = null) => {
    const panel = container.querySelector('#meeting-panel');
    const meeting = meetingId ? meetings.find(m => m.id === meetingId) : null;
    panel.hidden = false;
    document.body.classList.add('panel-open');

    container.querySelector('#meeting-id').value = meeting?.id || '';
    container.querySelector('#meeting-title').value = meeting?.title || '';
    container.querySelector('#meeting-date').value = meeting?.date || new Date().toISOString().slice(0, 10);
    container.querySelector('#meeting-duration').value = meeting?.duration || 30;
    container.querySelector('#meeting-notes').value = meeting?.notes || '';
    container.querySelector('#meeting-panel-title').textContent = meeting ? 'Edit Meeting' : 'Log Meeting';
    container.querySelector('#delete-meeting-btn').style.display = meeting ? '' : 'none';

    const summaryField = container.querySelector('#summary-field');
    const followupField = container.querySelector('#followup-field');
    if (meeting?.summary) {
      summaryField.hidden = false;
      container.querySelector('#meeting-summary-display').textContent = meeting.summary;
    } else summaryField.hidden = true;
    if (meeting?.followUpDraft) {
      followupField.hidden = false;
      container.querySelector('#meeting-followup-display').textContent = meeting.followUpDraft;
    } else followupField.hidden = true;
  };

  const closeMeeting = () => {
    container.querySelector('#meeting-panel').hidden = true;
    document.body.classList.remove('panel-open');
  };

  container.querySelector('#add-meeting-btn')?.addEventListener('click', () => openMeeting());
  container.querySelector('#add-meeting-empty')?.addEventListener('click', () => openMeeting());
  container.querySelector('#close-meeting-panel').addEventListener('click', closeMeeting);
  container.querySelector('#meeting-backdrop').addEventListener('click', closeMeeting);

  container.querySelectorAll('[data-meeting-id]').forEach(btn => {
    btn.addEventListener('click', () => openMeeting(btn.dataset.meetingId));
  });

  container.querySelector('#meeting-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      title: container.querySelector('#meeting-title').value.trim(),
      date: container.querySelector('#meeting-date').value,
      duration: Number(container.querySelector('#meeting-duration').value) || 30,
      notes: container.querySelector('#meeting-notes').value.trim()
    };
    const existingId = container.querySelector('#meeting-id').value;
    if (existingId) {
      Store.updateMeeting(client.id, existingId, data);
    } else {
      Store.addMeeting(client.id, data);
    }
    window.showToast('Meeting saved');
    Router.navigate(`#/clients/${client.id}/meetings`);
  });

  container.querySelector('#delete-meeting-btn').addEventListener('click', () => {
    const id = container.querySelector('#meeting-id').value;
    if (id && confirm('Delete this meeting log?')) {
      Store.deleteMeeting(client.id, id);
      closeMeeting();
      Router.navigate(`#/clients/${client.id}/meetings`);
    }
  });

  container.querySelector('#ai-summary-btn').addEventListener('click', () => {
    const notes = container.querySelector('#meeting-notes').value.trim();
    if (!notes) { window.showToast('Add notes first'); return; }
    const summary = summarizeNotes(notes, client);
    const id = container.querySelector('#meeting-id').value;
    if (id) Store.updateMeeting(client.id, id, { summary });
    container.querySelector('#summary-field').hidden = false;
    container.querySelector('#meeting-summary-display').textContent = summary;
    window.showToast('Summary generated');
  });

  container.querySelector('#ai-followup-btn').addEventListener('click', () => {
    const notes = container.querySelector('#meeting-notes').value.trim();
    if (!notes) { window.showToast('Add notes first'); return; }
    const draft = draftFollowUp(notes, client);
    const id = container.querySelector('#meeting-id').value;
    if (id) Store.updateMeeting(client.id, id, { followUpDraft: draft });
    container.querySelector('#followup-field').hidden = false;
    container.querySelector('#meeting-followup-display').textContent = draft;
    window.showToast('Follow-up draft generated');
  });

  bindEscapeClose(container, '#meeting-panel');

  container.querySelectorAll('.copy-followup-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.meeting-card');
      const meetingId = card?.querySelector('[data-meeting-id]')?.dataset.meetingId;
      const meeting = meetings.find(m => m.id === meetingId);
      if (meeting?.followUpDraft) copyText(meeting.followUpDraft);
    });
  });
}

function renderMeetingCard(meeting, client) {
  return `
    <div class="card meeting-card">
      <div class="meeting-card-header">
        <div>
          <h4>${esc(meeting.title) || 'Untitled meeting'}</h4>
          <span class="meeting-meta">${meeting.date ? new Date(meeting.date + 'T12:00:00').toLocaleDateString() : ''} · ${meeting.duration || 30} min</span>
        </div>
        <button type="button" class="btn btn-small btn-secondary" data-meeting-id="${meeting.id}">Edit</button>
      </div>
      ${meeting.notes ? `<p class="meeting-notes-preview">${esc(meeting.notes)}</p>` : ''}
      ${meeting.summary ? `<div class="ai-result" style="margin-top:12px"><strong>Summary:</strong> ${esc(meeting.summary)}</div>` : ''}
      ${meeting.followUpDraft ? `
        <div class="ai-result" style="margin-top:8px">
          <strong>Follow-up:</strong> ${esc(meeting.followUpDraft)}
          <button type="button" class="btn btn-small btn-secondary copy-followup-btn" style="margin-top:8px">Copy Follow-up</button>
        </div>
      ` : ''}
    </div>
  `;
}

function renderPostCard(post) {
  return `
    <button type="button" class="calendar-post-card" data-post-id="${post.id}">
      <span class="platform-badge sm">${PLATFORM_LABELS[post.platform] || post.platform}</span>
      <span class="calendar-post-title">${esc(post.title) || 'Untitled'}</span>
      <span class="status-badge status-cal-${post.status} sm">${formatStatus(post.status)}</span>
    </button>
  `;
}

function renderWeekGrid(calendar, weekStart) {
  const days = getWeekDays(weekStart);
  return `
    <div class="calendar-week">
      ${days.map(day => {
        const dateStr = toDateStr(day);
        const dayPosts = calendar.filter(p => p.scheduledDate === dateStr);
        const isToday = dateStr === toDateStr(new Date());
        return `
          <div class="calendar-day ${isToday ? 'today' : ''}">
            <div class="calendar-day-header">
              <span class="calendar-day-name">${day.toLocaleDateString('en', { weekday: 'short' })}</span>
              <span class="calendar-day-date">${day.getDate()}</span>
            </div>
            <div class="calendar-day-posts">
              ${dayPosts.length === 0 ? '<span class="calendar-empty">—</span>' : dayPosts.map(p => renderPostCard(p)).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderMonthGrid(calendar, monthStart) {
  const gridStart = getWeekStart(monthStart);
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(d.getDate() + i);
    cells.push(d);
  }
  const month = monthStart.getMonth();
  return `
    <div class="calendar-month">
      <div class="calendar-month-weekdays">
        ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<span>${d}</span>`).join('')}
      </div>
      <div class="calendar-month-grid">
        ${cells.map(day => {
          const dateStr = toDateStr(day);
          const dayPosts = calendar.filter(p => p.scheduledDate === dateStr);
          const isOtherMonth = day.getMonth() !== month;
          const isToday = dateStr === toDateStr(new Date());
          return `
            <div class="calendar-month-cell ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}">
              <span class="calendar-month-date">${day.getDate()}</span>
              ${dayPosts.slice(0, 2).map(p => `
                <button type="button" class="calendar-month-post" data-post-id="${p.id}">${esc(p.title) || 'Post'}</button>
              `).join('')}
              ${dayPosts.length > 2 ? `<span class="calendar-month-more">+${dayPosts.length - 2}</span>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function summarizeNotes(notes, client) {
  const sentences = notes.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  const key = sentences.slice(0, 3).join('. ');
  return `Meeting with ${client.name}: ${key}${key.endsWith('.') ? '' : '.'} ${sentences.length > 3 ? `Plus ${sentences.length - 3} more discussion points.` : ''}`;
}

function draftFollowUp(notes, client) {
  return `Hi ${client.contactPerson || 'there'},\n\nThank you for today's meeting. Here's a quick recap of what we discussed:\n\n${notes.slice(0, 300)}${notes.length > 300 ? '...' : ''}\n\nNext steps: I'll follow up with the updated plan shortly.\n\nBest,\nYour Agency Team`;
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(12, 0, 0, 0);
  return d;
}

function getMonthStart(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(12, 0, 0, 0);
  return d;
}

function toDateStr(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getWeekDays(weekStart) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function formatWeekRange(weekStart) {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const opts = { month: 'short', day: 'numeric' };
  return `${weekStart.toLocaleDateString('en', opts)} – ${end.toLocaleDateString('en', opts)}`;
}

function formatMonthLabel(monthStart) {
  return monthStart.toLocaleDateString('en', { month: 'long', year: 'numeric' });
}

function formatStatus(status) {
  return CALENDAR_STATUSES.find(s => s.value === status)?.label || status;
}
