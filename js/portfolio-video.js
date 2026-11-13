(() => {
  const playlistType = "application/vnd.apple.mpegurl";
  const observer = new IntersectionObserver((entries) => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue;
      observer.unobserve(target);
      loadVideo(target);
    }
  });

  function loadVideo(video) {
    const playlist = video.dataset.playlist;
    const status = video.parentElement.querySelector("[data-video-status]");
    const showError = (message) => {
      status.textContent = message;
      status.hidden = false;
    };

    video.addEventListener("error", () => showError("视频加载失败，请刷新页面后重试。"));

    if (window.Hls?.isSupported()) {
      const player = new window.Hls({ maxBufferLength: 20, maxMaxBufferLength: 40 });
      player.on(window.Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) showError("视频加载失败，请刷新页面后重试。");
      });
      player.loadSource(playlist);
      player.attachMedia(video);
    } else if (video.canPlayType(playlistType)) {
      video.src = playlist;
    } else {
      showError("当前浏览器无法播放该视频，请使用较新版本的浏览器。");
    }
  }

  document.querySelectorAll("video[data-playlist]").forEach((video) => observer.observe(video));
})();
