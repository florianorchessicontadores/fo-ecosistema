/* =====================================================
   views/library.js · Biblioteca Profesional (Etapa 4)
   Cada categoría vive en data/biblioteca.json y su carpeta en assets/docs/.
   Un documento se agrega en el arreglo "documentos" de la categoría.
   ===================================================== */
import { DB } from '../data.js';
import { icon } from '../icons.js';
import { esc } from '../utils.js';
import { pageHead, sectionHead, badge, callout, empty } from '../components.js';

const EJEMPLO = `{
  "titulo": "Checklist de cierre mensual",
  "descripcion": "Lista de verificación para el cierre contable.",
  "archivo": "assets/docs/checklists/checklist-cierre-mensual.pdf",
  "tipo": "PDF",
  "fecha": "2026-12-01"
}`;

export function libraryView() {
  const cats = (DB.biblioteca.categorias || [])
    .map((c) => {
      const docs = c.documentos || [];
      const body = docs.length
        ? docs
            .map(
              (d) => `<a class="row-item" href="${esc(d.archivo)}" target="_blank" rel="noopener">
                <span class="row-num">${icon('file', 16)}</span>
                <span class="row-body"><span class="row-title">${esc(d.titulo)}</span><br><span class="row-sub">${esc(d.tipo || '')} ${d.fecha ? '· ' + esc(d.fecha) : ''}</span></span>
              </a>`
            )
            .join('')
        : `<p class="placeholder">Sin documentos todavía. Carpeta reservada: <code>${esc(c.carpeta)}</code></p>`;
      return `<div class="card">
        <div class="card-ico">${icon(c.icono || 'file', 22)}</div>
        <h3>${esc(c.titulo)}</h3>
        <p class="muted small">${esc(c.descripcion)}</p>
        <div style="margin-bottom:8px">${badge(`${docs.length} documento${docs.length === 1 ? '' : 's'}`, docs.length ? 'gold' : 'muted')}</div>
        ${body}
      </div>`;
    })
    .join('');

  return {
    title: 'Biblioteca Profesional',
    html: `${pageHead({
      eyebrow: 'Consulta',
      title: 'Biblioteca Profesional',
      lead: DB.biblioteca.descripcion,
      meta: badge('Etapa 4 · estructura preparada', 'gold'),
    })}
    ${callout('La biblioteca solo debe contener <strong>material no confidencial</strong>: sin datos de clientes, RUC reales, claves SOL, comprobantes ni XML reales. Todo lo que se publique en GitHub Pages es público.', 'danger')}
    <section class="section">${sectionHead('Categorías')}<div class="grid grid-auto">${cats}</div></section>
    <section class="section">${sectionHead('Cómo incorporar un documento')}
      <div class="card">
        <ol class="list">
          <li>Copie el archivo PDF o la imagen en la carpeta de su categoría dentro de <code>assets/docs/</code>.</li>
          <li>Abra <code>data/biblioteca.json</code> y agregue un bloque como el siguiente dentro de <code>"documentos"</code> de la categoría:</li>
        </ol>
        <pre>${esc(EJEMPLO)}</pre>
        <p class="small muted" style="margin:0">Si hay más de un documento en la categoría, sepárelos con comas. La ruta de <code>archivo</code> debe coincidir exactamente con el nombre del archivo.</p>
      </div></section>`,
  };
}
