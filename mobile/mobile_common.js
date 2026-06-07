(function(){
  function $(sel,root){return (root||document).querySelector(sel)}
  function $$(sel,root){return Array.from((root||document).querySelectorAll(sel))}
  window.MobileUX={
    qs:$,qsa:$$,
    openDrawer:function(){var d=$('#mobileDrawer');if(d)d.classList.add('open')},
    closeDrawer:function(){var d=$('#mobileDrawer');if(d)d.classList.remove('open')},
    pageTransition:function(href,label){var t=$('#transitionCover');if(!t){location.href=href;return} t.textContent=label||'LOADING';t.classList.add('show');setTimeout(function(){location.href=href},260)},
    init:function(){
      var line=$('#progressLine');
      function onScroll(){
        if(line){var h=document.documentElement;var max=h.scrollHeight-innerHeight;line.style.width=(max?Math.min(100,scrollY/max*100):0)+'%'}
        $$('.reveal').forEach(function(el){if(el.getBoundingClientRect().top<innerHeight*.86)el.classList.add('show')});
        var activeId='';$$('[data-chapter]').forEach(function(sec){if(sec.getBoundingClientRect().top<innerHeight*.45)activeId=sec.id});
        if(activeId){$$('.chapter-nav a').forEach(function(a){a.classList.toggle('active',a.getAttribute('href')==='#'+activeId)})}
      }
      addEventListener('scroll',onScroll,{passive:true});onScroll();
      $$('[data-open-menu]').forEach(function(b){b.addEventListener('click',MobileUX.openDrawer)});
      $$('[data-close-menu]').forEach(function(b){b.addEventListener('click',MobileUX.closeDrawer)});
      $('#mobileDrawer')?.addEventListener('click',function(e){if(e.target.id==='mobileDrawer')MobileUX.closeDrawer()});
      $$('.accordion button').forEach(function(btn){btn.addEventListener('click',function(){btn.closest('.accordion').classList.toggle('open')})});
      $$('.carousel').forEach(function(car){var track=$('.carousel-track',car);var dots=$('.dots',car);if(!track||!dots)return;var slides=$$('.slide',track);dots.innerHTML=slides.map(function(){return'<i></i>'}).join('');function sync(){var i=Math.round(track.scrollLeft/(slides[0]?.offsetWidth+14||1));$$('i',dots).forEach(function(d,idx){d.classList.toggle('active',idx===i)})}track.addEventListener('scroll',function(){requestAnimationFrame(sync)},{passive:true});sync()});
      $$('a[data-transition]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();MobileUX.pageTransition(a.href,a.dataset.transition)})});
    }
  };
  document.addEventListener('DOMContentLoaded',MobileUX.init);
})();
