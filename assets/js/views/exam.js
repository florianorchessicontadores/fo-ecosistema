/* =====================================================
   views/exam.js · Evaluación de una fase de la ruta de aprendizaje
   Reúne preguntas de los módulos de la fase y selecciona hasta 8 al azar.
   El resultado se guarda localmente con el id de la fase (fase-1, fase-2…).
   ===================================================== */
import { DB } from '../data.js';
import { icon } from '../icons.js';
import { esc } from '../utils.js';
import { pageHead, crumbs, callout, badge } from '../components.js';
import { quizHtml, mountQuiz } from './quiz.js';
import { phaseQuestions, phasePool, MIN_PREGUNTAS, MAX_PREGUNTAS } from '../academyLogic.js';

export function examView(faseId) {
  const fase = (DB.academy.ruta || []).find((f) => f.id === faseId);
  if (!fase) return null;

  const head = pageHead({
    crumbsHtml: crumbs([{ t: 'Inicio', href: '#/' }, { t: 'FO Academy', href: '#/academy' }, { t: `Evaluación · ${fase.fase}` }]),
    eyebrow: 'FO Academy · Evaluación de fase',
    title: fase.fase,
    lead: fase.descripcion,
  });

  const disponibles = phasePool(fase).length;
  if (disponibles < MIN_PREGUNTAS) {
    return {
      title: `Evaluación · ${fase.fase}`,
      html: `${head}${callout(`Esta evaluación aún no está disponible: se requieren al menos ${MIN_PREGUNTAS} preguntas en los módulos de la fase y hoy hay ${disponibles}. Se habilitará al desarrollar más módulos.`, 'warn')}
        <a class="btn btn-outline" href="#/academy">${icon('back', 16)} Volver a FO Academy</a>`,
    };
  }

  const preguntas = phaseQuestions(fase);
  const pseudo = { id: fase.id, evaluacion: preguntas };
  const min = Math.round(DB.site.aprobacion_minima * 100);
  const nota = `Se seleccionaron ${preguntas.length} pregunta${preguntas.length === 1 ? '' : 's'} al azar (máximo ${MAX_PREGUNTAS}) de los módulos de la fase. Puntaje mínimo de referencia: ${min}%. Cada intento puede traer preguntas distintas.`;

  return {
    title: `Evaluación · ${fase.fase}`,
    html: `${head}
      ${callout('Es una autoevaluación de capacitación: no es un examen oficial ni certifica conocimientos. Se guarda solo en este navegador.')}
      <section class="doc-sec"><h2>Evaluación de la fase</h2>${quizHtml(pseudo, { nota })}
        <div class="btn-row"><button class="btn btn-outline btn-sm" type="button" id="btn-nuevo">${icon('refresh', 14)} Nuevo intento con otras preguntas</button></div></section>
      <div class="pager"><a class="btn btn-outline" href="#/academy">${icon('back', 16)} Volver a FO Academy</a></div>`,
    mount(root) {
      mountQuiz(root, pseudo);
      root.querySelector('#btn-nuevo').addEventListener('click', () => {
        // Vuelve a dibujar la misma ruta con una nueva selección de preguntas.
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
    },
  };
}
