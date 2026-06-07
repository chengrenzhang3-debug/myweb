(function () {
  "use strict";

  var params = new URLSearchParams(window.location.search || "");
  if (params.has("desktop") || params.get("view") === "desktop") return;

  var desktopToMobile = {
    "": "mobile/mobile_index.html",
    "index.html": "mobile/mobile_index.html",
    "children-water.html": "mobile/mobile_children-water.html",
    "polar-rover.html": "mobile/mobile_polar-rover.html",
    "polar_rover_hmi_demo.html": "mobile/mobile_polar_rover_hmi_demo.html",
    "ai-home.html": "mobile/mobile_ai-home.html",
    "astory.html": "mobile/mobile_astory.html",
    "UIUX.html": "mobile/mobile_UIUX.html",
    "projects.html": "mobile/mobile_projects.html",
    "experiments.html": "mobile/mobile_experiments.html"
  };

  var path = window.location.pathname || "/";
  var file = path.split("/").pop() || "";
  var isAlreadyMobile = path.indexOf("/mobile/") !== -1 || /^mobile_/.test(file);
  var coarse = window.matchMedia && window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  var narrow = window.matchMedia && window.matchMedia("(max-width: 820px)").matches;
  var mobileUA = /Android|iPhone|iPod|IEMobile|BlackBerry|Mobile/i.test(navigator.userAgent || "");
  var isMobile = narrow || coarse || mobileUA;

  if (!isMobile || isAlreadyMobile) return;
  if (!Object.prototype.hasOwnProperty.call(desktopToMobile, file)) return;

  var base = path.slice(0, path.length - file.length);
  var target = base + desktopToMobile[file] + (window.location.search || "") + (window.location.hash || "");
  if (target !== window.location.href) window.location.replace(target);
})();
