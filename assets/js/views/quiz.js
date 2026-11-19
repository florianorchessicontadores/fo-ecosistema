/* =====================================================
   views/quiz.js · Evaluación de conocimientos (opción múltiple)
   Las preguntas viven en el JSON del módulo, campo "evaluacion":
   { "pregunta": "...", "opciones": ["A","B","C","D"], "correcta": 0, "explicacion": "..." }
   ===================================================== */
import { DB } from '../data.js';
import { Progress } from '../progress.js';
import { esc, fmtDate } from '../utils.js';
import { icon } from '../icons.js';

export function quizHtml(item) {
  const qs = item.evaluacion || [];
  if (!qs.length) return '<p class="placeholder">Evaluación pendiente de incorporar.</p>';

  const last = Progress.get(item.id).quiz;
  const min = Math.round(DB.site.aprobacion_minima * 100);
  const lastHtml = last
    ? `<p class="small muted">Último resultado en este navegador: <strong>${last.score} de ${last.total}</strong> (${esc(fmtDate(last.date))}).</p>`
    : '';

  return `<p class="muted small">Puntaje mínimo para considerar el módulo completado: ${min}%. Es un parámetro interno de capacitación (editable en <code>data/site.json</code>).</p>
  ${lastHtml}
  <form id="quiz-form" novalidate>
    ${qs
      .map(
        (q, i) => `<fieldset class="q" data-i="${i}">
          <legend>${i + 1}. ${esc(q.pregunta)}</legend>
          ${q.opciones.map((o, j) => `<label class="opt" data-j="${j}"><input type="radio" name="q${i}" value="${j}"><span>${esc(o)}</span></label>`).join('')}
          <div class="fb" hidden></div>
        </fieldset>`
      )
      .join('')}
    <div class="btn-row" style="margin-top:6px">
      <button class="btn btn-primary" type="submit">${icon('check', 18)} Calificar</button>
      <button class="btn btn-outline" type="button" id="quiz-retry" hidden>${icon('refresh', 18)} Reintentar</button>
    </div>
    <div id="quiz-result" role="status" aria-live="polite" style="margin-top:14px"></div>
  </form>`;
}

export function mountQuiz(root, item, onSaved) {
  const form = root.querySelector('#quiz-form');
  if (!form) return;
  const out = root.querySelector('#quiz-result');
  const retry = root.querySelector('#quiz-retry');
  const qs = item.evaluacion;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const answers = qs.map((_, i) => {
      const sel = form.querySelector(`input[name="q${i}"]:checked`);
      return sel ? Number(sel.value) : null;
    });
    if (answers.includes(null)) {
      out.innerHTML = `<div class="callout callout-warn">${icon('alert', 18)}<div>Responda todas las preguntas antes de calificar.</div></div>`;
      return;
    }

    let score = 0;
    qs.forEach((q, i) => {
      const fs = form.querySelector(`fieldset[data-i="${i}"]`);
      const ok = answers[i] === q.correcta;
      if (ok) score++;
      fs.querySelectorAll('.opt').forEach((lab) => {
        const j = Number(lab.dataset.j);
        lab.classList.toggle('correct', j === q.correcta);
        lab.classList.toggle('wrong', j === answers[i] && !ok);
        lab.querySelector('input').disabled = true;
      });
      const fb = fs.querySelector('.fb');
      fb.hidden = false;
      fb.textContent = (ok ? 'Correcto. ' : 'Incorrecto. ') + (q.explicacion || '');
    });

    Progress.saveQuiz(item.id, score, qs.length);
    const passed = score / qs.length >= DB.site.aprobacion_minima;
    out.innerHTML = `<div class="callout ${passed ? 'callout-ok' : 'callout-warn'}">${icon(passed ? 'check' : 'alert', 18)}
      <div><div class="score">${score} de ${qs.length}</div>${
        passed
          ? 'Resultado satisfactorio. Recuerde marcar el módulo como estudiado para completarlo.'
          : 'Revise el contenido del módulo y vuelva a intentarlo.'
      }</div></div>`;
    retry.hidden = false;
    form.querySelector('button[type="submit"]').disabled = true;
    if (onSaved) onSaved();
  });

  retry.addEventListener('click', () => {
    form.reset();
    form.querySelectorAll('.opt').forEach((l) => { l.classList.remove('correct', 'wrong'); l.querySelector('input').disabled = false; });
    form.querySelectorAll('.fb').forEach((f) => { f.hidden = true; f.textContent = ''; });
    out.innerHTML = '';
    retry.hidden = true;
    form.querySelector('button[type="submit"]').disabled = false;
  });
}
