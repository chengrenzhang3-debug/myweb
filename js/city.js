(() => {
  const back = document.querySelector("#city-back");
  const source = new URLSearchParams(location.search).get("from");
  const mobileMap = "mobile/mobile_index.html#map";
  if (source === mobileMap || /^(?:[2-7])?index\.html\?page=2$/.test(source || "")) back.href = source;
  else if (matchMedia("(max-width: 820px), (hover: none) and (pointer: coarse)").matches) back.href = mobileMap;

  const stage = document.querySelector(".city-stage");
  const slides = [...stage.querySelectorAll(".city-slide")];
  const navigation = [...document.querySelectorAll(".city-header a[href$=gameplay]")];
  const prev = document.querySelector("#city-previous");
  const next = document.querySelector("#city-next");
  const select = document.querySelector("#city-page");
  const position = document.querySelector("#city-position");
  let index = -1;
  let lastWheel = -Infinity;
  let gesture;

  const dialog = document.querySelector("#city-rule");
  const ruleTitle = document.querySelector("#city-rule-title");
  const ruleBody = document.querySelector("#city-rule-body");
  const ruleLinks = dialog.querySelector(".city-rule-links");

  function place(element, rect) {
    ["--x", "--y", "--w", "--h"].forEach((property, i) => element.style.setProperty(property, rect[i] + "%"));
  }

  function boardRect([left, top, right, bottom]) {
    return [left / 9, top * 100 / 506, (right - left) / 9, (bottom - top) * 100 / 506];
  }

  for (const board of stage.querySelectorAll(".city-board")) {
    const slide = board.dataset.slide;
    const coordinates = cityLayerGeometry[slide] || {};
    for (const layer of board.querySelectorAll("[data-layer]")) place(layer, coordinates[layer.dataset.layer]);
    const spots = board.querySelectorAll(".city-hotspot");
    for (const [i, spot] of [...spots].entries()) {
      const [id, rect, floating] = cityRules.hotspots[slide][i];
      place(spot, typeof rect === "string" ? coordinates[rect] : boardRect(rect));
      spot.addEventListener("click", () => showRule(id));
      if (floating || typeof rect === "string") {
        const layer = board.querySelector('[data-layer="' + (floating || rect) + '"]');
        spot.addEventListener("pointerenter", () => layer.classList.add("is-highlighted"));
        spot.addEventListener("pointerleave", () => layer.classList.remove("is-highlighted"));
        spot.addEventListener("focus", () => layer.classList.add("is-highlighted"));
        spot.addEventListener("blur", () => layer.classList.remove("is-highlighted"));
      }
    }
  }

  function ruleButton(id) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = cityRules.rules[id].title;
    button.addEventListener("click", () => showRule(id));
    return button;
  }

  const search = dialog.querySelector(".city-rule-search");
  const query = search.querySelector("input");
  const results = search.querySelector("#city-search-results");
  query.addEventListener("input", () => {
    const terms = query.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    results.replaceChildren();
    if (!terms.length) return;
    const matches = Object.entries(cityRules.rules).filter(([, rule]) => {
      const text = [rule.title, ...rule.paras].join(" ").toLowerCase();
      return terms.every(term => text.includes(term));
    });
    if (matches.length) results.replaceChildren(...matches.map(([id]) => ruleButton(id)));
    else results.textContent = "没有找到匹配的规则。";
  });

  function showRule(id) {
    const rule = cityRules.rules[id];
    ruleTitle.textContent = rule.title;
    ruleBody.replaceChildren(...rule.paras.map(text => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      return paragraph;
    }));
    ruleLinks.replaceChildren(...rule.links.map(ruleButton));
    if (!dialog.open) dialog.showModal();
    else dialog.querySelector("form button").focus();
    dialog.scrollTop = 0;
  }
  dialog.addEventListener("click", event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });

  const canvas = document.querySelector("#city-particles");
  const context = canvas.getContext("2d");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const motes = Array.from({length: 19}, () => ({
    x: Math.random(), y: Math.random(), speed: 5 + Math.random() * 12, radius: .7 + Math.random() * 1.3
  }));
  let particleFrame = 0;
  let width = 1;
  let height = 1;
  let previousFrame = 0;
  function resizeParticles() {
    const size = stage.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio, 2);
    width = size.width;
    height = size.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function paintParticles(now) {
    const dt = previousFrame ? Math.min(50, now - previousFrame) / 1000 : 0;
    previousFrame = now;
    context.clearRect(0, 0, width, height);
    for (const [i, mote] of motes.entries()) {
      mote.y = (mote.y - dt * mote.speed / height + 1) % 1;
      const alpha = .16 + .15 * Math.sin(now / 1900 + i);
      context.fillStyle = i % 4 === 0 ? "rgba(255,108,76," + alpha + ")" : "rgba(255,217,173," + alpha + ")";
      context.beginPath();
      context.arc(mote.x * width + 7 * Math.sin(now / 2300 + i), mote.y * height, mote.radius, 0, Math.PI * 2);
      context.fill();
    }
    particleFrame = requestAnimationFrame(paintParticles);
  }
  function updateParticles() {
    if (particleFrame) cancelAnimationFrame(particleFrame);
    particleFrame = 0;
    previousFrame = 0;
    resizeParticles();
    if (context && index > 0 && index < slides.length - 1 && !reduced.matches) {
      particleFrame = requestAnimationFrame(paintParticles);
    }
  }
  reduced.addEventListener("change", updateParticles);

  function open(nextIndex, { record = true, focus = false } = {}) {
    const slide = slides[nextIndex];
    if (!slide || nextIndex === index) return;
    if (index >= 0) slides[index].querySelector("video")?.pause();
    slide.style.setProperty("--travel", nextIndex > index ? "18px" : "-18px");
    for (const section of slides) {
      section.hidden = section !== slide;
      section.classList.toggle("entering", section === slide);
    }
    index = nextIndex;
    slide.scrollTop = 0;
    prev.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    select.value = slide.id;
    position.value = (index + 1) + " / " + slides.length;
    for (const link of navigation) {
      const current = index === slides.length - 1;
      if (current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
    if (record && location.hash !== "#" + slide.id) history.pushState(null, "", "#" + slide.id);
    updateParticles();
    if (focus) slide.querySelector("h1, h2").focus({ preventScroll: true });
  }

  function readLocation() {
    const found = slides.findIndex(slide => "#" + slide.id === location.hash);
    open(Math.max(0, found), { record: false });
  }
  readLocation();
  window.addEventListener("hashchange", readLocation);
  window.addEventListener("popstate", readLocation);
  prev.addEventListener("click", () => open(index - 1, { focus: true }));
  next.addEventListener("click", () => open(index + 1, { focus: true }));
  select.addEventListener("change", () => open(slides.findIndex(slide => slide.id === select.value)));
  for (const link of navigation) {
    link.addEventListener("click", event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      open(slides.findIndex(slide => "#" + slide.id === link.hash), { focus: event.detail === 0 });
    });
  }

  function atEdge(direction) {
    const slide = slides[index];
    return direction < 0 ? slide.scrollTop <= 2 : slide.scrollTop + slide.clientHeight >= slide.scrollHeight - 2;
  }
  stage.addEventListener("wheel", event => {
    if (dialog.open || event.ctrlKey || document.fullscreenElement || event.target.closest("video") || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    const fresh = performance.now() - lastWheel > 145;
    lastWheel = performance.now();
    const direction = Math.sign(event.deltaY);
    if (!atEdge(direction)) return;
    event.preventDefault();
    if (fresh) open(index + direction);
  }, { passive: false });
  window.addEventListener("keydown", event => {
    if (dialog.open || event.altKey || event.metaKey || event.ctrlKey || document.fullscreenElement ||
        event.target.closest("video, button, select, a")) return;
    if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
      if (!event.repeat) open(index + (event.key === "ArrowRight" ? 1 : -1), { focus: true });
    } else if (["PageUp", "PageDown", "ArrowUp", "ArrowDown"].includes(event.key)) {
      const direction = ["PageDown", "ArrowDown"].includes(event.key) ? 1 : -1;
      if (atEdge(direction)) {
        event.preventDefault();
        if (!event.repeat) open(index + direction, { focus: true });
      } else {
        event.preventDefault();
        slides[index].scrollBy(0, direction * (event.key.startsWith("Page") ? slides[index].clientHeight * .85 : 56));
      }
    }
  });
  stage.addEventListener("touchstart", event => {
    gesture = null;
    if (dialog.open || event.touches.length !== 1 || event.target.closest("video") || document.fullscreenElement) return;
    const point = event.touches[0];
    gesture = { x: point.clientX, y: point.clientY, up: atEdge(-1), down: atEdge(1) };
  }, { passive: true });
  stage.addEventListener("touchend", event => {
    const start = gesture;
    gesture = null;
    if (!start || event.touches.length) return;
    const point = event.changedTouches[0];
    const dx = start.x - point.clientX, dy = start.y - point.clientY;
    if (Math.abs(dx) > 58 && Math.abs(dx) > 1.25 * Math.abs(dy)) open(index + Math.sign(dx));
    else if (Math.abs(dy) > 58 && Math.abs(dy) > 1.25 * Math.abs(dx) && (dy > 0 ? start.down : start.up)) open(index + Math.sign(dy));
  }, { passive: true });
  stage.addEventListener("touchcancel", () => { gesture = null; });
  addEventListener("resize", resizeParticles);
})();
