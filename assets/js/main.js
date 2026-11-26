/* =====================================================
   main.js · Punto de entrada de la plataforma
   1) Carga los JSON  2) Dibuja menú y pie  3) Registra rutas  4) Inicia el router
   ===================================================== */
import { loadAll, DB } from './data.js';
import { initShell, renderNav, renderFooter, setActiveNav, applyLogo } from './shell.js';
import { route, startRouter } from './router.js';
import { esc, $ } from './utils.js';
import { callout } from './components.js';

import { homeView } from './views/home.js';
import { areaView } from './views/area.js';
import { itemView } from './views/item.js';
import { academyView } from './views/academy.js';
import { courseView } from './views/course.js';
import { examView } from './views/exam.js';
import { resultsView } from './views/results.js';
import { toolsView, toolDetailView } from './views/tools.js';
import { libraryView } from './views/library.js';
import { normativaView } from './views/normativa.js';
import { aboutView } from './views/about.js';
import { searchView } from './views/searchView.js';

function notFound(path) {
  return {
    title: 'Página no encontrada',
    html: `<h1>Página no encontrada</h1>
      ${callout(`No existe la ruta <code>${esc(path)}</code>. Use el menú lateral para continuar.`, 'warn')}
      <a class="btn btn-primary" href="#/">Volver al inicio</a>`,
  };
}

function showFatal(err) {
  $('#view').innerHTML = `<div class="page"><h1>No se pudo iniciar la plataforma</h1>
    ${callout(`<strong>${esc(err.message)}</strong><br>Revise que los archivos de la carpeta <code>data/</code> existan y que sean JSON válidos
    (puede usar <code>scripts/validar.mjs</code> si tiene Node.js instalado). Abra la plataforma con Live Server o GitHub Pages, no con doble clic.`, 'danger')}</div>`;
}

async function boot() {
  initShell({
    onSearch: (q) => {
      if (q) location.hash = `#/buscar/${encodeURIComponent(q)}`;
      else if (location.hash.startsWith('#/buscar')) location.hash = '#/';
    },
  });

  try {
    await loadAll();
  } catch (err) {
    showFatal(err);
    return;
  }

  renderNav();
  renderFooter();
  applyLogo();

  const areaIds = DB.site.areas.map((a) => a.id).join('|');
  route(/^\/?$/, () => homeView());
  route(new RegExp(`^/(${areaIds})/?$`), ([a]) => areaView(a));
  route(new RegExp(`^/(${areaIds})/([a-z]\\d{2})/?$`), ([a, id]) => itemView(a, id));
  route(/^\/academy\/?$/, () => academyView());
  route(/^\/academy\/curso\/([\w-]+)\/?$/, ([id]) => courseView(id));
  route(/^\/academy\/evaluacion\/(fase-\d+)\/?$/, ([id]) => examView(id));
  route(/^\/academy\/resultados\/?$/, () => resultsView());
  route(/^\/academy\/(i\d{2})\/?$/, ([id]) => itemView('academy', id));
  route(/^\/tools\/?$/, () => toolsView());
  route(/^\/tools\/([\w-]+)\/?$/, ([id]) => toolDetailView(id));
  route(/^\/biblioteca\/?$/, () => libraryView());
  route(/^\/normativa\/?$/, () => normativaView());
  route(/^\/acerca\/?$/, () => aboutView());
  route(/^\/buscar\/?(.*)$/, ([q]) => searchView(q));

  try {
    await startRouter({ view: $('#view'), notFound, onNavigate: setActiveNav });
  } catch (err) {
    showFatal(err);
  }
}

boot();
