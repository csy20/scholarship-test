const { navigateTo } = window.appRuntime;
const data = JSON.parse(sessionStorage.getItem('result') || '{}');

if (!data || (data.score === undefined)) {
  navigateTo('home');
} else {
  const { score, total, percentage, name } = data;
  const wrong = total - score;

  // Populate
  document.getElementById('resultName').textContent  = name ? `Well done, ${name}!` : '';
  document.getElementById('scoreVal').textContent     = score;
  document.getElementById('totalVal').textContent     = total;
  document.getElementById('wrongVal').textContent     = wrong;

  // Animate percentage counter
  let count = 0;
  const target = percentage;
  const step   = Math.max(1, Math.floor(target / 60));
  const el     = document.getElementById('scorePercent');
  const counter = setInterval(() => {
    count = Math.min(count + step, target);
    el.textContent = count + '%';
    if (count >= target) clearInterval(counter);
  }, 20);

  // Animate ring
  const circumference = 2 * Math.PI * 58; // r=58
  const ringFill      = document.getElementById('ringFill');
  ringFill.style.strokeDasharray  = circumference;
  ringFill.style.strokeDashoffset = circumference;
  setTimeout(() => {
    const offset = circumference - (percentage / 100) * circumference;
    ringFill.style.strokeDashoffset = offset;
  }, 100);

  // Medal & remark
  let medal, title, remark;
  if      (percentage >= 90) { medal='🏆'; title='Outstanding!';      remark='Exceptional performance! You are at the top of the leaderboard.'; }
  else if (percentage >= 75) { medal='🥇'; title='Excellent!';         remark='Great job! You have qualified for the scholarship shortlist.'; }
  else if (percentage >= 60) { medal='🥈'; title='Good Performance!';  remark='Solid effort! Keep practicing to improve your score.'; }
  else if (percentage >= 40) { medal='🥉'; title='Keep Going!';         remark='You showed potential. More preparation will get you there!'; }
  else                       { medal='📚'; title='Don\'t Give Up!';    remark='Every expert was once a beginner. Study hard and try again!'; }

  document.getElementById('medal').textContent        = medal;
  document.getElementById('resultTitle').textContent  = title;
  document.getElementById('remarkBox').textContent    = remark;

  // Clear session after reading
  sessionStorage.removeItem('result');
}
