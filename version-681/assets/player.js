(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function initPlayer(shell) {
        var video = shell.querySelector('video');
        var overlay = shell.querySelector('.play-overlay');
        var stream = video ? video.getAttribute('data-stream') : '';
        var loaded = false;
        var hls = null;

        if (!video || !overlay || !stream) {
            return;
        }

        function attachStream() {
            if (loaded) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
                video._hlsInstance = hls;
            } else {
                video.src = stream;
            }
            loaded = true;
        }

        function play() {
            attachStream();
            video.controls = true;
            overlay.classList.add('is-hidden');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            }
        }

        overlay.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });
        video.addEventListener('ended', function () {
            overlay.classList.remove('is-hidden');
        });
    }

    ready(function () {
        Array.prototype.slice.call(document.querySelectorAll('.video-player')).forEach(initPlayer);
    });
})();
