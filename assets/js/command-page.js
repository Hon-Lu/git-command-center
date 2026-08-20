(function () {
  'use strict';

  var app;
  var root;
  var loading;

  function renderError(title, message) {
    loading.hidden = true;
    root.innerHTML = '<section class="error-state">' +
      '<span class="error-state__icon" aria-hidden="true">' + app.icon('warning') + '</span>' +
      '<h1>' + app.escapeHTML(title) + '</h1>' +
      '<p>' + app.escapeHTML(message) + '</p>' +
      '<a class="button button--primary" href="index.html">返回所有工具</a>' +
    '</section>';
  }

  function relatedMarkup(currentId) {
    var related = (window.GIT_COMMANDS || []).filter(function (item) { return item.id !== currentId; }).slice(0, 2);
    if (!related.length) return '';
    return '<section class="related-tools" aria-labelledby="related-title">' +
      '<div class="section-heading section-heading--compact">' +
        '<div><p class="section-kicker">繼續探索</p><h2 id="related-title">其他工具</h2></div>' +
      '</div>' +
      '<div class="related-grid">' + related.map(function (item) {
        return '<a class="related-card" href="command.html?id=' + encodeURIComponent(item.id) + '">' +
          '<span class="related-card__icon" aria-hidden="true">' + app.icon(item.icon) + '</span>' +
          '<span><strong>' + app.escapeHTML(item.title) + '</strong><small>' + app.escapeHTML(item.label) + '</small></span>' +
          '<span class="related-card__arrow" aria-hidden="true">' + app.icon('arrow') + '</span>' +
        '</a>';
      }).join('') + '</div>' +
    '</section>';
  }

  function setupSectionNavigation() {
    var links = Array.from(document.querySelectorAll('.section-nav a'));
    var sections = links.map(function (link) { return document.querySelector(link.getAttribute('href')); }).filter(Boolean);
    if (!links.length || !sections.length || !('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      var visible = entries.filter(function (entry) { return entry.isIntersecting; })
        .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });
      if (!visible.length) return;
      var id = visible[0].target.id;
      links.forEach(function (link) {
        var active = link.getAttribute('href') === '#' + id;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-18% 0px -65% 0px', threshold: [0, 0.2, 0.6] });

    sections.forEach(function (section) { observer.observe(section); });
  }

  function renderCommand(entry, command) {
    document.title = entry.title + ' · Git 指令中心';
    loading.hidden = true;

    var sectionLinks = command.sections.map(function (section, index) {
      return '<a href="#' + app.escapeHTML(section.id) + '"' + (index === 0 ? ' class="is-active" aria-current="location"' : '') + '>' +
        app.escapeHTML(section.label) +
      '</a>';
    }).join('');

    var tags = entry.tags.map(function (tag) {
      return '<span class="tag">' + app.escapeHTML(tag) + '</span>';
    }).join('');

    root.innerHTML = '<header class="command-hero">' +
      '<a class="breadcrumb" href="index.html">' + app.icon('chevron-left') + '<span>所有工具</span></a>' +
      '<div class="command-hero__main">' +
        '<span class="command-hero__icon command-hero__icon--' + app.escapeHTML(entry.accent) + '" aria-hidden="true">' + app.icon(entry.icon) + '</span>' +
        '<div>' +
          '<p class="eyebrow">' + app.escapeHTML(entry.categoryLabel) + '</p>' +
          '<h1>' + app.escapeHTML(entry.title) + '</h1>' +
          '<p class="command-hero__label">' + app.escapeHTML(entry.label) + '</p>' +
          '<p class="command-hero__description">' + app.escapeHTML(entry.description) + '</p>' +
          '<div class="command-hero__tags">' + tags + '</div>' +
        '</div>' +
      '</div>' +
    '</header>' +
    '<div class="command-layout">' +
      '<aside class="command-sidebar" aria-label="本頁章節">' +
        '<nav class="section-nav">' + sectionLinks + '</nav>' +
      '</aside>' +
      '<div class="command-content" id="command-content"></div>' +
    '</div>' +
    relatedMarkup(entry.id);

    command.render(document.getElementById('command-content'));
    app.hydrateIcons(root);
    setupSectionNavigation();
  }

  function loadModule(entry) {
    return new Promise(function (resolve, reject) {
      var existing = app.getCommand(entry.id);
      if (existing) {
        resolve(existing);
        return;
      }

      var script = document.createElement('script');
      script.src = entry.script;
      script.async = true;
      script.onload = function () {
        var command = app.getCommand(entry.id);
        if (command) resolve(command);
        else reject(new Error('Command did not register'));
      };
      script.onerror = function () { reject(new Error('Unable to load command module')); };
      document.body.appendChild(script);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    app = window.GitCommandApp;
    root = document.getElementById('command-root');
    loading = document.getElementById('command-loading');

    var id = new URLSearchParams(window.location.search).get('id');
    var entry = (window.GIT_COMMANDS || []).find(function (item) { return item.id === id; });

    if (!entry) {
      renderError('找不到這個工具', '網址中的工具名稱不存在，或這個工具尚未加入首頁清單。');
      return;
    }

    loadModule(entry)
      .then(function (command) { renderCommand(entry, command); })
      .catch(function () {
        renderError('工具載入失敗', '請確認 ZIP 已完整解壓縮，且 commands 資料夾仍在 command.html 旁邊。');
      });
  });
})();
