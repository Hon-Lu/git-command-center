(function () {
  'use strict';

  var commands = Array.isArray(window.GIT_COMMANDS) ? window.GIT_COMMANDS : [];
  var searchInput;
  var grid;
  var filters;
  var count;
  var empty;
  var activeCategory = 'all';

  function normalize(value) {
    return String(value || '').toLocaleLowerCase('zh-Hant').trim();
  }

  function cardMarkup(command) {
    var app = window.GitCommandApp;
    var tags = command.tags.map(function (tag) {
      return '<span class="tag">' + app.escapeHTML(tag) + '</span>';
    }).join('');

    return '<a class="command-card command-card--' + app.escapeHTML(command.accent) + '" href="command.html?id=' + encodeURIComponent(command.id) + '">' +
      '<div class="command-card__top">' +
        '<span class="command-card__icon" aria-hidden="true">' + app.icon(command.icon) + '</span>' +
        '<span class="command-card__arrow" aria-hidden="true">' + app.icon('arrow') + '</span>' +
      '</div>' +
      '<div class="command-card__body">' +
        '<p class="command-card__category">' + app.escapeHTML(command.categoryLabel) + '</p>' +
        '<h3>' + app.escapeHTML(command.title) + '</h3>' +
        '<p class="command-card__label">' + app.escapeHTML(command.label) + '</p>' +
        '<p class="command-card__description">' + app.escapeHTML(command.description) + '</p>' +
      '</div>' +
      '<div class="command-card__tags">' + tags + '</div>' +
    '</a>';
  }

  function renderFilters() {
    var app = window.GitCommandApp;
    var categories = [{ value: 'all', label: '全部' }];
    commands.forEach(function (command) {
      if (!categories.some(function (item) { return item.value === command.category; })) {
        categories.push({ value: command.category, label: command.categoryLabel });
      }
    });

    filters.innerHTML = categories.map(function (category) {
      var selected = category.value === activeCategory;
      return '<button class="filter-chip' + (selected ? ' is-active' : '') + '" type="button" data-category="' + app.escapeHTML(category.value) + '" aria-pressed="' + selected + '">' +
        app.escapeHTML(category.label) +
      '</button>';
    }).join('');
  }

  function getFilteredCommands() {
    var query = normalize(searchInput.value);
    return commands.filter(function (command) {
      var matchesCategory = activeCategory === 'all' || command.category === activeCategory;
      var haystack = normalize([
        command.title,
        command.label,
        command.description,
        command.categoryLabel,
        command.keywords.join(' '),
        command.tags.join(' ')
      ].join(' '));
      return matchesCategory && (!query || haystack.includes(query));
    });
  }

  function renderCommands() {
    var filtered = getFilteredCommands();
    grid.innerHTML = filtered.map(cardMarkup).join('');
    count.textContent = filtered.length + ' 個工具';
    empty.hidden = filtered.length !== 0;
    grid.hidden = filtered.length === 0;
  }

  function resetSearch() {
    searchInput.value = '';
    activeCategory = 'all';
    renderFilters();
    renderCommands();
    searchInput.focus();
  }

  document.addEventListener('DOMContentLoaded', function () {
    searchInput = document.getElementById('command-search');
    grid = document.getElementById('command-grid');
    filters = document.getElementById('category-filters');
    count = document.getElementById('result-count');
    empty = document.getElementById('empty-state');

    renderFilters();
    renderCommands();

    searchInput.addEventListener('input', renderCommands);
    filters.addEventListener('click', function (event) {
      var button = event.target.closest('[data-category]');
      if (!button) return;
      activeCategory = button.dataset.category;
      renderFilters();
      renderCommands();
    });

    document.getElementById('clear-search').addEventListener('click', resetSearch);

    document.addEventListener('keydown', function (event) {
      var target = event.target;
      var typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInput.focus();
        searchInput.select();
      } else if (event.key === '/' && !typing) {
        event.preventDefault();
        searchInput.focus();
      } else if (event.key === 'Escape' && document.activeElement === searchInput) {
        resetSearch();
      }
    });
  });
})();
