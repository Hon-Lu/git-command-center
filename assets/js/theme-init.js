(function () {
  try {
    var savedTheme = localStorage.getItem('git-command-center-theme');
    document.documentElement.dataset.theme = savedTheme === 'light' || savedTheme === 'dark'
      ? savedTheme
      : 'system';
  } catch (error) {
    document.documentElement.dataset.theme = 'system';
  }
})();
