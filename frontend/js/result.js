const result = JSON.parse(sessionStorage.getItem('result') || '{}');

if (!result.score && result.score !== 0) {
  window.location.href = '/';
}

document.getElementById('studentName').textContent = result.name || '';
document.getElementById('scorePercent').textContent = result.percentage + '%';
document.getElementById('scoreVal').textContent = result.score;
document.getElementById('totalVal').textContent = result.total;
document.getElementById('percentVal').textContent = result.percentage + '%';

const p = result.percentage;
let icon, title, remark;
if (p >= 90) {
  icon = '🏆'; title = 'Outstanding!';
  remark = 'Excellent performance! You are a scholarship topper!';
} else if (p >= 75) {
  icon = '🥇'; title = 'Great Job!';
  remark = 'Very good performance! You qualify for the scholarship.';
} else if (p >= 60) {
  icon = '🥈'; title = 'Good Effort!';
  remark = 'Decent score. Keep practising to improve further.';
} else if (p >= 40) {
  icon = '🥉'; title = 'Keep Going!';
  remark = 'You need more preparation. Try again next time!';
} else {
  icon = '📚'; title = 'Keep Trying!';
  remark = 'Don\'t give up! Study harder and try again.';
}

document.getElementById('resultIcon').textContent = icon;
document.getElementById('resultTitle').textContent = title;
document.getElementById('remarkBox').textContent = remark;
