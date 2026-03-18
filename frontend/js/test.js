let questions = [], answers = [], current = 0;
let timerInterval, timeLeft = 60 * 60;

const studentId = sessionStorage.getItem('studentId');
const studentClass = sessionStorage.getItem('studentClass');

if (!studentId) window.location.href = '/';

async function loadQuestions() {
  const res = await fetch(`/api/questions/${studentClass}`);
  const data = await res.json();
  if (!data.success || !data.questions.length) {
    alert('No questions found. Please seed the database first.');
    return;
  }
  questions = data.questions;
  answers = new Array(questions.length).fill(null);
  renderPalette();
  showQuestion(0);
  startTimer();
}

function showQuestion(index) {
  current = index;
  const q = questions[index];
  const subjects = { logical: 'Logical Reasoning', english: 'General English', gk: 'General Knowledge' };
  const badge = document.getElementById('sectionBadge');
  badge.textContent = subjects[q.subject];
  badge.className = `section-badge ${q.subject}`;

  document.getElementById('questionNumber').textContent = `Question ${index + 1} of ${questions.length}`;
  document.getElementById('questionText').textContent = q.question;

  const opts = document.getElementById('optionsContainer');
  opts.innerHTML = '';
  q.options.forEach((opt, i) => {
    const div = document.createElement('div');
    div.className = `option${answers[index] === i ? ' selected' : ''}`;
    div.textContent = `${String.fromCharCode(65 + i)}. ${opt}`;
    div.onclick = () => selectOption(i);
    opts.appendChild(div);
  });

  document.getElementById('prevBtn').disabled = index === 0;
  document.getElementById('nextBtn').style.display = index === questions.length - 1 ? 'none' : 'inline-block';
  document.getElementById('submitBtn').style.display = index === questions.length - 1 ? 'inline-block' : 'none';

  const fill = ((index + 1) / questions.length) * 100;
  document.getElementById('progressFill').style.width = fill + '%';
  updatePalette();
}

function selectOption(i) {
  answers[current] = i;
  showQuestion(current);
}

function nextQuestion() { if (current < questions.length - 1) showQuestion(current + 1); }
function prevQuestion() { if (current > 0) showQuestion(current - 1); }

function renderPalette() {
  const p = document.getElementById('palette');
  p.innerHTML = '';
  questions.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'palette-btn';
    btn.id = `pb-${i}`;
    btn.textContent = i + 1;
    btn.onclick = () => showQuestion(i);
    p.appendChild(btn);
  });
}

function updatePalette() {
  questions.forEach((_, i) => {
    const btn = document.getElementById(`pb-${i}`);
    if (!btn) return;
    btn.className = `palette-btn${answers[i] !== null ? ' answered' : ''}${i === current ? ' current' : ''}`;
  });
}

function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    const el = document.getElementById('timer');
    el.textContent = `${m}:${s}`;
    if (timeLeft <= 300) el.parentElement.classList.add('warning');
    if (timeLeft <= 0) { clearInterval(timerInterval); submitTest(); }
  }, 1000);
}

async function submitTest() {
  clearInterval(timerInterval);
  let score = 0;
  questions.forEach((q, i) => { if (answers[i] === q.answer) score++; });

  const res = await fetch('/api/students/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, score, total: questions.length })
  });
  const data = await res.json();
  if (data.success) {
    sessionStorage.setItem('result', JSON.stringify(data));
    window.location.href = '/result';
  }
}

loadQuestions();
