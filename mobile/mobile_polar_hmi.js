document.addEventListener('DOMContentLoaded',function(){
  var clock=document.getElementById('hmiClock');function tick(){var d=new Date();if(clock)clock.textContent=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}tick();setInterval(tick,1000);
  var log=document.getElementById('hmiLog');var data={"巡航":"当前能见度稳定，建议保持巡航速度并开启柔性照明。","驻留":"已切换驻留模式，座舱保温优先，外部传感器低频扫描。","健康":"健康循环启动，空气过滤增强，建议 20 分钟后进行光照补偿。","节能":"节能模式开启，非必要模块降载，续航预估提升 12%。"};
  document.querySelectorAll('[data-mode]').forEach(function(btn){btn.addEventListener('click',function(){document.querySelectorAll('[data-mode]').forEach(function(b){b.classList.remove('active')});btn.classList.add('active');if(log)log.textContent=data[btn.dataset.mode]||data['巡航'];});});
});
