document.addEventListener('DOMContentLoaded',function(){
  var cards=Array.from(document.querySelectorAll('.route-card'));
  addEventListener('scroll',function(){cards.forEach(function(c){if(c.getBoundingClientRect().top<innerHeight*.7)c.classList.add('active')})},{passive:true});
});
