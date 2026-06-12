/* ─────────────────────────────────────────
   Tarefito — main.js
   Integração Supabase · feedback_beta
   ───────────────────────────────────────── */

const SUPABASE_URL  = 'https://txtnpmvunmivupkhndzy.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4dG5wbXZ1bm1pdnVwa2huZHp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MzA1NTYsImV4cCI6MjA5NDIwNjU1Nn0.tyl3u_4d1-bPMZx0OBu5WiD6jPpCuV48o9ajxPST-Qk';
const TABLE         = 'feedback_beta';
const VOTED_KEY     = 'tarefito_beta_voted_v1';

const OPTIONS = [
  { id: 'adorei',       label: 'Adorei! Já está fazendo diferença na nossa rotina.' },
  { id: 'gostei',       label: 'Gostei, mas tem pontos a melhorar.' },
  { id: 'explorando',   label: 'Ainda estou explorando o app.' },
  { id: 'dificuldades', label: 'Tive dificuldades para usar.' },
];

let selected = null;
let hasVoted = localStorage.getItem(VOTED_KEY) === '1';

async function supabaseInsert(payload) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'apikey':        SUPABASE_ANON,
      'Authorization': `Bearer ${SUPABASE_ANON}`,
      'Prefer':        'return=minimal',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
}

document.addEventListener('DOMContentLoaded', () => {
  renderOptions();
  const form = document.getElementById('feedback-form');
  if (form) form.addEventListener('submit', handleSubmit);
});

function renderOptions() {
  const list = document.getElementById('options-list');
  if (!list) return;
  list.innerHTML = '';
  OPTIONS.forEach(o => {
    const div = document.createElement('div');
    div.className = 'poll-option'
      + (selected === o.id ? ' selected' : '')
      + (hasVoted          ? ' voted'    : '');
    div.innerHTML = `
      <div class="option-row">
        <div class="radio-circle"><div class="radio-dot"></div></div>
        <span class="option-label">${o.label}</span>
      </div>`;
    if (!hasVoted) {
      div.addEventListener('click', () => { selected = o.id; renderOptions(); updateBtn(); });
    }
    list.appendChild(div);
  });
}

function updateBtn() {
  const btn = document.getElementById('submit-btn');
  if (btn) btn.disabled = !selected;
}

async function handleSubmit(e) {
  e.preventDefault();
  if (!selected || hasVoted) return;
  const sugestao = document.getElementById('sugestao')?.value?.trim() || null;
  const btn    = document.getElementById('submit-btn');
  const msgOk  = document.getElementById('msg-ok');
  const msgErr = document.getElementById('msg-err');
  btn.disabled = true;
  btn.textContent = 'Enviando…';
  if (msgErr) msgErr.style.display = 'none';
  try {
    await supabaseInsert({ resposta: selected, sugestao });
    hasVoted = true;
    localStorage.setItem(VOTED_KEY, '1');
    document.getElementById('feedback-form').style.display = 'none';
    if (msgOk) msgOk.style.display = 'block';
  } catch (err) {
    console.error(err);
    btn.disabled = false;
    btn.textContent = 'Enviar feedback';
    if (msgErr) msgErr.style.display = 'block';
  }
}
