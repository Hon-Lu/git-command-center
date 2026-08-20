(function () {
  'use strict';

  var app = window.GitCommandApp;

  app.registerCommand({
    id: 'commit-message',
    sections: [
      { id: 'commit-builder', label: '指令產生器' },
      { id: 'latest-commit', label: '最新一筆' },
      { id: 'older-commit', label: '更早之前' },
      { id: 'commit-reference', label: '常用格式' }
    ],
    render: function (root) {
      root.innerHTML =
        '<section class="content-card builder-card" id="commit-builder">' +
          '<div class="content-card__heading">' +
            '<span class="content-card__icon" aria-hidden="true">' + app.icon('pencil') + '</span>' +
            '<div><p class="section-kicker">互動產生器</p><h2>先選要修改哪一筆 commit</h2></div>' +
          '</div>' +

          '<div class="segmented-control" role="tablist" aria-label="Commit 修改模式">' +
            '<button id="tab-latest" type="button" role="tab" aria-selected="true" aria-controls="panel-latest" data-mode="latest" class="is-active">最新一筆</button>' +
            '<button id="tab-older" type="button" role="tab" aria-selected="false" aria-controls="panel-older" data-mode="older">更早之前</button>' +
          '</div>' +

          '<div id="panel-latest" role="tabpanel" aria-labelledby="tab-latest" class="builder-panel">' +
            '<div class="form-grid">' +
              '<label class="field">' +
                '<span class="field__label">新的 commit 訊息</span>' +
                '<span class="field__hint">會安全處理雙引號與 shell 特殊字元</span>' +
                '<input id="commit-message-input" type="text" value="fix: 修正登入頁面錯誤" autocomplete="off" spellcheck="false">' +
              '</label>' +
            '</div>' +
            '<label class="switch-row switch-row--standalone">' +
              '<span><strong>這筆 commit 已經 push 過遠端</strong><small>開啟後使用 <code>--force-with-lease</code></small></span>' +
              '<input id="latest-pushed" type="checkbox"><span class="switch-control" aria-hidden="true"></span>' +
            '</label>' +
            '<div class="inline-validation" id="latest-validation" role="status" aria-live="polite"></div>' +
            app.codePanel({ id: 'latest-commit-code', title: '產生的指令', code: '', copyLabel: '複製全部' }) +
          '</div>' +

          '<div id="panel-older" role="tabpanel" aria-labelledby="tab-older" class="builder-panel" hidden>' +
            '<div class="form-grid form-grid--two">' +
              '<label class="field">' +
                '<span class="field__label">往回查看幾筆</span>' +
                '<span class="field__hint"><code>HEAD~N</code> 中的 N</span>' +
                '<input id="commit-count" type="number" min="1" max="100" step="1" value="3" inputmode="numeric">' +
              '</label>' +
              '<div class="field field--explanation">' +
                '<span class="field__label">接下來要做什麼</span>' +
                '<span class="field__hint">在編輯器裡把目標 commit 的 <code>pick</code> 改成 <code>reword</code></span>' +
              '</div>' +
            '</div>' +
            '<label class="switch-row switch-row--standalone">' +
              '<span><strong>這些 commits 已經 push 過遠端</strong><small>開啟後在 rebase 完成後加入安全強制推送</small></span>' +
              '<input id="older-pushed" type="checkbox"><span class="switch-control" aria-hidden="true"></span>' +
            '</label>' +
            '<div class="inline-validation" id="older-validation" role="status" aria-live="polite"></div>' +
            app.codePanel({ id: 'older-commit-code', title: '第一步與後續推送', code: '', copyLabel: '複製指令' }) +
          '</div>' +
        '</section>' +

        '<section class="content-card" id="latest-commit">' +
          '<div class="content-card__heading">' +
            '<span class="content-card__icon" aria-hidden="true">' + app.icon('pencil') + '</span>' +
            '<div><p class="section-kicker">最新一筆</p><h2>使用 <code>git commit --amend</code></h2></div>' +
          '</div>' +
          app.codePanel({ id: 'latest-reference-code', title: '常用格式', code: 'git commit --amend -m "新的 commit 訊息"', copyLabel: '複製格式' }) +
          '<div class="notice notice--info">' +
            '<span aria-hidden="true">' + app.icon('info') + '</span>' +
            '<div><strong><code>amend</code> 會產生新的 commit hash</strong><p>即使檔案內容沒有變更，commit hash 仍會改變。</p></div>' +
          '</div>' +
        '</section>' +

        '<section class="content-card" id="older-commit">' +
          '<div class="content-card__heading">' +
            '<span class="content-card__icon" aria-hidden="true">' + app.icon('branch') + '</span>' +
            '<div><p class="section-kicker">更早之前</p><h2>使用 interactive rebase</h2></div>' +
          '</div>' +
          '<p><code>HEAD~3</code> 代表查看最近 3 筆 commits。把想修改訊息的 commit 從 <code>pick</code> 改成 <code>reword</code>。</p>' +
          '<div class="example-pair">' +
            '<div>' + app.codePanel({ id: 'older-before-code', title: '原本', code: 'pick abc1234 feat: add login\npick def5678 fix: login bug\npick ghi9012 refactor: login flow', copyLabel: '複製範例' }) + '</div>' +
            '<div>' + app.codePanel({ id: 'older-after-code', title: '改成', code: 'pick abc1234 feat: add login\nreword def5678 fix: login bug\npick ghi9012 refactor: login flow', copyLabel: '複製範例' }) + '</div>' +
          '</div>' +
          '<p class="helper-text">儲存並離開後，Git 會讓你重新輸入該 commit 的訊息。</p>' +
        '</section>' +

        '<section class="content-card" id="commit-reference">' +
          '<div class="content-card__heading">' +
            '<span class="content-card__icon content-card__icon--success" aria-hidden="true">' + app.icon('terminal') + '</span>' +
            '<div><p class="section-kicker">快速回想</p><h2>三個常用格式</h2></div>' +
          '</div>' +
          '<div class="reference-list">' +
            '<div><span>修改最新一筆</span><code>git commit --amend -m "新的 commit 訊息"</code></div>' +
            '<div><span>修改最近 N 筆中的某一筆</span><code>git rebase -i HEAD~N</code></div>' +
            '<div><span>已推送到遠端</span><code>git push --force-with-lease</code></div>' +
          '</div>' +
        '</section>';

      var tabs = Array.from(root.querySelectorAll('[data-mode]'));
      var latestPanel = document.getElementById('panel-latest');
      var olderPanel = document.getElementById('panel-older');
      var messageInput = document.getElementById('commit-message-input');
      var latestPushed = document.getElementById('latest-pushed');
      var latestValidation = document.getElementById('latest-validation');
      var commitCount = document.getElementById('commit-count');
      var olderPushed = document.getElementById('older-pushed');
      var olderValidation = document.getElementById('older-validation');

      function setMode(mode) {
        tabs.forEach(function (tab) {
          var active = tab.dataset.mode === mode;
          tab.classList.toggle('is-active', active);
          tab.setAttribute('aria-selected', String(active));
          tab.tabIndex = active ? 0 : -1;
        });
        latestPanel.hidden = mode !== 'latest';
        olderPanel.hidden = mode !== 'older';
      }

      function updateLatest() {
        var message = messageInput.value.trim();
        var valid = Boolean(message);
        messageInput.classList.toggle('is-invalid', !valid);
        messageInput.setAttribute('aria-invalid', String(!valid));

        var value = message || '<新的 commit 訊息>';
        var lines = ['git commit --amend -m ' + (valid ? app.doubleQuotedShell(value) : '"' + value + '"')];
        lines.push(latestPushed.checked ? 'git push --force-with-lease' : 'git push');
        app.setCode('latest-commit-code', lines.join('\n'));
        app.setCopyEnabled('latest-commit-code', valid);

        latestValidation.textContent = valid
          ? (latestPushed.checked ? '已加入安全強制推送。' : '尚未推送過，使用一般 git push。')
          : '請輸入新的 commit 訊息。';
        latestValidation.className = 'inline-validation ' + (valid ? 'inline-validation--success' : 'inline-validation--warning');
      }

      function updateOlder() {
        var parsed = Math.floor(Number(commitCount.value));
        var valid = Number.isFinite(parsed) && parsed >= 1 && parsed <= 100;
        commitCount.classList.toggle('is-invalid', !valid);
        commitCount.setAttribute('aria-invalid', String(!valid));
        var count = valid ? parsed : 'N';
        var lines = ['git rebase -i HEAD~' + count];
        if (olderPushed.checked) lines.push('git push --force-with-lease');
        app.setCode('older-commit-code', lines.join('\n'));
        app.setCopyEnabled('older-commit-code', valid);

        olderValidation.textContent = valid
          ? '會打開最近 ' + parsed + ' 筆 commits；把目標的 pick 改成 reword。'
          : '請輸入 1 到 100 之間的整數。';
        olderValidation.className = 'inline-validation ' + (valid ? 'inline-validation--success' : 'inline-validation--warning');
      }

      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () { setMode(tab.dataset.mode); });
        tab.addEventListener('keydown', function (event) {
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
          event.preventDefault();
          var next = tab.dataset.mode === 'latest' ? 'older' : 'latest';
          setMode(next);
          root.querySelector('[data-mode="' + next + '"]').focus();
        });
      });

      [messageInput, latestPushed].forEach(function (element) {
        element.addEventListener('input', updateLatest);
        element.addEventListener('change', updateLatest);
      });
      [commitCount, olderPushed].forEach(function (element) {
        element.addEventListener('input', updateOlder);
        element.addEventListener('change', updateOlder);
      });

      setMode('latest');
      updateLatest();
      updateOlder();
    }
  });
})();
