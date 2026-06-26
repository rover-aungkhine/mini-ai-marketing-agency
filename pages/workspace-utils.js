/* =============================================
   AgencyOS — Workspace Shared Utilities
   ============================================= */

export function esc(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

export function copyText(text) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    window.showToast('Copied to clipboard');
  }).catch(() => {
    window.showToast('Could not copy');
  });
}

export function openSlidePanel(container, panelId) {
  const panel = container.querySelector(panelId);
  if (!panel) return;
  panel.hidden = false;
  document.body.classList.add('panel-open');
}

export function closeSlidePanel(container, panelId) {
  const panel = container.querySelector(panelId);
  if (!panel) return;
  panel.hidden = true;
  if (!document.querySelector('.slide-panel:not([hidden])')) {
    document.body.classList.remove('panel-open');
  }
}

export function bindSlidePanel(container, { panelId, backdropId, closeId, onClose }) {
  container.querySelector(backdropId)?.addEventListener('click', () => {
    closeSlidePanel(container, panelId);
    onClose?.();
  });
  container.querySelector(closeId)?.addEventListener('click', () => {
    closeSlidePanel(container, panelId);
    onClose?.();
  });
}

export function bindEscapeClose(container, panelId) {
  const handler = (e) => {
    if (e.key !== 'Escape') return;
    const panel = container.querySelector(panelId);
    if (panel && !panel.hidden) {
      closeSlidePanel(container, panelId);
    }
  };
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}

export function renderCopyButton(text, label = 'Copy') {
  const encoded = esc(text).replace(/'/g, '&#39;');
  return `<button type="button" class="btn btn-small btn-secondary copy-btn" data-copy="${encoded}">${label}</button>`;
}

export function bindCopyButtons(container) {
  container.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const raw = btn.getAttribute('data-copy')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
      copyText(raw);
    });
  });
}

export function buildClientCtx(client) {
  const brief = client.workspace?.brief || {};
  return {
    name: client.name,
    type: client.businessType || 'business',
    product: client.businessType || 'services',
    audience: brief.audience || 'your target customers',
    offer: brief.goals || client.services?.[0] || 'our services',
    platform: 'instagram',
    platformLabel: 'Instagram',
    tone: 'professional',
    language: 'en'
  };
}

export function slidePanelMarkup(id, title, formHtml) {
  return `
    <div id="${id}" class="slide-panel" hidden>
      <div class="slide-panel-backdrop" id="${id}-backdrop"></div>
      <div class="slide-panel-content">
        <div class="slide-panel-header">
          <h3 id="${id}-title">${title}</h3>
          <button type="button" class="btn-icon" id="${id}-close" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        ${formHtml}
      </div>
    </div>
  `;
}
