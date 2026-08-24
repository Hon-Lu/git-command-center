(function () {
  'use strict';

  var registry = new Map();
  var toastTimer = null;

  var icons = {
    search: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4 4"></path></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3.5"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"></path></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 15.3A8.5 8.5 0 0 1 8.7 4 8.5 8.5 0 1 0 20 15.3Z"></path></svg>',
    branch: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="6" cy="5" r="2"></circle><circle cx="18" cy="7" r="2"></circle><circle cx="6" cy="19" r="2"></circle><path d="M6 7v10M8 10h4a6 6 0 0 0 6-6"></path></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3 4.5 6v5.5c0 4.7 3.1 7.9 7.5 9.5 4.4-1.6 7.5-4.8 7.5-9.5V6L12 3Z"></path><path d="m8.8 12 2.1 2.1 4.5-4.5"></path></svg>',
    pencil: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m4 20 4.2-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"></path><path d="m13.8 7.4 2.8 2.8M8.2 19l-3.1-3.1"></path></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5"></path></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"></rect><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12.5 4.2 4.2L19 7"></path></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10.3 4.3 2.9 17.1A2 2 0 0 0 4.6 20h14.8a2 2 0 0 0 1.7-2.9L13.7 4.3a2 2 0 0 0-3.4 0Z"></path><path d="M12 9v4M12 17h.01"></path></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 11v5M12 8h.01"></path></svg>',
    terminal: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"></rect><path d="m7 9 3 3-3 3M13 15h4"></path></svg>',
    'chevron-left': '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 18-6-6 6-6"></path></svg>',
    external: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 5h5v5M19 5l-8 8"></path><path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"></path></svg>'
  };

  function icon(name) {
    return icons[name] || icons.terminal;
  }

  function hydrateIcons(root) {
    var scope = root || document;
    scope.querySelectorAll('[data-app-icon]').forEach(function (element) {
      element.innerHTML = icon(element.getAttribute('data-app-icon'));
    });
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function shellArg(value) {
    var text = String(value).trim();
    // 只有 shell 會解讀的字元才需要引號；中文等一般字元加了引號反而干擾閱讀與複製。
    if (text && !/[\s'"\\$`;&|<>()\[\]{}*?!#~^]/.test(text)) {
      return text;
    }
    // Windows Terminal（cmd / PowerShell）不吃單引號括住的參數，一律用雙引號。
    return '"' + text + '"';
  }

  function doubleQuotedShell(value) {
    return '"' + String(value)
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\$/g, '\\$')
      .replace(/`/g, '\\`') + '"';
  }

  function getEffectiveTheme() {
    var selected = document.documentElement.dataset.theme || 'system';
    if (selected === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return selected;
  }

  function updateThemeButton() {
    var button = document.getElementById('theme-toggle');
    if (!button) return;
    var effective = getEffectiveTheme();
    var next = effective === 'dark' ? '淺色' : '深色';
    button.innerHTML = icon(effective === 'dark' ? 'sun' : 'moon');
    button.setAttribute('aria-label', '切換為' + next + '外觀');
    button.setAttribute('title', '切換為' + next + '外觀');
  }

  function initTheme() {
    updateThemeButton();
    var button = document.getElementById('theme-toggle');
    if (button) {
      button.addEventListener('click', function () {
        var next = getEffectiveTheme() === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem('git-command-center-theme', next);
        } catch (error) {
          // Theme still applies for this session when localStorage is unavailable.
        }
        updateThemeButton();
      });
    }

    var media = window.matchMedia('(prefers-color-scheme: dark)');
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', function () {
        if (document.documentElement.dataset.theme === 'system') updateThemeButton();
      });
    }
  }

  function showToast(message, type) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.dataset.type = type || 'success';
    toast.classList.add('is-visible');
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 1800);
  }

  function fallbackCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    var success = document.execCommand('copy');
    textarea.remove();
    if (!success) throw new Error('Copy failed');
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        fallbackCopy(text);
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  function initCopyDelegation() {
    document.addEventListener('click', async function (event) {
      var button = event.target.closest('[data-copy-source]');
      if (!button || button.disabled) return;
      var source = document.getElementById(button.getAttribute('data-copy-source'));
      if (!source) return;

      var copied = await copyText(source.textContent.trim());
      if (!copied) {
        showToast('無法自動複製，請手動選取文字', 'error');
        return;
      }

      var originalLabel = button.getAttribute('data-label') || button.textContent.trim() || '複製';
      button.classList.add('is-copied');
      button.innerHTML = icon('check') + '<span>已複製</span>';
      showToast('指令已複製');
      window.setTimeout(function () {
        button.classList.remove('is-copied');
        button.innerHTML = icon('copy') + '<span>' + escapeHTML(originalLabel) + '</span>';
      }, 1400);
    });
  }

  function registerCommand(command) {
    if (!command || !command.id || typeof command.render !== 'function') {
      throw new Error('Invalid command module');
    }
    registry.set(command.id, command);
    window.dispatchEvent(new CustomEvent('git-command-registered', { detail: { id: command.id } }));
  }

  function getCommand(id) {
    return registry.get(id);
  }

  function codePanel(options) {
    var title = escapeHTML(options.title || '產生的指令');
    var id = escapeHTML(options.id);
    var code = escapeHTML(options.code || '');
    var copyLabel = escapeHTML(options.copyLabel || '複製');
    var className = options.className ? ' ' + escapeHTML(options.className) : '';

    return '<div class="code-panel' + className + '">' +
      '<div class="code-panel__header">' +
        '<span>' + title + '</span>' +
        '<button class="copy-button" type="button" data-copy-source="' + id + '" data-label="' + copyLabel + '">' +
          icon('copy') + '<span>' + copyLabel + '</span>' +
        '</button>' +
      '</div>' +
      '<pre><code id="' + id + '">' + code + '</code></pre>' +
    '</div>';
  }

  function setCode(id, value) {
    var code = document.getElementById(id);
    if (code) code.textContent = value;
  }

  function setCopyEnabled(sourceId, enabled) {
    document.querySelectorAll('[data-copy-source="' + sourceId + '"]').forEach(function (button) {
      button.disabled = !enabled;
      button.setAttribute('aria-disabled', String(!enabled));
    });
  }

  window.GitCommandApp = {
    icon: icon,
    hydrateIcons: hydrateIcons,
    escapeHTML: escapeHTML,
    shellArg: shellArg,
    doubleQuotedShell: doubleQuotedShell,
    showToast: showToast,
    copyText: copyText,
    registerCommand: registerCommand,
    getCommand: getCommand,
    codePanel: codePanel,
    setCode: setCode,
    setCopyEnabled: setCopyEnabled
  };

  document.addEventListener('DOMContentLoaded', function () {
    hydrateIcons(document);
    initTheme();
    initCopyDelegation();
  });
})();
