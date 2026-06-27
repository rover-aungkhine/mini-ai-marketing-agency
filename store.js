/* =============================================
   AgencyOS — Data Store (localStorage CRUD)
   ============================================= */

const Store = {
  _getKey(collection) {
    return `agencyos_${collection}`;
  },

  _read(collection) {
    try {
      const raw = localStorage.getItem(this._getKey(collection));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  _write(collection, data) {
    localStorage.setItem(this._getKey(collection), JSON.stringify(data));
  },

  _id() {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  },

  // --- Generic CRUD ---

  getAll(collection) {
    return this._read(collection);
  },

  getById(collection, id) {
    return this._read(collection).find(item => item.id === id) || null;
  },

  create(collection, record) {
    const data = this._read(collection);
    const now = new Date().toISOString();
    const entry = {
      id: this._id(),
      ...record,
      createdAt: now,
      updatedAt: now
    };
    data.push(entry);
    this._write(collection, data);
    return entry;
  },

  update(collection, id, changes) {
    const data = this._read(collection);
    const idx = data.findIndex(item => item.id === id);
    if (idx === -1) return null;
    data[idx] = {
      ...data[idx],
      ...changes,
      id: data[idx].id,
      createdAt: data[idx].createdAt,
      updatedAt: new Date().toISOString()
    };
    this._write(collection, data);
    return data[idx];
  },

  delete(collection, id) {
    const data = this._read(collection).filter(item => item.id !== id);
    this._write(collection, data);
  },

  search(collection, query, fields) {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAll(collection);
    return this._read(collection).filter(item =>
      fields.some(f => {
        const val = item[f];
        return val && String(val).toLowerCase().includes(q);
      })
    );
  },

  filter(collection, predicates) {
    return this._read(collection).filter(item =>
      Object.entries(predicates).every(([key, val]) => {
        if (!val || val === 'all') return true;
        if (Array.isArray(item[key])) return item[key].includes(val);
        return item[key] === val;
      })
    );
  },

  count(collection, predicates) {
    if (!predicates) return this._read(collection).length;
    return this.filter(collection, predicates).length;
  },

  // --- Convenience helpers ---

  getClients() {
    return this.getAll('clients');
  },

  getProjects() {
    return this.getAll('projects');
  },

  getProjectsByClient(clientId) {
    return this.filter('projects', { clientId });
  },

  getClientName(clientId) {
    const client = this.getById('clients', clientId);
    return client ? client.name : 'Unknown Client';
  },

  getRecentActivity(limit = 8) {
    const clients = this.getClients().map(c => ({
      type: 'client',
      id: c.id,
      name: c.name,
      status: c.status,
      updatedAt: c.updatedAt
    }));
    const projects = this.getProjects().map(p => ({
      type: 'project',
      id: p.id,
      name: p.name,
      clientId: p.clientId,
      clientName: this.getClientName(p.clientId),
      status: p.status,
      updatedAt: p.updatedAt
    }));
    return [...clients, ...projects]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, limit);
  },

  // --- Internal Team ---

  getTeamMembers() {
    return this.getAll('teamMembers');
  },

  getActiveTeamMembers() {
    return this.getTeamMembers().filter(m => m.status === 'active' || m.status === 'freelance');
  },

  getTeamMemberName(id) {
    const member = this.getById('teamMembers', id);
    return member ? member.name : '';
  },

  getTeamMemberInitials(id) {
    const name = this.getTeamMemberName(id);
    if (!name) return '';
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  },

  getTeamWorkload() {
    const members = this.getTeamMembers();
    const projects = this.getProjects();
    return members.map(member => {
      const assignedTasks = projects.flatMap(project =>
        (project.tasks || [])
          .filter(task => task.assigneeId === member.id && task.status !== 'done')
          .map(task => ({
            ...task,
            projectId: project.id,
            projectName: project.name,
            clientId: project.clientId,
            clientName: this.getClientName(project.clientId)
          }))
      );
      const estimatedHours = assignedTasks.length * 4;
      const weeklyCapacity = Number(member.weeklyCapacity) || 40;
      const loadPercent = weeklyCapacity === 0 ? 0 : Math.round((estimatedHours / weeklyCapacity) * 100);
      const loadStatus = loadPercent >= 100 ? 'overloaded' : loadPercent >= 75 ? 'busy' : 'available';
      return { member, assignedTasks, estimatedHours, weeklyCapacity, loadPercent, loadStatus };
    });
  },

  seedDemoTeamMembers() {
    if (this.getTeamMembers().length > 0) return;
    [
      {
        name: 'Aye Chan',
        role: 'Account Executive',
        department: 'Client Service',
        email: 'aye@agencyos.local',
        phone: '+95 9 210 0001',
        status: 'active',
        skills: ['Client comms', 'Briefing', 'Timeline control'],
        weeklyCapacity: 40,
        notes: 'Owns client alignment and approvals.'
      },
      {
        name: 'Mya Thiri',
        role: 'Creative Director',
        department: 'Creative',
        email: 'mya@agencyos.local',
        phone: '+95 9 210 0002',
        status: 'active',
        skills: ['Concepting', 'Art direction', 'Brand systems'],
        weeklyCapacity: 36,
        notes: 'Reviews campaign concepts before client approval.'
      },
      {
        name: 'Ko Min',
        role: 'Copywriter',
        department: 'Content',
        email: 'komin@agencyos.local',
        phone: '+95 9 210 0003',
        status: 'active',
        skills: ['Captions', 'Ad copy', 'Burmese copy'],
        weeklyCapacity: 40,
        notes: 'Writes bilingual social content.'
      },
      {
        name: 'Htet Wai',
        role: 'Designer',
        department: 'Design',
        email: 'htet@agencyos.local',
        phone: '+95 9 210 0004',
        status: 'freelance',
        skills: ['Social graphics', 'Carousel', 'Motion basics'],
        weeklyCapacity: 24,
        notes: 'Freelance designer for campaign peaks.'
      },
      {
        name: 'Nandar',
        role: 'Digital Marketer',
        department: 'Performance',
        email: 'nandar@agencyos.local',
        phone: '+95 9 210 0005',
        status: 'active',
        skills: ['Meta Ads', 'Reporting', 'Audience testing'],
        weeklyCapacity: 40,
        notes: 'Runs paid media and weekly performance checks.'
      }
    ].forEach(member => this.create('teamMembers', member));
  },

  // --- Client Workspace ---

  createDefaultWorkspace() {
    return {
      brief: {
        goals: '',
        audience: '',
        deliverables: '',
        budget: '',
        timeline: '',
        contractStatus: 'draft',
        attachments: []
      },
      strategy: {
        positioning: '',
        pillars: [],
        platforms: []
      },
      calendar: [],
      creatives: [],
      campaigns: [],
      meetings: [],
      brandAssets: [],
      sharedDocs: []
    };
  },

  ensureWorkspace(client) {
    if (!client || client.workspace) return client;
    return this.update('clients', client.id, { workspace: this.createDefaultWorkspace() });
  },

  getClientWithWorkspace(clientId) {
    const client = this.getById('clients', clientId);
    if (!client) return null;
    return this.ensureWorkspace(client);
  },

  updateWorkspace(clientId, changes) {
    const client = this.getClientWithWorkspace(clientId);
    if (!client) return null;
    const workspace = { ...client.workspace, ...changes };
    return this.update('clients', clientId, { workspace });
  },

  updateWorkspaceSection(clientId, section, data) {
    const client = this.getClientWithWorkspace(clientId);
    if (!client) return null;
    const workspace = {
      ...client.workspace,
      [section]: { ...client.workspace[section], ...data }
    };
    return this.update('clients', clientId, { workspace });
  },

  addCalendarItem(clientId, item) {
    const client = this.getClientWithWorkspace(clientId);
    if (!client) return null;
    const now = new Date().toISOString();
    const entry = {
      id: this._id(),
      title: '',
      platform: 'instagram',
      scheduledDate: '',
      status: 'draft',
      caption: '',
      notes: '',
      ...item,
      createdAt: now,
      updatedAt: now
    };
    const calendar = [...client.workspace.calendar, entry];
    this.update('clients', clientId, { workspace: { ...client.workspace, calendar } });
    return entry;
  },

  updateCalendarItem(clientId, itemId, changes) {
    const client = this.getClientWithWorkspace(clientId);
    if (!client) return null;
    const calendar = client.workspace.calendar.map(item =>
      item.id === itemId
        ? { ...item, ...changes, id: item.id, createdAt: item.createdAt, updatedAt: new Date().toISOString() }
        : item
    );
    this.update('clients', clientId, { workspace: { ...client.workspace, calendar } });
    return calendar.find(i => i.id === itemId) || null;
  },

  deleteCalendarItem(clientId, itemId) {
    const client = this.getClientWithWorkspace(clientId);
    if (!client) return;
    const calendar = client.workspace.calendar.filter(i => i.id !== itemId);
    this.update('clients', clientId, { workspace: { ...client.workspace, calendar } });
  },

  addMeeting(clientId, meeting) {
    const client = this.getClientWithWorkspace(clientId);
    if (!client) return null;
    const now = new Date().toISOString();
    const entry = {
      id: this._id(),
      title: '',
      date: new Date().toISOString().slice(0, 10),
      duration: 30,
      notes: '',
      summary: '',
      followUpDraft: '',
      actionItems: [],
      ...meeting,
      createdAt: now,
      updatedAt: now
    };
    const meetings = [...client.workspace.meetings, entry];
    this.update('clients', clientId, { workspace: { ...client.workspace, meetings } });
    return entry;
  },

  updateMeeting(clientId, meetingId, changes) {
    const client = this.getClientWithWorkspace(clientId);
    if (!client) return null;
    const meetings = client.workspace.meetings.map(m =>
      m.id === meetingId
        ? { ...m, ...changes, id: m.id, createdAt: m.createdAt, updatedAt: new Date().toISOString() }
        : m
    );
    this.update('clients', clientId, { workspace: { ...client.workspace, meetings } });
    return meetings.find(m => m.id === meetingId) || null;
  },

  deleteMeeting(clientId, meetingId) {
    const client = this.getClientWithWorkspace(clientId);
    if (!client) return;
    const meetings = client.workspace.meetings.filter(m => m.id !== meetingId);
    this.update('clients', clientId, { workspace: { ...client.workspace, meetings } });
  },

  _addWorkspaceListItem(clientId, listKey, defaults, item) {
    const client = this.getClientWithWorkspace(clientId);
    if (!client) return null;
    const now = new Date().toISOString();
    const entry = { id: this._id(), ...defaults, ...item, createdAt: now, updatedAt: now };
    const list = [...(client.workspace[listKey] || []), entry];
    this.update('clients', clientId, { workspace: { ...client.workspace, [listKey]: list } });
    return entry;
  },

  _updateWorkspaceListItem(clientId, listKey, itemId, changes) {
    const client = this.getClientWithWorkspace(clientId);
    if (!client) return null;
    const list = (client.workspace[listKey] || []).map(item =>
      item.id === itemId
        ? { ...item, ...changes, id: item.id, createdAt: item.createdAt, updatedAt: new Date().toISOString() }
        : item
    );
    this.update('clients', clientId, { workspace: { ...client.workspace, [listKey]: list } });
    return list.find(i => i.id === itemId) || null;
  },

  _deleteWorkspaceListItem(clientId, listKey, itemId) {
    const client = this.getClientWithWorkspace(clientId);
    if (!client) return;
    const list = (client.workspace[listKey] || []).filter(i => i.id !== itemId);
    this.update('clients', clientId, { workspace: { ...client.workspace, [listKey]: list } });
  },

  addCreative(clientId, item) {
    return this._addWorkspaceListItem(clientId, 'creatives', {
      title: '', format: 'image', status: 'draft', brief: '', notes: '', linkedPostId: ''
    }, item);
  },

  updateCreative(clientId, itemId, changes) {
    return this._updateWorkspaceListItem(clientId, 'creatives', itemId, changes);
  },

  deleteCreative(clientId, itemId) {
    this._deleteWorkspaceListItem(clientId, 'creatives', itemId);
  },

  addCampaign(clientId, item) {
    return this._addWorkspaceListItem(clientId, 'campaigns', {
      name: '', platform: 'facebook', budget: '', startDate: '', endDate: '',
      status: 'draft', impressions: 0, clicks: 0, spend: 0, reportSummary: '', notes: ''
    }, item);
  },

  updateCampaign(clientId, itemId, changes) {
    return this._updateWorkspaceListItem(clientId, 'campaigns', itemId, changes);
  },

  deleteCampaign(clientId, itemId) {
    this._deleteWorkspaceListItem(clientId, 'campaigns', itemId);
  },

  addBrandAsset(clientId, item) {
    return this._addWorkspaceListItem(clientId, 'brandAssets', {
      name: '', type: 'logo', value: '', usage: '', notes: ''
    }, item);
  },

  updateBrandAsset(clientId, itemId, changes) {
    return this._updateWorkspaceListItem(clientId, 'brandAssets', itemId, changes);
  },

  deleteBrandAsset(clientId, itemId) {
    this._deleteWorkspaceListItem(clientId, 'brandAssets', itemId);
  },

  addSharedDoc(clientId, item) {
    return this._addWorkspaceListItem(clientId, 'sharedDocs', {
      title: '', type: 'proposal', url: '', sharedWithClient: false, notes: ''
    }, item);
  },

  updateSharedDoc(clientId, itemId, changes) {
    return this._updateWorkspaceListItem(clientId, 'sharedDocs', itemId, changes);
  },

  deleteSharedDoc(clientId, itemId) {
    this._deleteWorkspaceListItem(clientId, 'sharedDocs', itemId);
  },

  exportWorkspaceSummary(clientId) {
    const client = this.getClientWithWorkspace(clientId);
    if (!client) return '';
    const ws = client.workspace;
    const lines = [
      `# ${client.name} — Workspace Summary`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      '## Brief',
      ws.brief.goals || '(not set)',
      '',
      '## Strategy',
      ws.strategy.positioning || '(not set)',
      '',
      `## Content Calendar (${ws.calendar.length} posts)`,
      ...ws.calendar.map(p => `- ${p.scheduledDate || 'TBD'} | ${p.title || 'Untitled'} | ${p.status}`),
      '',
      `## Creatives (${ws.creatives.length})`,
      ...ws.creatives.map(c => `- ${c.title || 'Untitled'} | ${c.format} | ${c.status}`),
      '',
      `## Campaigns (${ws.campaigns.length})`,
      ...ws.campaigns.map(c => `- ${c.name || 'Untitled'} | ${c.platform} | spend: ${c.spend}`),
      '',
      `## Meetings (${ws.meetings.length})`,
      ...ws.meetings.map(m => `- ${m.date} | ${m.title || 'Untitled'}`)
    ];
    return lines.join('\n');
  },

  getWorkspaceProgress(client) {
    const ws = client.workspace || this.createDefaultWorkspace();
    const hasText = (obj, keys) => keys.some(k => obj[k] && String(obj[k]).trim());
    return {
      brief: hasText(ws.brief, ['goals', 'audience', 'deliverables']) || ws.brief.contractStatus !== 'draft',
      strategy: !!(ws.strategy.positioning || (ws.strategy.pillars && ws.strategy.pillars.length)),
      calendar: ws.calendar.length > 0,
      creatives: ws.creatives.length > 0,
      ads: ws.campaigns.length > 0,
      meetings: ws.meetings.length > 0,
      assets: ws.brandAssets.length > 0,
      docs: ws.sharedDocs.length > 0
    };
  },

  getClientActionQueue(clientId) {
    const client = this.getClientWithWorkspace(clientId);
    if (!client) return [];
    const ws = client.workspace;
    const actions = [];

    if (ws.brief.contractStatus === 'draft' && !ws.brief.goals) {
      actions.push({
        type: 'brief',
        label: 'Complete client brief',
        href: `#/clients/${clientId}/brief`,
        priority: 'high'
      });
    } else if (ws.brief.contractStatus === 'sent') {
      actions.push({
        type: 'contract',
        label: 'Contract awaiting signature',
        href: `#/clients/${clientId}/brief`,
        priority: 'medium'
      });
    }

    ws.calendar
      .filter(p => p.status === 'pending-client' || p.status === 'draft')
      .forEach(p => {
        actions.push({
          type: 'calendar',
          label: p.status === 'draft' ? `Finish draft: ${p.title || 'Untitled post'}` : `Approve: ${p.title || 'Untitled post'}`,
          href: `#/clients/${clientId}/calendar?post=${p.id}`,
          priority: p.status === 'pending-client' ? 'high' : 'medium'
        });
      });

    const today = new Date().toISOString().slice(0, 10);
    ws.calendar
      .filter(p => p.scheduledDate && p.scheduledDate < today && p.status !== 'published')
      .forEach(p => {
        actions.push({
          type: 'overdue',
          label: `Overdue post: ${p.title || 'Untitled'}`,
          href: `#/clients/${clientId}/calendar?post=${p.id}`,
          priority: 'high'
        });
      });

    (ws.creatives || [])
      .filter(c => c.status === 'pending-client' || c.status === 'draft')
      .forEach(c => {
        actions.push({
          type: 'creative',
          label: c.status === 'draft' ? `Creative draft: ${c.title || 'Untitled'}` : `Approve creative: ${c.title || 'Untitled'}`,
          href: `#/clients/${clientId}/creatives?item=${c.id}`,
          priority: c.status === 'pending-client' ? 'high' : 'medium'
        });
      });

    (ws.campaigns || [])
      .filter(c => c.status === 'active' && !c.reportSummary)
      .forEach(c => {
        actions.push({
          type: 'campaign',
          label: `Add report for: ${c.name || 'Untitled campaign'}`,
          href: `#/clients/${clientId}/ads?item=${c.id}`,
          priority: 'medium'
        });
      });

    return actions.slice(0, 10);
  },

  getAgencyActionQueue() {
    const clients = this.getClients().filter(c => c.status === 'active' || c.status === 'lead');
    const all = [];
    clients.forEach(c => {
      this.getClientActionQueue(c.id).forEach(a => {
        all.push({ ...a, clientId: c.id, clientName: c.name });
      });
    });
    const order = { high: 0, medium: 1, low: 2 };
    return all.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 10);
  },

  // --- Demo Seed ---

  // --- Demo Seed ---

  seedDemoData() {
    if (this.getClients().length > 0 || this.getProjects().length > 0) return;

    // --- Clients ---
    const c1 = this.create('clients', {
      name: 'Golden Bites Bakery',
      email: 'hello@goldenbites.com',
      phone: '+95 9 123 4567',
      company: 'Golden Bites Bakery',
      industry: 'Food & Beverage',
      status: 'active',
      notes: 'Local bakery chain with 5 locations. Wants to grow Instagram presence.',
      workspace: this.createDefaultWorkspace()
    });

    const c2 = this.create('clients', {
      name: 'Skyline Tech',
      email: 'info@skylinetech.io',
      phone: '+95 9 987 6543',
      company: 'Skyline Tech Co., Ltd',
      industry: 'Technology',
      status: 'active',
      notes: 'SaaS startup launching a project management tool.',
      workspace: this.createDefaultWorkspace()
    });

    const c3 = this.create('clients', {
      name: 'Lotus Wellness',
      email: 'care@lotuswellness.mm',
      phone: '+95 9 555 1234',
      company: 'Lotus Wellness Center',
      industry: 'Health & Wellness',
      status: 'lead',
      notes: 'New yoga and meditation studio opening next month.',
      workspace: this.createDefaultWorkspace()
    });

    // --- Projects ---
    this.create('projects', {
      name: 'Instagram Launch Campaign',
      clientId: c1.id,
      type: 'social-media',
      product: 'Artisan pastries and coffee',
      audience: 'Young professionals aged 22-35 in Yangon',
      offer: 'Buy 1 Get 1 free on first visit',
      platform: 'instagram',
      platformLabel: 'Instagram',
      tone: 'friendly',
      language: 'en',
      status: 'active',
      generatedContent: null
    });

    this.create('projects', {
      name: 'Product Launch Teaser',
      clientId: c2.id,
      type: 'social-media',
      product: 'SkyFlow — project management SaaS',
      audience: 'Startup founders and team leads',
      offer: 'Early bird 40% off annual plan',
      platform: 'linkedin',
      platformLabel: 'LinkedIn',
      tone: 'professional',
      language: 'en',
      status: 'active',
      generatedContent: null
    });

    this.create('projects', {
      name: 'Grand Opening Promo',
      clientId: c3.id,
      type: 'social-media',
      product: 'Yoga classes and wellness packages',
      audience: 'Health-conscious adults 25-45',
      offer: 'Free trial class for first 50 signups',
      platform: 'facebook',
      platformLabel: 'Facebook',
      tone: 'inspiring',
      language: 'en',
      status: 'planning',
      generatedContent: null
    });

    // --- Workspace: Golden Bites Bakery (c1) ---

    // Brief
    this.updateWorkspaceSection(c1.id, 'brief', {
      goals: 'Increase brand awareness across Yangon. Grow Instagram to 10K followers in 3 months. Drive foot traffic to all 5 locations.',
      audience: 'Young professionals aged 22-35, food lovers, Instagram-savvy, urban Yangon residents.',
      deliverables: '12 Instagram posts/month, 4 Stories/week, 1 influencer collaboration/month, monthly performance report.',
      budget: '$1,500/month',
      timeline: '3-month engagement starting July 2026',
      contractStatus: 'signed'
    });

    // Strategy
    this.updateWorkspaceSection(c1.id, 'strategy', {
      positioning: 'Golden Bites is Yangon\'s favorite artisan bakery — where tradition meets modern flavor. Every bite tells a story.',
      pillars: ['Product Showcase', 'Behind the Scenes', 'Customer Stories', 'Seasonal Specials'],
      platforms: ['instagram', 'facebook']
    });

    // Calendar
    const calItems = [
      { title: 'New Croissant Flavor Drop', platform: 'instagram', scheduledDate: '2026-07-01', status: 'approved', caption: 'Introducing our new matcha croissant 🍵🥐 Available at all locations this week!', notes: 'Boost post with $20 ad spend' },
      { title: 'Behind the Scenes: Baker\'s Morning', platform: 'instagram', scheduledDate: '2026-07-03', status: 'draft', caption: 'Ever wondered what 4AM at Golden Bites looks like? 🌅', notes: 'Video reel, 30-60 seconds' },
      { title: 'Customer Feature: Regular Spotlight', platform: 'facebook', scheduledDate: '2026-07-05', status: 'pending-client', caption: 'Meet Daw Su — she\'s been coming to Golden Bites since day one 💛', notes: 'Need client approval on customer quote' },
      { title: 'Weekend Brunch Special', platform: 'instagram', scheduledDate: '2026-07-07', status: 'approved', caption: 'Weekend brunch is calling 🍳🥞 Tag someone you\'d share this with!', notes: '' },
      { title: 'July 4th Themed Post', platform: 'facebook', scheduledDate: '2026-07-04', status: 'published', caption: 'Celebrating with red velvet & blueberry specials 🎆', notes: 'Posted, tracking engagement' }
    ];
    calItems.forEach(item => this.addCalendarItem(c1.id, item));

    // Creatives
    const creatives = [
      { title: 'Matcha Croissant Hero Shot', format: 'image', status: 'approved', brief: 'Close-up product shot, warm lighting, rustic background.', notes: 'Delivered to client' },
      { title: 'Baker\'s Morning Reel', format: 'video', status: 'draft', brief: '30-60s reel of early morning baking process.', notes: 'Waiting for raw footage from client' },
      { title: 'July Specials Carousel', format: 'image', status: 'pending-client', brief: '5-slide carousel featuring July menu items.', notes: 'Client to review by June 28' }
    ];
    creatives.forEach(item => this.addCreative(c1.id, item));

    // Campaigns
    const campaigns = [
      { name: 'July Awareness Boost', platform: 'instagram', budget: '$300', startDate: '2026-07-01', endDate: '2026-07-31', status: 'active', impressions: 12400, clicks: 890, spend: 145, reportSummary: 'Strong CTR at 7.2%. Top performing post: Croissant flavor drop.', notes: '' },
      { name: 'Weekend Traffic Push', platform: 'facebook', budget: '$200', startDate: '2026-07-04', endDate: '2026-07-07', status: 'draft', impressions: 0, clicks: 0, spend: 0, reportSummary: '', notes: 'Start after client approves creative' }
    ];
    campaigns.forEach(item => this.addCampaign(c1.id, item));

    // Meetings
    const meetings = [
      { title: 'Monthly Strategy Review', date: '2026-07-01', duration: 60, notes: 'Review June performance, align on July content themes.', summary: 'Client happy with growth. Approved influencer collaboration budget.', followUpDraft: 'Thanks for the productive session! Attached is the July content calendar for your review.', actionItems: ['Send July calendar draft', 'Research 3 micro-influencers', 'Update brand guidelines with new color palette'] },
      { title: 'Content Approval Call', date: '2026-06-25', duration: 30, notes: 'Walk client through pending creatives.', summary: 'Approved 2 of 3 creatives. Requested changes to carousel colors.', followUpDraft: 'Updated carousel attached with the revised color scheme.', actionItems: ['Revise carousel colors', 'Resend for final sign-off'] }
    ];
    meetings.forEach(item => this.addMeeting(c1.id, item));

    // Brand Assets
    const assets = [
      { name: 'Primary Logo', type: 'logo', value: 'golden-bites-logo-primary.svg', usage: 'Main brand mark — use on all social posts and headers.', notes: '' },
      { name: 'Brand Colors', type: 'color', value: '#D4A853 (gold), #3B2F1E (dark brown), #FFF8F0 (cream)', usage: 'Primary palette for all marketing materials.', notes: '' },
      { name: 'Tagline', type: 'other', value: 'Every Bite Tells a Story', usage: 'Use in captions and ad copy.', notes: 'Client\'s registered trademark' },
      { name: 'Tone of Voice', type: 'other', value: 'Warm, friendly, slightly playful. Never corporate.', usage: 'Guide for all written content.', notes: '' }
    ];
    assets.forEach(item => this.addBrandAsset(c1.id, item));

    // Shared Docs
    const docs = [
      { title: 'Signed Contract — Q3 2026', type: 'contract', url: '#', sharedWithClient: true, notes: '3-month engagement, auto-renewal clause.' },
      { title: 'July Content Calendar', type: 'spreadsheet', url: '#', sharedWithClient: true, notes: 'Google Sheet with all scheduled posts.' },
      { title: 'Brand Guidelines v2', type: 'other', url: '#', sharedWithClient: false, notes: 'Internal reference for tone and visual style.' }
    ];
    docs.forEach(item => this.addSharedDoc(c1.id, item));

    // --- Workspace: Skyline Tech (c2) ---

    this.updateWorkspaceSection(c2.id, 'brief', {
      goals: 'Generate 500 signups for beta launch. Position SkyFlow as the go-to PM tool for Southeast Asian startups.',
      audience: 'Startup founders, CTOs, and team leads in SEA. Tech-savvy, value efficiency.',
      deliverables: '8 LinkedIn posts/month, 2 blog articles, launch email sequence, landing page copy.',
      budget: '$2,000/month',
      timeline: 'Pre-launch: July 2026. Launch: August 1, 2026.',
      contractStatus: 'signed'
    });

    this.updateWorkspaceSection(c2.id, 'strategy', {
      positioning: 'SkyFlow — the project management tool built for fast-moving teams. Simple, powerful, no bloat.',
      pillars: ['Product Updates', 'Founder Stories', 'Productivity Tips', 'Launch Hype'],
      platforms: ['linkedin', 'twitter']
    });

    [
      { title: 'Beta Launch Announcement', platform: 'linkedin', scheduledDate: '2026-07-15', status: 'draft', caption: 'After 6 months of building, SkyFlow beta is live 🚀', notes: 'Coordinate with Product Hunt listing' },
      { title: 'Founder Story: Why We Built SkyFlow', platform: 'linkedin', scheduledDate: '2026-07-20', status: 'draft', caption: 'We were tired of bloated PM tools. So we built our own.', notes: 'Long-form post, 800-1000 words' }
    ].forEach(item => this.addCalendarItem(c2.id, item));

    [
      { title: 'Launch Banner', format: 'image', status: 'draft', brief: 'Clean, modern banner for LinkedIn. Show product UI mockup.', notes: '' },
      { title: 'Product Demo GIF', format: 'video', status: 'draft', brief: '15s screen recording of key workflow.', notes: 'Need access to staging environment' }
    ].forEach(item => this.addCreative(c2.id, item));

    // --- Workspace: Lotus Wellness (c3) ---

    this.updateWorkspaceSection(c3.id, 'brief', {
      goals: 'Build awareness before grand opening. Fill first month of classes to 80% capacity.',
      audience: 'Health-conscious adults 25-45, expat community, wellness enthusiasts in Yangon.',
      deliverables: '10 Facebook posts/month, event promotion, opening week campaign.',
      budget: '$800/month',
      timeline: 'Pre-opening buzz: July 2026. Grand opening: August 10, 2026.',
      contractStatus: 'sent'
    });

    this.updateWorkspaceSection(c3.id, 'strategy', {
      positioning: 'Lotus Wellness — your sanctuary for mind and body in the heart of Yangon.',
      pillars: ['Class Previews', 'Instructor Spotlights', 'Wellness Tips', 'Community Events'],
      platforms: ['facebook', 'instagram']
    });
  }
};

export default Store;
