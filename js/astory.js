const navButtons = document.querySelectorAll('[data-section]');
const panels = document.querySelectorAll('.panel');
const navDots = document.querySelectorAll('.nav-dot');

function showSection(id) {
  panels.forEach(panel => panel.classList.toggle('active', panel.dataset.section === id));
  navDots.forEach(button => button.classList.toggle('active', button.dataset.section === id));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navButtons.forEach(button => {
  button.addEventListener('click', () => {
    const target = button.dataset.section;
    if (target) showSection(target);
  });
});

const storyText = document.getElementById('storyText');
const choiceButtons = document.getElementById('choiceButtons');
const trustBar = document.getElementById('trustBar');
const clueBar = document.getElementById('clueBar');
const riskBar = document.getElementById('riskBar');
const trustValue = document.getElementById('trustValue');
const clueValue = document.getElementById('clueValue');
const riskValue = document.getElementById('riskValue');
const endingText = document.getElementById('endingText');
const resetStory = document.getElementById('resetStory');

const state = {
  trust: 0,
  clue: 0,
  risk: 0,
  node: 'start'
};

const nodes = {
  start: {
    text: '雨停了，但手机屏幕还亮着。\n\n陌生号码发来一句话：\n“你真的确定要继续查下去吗？”',
    choices: [
      { label: '继续追问：你是谁？', next: 'ask', effects: { clue: 1, risk: 1 } },
      { label: '先把手机收起来', next: 'leave', effects: { trust: 1 } }
    ]
  },
  ask: {
    text: '对方没有立刻回答。\n\n三秒后，屏幕上出现了一张模糊的照片。照片背面写着一个地点：旧天文台。',
    choices: [
      { label: '保存照片，前往旧天文台', next: 'truth', effects: { clue: 2, risk: 1 } },
      { label: '把照片转发给同伴', next: 'friend', effects: { trust: 1, clue: 1 } }
    ]
  },
  leave: {
    text: '你把手机扣在桌面上。\n\n房间安静下来，可窗外那盏路灯开始规律闪烁，像是在等待你做出下一次选择。',
    choices: [
      { label: '重新拿起手机', next: 'ask', effects: { clue: 1 } },
      { label: '记录异常，再观察一晚', next: 'slow', effects: { trust: 1, risk: -1 } }
    ]
  },
  friend: {
    text: '同伴只回了四个字：\n\n“不要一个人去。”\n\n你第一次意识到，这个故事里不止你一个人在做选择。',
    choices: [
      { label: '结伴调查', next: 'ending', effects: { trust: 2, clue: 1 } },
      { label: '仍然独自行动', next: 'ending', effects: { clue: 1, risk: 2 } }
    ]
  },
  truth: {
    text: '旧天文台的门没有锁。\n\n桌上放着一张纸条，上面写着：\n“你终于走到了第一个真实节点。”',
    choices: [
      { label: '读取纸条背面的编号', next: 'ending', effects: { clue: 2, risk: 1 } },
      { label: '先检查房间出口', next: 'ending', effects: { trust: 1, risk: -1 } }
    ]
  },
  slow: {
    text: '你没有立刻行动。\n\n第二天清晨，陌生号码消失了，但桌上多出一张新的车票。目的地被人涂黑，只剩下日期。',
    choices: [
      { label: '收下车票', next: 'ending', effects: { clue: 1, trust: 1 } },
      { label: '拒绝进入新的节点', next: 'ending', effects: { risk: -1 } }
    ]
  },
  ending: {
    text: '当前故事片段结束。\n\n真正的结局并没有马上出现，它被你的信任、线索与风险共同推向不同方向。',
    choices: [
      { label: '重新开始', next: 'start', reset: true }
    ]
  }
};

let typingTimer = null;

function typeText(text) {
  clearInterval(typingTimer);
  storyText.textContent = '';
  let index = 0;
  typingTimer = setInterval(() => {
    storyText.textContent += text[index] || '';
    index += 1;
    if (index >= text.length) clearInterval(typingTimer);
  }, 18);
}

function clamp(value) {
  return Math.max(0, Math.min(6, value));
}

function updateStateView() {
  state.trust = clamp(state.trust);
  state.clue = clamp(state.clue);
  state.risk = clamp(state.risk);

  trustValue.textContent = state.trust;
  clueValue.textContent = state.clue;
  riskValue.textContent = state.risk;
  trustBar.style.width = `${state.trust / 6 * 100}%`;
  clueBar.style.width = `${state.clue / 6 * 100}%`;
  riskBar.style.width = `${state.risk / 6 * 100}%`;

  if (state.clue >= 4 && state.risk >= 3) endingText.textContent = '靠近真相，但风险上升';
  else if (state.trust >= 3) endingText.textContent = '关系保留，结伴调查';
  else if (state.clue >= 3) endingText.textContent = '线索开启，继续追踪';
  else if (state.risk <= 0 && state.trust >= 2) endingText.textContent = '谨慎推进，安全优先';
  else endingText.textContent = '尚未确定';
}

function renderNode(nodeId) {
  state.node = nodeId;
  const node = nodes[nodeId];
  typeText(node.text);
  choiceButtons.innerHTML = '';

  node.choices.forEach(choice => {
    const button = document.createElement('button');
    button.textContent = choice.label;
    button.addEventListener('click', () => {
      if (choice.reset) {
        state.trust = 0;
        state.clue = 0;
        state.risk = 0;
      } else if (choice.effects) {
        state.trust += choice.effects.trust || 0;
        state.clue += choice.effects.clue || 0;
        state.risk += choice.effects.risk || 0;
      }
      updateStateView();
      renderNode(choice.next);
    });
    choiceButtons.appendChild(button);
  });
}

resetStory.addEventListener('click', () => {
  state.trust = 0;
  state.clue = 0;
  state.risk = 0;
  updateStateView();
  renderNode('start');
});

updateStateView();
renderNode('start');
