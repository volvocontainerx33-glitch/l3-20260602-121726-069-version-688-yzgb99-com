(function () {
    function initMoviePlayer(source) {
        var video = document.querySelector(".video-player");
        var shell = document.querySelector(".video-shell");
        var actions = Array.prototype.slice.call(document.querySelectorAll(".poster-action, .play-action"));
        var message = document.querySelector(".player-message");
        var loaded = false;
        var hls = null;

        function showMessage(text) {
            if (!message) {
                return;
            }
            message.textContent = text;
            message.hidden = false;
        }

        function attachSource() {
            if (!video || loaded) {
                return;
            }

            loaded = true;

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showMessage("视频暂时无法播放");
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else {
                showMessage("视频暂时无法播放");
            }
        }

        function playVideo() {
            if (!video) {
                return;
            }

            attachSource();

            if (shell) {
                shell.classList.add("is-playing");
            }

            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    if (shell) {
                        shell.classList.remove("is-playing");
                    }
                });
            }
        }

        actions.forEach(function (action) {
            action.addEventListener("click", function (event) {
                event.preventDefault();
                playVideo();
            });
        });

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    playVideo();
                } else {
                    video.pause();
                }
            });

            video.addEventListener("play", function () {
                if (shell) {
                    shell.classList.add("is-playing");
                }
            });

            video.addEventListener("pause", function () {
                if (shell) {
                    shell.classList.remove("is-playing");
                }
            });

            video.addEventListener("error", function () {
                showMessage("视频暂时无法播放");
            });
        }

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
