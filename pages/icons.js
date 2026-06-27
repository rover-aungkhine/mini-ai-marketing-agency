/* =============================================
   AgencyOS — SVG Icons (Lucide-style)
   ============================================= */

const SVG_ATTRS = 'xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

export const ICONS = {
  dashboard: `<svg ${SVG_ATTRS}><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>`,
  clients: `<svg ${SVG_ATTRS}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  team: `<svg ${SVG_ATTRS}><path d="M18 21a8 8 0 0 0-12 0"/><circle cx="12" cy="8" r="5"/><path d="M20 8v6"/><path d="M23 11h-6"/></svg>`,
  projects: `<svg ${SVG_ATTRS}><path d="M3 7h18"/><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>`,
  overview: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
  brief: `<svg ${SVG_ATTRS}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>`,
  strategy: `<svg ${SVG_ATTRS}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  calendar: `<svg ${SVG_ATTRS}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>`,
  creatives: `<svg ${SVG_ATTRS}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`,
  ads: `<svg ${SVG_ATTRS}><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>`,
  meetings: `<svg ${SVG_ATTRS}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  assets: `<svg ${SVG_ATTRS}><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
  docs: `<svg ${SVG_ATTRS}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
  sparkles: `<svg ${SVG_ATTRS}><path d="m12 3-1.9 5.8L4 12l7.1 3.2L12 21l1.9-5.8L21 12l-7.1-3.2Z"/></svg>`,
  plus: `<svg ${SVG_ATTRS}><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
  chevronLeft: `<svg ${SVG_ATTRS}><path d="m15 18-6-6 6-6"/></svg>`,
  check: `<svg ${SVG_ATTRS}><path d="M20 6 9 17l-5-5"/></svg>`,
  x: `<svg ${SVG_ATTRS}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  alert: `<svg ${SVG_ATTRS}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`
};

export const WORKSPACE_SECTIONS = [
  { id: 'overview', label: 'Overview', icon: 'overview' },
  { id: 'brief', label: 'Brief & Contract', icon: 'brief' },
  { id: 'strategy', label: 'Strategy', icon: 'strategy' },
  { id: 'calendar', label: 'Content Calendar', icon: 'calendar' },
  { id: 'creatives', label: 'Creatives', icon: 'creatives' },
  { id: 'ads', label: 'Ads & Reports', icon: 'ads' },
  { id: 'meetings', label: 'Meetings', icon: 'meetings' },
  { id: 'assets', label: 'Brand Assets', icon: 'assets' },
  { id: 'docs', label: 'Shared Docs', icon: 'docs' }
];

export function icon(name, className = 'icon') {
  return `<span class="${className}">${ICONS[name] || ''}</span>`;
}
