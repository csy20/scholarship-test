const studentId    = sessionStorage.getItem('studentId');
const studentClass = sessionStorage.getItem('studentClass');
if (!studentId) window.location.href = '/';

let questions = [], answers = [], current = 0;
let timerInterval, timeLeft = 60 * 60;

const subjectLabel = { logical: 'Logical Reasoning', english: 'General English', gk: 'General Knowledge' };

async function loadQuestions() {
  try {
    const res  = await fetch(`/api/questions/${studentClass}`);
    const data = await res.json();
    if (!data.success || !data.questions.length) {
      alert('Questions unavailable. Please contact support.');
      return;
    }
    questions = data.questions;
    answers   = new Array(questions.length).fill(null);
    buildPalette();
    showQuestion(0);
    startTimer();
  } catch {
    alert('Failed to load questions. Please refresh.');
  }
}

function showQuestion(index) {
  current = index;
  const q = questions[index];

  // Section badge
  const badge = document.getElementById('sectionBadge');
  badge.textContent = subjectLabel[q.subject];
  badge.className   = `section-badge ${q.subject}`;

  // Header counter
  document.getElementById('qCounter').textContent = `${index + 1} / ${questions.length}`;

  // Question
  document.getElementById('questionNumber').textContent = `Question ${index + 1} of ${questions.length}`;
  document.getElementById('questionText').textContent    = q.question;

  // Options
  const container = document.getElementById('optionsContainer');
  container.innerHTML = '';
  q.options.forEach((opt, i) => {
    const div = document.createElement('div');
    div.className = `option${answers[index] === i ? ' selected' : ''}`;
    div.innerHTML = `
      <span class="option-letter">${String.fromCharCode(65 + i)}</span>
      <span class="option-text">${opt}</span>`;
    div.onclick = () => selectOption(i);
    container.appendChild(div);
  });

  // Progress
  document.getElementById('progressFill').style.width =
    `${((index + 1) / questions.length) * 100}%`;

  // Nav buttons
  document.getElementById('prevBtn').disabled          = index === 0;
  const isLast = index === questions.length - 1;
  document.getElementById('nextBtn').style.display     = isLast ? 'none'         : 'flex';
  document.getElementById('submitBtn').style.display   = isLast ? 'flex'         : 'none';

  updatePalette();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function selectOption(i) {
  answers[current] = i;
  showQuestion(current);
}

function nextQuestion() { if (current < questions.length - 1) showQuestion(current + 1); }
function prevQuestion() { if (current > 0) showQuestion(current - 1); }

function buildPalette() {
  const p = document.getElementById('palette');
  p.innerHTML = '';
  questions.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.id        = `pb-${i}`;
    btn.className = 'palette-btn';
    btn.textContent = i + 1;
    btn.onclick   = () => showQuestion(i);
    p.appendChild(btn);
  });
}

function updatePalette() {
  questions.forEach((_, i) => {
    const b = document.getElementById(`pb-${i}`);
    if (!b) return;
    b.className = `palette-btn${answers[i] !== null ? ' answered' : ''}${i === current ? ' current' : ''}`;
  });
}

function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    const m  = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const s  = String(timeLeft % 60).padStart(2, '0');
    const el = document.getElementById('timer');
    el.textContent = `${m}:${s}`;
    if (timeLeft <= 300) el.classList.add('warning');
    if (timeLeft <= 0)   { clearInterval(timerInterval); submitTest(); }
  }, 1000);
}

function confirmSubmit() {
  const unanswered = answers.filter(a => a === null).length;
  const msg = unanswered > 0
    ? `You have ${unanswered} unanswered question(s). Submit anyway?`
    : 'Are you sure you want to submit your test?';
  if (confirm(msg)) submitTest();
}

async function submitTest() {
  clearInterval(timerInterval);
  let score = 0;
  questions.forEach((q, i) => { if (answers[i] === q.answer) score++; });

  try {
    const res  = await fetch('/api/students/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, score, total: questions.length })
    });
    const data = await res.json();
    if (data.success) {
      sessionStorage.setItem('result', JSON.stringify(data));
      window.location.href = '/result';
    }
  } catch {
    alert('Submission failed. Please try again.');
  }
}

loadQuestions();
