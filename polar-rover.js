const stage = document.querySelector("#polarStage");
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");
const edgeReturnHint = document.querySelector("#edgeReturnHint");
const edgeReturnText = document.querySelector("#edgeReturnText");
const edgeReturnBar = document.querySelector("#edgeReturnBar");

let x = 0;
let edgeScrollPower = 0;
const EDGE_RETURN_THRESHOLD = 1900;

function maxX() {
  return Math.max(0, stage.scrollWidth - window.innerWidth);
}

function update() {
  const max = maxX();
  x = Math.max(0, Math.min(max, x));
  stage.style.transform = `translateX(${-x}px)`;

  const progress = max ? Math.round((x / max) * 100) : 0;
  progressText.textContent = String(progress).padStart(2, "0") + "%";
  progressBar.style.width = progress + "%";
}

function showEdgeHint(directionText) {
  const percent = Math.min(100, Math.round((edgeScrollPower / EDGE_RETURN_THRESHOLD) * 100));

  edgeReturnHint.classList.add("show");
  edgeReturnText.textContent = directionText + "，继续滚动返回划船地图";
  edgeReturnBar.style.width = percent + "%";

  clearTimeout(showEdgeHint.timer);
  showEdgeHint.timer = setTimeout(function () {
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

window.addEventListener("wheel", function(event) {
  event.preventDefault();

  const max = maxX();
  const goingRight = event.deltaY > 0;
  const goingLeft = event.deltaY < 0;

  if (x <= 0 && goingLeft) {
    edgeScrollPower += Math.abs(event.deltaY);
    showEdgeHint("已经到最左边");
    returnToMapIfReady();
    return;
  }

  if (x >= max - 2 && goingRight) {
    edgeScrollPower += Math.abs(event.deltaY);
    showEdgeHint("已经到最右边");
    returnToMapIfReady();
    return;
  }

  edgeScrollPower = 0;
  if (edgeReturnHint) {
    edgeReturnHint.classList.remove("show");
    edgeReturnBar.style.width = "0%";
  }

  x += event.deltaY * 1.05;
  update();
}, { passive:false });

window.addEventListener("keydown", function(event) {
  if (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === " ") x += 240;
  if (event.key === "ArrowLeft" || event.key === "ArrowUp") x -= 240;
  edgeScrollPower = 0;
  update();
});

window.addEventListener("resize", update);
update();
