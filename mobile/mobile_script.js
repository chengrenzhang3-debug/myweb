(function(){
  const btn=document.querySelector('.menu-toggle');
  const menu=document.querySelector('.mobile-menu');
  if(btn&&menu){
    btn.addEventListener('click',()=>{const open=menu.classList.toggle('open');btn.setAttribute('aria-expanded',String(open));});
    menu.addEventListener('click',e=>{if(e.target.tagName==='A'){menu.classList.remove('open');btn.setAttribute('aria-expanded','false');}});
  }
  const params=new URLSearchParams(location.search);
  const page=params.get('page');
  if(page==='2'||page==='map') setTimeout(()=>document.querySelector('#map')?.scrollIntoView(),120);
  const cards=document.querySelectorAll('.project-island');
  cards.forEach(card=>card.addEventListener('touchstart',()=>card.classList.add('touching'),{passive:true}));
  cards.forEach(card=>card.addEventListener('touchend',()=>setTimeout(()=>card.classList.remove('touching'),120),{passive:true}));
})();
