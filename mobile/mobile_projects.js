const projects = [
  {
    id:'space', no:'01', cls:'space',
    title:'城市微空间公共服务设计', en:'URBAN MICRO-SERVICE SPACE',
    cover:'../otherasset/space-01.png',
    tags:['城市微空间','公共服务','多用户场景','空间整合'],
    short:'以人为本激活城市街角，把休憩、展示、服务与社区连接压缩进小尺度公共空间。',
    images:[
      ['../otherasset/space-01.png','空间总览：将等候、展示、休憩、服务节点组织在同一街角系统中。'],
      ['../otherasset/space-02.png','室内服务区：以曲线吧台与等候座椅回应骑手与行人的短暂停留需求。'],
      ['../otherasset/space-03.png','功能分区：外部展示与内部服务共同形成街角微枢纽。'],
      ['../otherasset/space-04.png','平面关系：梳理人流、展示、服务与监督之间的路径关系。']
    ],
    overview:'项目以城市街角为切入点，围绕外卖骑手、行人、商户与社区居民的复合需求，构建兼具休憩、信息展示、便民服务与社区监督的公共微空间。设计不以商业盈利为核心，而是强调共享、便民与共生，让小空间承担更高密度的城市服务价值。',
    focus:['为外卖骑手提供短暂停留、取物与休息节点。','为行人和社区居民提供可见、可达、可监督的公共服务区。','为商户提供轻量展示与消费者连接窗口。','用功能集成回应城市生活中的细碎痛点。'],
    role:'完成场景需求梳理、空间功能整合、动线推演、模型搭建与展示图输出。'
  },
  {
    id:'friction', no:'02', cls:'friction',
    title:'球盘销盘旋转摩擦磨损试验机', en:'FRICTION & WEAR TEST DEVICE',
    cover:'../otherasset/friction-01.png',
    tags:['实验设备','结构模块','参数控制','工程原型'],
    short:'围绕旋转摩擦磨损试验，整理设备结构、环境控制、运动模块与操作安全。',
    images:[
      ['../otherasset/friction-01.png','设备效果：以观察窗、控制按钮与封闭外壳构成实验设备主形态。'],
      ['../otherasset/friction-02.png','功能需求：把球盘 / 销盘试验拆解为运动模块与摩擦件模块。'],
      ['../otherasset/friction-03.png','环境控制：温度、湿度、腐蚀性与运行参数共同决定材料选择。'],
      ['../otherasset/friction-04.png','结构模块：标注 Z 轴加载、XY 底座、观察窗、维护口和散热孔。'],
      ['../otherasset/friction-05.png','整体规格：以坐姿操作高度与设备总高控制人机尺度。'],
      ['../otherasset/friction-06.jpg','电路关系：以 Arduino 与逻辑电平转换连接多路传感与执行模块。']
    ],
    overview:'该项目围绕球盘、销盘旋转摩擦磨损试验需求展开，重点梳理设备结构与实验动作之间的关系。设计包含运动模块、摩擦件模块、环境控制系统、观察窗、电气维护口、按钮与外壳规格等内容，兼顾实验参数、操作安全和设备维护。',
    focus:['将旋转、高频往复、球盘、销盘等需求拆分为清晰结构模块。','通过观察窗和维护口降低实验过程中的操作风险。','以温湿度、腐蚀性、转速、负载等参数反推材料与外壳设计。','用设备尺寸和按键位置控制坐姿操作的人机关系。'],
    role:'完成需求拆解、结构模块划分、参数整理、设备外观与功能说明图表达。'
  },
  {
    id:'language', no:'03', cls:'language',
    title:'儿童语言障碍康复游戏设计', en:'LANGUAGE REHAB GAME CONCEPT',
    cover:'../otherasset/language-03.jpg',
    tags:['儿童康复','AI 对话','游戏化训练','情景任务'],
    short:'把语言训练拆成可游戏化任务，用角色、NPC 对话和情景选择降低训练枯燥感。',
    images:[
      ['../otherasset/language-03.jpg','首页概念：以柔和游戏菜单建立低压力入口。'],
      ['../otherasset/language-01.png','训练节点：接受、表达、阅读、口肌与社交情境被拆为不同任务。'],
      ['../otherasset/language-02.png','方案逻辑：从痛点、陪伴、交流、认知和医疗知识层推导 AI 对话训练。']
    ],
    overview:'项目面向儿童语言发育障碍康复场景，将传统训练中的接受、表达、阅读、语音纠正与社交情境理解拆解为游戏任务。通过角色扮演、NPC 对话、排序选择与情境问答，让训练从单调重复变成更容易进入的互动过程。',
    focus:['用游戏情境降低儿童对康复训练的抵触感。','通过 AI 对话与 NPC 任务模拟日常社交表达。','将复杂语言训练拆为可理解、可完成、可反馈的小任务。','以软萌视觉和低刺激界面降低认知负担。'],
    role:'完成康复训练逻辑梳理、游戏任务拆解、首页概念和方案路径表达。'
  },
  {
    id:'driving', no:'04', cls:'driving',
    title:'假期学驾考 App 设计', en:'DRIVING LEARNING APP',
    cover:'../otherasset/driving-02.png',
    tags:['移动端 App','学习系统','错题复盘','模拟考试'],
    short:'整合刷题、模拟、错题、资讯和社区，把驾考压力转化为可追踪的学习路径。',
    images:[
      ['../otherasset/driving-02.png','首页总览：考试倒计时、报名状态与四类核心入口集中呈现。'],
      ['../otherasset/driving-01.png','早期首页：练习、小游戏、直播课等模块形成学习聚合页。'],
      ['../otherasset/driving-03.png','模拟考试：通过历史模拟成绩分析反馈备考状态。'],
      ['../otherasset/driving-04.png','错题页：多次错题、近期错题、收藏与全部题目分层整理。'],
      ['../otherasset/driving-05.png','科目二：考试标准、预约、基础教学与报考帮助入口。'],
      ['../otherasset/driving-06.png','新闻资讯：将交规更新和热点问题作为学习内容补充。'],
      ['../otherasset/driving-07.png','社区动态：用户经验分享形成互助学习氛围。'],
      ['../otherasset/driving-08.png','消息列表：通知、教练和学员信息以列表组织。'],
      ['../otherasset/driving-09.png','小交警小游戏：用轻量游戏训练交通判断。'],
      ['../otherasset/driving-10.png','模拟驾驶：通过驾驶视角强化操作认知。']
    ],
    overview:'项目围绕驾考用户在备考过程中的高频需求展开：刷题、模拟考试、错题整理、考试预约提醒、课程学习与社区交流。界面通过顶部科目切换、练习 / 模拟 / 错题 / 收藏四类主入口，以及底部首页、消息、我的三栏结构，建立稳定的学习导航。',
    focus:['用倒计时、报名状态和模拟成绩降低备考的不确定感。','将练习、模拟、错题、收藏组织成清晰的学习闭环。','通过资讯与社区补充正式课程之外的经验信息。','把小游戏和驾驶模拟作为低压力的认知训练入口。'],
    role:'完成移动端信息架构、主界面布局、学习路径拆解、关键功能页与游戏化模块设计。'
  },
  {
    id:'toyart', no:'05', cls:'toyart',
    title:'童趣玩具与艺术装置实验', en:'TOY & INSTALLATION EXPERIMENTS',
    cover:'../otherasset/toy-01.png',
    tags:['纸板原型','传感反馈','材料实验','艺术装置'],
    short:'把内容较轻的玩具原型和艺术装置合并展示，突出材料、原型与互动实验能力。',
    images:[
      ['../otherasset/toy-01.png','梦回童趣：以“让玩具回家”为主题的可折叠纸板玩具柜。'],
      ['../otherasset/toy-02.png','细节展示：底部磁力传感与背部压力传感分别对应玩具定位与画面联想。'],
      ['../otherasset/toy-03.png','迭代升级：从瓦楞纸快速模型推进到灰板与热熔胶定型。'],
      ['../otherasset/art-01.png','艺术说明：以铜钱、红线、铜网、砂土与透明底盘构成材料叙事。'],
      ['../otherasset/art-03.png','概念草图：将古钱、机械与生物形态结合成装置意象。'],
      ['../otherasset/art-02.png','机械结构：以连续框架与旋转机构模拟可运动的装置骨架。'],
      ['../otherasset/art-04.png','最终装置：红线、古钱、砂土和透明基座共同形成“束缚与流动”的视觉关系。']
    ],
    overview:'这一组将两个体量较轻但有实验价值的项目合并展示：前半部分是儿童玩具收纳与声音反馈原型，后半部分是围绕古钱、红线、铜网和透明材料展开的艺术装置实验。它们共同体现快速原型、材料选择、互动触发和概念表达能力。',
    focus:['玩具部分关注儿童收纳行为，通过定位与压力反馈引导玩具归位。','原型从瓦楞纸快速试错推进到灰板结构，提高稳定性与完成度。','艺术装置部分用铜钱、红线、砂土和透明底盘建立材料隐喻。','机械结构与手工材料并置，形成“古老符号 + 可运动装置”的观看体验。'],
    role:'完成玩具原型结构、传感反馈设想、迭代记录，以及艺术装置的材料说明、草图推演和模型呈现。',
    dual:true
  }
];
const list=document.getElementById('projectList');
const detail=document.getElementById('detail');
const detailBody=document.getElementById('detailBody');
const closeDetail=document.getElementById('closeDetail');
function tags(t){return t.map(x=>`<span>${x}</span>`).join('')}
list.innerHTML=projects.map((p,i)=>`<article class="project" data-index="${i}"><img src="${p.cover}" alt="${p.title}"><div><small>${p.no} / ${p.en}</small><h2>${p.title}</h2><p>${p.short}</p><div class="tags">${tags(p.tags)}</div></div></article>`).join('');
list.addEventListener('click',e=>{const card=e.target.closest('.project');if(!card)return;const p=projects[Number(card.dataset.index)];detailBody.innerHTML=`<small>${p.no} / ${p.en}</small><h2>${p.title}</h2><img class="heroImg" src="${p.images[0][0]}" alt="${p.title}"><p class="caption">${p.images[0][1]}</p><h3>项目概述</h3><p>${p.overview}</p><h3>设计重点</h3><ul>${p.focus.map(x=>`<li>${x}</li>`).join('')}</ul><h3>我的工作</h3><p>${p.role}</p><div class="gallery">${p.images.map(img=>`<figure><img src="${img[0]}" alt=""><figcaption>${img[1]}</figcaption></figure>`).join('')}</div>`;detail.classList.add('open');document.body.style.overflow='hidden';});
closeDetail.addEventListener('click',()=>{detail.classList.remove('open');document.body.style.overflow='';});
