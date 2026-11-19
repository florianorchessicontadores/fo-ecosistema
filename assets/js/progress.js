/* =====================================================
   progress.js · Progreso de capacitación (solo local)

   IMPORTANTE: el progreso se guarda únicamente en el navegador de
   cada persona (localStorage). NO es un sistema de usuarios, no es
   seguro y no constituye un registro oficial de capacitación.
   Un sistema real de seguimiento requiere un backend (etapas futuras).
   ===================================================== */
import { DB } from './data.js';
import { pct } from './utils.js';

const KEY = 'fo.progreso.v1';

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch (e) {
    return {};
  }
}
function write(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    /* Si el navegador bloquea el almacenamiento, la plataforma sigue funcionando sin progreso. */
  }
}

export const Progress = {
  get(id) {
    return read()[id] || {};
  },
  setStudied(id, value) {
    const d = read();
    d[id] = { ...(d[id] || {}), studied: !!value };
    write(d);
  },
  saveQuiz(id, score, total) {
    const d = read();
    d[id] = { ...(d[id] || {}), quiz: { score, total, date: new Date().toISOString().slice(0, 10) } };
    write(d);
  },
  reset() {
    try {
      localStorage.removeItem(KEY);
    } catch (e) {
      /* sin acción */
    }
  },
  hasAny() {
    return Object.keys(read()).length > 0;
  },
  /** Un módulo está completo si fue marcado como estudiado y, si tiene evaluación, se aprobó. */
  isCompleted(item) {
    const st = read()[item.id];
    if (!st || !st.studied) return false;
    if (item.evaluacion && item.evaluacion.length) {
      return !!st.quiz && st.quiz.score / st.quiz.total >= DB.site.aprobacion_minima;
    }
    return true;
  },
  areaSummary(areaId) {
    const all = [...DB.items.values()].filter((i) => i.area === areaId);
    const available = all.filter((i) => i.estado === 'desarrollado');
    const done = available.filter((i) => Progress.isCompleted(i)).length;
    return { total: all.length, disponibles: available.length, completados: done, pct: pct(done, available.length) };
  },
  overall() {
    const parts = DB.site.areas.map((a) => Progress.areaSummary(a.id));
    const disp = parts.reduce((s, p) => s + p.disponibles, 0);
    const done = parts.reduce((s, p) => s + p.completados, 0);
    return { disponibles: disp, completados: done, pct: pct(done, disp) };
  },
};
