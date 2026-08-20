(function () {
  'use strict';

  var app = window.GitCommandApp;

  app.registerCommand({
    id: 'force-with-lease',
    sections: [
      { id: 'when-to-use', label: '何時使用' },
      { id: 'force-command', label: '指令' },
      { id: 'why-safer', label: '為什麼較安全' }
    ],
    render: function (root) {
      root.innerHTML =
        '<section class="content-card" id="when-to-use">' +
          '<div class="content-card__heading">' +
            '<span class="content-card__icon" aria-hidden="true">' + app.icon('info') + '</span>' +
            '<div><p class="section-kicker">使用時機</p><h2>本機已改寫 commit 歷史</h2></div>' +
          '</div>' +
          '<p>當遠端分支仍保留舊紀錄，一般 <code>git push</code> 會失敗。常見情境包括：</p>' +
          '<div class="use-case-grid" aria-label="常見使用情境">' +
            '<span>rebase</span><span>squash commit</span><span>amend commit</span><span>修改已推送的 commit</span>' +
          '</div>' +
        '</section>' +

        '<section class="content-card content-card--accent" id="force-command">' +
          '<div class="content-card__heading">' +
            '<span class="content-card__icon" aria-hidden="true">' + app.icon('terminal') + '</span>' +
            '<div><p class="section-kicker">直接使用</p><h2>帶檢查機制的強制推送</h2></div>' +
          '</div>' +
          app.codePanel({ id: 'force-with-lease-code', title: 'Terminal', code: 'git push --force-with-lease', copyLabel: '複製指令' }) +
          '<p class="helper-text">這個按鈕只會複製文字，不會執行 Git 指令。</p>' +
        '</section>' +

        '<section class="content-card" id="why-safer">' +
          '<div class="content-card__heading">' +
            '<span class="content-card__icon content-card__icon--success" aria-hidden="true">' + app.icon('shield') + '</span>' +
            '<div><p class="section-kicker">安全機制</p><h2>比 <code>--force</code> 更保守</h2></div>' +
          '</div>' +
          '<div class="comparison-grid">' +
            '<article class="comparison-card">' +
              '<strong>你預期的遠端狀態沒變</strong>' +
              '<p>用本機目前的 commit 歷史更新遠端分支。</p>' +
            '</article>' +
            '<article class="comparison-card comparison-card--warning">' +
              '<strong>遠端已被其他人更新</strong>' +
              '<p>Git 會阻止推送，避免直接覆蓋別人剛推上去的 commit。</p>' +
            '</article>' +
          '</div>' +
        '</section>';
    }
  });
})();
