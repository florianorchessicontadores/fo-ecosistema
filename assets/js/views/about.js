/* =====================================================
   views/about.js · Acerca de FO
   ===================================================== */
import { DB } from '../data.js';
import { esc } from '../utils.js';
import { icon } from '../icons.js';
import { pageHead, sectionHead, callout, badge, list } from '../components.js';

const ESTADO_ETAPA = {
  completada: ['Completada', 'ok'],
  preparada: ['Estructura preparada', 'gold'],
  pendiente: ['Pendiente', 'muted'],
};

export function aboutView() {
  const a = DB.site.acerca;
  const etapas = DB.site.etapas
    .map((e) => {
      const [t, c] = ESTADO_ETAPA[e.estado] || ESTADO_ETAPA.pendiente;
      return `<div class="row-item"><span class="row-num">${e.numero}</span>
        <span class="row-body"><span class="row-title">${esc(e.titulo)}</span><br><span class="row-sub">${esc(e.descripcion)}</span></span>${badge(t, c)}</div>`;
    })
    .join('');

  return {
    title: 'Acerca de FO',
    html: `${pageHead({ eyebrow: DB.site.institucion, title: 'Acerca de FO', lead: a.resumen })}
    <section class="section"><div class="grid grid-2">
      <div class="card"><h3>Propósito de la plataforma</h3>${list(a.proposito)}</div>
      <div class="card"><h3>Principios de contenido</h3>${list(a.principios)}</div>
    </div></section>
    <section class="section">${sectionHead('Seguridad y privacidad')}
      ${callout(a.seguridad.map((t) => `<p>${esc(t)}</p>`).join(''), 'danger')}</section>
    <section class="section">${sectionHead('Identidad visual')}
      <div class="card"><p>${esc(a.logotipo)}</p>
      <div class="chips"><span class="chip" style="border-color:var(--navy-800)">Azul marino</span><span class="chip" style="border-color:var(--gold-500)">Dorado</span><span class="chip">Grises suaves</span></div></div></section>
    <section class="section">${sectionHead('Hoja de ruta de desarrollo')}<div class="card">${etapas}</div></section>
    <section class="section">${sectionHead('Versión')}
      <p class="muted">${esc(DB.site.plataforma)} · ${esc(DB.site.version)}</p></section>`,
  };
}
