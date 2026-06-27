/* =============================================
   AgencyOS — Entry Point
   ============================================= */

import Router from './router.js';
import Store from './store.js';
import renderDashboard from './pages/dashboard.js';
import renderClients from './pages/clients.js';
import renderClientForm from './pages/client-form.js';
import renderClientWorkspace from './pages/client-workspace.js';
import renderTeam from './pages/team.js';
import renderProjects from './pages/projects.js';
import renderProjectForm from './pages/project-form.js';
import renderProjectDetail from './pages/project-detail.js';
import renderGenerator from './pages/generator.js';
import { WORKSPACE_SECTIONS } from './pages/icons.js';

// --- Register Routes ---
Router.register('/', () => Router.navigate('#/dashboard'));
Router.register('/dashboard', renderDashboard);
Router.register('/clients', renderClients);
Router.register('/clients/new', renderClientForm);
Router.register('/clients/:id/edit', renderClientForm);
Router.register('/team', renderTeam);

WORKSPACE_SECTIONS.forEach(s => {
  Router.register(`/clients/:id/${s.id}`, (container, params) =>
    renderClientWorkspace(container, { ...params, section: s.id }));
});

Router.register('/clients/:id', (container, params) => {
  Router.navigate(`#/clients/${params.id}/overview`);
});

Router.register('/projects', renderProjects);
Router.register('/projects/new', renderProjectForm);
Router.register('/projects/:id', renderProjectDetail);
Router.register('/projects/:id/edit', renderProjectForm);
Router.register('/generate', renderGenerator);

// --- Seed Demo Data (only if store is empty) ---
Store.seedDemoData();
Store.seedDemoTeamMembers();

// --- Init ---
Router.init();

const sidebar = document.getElementById('sidebar');
const menuButton = document.getElementById('mobile-menu-btn');

if (sidebar && menuButton) {
  menuButton.addEventListener('click', () => sidebar.classList.toggle('open'));
  sidebar.addEventListener('click', (event) => {
    if (event.target.closest('.nav-item')) sidebar.classList.remove('open');
  });
  window.addEventListener('hashchange', () => sidebar.classList.remove('open'));
}

// --- Toast helper (global) ---
window.showToast = function (message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
};
