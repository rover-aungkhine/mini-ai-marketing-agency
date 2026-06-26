/* =============================================
   AgencyOS — Chapter 5 Workspace Sections
   ============================================= */

import Store from '../store.js';
import Router from '../router.js';
import { generate } from '../generator.js';
import { icon } from './icons.js';
import {
  esc, buildClientCtx, openSlidePanel, closeSlidePanel,
  bindSlidePanel, bindEscapeClose, bindCopyButtons, slidePanelMarkup
} from './workspace-utils.js';

const PLATFORM_LABELS = {
  instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok',
  linkedin: 'LinkedIn', twitter: 'Twitter/X', youtube: 'YouTube'
};

const CREATIVE_FORMATS = [
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'story', label: 'Story' }
];

const CREATIVE_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending-client', label: 'Pending Client' },
  { value: 'approved', label: 'Approved' }
];

const CAMPAIGN_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' }
];

const ASSET_TYPES = [
  { value: 'logo', label: 'Logo' },
  { value: 'color', label: 'Color' },
  { value: 'font', label: 'Font' },
  { value: 'guideline', label: 'Guideline' },
  { value: 'other', label: 'Other' }
];

const DOC_TYPES = [
  { value: 'proposal', label: 'Proposal' },
  { value: 'report', label: 'Report' },
  { value: 'contract', label: 'Contract' },
  { value: 'other', label: 'Other' }
];

export function renderCreatives(container, client, query = {}) {
  const creatives = client.workspace.creatives || [];
  const calendar = client.workspace.calendar || [];

  container.innerHTML = `
    <div class="workspace-section">
      <div class="section-toolbar">
        <div class="section-intro" style="margin:0">
          <h2>Creatives</h2>
          <p>Design assets and creative briefs linked to your content.</p>
        </div>
        <button type="button" class="btn btn-cta" id="add-creative-btn">${icon('plus', 'icon-sm')} Add Creative</button>
      </div>

      ${creatives.length === 0 ? `
        <div class="empty-state">
          ${icon('creatives', 'empty-icon-svg')}
          <h3>No creatives yet</h3>
          <p>Add design files, ad visuals, and creative briefs for ${esc(client.name)}.</p>
          <button type="button" class="btn btn-cta" id="add-creative-empty" style="margin-top:12px">${icon('plus', 'icon-sm')} Add Creative</button>
        </div>
      ` : `
        <div class="creatives-grid">
          ${creatives.map(c => renderCreativeCard(c, calendar)).join('')}
        </div>
      `}

      ${slidePanelMarkup('creative-panel', 'Creative', `
        <form id="creative-form" class="slide-panel-form" novalidate>
          <input type="hidden" id="creative-id">
          <div class="field"><label for="creative-title">Title</label><input type="text" id="creative-title" required></div>
          <div class="field"><label for="creative-format">Format</label>
            <select id="creative-format">${CREATIVE_FORMATS.map(f => `<option value="${f.value}">${f.label}</option>`).join('')}</select>
          </div>
          <div class="field"><label for="creative-status">Status</label>
            <select id="creative-status">${CREATIVE_STATUSES.map(s => `<option value="${s.value}">${s.label}</option>`).join('')}</select>
          </div>
          <div class="field"><label for="creative-linked">Linked Post</label>
            <select id="creative-linked"><option value="">None</option>
              ${calendar.map(p => `<option value="${p.id}">${esc(p.title) || 'Untitled'} (${p.scheduledDate || 'no date'})</option>`).join('')}
            </select>
          </div>
          <div class="field field-full"><label for="creative-brief">Creative Brief</label><textarea id="creative-brief" rows="4"></textarea></div>
          <div class="field field-full"><label for="creative-notes">Notes</label><textarea id="creative-notes" rows="2"></textarea></div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" id="ai-creative-btn">${icon('sparkles', 'icon-sm')} Generate Brief</button>
            <button type="button" class="btn btn-danger" id="delete-creative-btn">Delete</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
          <div class="approval-bar" id="creative-approval" hidden>
            <button type="button" class="btn btn-secondary" data-creative-status="pending-client">Send for Approval</button>
            <button type="button" class="btn btn-cta" data-creative-status="approved">Approve</button>
          </div>
        </form>
      `)}
    </div>
  `;

  const openCreative = (id = null) => {
    const item = id ? creatives.find(c => c.id === id) : null;
    openSlidePanel(container, '#creative-panel');
    container.querySelector('#creative-id').value = item?.id || '';
    container.querySelector('#creative-title').value = item?.title || '';
    container.querySelector('#creative-format').value = item?.format || 'image';
    container.querySelector('#creative-status').value = item?.status || 'draft';
    container.querySelector('#creative-linked').value = item?.linkedPostId || '';
    container.querySelector('#creative-brief').value = item?.brief || '';
    container.querySelector('#creative-notes').value = item?.notes || '';
    container.querySelector('#creative-panel-title').textContent = item ? 'Edit Creative' : 'New Creative';
    container.querySelector('#delete-creative-btn').style.display = item ? '' : 'none';
    container.querySelector('#creative-approval').hidden = !item;
  };

  container.querySelector('#add-creative-btn')?.addEventListener('click', () => openCreative());
  container.querySelector('#add-creative-empty')?.addEventListener('click', () => openCreative());
  container.querySelectorAll('[data-creative-id]').forEach(el => {
    el.addEventListener('click', () => openCreative(el.dataset.creativeId));
  });

  bindSlidePanel(container, { panelId: '#creative-panel', backdropId: '#creative-panel-backdrop', closeId: '#creative-panel-close' });
  bindEscapeClose(container, '#creative-panel');

  container.querySelector('#creative-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = readCreativeForm(container);
    const id = container.querySelector('#creative-id').value;
    if (id) Store.updateCreative(client.id, id, data);
    else Store.addCreative(client.id, data);
    window.showToast('Creative saved');
    Router.navigate(`#/clients/${client.id}/creatives`);
  });

  container.querySelector('#delete-creative-btn').addEventListener('click', () => {
    const id = container.querySelector('#creative-id').value;
    if (id && confirm('Delete this creative?')) {
      Store.deleteCreative(client.id, id);
      closeSlidePanel(container, '#creative-panel');
      Router.navigate(`#/clients/${client.id}/creatives`);
    }
  });

  container.querySelector('#ai-creative-btn').addEventListener('click', () => {
    const ctx = buildClientCtx(client);
    const pkg = generate(ctx);
    const brief = container.querySelector('#creative-brief');
    const title = container.querySelector('#creative-title');
    if (!brief.value.trim()) brief.value = pkg.creative;
    if (!title.value.trim()) title.value = `${client.name} — ${container.querySelector('#creative-format').value} creative`;
    window.showToast('Creative brief generated');
  });

  container.querySelectorAll('[data-creative-status]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = container.querySelector('#creative-id').value;
      if (!id) return;
      Store.updateCreative(client.id, id, { status: btn.dataset.creativeStatus });
      window.showToast('Status updated');
      Router.navigate(`#/clients/${client.id}/creatives`);
    });
  });

  if (query.item) openCreative(query.item);
}

function renderCreativeCard(c, calendar) {
  const linked = calendar.find(p => p.id === c.linkedPostId);
  return `
    <button type="button" class="creative-card" data-creative-id="${c.id}">
      <div class="creative-thumb format-${c.format}">${icon('creatives', 'icon-stat')}</div>
      <div class="creative-card-body">
        <h4>${esc(c.title) || 'Untitled'}</h4>
        <div class="creative-card-meta">
          <span class="mini-badge">${c.format}</span>
          <span class="status-badge status-cal-${c.status}">${c.status}</span>
        </div>
        ${linked ? `<span class="creative-linked">Linked: ${esc(linked.title) || 'Post'}</span>` : ''}
        ${c.brief ? `<p class="creative-brief-preview">${esc(c.brief)}</p>` : ''}
      </div>
    </button>
  `;
}

function readCreativeForm(container) {
  return {
    title: container.querySelector('#creative-title').value.trim(),
    format: container.querySelector('#creative-format').value,
    status: container.querySelector('#creative-status').value,
    linkedPostId: container.querySelector('#creative-linked').value,
    brief: container.querySelector('#creative-brief').value.trim(),
    notes: container.querySelector('#creative-notes').value.trim()
  };
}

export function renderAds(container, client, query = {}) {
  const campaigns = client.workspace.campaigns || [];

  container.innerHTML = `
    <div class="workspace-section">
      <div class="section-toolbar">
        <div class="section-intro" style="margin:0">
          <h2>Ads & Reports</h2>
          <p>Campaign tracking with KPIs and AI report summaries.</p>
        </div>
        <button type="button" class="btn btn-cta" id="add-campaign-btn">${icon('plus', 'icon-sm')} Add Campaign</button>
      </div>

      ${campaigns.length === 0 ? `
        <div class="empty-state">
          ${icon('ads', 'empty-icon-svg')}
          <h3>No campaigns yet</h3>
          <p>Track ad spend, KPIs, and generate report summaries.</p>
          <button type="button" class="btn btn-cta" id="add-campaign-empty" style="margin-top:12px">${icon('plus', 'icon-sm')} Add Campaign</button>
        </div>
      ` : `
        <div class="campaign-table-wrap card">
          <div class="campaign-table-header">
            <span>Campaign</span><span>Platform</span><span>Spend</span><span>Clicks</span><span>Status</span><span></span>
          </div>
          ${campaigns.map(c => `
            <button type="button" class="campaign-row" data-campaign-id="${c.id}">
              <span class="campaign-name">${esc(c.name) || 'Untitled'}</span>
              <span class="platform-badge sm">${PLATFORM_LABELS[c.platform] || c.platform}</span>
              <span>${Number(c.spend || 0).toLocaleString()}</span>
              <span>${Number(c.clicks || 0).toLocaleString()}</span>
              <span class="status-badge status-${c.status === 'active' ? 'active' : 'draft'}">${c.status}</span>
              <span class="campaign-chevron">→</span>
            </button>
          `).join('')}
        </div>
      `}

      ${slidePanelMarkup('campaign-panel', 'Campaign', `
        <form id="campaign-form" class="slide-panel-form" novalidate>
          <input type="hidden" id="campaign-id">
          <div class="field"><label for="campaign-name">Campaign Name</label><input type="text" id="campaign-name" required></div>
          <div class="field"><label for="campaign-platform">Platform</label>
            <select id="campaign-platform">${Object.entries(PLATFORM_LABELS).map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select>
          </div>
          <div class="field"><label for="campaign-status">Status</label>
            <select id="campaign-status">${CAMPAIGN_STATUSES.map(s => `<option value="${s.value}">${s.label}</option>`).join('')}</select>
          </div>
          <div class="field"><label for="campaign-budget">Budget (MMK)</label><input type="number" id="campaign-budget" min="0"></div>
          <div class="field"><label for="campaign-start">Start Date</label><input type="date" id="campaign-start"></div>
          <div class="field"><label for="campaign-end">End Date</label><input type="date" id="campaign-end"></div>
          <div class="kpi-grid">
            <div class="field"><label for="campaign-impressions">Impressions</label><input type="number" id="campaign-impressions" min="0" value="0"></div>
            <div class="field"><label for="campaign-clicks">Clicks</label><input type="number" id="campaign-clicks" min="0" value="0"></div>
            <div class="field"><label for="campaign-spend">Spend</label><input type="number" id="campaign-spend" min="0" value="0"></div>
          </div>
          <div class="field field-full"><label for="campaign-notes">Notes</label><textarea id="campaign-notes" rows="2"></textarea></div>
          <div class="field field-full" id="report-field" hidden>
            <label>AI Report Summary</label>
            <div class="ai-result" id="campaign-report-display"></div>
            <div id="report-copy-wrap" style="margin-top:8px"></div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" id="ai-report-btn">${icon('sparkles', 'icon-sm')} Generate Report</button>
            <button type="button" class="btn btn-danger" id="delete-campaign-btn">Delete</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      `)}
    </div>
  `;

  const openCampaign = (id = null) => {
    const item = id ? campaigns.find(c => c.id === id) : null;
    openSlidePanel(container, '#campaign-panel');
    container.querySelector('#campaign-id').value = item?.id || '';
    container.querySelector('#campaign-name').value = item?.name || '';
    container.querySelector('#campaign-platform').value = item?.platform || 'facebook';
    container.querySelector('#campaign-status').value = item?.status || 'draft';
    container.querySelector('#campaign-budget').value = item?.budget || '';
    container.querySelector('#campaign-start').value = item?.startDate || '';
    container.querySelector('#campaign-end').value = item?.endDate || '';
    container.querySelector('#campaign-impressions').value = item?.impressions || 0;
    container.querySelector('#campaign-clicks').value = item?.clicks || 0;
    container.querySelector('#campaign-spend').value = item?.spend || 0;
    container.querySelector('#campaign-notes').value = item?.notes || '';
    container.querySelector('#campaign-panel-title').textContent = item ? 'Edit Campaign' : 'New Campaign';
    container.querySelector('#delete-campaign-btn').style.display = item ? '' : 'none';
    const reportField = container.querySelector('#report-field');
    if (item?.reportSummary) {
      reportField.hidden = false;
      container.querySelector('#campaign-report-display').textContent = item.reportSummary;
      container.querySelector('#report-copy-wrap').innerHTML =
        `<button type="button" class="btn btn-small btn-secondary" id="copy-report-btn">Copy Report</button>`;
      container.querySelector('#copy-report-btn')?.addEventListener('click', () => {
        navigator.clipboard.writeText(item.reportSummary);
        window.showToast('Report copied');
      });
    } else {
      reportField.hidden = true;
    }
  };

  container.querySelector('#add-campaign-btn')?.addEventListener('click', () => openCampaign());
  container.querySelector('#add-campaign-empty')?.addEventListener('click', () => openCampaign());
  container.querySelectorAll('[data-campaign-id]').forEach(el => {
    el.addEventListener('click', () => openCampaign(el.dataset.campaignId));
  });

  bindSlidePanel(container, { panelId: '#campaign-panel', backdropId: '#campaign-panel-backdrop', closeId: '#campaign-panel-close' });
  bindEscapeClose(container, '#campaign-panel');

  container.querySelector('#campaign-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      name: container.querySelector('#campaign-name').value.trim(),
      platform: container.querySelector('#campaign-platform').value,
      status: container.querySelector('#campaign-status').value,
      budget: container.querySelector('#campaign-budget').value,
      startDate: container.querySelector('#campaign-start').value,
      endDate: container.querySelector('#campaign-end').value,
      impressions: Number(container.querySelector('#campaign-impressions').value) || 0,
      clicks: Number(container.querySelector('#campaign-clicks').value) || 0,
      spend: Number(container.querySelector('#campaign-spend').value) || 0,
      notes: container.querySelector('#campaign-notes').value.trim()
    };
    const id = container.querySelector('#campaign-id').value;
    if (id) Store.updateCampaign(client.id, id, data);
    else Store.addCampaign(client.id, data);
    window.showToast('Campaign saved');
    Router.navigate(`#/clients/${client.id}/ads`);
  });

  container.querySelector('#delete-campaign-btn').addEventListener('click', () => {
    const id = container.querySelector('#campaign-id').value;
    if (id && confirm('Delete this campaign?')) {
      Store.deleteCampaign(client.id, id);
      closeSlidePanel(container, '#campaign-panel');
      Router.navigate(`#/clients/${client.id}/ads`);
    }
  });

  container.querySelector('#ai-report-btn').addEventListener('click', () => {
    const name = container.querySelector('#campaign-name').value.trim() || 'Campaign';
    const impressions = Number(container.querySelector('#campaign-impressions').value) || 0;
    const clicks = Number(container.querySelector('#campaign-clicks').value) || 0;
    const spend = Number(container.querySelector('#campaign-spend').value) || 0;
    const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0';
    const summary = `Campaign Report: ${name}\n\nPeriod performance for ${client.name}:\n- Impressions: ${impressions.toLocaleString()}\n- Clicks: ${clicks.toLocaleString()}\n- CTR: ${ctr}%\n- Spend: ${spend.toLocaleString()} MMK\n\nSummary: The campaign ${clicks > 0 ? 'generated engagement' : 'is in early stages'}. ${spend > 0 ? `Cost per click: ${(spend / Math.max(clicks, 1)).toFixed(0)} MMK.` : 'Update spend data for full analysis.'}`;
    const id = container.querySelector('#campaign-id').value;
    if (id) Store.updateCampaign(client.id, id, { reportSummary: summary });
    container.querySelector('#report-field').hidden = false;
    container.querySelector('#campaign-report-display').textContent = summary;
    container.querySelector('#report-copy-wrap').innerHTML =
      `<button type="button" class="btn btn-small btn-secondary" id="copy-report-btn">Copy Report</button>`;
    container.querySelector('#copy-report-btn').addEventListener('click', () => {
      navigator.clipboard.writeText(summary);
      window.showToast('Report copied');
    });
    window.showToast('Report generated');
  });

  if (query.item) openCampaign(query.item);
}

export function renderAssets(container, client, query = {}) {
  const assets = client.workspace.brandAssets || [];

  container.innerHTML = `
    <div class="workspace-section">
      <div class="section-toolbar">
        <div class="section-intro" style="margin:0">
          <h2>Brand Assets</h2>
          <p>Logos, colors, fonts, and brand guidelines.</p>
        </div>
        <button type="button" class="btn btn-cta" id="add-asset-btn">${icon('plus', 'icon-sm')} Add Asset</button>
      </div>

      ${assets.length === 0 ? `
        <div class="empty-state">
          ${icon('assets', 'empty-icon-svg')}
          <h3>No brand assets</h3>
          <p>Organize logos, colors, fonts, and usage guidelines.</p>
          <button type="button" class="btn btn-cta" id="add-asset-empty" style="margin-top:12px">${icon('plus', 'icon-sm')} Add Asset</button>
        </div>
      ` : `
        <div class="assets-grid">
          ${assets.map(a => renderAssetCard(a)).join('')}
        </div>
      `}

      ${slidePanelMarkup('asset-panel', 'Brand Asset', `
        <form id="asset-form" class="slide-panel-form" novalidate>
          <input type="hidden" id="asset-id">
          <div class="field"><label for="asset-name">Name</label><input type="text" id="asset-name" required></div>
          <div class="field"><label for="asset-type">Type</label>
            <select id="asset-type">${ASSET_TYPES.map(t => `<option value="${t.value}">${t.label}</option>`).join('')}</select>
          </div>
          <div class="field field-full"><label for="asset-value">Value / URL / Hex</label>
            <input type="text" id="asset-value" placeholder="e.g. #6366F1 or https://...">
          </div>
          <div class="field field-full"><label for="asset-usage">Usage Context</label><input type="text" id="asset-usage" placeholder="e.g. Primary logo for social posts"></div>
          <div class="field field-full"><label for="asset-notes">Notes</label><textarea id="asset-notes" rows="2"></textarea></div>
          <div class="form-actions">
            <button type="button" class="btn btn-danger" id="delete-asset-btn">Delete</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      `)}
    </div>
  `;

  const openAsset = (id = null) => {
    const item = id ? assets.find(a => a.id === id) : null;
    openSlidePanel(container, '#asset-panel');
    container.querySelector('#asset-id').value = item?.id || '';
    container.querySelector('#asset-name').value = item?.name || '';
    container.querySelector('#asset-type').value = item?.type || 'logo';
    container.querySelector('#asset-value').value = item?.value || '';
    container.querySelector('#asset-usage').value = item?.usage || '';
    container.querySelector('#asset-notes').value = item?.notes || '';
    container.querySelector('#asset-panel-title').textContent = item ? 'Edit Asset' : 'New Asset';
    container.querySelector('#delete-asset-btn').style.display = item ? '' : 'none';
  };

  container.querySelector('#add-asset-btn')?.addEventListener('click', () => openAsset());
  container.querySelector('#add-asset-empty')?.addEventListener('click', () => openAsset());
  container.querySelectorAll('[data-asset-id]').forEach(el => {
    el.addEventListener('click', () => openAsset(el.dataset.assetId));
  });

  bindSlidePanel(container, { panelId: '#asset-panel', backdropId: '#asset-panel-backdrop', closeId: '#asset-panel-close' });
  bindEscapeClose(container, '#asset-panel');

  container.querySelector('#asset-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      name: container.querySelector('#asset-name').value.trim(),
      type: container.querySelector('#asset-type').value,
      value: container.querySelector('#asset-value').value.trim(),
      usage: container.querySelector('#asset-usage').value.trim(),
      notes: container.querySelector('#asset-notes').value.trim()
    };
    const id = container.querySelector('#asset-id').value;
    if (id) Store.updateBrandAsset(client.id, id, data);
    else Store.addBrandAsset(client.id, data);
    window.showToast('Asset saved');
    Router.navigate(`#/clients/${client.id}/assets`);
  });

  container.querySelector('#delete-asset-btn').addEventListener('click', () => {
    const id = container.querySelector('#asset-id').value;
    if (id && confirm('Delete this asset?')) {
      Store.deleteBrandAsset(client.id, id);
      closeSlidePanel(container, '#asset-panel');
      Router.navigate(`#/clients/${client.id}/assets`);
    }
  });

  if (query.item) openAsset(query.item);
}

function renderAssetCard(a) {
  const isColor = a.type === 'color' && /^#[0-9A-Fa-f]{3,8}$/.test(a.value);
  return `
    <button type="button" class="asset-card" data-asset-id="${a.id}">
      <div class="asset-preview type-${a.type}">
        ${isColor ? `<span class="color-swatch" style="background:${esc(a.value)}"></span>` : icon('assets', 'icon-stat')}
      </div>
      <div class="asset-card-body">
        <h4>${esc(a.name) || 'Untitled'}</h4>
        <span class="mini-badge">${a.type}</span>
        ${a.usage ? `<p class="asset-usage">${esc(a.usage)}</p>` : ''}
        ${a.value && !isColor ? `<span class="asset-value-text">${esc(a.value)}</span>` : ''}
        ${isColor ? `<span class="asset-value-text">${esc(a.value)}</span>` : ''}
      </div>
    </button>
  `;
}

export function renderDocs(container, client, query = {}) {
  const docs = client.workspace.sharedDocs || [];

  container.innerHTML = `
    <div class="workspace-section">
      <div class="section-toolbar">
        <div class="section-intro" style="margin:0">
          <h2>Shared Docs</h2>
          <p>Documents shared with your client.</p>
        </div>
        <button type="button" class="btn btn-cta" id="add-doc-btn">${icon('plus', 'icon-sm')} Add Doc</button>
      </div>

      ${docs.length === 0 ? `
        <div class="empty-state">
          ${icon('docs', 'empty-icon-svg')}
          <h3>No shared documents</h3>
          <p>Add proposals, reports, and client-facing references.</p>
          <button type="button" class="btn btn-cta" id="add-doc-empty" style="margin-top:12px">${icon('plus', 'icon-sm')} Add Document</button>
        </div>
      ` : `
        <div class="docs-list card">
          ${docs.map(d => `
            <button type="button" class="doc-row" data-doc-id="${d.id}">
              <span class="doc-icon">${icon('docs', 'icon-sm')}</span>
              <div class="doc-info">
                <span class="doc-title">${esc(d.title) || 'Untitled'}</span>
                <span class="doc-meta">${d.type} · ${d.updatedAt ? new Date(d.updatedAt).toLocaleDateString() : ''}</span>
              </div>
              ${d.sharedWithClient ? '<span class="shared-badge">Shared</span>' : '<span class="shared-badge private">Internal</span>'}
            </button>
          `).join('')}
        </div>
      `}

      ${slidePanelMarkup('doc-panel', 'Document', `
        <form id="doc-form" class="slide-panel-form" novalidate>
          <input type="hidden" id="doc-id">
          <div class="field"><label for="doc-title">Title</label><input type="text" id="doc-title" required></div>
          <div class="field"><label for="doc-type">Type</label>
            <select id="doc-type">${DOC_TYPES.map(t => `<option value="${t.value}">${t.label}</option>`).join('')}</select>
          </div>
          <div class="field field-full"><label for="doc-url">URL / Link</label><input type="url" id="doc-url" placeholder="https://..."></div>
          <div class="field field-full">
            <label class="checkbox-label">
              <input type="checkbox" id="doc-shared"> Shared with client
            </label>
          </div>
          <div class="field field-full"><label for="doc-notes">Notes</label><textarea id="doc-notes" rows="2"></textarea></div>
          <div class="form-actions">
            <button type="button" class="btn btn-danger" id="delete-doc-btn">Delete</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      `)}
    </div>
  `;

  const openDoc = (id = null) => {
    const item = id ? docs.find(d => d.id === id) : null;
    openSlidePanel(container, '#doc-panel');
    container.querySelector('#doc-id').value = item?.id || '';
    container.querySelector('#doc-title').value = item?.title || '';
    container.querySelector('#doc-type').value = item?.type || 'proposal';
    container.querySelector('#doc-url').value = item?.url || '';
    container.querySelector('#doc-shared').checked = !!item?.sharedWithClient;
    container.querySelector('#doc-notes').value = item?.notes || '';
    container.querySelector('#doc-panel-title').textContent = item ? 'Edit Document' : 'New Document';
    container.querySelector('#delete-doc-btn').style.display = item ? '' : 'none';
  };

  container.querySelector('#add-doc-btn')?.addEventListener('click', () => openDoc());
  container.querySelector('#add-doc-empty')?.addEventListener('click', () => openDoc());
  container.querySelectorAll('[data-doc-id]').forEach(el => {
    el.addEventListener('click', () => openDoc(el.dataset.docId));
  });

  bindSlidePanel(container, { panelId: '#doc-panel', backdropId: '#doc-panel-backdrop', closeId: '#doc-panel-close' });
  bindEscapeClose(container, '#doc-panel');

  container.querySelector('#doc-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      title: container.querySelector('#doc-title').value.trim(),
      type: container.querySelector('#doc-type').value,
      url: container.querySelector('#doc-url').value.trim(),
      sharedWithClient: container.querySelector('#doc-shared').checked,
      notes: container.querySelector('#doc-notes').value.trim()
    };
    const id = container.querySelector('#doc-id').value;
    if (id) Store.updateSharedDoc(client.id, id, data);
    else Store.addSharedDoc(client.id, data);
    window.showToast('Document saved');
    Router.navigate(`#/clients/${client.id}/docs`);
  });

  container.querySelector('#delete-doc-btn').addEventListener('click', () => {
    const id = container.querySelector('#doc-id').value;
    if (id && confirm('Delete this document?')) {
      Store.deleteSharedDoc(client.id, id);
      closeSlidePanel(container, '#doc-panel');
      Router.navigate(`#/clients/${client.id}/docs`);
    }
  });

  if (query.item) openDoc(query.item);
}
