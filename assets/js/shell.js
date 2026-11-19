/* =====================================================
   shell.js · Menú lateral, barra superior, pie de página
   ===================================================== */
import { DB } from './data.js';
import { icon } from './icons.js';
import { esc, $, $$, fmtDate } from './utils.js';

const COLLAPSE_KEY = 'fo.menu.contraido';
const isMobile = () => window.matchMedia('(max-width: 1024px)').matches;

/** Comportamientos que no dependen de los datos (se activan de inmediato). */
export function initShell({ onSearch }) {
  $('#btn-menu').innerHTML = icon('panel', 20);
  $('#search-ico').innerHTML = icon('search', 18);

  try {
    if (localStorage.getItem(COLLAPSE_KEY) === '1') document.body.classList.add('sidebar-collapsed');
  } catch (e) { /* sin acción */ }

  $('#btn-menu').addEventListener('click', () => {
    if (isMobile()) {
      document.body.classList.toggle('sidebar-open');
    } else {
      const collapsed = document.body.classList.toggle('sidebar-collapsed');
      try { localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0'); } catch (e) { /* sin acción */ }
    }
  });
  $('#scrim').addEventListener('click', () => document.body.classList.remove('sidebar-open'));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.body.classList.remove('sidebar-open');
    const typing = /^(input|textarea|select)$/i.test(document.activeElement?.tagName || '');
    if (e.key === '/' && !typing) {
      e.preventDefault();
      $('#search-input').focus();
    }
  });

  // Buscador general: al escribir lleva a la página de resultados.
  const input = $('#search-input');
  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => onSearch(input.value.trim()), 180);
  });
  $('#search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    clearTimeout(timer);
    onSearch(input.value.trim());
  });
}

/** Construye el menú lateral a partir de data/site.json. */
export function renderNav() {
  let lastGroup = null;
  const html = DB.site.menu
    .map((m) => {
      let label = '';
      if (m.grupo && m.grupo !== lastGroup) {
        label = `<div class="nav-group-label">${esc(m.grupo)}</div>`;
        lastGroup = m.grupo;
      }
      return `${label}<a class="nav-link" href="${m.ruta}" data-id="${esc(m.id)}" data-path="${esc(m.ruta.replace('#', ''))}" title="${esc(m.titulo)}">
        ${icon(m.icono, 20)}<span class="nav-label">${esc(m.titulo)}</span></a>`;
    })
    .join('');
  $('#nav').innerHTML = html;
  $('#nav').addEventListener('click', () => document.body.classList.remove('sidebar-open'));
  $('#sidebar-foot').innerHTML = `${esc(DB.site.version)}<br>Contenido de capacitación · no confidencial`;
}

export function setActiveNav(path) {
  $$('.nav-link').forEach((a) => {
    const p = a.dataset.path;
    const active = p === '/' ? path === '/' : path === p || path.startsWith(p + '/');
    a.classList.toggle('active', active);
    if (active) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

export function renderFooter() {
  const s = DB.site;
  $('#footer').innerHTML = `
    <div><strong>${esc(s.institucion)}</strong> · ${esc(s.plataforma)}</div>
    <div>Información referencial: verifique siempre la normativa en fuentes oficiales · ${esc(s.version)} · ${esc(fmtDate(s.fecha_version))}</div>`;
}

/** Si site.json define un logotipo, reemplaza el espacio reservado. */
export function applyLogo() {
  const logo = DB.site.logo;
  if (!logo) return;
  const slot = $('#logo-slot');
  const img = new Image();
  img.alt = DB.site.institucion;
  img.onload = () => { slot.innerHTML = ''; slot.style.borderStyle = 'solid'; slot.appendChild(img); };
  img.src = logo; // si el archivo no existe, se mantiene el espacio reservado
}
