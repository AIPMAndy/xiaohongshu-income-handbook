/* Progressive enhancement. No network requests, tracking or third-party scripts. */
(() => {
  'use strict';
  const book = window.HANDBOOK;
  if (!book || !Array.isArray(book.chapters)) return;
  const $ = s => document.querySelector(s);
  const h = (tag, cls, content) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (content !== undefined) el.textContent = content;
    return el;
  };
  const key = 'andy-xhs-handbook-progress-v1';
  let stored = {};
  try { stored = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (_) { stored = {}; }
  let chapterDone = new Set(Array.isArray(stored.chapters) ? stored.chapters : []);
  let dayDone = new Set(Array.isArray(stored.days) ? stored.days : []);
  let currentChapter = 0, currentWeek = 1;
  const toast = msg => { const el=$('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(()=>el.classList.remove('show'), 1900); };
  function save() { try { localStorage.setItem(key, JSON.stringify({chapters:[...chapterDone],days:[...dayDone]})); } catch (_) {} }
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).then(()=>toast('已复制到剪贴板')).catch(()=>fallbackCopy(text));
    fallbackCopy(text);
  }
  function fallbackCopy(text) {
    const input=h('textarea');input.value=text;input.style.cssText='position:fixed;left:-9999px;top:0';document.body.appendChild(input);input.focus();input.select();
    try { if (document.execCommand('copy')) toast('已复制到剪贴板'); else toast('请手动选择并复制'); } catch (_) { toast('复制受限，请手动复制'); }
    input.remove();
  }
  const routeData = [
    ['✧','技能服务','你有能交付的技能','service','适合：求职、设计、效率、咨询','先验证交付'],
    ['◈','品牌商单','用优质内容与品牌合作','sponsor','需要：账号与相应蒲公英权限','资格核验'],
    ['◎','低粉授权','原创笔记被品牌授权投放','ugc','依赖：资格、品牌选择、实际投放','不保底收益'],
    ['◇','买手带货','真实选品，获得佣金','buyer','需要：对应买手功能与资质','看净佣金'],
    ['▣','自己的店铺','自己卖货、发货和服务','shop','需要：类目资质、货源与售后','看退款后利润'],
    ['✦','知识产品','清单、工具包与小课程','digital','需要：可验证的产品价值','先做最小版'],
    ['⌂','本地经营','门店内容与到店交易','local','需要：营业主体及行业许可','看核销复购'],
  ];
  function recommendRoute(){
    const asset=$('#routeAsset').value,goal=$('#routeGoal').value;
    const rec={
      skill:['service','技能服务','先列出交付产物、服务时长、修改范围和退款规则。第一个验证目标：有人愿意为具体结果付费。'],
      product:['shop','自己的店铺','优先核对类目与履约能力，先用真实进货、退货和运费跑一笔账。'],
      shop:['local','本地经营','以可核销的到店服务和真实门店资质为起点，看履约与复购。'],
      content:['sponsor','品牌商单','先核对蒲公英资格，建立真实作品集；品牌是否选择合作不可保证。'],
      none:['start','先做需求验证','先用30条真实问题找可交付的小问题。此时不推荐开店囤货或直接购买投流。']
    }[asset].slice();
    if(asset==='skill'&&goal==='scale') rec.splice(0,3,'digital','知识产品（先验证服务）','先用服务验证高频问题，再把重复交付部分做成工具包；不要先做一整套大课。');
    if(asset==='content'&&goal==='light') rec.splice(0,3,'ugc','授权合作（资格先行）','可以查看符合条件的授权机制，但不是零门槛普惠补贴，也不保证被品牌选中。');
    if(asset==='product'&&goal==='light') rec[2]='先做小批量合规试销，确认退货与包装物流成本；不要因“0元入驻”就压库存。';
    const result=$('#routeResult');result.replaceChildren();result.append(h('strong','',`建议路径：${rec[1]}`),h('p','',rec[2]));
    const link=h('a','', '打开对应章节 →');link.href='#guide';link.addEventListener('click',()=>{const i=book.chapters.findIndex(c=>c.id===rec[0]);if(i>=0)selectChapter(i);});result.append(link);
  }
  function diagnose(){
    const views=num('#diagViews'),interests=num('#diagInterest'),leads=num('#diagLeads'),orders=num('#diagOrders');
    let title='',detail='';
    if(!views&&!interests&&!leads&&!orders){title='先建立基线';detail='先发布有来源、可验证的原创内容，记录至少一个完整观察周期。零数据无法证明被限流。';}
    else if(orders>0){title='先复盘真实订单';detail='核对订单来源、退款、交付时间和现金贡献。若扣除成本后为负，先修正价格和交付再扩量。';}
    else if(leads>0){title='优先检查报价与转化';detail='已有明确需求但没成交。抽查拒绝原因、定价、交付边界、信任凭证和平台允许的承接路径；不要直接断言“流量不行”。';}
    else if(interests>0){title='优先核对需求质量';detail='有人反馈，但尚未出现匹配的合格需求。把问题整理成具体场景，确认目标用户和交付物是否一致。';}
    else {title='先复核内容与样本';detail='目前只观察到浏览/曝光，没有可计量的需求反馈。核对笔记是否解答具体问题、搜索词是否匹配，以及样本是否足够；不能据此推断遭到限流。';}
    const root=$('#diagOutput');root.replaceChildren();root.append(h('strong','',title),h('p','',detail));
    root.append(h('small','','注意：不同入口与时间窗口可能导致指标不可直接比较；本工具不设所谓“平台标准转化率”。'));
  }
  function exportProgress(){
    const payload={schema:1,exportedAt:new Date().toISOString(),chapters:[...chapterDone],days:[...dayDone]};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);const a=h('a');a.href=url;a.download='xiaohongshu-learning-progress.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);toast('进度文件已生成，请妥善保存');
  }
  async function importProgress(file){
    if(!file)return;
    if(file.size>1024*128){toast('文件超过128KB，拒绝导入');return;}
    try{
      const data=JSON.parse(await file.text());const validChapters=new Set(book.chapters.map(c=>c.id));
      if(data.schema!==1||!Array.isArray(data.chapters)||!Array.isArray(data.days))throw Error('schema');
      if(data.chapters.length>book.chapters.length||data.days.length>book.plan.length)throw Error('too many');
      if(!data.chapters.every(x=>typeof x==='string'&&validChapters.has(x))||!data.days.every(x=>Number.isInteger(x)&&x>=1&&x<=30))throw Error('data');
      if(!window.confirm('确定使用该文件中的学习记录覆盖本机现有进度？'))return;
      chapterDone=new Set(data.chapters);dayDone=new Set(data.days);save();renderChapter();renderPlan();toast('学习记录已恢复');
    }catch(_){toast('备份格式无效，未修改当前记录');}
  }
  function makeRoutes(){
    const root = $('#routeGrid');root.replaceChildren();
    for(const [icon,title,desc,id,qualifier,tag] of routeData){
      const a=h('a','route-card glass');a.href='#guide';a.setAttribute('aria-label','查看'+title+'完整章节');
      a.append(h('span','route-icon',icon),h('span','route-badge',tag),h('h3','',title),h('p','',desc),h('div','route-foot',qualifier+' →'));
      a.addEventListener('click',()=>{const ix=book.chapters.findIndex(c=>c.id===id);if(ix!==-1)selectChapter(ix);});root.append(a);
    }
  }
  function countProgress(){
    $('#progressLabel').textContent=chapterDone.size+' / '+book.chapters.length;
    $('#progressFill').style.width=(chapterDone.size/book.chapters.length*100)+'%';
    $('#dayProgress').textContent='已完成 '+dayDone.size+' / '+book.plan.length+' 天';
  }
  function renderChapterList(){
    const root=$('#chapterList');root.replaceChildren();const q=$('#chapterSearch').value.toLowerCase().trim();let last='';let count=0;
    book.chapters.forEach((c,i)=>{
      const source=[c.title,c.lead,c.group,...c.steps.map(s=>s.action)].join(' ').toLowerCase(); if(q&&!source.includes(q))return;
      count++;if(last!==c.group){root.append(h('div','chapter-group',c.group.toUpperCase()));last=c.group;}
      const button=h('button','chapter-link'+(i===currentChapter?' active':'')+(chapterDone.has(c.id)?' done':''));button.type='button';button.dataset.chapterIndex=String(i);
      button.append(h('span','chapter-num',chapterDone.has(c.id)?'✓':String(i+1).padStart(2,'0')),h('span','',c.title));
      button.addEventListener('click',()=>selectChapter(i));root.append(button);
    });
    if(!count)root.append(h('div','chapter-group','没找到相关章节，可以换个关键词。'));
  }
  function renderChapter(){
    const c=book.chapters[currentChapter];
    $('#chapterCategory').textContent=c.group;
    $('#chapterNumber').textContent='CHAPTER '+String(currentChapter+1).padStart(2,'0')+' / '+book.chapters.length;
    $('#chapterTitle').textContent=c.title;
    $('#chapterLead').textContent=c.lead;
    const stepRoot=$('#chapterSteps');stepRoot.replaceChildren();
    c.steps.forEach((step,i)=>{
      const article=h('article','step-card');const head=h('div','step-head');head.append(h('span','step-num','STEP '+String(i+1).padStart(2,'0')),h('h4','',step.action));
      const meta=h('div','step-meta');const p1=h('div');p1.append(h('strong','', '完成凭证：'),document.createTextNode(step.proof));const p2=h('div');p2.append(h('strong','','受阻处理：'),document.createTextNode(step.stuck));meta.append(p1,p2);article.append(head,meta);stepRoot.append(article);
    });
    const check=$('#chapterCheck');check.replaceChildren();c.checklist.forEach(text=>check.append(h('li','',text)));
    const box=$('#chapterExample');box.replaceChildren();if(c.example){const ex=h('div','detail-box');ex.append(h('strong','','示例与边界：'),document.createTextNode(c.example));box.append(ex);}
    const pitfalls=$('#chapterPitfalls');pitfalls.replaceChildren();if(c.pitfalls.length){const p=h('div','detail-box warn');p.append(h('strong','','容易踩的坑：'),document.createTextNode(c.pitfalls.join(' · ')));pitfalls.append(p);}
    const sources=$('#chapterSources');sources.replaceChildren();if(c.source.length){const row=h('div','chapter-sourcelinks');c.source.forEach(id=>{const item=book.sources.find(s=>s.id===id);if(item){const a=h('a','',item.title+' ↗');a.href=item.url;a.target='_blank';a.rel='noopener noreferrer';row.append(a);}});sources.append(row);}
    $('#markDone').textContent=chapterDone.has(c.id)?'✓ 已完成 · 点击取消':'标记已完成 ✓';
    $('#nextChapter').disabled=currentChapter===book.chapters.length-1;
    $('#nextChapter').textContent=currentChapter===book.chapters.length-1?'全部章节已阅读':'下一章 →';
    renderChapterList();countProgress();
  }
  function selectChapter(i){currentChapter=Math.max(0,Math.min(book.chapters.length-1,i));renderChapter();}
  function renderPlan(){
    const titles=['第1周：找对问题','第2周：做出内容','第3周：拿到真实反馈','第4周：验证交付与盈利','第30天：复盘决策'];
    const desc=['先想清楚卖什么，再找想买的人。','从需求里写出有用的笔记。','先回答真正的问题，再做小产品。','不追流量神话，走完完整业务链路。','根据事实决定继续、调整或停止。'];
    $('#roadmapTitle').textContent=titles[currentWeek-1];$('#roadmapDesc').textContent=desc[currentWeek-1];
    document.querySelectorAll('.week-tab').forEach(b=>{b.classList.toggle('active',Number(b.dataset.week)===currentWeek);b.setAttribute('aria-pressed',String(Number(b.dataset.week)===currentWeek));});
    const list=$('#daysList');list.replaceChildren();
    const days=book.plan.filter(d=>Math.min(d.week,5)===currentWeek);
    days.forEach(day=>{
      const label=h('label','day-card'+(dayDone.has(day.day)?' done':''));const input=h('input');input.type='checkbox';input.checked=dayDone.has(day.day);input.setAttribute('aria-label','完成第'+day.day+'天任务');
      input.addEventListener('change',()=>{if(input.checked)dayDone.add(day.day);else dayDone.delete(day.day);save();renderPlan();countProgress();});
      const detail=h('div');detail.append(h('strong','','DAY '+String(day.day).padStart(2,'0')+' · '+day.task),h('p','','验收：'+day.proof));label.append(input,detail);list.append(label);
    });countProgress();
  }
  function makeTemplates(){const root=$('#toolGrid');root.replaceChildren();book.templates.forEach((item,i)=>{const card=h('article','tool-card glass');const top=h('div','tool-card-top');const button=h('button','','复制模板 ↗');button.type='button';button.addEventListener('click',()=>copy(item.title+'\n\n'+item.text));top.append(h('span','tool-num','TOOL '+String(i+1).padStart(2,'0')),button);card.append(top,h('h3','',item.title),h('p','',item.desc));root.append(card);});}
  function makeSources(){const root=$('#sourcesGrid');root.replaceChildren();book.sources.forEach(item=>{const a=h('a','source-item');a.href=item.url;a.target='_blank';a.rel='noopener noreferrer';const wrap=h('span');wrap.append(h('strong','',item.title),h('small','',item.note));a.append(h('span','source-badge','↗'),wrap);root.append(a);});}
  const money = n => '¥ '+(Math.abs(n)<0.005?0:n).toLocaleString('zh-CN',{minimumFractionDigits:0,maximumFractionDigits:2});
  const num = id => Math.max(0,Number($(id).value)||0);
  function calculate(){
    const price=num('#calcPrice'),qty=Math.floor(num('#calcQty')),variable=num('#calcCost'),fixed=num('#calcFixed');
    const hours=num('#calcHours'),refund=Math.min(100,num('#calcRefund'))/100;
    const platform=Math.min(100,num('#calcPlatform'))/100,labor=num('#calcLabor');
    const gross=price*qty*(1-refund),platformFees=gross*platform;
    const total=gross-variable*qty-fixed-platformFees;
    const hourTotal=hours*qty,unit=qty?total/qty:0,economic=total-hourTotal*labor;
    const denominator=qty*(1-refund)*(1-platform);
    const breakEven=denominator>0?(variable*qty+fixed)/denominator:null;
    $('#calcGross').textContent=money(gross);$('#calcNet').textContent=money(total);$('#calcUnit').textContent=money(unit);
    $('#calcTotalHours').textContent=hourTotal.toLocaleString('zh-CN',{maximumFractionDigits:2})+' h';
    $('#calcHourly').textContent=hourTotal>0?money(total/hourTotal):'—';
    $('#calcEconomic').textContent=money(economic);
    $('#calcBreakEven').textContent=breakEven===null?'无法计算':money(breakEven);
    $('#calcNet').classList.toggle('negative',total<0);
    $('#calcEconomic').classList.toggle('negative',economic<0);
    $('#calcAdvice').textContent=qty===0?'没有模拟订单。若已投入固定成本，当前为负贡献。':total<0?'现金贡献为负，先检查费率、成本和退货损失，暂停盲目放量。':economic<0?'现金贡献为正，但按你填写的时间价值计算，经济结余为负。请考虑提价或优化交付。':total===0?'现金贡献刚好打平，税费及未填成本仍需核算。':'已覆盖当前所填的现金成本和估算人工，但不代表可以保证获客或盈利。';
  }
  function preset(name){const vals={service:[400,1,50,0,2.5,0,0,0],brand:[800,1,150,0,6,0,0,0],store:[99,10,76,0,.4,0,0,0]}[name];['#calcPrice','#calcQty','#calcCost','#calcFixed','#calcHours','#calcRefund','#calcPlatform','#calcLabor'].forEach((selector,i)=>{$(selector).value=String(vals[i]);});document.querySelectorAll('[data-preset]').forEach(el=>{el.classList.toggle('active',el.dataset.preset===name);el.setAttribute('aria-pressed',String(el.dataset.preset===name));});calculate();}
  function setup(){
    makeRoutes();makeTemplates();makeSources();renderChapter();renderPlan();recommendRoute();diagnose();calculate();
    $('#chapterSearch').addEventListener('input',renderChapterList);
    ['#routeAsset','#routeGoal'].forEach(id=>$(id).addEventListener('change',recommendRoute));
    document.querySelectorAll('.diag-grid input').forEach(el=>el.addEventListener('input',diagnose));
    $('#exportProgress').addEventListener('click',exportProgress);
    $('#importProgress').addEventListener('click',()=>$('#importProgressFile').click());
    $('#importProgressFile').addEventListener('change',async e=>{await importProgress(e.target.files?.[0]);e.target.value='';});
    $('#resetProgress').addEventListener('click',()=>{if(window.confirm('清空当前浏览器里的全部章节和30天进度？此操作无法撤销，请先导出备份。')){chapterDone.clear();dayDone.clear();save();renderChapter();renderPlan();toast('进度已清空');}});
    $('#markDone').addEventListener('click',()=>{const id=book.chapters[currentChapter].id;if(chapterDone.has(id))chapterDone.delete(id);else chapterDone.add(id);save();renderChapter();toast(chapterDone.has(id)?'已记录完成':'已取消完成');});
    $('#nextChapter').addEventListener('click',()=>{if(currentChapter<book.chapters.length-1){selectChapter(currentChapter+1);$('#chapterTitle').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});}});
    document.querySelectorAll('.week-tab').forEach(b=>b.addEventListener('click',()=>{currentWeek=Number(b.dataset.week);renderPlan();}));
    document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>preset(b.dataset.preset)));
    document.querySelectorAll('.calc-grid input').forEach(x=>x.addEventListener('input',calculate));
    $('#copyWechat').addEventListener('click',()=>copy('AIPMAndy'));
    const mobile=$('#mobileMenu'),links=$('#mobileLinks');mobile.addEventListener('click',()=>{const opened=mobile.getAttribute('aria-expanded')==='true';mobile.setAttribute('aria-expanded',String(!opened));links.hidden=opened;});
    links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{links.hidden=true;mobile.setAttribute('aria-expanded','false');}));
  }
  setup();
})();
