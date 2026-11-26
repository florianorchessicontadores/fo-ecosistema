/* =====================================================
   academyLogic.js · Reglas de FO Academy
   Cálculos de avance, selección de preguntas para las evaluaciones
   de fase y generación de recomendaciones personalizadas.
   Todo se calcula con los datos de /data y el progreso local del navegador.
   ===================================================== */
import { DB } from './data.js';
import { Progress } from './progress.js';
import { pct } from './utils.js';

export const MIN_PREGUNTAS = 3;   // mínimo para ofrecer una evaluación de fase
export const MAX_PREGUNTAS = 8;   // preguntas por intento

const minScore = () => DB.site.aprobacion_minima;

/** Ids de módulos en el orden de la ruta de aprendizaje. */
export const rutaOrder = () => (DB.academy.ruta || []).flatMap((f) => f.items);

export const cursoItems = (curso) => curso.niveles.flatMap((n) => n.items).map((id) => DB.items.get(id)).filter(Boolean);

/** Avance de un conjunto de módulos (solo cuentan los que ya tienen contenido). */
export function summarize(items) {
  const disponibles = items.filter((i) => i.estado === 'desarrollado');
  const completados = disponibles.filter((i) => Progress.isCompleted(i)).length;
  return { total: items.length, disponibles: disponibles.length, completados, pct: pct(completados, disponibles.length) };
}

/** Primer módulo con contenido que aún no está completo, según el orden de la ruta. */
export function nextModule(items) {
  const order = rutaOrder();
  const rank = (i) => {
    const k = order.indexOf(i.id);
    return k === -1 ? 1000 : k;
  };
  const pool = (items || [...DB.items.values()]).filter((i) => i.estado === 'desarrollado' && !Progress.isCompleted(i));
  return pool.sort((a, b) => rank(a) - rank(b) || a.id.localeCompare(b.id))[0] || null;
}

/* ---------- Evaluaciones de fase ---------- */

/** Preguntas disponibles para una fase (de los módulos con evaluación). */
export function phasePool(fase) {
  const out = [];
  fase.items.forEach((id) => {
    const it = DB.items.get(id);
    if (!it || it.estado !== 'desarrollado') return;
    (it.evaluacion || []).forEach((q) => out.push({ ...q, explicacion: `${q.explicacion || ''} (Módulo: ${it.titulo})`.trim() }));
  });
  return out;
}

export const faseDisponible = (fase) => phasePool(fase).length >= MIN_PREGUNTAS;

/** Selección aleatoria de hasta MAX_PREGUNTAS preguntas. */
export function phaseQuestions(fase) {
  const pool = phasePool(fase);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, MAX_PREGUNTAS);
}

export const faseQuiz = (fase) => Progress.get(fase.id).quiz || null;

/* ---------- Recomendaciones ---------- */

/**
 * Devuelve una lista ordenada de acciones sugeridas:
 * reforzar → evaluar → completar → evaluación de fase → siguiente módulo.
 */
export function recommendations() {
  const out = [];
  const min = minScore();
  const items = [...DB.items.values()].filter((i) => i.estado === 'desarrollado');

  items.forEach((i) => {
    const st = Progress.get(i.id);
    if (st.quiz && st.quiz.score / st.quiz.total < min) {
      out.push({ tipo: 'Reforzar', cls: 'warn', ruta: i.ruta, texto: `Repasar «${i.titulo}» y repetir su evaluación (último resultado: ${st.quiz.score} de ${st.quiz.total}).` });
    }
  });
  items.forEach((i) => {
    const st = Progress.get(i.id);
    if (st.studied && !st.quiz && (i.evaluacion || []).length) {
      out.push({ tipo: 'Evaluar', cls: 'gold', ruta: i.ruta, texto: `Resolver la evaluación de «${i.titulo}».` });
    }
  });
  items.forEach((i) => {
    const st = Progress.get(i.id);
    if (st.quiz && st.quiz.score / st.quiz.total >= min && !st.studied) {
      out.push({ tipo: 'Completar', cls: 'gold', ruta: i.ruta, texto: `Marcar como estudiado «${i.titulo}» para completarlo.` });
    }
  });

  (DB.academy.ruta || []).forEach((f) => {
    if (!faseDisponible(f)) return;
    const disp = f.items.map((id) => DB.items.get(id)).filter((i) => i && i.estado === 'desarrollado');
    const todosCompletos = disp.length > 0 && disp.every((i) => Progress.isCompleted(i));
    const q = faseQuiz(f);
    if (todosCompletos && !q) {
      out.push({ tipo: 'Evaluación de fase', cls: 'gold', ruta: `#/academy/evaluacion/${f.id}`, texto: `Rendir la evaluación de «${f.fase}».` });
    } else if (q && q.score / q.total < min) {
      out.push({ tipo: 'Reforzar', cls: 'warn', ruta: `#/academy/evaluacion/${f.id}`, texto: `Repetir la evaluación de «${f.fase}» (último resultado: ${q.score} de ${q.total}).` });
    }
  });

  const nx = nextModule();
  if (nx) out.push({ tipo: 'Siguiente', cls: 'ok', ruta: nx.ruta, texto: `Estudiar «${nx.titulo}».` });
  return out;
}
