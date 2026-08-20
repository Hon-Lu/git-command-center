(function () {
  'use strict';

  var app = window.GitCommandApp;

  app.registerCommand({
    id: 'replace-with-command-id',
    sections: [
      { id: 'overview', label: '概覽' },
      { id: 'command', label: '指令' }
    ],
    render: function (root) {
      root.innerHTML =
        '<section class="content-card" id="overview">' +
          '<div class="content-card__heading">' +
            '<span class="content-card__icon" aria-hidden="true">' + app.icon('info') + '</span>' +
            '<div><p class="section-kicker">分類</p><h2>標題</h2></div>' +
          '</div>' +
          '<p>在這裡放說明。</p>' +
        '</section>' +
        '<section class="content-card" id="command">' +
          app.codePanel({ id: 'unique-code-id', title: 'Terminal', code: 'git ...', copyLabel: '複製指令' }) +
        '</section>';
    }
  });
})();
