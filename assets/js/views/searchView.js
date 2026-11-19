/* =====================================================
   views/searchView.js · Resultados del buscador general
   ===================================================== */
import { search } from '../search.js';
import { esc } from '../utils.js';
import { icon } from '../icons.js';
import { pageHead, badge, empty } from '../components.js';

export function searchView(query) {
  const q = (query || '').trim();
  const input = document.getElementById('search-input');
  if (input && input.value.trim() !== q) input.value = q;

  const results = q ? search(q) : [];
  const body = !q
    ? empty('Escriba en el buscador para encontrar módulos, normas, herramientas y secciones.', 'search')
    : results.length
    ? `<div class="card">${results
        .map(
          (r) => `<a class="row-item" href="${esc(r.ruta)}">
            <span class="row-body"><span class="row-title">${esc(r.titulo)}</span><br><span class="row-sub">${esc((r.resumen || '').slice(0, 160))}</span></span>
            ${badge(r.tipo, 'muted')}${icon('chevron', 16)}</a>`
        )
        .join('')}</div>`
    : empty(`Sin resultados para «${esc(q)}». Pruebe con otras palabras.`, 'search');

  return {
    title: q ? `Búsqueda: ${q}` : 'Búsqueda',
    html: `${pageHead({ eyebrow: 'Buscador general', title: q ? `Resultados para «${q}»` : 'Búsqueda', lead: q ? `${results.length} resultado(s)` : '' })}${body}`,
  };
}
