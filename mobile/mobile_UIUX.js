document.addEventListener('DOMContentLoaded',function(){
  var screen=document.getElementById('uiuxScreen');document.querySelectorAll('[data-screen]').forEach(function(btn){btn.addEventListener('click',function(){screen.classList.add('fade');setTimeout(function(){screen.src=btn.dataset.screen;screen.classList.remove('fade')},120);});});
});
