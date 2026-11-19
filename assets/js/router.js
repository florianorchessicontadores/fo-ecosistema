/* =====================================================
   router.js · Navegación por hash (#/ruta)
   Funciona en GitHub Pages sin configuración del servidor.
   ===================================================== */

const routes = [];

/** Registra una ruta: route(/^\/contable\/?$/, (params) => ({ title, html, mount })) */
export function route(pattern, handler) {
  routes.push({ pattern, handler });
}

export function currentPath() {
  const raw = location.hash.replace(/^#/, '') || '/';
  return raw.split('?')[0] || '/';
}

export function startRouter({ view, notFound, onNavigate }) {
  async function render() {
    const path = currentPath();
    let result = null;

    for (const r of routes) {
      const m = path.match(r.pattern);
      if (m) {
        const params = m.slice(1).map((p) => {
          try {
            return decodeURIComponent(p);
          } catch (e) {
            return p;
          }
        });
        result = await r.handler(params);
        if (result) break;
      }
    }
    if (!result) result = notFound(path);

    document.title = `${result.title} · FO Ecosistema Digital`;
    view.innerHTML = `<div class="page">${result.html}</div>`;
    if (typeof result.mount === 'function') result.mount(view);

    window.scrollTo(0, 0);
    view.focus({ preventScroll: true });
    onNavigate(path);
  }

  window.addEventListener('hashchange', render);
  return render();
}
