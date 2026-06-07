(function () {
  var DESKTOP_TO_MOBILE = {
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

  var MOBILE_TO_DESKTOP = {
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
  if (params.get("forceMobile") === "1" || params.get("desktop") === "1") return;

  var coarse = window.matchMedia && window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  var narrow = window.matchMedia && window.matchMedia("(max-width: 820px)").matches;
  var isMobile = Boolean(coarse || narrow);

  var path = window.location.pathname;
  var file = path.split("/").pop() || "index.html";
  var query = window.location.search || "";
  var hash = window.location.hash || "";

  if (isMobile && DESKTOP_TO_MOBILE[file] && !/\/mobile\//.test(path)) {
    var rootBase = path.slice(0, path.length - file.length);
    window.location.replace(rootBase + DESKTOP_TO_MOBILE[file] + query + hash);
    return;
  }

  if (!isMobile && MOBILE_TO_DESKTOP[file] && /\/mobile\//.test(path)) {
    var siteRoot = path.slice(0, path.indexOf("/mobile/") + 1);
    window.location.replace(siteRoot + MOBILE_TO_DESKTOP[file] + query + hash);
  }
})();
