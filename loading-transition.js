(function () {
  const STORAGE_KEY = "portfolioLoadingTransition";
  const COVER_MS = 820;
  const REVEAL_MS = 1180;

  function cleanType(value) {
    return String(value || "other").replace(/[^a-z0-9_-]/gi, "").toLowerCase() || "other";
  }

  function inferTypeFromUrl(url) {
    const lower = String(url || "").toLowerCase();
    if (lower.includes("children") || lower.includes("water")) return "child";
    if (lower.includes("polar")) return "polar";
    if (lower.includes("astory")) return "astory";
    if (lower.includes("ai_home") || lower.includes("aihome")) return "aihome";
    if (lower.includes("uiux")) return "uiux";
    if (lower.includes("project")) return "other";
    if (lower.includes("experiment")) return "experiments";
    if (lower.includes("index")) return "map";
    return "other";
  }

  function inferTitleFromUrl(url) {
    const type = inferTypeFromUrl(url);
    const map = {
      child: "儿童智能饮水",
      polar: "极地房车 HMI",
      astory: "ASTORY",
      aihome: "AI 智能家居",
      uiux: "UI/UX 交互演示",
      other: "其他项目",
      experiments: "更多实验",
      map: "划船地图"
    };
    return map[type] || "LOADING";
  }

  function ensureStyle() {
    if (document.querySelector("style[data-portfolio-loading-transition-v2]")) return;

    const style = document.createElement("style");
    style.setAttribute("data-portfolio-loading-transition-v2", "true");
    style.textContent = `
      .portfolio-transition-v2 {
        position: fixed;
        inset: 0;
        z-index: 2147483000;
        pointer-events: auto;
        overflow: hidden;
        opacity: 1;
        font-family: Impact, "Arial Black", "Microsoft YaHei", system-ui, sans-serif;
        background: transparent;
      }

      .portfolio-transition-v2 * { box-sizing: border-box; }

      .pt-title {
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 40;
        transform: translate(-50%, -50%);
        width: min(850px, 84vw);
        text-align: center;
        line-height: .92;
        font-weight: 1000;
        font-size: clamp(34px, 6.4vw, 92px);
        letter-spacing: -.055em;
        opacity: 0;
        pointer-events: none;
      }

      .pt-sub {
        position: absolute;
        left: 50%;
        top: calc(50% + 92px);
        z-index: 42;
        transform: translate(-50%, 12px);
        padding: 8px 18px;
        border: 4px solid #090909;
        background: #090909;
        color: #fff0b8;
        font-size: 13px;
        font-weight: 1000;
        letter-spacing: .23em;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
      }

      .pt-grain {
        position: absolute;
        inset: 0;
        z-index: 90;
        opacity: .18;
        pointer-events: none;
        background-image: radial-gradient(rgba(0,0,0,.42) 1px, transparent 1.6px);
        background-size: 5px 5px;
        mix-blend-mode: multiply;
      }

      .pt-blocker {
        position: absolute;
        inset: 0;
        z-index: 1;
        opacity: 0;
        pointer-events: auto;
      }

      .is-reveal .pt-blocker { opacity: 1; }

      /* ---------------- CHILD: 童趣水泡，不再是几何体拼贴 ---------------- */
      .is-child .pt-blocker {
        background: linear-gradient(180deg, #aeeaff 0%, #63c9ff 52%, #74d8f1 100%);
      }

      .is-child .kid-water {
        position: absolute;
        left: -8vw;
        right: -8vw;
        bottom: -18vh;
        z-index: 8;
        height: 122vh;
        border-radius: 48% 52% 0 0 / 16% 18% 0 0;
        background:
          radial-gradient(circle at 18% 24%, rgba(255,255,255,.9) 0 16px, transparent 17px),
          radial-gradient(circle at 63% 18%, rgba(255,255,255,.78) 0 11px, transparent 12px),
          radial-gradient(circle at 82% 42%, rgba(255,255,255,.65) 0 20px, transparent 21px),
          linear-gradient(180deg, #bff3ff, #63cdf4 54%, #46b6e2);
        box-shadow: 0 -12px 0 #090909 inset;
        transform: translateY(118%);
      }

      .is-child .kid-float {
        position: absolute;
        z-index: 14;
        width: 86px;
        height: 86px;
        border: 5px solid #090909;
        border-radius: 45% 55% 52% 48%;
        background: #fff7c9;
        box-shadow: 8px 8px 0 rgba(0,0,0,.28);
        opacity: 0;
      }
      .is-child .kid-float:nth-child(1) { left: 12vw; top: 18vh; background:#fff0b8; }
      .is-child .kid-float:nth-child(2) { right: 14vw; top: 28vh; width:64px; height:64px; background:#ff9fb6; }
      .is-child .kid-float:nth-child(3) { left: 66vw; bottom: 18vh; width:70px; height:70px; background:#f7df59; }

      .is-child .pt-title {
        padding: 18px 30px;
        color: #163b61;
        background: #fff7c9;
        border: 7px solid #090909;
        border-radius: 34px;
        box-shadow: 12px 12px 0 #ff8eb0;
        text-shadow: 4px 4px 0 #7ee0ff;
        transform: translate(-50%, -50%) scale(.72) rotate(-5deg);
      }

      .is-child.is-covering .kid-water { animation: kidWaterIn .74s cubic-bezier(.18,.9,.18,1) forwards; }
      .is-child.is-covering .kid-float { animation: kidFloatIn .62s ease forwards; }
      .is-child.is-covering .kid-float:nth-child(2) { animation-delay: .08s; }
      .is-child.is-covering .kid-float:nth-child(3) { animation-delay: .16s; }
      .is-child.is-covering .pt-blocker { animation: ptStepVisible .82s steps(1,end) forwards; }
      .is-child.is-covering .pt-title { animation: kidTitleIn .62s ease forwards; }
      .is-child.is-covering .pt-sub { animation: ptSubIn .62s ease forwards; }

      .is-child.is-reveal .kid-water { transform: translateY(0); }
      .is-child.is-reveal .kid-float { opacity: 1; }
      .is-child.is-reveal .pt-title { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(-2deg); }
      .is-child.is-reveal .pt-sub { opacity: 1; transform: translate(-50%, 0); }
      .is-child.is-reveal.is-leaving .kid-water { animation: kidWaterOut .9s cubic-bezier(.2,.7,.1,1) forwards; }
      .is-child.is-reveal.is-leaving .kid-float { animation: kidFloatOut .8s ease forwards; }
      .is-child.is-reveal.is-leaving .pt-title { animation: kidTitleOut .62s ease forwards; }
      .is-child.is-reveal.is-leaving .pt-sub { animation: ptSubOut .45s ease forwards; }
      .is-child.is-reveal.is-leaving { animation: ptFadeNone 1.04s ease forwards; }

      /* ---------------- ASTORY: 中世纪浪漫，幕布/羊皮纸/蜡封 ---------------- */
      .is-astory {
        background: #120c08;
      }
      .is-astory .pt-blocker {
        background:
          radial-gradient(circle at 50% 36%, rgba(255,230,168,.12), transparent 28%),
          linear-gradient(180deg, #25140c, #0c0705);
      }
      .is-astory .astory-curtain {
        position: absolute;
        top: 0;
        bottom: 0;
        z-index: 10;
        width: 58vw;
        background:
          repeating-linear-gradient(90deg, rgba(255,255,255,.07) 0 8px, transparent 9px 28px),
          linear-gradient(90deg, #351015, #6b1524 45%, #250910);
        border: 6px solid #050505;
        box-shadow: inset 0 0 44px rgba(0,0,0,.55);
      }
      .is-astory .curtain-left { left: 0; transform: translateX(-105%); border-right-width: 10px; }
      .is-astory .curtain-right { right: 0; transform: translateX(105%); border-left-width: 10px; }
      .is-astory .parchment {
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 22;
        width: min(720px, 76vw);
        min-height: 350px;
        transform: translate(-50%, -50%) scaleY(.05) rotate(-2deg);
        transform-origin: top center;
        opacity: 0;
        border: 6px solid #3b2312;
        box-shadow: 18px 18px 0 rgba(0,0,0,.5);
        background:
          linear-gradient(90deg, rgba(100,28,18,.16) 0 2px, transparent 2px 36px),
          radial-gradient(circle at 20% 16%, rgba(120,60,20,.18), transparent 18%),
          #ead8aa;
      }
      .is-astory .seal {
        position: absolute;
        left: calc(50% + min(290px, 30vw));
        top: calc(50% + 118px);
        z-index: 36;
        width: 84px;
        height: 84px;
        border-radius: 50%;
        border: 5px solid #270000;
        background: radial-gradient(circle, #d03131 0 48%, #891313 49% 100%);
        box-shadow: 8px 8px 0 rgba(0,0,0,.42);
        transform: scale(0) rotate(-20deg);
      }
      .is-astory .seal::after {
        content: "✦";
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        color: #ffd7a0;
        font-size: 38px;
      }
      .is-astory .petal {
        position: absolute;
        z-index: 32;
        width: 30px;
        height: 18px;
        background: #d83c55;
        border: 2px solid #2c0509;
        border-radius: 100% 0 100% 0;
        opacity: 0;
      }
      .is-astory .petal.p1 { left: 16vw; top: 18vh; }
      .is-astory .petal.p2 { right: 22vw; top: 22vh; transform: rotate(36deg); }
      .is-astory .petal.p3 { left: 70vw; top: 70vh; transform: rotate(-16deg); }
      .is-astory .pt-title {
        color: #2a160c;
        text-shadow: 2px 2px 0 rgba(120,0,0,.26);
        transform: translate(-50%, -50%) scale(.82);
      }
      .is-astory .pt-sub { color: #ead8aa; background: #2b1510; border-color: #c7a66f; }
      .is-astory.is-covering .curtain-left { animation: curtainLeftIn .64s cubic-bezier(.2,.8,.2,1) forwards; }
      .is-astory.is-covering .curtain-right { animation: curtainRightIn .64s cubic-bezier(.2,.8,.2,1) forwards; }
      .is-astory.is-covering .parchment { animation: parchmentOpen .72s .15s ease forwards; }
      .is-astory.is-covering .seal { animation: sealStamp .5s .48s cubic-bezier(.2,1.2,.3,1) forwards; }
      .is-astory.is-covering .petal { animation: petalFall .82s .22s ease forwards; }
      .is-astory.is-covering .pt-blocker { animation: ptStepVisible .82s steps(1,end) forwards; }
      .is-astory.is-covering .pt-title { animation: astoryTitleIn .76s .2s ease forwards; }
      .is-astory.is-covering .pt-sub { animation: ptSubIn .7s .2s ease forwards; }
      .is-astory.is-reveal .curtain-left { transform: translateX(0); }
      .is-astory.is-reveal .curtain-right { transform: translateX(0); }
      .is-astory.is-reveal .parchment { opacity: 1; transform: translate(-50%, -50%) scaleY(1) rotate(-2deg); }
      .is-astory.is-reveal .seal { transform: scale(1) rotate(-8deg); }
      .is-astory.is-reveal .pt-title { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      .is-astory.is-reveal .pt-sub { opacity: 1; transform: translate(-50%, 0); }
      .is-astory.is-reveal.is-leaving .curtain-left { animation: curtainLeftOut .92s ease forwards; }
      .is-astory.is-reveal.is-leaving .curtain-right { animation: curtainRightOut .92s ease forwards; }
      .is-astory.is-reveal.is-leaving .parchment { animation: parchmentFade .75s ease forwards; }
      .is-astory.is-reveal.is-leaving .pt-title { animation: astoryTitleOut .7s ease forwards; }
      .is-astory.is-reveal.is-leaving .pt-sub { animation: ptSubOut .45s ease forwards; }
      .is-astory.is-reveal.is-leaving { animation: ptFadeNone 1.05s ease forwards; }

      /* ---------------- UIUX: 极寒求生，冰封/裂痕/雪暴 ---------------- */
      .is-uiux .pt-blocker {
        background: linear-gradient(180deg, #ecfbff 0%, #86c9ee 48%, #1c4b72 100%);
      }
      .is-uiux .snowstorm {
        position: absolute;
        inset: -12%;
        z-index: 18;
        opacity: 0;
        background-image:
          radial-gradient(circle, rgba(255,255,255,.95) 0 2px, transparent 3px),
          radial-gradient(circle, rgba(255,255,255,.65) 0 1px, transparent 2px),
          linear-gradient(118deg, transparent 0 46%, rgba(255,255,255,.42) 48%, transparent 52%);
        background-size: 70px 70px, 38px 38px, 180px 80px;
        filter: blur(.2px);
      }
      .is-uiux .ice-wall {
        position: absolute;
        inset: 0;
        z-index: 12;
        opacity: 0;
        background:
          linear-gradient(125deg, transparent 0 18%, rgba(255,255,255,.78) 19% 20%, transparent 21% 42%, rgba(255,255,255,.55) 43% 44%, transparent 45%),
          linear-gradient(40deg, rgba(255,255,255,.35), transparent 45%),
          rgba(214,247,255,.78);
        backdrop-filter: blur(8px) saturate(1.4);
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
        transform: scale(1.08);
      }
      .is-uiux .warning-strip {
        position: absolute;
        left: 0;
        right: 0;
        top: 58%;
        z-index: 24;
        height: 78px;
        border: 5px solid #06111f;
        border-left: 0;
        border-right: 0;
        background: repeating-linear-gradient(135deg, #06111f 0 28px, #f6d643 29px 56px);
        transform: translateX(-105%);
        box-shadow: 0 10px 0 rgba(0,0,0,.35);
      }
      .is-uiux .pt-title {
        padding: 18px 30px;
        color: #eaffff;
        background: rgba(6,17,31,.88);
        border: 7px solid #d9fbff;
        box-shadow: 0 0 34px rgba(220,250,255,.55), 12px 12px 0 #06111f;
        text-shadow: 0 0 20px rgba(255,255,255,.66);
      }
      .is-uiux .pt-sub { background:#06111f; color:#d9fbff; border-color:#d9fbff; }
      .is-uiux.is-covering .ice-wall { animation: iceFreezeIn .7s cubic-bezier(.2,.9,.2,1) forwards; }
      .is-uiux.is-covering .snowstorm { animation: snowRushIn .75s linear forwards; }
      .is-uiux.is-covering .warning-strip { animation: warningSlideIn .58s .12s cubic-bezier(.2,.8,.2,1) forwards; }
      .is-uiux.is-covering .pt-blocker { animation: ptStepVisible .82s steps(1,end) forwards; }
      .is-uiux.is-covering .pt-title { animation: uiuxTitleIn .62s .22s ease forwards; }
      .is-uiux.is-covering .pt-sub { animation: ptSubIn .62s .24s ease forwards; }
      .is-uiux.is-reveal .ice-wall { opacity: 1; transform: scale(1); }
      .is-uiux.is-reveal .snowstorm { opacity: 1; }
      .is-uiux.is-reveal .warning-strip { transform: translateX(0); }
      .is-uiux.is-reveal .pt-title { opacity: 1; transform: translate(-50%, -50%); }
      .is-uiux.is-reveal .pt-sub { opacity: 1; transform: translate(-50%, 0); }
      .is-uiux.is-reveal.is-leaving .ice-wall { animation: iceCrackOut .95s cubic-bezier(.18,.8,.2,1) forwards; }
      .is-uiux.is-reveal.is-leaving .snowstorm { animation: snowFadeOut .95s ease forwards; }
      .is-uiux.is-reveal.is-leaving .warning-strip { animation: warningOut .64s ease forwards; }
      .is-uiux.is-reveal.is-leaving .pt-title { animation: uiuxTitleOut .7s ease forwards; }
      .is-uiux.is-reveal.is-leaving .pt-sub { animation: ptSubOut .45s ease forwards; }
      .is-uiux.is-reveal.is-leaving { animation: ptFadeNone 1.08s ease forwards; }

      /* ---------------- POLAR: 日漫冒险，速度线/爆框/白闪 ---------------- */
      .is-polar .pt-blocker {
        background: #f8fbff;
      }
      .is-polar .manga-flash {
        position: absolute;
        inset: 0;
        z-index: 10;
        opacity: 0;
        background:
          repeating-conic-gradient(from 0deg at 50% 50%, #06111f 0 3deg, transparent 3.5deg 7deg),
          radial-gradient(circle at 50% 50%, #fff 0 12%, rgba(255,255,255,.9) 28%, transparent 60%);
        mix-blend-mode: multiply;
      }
      .is-polar .anime-panel {
        position: absolute;
        z-index: 16;
        left: 50%;
        top: 50%;
        width: 92vw;
        height: 72vh;
        transform: translate(-50%, -50%) scale(.2) rotate(-8deg);
        border: 9px solid #06111f;
        background:
          linear-gradient(115deg, rgba(255,255,255,.96) 0 28%, rgba(185,233,255,.98) 29% 60%, rgba(70,154,224,.95) 61% 100%);
        box-shadow: 16px 16px 0 rgba(0,0,0,.62);
        opacity: 0;
        clip-path: polygon(4% 0, 100% 0, 96% 100%, 0 92%);
      }
      .is-polar .adventure-route {
        position: absolute;
        left: 10vw;
        right: 10vw;
        top: 64%;
        z-index: 20;
        height: 12px;
        border: 4px solid #06111f;
        background: repeating-linear-gradient(90deg, #ef3b2d 0 24px, #f6d643 25px 48px);
        transform: scaleX(0);
        transform-origin: left;
        box-shadow: 6px 6px 0 rgba(0,0,0,.35);
      }
      .is-polar .pt-title {
        color: #06111f;
        background: #fff;
        border: 8px solid #06111f;
        box-shadow: 12px 12px 0 #ef3b2d;
        text-shadow: 4px 4px 0 #aee8ff;
        padding: 18px 30px;
        transform: translate(-50%, -50%) rotate(-8deg) scale(.62);
      }
      .is-polar .pt-sub { color:#06111f; background:#f6d643; }
      .is-polar.is-covering .manga-flash { animation: mangaFlashIn .72s ease forwards; }
      .is-polar.is-covering .anime-panel { animation: animePanelIn .66s cubic-bezier(.2,1.1,.2,1) forwards; }
      .is-polar.is-covering .adventure-route { animation: routeDraw .58s .22s ease forwards; }
      .is-polar.is-covering .pt-blocker { animation: ptStepVisible .82s steps(1,end) forwards; }
      .is-polar.is-covering .pt-title { animation: polarTitleIn .58s .2s ease forwards; }
      .is-polar.is-covering .pt-sub { animation: ptSubIn .58s .24s ease forwards; }
      .is-polar.is-reveal .manga-flash { opacity: .65; }
      .is-polar.is-reveal .anime-panel { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(-2deg); }
      .is-polar.is-reveal .adventure-route { transform: scaleX(1); }
      .is-polar.is-reveal .pt-title { opacity: 1; transform: translate(-50%, -50%) rotate(-2deg) scale(1); }
      .is-polar.is-reveal .pt-sub { opacity: 1; transform: translate(-50%, 0); }
      .is-polar.is-reveal.is-leaving .manga-flash { animation: mangaFlashOut .78s ease forwards; }
      .is-polar.is-reveal.is-leaving .anime-panel { animation: animePanelOut .86s cubic-bezier(.2,.8,.1,1) forwards; }
      .is-polar.is-reveal.is-leaving .adventure-route { animation: routeOut .65s ease forwards; }
      .is-polar.is-reveal.is-leaving .pt-title { animation: polarTitleOut .64s ease forwards; }
      .is-polar.is-reveal.is-leaving .pt-sub { animation: ptSubOut .45s ease forwards; }
      .is-polar.is-reveal.is-leaving { animation: ptFadeNone 1.02s ease forwards; }

      /* ---------------- AI HOME: 未来 HUD，扫描/故障/矩阵 ---------------- */
      .is-aihome .pt-blocker {
        background: radial-gradient(circle at 50% 50%, #14263d 0%, #070b14 62%, #03050a 100%);
      }
      .is-aihome .hud-grid {
        position: absolute;
        inset: 0;
        z-index: 10;
        opacity: 0;
        background-image:
          linear-gradient(rgba(117,255,230,.18) 1px, transparent 1px),
          linear-gradient(90deg, rgba(117,255,230,.18) 1px, transparent 1px);
        background-size: 46px 46px;
      }
      .is-aihome .hud-ring {
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 18;
        width: min(520px, 64vw);
        aspect-ratio: 1;
        border-radius: 50%;
        border: 3px solid rgba(117,255,230,.78);
        box-shadow: 0 0 40px rgba(117,255,230,.28), inset 0 0 50px rgba(117,255,230,.14);
        transform: translate(-50%, -50%) scale(.24) rotate(0deg);
        opacity: 0;
      }
      .is-aihome .hud-ring::before,
      .is-aihome .hud-ring::after {
        content: "";
        position: absolute;
        inset: 13%;
        border-radius: 50%;
        border: 2px dashed rgba(105,210,255,.65);
      }
      .is-aihome .hud-ring::after { inset: 30%; border-style: solid; }
      .is-aihome .scan-beam {
        position: absolute;
        left: 0;
        right: 0;
        top: -20%;
        z-index: 22;
        height: 26%;
        background: linear-gradient(180deg, transparent, rgba(117,255,230,.36), transparent);
        opacity: 0;
      }
      .is-aihome .code-rain {
        position: absolute;
        inset: 0;
        z-index: 12;
        opacity: 0;
        background-image: linear-gradient(180deg, rgba(117,255,230,.32) 0 2px, transparent 3px 28px);
        background-size: 12px 28px;
        mask-image: repeating-linear-gradient(90deg, #000 0 1px, transparent 1px 18px);
      }
      .is-aihome .pt-title {
        color: #dffff8;
        text-shadow: 0 0 18px rgba(117,255,230,.65), 0 0 42px rgba(105,210,255,.35);
        transform: translate(-50%, -50%) scale(.9);
      }
      .is-aihome .pt-sub { color:#07111f; background:#75ffe6; border-color:#75ffe6; }
      .is-aihome.is-covering .hud-grid { animation: hudGridIn .62s ease forwards; }
      .is-aihome.is-covering .hud-ring { animation: hudRingIn .74s cubic-bezier(.2,1,.2,1) forwards; }
      .is-aihome.is-covering .scan-beam { animation: scanBeamIn .72s linear forwards; }
      .is-aihome.is-covering .code-rain { animation: codeRainIn .68s ease forwards; }
      .is-aihome.is-covering .pt-blocker { animation: ptStepVisible .82s steps(1,end) forwards; }
      .is-aihome.is-covering .pt-title { animation: aiTitleGlitchIn .7s .16s steps(2,end) forwards; }
      .is-aihome.is-covering .pt-sub { animation: ptSubIn .58s .24s ease forwards; }
      .is-aihome.is-reveal .hud-grid { opacity: 1; }
      .is-aihome.is-reveal .hud-ring { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(80deg); }
      .is-aihome.is-reveal .scan-beam { opacity: 1; transform: translateY(430%); }
      .is-aihome.is-reveal .code-rain { opacity: .48; }
      .is-aihome.is-reveal .pt-title { opacity: 1; }
      .is-aihome.is-reveal .pt-sub { opacity: 1; transform: translate(-50%, 0); }
      .is-aihome.is-reveal.is-leaving .hud-grid { animation: hudDissolve .88s ease forwards; }
      .is-aihome.is-reveal.is-leaving .hud-ring { animation: hudRingOut .82s ease forwards; }
      .is-aihome.is-reveal.is-leaving .scan-beam { animation: scanBeamOut .72s ease forwards; }
      .is-aihome.is-reveal.is-leaving .code-rain { animation: hudDissolve .8s ease forwards; }
      .is-aihome.is-reveal.is-leaving .pt-title { animation: aiTitleOut .64s steps(2,end) forwards; }
      .is-aihome.is-reveal.is-leaving .pt-sub { animation: ptSubOut .45s ease forwards; }
      .is-aihome.is-reveal.is-leaving { animation: ptFadeNone 1s ease forwards; }

      /* ---------------- MAP: 航海漫画，罗盘/羊皮海图 ---------------- */
      .is-map .pt-blocker {
        background: #ead8aa;
      }
      .is-map .map-scroll {
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 16;
        width: min(760px, 82vw);
        height: min(480px, 62vh);
        transform: translate(-50%, -50%) rotate(-4deg) scale(.2);
        background:
          radial-gradient(circle at 26% 34%, rgba(60,30,10,.12), transparent 22%),
          linear-gradient(90deg, rgba(120,50,20,.14) 0 2px, transparent 2px 34px),
          #ead8aa;
        border: 8px solid #090909;
        box-shadow: 18px 18px 0 rgba(0,0,0,.62);
        opacity: 0;
      }
      .is-map .compass {
        position: absolute;
        right: 10vw;
        top: 14vh;
        z-index: 24;
        width: 120px;
        height: 120px;
        border: 6px solid #090909;
        border-radius: 50%;
        background: #f6d643;
        box-shadow: 10px 10px 0 rgba(0,0,0,.45);
        transform: scale(0) rotate(-160deg);
      }
      .is-map .compass::after {
        content:"✦";
        position:absolute;
        inset:0;
        display:grid;
        place-items:center;
        font-size:64px;
        color:#d73925;
      }
      .is-map .pt-title { color:#111; text-shadow:4px 4px 0 #d73925; }
      .is-map.is-covering .map-scroll { animation: mapScrollIn .68s cubic-bezier(.2,1,.2,1) forwards; }
      .is-map.is-covering .compass { animation: compassIn .6s .18s cubic-bezier(.2,1.2,.2,1) forwards; }
      .is-map.is-covering .pt-blocker { animation: ptStepVisible .82s steps(1,end) forwards; }
      .is-map.is-covering .pt-title { animation: mapTitleIn .62s .18s ease forwards; }
      .is-map.is-covering .pt-sub { animation: ptSubIn .62s .22s ease forwards; }
      .is-map.is-reveal .map-scroll { opacity:1; transform:translate(-50%,-50%) rotate(-2deg) scale(1); }
      .is-map.is-reveal .compass { transform:scale(1) rotate(0deg); }
      .is-map.is-reveal .pt-title { opacity:1; transform:translate(-50%,-50%); }
      .is-map.is-reveal .pt-sub { opacity:1; transform:translate(-50%,0); }
      .is-map.is-reveal.is-leaving .map-scroll { animation: mapScrollOut .88s ease forwards; }
      .is-map.is-reveal.is-leaving .compass { animation: compassOut .72s ease forwards; }
      .is-map.is-reveal.is-leaving .pt-title { animation: mapTitleOut .62s ease forwards; }
      .is-map.is-reveal.is-leaving .pt-sub { animation: ptSubOut .45s ease forwards; }
      .is-map.is-reveal.is-leaving { animation: ptFadeNone 1.02s ease forwards; }

      /* ---------------- 其他/实验兜底：剪贴簿/实验爆炸，也避免几何拼贴 ---------------- */
      .is-other .pt-blocker { background:#222; }
      .is-other .scrap-card,
      .is-experiments .scrap-card {
        position:absolute;
        z-index:16;
        left:50%;
        top:50%;
        width:min(680px,80vw);
        height:min(420px,58vh);
        transform:translate(-50%,-50%) rotate(-7deg) scale(.2);
        opacity:0;
        border:7px solid #090909;
        box-shadow:16px 16px 0 rgba(0,0,0,.6);
        background:#f6d643;
      }
      .is-experiments .pt-blocker { background:#080808; }
      .is-experiments .scrap-card { background: radial-gradient(circle at 30% 28%, #fff06e 0 12%, transparent 13%), radial-gradient(circle at 70% 62%, #d73925 0 18%, transparent 19%), #111; }
      .is-other.is-covering .scrap-card,
      .is-experiments.is-covering .scrap-card { animation: scrapIn .68s ease forwards; }
      .is-other.is-covering .pt-blocker,
      .is-experiments.is-covering .pt-blocker { animation: ptStepVisible .82s steps(1,end) forwards; }
      .is-other.is-covering .pt-title,
      .is-experiments.is-covering .pt-title { animation: genericTitleIn .62s .18s ease forwards; }
      .is-other.is-covering .pt-sub,
      .is-experiments.is-covering .pt-sub { animation: ptSubIn .62s .22s ease forwards; }
      .is-other.is-reveal .scrap-card,
      .is-experiments.is-reveal .scrap-card { opacity:1; transform:translate(-50%,-50%) rotate(-2deg) scale(1); }
      .is-other.is-reveal .pt-title,
      .is-experiments.is-reveal .pt-title { opacity:1; transform:translate(-50%,-50%); color:#111; }
      .is-other.is-reveal .pt-sub,
      .is-experiments.is-reveal .pt-sub { opacity:1; transform:translate(-50%,0); }
      .is-other.is-reveal.is-leaving .scrap-card,
      .is-experiments.is-reveal.is-leaving .scrap-card { animation: scrapOut .8s ease forwards; }
      .is-other.is-reveal.is-leaving,
      .is-experiments.is-reveal.is-leaving { animation: ptFadeNone 1s ease forwards; }

      @keyframes ptStepVisible { 0%, 96% { opacity: 0; } 100% { opacity: 1; } }
      @keyframes ptSubIn { from { opacity: 0; transform: translate(-50%, 12px); } to { opacity: 1; transform: translate(-50%, 0); } }
      @keyframes ptSubOut { to { opacity: 0; transform: translate(-50%, -8px); } }
      @keyframes ptFadeNone { 0%, 70% { opacity: 1; } 100% { opacity: 0; visibility: hidden; } }

      @keyframes kidWaterIn { to { transform: translateY(0); } }
      @keyframes kidWaterOut { to { transform: translateY(118%); } }
      @keyframes kidFloatIn { from { opacity:0; transform: translateY(18px) rotate(-10deg) scale(.4); } to { opacity:1; transform: translateY(0) rotate(5deg) scale(1); } }
      @keyframes kidFloatOut { to { opacity:0; transform: translateY(-30px) rotate(20deg) scale(.7); } }
      @keyframes kidTitleIn { 0% { opacity:0; transform:translate(-50%,-50%) scale(.62) rotate(-12deg); } 70% { opacity:1; transform:translate(-50%,-50%) scale(1.08) rotate(3deg); } 100% { opacity:1; transform:translate(-50%,-50%) scale(1) rotate(-2deg); } }
      @keyframes kidTitleOut { to { opacity:0; transform:translate(-50%,-50%) scale(1.18) rotate(8deg); } }

      @keyframes curtainLeftIn { to { transform: translateX(0); } }
      @keyframes curtainRightIn { to { transform: translateX(0); } }
      @keyframes curtainLeftOut { to { transform: translateX(-105%); } }
      @keyframes curtainRightOut { to { transform: translateX(105%); } }
      @keyframes parchmentOpen { to { opacity:1; transform:translate(-50%,-50%) scaleY(1) rotate(-2deg); } }
      @keyframes parchmentFade { to { opacity:0; transform:translate(-50%,-50%) scaleY(.08) rotate(2deg); } }
      @keyframes sealStamp { 0%{transform:scale(0) rotate(-20deg);} 70%{transform:scale(1.18) rotate(4deg);} 100%{transform:scale(1) rotate(-8deg);} }
      @keyframes petalFall { to { opacity:1; transform: translateY(38px) rotate(80deg); } }
      @keyframes astoryTitleIn { to { opacity:1; transform:translate(-50%,-50%) scale(1); } }
      @keyframes astoryTitleOut { to { opacity:0; transform:translate(-50%,-50%) scale(.88); } }

      @keyframes iceFreezeIn { from { opacity:0; transform:scale(1.2); filter:blur(10px); } to { opacity:1; transform:scale(1); filter:blur(0); } }
      @keyframes snowRushIn { from { opacity:0; transform:translate3d(80px,-80px,0); } to { opacity:1; transform:translate3d(0,0,0); } }
      @keyframes warningSlideIn { to { transform: translateX(0); } }
      @keyframes uiuxTitleIn { from { opacity:0; transform:translate(-50%,-50%) scale(.88); filter:blur(8px); } to { opacity:1; transform:translate(-50%,-50%) scale(1); filter:blur(0); } }
      @keyframes iceCrackOut { 0%{opacity:1; clip-path:polygon(0 0,100% 0,100% 100%,0 100%);} 100%{opacity:0; clip-path:polygon(0 0,45% 0,35% 100%,0 100%,0 0,60% 0,100% 0,100% 100%,58% 100%); transform:scale(1.08);} }
      @keyframes snowFadeOut { to { opacity:0; transform:translate3d(-100px,80px,0); } }
      @keyframes warningOut { to { opacity:0; transform:translateX(105%); } }
      @keyframes uiuxTitleOut { to { opacity:0; transform:translate(-50%,-50%) scale(.95); filter:blur(8px); } }

      @keyframes mangaFlashIn { from{opacity:0; transform:scale(1.3);} to{opacity:.65; transform:scale(1);} }
      @keyframes animePanelIn { to { opacity:1; transform:translate(-50%,-50%) scale(1) rotate(-2deg); } }
      @keyframes routeDraw { to { transform:scaleX(1); } }
      @keyframes polarTitleIn { to { opacity:1; transform:translate(-50%,-50%) rotate(-2deg) scale(1); } }
      @keyframes mangaFlashOut { to { opacity:0; transform:scale(1.35); } }
      @keyframes animePanelOut { to { opacity:0; transform:translate(-50%,-50%) scale(1.2) rotate(5deg); } }
      @keyframes routeOut { to { opacity:0; transform:scaleX(.1); } }
      @keyframes polarTitleOut { to { opacity:0; transform:translate(-50%,-50%) rotate(9deg) scale(1.2); } }

      @keyframes hudGridIn { to { opacity:1; } }
      @keyframes hudRingIn { to { opacity:1; transform:translate(-50%,-50%) scale(1) rotate(80deg); } }
      @keyframes scanBeamIn { from{opacity:0; transform:translateY(0);} to{opacity:1; transform:translateY(430%);} }
      @keyframes codeRainIn { to { opacity:.48; } }
      @keyframes aiTitleGlitchIn { 0%{opacity:0; transform:translate(-50%,-50%) translateX(-18px);} 30%{opacity:1; transform:translate(-50%,-50%) translateX(14px);} 60%{transform:translate(-50%,-50%) translateX(-6px);} 100%{opacity:1; transform:translate(-50%,-50%) translateX(0);} }
      @keyframes hudDissolve { to { opacity:0; filter:blur(12px); } }
      @keyframes hudRingOut { to { opacity:0; transform:translate(-50%,-50%) scale(1.4) rotate(180deg); } }
      @keyframes scanBeamOut { to { opacity:0; transform:translateY(580%); } }
      @keyframes aiTitleOut { to { opacity:0; transform:translate(-50%,-50%) translateX(18px); } }

      @keyframes mapScrollIn { to { opacity:1; transform:translate(-50%,-50%) rotate(-2deg) scale(1); } }
      @keyframes compassIn { to { transform:scale(1) rotate(0deg); } }
      @keyframes mapTitleIn { to { opacity:1; transform:translate(-50%,-50%); } }
      @keyframes mapScrollOut { to { opacity:0; transform:translate(-50%,-50%) rotate(5deg) scale(.86); } }
      @keyframes compassOut { to { opacity:0; transform:scale(0) rotate(180deg); } }
      @keyframes mapTitleOut { to { opacity:0; transform:translate(-50%,-50%) scale(1.15); } }

      @keyframes scrapIn { to { opacity:1; transform:translate(-50%,-50%) rotate(-2deg) scale(1); } }
      @keyframes scrapOut { to { opacity:0; transform:translate(-50%,-50%) rotate(8deg) scale(1.18); } }
      @keyframes genericTitleIn { to { opacity:1; transform:translate(-50%,-50%); } }

      @media (prefers-reduced-motion: reduce) {
        .portfolio-transition-v2, .portfolio-transition-v2 * { animation-duration: .01ms !important; transition-duration: .01ms !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function interiorForType(type) {
    if (type === "child") {
      return `
        <div class="pt-blocker"></div>
        <div class="kid-water"></div>
        <div class="kid-float"></div><div class="kid-float"></div><div class="kid-float"></div>
        <div class="pt-grain"></div>
      `;
    }
    if (type === "astory") {
      return `
        <div class="pt-blocker"></div>
        <div class="astory-curtain curtain-left"></div><div class="astory-curtain curtain-right"></div>
        <div class="parchment"></div><div class="seal"></div>
        <div class="petal p1"></div><div class="petal p2"></div><div class="petal p3"></div>
        <div class="pt-grain"></div>
      `;
    }
    if (type === "uiux") {
      return `
        <div class="pt-blocker"></div>
        <div class="ice-wall"></div><div class="snowstorm"></div><div class="warning-strip"></div>
        <div class="pt-grain"></div>
      `;
    }
    if (type === "polar") {
      return `
        <div class="pt-blocker"></div>
        <div class="manga-flash"></div><div class="anime-panel"></div><div class="adventure-route"></div>
        <div class="pt-grain"></div>
      `;
    }
    if (type === "aihome") {
      return `
        <div class="pt-blocker"></div>
        <div class="hud-grid"></div><div class="code-rain"></div><div class="scan-beam"></div><div class="hud-ring"></div>
      `;
    }
    if (type === "map") {
      return `
        <div class="pt-blocker"></div>
        <div class="map-scroll"></div><div class="compass"></div>
        <div class="pt-grain"></div>
      `;
    }
    return `
      <div class="pt-blocker"></div>
      <div class="scrap-card"></div>
      <div class="pt-grain"></div>
    `;
  }

  function makeOverlay(options, mode) {
    ensureStyle();

    const type = cleanType(options.type);
    const title = String(options.title || "LOADING");
    const sub = String(options.sub || "LOADING PROJECT");

    const overlay = document.createElement("div");
    overlay.className = `portfolio-transition-v2 is-${type} is-${mode}`;
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
      ${interiorForType(type)}
      <div class="pt-title"></div>
      <div class="pt-sub"></div>
    `;
    overlay.querySelector(".pt-title").textContent = title;
    overlay.querySelector(".pt-sub").textContent = sub;
    return overlay;
  }

  function navigateWithComicTransition(url, options) {
    const targetUrl = String(url || "");
    if (!targetUrl) return;

    const inferredType = inferTypeFromUrl(targetUrl);
    const data = {
      title: options && options.title ? options.title : inferTitleFromUrl(targetUrl),
      type: options && options.type ? cleanType(options.type) : inferredType,
      sub: options && options.sub ? options.sub : (inferredType === "map" ? "BACK TO MAP" : "ENTER PROJECT"),
      phase: "reveal",
      createdAt: Date.now()
    };

    const overlay = makeOverlay(data, "covering");
    document.body.appendChild(overlay);

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {}

    window.setTimeout(function () {
      window.location.href = targetUrl;
    }, COVER_MS);
  }

  window.portfolioComicNavigate = navigateWithComicTransition;

  function revealAfterNavigation() {
    let data = null;

    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      data = JSON.parse(raw);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      data = null;
    }

    if (!data) return;
    if (data.createdAt && Date.now() - data.createdAt > 15000) return;

    const overlay = makeOverlay(data, "reveal");
    document.body.appendChild(overlay);

    window.setTimeout(function () {
      overlay.classList.add("is-leaving");
    }, 140);

    window.setTimeout(function () {
      overlay.remove();
    }, REVEAL_MS + 280);
  }

  function shouldInterceptLink(event, link) {
    if (!link) return false;
    if (event.defaultPrevented) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (link.target && link.target !== "_self") return false;
    if (link.hasAttribute("download")) return false;

    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;

    let url;
    try {
      url = new URL(href, window.location.href);
    } catch (error) {
      return false;
    }

    if (url.origin !== window.location.origin) return false;
    if (!/\.html$/i.test(url.pathname) && !/\.html\?/i.test(url.href) && !url.href.includes("index.html?page=")) return false;

    return true;
  }

  document.addEventListener("click", function (event) {
    const link = event.target.closest ? event.target.closest("a[href]") : null;
    if (!shouldInterceptLink(event, link)) return;

    event.preventDefault();

    const href = link.getAttribute("href");
    const type = link.dataset.project || link.dataset.transition || inferTypeFromUrl(href);
    const title = link.dataset.title || link.textContent.trim() || inferTitleFromUrl(href);
    const sub = type === "map" || href.includes("index.html") ? "BACK TO MAP" : "ENTER PROJECT";

    navigateWithComicTransition(href, { title, type, sub });
  }, true);

  if (document.body) {
    revealAfterNavigation();
  } else {
    document.addEventListener("DOMContentLoaded", revealAfterNavigation, { once: true });
  }
})();
