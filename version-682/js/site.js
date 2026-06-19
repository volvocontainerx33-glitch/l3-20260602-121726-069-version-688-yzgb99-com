(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var navLinks = document.querySelector('.nav-links');

    if (menuButton && navLinks) {
      menuButton.addEventListener('click', function () {
        var isOpen = navLinks.classList.toggle('open');
        menuButton.setAttribute('aria-expanded', String(isOpen));
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));

    if (slides.length > 1) {
      var current = 0;

      function showSlide(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          showSlide(index);
        });
      });

      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var searchInput = document.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

    if (searchInput && cards.length) {
      var params = new URLSearchParams(window.location.search);
      var queryValue = params.get('q');

      if (queryValue) {
        searchInput.value = queryValue;
      }

      function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
      }

      function filterCards() {
        var keyword = normalize(searchInput.value);
        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-year')
          ].join(' ');
          card.hidden = keyword.length > 0 && normalize(text).indexOf(keyword) === -1;
        });
      }

      searchInput.addEventListener('input', filterCards);
      filterCards();
    }
  });
}());
