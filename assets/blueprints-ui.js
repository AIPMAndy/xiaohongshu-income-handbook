/* Independent launch-kit UI: no trackers, network requests, or backend accounts. */
(()=>{
  'use strict';
  const data=window.XHS_BLUEPRINTS;
  if(!data) return;
  const $=s=>document.querySelector(s);
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
  const storageKey='xhs-launch-checklist-v1';
  let active='service';
  const keys=['service','digital','store','local'];
  const names={service:'技能咨询',digital:'知识产品',store:'自有商品',local:'本地门店'};
  const checkpoints=[
    ['01','打开小红书 App，登录本人账号','检查设置中的账号状态、手机号和违规通知；不用购买新号或代实名。'],
    ['02','进入当前可见的「创作者中心」或类似入口','只记录自己实际能看到的权限；按钮名称以最新版 App 为准。'],
    ['03','在下一节选择一个起号身份','技能咨询、知识产品、商品或门店，只选一个主线。'],
    ['04','写一句定位：帮助谁解决什么','能在五秒内解释清楚的人群、问题、交付方式。'],
    ['05','改好头像、名称和简介','头像和经历真实，简介不写收益保证或未经授权的身份。'],
    ['06','确定3个置顶主题','我是谁 / 解决问题的真实过程 / 产品与边界。先写题纲，不需要伪造作品。'],
    ['07','从行业脚本挑一篇改写','补上实际经验、图片、来源与可执行的步骤，不能直接冒充亲历。'],
    ['08','完成发布前检查与记录','检查是否需要 AI/营销标识，确认个人隐私、价格、资质及交易路径。']
  ];
  let checked=new Set();
  try{let v=JSON.parse(localStorage.getItem(storageKey)||'[]');if(Array.isArray(v))checked=new Set(v.filter(i=>Number.isInteger(i)&&i>=0&&i<8));}catch(_){/* private mode */}
  const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify([...checked]));}catch(_){}};
  const drawCheck=()=>{
    const root=$('#launchChecklist');root.replaceChildren();
    checkpoints.forEach(([n,title,desc],i)=>{
      const label=el('label','launch-task'+(checked.has(i)?' checked':''));
      const cb=el('input');cb.type='checkbox';cb.checked=checked.has(i);
      cb.addEventListener('change',()=>{cb.checked?checked.add(i):checked.delete(i);save();drawCheck()});
      const text=el('span','launch-task-text');text.append(el('strong','',title),el('small','',desc));
      label.append(cb,el('span','launch-task-index',n),text);root.append(label);
    });
    $('#launchProgress').textContent=`${checked.size} / ${checkpoints.length} 已完成`;
  };
  const copy=async value=>{
    try{
      if(navigator.clipboard && window.isSecureContext){await navigator.clipboard.writeText(value);showMessage('已复制，可以粘贴修改');return}
      const t=el('textarea');t.value=value;t.style.cssText='position:fixed;left:-9999px;top:-9999px';document.body.append(t);t.select();
      if(document.execCommand('copy'))showMessage('已复制，可以粘贴修改');else showMessage('复制受限，请手动选择文字');t.remove();
    }catch(_){showMessage('复制受限，请手动选择文字')}
  };
  const showMessage=value=>{const existing=$('#copyFeedback');if(existing)existing.remove();let s=el('div','copy-feedback',value);s.id='copyFeedback';s.setAttribute('role','status');document.body.append(s);setTimeout(()=>s.remove(),3200)};
  const getProfile=()=>data.profiles[active];
  const drawPersona=()=>{
    const profile=getProfile();const tabs=$('#personaTabs');tabs.replaceChildren();
    keys.forEach(key=>{const b=el('button','persona-tab'+(key===active?' active':''),data.profiles[key].label);b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-selected',String(key===active));b.addEventListener('click',()=>{active=key;drawPersona();drawNotes()});tabs.append(b)});
    const put=(sel,text)=>$(sel).textContent=text;
    put('#personaTag',names[active].toUpperCase()+' / READY TO ADAPT');
    put('#personaTitle',profile.label+' · 起号方案');put('#personaSubtitle',profile.short);
    put('#personaCustomer',profile.persona);put('#personaProblem',profile.problem);
    put('#personaProof',profile.proof);put('#personaOffer',profile.offer);put('#personaBoundary',profile.boundary);
    put('#personaProfile',profile.profile);put('#personaSheet',profile.offer_sheet);
    put('#personaResponse',profile.response);put('#personaQueries',profile.queries.map(x=>'「'+x+'」').join('  '));
    const pin=$('#personaPinned');pin.replaceChildren();profile.pinned.forEach(x=>pin.append(el('li','',x)));
  };
  const copyText=type=>{const p=getProfile();return type==='pinned'?p.pinned.map((x,i)=>(i+1)+'. '+x).join('\n'):type==='profile'?p.profile:type==='response'?p.response:p.offer_sheet};
  const noteText=(note)=>{
    const [title,cover,intro,steps,cta]=note;
    return `【标题】${title}\n\n【封面主标题】${cover}\n\n【正文（请用自己的真实事实和示例改写）】\n${intro}\n\n${steps}\n\n【结尾】${cta}\n\n【发布前自检】补上亲自验证的示例；核对图片、来源、身份、AI/营销标识；不得承诺收入或绕过平台交易规则。`;
  };
  const drawNotes=()=>{
    const root=$('#notesCards');root.replaceChildren();$('#notesIndustry').textContent=names[active];
    getProfile().notes.forEach((item,i)=>{
      const article=el('article','note-card');const tag=el('div','note-number',String(i+1).padStart(2,'0')+' / READY-TO-EDIT NOTE');
      const title=el('h3','',item[0]);const cover=el('div','note-cover');cover.append(el('span','','封面主标题'),el('strong','',item[1]));
      const body=el('div','note-body');body.append(el('strong','','正文示例'),el('p','',item[2]),el('p','',item[3]));
      const end=el('div','note-ending');end.append(el('strong','','结尾互动'),el('p','',item[4]));
      const b=el('button','copy-button','复制完整笔记 ↗');b.type='button';b.addEventListener('click',()=>copy(noteText(item)));
      article.append(tag,title,cover,body,end,b);root.append(article);
    });
  };
  function setup(){
    drawCheck();drawPersona();drawNotes();
    $('#resetLaunch').addEventListener('click',()=>{if(window.confirm('清空起号清单的8项勾选记录？')){checked.clear();save();drawCheck()}});
    document.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',()=>copy(copyText(b.dataset.copy))));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
