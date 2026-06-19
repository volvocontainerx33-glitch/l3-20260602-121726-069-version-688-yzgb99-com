(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        initMobileNav();
        initHero();
        initFilters();
        initPlayers();
    });

    function initMobileNav() {
        var toggle = document.querySelector('.mobile-toggle');
        var nav = document.querySelector('.mobile-nav');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        var prev = document.querySelector('.hero-prev');
        var next = document.querySelector('.hero-next');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function initFilters() {
        var grids = Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid]'));
        if (!grids.length) {
            return;
        }
        var search = document.querySelector('.page-search');
        var year = document.querySelector('.year-filter');
        var type = document.querySelector('.type-filter');
        var empty = document.querySelector('.empty-state');

        function apply() {
            var query = search ? search.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value : '';
            var typeValue = type ? type.value : '';
            var visible = 0;

            grids.forEach(function (grid) {
                Array.prototype.slice.call(grid.querySelectorAll('.movie-card')).forEach(function (card) {
                    var haystack = card.getAttribute('data-search') || '';
                    var cardYear = card.getAttribute('data-year') || '';
                    var cardType = card.getAttribute('data-type') || '';
                    var matchQuery = !query || haystack.indexOf(query) !== -1;
                    var matchYear = !yearValue || cardYear === yearValue;
                    var matchType = !typeValue || cardType.indexOf(typeValue) !== -1;
                    var ok = matchQuery && matchYear && matchType;
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [search, year, type].forEach(function (el) {
            if (el) {
                el.addEventListener('input', apply);
                el.addEventListener('change', apply);
            }
        });
        apply();
    }

    function initPlayers() {
        Array.prototype.slice.call(document.querySelectorAll('.player-frame')).forEach(function (frame) {
            var video = frame.querySelector('video');
            var button = frame.querySelector('.play-overlay');
            var stream = frame.getAttribute('data-stream');
            var attached = false;
            var hls = null;
            if (!video || !stream) {
                return;
            }

            function attach() {
                if (attached) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        maxBufferLength: 30,
                        enableWorker: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
                attached = true;
            }

            function play() {
                attach();
                frame.classList.add('is-playing');
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener('click', play);
            }
            video.addEventListener('click', function () {
                if (!attached || video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                frame.classList.add('is-playing');
            });
            window.addEventListener('pagehide', function () {
                if (hls && typeof hls.destroy === 'function') {
                    hls.destroy();
                }
            });
        });
    }
})();
