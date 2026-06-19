(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            current = index;
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

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide((current + 1) % slides.length);
            }, 5200);
        }
    }

    var filterForm = document.querySelector('[data-filter-form]');
    var filterInput = document.querySelector('[data-filter-input]');
    var filterType = document.querySelector('[data-filter-type]');
    var filterStatus = document.querySelector('[data-filter-status]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

    if (filterForm && filterInput && cards.length) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        filterInput.value = initialQuery;

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function cardText(card) {
            return [
                card.getAttribute('data-title'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-category')
            ].join(' ').toLowerCase();
        }

        function applyFilter() {
            var query = normalize(filterInput.value);
            var type = filterType ? normalize(filterType.value) : '';
            var hasVisibleCard = false;

            cards.forEach(function (card) {
                var matchesQuery = !query || cardText(card).indexOf(query) !== -1;
                var matchesType = !type || normalize(card.getAttribute('data-type')).indexOf(type) !== -1;
                var visible = matchesQuery && matchesType;

                card.classList.toggle('is-hidden-by-filter', !visible);
                hasVisibleCard = hasVisibleCard || visible;
            });

            if (filterStatus) {
                filterStatus.textContent = hasVisibleCard ? '筛选结果已更新。' : '没有匹配内容，请更换关键词。';
            }
        }

        filterForm.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilter();
        });

        filterInput.addEventListener('input', applyFilter);

        if (filterType) {
            filterType.addEventListener('change', applyFilter);
        }

        applyFilter();
    }
})();

function initPlayer(streamUrl) {
    var player = document.querySelector('[data-player]');

    if (!player) {
        return;
    }

    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var isReady = false;
    var hlsInstance = null;

    function attachStream() {
        if (isReady || !video) {
            return;
        }

        isReady = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = streamUrl;
    }

    function playVideo() {
        attachStream();

        if (cover) {
            cover.classList.add('is-hidden');
        }

        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
        if (cover) {
            cover.classList.add('is-hidden');
        }
    });

    video.addEventListener('click', function () {
        attachStream();
    });

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
