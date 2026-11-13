(() => {
  const back = document.querySelector("#portfolioBack");
  const sources = new Set(
    ["index", "2index", "3index", "4index", "5index", "6index", "7index"]
      .map((name) => name + ".html?page=2")
      .concat("mobile/mobile_index.html#map")
  );
  const from = new URLSearchParams(location.search).get("from");
  if (sources.has(from)) back.href = from;
  else if (matchMedia("(max-width: 820px), (hover: none) and (pointer: coarse)").matches) {
    back.href = "mobile/mobile_index.html#map";
  }

  const stage = document.querySelector(".case-stage");
  const screens = Array.from(stage.querySelectorAll(".case-screen"));
  const tabs = Array.from(document.querySelectorAll(".case-nav nav a"));
  const previous = document.querySelector("#previousScreen");
  const next = document.querySelector("#nextScreen");
  let active = -1;
  let lastWheel = -Infinity;
  let touch;

  function getTarget(hash) {
    try { return document.getElementById(decodeURIComponent(hash.slice(1))); }
    catch { return null; }
  }

  function show(index, hash = "", focus = false) {
    if (index < 0 || index >= screens.length) return;
    const target = getTarget(hash);
    if (active !== index) {
      if (active >= 0) screens[active].querySelector("video")?.pause();
      active = index;
      screens.forEach((screen, i) => { screen.hidden = i !== index; });
      tabs.forEach((tab, i) => {
        if (i === index) tab.setAttribute("aria-current", "step");
        else tab.removeAttribute("aria-current");
      });
      previous.disabled = index === 0;
      next.disabled = index === screens.length - 1;
    }
    const screen = screens[index];
    if (target && target !== screen && screen.contains(target)) {
      screen.scrollTop += target.getBoundingClientRect().top - screen.getBoundingClientRect().top - 20;
    } else if (hash) {
      screen.scrollTop = 0;
    }
    if (focus || stage.contains(document.activeElement) && !screen.contains(document.activeElement)) {
      screen.querySelector("h1, h2").focus({ preventScroll: true });
    }
  }

  function syncFromHash() {
    const target = getTarget(location.hash);
    const index = screens.indexOf(target?.closest(".case-screen"));
    show(index < 0 ? 0 : index, location.hash || "#cover");
  }

  function open(index, hash = "", focus = false) {
    if (!screens[index]) return;
    const destination = hash || "#" + screens[index].id;
    if (location.hash !== destination) history.pushState(null, "", destination);
    show(index, destination, focus);
  }

  document.body.classList.add("paged-case");
  syncFromHash();
  window.addEventListener("hashchange", syncFromHash);
  window.addEventListener("popstate", syncFromHash);

  document.addEventListener("click", (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute("href");
    const index = screens.indexOf(getTarget(hash)?.closest(".case-screen"));
    if (index < 0) return;
    event.preventDefault();
    open(index, hash, event.detail === 0);
  });
  previous.addEventListener("click", () => open(active - 1, "", true));
  next.addEventListener("click", () => open(active + 1, "", true));

  function atEdge(direction) {
    const screen = screens[active];
    return direction < 0 ? screen.scrollTop <= 2 :
      screen.scrollTop + screen.clientHeight >= screen.scrollHeight - 2;
  }

  window.addEventListener("wheel", (event) => {
    if (event.ctrlKey || document.fullscreenElement || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    const fresh = performance.now() - lastWheel > 145;
    lastWheel = performance.now();
    const direction = Math.sign(event.deltaY);
    if (!atEdge(direction)) return;
    event.preventDefault();
    if (fresh) open(active + direction);
  }, { passive: false });

  window.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || document.fullscreenElement ||
        event.target.closest("video, a, button, input, textarea, select, [contenteditable]")) return;
    const direction = ["ArrowDown", "PageDown"].includes(event.key) ? 1 :
      ["ArrowUp", "PageUp"].includes(event.key) ? -1 : 0;
    if (!direction) return;
    event.preventDefault();
    if (atEdge(direction)) {
      if (!event.repeat) open(active + direction, "", true);
    } else {
      screens[active].scrollBy(0, direction * (event.key.startsWith("Page") ? screens[active].clientHeight * .88 : 64));
    }
  });

  stage.addEventListener("touchstart", (event) => {
    touch = null;
    if (event.touches.length !== 1 || event.target.closest("video, a, button") || document.fullscreenElement) return;
    const point = event.touches[0];
    touch = { x: point.clientX, y: point.clientY, up: atEdge(-1), down: atEdge(1) };
  }, { passive: true });
  stage.addEventListener("touchend", (event) => {
    const start = touch;
    touch = null;
    if (!start || event.touches.length) return;
    const point = event.changedTouches[0];
    const distance = start.y - point.clientY;
    if (Math.abs(distance) < 55 || Math.abs(distance) < Math.abs(point.clientX - start.x) * 1.25) return;
    if (distance > 0 && start.down) open(active + 1);
    if (distance < 0 && start.up) open(active - 1);
  }, { passive: true });
  stage.addEventListener("touchcancel", () => { touch = null; });
})();
