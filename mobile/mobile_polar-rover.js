const stage = document.querySelector("#polarStage");
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");
const edgeReturnHint = document.querySelector("#edgeReturnHint");
const edgeReturnText = document.querySelector("#edgeReturnText");
const edgeReturnBar = document.querySelector("#edgeReturnBar");
const cards = Array.from(document.querySelectorAll(".polar-card"));

let x = 0;
let edgeScrollPower = 0;
let rafId = null;
let hintTimer = null;
const EDGE_RETURN_THRESHOLD = 1900;

function maxX() {
  return Math.max(0, stage.scrollWidth - window.innerWidth);
}

function revealCards() {
  const leftEdge = x - 260;
  const rightEdge = x + window.innerWidth + 260;

  cards.forEach(function(card) {
    if (card.classList.contains("is-visible")) return;

    const left = parseFloat(card.style.left || "0");
    const width = card.offsetWidth || 650;

    if (left + width > leftEdge && left < rightEdge) {
      card.classList.add("is-visible");
    }
  });
}

function update() {
  const max = maxX();
  x = Math.max(0, Math.min(max, x));
  stage.style.transform = `translate3d(${-x}px, 0, 0)`;

  const progress = max ? Math.round((x / max) * 100) : 0;
  progressText.textContent = String(progress).padStart(2, "0") + "%";
  progressBar.style.width = progress + "%";

  revealCards();
  rafId = null;
}

function requestUpdate() {
  if (!rafId) {
    rafId = requestAnimationFrame(update);
  }
}

function showEdgeHint(directionText) {
  const percent = Math.min(100, Math.round((edgeScrollPower / EDGE_RETURN_THRESHOLD) * 100));

  edgeReturnHint.classList.add("show");
  edgeReturnText.textContent = directionText + "，继续滚动返回划船地图";
  edgeReturnBar.style.width = percent + "%";

  clearTimeout(hintTimer);
  hintTimer = setTimeout(function () {
    edgeReturnHint.classList.remove("show");
    edgeScrollPower = 0;
    edgeReturnBar.style.width = "0%";
  }, 950);
}

function returnToMapIfReady() {
  if (edgeScrollPower >= EDGE_RETURN_THRESHOLD) {
    window.location.href = "index.html?page=2";
  }
}

function hideEdgeHint() {
  edgeScrollPower = 0;
  if (edgeReturnHint) {
    edgeReturnHint.classList.remove("show");
    edgeReturnBar.style.width = "0%";
  }
}

window.addEventListener("wheel", function(event) {
  event.preventDefault();

  const max = maxX();
  const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
  const goingRight = delta > 0;
  const goingLeft = delta < 0;

  if (x <= 0 && goingLeft) {
    edgeScrollPower += Math.abs(delta);
    showEdgeHint("已经到最左边");
    returnToMapIfReady();
    return;
  }

  if (x >= max - 2 && goingRight) {
    edgeScrollPower += Math.abs(delta);
    showEdgeHint("已经到最右边");
    returnToMapIfReady();
    return;
  }

  hideEdgeHint();
  x += delta * 1.12;
  requestUpdate();
}, { passive:false });

window.addEventListener("keydown", function(event) {
  if (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === " ") {
    x += 260;
    hideEdgeHint();
    requestUpdate();
  }

  if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    x -= 260;
    hideEdgeHint();
    requestUpdate();
  }
});

window.addEventListener("resize", requestUpdate);

(function initMotionLayer() {
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const snow = document.createElement("div");
  snow.className = "motion-snow";
  snow.setAttribute("aria-hidden", "true");
  document.body.appendChild(snow);
})();

update();


(function(){
  var mq=window.matchMedia('(max-width:820px),(hover:none) and (pointer:coarse)');
  if(!mq.matches) return;
  document.addEventListener('DOMContentLoaded',function(){
    if(stage) stage.style.transform='none';
    function readProgress(){
      var max=document.documentElement.scrollHeight-window.innerHeight;
      var p=max?Math.round(window.scrollY/max*100):0;
      if(progressText) progressText.textContent=String(p).padStart(2,'0')+'%';
      if(progressBar) progressBar.style.width=p+'%';
      cards.forEach(function(card){card.classList.add('is-visible')});
    }
    window.addEventListener('scroll',readProgress,{passive:true});readProgress();
  });
})();
