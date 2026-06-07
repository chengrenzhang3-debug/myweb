(function () {
  "use strict";

  var desktopToMobile = {
    "": "mobile/mobile_index.html",
    "index.html": "mobile/mobile_index.html",
    "index(2).html": "mobile/mobile_index.html",
    "children-water.html": "mobile/mobile_children-water.html",
    "polar-rover.html": "mobile/mobile_polar-rover.html",
    "polar-rover(1).html": "mobile/mobile_polar-rover.html",
    "polar_rover_hmi_demo.html": "mobile/mobile_polar_rover_hmi_demo.html",
    "ai-home.html": "mobile/mobile_ai-home.html",
    "ai-home(2).html": "mobile/mobile_ai-home.html",
    "astory.html": "mobile/mobile_astory.html",
    "UIUX.html": "mobile/mobile_UIUX.html",
    "projects.html": "mobile/mobile_projects.html",
    "projects(1).html": "mobile/mobile_projects.html",
    "experiments.html": "mobile/mobile_experiments.html"
  };

  var mobileToDesktop = {
    "mobile_index.html": "index.html",
    "mobile_children-water.html": "children-water.html",
    "mobile_polar-rover.html": "polar-rover.html",
    "mobile_polar_rover_hmi_demo.html": "polar_rover_hmi_demo.html",
    "mobile_ai-home.html": "ai-home.html",
    "mobile_astory.html": "astory.html",
    "mobile_UIUX.html": "UIUX.html",
    "mobile_projects.html": "projects.html",
    "mobile_experiments.html": "experiments.html"
  };

  var params = new URLSearchParams(window.location.search);
  if (params.get("view") === "desktop" || params.get("view") === "mobile") return;

  var coarseTouch = window.matchMedia && window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  var narrowScreen = window.matchMedia && window.matchMedia("(max-width: 820px)").matches;
  var isMobile = !!(coarseTouch || narrowScreen);

  var path = window.location.pathname;
  var parts = path.split("/");
  var file = parts.pop() || "";
  var base = parts.join("/") + "/";
  var query = window.location.search || "";
  var hash = window.location.hash || "";
  var inMobileFolder = /\/mobile\/$/.test(base);

  if (isMobile && !inMobileFolder && desktopToMobile[file] !== undefined) {
    var target = base + desktopToMobile[file] + query + hash;
    if (target !== path + query + hash) window.location.replace(target);
    return;
  }

  if (!isMobile && inMobileFolder && mobileToDesktop[file]) {
    var rootBase = base.replace(/\/mobile\/$/, "/");
    var desktopTarget = rootBase + mobileToDesktop[file] + query + hash;
    if (desktopTarget !== path + query + hash) window.location.replace(desktopTarget);
  }
})();
