document.addEventListener('DOMContentLoaded',function(){
  var chat=document.getElementById('chatLog');var replies={"回家模式":"已准备回家模式：玄关灯光 40%，客厅温度调整到 24℃，并提醒你查看今天的快递。","睡眠准备":"睡眠准备已规划：30 分钟内降低色温，关闭娱乐屏幕，保留卧室柔光。","节能建议":"今天可节能 21%：建议关闭书房待机设备，并把客厅空调调整到 Eco 区间。"};
  document.querySelectorAll('[data-prompt]').forEach(function(btn){btn.addEventListener('click',function(){var text=btn.dataset.prompt;chat.insertAdjacentHTML('beforeend','<p class="user">'+text+'</p><p class="bot">'+replies[text]+'</p>');chat.scrollTop=chat.scrollHeight;});});
  var title=document.getElementById('sceneTitle'),body=document.getElementById('sceneText');var data={home:['回家场景','Agent 根据预计到家时间提前准备环境，而不是等用户手动打开每个设备。'],sleep:['睡眠场景','灯光、声音、温度和通知会逐步降低刺激，减少突然切换带来的不适。'],focus:['专注场景','系统会根据日程和空间状态建立一个低干扰环境，并解释每个设备动作。'],away:['离家场景','离家后自动做安防、能耗和异常检查，让用户只需要确认结果。']};
  document.querySelectorAll('[data-scene]').forEach(function(card){card.addEventListener('click',function(){document.querySelectorAll('[data-scene]').forEach(function(c){c.classList.remove('active')});card.classList.add('active');var d=data[card.dataset.scene];title.textContent=d[0];body.textContent=d[1];});});
});
