(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = qs('.js-menu-toggle');
    var nav = qs('.js-mobile-nav');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupCoverFallbacks() {
    qsa('.js-cover-image').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-hidden');
        var fallback = image.nextElementSibling;
        if (fallback) {
          fallback.classList.add('is-visible');
        }
      });
    });
  }

  function setupHeroSlider() {
    var slider = qs('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = qsa('[data-hero-slide]', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupCardFilters() {
    var list = qs('.js-card-list');
    if (!list) {
      return;
    }
    var root = list.parentElement || document;
    var searchInput = qs('.js-card-search', root);
    var yearSelect = qs('.js-card-year', root);
    var cards = qsa('.movie-card', list);

    function filterCards() {
      var query = normalize(searchInput ? searchInput.value : '');
      var year = yearSelect ? yearSelect.value : '';
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category')
        ].join(' '));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        card.classList.toggle('is-filter-hidden', !(matchQuery && matchYear));
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', filterCards);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', filterCards);
    }
  }

  function createSearchCard(movie) {
    return [
      '<article class="movie-card">',
      '  <a class="movie-card-cover" href="' + movie.url + '">',
      '    <div class="poster-shell">',
      '      <img class="poster-image js-cover-image" src="' + movie.cover + '" alt="' + movie.title + ' 封面" loading="lazy">',
      '      <div class="poster-fallback">' + movie.coverIndex + '</div>',
      '    </div>',
      '    <span class="movie-year">' + movie.yearText + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta-line"><a href="' + movie.categoryUrl + '">' + movie.category + '</a><span>' + movie.region + '</span></div>',
      '    <h3><a href="' + movie.url + '">' + movie.title + '</a></h3>',
      '    <p>' + movie.oneLine + '</p>',
      '    <div class="tag-row"><span>' + movie.type + '</span><span>' + movie.genre + '</span></div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function setupSearchPage() {
    var input = qs('#site-search-input');
    var button = qs('#site-search-button');
    var category = qs('#site-search-category');
    var year = qs('#site-search-year');
    var resultBox = qs('#search-results');
    var resultCount = qs('#search-result-count');
    var data = window.MOVIE_SEARCH_DATA || [];

    if (!input || !button || !resultBox || !resultCount || !data.length) {
      return;
    }

    function render() {
      var query = normalize(input.value);
      var categoryValue = category ? category.value : '';
      var yearValue = year ? year.value : '';
      var results = data.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.yearText,
          movie.genre,
          movie.tags,
          movie.category,
          movie.oneLine
        ].join(' '));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchCategory = !categoryValue || movie.category === categoryValue;
        var matchYear = !yearValue || String(movie.year) === yearValue;
        return matchQuery && matchCategory && matchYear;
      }).slice(0, 120);

      resultCount.textContent = '共找到 ' + results.length + ' 条结果，最多显示前 120 条。';
      resultBox.innerHTML = results.map(createSearchCard).join('');
      setupCoverFallbacks();
    }

    button.addEventListener('click', render);
    input.addEventListener('input', render);
    if (category) {
      category.addEventListener('change', render);
    }
    if (year) {
      year.addEventListener('change', render);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupCoverFallbacks();
    setupHeroSlider();
    setupCardFilters();
    setupSearchPage();
  });
})();
