/* =====================================================
   views/normativa.js · Normativa y Actualizaciones
   Catálogo central de normas (data/normativa.json). Los módulos de las
   áreas referencian estas normas por su "id".
   ===================================================== */
import { DB } from '../data.js';
import { esc, $ } from '../utils.js';
import { pageHead, sectionHead, callout, badge, normasTable, empty, list } from '../components.js';
import { icon } from '../icons.js';

export function normativaView() {
  const N = DB.normativa;

  const fuentes = N.fuentes
    .map(
      (f) => `<a class="card card-link" href="${esc(f.url)}" target="_blank" rel="noopener noreferrer">
        <h3 style="font-size:1rem">${esc(f.nombre)} ${icon('external', 14)}</h3>
        <p class="muted small" style="margin:0">${esc(f.descripcion)}</p>
        <p class="small" style="margin:8px 0 0;color:var(--navy-600)">${esc(f.url)}</p></a>`
    )
    .join('');

  const novedades = (N.novedades || []).length
    ? `<div class="card">${N.novedades
        .map((n) => `<div class="row-item"><span class="row-body"><span class="row-title">${esc(n.titulo)}</span><br><span class="row-sub">${esc(n.fecha || '')} · ${esc(n.fuente || '')}</span></span></div>`)
        .join('')}</div>`
    : empty('<strong>Sin novedades registradas.</strong><br>La plataforma no consulta fuentes oficiales de forma automática. Las actualizaciones se registran manualmente tras una revisión humana.', 'normativa');

  const ambitos = ['todos', ...new Set(N.normas.map((n) => n.ambito))];
  const filtros = `<div class="filters">
      <label class="field">Ámbito<select id="f-ambito">${ambitos.map((a) => `<option value="${esc(a)}">${esc(a === 'todos' ? 'Todos' : a[0].toUpperCase() + a.slice(1))}</option>`).join('')}</select></label>
      <label class="field">Estado<select id="f-estado">
        <option value="todos">Todos</option><option value="vigente">Vigente</option><option value="modificada">Modificada</option>
        <option value="derogada">Derogada</option><option value="por_verificar">Por verificar</option></select></label>
      <label class="field">Texto<input id="f-texto" type="search" placeholder="Nombre o número…"></label>
    </div><div id="tabla-normas"></div>`;

  return {
    title: 'Normativa y Actualizaciones',
    html: `${pageHead({
      eyebrow: 'Consulta',
      title: 'Normativa y Actualizaciones',
      lead: N.descripcion,
      meta: badge('Etapa 4 · estructura preparada', 'gold'),
    })}
    ${callout('<strong>Ninguna norma de este catálogo ha sido verificada aún por revisión humana.</strong> Los números de norma son referencias de trabajo; confirme texto, artículos, fechas de publicación y vigencia en la fuente oficial antes de usarlos.', 'warn')}

    <section class="section">${sectionHead('Fuentes oficiales prioritarias')}<div class="grid grid-auto">${fuentes}</div></section>
    <section class="section">${sectionHead('Reglas de contenido normativo')}<div class="card">${list(N.reglas || [])}</div></section>
    <section class="section">${sectionHead('Novedades y actualizaciones')}${novedades}</section>
    <section class="section">${sectionHead('Catálogo de normas referenciadas')}${filtros}</section>
    <section class="section">${sectionHead('Procedimiento de revisión humana')}<div class="card">${list(N.proceso_revision || [], true)}</div></section>`,
    mount(root) {
      const sel = { a: $('#f-ambito', root), e: $('#f-estado', root), t: $('#f-texto', root) };
      const out = $('#tabla-normas', root);
      const draw = () => {
        const txt = sel.t.value.trim().toLowerCase();
        const ids = N.normas
          .filter((n) => (sel.a.value === 'todos' || n.ambito === sel.a.value) && (sel.e.value === 'todos' || n.estado === sel.e.value) &&
            (!txt || `${n.nombre} ${n.descripcion}`.toLowerCase().includes(txt)))
          .map((n) => n.id);
        out.innerHTML = ids.length ? normasTable(ids) : empty('Ninguna norma coincide con los filtros.', 'search');
      };
      [sel.a, sel.e].forEach((el) => el.addEventListener('change', draw));
      sel.t.addEventListener('input', draw);
      draw();
    },
  };
}
