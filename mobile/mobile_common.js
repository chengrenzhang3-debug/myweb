(function(){
  function $(sel,root){return (root||document).querySelector(sel)}
  function $$(sel,root){return Array.from((root||document).querySelectorAll(sel))}
  var typeClass={bubble:'transition-water',water:'transition-water',ice:'transition-ice',polar:'transition-ice',paper:'transition-paper',astory:'transition-paper',grid:'transition-grid',aihome:'transition-grid',shape:'transition-shape',uiux:'transition-shape',gray:'transition-gray',other:'transition-gray',boom:'transition-boom',experiments:'transition-boom'};
  function ensureCover(){
    var cover=$('#transitionCover');
    if(!cover){cover=document.createElement('div');cover.id='transitionCover';cover.className='transition-cover';document.body.appendChild(cover)}
    return cover;
  }
  function setCoverContent(cover,title,type){
    cover.className='transition-cover show '+(typeClass[type]||typeClass.gray);
    cover.innerHTML='<div><div class="loader-title">'+(title||'PORTFOLIO')+'</div><div class="loader-sub">LOADING</div></div>';
  }
  function pageTransition(href,title,type){
    var cover=ensureCover();
    setCoverContent(cover,title,type);
    try{sessionStorage.setItem('mobileLoaderTitle',title||'');sessionStorage.setItem('mobileLoaderType',type||'gray')}catch(e){}
    setTimeout(function(){location.href=href},520);
  }
  function showArrivalLoader(){
    var title='',type='';
    try{title=sessionStorage.getItem('mobileLoaderTitle')||'';type=sessionStorage.getItem('mobileLoaderType')||'';sessionStorage.removeItem('mobileLoaderTitle');sessionStorage.removeItem('mobileLoaderType')}catch(e){}
    if(!title&&!type)return;
    var cover=ensureCover();
    setCoverContent(cover,title,type);
    setTimeout(function(){cover.classList.add('closing');setTimeout(function(){cover.className='transition-cover';cover.innerHTML=''},300)},360);
  }
  function scrollRoot(){return $('.page-mode')||document.scrollingElement||document.documentElement}
  function initProgress(){
    var line=$('#progressLine');
    function onScroll(){
      var root=scrollRoot();
      var y=root===document.scrollingElement?window.scrollY:root.scrollTop;
      var max=root.scrollHeight-root.clientHeight;
      if(line)line.style.width=(max?Math.min(100,y/max*100):0)+'%';
      $$('.reveal').forEach(function(el){if(el.getBoundingClientRect().top<innerHeight*.88)el.classList.add('show')});
      var activeId='';$$('[data-chapter]').forEach(function(sec){if(sec.getBoundingClientRect().top<innerHeight*.52)activeId=sec.id});
      if(activeId){
        $$('.chapter-nav a,.bottom-dock a').forEach(function(a){var h=a.getAttribute('href')||'';a.classList.toggle('active',h==='#'+activeId||h.endsWith('#'+activeId))})
      }
    }
    var root=scrollRoot();
    (root===document.scrollingElement?window:root).addEventListener('scroll',onScroll,{passive:true});onScroll();
  }
  function initDrawer(){
    $$('[data-open-menu]').forEach(function(b){b.addEventListener('click',function(){var d=$('#mobileDrawer');if(d)d.classList.add('open')})});
    $$('[data-close-menu]').forEach(function(b){b.addEventListener('click',function(){var d=$('#mobileDrawer');if(d)d.classList.remove('open')})});
    $('#mobileDrawer')?.addEventListener('click',function(e){if(e.target.id==='mobileDrawer')e.currentTarget.classList.remove('open')});
  }
  function initAccordions(){
    $$('.accordion button').forEach(function(btn){btn.addEventListener('click',function(){btn.closest('.accordion').classList.toggle('open')})});
  }
  function initCarousels(){
    $$('.carousel').forEach(function(car){
      var track=$('.carousel-track',car), dots=$('.dots',car);if(!track||!dots)return;var slides=$$('.slide',track);dots.innerHTML=slides.map(function(){return'<i></i>'}).join('');
      function sync(){var w=(slides[0]?.offsetWidth||1)+14;var i=Math.max(0,Math.min(slides.length-1,Math.round(track.scrollLeft/w)));$$('i',dots).forEach(function(d,idx){d.classList.toggle('active',idx===i)})}
      track.addEventListener('scroll',function(){requestAnimationFrame(sync)},{passive:true});sync();
    });
  }
  function initTransitions(){
    $$('a[data-transition],a[data-enter]').forEach(function(a){
      a.addEventListener('click',function(e){
        var href=a.getAttribute('href');if(!href||href[0]==='#')return;
        e.preventDefault();
        pageTransition(a.href,a.dataset.title||a.textContent.trim(),a.dataset.transitionType||a.dataset.transition||a.dataset.enter||'gray');
      });
    });
  }

  function initAnchorScroll(){
    $$('a[href^="#"]').forEach(function(a){
      a.addEventListener('click',function(e){
        var h=a.getAttribute('href');
        if(!h || h==='#') return;
        var target=document.querySelector(h);
        if(!target) return;
        var root=scrollRoot();
        e.preventDefault();
        if(root && root!==document.scrollingElement){
          root.scrollTo({top:target.offsetTop,behavior:'smooth'});
        }else{
          target.scrollIntoView({behavior:'smooth',block:'start'});
        }
      });
    });
  }

  function initPageMode(){
    var root=$('.page-mode');if(!root)return;
    // 轻量键盘支持，方便手机浏览器外接键盘/桌面调试。
    document.addEventListener('keydown',function(e){
      if(e.key!=='ArrowDown'&&e.key!=='ArrowUp'&&e.key!==' ')return;
      var screens=$$('.page-screen',root);if(!screens.length)return;
      var y=root.scrollTop+root.clientHeight*.5;
      var idx=0;screens.forEach(function(s,i){if(s.offsetTop<y)idx=i});
      if(e.key==='ArrowUp')idx=Math.max(0,idx-1);else idx=Math.min(screens.length-1,idx+1);
      screens[idx].scrollIntoView({behavior:'smooth',block:'start'});e.preventDefault();
    });
  }
  window.MobileUX={qs:$,qsa:$$,pageTransition:pageTransition,openDrawer:function(){var d=$('#mobileDrawer');if(d)d.classList.add('open')},closeDrawer:function(){var d=$('#mobileDrawer');if(d)d.classList.remove('open')}};
  document.addEventListener('DOMContentLoaded',function(){showArrivalLoader();initDrawer();initProgress();initAccordions();initCarousels();initTransitions();initAnchorScroll();initPageMode()});
})();
