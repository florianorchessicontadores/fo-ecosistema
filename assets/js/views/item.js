/* =====================================================
   views/item.js · Detalle de un módulo o tema
   Estructura común a las tres áreas (ver data/*.json):
   objetivo, explicación paso a paso, procedimiento, capturas, ejemplos,
   errores frecuentes, recomendaciones, ejercicios, evaluación y normas.
   ===================================================== */
import { DB } from '../data.js';
import { Progress } from '../progress.js';
import { icon } from '../icons.js';
import { esc, $, $$, list } from '../utils.js';
import { crumbs, pageHead, callout, badge, revisionBadges, normasTable, AVISO_NORMATIVO } from '../components.js';
import { quizHtml, mountQuiz } from './quiz.js';

/** Secciones en el orden solicitado para cada módulo. */
const SECCIONES = [
  ['objetivo', 'Objetivo de aprendizaje'],
  ['explicacion', 'Explicación paso a paso'],
  ['procedimiento', 'Procedimiento de trabajo'],
  ['capturas', 'Capturas de pantalla'],
  ['ejemplos', 'Ejemplos prácticos'],
  ['errores', 'Errores frecuentes'],
  ['recomendaciones', 'Recomendaciones profesionales'],
  ['ejercicios', 'Ejercicios'],
  ['evaluacion', 'Evaluación de conocimientos'],
  ['normas', 'Referencias normativas'],
];

const pending = '<p class="placeholder">Pendiente de incorporar.</p>';

function sectionBody(key, it) {
  switch (key) {
    case 'objetivo':
      return it.objetivo ? `<p>${esc(it.objetivo)}</p>` : pending;
    case 'explicacion':
      return (it.explicacion || []).length
        ? it.explicacion
            .map((e, i) => `<div class="step"><span class="step-n">${i + 1}</span><div><h4>${esc(e.titulo)}</h4><p>${esc(e.texto)}</p></div></div>`)
            .join('')
        : pending;
    case 'procedimiento':
      return (it.procedimiento || []).length ? list(it.procedimiento, true) : pending;
    case 'capturas':
      return (it.capturas || []).length
        ? it.capturas
            .map((c) => `<figure><img loading="lazy" src="${esc(c.archivo)}" alt="${esc(c.descripcion)}"><figcaption>${esc(c.descripcion)}</figcaption></figure>`)
            .join('')
        : `<div class="shot"><div>${icon('image', 28)}<p style="margin:6px 0 0">Espacio reservado para capturas de pantalla.<br>
            <span class="small">Guarde las imágenes en <code>modules/${esc(it.area)}/img/</code> y regístrelas en el campo <code>capturas</code> de este módulo.</span></p></div></div>`;
    case 'ejemplos':
      return (it.ejemplos || []).length
        ? it.ejemplos.map((e) => `<div class="example"><h4>${esc(e.titulo)}</h4><p>${esc(e.descripcion)}</p></div>`).join('')
        : pending;
    case 'errores':
      return (it.errores || []).length ? list(it.errores) : pending;
    case 'recomendaciones':
      return (it.recomendaciones || []).length ? list(it.recomendaciones) : pending;
    case 'ejercicios':
      return (it.ejercicios || []).length
        ? it.ejercicios
            .map((e, i) => `<details class="exercise"><summary>Ejercicio ${i + 1}: ${esc(e.enunciado)}</summary><p><strong>Solución sugerida:</strong> ${esc(e.solucion)}</p></details>`)
            .join('')
        : pending;
    case 'evaluacion':
      return quizHtml(it);
    case 'normas':
      return normasTable(it.normas || []);
    default:
      return pending;
  }
}

export function itemView(areaId, id) {
  const it = DB.items.get(id);
  if (!it || it.area !== areaId) return null; // el router mostrará "no encontrada"
  const meta = DB.areaMeta[areaId];
  const siblings = DB.areaContent[areaId].items;
  const idx = siblings.findIndex((x) => x.id === id);
  const prev = siblings[idx - 1];
  const next = siblings[idx + 1];

  const head = pageHead({
    crumbsHtml: crumbs([{ t: 'Inicio', href: '#/' }, { t: meta.titulo, href: `#/${areaId}` }, { t: `${meta.etiqueta_item} ${it.numero}` }]),
    eyebrow: `${meta.etiqueta_item} ${it.numero} · ${meta.titulo}`,
    title: it.titulo,
    lead: it.resumen,
    meta: revisionBadges(it),
  });

  const pager = `<div class="pager">
    ${prev ? `<a class="btn btn-outline" href="${prev.ruta}">${icon('back', 16)} ${esc(prev.titulo)}</a>` : '<span></span>'}
    ${next ? `<a class="btn btn-outline" href="${next.ruta}">${esc(next.titulo)} ${icon('arrow', 16)}</a>` : ''}
  </div>`;

  /* --- Tema pendiente: se muestra la estructura prevista, sin contenido inventado --- */
  if (it.estado !== 'desarrollado') {
    return {
      title: it.titulo,
      html: `${head}
        ${callout('<strong>Tema pendiente de desarrollo.</strong> Esta ficha reserva el lugar del contenido. No se ha incorporado explicación ni cálculo para evitar información legal sin verificar.', 'warn')}
        <div class="doc-sec"><h2>Estructura prevista</h2>
          <p class="muted">Cuando el tema se desarrolle, incluirá las siguientes secciones:</p>
          ${list(SECCIONES.map(([, t]) => t))}
          ${it.nota ? `<p class="small muted">${esc(it.nota)}</p>` : ''}</div>
        <div class="doc-sec"><h2>Referencias normativas identificadas</h2>${normasTable(it.normas || [])}</div>
        ${pager}`,
    };
  }

  /* --- Módulo con contenido inicial --- */
  // Una lección puede declarar "secciones" para mostrar solo algunas (p. ej. inducción sin capturas ni normas).
  const secs = it.secciones ? SECCIONES.filter(([k]) => it.secciones.includes(k)) : SECCIONES;
  const nav = secs.map(([k, t], i) => `<button class="chip" type="button" data-go="sec-${k}">${i + 1}. ${esc(t)}</button>`).join('');
  const body = secs.map(
    ([k, t], i) => `<section class="doc-sec" id="sec-${k}"><h2><span class="sec-num">${i + 1}</span>${esc(t)}</h2>${sectionBody(k, it)}</section>`
  ).join('');

  const html = `${head}
    ${it.sin_normativa ? '' : callout(esc(AVISO_NORMATIVO), 'warn')}
    ${it.nota ? callout(esc(it.nota)) : ''}
    <div class="doc-nav"><div class="chips">${nav}</div></div>
    ${body}
    <div class="card" id="studied-box" style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
      <div><strong>Seguimiento personal</strong><div class="small muted">Se guarda solo en este navegador; no es un registro oficial.</div></div>
      <div id="studied-state"></div>
    </div>
    ${pager}`;

  return {
    title: it.titulo,
    html,
    mount(root) {
      // Navegación interna de la página
      $$('[data-go]', root).forEach((b) =>
        b.addEventListener('click', () => document.getElementById(b.dataset.go)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
      );

      // Botón "marcar como estudiado"
      const box = $('#studied-state', root);
      const paint = () => {
        const studied = !!Progress.get(it.id).studied;
        const done = Progress.isCompleted(it);
        box.innerHTML = `${done ? badge('Módulo completado', 'ok') + ' ' : ''}<button class="btn ${studied ? 'btn-outline' : 'btn-primary'}" type="button" id="btn-studied">
          ${icon('check', 18)} ${studied ? 'Quitar marca de estudiado' : 'Marcar como estudiado'}</button>`;
        $('#btn-studied', root).addEventListener('click', () => {
          Progress.setStudied(it.id, !studied);
          paint();
        });
      };
      paint();

      mountQuiz(root, it, paint);
    },
  };
}
