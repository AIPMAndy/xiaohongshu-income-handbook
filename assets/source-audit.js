/* Source desk: reads the same historical references as the handbook.
 * User checkmarks are private self-review notes, NOT publisher verification.
 * No network calls, analytics, or third-party dependencies. */
(() => {
  'use strict';
  const STORAGE_KEY = 'andy-xhs-source-self-review-v1';
  const CATEGORIES = {platform:'平台运营 / 商单', merchant:'商家 / 类目 / 本地', law:'法规 / 标注'};
  function categoryFor(s) {
    if (['law','guide','ai_mark'].includes(s.id)) return 'law';
    if (['merchant','merchant_current','rules','ec','local','learning','digital_qual'].includes(s.id)) return 'merchant';
    return 'platform';
  }
  function normalizeSources(sources) {
    if (!Array.isArray(sources)) return [];
    return sources.filter(s => s && typeof s.id === 'string' && typeof s.title === 'string'
      && typeof s.url === 'string' && /^https:\/\//.test(s.url)).map(s => ({
      id:s.id,title:s.title,url:s.url,note:String(s.note || ''),category:categoryFor(s)
    }));
  }
  function filteredSources(sources, filter, review) {
    const q=String(filter.q||'').trim().toLocaleLowerCase('zh-CN');
    return sources.filter(s=>{
      if (filter.category && filter.category!=='all' && s.category!==filter.category) return false;
      const done=Boolean(review[s.id]);
      if(filter.status==='reviewed'&&!done || filter.status==='pending'&&done) return false;
      return !q || [s.id,s.title,s.note,s.url,CATEGORIES[s.category]].join(' ').toLocaleLowerCase('zh-CN').includes(q);
    });
  }
  function exportText(sources, review, createdAt) {
    const clean=v=>String(v||'').replace(/[\r\n\t]+/g,' ').trim();
    const header=['小红书官方来源 · 当前筛选人工复核清单',
      '导出时间：'+clean(createdAt),'来源：AIPMAndy/xiaohongshu-income-handbook/assets/data.js',
      '历史资料核对截点：2026-11-02（不等于所有链接当天已核验）',
      '重要：本机勾选仅代表使用者自己的复核笔记，不代表作者或平台确认有效。',
      '原教程 URL：https://aipmandy.github.io/xiaohongshu-income-handbook/',
      '个人微信：AIPMAndy｜个人官网：https://metaver.vip/｜公司官网：https://www.a6no1.cn/',
      '记录条数：'+sources.length,''];
    const rows=sources.map((s,i)=>[
      '【'+(i+1)+'】'+clean(s.title),'分类：'+CATEGORIES[s.category],
      '原始 URL：'+clean(s.url),'原注释：'+clean(s.note),
      '我的核验状态：'+(review[s.id]?'已自行复核｜'+clean(review[s.id]):'待自行复核'),
      '须自行检查：页面是否可访问 / 适用主体与资质 / 最新修订版 / 当前后台权限',''
    ].join('\n'));
    return '\ufeff'+header.concat(rows).join('\n');
  }
  const api={normalizeSources,filteredSources,exportText,categoryFor};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  if(typeof document==='undefined') return;
  const $=id=>document.getElementById(id);
  const create=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x;};
  const sourceData=normalizeSources(window.HANDBOOK?.sources||[]);
  const idSet=new Set(sourceData.map(s=>s.id));
  let review={};
  try {
    const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
    if(raw&&typeof raw==='object'&&!Array.isArray(raw)) {
      for(const [id,date] of Object.entries(raw))if(idSet.has(id)&&typeof date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(date))review[id]=date;
    }
  }catch(_){}
  const announce=msg=>{$('notice').textContent=msg;};
  function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(review));}catch(_){announce('本机存储受限；本次勾选不会自动保存，请下载 TXT。');}}
  function currentFilter(){return {q:$('search').value,category:$('category').value,status:$('reviewStatus').value};}
  function render(){
    const list=filteredSources(sourceData,currentFilter(),review);
    const root=$('sourceResults');root.replaceChildren();
    $('resultCount').textContent='展示 '+list.length+' / '+sourceData.length+' 条来源（'+new Set(list.map(x=>x.url)).size+' 个去重 URL）';
    if(!list.length){root.append(create('div','empty','没有匹配来源。尝试清除筛选，或更换关键词。'));return;}
    for(const s of list){
      const item=create('article','item');const head=create('div','item-top');
      head.append(create('span','type',CATEGORIES[s.category]),create('span','date-note','历史条目 · 2026-11-02 截点'));
      item.append(head,create('h3','',s.title),create('p','',s.note));
      const link=create('a','','打开原始官方来源 ↗');link.href=s.url;link.target='_blank';link.rel='noopener noreferrer';
      item.append(link);
      const foot=create('div','item-foot');const label=create('label');
      const input=create('input');input.type='checkbox';input.checked=Boolean(review[s.id]);input.setAttribute('aria-label','标记“'+s.title+'”为我已自行复核');
      input.addEventListener('change',()=>{
        if(input.checked)review[s.id]=new Date().toISOString().slice(0,10);
        else delete review[s.id];
        save();announce(input.checked?'已记录你的本机复核日期':'已撤销本机复核标记');
        render();
      });
      label.append(input,create('span','', '我已自行复核（不代表平台确认）'));
      foot.append(label,create('span',review[s.id]?'date-note reviewed':'date-note',review[s.id]?'本机：'+review[s.id]:'未自行复核'));
      item.append(foot);root.append(item);
    }
  }
  $('recordCount').textContent=String(sourceData.length);
  $('urlCount').textContent=String(new Set(sourceData.map(s=>s.url)).size);
  for(const id of ['search','category','reviewStatus'])$(id).addEventListener(id==='search'?'input':'change',render);
  $('reset').addEventListener('click',()=>{$('search').value='';$('category').value='all';$('reviewStatus').value='all';render();$('search').focus();});
  $('export').addEventListener('click',()=>{
    const rows=filteredSources(sourceData,currentFilter(),review);
    if(!rows.length){announce('没有可导出来源，请调整筛选。');return;}
    const out=exportText(rows,review,new Date().toISOString());
    const url=URL.createObjectURL(new Blob([out],{type:'text/plain;charset=utf-8'}));
    const a=create('a');a.href=url;a.download='xiaohongshu-source-review-'+new Date().toISOString().slice(0,10)+'.txt';
    document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    announce('已准备 '+rows.length+' 条来源的 TXT 复核清单');
  });
  $('copyWechat').addEventListener('click',async()=>{
    const value='AIPMAndy';
    try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(value);announce('已复制微信 AIPMAndy');return;}}catch(_){}
    const field=create('textarea');field.value=value;field.style.position='fixed';field.style.left='-9999px';
    document.body.append(field);field.select();let copied=false;try{copied=document.execCommand('copy');}catch(_){}field.remove();
    announce(copied?'已复制微信 AIPMAndy':'复制受限，请手动复制：AIPMAndy');
  });
  render();
})();
