/* =============================================
   AgencyOS — Standalone Generator Page
   ============================================= */

import { generate } from '../generator.js';

export default function renderGenerator(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Content Generator</h1>
        <p class="page-subtitle">Generate a marketing package from a business brief</p>
      </div>
    </div>

    <div class="card form-card-wide">
      <form id="gen-form" novalidate>
        <div class="form-grid">
          <div class="field">
            <label for="businessName">Business Name <span class="required">*</span></label>
            <input type="text" id="businessName" placeholder="e.g. Mandalay Tea House" required>
            <span class="error-msg"></span>
          </div>
          <div class="field">
            <label for="businessType">Business Type <span class="required">*</span></label>
            <input type="text" id="businessType" placeholder="e.g. café, boutique, clinic" required>
            <span class="error-msg"></span>
          </div>
          <div class="field">
            <label for="productService">Product / Service <span class="required">*</span></label>
            <input type="text" id="productService" placeholder="e.g. artisan tea blends" required>
            <span class="error-msg"></span>
          </div>
          <div class="field">
            <label for="targetAudience">Target Audience <span class="required">*</span></label>
            <input type="text" id="targetAudience" placeholder="e.g. young professionals 25-40" required>
            <span class="error-msg"></span>
          </div>
          <div class="field">
            <label for="mainOffer">Main Offer <span class="required">*</span></label>
            <input type="text" id="mainOffer" placeholder="e.g. 20% off first order" required>
            <span class="error-msg"></span>
          </div>
          <div class="field">
            <label for="platform">Platform <span class="required">*</span></label>
            <select id="platform" required>
              <option value="">-- Choose --</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
            </select>
            <span class="error-msg"></span>
          </div>
          <div class="field">
            <label for="tone">Tone <span class="required">*</span></label>
            <select id="tone" required>
              <option value="">-- Choose --</option>
              <option value="friendly">Friendly</option>
              <option value="professional">Professional</option>
              <option value="premium">Premium</option>
              <option value="fun">Fun</option>
            </select>
            <span class="error-msg"></span>
          </div>
          <div class="field">
            <label for="language">Language <span class="required">*</span></label>
            <select id="language" required>
              <option value="">-- Choose --</option>
              <option value="en">English</option>
              <option value="my">Burmese (မြန်မာ)</option>
            </select>
            <span class="error-msg"></span>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Generate Marketing Package</button>
          <button type="button" class="btn btn-secondary" id="gen-reset-btn">Reset</button>
        </div>
      </form>
    </div>

    <div id="gen-results" style="display:none; margin-top: 24px;"></div>
  `;

  const form = container.querySelector('#gen-form');
  const resultsDiv = container.querySelector('#gen-results');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors(form);

    if (!validate(form)) {
      showToast('Please fill in all required fields.');
      return;
    }

    const platform = container.querySelector('#platform').value;
    const ctx = {
      name: container.querySelector('#businessName').value.trim(),
      type: container.querySelector('#businessType').value.trim(),
      product: container.querySelector('#productService').value.trim(),
      audience: container.querySelector('#targetAudience').value.trim(),
      offer: container.querySelector('#mainOffer').value.trim(),
      platform,
      platformLabel: platform === 'facebook' ? 'Facebook' : 'Instagram',
      tone: container.querySelector('#tone').value,
      language: container.querySelector('#language').value
    };

    const pkg = generate(ctx);
    renderResults(pkg, ctx, resultsDiv);
    showToast('Marketing package ready!');
  });

  // Reset
  container.querySelector('#gen-reset-btn').addEventListener('click', () => {
    form.reset();
    clearErrors(form);
    resultsDiv.style.display = 'none';
    resultsDiv.innerHTML = '';
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

    const copyAllBtn = e.target.closest('#gen-copy-all');
    if (copyAllBtn) {
      const ids = ['gr-positioning', 'gr-pillars', 'gr-posts', 'gr-captions', 'gr-ads', 'gr-creative'];
      const text = ids.map(id => {
        const el = container.querySelector(`#${id}`);
        return el ? el.innerText : '';
      }).join('\n\n---\n\n');
      navigator.clipboard.writeText(text).then(() => {
        showToast('All sections copied!');
      });
    }
  });
}

function renderResults(pkg, ctx, container) {
  const sections = [
    { id: 'gr-positioning', title: 'Brand Positioning Summary', body: `<p>${pkg.positioning}</p>` },
    { id: 'gr-pillars', title: 'Content Pillars', body: `<ol>${pkg.pillars.map(p => `<li><strong>${p}</strong></li>`).join('')}</ol>` },
    { id: 'gr-posts', title: 'Post Ideas', body: `<ol>${pkg.posts.map((p, i) => `<li><strong>Post ${i+1}:</strong> ${p}</li>`).join('')}</ol>` },
    { id: 'gr-captions', title: 'Captions', body: pkg.captions.map((c, i) => `<p><strong>Caption ${i+1}:</strong><br>${c}</p>`).join('') },
    { id: 'gr-ads', title: 'Ad Copy', body: `<p><span class="mini-badge">${ctx.platformLabel}</span></p>` + pkg.ads.map((a, i) => `<p><strong>Ad ${i+1}:</strong><br>${a}</p>`).join('') },
    { id: 'gr-creative', title: 'Creative Headline', body: `<p><span class="mini-badge">${ctx.platformLabel}</span></p><p><strong>Headline:</strong><br>${pkg.creative}</p>` }
  ];

  container.innerHTML = `
    <div class="card">
      <div class="card-header-row">
        <h3>Your Marketing Package</h3>
        <button class="btn btn-small" id="gen-copy-all">Copy All</button>
      </div>
      ${sections.map(s => `
        <div class="content-section">
          <div class="content-section-header">
            <h4>${s.title}</h4>
            <button class="btn btn-small btn-copy" data-target="${s.id}">Copy</button>
          </div>
          <div class="content-section-body" id="${s.id}">${s.body}</div>
        </div>
      `).join('')}
    </div>
  `;

  container.style.display = 'block';
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function validate(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach(field => {
    const errSpan = field.parentElement.querySelector('.error-msg');
    if (!field.value.trim()) {
      field.classList.add('error');
      if (errSpan) { errSpan.textContent = 'Required'; errSpan.classList.add('visible'); }
      valid = false;
    } else {
      field.classList.remove('error');
      if (errSpan) { errSpan.classList.remove('visible'); }
    }
  });
  return valid;
}

function clearErrors(form) {
  form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  form.querySelectorAll('.error-msg').forEach(el => { el.textContent = ''; el.classList.remove('visible'); });
}
