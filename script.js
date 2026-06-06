const cursor = document.querySelector(".cursor");
const pages = document.querySelectorAll(".page");
const flash = document.querySelector(".flip-flash");
const movingItems = document.querySelectorAll(".shape, .dots, .comic-panel, .big-mark, .project-visual");

let currentPage = 0;
let isTurning = false;

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

  if (currentPage === 2) {
    moveBoat(event.deltaY > 0 ? 1 : -1);
    return;
  }

  if (event.deltaY > 0) nextPage();
  else prevPage();
}, { passive: false });

window.addEventListener("keydown", function (event) {
  const key = event.key.toLowerCase();

  if (currentPage === 2 && (key === "a" || key === "arrowleft")) {
    moveBoat(-1);
    return;
  }

  if (currentPage === 2 && (key === "d" || key === "arrowright")) {
    moveBoat(1);
    return;
  }

  if (key === "arrowdown" || key === " " || key === "arrowright") nextPage();
  if (key === "arrowup" || key === "arrowleft") prevPage();
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
const mapProgressText = document.querySelector("#mapProgressText");
const mapProgressBar = document.querySelector("#mapProgressBar");
const islands = document.querySelectorAll(".island");

let boatX = 420;
let boatFrame = 0;
const boatMin = 320;
const boatMax = 3360;

function moveBoat(direction) {
  if (!riverWorld || !boatWrap || !boatSprite) return;

  boatFrame = boatFrame === 0 ? 1 : 0;
  boatX += direction * 120;
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

  updateBoatMap();
}

function updateBoatMap() {
  if (!riverWorld || !boatWrap) return;

  const viewport = document.querySelector(".river-viewport");
  const viewWidth = viewport ? viewport.clientWidth : window.innerWidth;
  const worldWidth = riverWorld.clientWidth || 3600;

  boatWrap.style.left = boatX + "px";

  let translate = viewWidth / 2 - boatX;
  translate = Math.min(0, Math.max(viewWidth - worldWidth, translate));
  riverWorld.style.transform = `translateX(${translate}px)`;

  const progress = Math.round(((boatX - boatMin) / (boatMax - boatMin)) * 100);
  if (mapProgressText) mapProgressText.textContent = String(progress).padStart(2, "0") + "%";
  if (mapProgressBar) mapProgressBar.style.width = progress + "%";

  islands.forEach(function (island) {
    const left = parseFloat(getComputedStyle(island).left);
    if (Math.abs(left - boatX) < 220) island.classList.add("near");
    else island.classList.remove("near");
  });
}

window.addEventListener("resize", updateBoatMap);
updateBoatMap();

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
