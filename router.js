/* =============================================
   AgencyOS — Hash Router
   ============================================= */

const Router = {
  routes: {},
  currentRoute: null,

  register(path, handler) {
    this.routes[path] = handler;
  },

  navigate(hash) {
    location.hash = hash;
  },

  _match(hash) {
    const cleanHash = hash.replace('#', '') || '/dashboard';
    const path = cleanHash.split('?')[0];

    // Exact match
    if (this.routes[path]) {
      return { handler: this.routes[path], params: {} };
    }

    // Pattern match /clients/:id
    for (const [pattern, handler] of Object.entries(this.routes)) {
      const paramNames = [];
      const regex = pattern.replace(/:([^/]+)/g, (_, name) => {
        paramNames.push(name);
        return '([^/]+)';
      });
      const match = path.match(new RegExp(`^${regex}$`));
      if (match) {
        const params = {};
        paramNames.forEach((name, i) => {
          params[name] = match[i + 1];
        });
        return { handler, params };
      }
    }

    return null;
  },

  async handleRoute() {
    const hash = location.hash || '#/dashboard';
    const result = this._match(hash);

    if (result) {
      this.currentRoute = hash;
      const main = document.getElementById('main-content');
      if (main) {
        main.innerHTML = '';
        await result.handler(main, result.params);
      }
      // Update active nav
      document.querySelectorAll('.nav-item').forEach(item => {
        const href = item.getAttribute('href');
        const cleanHash = hash.split('?')[0];
        if (href && cleanHash.startsWith(href)) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
  },

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  }
};

export default Router;
