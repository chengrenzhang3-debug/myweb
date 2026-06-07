document.addEventListener('DOMContentLoaded',function(){
  var track=document.getElementById('islandTrack');
  var cards=Array.from(document.querySelectorAll('.island-card'));
  var dots=document.getElementById('mapDots');
  var boat=document.getElementById('boat');
  var counter=document.getElementById('islandCounter');
  if(dots)dots.innerHTML=cards.map(function(){return'<i></i>'}).join('');
  var dotEls=Array.from(dots?dots.querySelectorAll('i'):[]);
  var current=0,scrollTimer=null;
  function sync(){
    if(!track||!cards.length)return;
    var mid=track.scrollLeft+track.clientWidth/2;
    var idx=0,dist=Infinity;
    cards.forEach(function(card,i){var c=card.offsetLeft+card.offsetWidth/2;var d=Math.abs(c-mid);if(d<dist){dist=d;idx=i}});
    current=idx;
    cards.forEach(function(c,i){c.classList.toggle('active',i===idx)});
    dotEls.forEach(function(d,i){d.classList.toggle('active',i===idx)});
    if(counter)counter.textContent=String(idx+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0');
    if(boat){boat.style.left=(7+idx*(78/(cards.length-1)))+'%';boat.classList.add('rowing');clearTimeout(scrollTimer);scrollTimer=setTimeout(function(){boat.classList.remove('rowing')},160)}
  }
  track&&track.addEventListener('scroll',function(){requestAnimationFrame(sync)},{passive:true});
  cards.forEach(function(card){
    card.addEventListener('click',function(e){
      var link=card.dataset.link;
      if(card.classList.contains('active')&&link){MobileUX.pageTransition(link,card.dataset.title||card.textContent.trim(),card.dataset.enter||'gray')}
      else card.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});
    });
  });
  sync();
});
