function initMenu() {
  const button = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-site-nav]');
  if (!button || !nav) {
    return;
  }
  button.addEventListener('click', function () {
    nav.classList.toggle('is-open');
    button.textContent = nav.classList.contains('is-open') ? '×' : '☰';
  });
}

function initHero() {
  const slider = document.querySelector('[data-hero-slider]');
  if (!slider) {
    return;
  }
  const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(slider.querySelectorAll('[data-hero-jump]'));
  const nextButton = slider.querySelector('[data-hero-next]');
  const prevButton = slider.querySelector('[data-hero-prev]');
  if (!slides.length) {
    return;
  }
  let index = 0;
  let timer = null;
  const show = function (nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  };
  const stop = function () {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };
  const start = function () {
    stop();
    timer = setInterval(function () {
      show(index + 1);
    }, 6200);
  };
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      show(Number(dot.getAttribute('data-hero-jump')) || 0);
      start();
    });
  });
  if (nextButton) {
    nextButton.addEventListener('click', function () {
      show(index + 1);
      start();
    });
  }
  if (prevButton) {
    prevButton.addEventListener('click', function () {
      show(index - 1);
      start();
    });
  }
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  start();
}

function normalizeText(value) {
  return (value || '').toString().trim().toLowerCase();
}

function initFilters() {
  const scopes = document.querySelectorAll('[data-filter-scope]');
  scopes.forEach(function (scope) {
    const input = scope.querySelector('[data-filter-input]');
    const selects = Array.from(scope.querySelectorAll('[data-filter-select]'));
    const items = Array.from(scope.querySelectorAll('[data-search-item]'));
    const empty = scope.querySelector('[data-filter-empty]');
    const apply = function () {
      const query = normalizeText(input ? input.value : '');
      const selected = {};
      selects.forEach(function (select) {
        selected[select.getAttribute('data-filter-select')] = normalizeText(select.value);
      });
      let visible = 0;
      items.forEach(function (item) {
        const haystack = normalizeText([
          item.getAttribute('data-title'),
          item.getAttribute('data-region'),
          item.getAttribute('data-type'),
          item.getAttribute('data-year'),
          item.getAttribute('data-keywords')
        ].join(' '));
        const matchQuery = !query || haystack.indexOf(query) !== -1;
        const matchType = !selected.type || normalizeText(item.getAttribute('data-type')) === selected.type;
        const matchRegion = !selected.region || normalizeText(item.getAttribute('data-region')) === selected.region;
        const matchYear = !selected.year || normalizeText(item.getAttribute('data-year')) === selected.year;
        const showItem = matchQuery && matchType && matchRegion && matchYear;
        item.classList.toggle('is-hidden-by-filter', !showItem);
        if (showItem) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };
    if (input) {
      input.addEventListener('input', apply);
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) {
        input.value = q;
      }
    }
    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
    apply();
  });
}

function initMoviePlayer(streamUrl) {
  const video = document.getElementById('moviePlayer');
  const cover = document.querySelector('.player-cover');
  if (!video || !cover || !streamUrl) {
    return;
  }
  let started = false;
  let hlsInstance = null;
  const begin = function () {
    if (started) {
      video.play().catch(function () {});
      return;
    }
    started = true;
    cover.classList.add('is-hidden');
    video.controls = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
    video.play().catch(function () {});
  };
  cover.addEventListener('click', begin);
  video.addEventListener('click', function () {
    if (!started) {
      begin();
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

window.initMoviePlayer = initMoviePlayer;
document.addEventListener('DOMContentLoaded', function () {
  initMenu();
  initHero();
  initFilters();
});
