document.addEventListener('DOMContentLoaded',function(){
  var track=document.getElementById('islandTrack');
  var cards=Array.from(document.querySelectorAll('.island-card'));
  var dots=document.getElementById('mapDots');
  var boat=document.getElementById('boat');
  var counter=document.getElementById('islandCounter');
  var hint=document.getElementById('mapHint');
  if(dots)dots.innerHTML=cards.map(function(){return'<i></i>'}).join('');
  var dotEls=Array.from(dots?dots.querySelectorAll('i'):[]);
  var current=0;
  function sync(){
    if(!track||!cards.length)return;
    var mid=track.scrollLeft+track.clientWidth/2;
    var idx=0,dist=Infinity;
    cards.forEach(function(card,i){var c=card.offsetLeft+card.offsetWidth/2;var d=Math.abs(c-mid);if(d<dist){dist=d;idx=i}});
    current=idx;
    cards.forEach(function(c,i){c.classList.toggle('active',i===idx)});
    dotEls.forEach(function(d,i){d.classList.toggle('active',i===idx)});
    if(counter)counter.textContent=String(idx+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0');
    if(boat)boat.style.left=(7+idx*((78)/(cards.length-1)))+'%';
    if(hint && !localStorage.getItem('mobileMapHintSeen')){localStorage.setItem('mobileMapHintSeen','1');setTimeout(function(){hint.classList.add('hide')},900)}
  }
  track&&track.addEventListener('scroll',function(){requestAnimationFrame(sync)},{passive:true});
  cards.forEach(function(card){
    card.addEventListener('click',function(){
      var label=card.dataset.go||'SAILING';
      var link=card.dataset.link;
      if(card.classList.contains('active') && link) MobileUX.pageTransition(link,label);
      else card.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});
    });
  });
  sync();
  document.getElementById('surpriseBtn')?.addEventListener('click',function(e){
    boat&&boat.classList.add('pop');setTimeout(function(){boat&&boat.classList.remove('pop')},650);
    for(var i=0;i<12;i++){var s=document.createElement('i');s.className='spark';s.style.left=(e.clientX+(Math.random()*70-35))+'px';s.style.top=(e.clientY+(Math.random()*30-15))+'px';document.body.appendChild(s);setTimeout(function(x){x.remove()},800,s)}
  });
});
