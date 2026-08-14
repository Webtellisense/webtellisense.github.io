(function () {
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');
  if (!btn) return;

  function currentTheme() {
    return root.classList.contains('dark-theme') ? 'dark-theme' : 'light-theme';
  }

  function setTheme(theme) {
    root.classList.remove('light-theme', 'dark-theme');
    root.classList.add(theme);
    localStorage.setItem('wts-theme', theme);
    btn.setAttribute('aria-pressed', theme === 'dark-theme' ? 'true' : 'false');
  }

  // sync button state with whatever the inline head script already set
  btn.setAttribute('aria-pressed', currentTheme() === 'dark-theme' ? 'true' : 'false');

  btn.addEventListener('click', function () {
    setTheme(currentTheme() === 'dark-theme' ? 'light-theme' : 'dark-theme');
  });
})();
