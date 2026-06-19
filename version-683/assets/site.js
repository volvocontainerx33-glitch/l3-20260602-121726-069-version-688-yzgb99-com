(function () {
  var menu = document.querySelector('.menu-toggle');
  var links = document.querySelector('.nav-links');
  if (menu && links) {
    menu.addEventListener('click', function () {
      links.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  if (slides.length > 1) {
    var active = 0;
    var show = function (next) {
      active = (next + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle('active', index === active);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('active', index === active);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    setInterval(function () {
      show(active + 1);
    }, 5200);
  }

  var filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    var keyword = document.querySelector('[data-filter-keyword]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var empty = document.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('.movie-card'));
    var apply = function () {
      var q = keyword ? keyword.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var shown = 0;
      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.tags, card.dataset.category].join(' ').toLowerCase();
        var ok = true;
        if (q && text.indexOf(q) === -1) ok = false;
        if (type && card.dataset.type.indexOf(type) === -1) ok = false;
        if (year && card.dataset.year !== year) ok = false;
        if (region && card.dataset.region.indexOf(region) === -1) ok = false;
        card.classList.toggle('hidden-card', !ok);
        if (ok) shown += 1;
      });
      if (empty) empty.classList.toggle('show', shown === 0);
    };
    [keyword, typeSelect, yearSelect, regionSelect].forEach(function (control) {
      if (control) control.addEventListener('input', apply);
      if (control) control.addEventListener('change', apply);
    });
  }
})();

function initMoviePlayer(videoId, sourceUrl, overlayId) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  if (!video) return;
  var loaded = false;
  var load = function () {
    if (loaded) return;
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  };
  var start = function () {
    load();
    if (overlay) overlay.classList.add('hidden');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  };
  if (overlay) overlay.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener('play', function () {
    if (overlay) overlay.classList.add('hidden');
  });
}
