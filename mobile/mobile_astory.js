document.addEventListener('DOMContentLoaded',function(){
  var m=42,t=18,r=31;var story=document.getElementById('storyText'),money=document.getElementById('money'),trust=document.getElementById('trust'),risk=document.getElementById('risk');
  function render(text){money.textContent=m;trust.textContent=t;risk.textContent=r;story.textContent=text}
  document.querySelectorAll('[data-choice]').forEach(function(btn){btn.addEventListener('click',function(){var c=btn.dataset.choice;if(c==='deal'){m+=18;r+=17;t+=4;render('你接受了运输委托，资金预期提高，但路线风险明显上升。商人开始记住你的名字。')}if(c==='talk'){t+=16;r-=5;m-=3;render('你选择交涉，花费一点资源换取信任。新的低风险路线被解锁。')}if(c==='leave'){r-=12;m-=5;render('你离开市场，风险下降，但错过了一次可能的收益。债务压力仍在逼近。')}})});
});
