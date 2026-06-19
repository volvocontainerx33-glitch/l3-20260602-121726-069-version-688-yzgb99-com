(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var heroSlides = selectAll('.hero-slide');
  var heroDots = selectAll('.hero-dot');
  var heroIndex = 0;

  function showHeroSlide(index) {
    if (!heroSlides.length) {
      return;
    }

    heroIndex = (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === heroIndex);
    });

    heroDots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === heroIndex);
    });
  }

  heroDots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showHeroSlide(index);
    });
  });

  if (heroSlides.length > 1) {
    window.setInterval(function () {
      showHeroSlide(heroIndex + 1);
    }, 5600);
  }

  selectAll('.hero-search-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      var target = './search.html';

      if (query) {
        target += '?q=' + encodeURIComponent(query);
      }

      window.location.href = target;
    });
  });

  function applyFilter(panel) {
    var input = panel.querySelector('[data-filter-input]');
    var yearSelect = panel.querySelector('[data-year-filter]');
    var typeSelect = panel.querySelector('[data-type-filter]');
    var sortSelect = panel.querySelector('[data-sort-select]');
    var gridSelector = panel.getAttribute('data-target-grid');
    var grid = gridSelector ? document.querySelector(gridSelector) : panel.nextElementSibling;

    if (!grid) {
      return;
    }

    var cards = selectAll('.js-filter-card', grid);
    var empty = document.querySelector('[data-filter-empty="' + grid.id + '"]');

    function run() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-text') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var matched = true;

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        if (type && cardType !== type) {
          matched = false;
        }

        card.classList.toggle('hidden-card', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    function sortCards() {
      if (!sortSelect) {
        return;
      }

      var mode = sortSelect.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === 'title') {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        }

        if (mode === 'year') {
          return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
        }

        return Number(b.getAttribute('data-hot') || 0) - Number(a.getAttribute('data-hot') || 0);
      });

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    [input, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', run);
        control.addEventListener('change', run);
      }
    });

    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        sortCards();
        run();
      });
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    sortCards();
    run();
  }

  selectAll('[data-filter-panel]').forEach(applyFilter);

  selectAll('.js-player').forEach(function (player) {
    var video = player.querySelector('video');
    var stream = player.getAttribute('data-stream');
    var buttons = selectAll('[data-play-button]', player);
    var attached = false;
    var hlsInstance = null;

    function attachStream() {
      if (!video || !stream || attached) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      attached = true;
    }

    function startPlayback() {
      if (!video) {
        return;
      }

      attachStream();
      player.classList.add('is-playing');
      video.controls = true;

      var playTask = video.play();

      if (playTask && playTask.catch) {
        playTask.catch(function () {});
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', startPlayback);
    });

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (!video.controls) {
          player.classList.remove('is-playing');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance && hlsInstance.destroy) {
        hlsInstance.destroy();
      }
    });
  });
})();
