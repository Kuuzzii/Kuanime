const toggle = document.querySelector('.dark-mode-toggle');
toggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  toggle.setAttribute('aria-pressed', isDark);
  toggle.querySelector('span').textContent = isDark ? '🌙' : '☀️';
});
// Allow toggle by keyboard
toggle.addEventListener('keydown', e => {
  if(e.key === 'Enter' || e.key === " ") {
    e.preventDefault();
    toggle.click();
  }
});
