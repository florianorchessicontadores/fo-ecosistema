/* =====================================================
   components.js · Piezas de interfaz reutilizables
   ===================================================== */
import { DB, normalizeRefs } from './data.js';
import { Progress } from './progress.js';
import { esc, fmtDate, safeUrl } from './utils.js';
import { icon } from './icons.js';

// Reexporta "list" para que las vistas importen todo desde components.js
export { list } from './utils.js';

/** Estados posibles de una norma (se editan en data/normativa.json). */
export const ESTADO_NORMA = {
  vigente: { t: 'Vigente', c: 'ok' },
  modificada: { t: 'Modificada', c: 'warn' },
  derogada: { t: 'Derogada', c: 'danger' },
  por_verificar: { t: 'Por verificar', c: 'muted' },
};

export const badge = (text, cls = 'muted') => `<span class="badge badge-${cls}">${esc(text)}</span>`;

export function crumbs(parts) {
  return `<nav class="crumbs" aria-label="Ruta de navegación">${parts
    .map((p, i) => {
      const last = i === parts.length - 1;
      const node = p.href && !last ? `<a href="${p.href}">${esc(p.t)}</a>` : `<span>${esc(p.t)}</span>`;
      return i ? `${icon('chevron', 12)}${node}` : node;
    })
    .join('')}</nav>`;
}

export function pageHead({ eyebrow, title, lead, meta = '', crumbsHtml = '' }) {
  return `<header class="page-head">
    ${crumbsHtml}
    ${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : ''}
    <h1>${esc(title)}</h1>
    ${lead ? `<p class="lead">${esc(lead)}</p>` : ''}
    ${meta ? `<div class="meta">${meta}</div>` : ''}
  </header>`;
}

export function sectionHead(title, linkHtml = '') {
  return `<div class="section-head"><h2>${esc(title)}</h2>${linkHtml}</div>`;
}

export function callout(html, type = 'info') {
  const ico = type === 'warn' ? 'alert' : type === 'ok' ? 'check' : type === 'danger' ? 'alert' : 'info';
  const cls = type === 'info' ? '' : ` callout-${type}`;
  return `<div class="callout${cls}" role="note">${icon(ico, 18)}<div>${html}</div></div>`;
}

export function empty(msg, ico = 'file') {
  return `<div class="empty">${icon(ico, 28)}<p style="margin:0">${msg}</p></div>`;
}

export function progressBar(value, label = '') {
  return `<div>${label ? `<div class="bar-label"><span>${esc(label)}</span><span>${value}%</span></div>` : ''}
    <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}"><i style="width:${value}%"></i></div></div>`;
}

/** Estado de avance de un módulo para mostrar en listas (Academy, cursos). */
export function itemStatus(item) {
  if (item.estado !== 'desarrollado') return { code: 'pendiente', t: 'Pendiente de desarrollo', c: 'muted' };
  const st = Progress.get(item.id);
  if (Progress.isCompleted(item)) return { code: 'completado', t: 'Completado', c: 'ok' };
  if (st.quiz && st.quiz.score / st.quiz.total < DB.site.aprobacion_minima) return { code: 'reforzar', t: 'Por reforzar', c: 'warn' };
  if (st.studied || st.quiz) return { code: 'en_curso', t: 'En curso', c: 'gold' };
  return { code: 'sin_iniciar', t: 'Sin iniciar', c: 'navy' };
}

export const statusBadge = (item) => {
  const s = itemStatus(item);
  return badge(s.t, s.c);
};

/** Línea con fecha de elaboración y estado de revisión de un contenido. */
export function revisionBadges(item) {
  if (item.sin_normativa) {
    // Contenido institucional (inducción): no cita normas, no requiere revisión normativa.
    return `${badge('Contenido institucional', 'gold')}${item.fecha_elaboracion ? badge(`Elaborado: ${fmtDate(item.fecha_elaboracion)}`, 'muted') : ''}`;
  }
  const out = [];
  out.push(item.estado === 'desarrollado' ? badge('Contenido inicial', 'gold') : badge('Pendiente de desarrollo', 'muted'));
  if (item.fecha_elaboracion) out.push(badge(`Elaborado: ${fmtDate(item.fecha_elaboracion)}`, 'muted'));
  out.push(
    item.ultima_revision
      ? badge(`Última revisión: ${fmtDate(item.ultima_revision)}`, 'ok')
      : badge('Revisión normativa pendiente', 'warn')
  );
  return out.join('');
}

/** Fila de módulo para listas (inicio, academy). */
export function itemRow(item) {
  const done = Progress.isCompleted(item);
  const meta = DB.areaMeta[item.area];
  return `<a class="row-item${done ? ' done' : ''}" href="${item.ruta}">
    <span class="row-num">${done ? icon('check', 16) : esc(item.numero)}</span>
    <span class="row-body">
      <span class="row-title">${esc(item.titulo)}</span><br>
      <span class="row-sub">${esc(meta.corto)} · ${item.estado === 'desarrollado' ? 'Contenido inicial' : 'Pendiente de desarrollo'}</span>
    </span>
    ${icon('chevron', 16)}
  </a>`;
}

/** Tabla de referencias normativas. refs = ["id"] o [{id, articulos}] */
export function normasTable(refsRaw) {
  const refs = normalizeRefs(refsRaw);
  if (!refs.length) {
    return `<p class="placeholder">Normas por identificar y verificar en las fuentes oficiales. Consulte la sección «Normativa y Actualizaciones».</p>`;
  }
  const unverified = refs.some((r) => {
    const n = DB.normas.get(r.id);
    return !n || n.estado === 'por_verificar';
  });
  const rows = refs
    .map((r) => {
      const n = DB.normas.get(r.id);
      if (!n) return `<tr><td colspan="7">${badge(`Referencia no encontrada: ${r.id}`, 'danger')}</td></tr>`;
      const e = ESTADO_NORMA[n.estado] || ESTADO_NORMA.por_verificar;
      const none = '<span class="muted">Por verificar</span>';
      return `<tr>
        <td><strong>${esc(n.nombre)}</strong><div class="muted small">${esc(n.descripcion)}</div></td>
        <td>${r.articulos ? esc(r.articulos) : none}</td>
        <td><a href="${safeUrl(n.url)}" target="_blank" rel="noopener noreferrer">${esc(n.fuente)} ${icon('external', 13)}</a></td>
        <td>${badge(e.t, e.c)}</td>
        <td>${n.publicacion ? esc(fmtDate(n.publicacion)) : none}</td>
        <td>${n.vigencia ? esc(fmtDate(n.vigencia)) : none}</td>
        <td>${n.ultima_revision ? esc(fmtDate(n.ultima_revision)) : none}</td>
      </tr>`;
    })
    .join('');
  return `${
    unverified
      ? callout('<strong>Referencia sin verificación humana.</strong> Confirme número, artículos, fechas, modificaciones y vigencia en la fuente oficial antes de aplicar cualquier norma.', 'warn')
      : ''
  }
  <div class="table-wrap"><table class="table">
    <thead><tr><th>Norma</th><th>Artículos aplicables</th><th>Fuente oficial</th><th>Estado</th><th>Publicación</th><th>Vigencia</th><th>Última revisión</th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
}

/** Aviso estándar para contenido normativo. */
export const AVISO_NORMATIVO =
  'Contenido de capacitación con fines referenciales. No reemplaza la consulta de la norma vigente en la fuente oficial. Los cálculos de ejemplo no constituyen obligaciones legales definitivas.';
