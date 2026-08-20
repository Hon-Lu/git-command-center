(function () {
  'use strict';

  var app = window.GitCommandApp;

  app.registerCommand({
    id: 'rebase-onto',
    sections: [
      { id: 'rebase-builder', label: '指令產生器' },
      { id: 'rebase-scenario', label: '情境' },
      { id: 'rebase-format', label: '格式與意思' },
      { id: 'rebase-check', label: '完成後檢查' }
    ],
    render: function (root) {
      root.innerHTML =
        '<section class="content-card builder-card" id="rebase-builder">' +
          '<div class="content-card__heading">' +
            '<span class="content-card__icon" aria-hidden="true">' + app.icon('branch') + '</span>' +
            '<div><p class="section-kicker">互動產生器</p><h2>填入三個分支名稱</h2></div>' +
          '</div>' +
          '<p class="content-intro">欄位一改，下面的完整流程、核心指令與檢查指令會立即更新。</p>' +

          '<div class="form-grid form-grid--three">' +
            '<label class="field">' +
              '<span class="field__label">新的底</span>' +
              '<span class="field__hint">完成後要接到哪裡</span>' +
              '<input id="new-base" type="text" value="origin/main" autocomplete="off" spellcheck="false" placeholder="例如 origin/main">' +
            '</label>' +
            '<label class="field">' +
              '<span class="field__label">舊的底</span>' +
              '<span class="field__hint">原本從哪個分支切出</span>' +
              '<input id="old-base" type="text" value="A-1" autocomplete="off" spellcheck="false" placeholder="例如 A-1">' +
            '</label>' +
            '<label class="field">' +
              '<span class="field__label">要搬的分支</span>' +
              '<span class="field__hint">保留自己新增的 commits</span>' +
              '<input id="moving-branch" type="text" value="A-2" autocomplete="off" spellcheck="false" placeholder="例如 A-2">' +
            '</label>' +
          '</div>' +

          '<div class="builder-options" aria-label="完整流程選項">' +
            '<label class="switch-row">' +
              '<span><strong>先 checkout 要搬的分支</strong><small>加入 <code>git checkout</code></small></span>' +
              '<input id="include-checkout" type="checkbox" checked><span class="switch-control" aria-hidden="true"></span>' +
            '</label>' +
            '<label class="switch-row">' +
              '<span><strong>先更新遠端資訊</strong><small>加入 <code>git fetch origin</code></small></span>' +
              '<input id="include-fetch" type="checkbox" checked><span class="switch-control" aria-hidden="true"></span>' +
            '</label>' +
            '<label class="switch-row">' +
              '<span><strong>完成後推送</strong><small>加入 <code>git push --force-with-lease</code></small></span>' +
              '<input id="include-push" type="checkbox" checked><span class="switch-control" aria-hidden="true"></span>' +
            '</label>' +
          '</div>' +

          '<div class="inline-validation" id="rebase-validation" role="status" aria-live="polite"></div>' +
          '<div class="code-stack">' +
            app.codePanel({ id: 'rebase-full-flow', title: '完整流程', code: '', copyLabel: '複製全部' }) +
            app.codePanel({ id: 'rebase-core-command', title: '核心指令', code: '', copyLabel: '複製指令' }) +
          '</div>' +

          '<div class="meaning-card" id="rebase-live-meaning" aria-live="polite"></div>' +
          '<div class="notice notice--warning">' +
            '<span aria-hidden="true">' + app.icon('warning') + '</span>' +
            '<div><strong>這個流程會改寫 commit 歷史</strong><p>執行前先確認分支名稱；推送時使用 <code>--force-with-lease</code>，不要直接改成 <code>--force</code>。</p></div>' +
          '</div>' +
        '</section>' +

        '<section class="content-card" id="rebase-scenario">' +
          '<div class="content-card__heading">' +
            '<span class="content-card__icon" aria-hidden="true">' + app.icon('branch') + '</span>' +
            '<div><p class="section-kicker">原始情境</p><h2>A-2 原本從 A-1 切出</h2></div>' +
          '</div>' +
          '<pre class="diagram" aria-label="分支結構">main\n └─ A-1\n     └─ A-2</pre>' +
          '<p><code>A-1</code> 已經 merge 回 <code>main</code> 後，希望讓 <code>A-2</code> 改成直接接在最新的 <code>main</code> 後面。</p>' +
        '</section>' +

        '<section class="content-card" id="rebase-format">' +
          '<div class="content-card__heading">' +
            '<span class="content-card__icon" aria-hidden="true">' + app.icon('terminal') + '</span>' +
            '<div><p class="section-kicker">記憶格式</p><h2>新的底、舊的底、要搬的分支</h2></div>' +
          '</div>' +
          app.codePanel({ id: 'rebase-format-code', title: '格式', code: 'git rebase --onto <新的底> <舊的底> <要搬的分支>', copyLabel: '複製格式' }) +
          '<blockquote>類似把某個分支自己的 commits 手動 cherry-pick 到另一個 base 上，但用 rebase 一次完成。</blockquote>' +
        '</section>' +

        '<section class="content-card" id="rebase-check">' +
          '<div class="content-card__heading">' +
            '<span class="content-card__icon content-card__icon--success" aria-hidden="true">' + app.icon('check') + '</span>' +
            '<div><p class="section-kicker">完成後</p><h2>確認 commits 與差異</h2></div>' +
          '</div>' +
          app.codePanel({ id: 'rebase-check-code', title: '檢查指令', code: '', copyLabel: '複製檢查指令' }) +
        '</section>';

      var newBase = document.getElementById('new-base');
      var oldBase = document.getElementById('old-base');
      var movingBranch = document.getElementById('moving-branch');
      var includeCheckout = document.getElementById('include-checkout');
      var includeFetch = document.getElementById('include-fetch');
      var includePush = document.getElementById('include-push');
      var validation = document.getElementById('rebase-validation');
      var meaning = document.getElementById('rebase-live-meaning');
      var fields = [newBase, oldBase, movingBranch];

      function update() {
        var rawNew = newBase.value.trim();
        var rawOld = oldBase.value.trim();
        var rawBranch = movingBranch.value.trim();
        var complete = Boolean(rawNew && rawOld && rawBranch);

        fields.forEach(function (field) {
          field.classList.toggle('is-invalid', !field.value.trim());
          field.setAttribute('aria-invalid', String(!field.value.trim()));
        });

        var newValue = rawNew || '<新的底>';
        var oldValue = rawOld || '<舊的底>';
        var branchValue = rawBranch || '<要搬的分支>';
        var safeNew = complete ? app.shellArg(newValue) : newValue;
        var safeOld = complete ? app.shellArg(oldValue) : oldValue;
        var safeBranch = complete ? app.shellArg(branchValue) : branchValue;
        var core = 'git rebase --onto ' + safeNew + ' ' + safeOld + ' ' + safeBranch;
        var lines = [];

        if (includeCheckout.checked) lines.push('git checkout ' + safeBranch);
        if (includeFetch.checked) lines.push('git fetch origin');
        lines.push(core);
        if (includePush.checked) lines.push('git push --force-with-lease');

        app.setCode('rebase-core-command', core);
        app.setCode('rebase-full-flow', lines.join('\n'));
        app.setCode('rebase-check-code', 'git log --oneline ' + safeNew + '..' + safeBranch + '\n' + 'git diff ' + safeNew + '...' + safeBranch);
        app.setCopyEnabled('rebase-core-command', complete);
        app.setCopyEnabled('rebase-full-flow', complete);
        app.setCopyEnabled('rebase-check-code', complete);

        if (complete) {
          validation.textContent = '三個欄位已完成，可以複製。';
          validation.className = 'inline-validation inline-validation--success';
          meaning.innerHTML = '<span>這段指令的意思</span><p>把 <strong>' + app.escapeHTML(rawBranch) + '</strong> 上「<strong>' + app.escapeHTML(rawOld) + '</strong> 之後才新增的 commits」搬到 <strong>' + app.escapeHTML(rawNew) + '</strong> 後面。</p>';
        } else {
          validation.textContent = '請填完三個欄位，複製按鈕才會啟用。';
          validation.className = 'inline-validation inline-validation--warning';
          meaning.innerHTML = '<span>這段指令的意思</span><p>填完三個欄位後，這裡會顯示對應的白話說明。</p>';
        }
      }

      fields.concat([includeCheckout, includeFetch, includePush]).forEach(function (element) {
        element.addEventListener('input', update);
        element.addEventListener('change', update);
      });
      update();
    }
  });
})();
