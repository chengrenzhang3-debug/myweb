const cursor = document.querySelector(".cursor");
const pages = document.querySelectorAll(".page");
const flash = document.querySelector(".flip-flash");
const movingItems = document.querySelectorAll(".shape, .dots, .comic-panel, .big-mark, .project-visual, .stage-hero, .stage-link, .quest-console, .quest-node");

let currentPage = 0;
let isTurning = false;

/* keep project return target tied to the current style */
const PORTFOLIO_RETURN_URL = "3index.html?page=2";

function withPortfolioReturn(url) {
  if (!url || url.startsWith("#") || url.startsWith("http") || url.startsWith("mailto:") || url.startsWith("tel:")) return url;
  if (url.includes("from=")) return url;
  const separator = url.includes("?") ? "&" : "?";
  return url + separator + "from=" + encodeURIComponent(PORTFOLIO_RETURN_URL);
}

document.querySelectorAll('.quick-index > a[href]').forEach(function (link) {
  const href = link.getAttribute("href");
  const projectPages = ["polar-rover.html","children-water.html","ai-home.html","astory.html","UIUX.html","projects.html","experiments.html"];
  if (projectPages.some(function (page) { return href && href.indexOf(page) === 0; })) {
    link.setAttribute("href", withPortfolioReturn(href));
  }
});


function showFlash(targetPage) {
  flash.classList.remove("active", "resume-special");
  void flash.offsetWidth;

  if (
    (currentPage === 0 && targetPage === 1) ||
    (currentPage === 1 && targetPage === 0)
  ) {
    flash.classList.add("resume-special");
  }

  flash.classList.add("active");
}

function switchPageInstantly(targetPage, direction) {
  pages.forEach(function (page) { page.classList.add("no-motion"); });

  pages.forEach(function (page, index) {
    page.classList.remove("active", "go-left", "go-right");
    if (index === currentPage) page.classList.add(direction === "next" ? "go-left" : "go-right");
    if (index === targetPage) page.classList.add("active");
  });

  void document.body.offsetWidth;
  pages.forEach(function (page) { page.classList.remove("no-motion"); });
  currentPage = targetPage;
}

function goToPage(targetPage) {
  if (isTurning) return;
  if (targetPage < 0 || targetPage >= pages.length) return;
  if (targetPage === currentPage) return;

  isTurning = true;
  const direction = targetPage > currentPage ? "next" : "prev";
  const specialResume = (currentPage === 0 && targetPage === 1) || (currentPage === 1 && targetPage === 0);

  showFlash(targetPage);

  setTimeout(function () { switchPageInstantly(targetPage, direction); }, specialResume ? 520 : 430);
  setTimeout(function () { isTurning = false; }, specialResume ? 1220 : 1100);
}

function nextPage() { goToPage(currentPage + 1); }
function prevPage() { goToPage(currentPage - 1); }

window.addEventListener("wheel", function (event) {
  if (event.target.closest(".quick-index")) return;
  event.preventDefault();

  if (event.deltaY > 0) nextPage();
  else prevPage();
}, { passive: false });

window.addEventListener("keydown", function (event) {
  const key = event.key.toLowerCase();

  if (key === "arrowdown" || key === " " || key === "pagedown" || key === "arrowright" || key === "d") nextPage();
  if (key === "arrowup" || key === "pageup" || key === "arrowleft" || key === "a") prevPage();
});

document.querySelectorAll("[data-page]").forEach(function (button) {
  button.addEventListener("click", function (event) {
    event.preventDefault();
    const target = Number(button.dataset.page);
    goToPage(target);
  });
});

window.addEventListener("mousemove", function (event) {
  if (!cursor) return;
  const x = event.clientX;
  const y = event.clientY;
  cursor.style.left = x + "px";
  cursor.style.top = y + "px";

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const moveX = (x - centerX) / centerX;
  const moveY = (y - centerY) / centerY;

  movingItems.forEach(function (item, index) {
    const speed = (index + 1) * 2.2;
    item.style.translate = `${moveX * speed}px ${moveY * speed}px`;
  });
});

document.querySelectorAll("button, a").forEach(function (item) {
  item.addEventListener("mouseenter", function () {
    if (cursor) cursor.style.transform = "translate(-50%, -50%) scale(2.3)";
  });
  item.addEventListener("mouseleave", function () {
    if (cursor) cursor.style.transform = "translate(-50%, -50%) scale(1)";
  });
});

/* page 03 project entry cards */
function enterStageProject(link, event) {
  if (!link) return;
  const url = withPortfolioReturn(link.getAttribute("href"));
  if (!url || url.startsWith("#")) return;
  event.preventDefault();

  const title = link.dataset.title || link.textContent.trim() || "ENTER";
  const type = link.dataset.project || "other";

  if (window.portfolioComicNavigate) {
    window.portfolioComicNavigate(url, {
      title: title,
      type: type,
      sub: "ENTER PROJECT"
    });
    return;
  }

  try {
    sessionStorage.setItem("portfolioLoadingTransition", JSON.stringify({
      title: title,
      type: type,
      sub: "ENTER PROJECT",
      phase: "reveal",
      createdAt: Date.now()
    }));
  } catch (error) {}

  window.location.href = url;
}

document.querySelectorAll(".stage-link").forEach(function (link) {
  link.addEventListener("click", function (event) {
    enterStageProject(link, event);
  });
});


/* open a specific page from URL, e.g. index.html?page=2 */
(function openPageFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const target = Number(params.get("page"));

  if (!Number.isFinite(target) || target < 0 || target >= pages.length) return;

  pages.forEach(function (page, index) {
    page.classList.add("no-motion");
    page.classList.remove("active", "go-left", "go-right");
    if (index === target) page.classList.add("active");
  });

  void document.body.offsetWidth;
  pages.forEach(function (page) { page.classList.remove("no-motion"); });
  currentPage = target;
})();

/* Boat map */
const riverWorld = document.querySelector("#riverWorld");
const boatWrap = document.querySelector("#boatWrap");
const boatSprite = document.querySelector("#boatSprite");
const boatSpeech = document.querySelector("#boatSpeech");
const mapProgressText = document.querySelector("#mapProgressText");
const mapProgressBar = document.querySelector("#mapProgressBar");
const islands = document.querySelectorAll(".island");
const islandEnterFlash = document.querySelector("#islandEnterFlash");
const enterTitle = document.querySelector("#enterTitle");

let boatX = 420;
let boatFrame = 0;
const boatMin = 320;
const boatMax = 6100;
let lastBoatSpeech = 0;
let enteringIsland = false;
let boatEdgeIntent = 0;

const boatLines = [
  "这片海怎么越划越长？算了，挺适合放作品。",
  "按 D 往右，按 A 往左。别问，船就是这么开的。",
  "前面好像有个岛，应该不是 bug。",
  "如果看见岛，点它；如果没看见，继续划。",
  "别急，后面还有岛。",
  "船可以慢，但作品得有风格。",
  "这个地图比普通目录有意思一点。",
  "我负责划船，你负责别把路径写错。"
];

const islandLines = {
  child: ["儿童饮水岛，风格要可爱一点。", "企鹅在等你。", "这里不是科技发布会，是儿童产品。"],
  polar: ["前面有点冷，是极地房车 HMI。", "HMI 项目到了，记得看横向叙事。"],
  astory: ["Astory 岛，像打开一份故事档案。", "每个选择都应该有后果。"],
  aihome: ["AI Home 岛，控制台味儿很浓。", "别让大模型直接开空调。"],
  uiux: ["UIUX 岛，新增的，不是替换更多实验。", "交互演示到了。"],
  other: ["其他项目岛，后面可以继续加东西。", "这里先作为更多作品入口。"],
  experiments: ["更多实验岛还在，没被删。", "实验区，危险但好玩。"]
};

function randomLine(list) {
  return list[Math.floor(Math.random() * list.length)];
}


function handleBoatPageWheel(deltaY) {
  const dir = deltaY > 0 ? 1 : -1;
  const atRightEdge = typeof boatX === "number" && boatX >= boatMax - 4;
  const atLeftEdge = typeof boatX === "number" && boatX <= boatMin + 4;

  if ((dir > 0 && atRightEdge) || (dir < 0 && atLeftEdge)) {
    boatEdgeIntent += Math.min(240, Math.abs(deltaY));
    if (boatEdgeIntent > 620) {
      boatEdgeIntent = 0;
      goToPage(dir > 0 ? 3 : 1);
      return;
    }
    showBoatSpeech(dir > 0 ? "再往右划一点，就进入工作方式。" : "再往左划一点，就回到简历。");
    return;
  }

  boatEdgeIntent = 0;
  moveBoat(dir);
}

function showBoatSpeech(text) {
  if (!boatSpeech) return;
  boatSpeech.textContent = text;
  boatSpeech.classList.add("show");
  clearTimeout(showBoatSpeech.timer);
  showBoatSpeech.timer = setTimeout(function () {
    boatSpeech.classList.remove("show");
  }, 2600);
}

function maybeBoatTalk(force, type) {
  const now = Date.now();
  if (!force && now - lastBoatSpeech < 5200) return;
  lastBoatSpeech = now;
  const lines = type && islandLines[type] ? islandLines[type] : boatLines;
  showBoatSpeech(randomLine(lines));
}

function moveBoat(direction) {
  if (!riverWorld || !boatWrap || !boatSprite || enteringIsland) return;

  boatFrame = boatFrame === 0 ? 1 : 0;
  boatX += direction * 140;
  boatX = Math.max(boatMin, Math.min(boatMax, boatX));

  const sprite = direction > 0
    ? `assets/boat_right_${boatFrame + 1}.png`
    : `assets/boat_left_${boatFrame + 1}.png`;

  boatSprite.src = sprite;
  boatWrap.classList.add("rowing");
  clearTimeout(moveBoat.timer);
  moveBoat.timer = setTimeout(function () {
    boatWrap.classList.remove("rowing");
    boatSprite.src = "assets/boat_idle.png";
  }, 240);

  maybeBoatTalk(false);
  updateBoatMap();
}

function updateBoatMap() {
  if (!riverWorld || !boatWrap) return;

  const viewport = document.querySelector(".river-viewport");
  const viewWidth = viewport ? viewport.clientWidth : window.innerWidth;
  const worldWidth = riverWorld.clientWidth || 6600;

  boatWrap.style.left = boatX + "px";

  let translate = viewWidth / 2 - boatX;
  translate = Math.min(0, Math.max(viewWidth - worldWidth, translate));
  riverWorld.style.transform = `translateX(${translate}px)`;

  const progress = Math.round(((boatX - boatMin) / (boatMax - boatMin)) * 100);
  if (mapProgressText) mapProgressText.textContent = String(progress).padStart(2, "0") + "%";
  if (mapProgressBar) mapProgressBar.style.width = progress + "%";

  islands.forEach(function (island) {
    const left = parseFloat(getComputedStyle(island).left);
    const near = Math.abs(left - boatX) < 230;
    island.classList.toggle("near", near);
    if (near && Math.random() > 0.94) maybeBoatTalk(false, island.dataset.project);
  });
}

function enterIsland(island, event) {
  if (enteringIsland) return;
  event.preventDefault();

  const url = island.getAttribute("href");
  const title = island.dataset.title || island.textContent.trim() || "ENTER";
  const type = island.dataset.project || "other";

  enteringIsland = true;
  island.classList.add("entering");
  maybeBoatTalk(true, type);

  /*
    v6: 遮板式页面切换。
    先在当前页面播放“遮板盖住屏幕”的进入动画；
    屏幕被遮住后再跳转；
    新页面加载后由 loading-transition.js 继续播放同一块遮板的退场动画。
    这样用户看到的是：动画发生 → 动画结束 → 新页面已经在眼前。
  */
  if (window.portfolioComicNavigate) {
    window.portfolioComicNavigate(url, {
      title: title,
      type: type,
      sub: "ENTER PROJECT"
    });
    return;
  }

  try {
    sessionStorage.setItem("portfolioLoadingTransition", JSON.stringify({
      title: title,
      type: type,
      sub: "ENTER PROJECT",
      phase: "reveal",
      createdAt: Date.now()
    }));
  } catch (error) {}

  window.location.href = url;
}

if (boatWrap) {
  boatWrap.addEventListener("click", function () {
    maybeBoatTalk(true);
  });
}

islands.forEach(function (island) {
  island.addEventListener("click", function (event) {
    enterIsland(island, event);
  });
});

window.addEventListener("resize", updateBoatMap);
updateBoatMap();
setTimeout(function () {
  showBoatSpeech("按 A / D 划船，看到岛就点。");
}, 500);
setTimeout(function () {
  showBoatSpeech("第四个岛后面是 UIUX，再往后是其他项目和更多实验。");
}, 3600);

/* focus interaction for resume page modules */
const resumeBoard = document.querySelector("#resume .resume-board");
const resumeModules = document.querySelectorAll("#resume .resume-about, #resume .education-card, #resume .methods-card, #resume .skills-card");

if (resumeBoard && resumeModules.length) {
  resumeModules.forEach(function (module) {
    module.classList.add("resume-module");
    module.addEventListener("mouseenter", function () {
      resumeBoard.classList.add("focus-mode");
      resumeModules.forEach(function (item) {
        item.classList.remove("module-active", "module-dim");
        item.classList.add(item === module ? "module-active" : "module-dim");
      });
    });
    module.addEventListener("mouseleave", function () {
      resumeBoard.classList.remove("focus-mode");
      resumeModules.forEach(function (item) {
        item.classList.remove("module-active", "module-dim");
      });
    });
  });
}


/* ===== style variant helper ===== */
(function () {
  const bodyClass = document.body.className || "";
  document.querySelectorAll(".style-switcher a").forEach(function (a) {
    if (a.getAttribute("href") === location.pathname.split("/").pop()) {
      a.classList.add("active-style");
    }
  });
})();
