document.addEventListener('DOMContentLoaded',function(){
  document.querySelectorAll('[data-water-tab]').forEach(function(btn){btn.addEventListener('click',function(){
    document.querySelectorAll('[data-water-tab]').forEach(function(b){b.classList.remove('active')});btn.classList.add('active');
    document.querySelectorAll('.water-tab').forEach(function(tab){tab.classList.remove('active')});
    var target=document.getElementById('tab-'+btn.dataset.waterTab);if(target)target.classList.add('active');
  })});
});
