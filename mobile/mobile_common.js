
(function(){
  function $(sel,root){return (root||document).querySelector(sel)}
  function $all(sel,root){return Array.prototype.slice.call((root||document).querySelectorAll(sel))}
  function transitionTo(url, opts){
    opts=opts||{};
    var t=document.querySelector('.mobile-transition');
    if(!t){
      t=document.createElement('div');t.className='mobile-transition';
      t.innerHTML='<div class="mt-wave"></div><div class="mt-title"></div><div class="mt-sub">ENTER PROJECT</div>';
      document.body.appendChild(t);
    }
    t.className='mobile-transition show '+(opts.type||'bubble');
    $('.mt-title',t).textContent=opts.title||'LOADING';
    $('.mt-sub',t).textContent=opts.sub||'ENTER PROJECT';
    setTimeout(function(){window.location.href=url},620);
  }
  window.mobileProjectNavigate=transitionTo;

  document.addEventListener('click',function(e){
    var a=e.target.closest('a[data-project],a[data-enter]');
    if(!a) return;
    var href=a.getAttribute('href');
    if(!href || href==='#' || href.indexOf('mailto:')===0) return;
    e.preventDefault();
    transitionTo(href,{type:a.dataset.enter||a.dataset.project||'bubble',title:a.dataset.title||a.textContent.trim()||'PROJECT'});
  });

  function buildMenu(){
    if(document.querySelector('.mobile-touch-menu')) return;
    var btn=document.createElement('button');btn.className='mobile-touch-menu';btn.type='button';btn.setAttribute('aria-label','打开目录');btn.textContent='☰';
    var dim=document.createElement('div');dim.className='mobile-dim';
    var panel=document.createElement('nav');panel.className='mobile-offcanvas';panel.setAttribute('aria-label','手机端目录');
    panel.innerHTML='<h2>INDEX</h2>'+
      '<a href="mobile_index.html?page=0">01 / 封面</a>'+
      '<a href="mobile_index.html?page=1">02 / 简历</a>'+
      '<a href="mobile_index.html?page=2">03 / 作品地图</a>'+
      '<a href="mobile_index.html?page=3">04 / 工作方式</a>'+
      '<a href="mobile_children-water.html" data-enter="bubble" data-title="儿童智能饮水">儿童智能饮水</a>'+
      '<a href="mobile_polar-rover.html" data-enter="ice" data-title="极地房车 HMI">极地房车 HMI</a>'+
      '<a href="mobile_ai-home.html" data-enter="grid" data-title="AI 智能家居">AI 智能家居</a>'+
      '<a href="mobile_astory.html" data-enter="paper" data-title="ASTORY">ASTORY</a>'+
      '<a href="mobile_UIUX.html" data-enter="ui" data-title="UI/UX 交互演示">UI/UX 交互演示</a>'+
      '<a href="mobile_projects.html" data-enter="burst" data-title="其他项目">其他项目</a>'+
      '<a href="mobile_experiments.html" data-enter="burst" data-title="更多实验">更多实验</a>';
    document.body.append(btn,dim,panel);
    function close(){panel.classList.remove('show');dim.classList.remove('show')}
    function open(){panel.classList.add('show');dim.classList.add('show')}
    btn.addEventListener('click',function(){panel.classList.contains('show')?close():open()});
    dim.addEventListener('click',close);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',buildMenu);else buildMenu();

  document.addEventListener('DOMContentLoaded',function(){
    $all('[data-accordion]').forEach(function(box){
      var head=box.querySelector('[data-accordion-head]')||box.firstElementChild;
      if(!head) return; head.addEventListener('click',function(){box.classList.toggle('open')});
    });
    $all('.mobile-carousel').forEach(function(c){
      var track=c.querySelector('.mobile-carousel-track')||c;
      var dots=document.createElement('div');dots.className='mobile-carousel-dots';
      var items=$all('img, figure',track); if(items.length<2) return;
      items.forEach(function(_,i){var b=document.createElement('button');b.type='button';if(i===0)b.className='active';dots.appendChild(b);b.onclick=function(){track.scrollTo({left:i*track.clientWidth,behavior:'smooth'})}});
      c.appendChild(dots);
      track.addEventListener('scroll',function(){var i=Math.round(track.scrollLeft/Math.max(1,track.clientWidth));$all('button',dots).forEach(function(b,j){b.classList.toggle('active',j===i)})},{passive:true});
    });
  });
})();
