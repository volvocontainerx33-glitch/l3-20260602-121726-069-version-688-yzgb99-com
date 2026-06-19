(function () {
  function setupPlayer(player) {
    var button = player.querySelector('.js-player-start');
    var video = player.querySelector('.js-video');
    var message = player.querySelector('.js-player-message');
    var source = player.getAttribute('data-video-src');
    var hlsInstance = null;

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function play() {
      if (!video || !source) {
        setMessage('未找到可用播放源。');
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.play().catch(function () {
          setMessage('浏览器阻止了自动播放，请再次点击视频控件。');
        });
        setMessage('正在使用浏览器原生 HLS 播放。');
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            setMessage('播放源已载入，请点击视频控件继续播放。');
          });
          setMessage('播放源已载入。');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
            setMessage('网络波动，正在重新加载播放源。');
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
            setMessage('媒体解码异常，正在尝试恢复。');
          } else {
            hlsInstance.destroy();
            setMessage('播放失败，请稍后重试。');
          }
        });
        return;
      }

      video.src = source;
      setMessage('当前浏览器未加载 HLS 组件，可尝试使用支持 HLS 的浏览器。');
    }

    if (button) {
      button.addEventListener('click', play);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('.js-player')).forEach(setupPlayer);
  });
})();
