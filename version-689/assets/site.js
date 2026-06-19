(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-nav]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var nextButton = hero.querySelector('[data-hero-next]');
        var prevButton = hero.querySelector('[data-hero-prev]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function initSearchPanels() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-search-panel]'));
        panels.forEach(function (panel) {
            var input = panel.querySelector('[data-search-input]');
            var yearFilter = panel.querySelector('[data-year-filter]');
            var scope = panel.parentElement || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
            var emptyState = scope.querySelector('[data-empty-state]');

            function filterCards() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var year = yearFilter ? yearFilter.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-category'),
                        card.getAttribute('data-tags'),
                        card.getAttribute('data-year')
                    ].join(' ').toLowerCase();
                    var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchYear = !year || card.getAttribute('data-year') === year;
                    var shouldShow = matchKeyword && matchYear;
                    card.style.display = shouldShow ? '' : 'none';
                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (emptyState) {
                    emptyState.classList.toggle('visible', visible === 0);
                }
            }

            if (input) {
                input.addEventListener('input', filterCards);
            }
            if (yearFilter) {
                yearFilter.addEventListener('change', filterCards);
            }
        });
    }

    function initPlayer() {
        var video = document.querySelector('[data-hls-video]');
        var trigger = document.querySelector('[data-player-trigger]');
        var status = document.querySelector('[data-player-status]');
        if (!video || !trigger) {
            return;
        }
        var source = video.getAttribute('data-video-src');
        var hlsInstance = null;
        var attached = false;

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function attachSource() {
            if (attached || !source) {
                return Promise.resolve();
            }
            attached = true;
            setStatus('正在加载播放源...');

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus('播放源加载完成。');
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
                    if (data && data.fatal) {
                        setStatus('播放遇到错误，正在尝试恢复。');
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hlsInstance.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hlsInstance.recoverMediaError();
                        }
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                setStatus('浏览器原生 HLS 播放已启用。');
            } else {
                video.src = source;
                setStatus('已尝试直接加载播放源。');
            }
            return Promise.resolve();
        }

        function playVideo() {
            attachSource().then(function () {
                return video.play();
            }).then(function () {
                trigger.classList.add('hidden');
                setStatus('正在播放。');
            }).catch(function () {
                setStatus('浏览器阻止自动播放，请再次点击视频控件播放。');
            });
        }

        trigger.addEventListener('click', playVideo);
        video.addEventListener('play', function () {
            trigger.classList.add('hidden');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                trigger.classList.remove('hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initSearchPanels();
        initPlayer();
    });
}());
