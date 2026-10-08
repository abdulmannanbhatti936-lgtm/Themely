// Shared helpers (classic scripts share global scope, so other files use these)
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// Re-setting text after a tick makes polite live regions announce repeat messages (SC 4.1.3)
function say(m){const t=$('#toast');t.textContent='';setTimeout(()=>t.textContent=m,60);}

// Tabs: roving tabindex = only the selected tab is in the Tab order; arrows move between tabs
function initTabs(list){
  const tabs=$$('[role=tab]',list);
  const sel=t=>tabs.forEach(x=>{const on=x===t;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1;
    document.getElementById(x.getAttribute('aria-controls')).hidden=!on;});
  tabs.forEach((t,i)=>{t.onclick=()=>sel(t);
    t.onkeydown=e=>{const k={ArrowRight:i+1,ArrowLeft:i-1,Home:0,End:tabs.length-1}[e.key];
      if(k===undefined)return;e.preventDefault();const n=tabs[(k+tabs.length)%tabs.length];n.focus();sel(n);};});
}
$$('[role=tablist]').forEach(initTabs);

// Theme: native select, no ARIA needed
$('#theme').onchange=e=>document.documentElement.dataset.theme=e.target.value;

// Accordion: native buttons give Enter/Space for free; aria-expanded exposes state
$$('.acc button').forEach(b=>b.onclick=()=>{const o=b.getAttribute('aria-expanded')==='true';
  b.setAttribute('aria-expanded',!o);document.getElementById(b.getAttribute('aria-controls')).hidden=o;});

// Modal: move focus in, trap Tab, Esc closes, return focus to opener
const ov=$('#ov'),dlg=$('#dlg');let opener;
const bg=()=>$$('header,main,footer'); // inert = background unreachable by keyboard AND screen reader
function openD(){opener=document.activeElement;bg().forEach(x=>x.inert=true);ov.hidden=false;$('#cl').focus();}
function closeD(){ov.hidden=true;bg().forEach(x=>x.inert=false);opener.focus();}
$('#od').onclick=openD;$('#cl').onclick=closeD;
dlg.onkeydown=e=>{if(e.key==='Escape')closeD();
  if(e.key==='Tab'){const f=$$('button',dlg),a=f[0],z=f[f.length-1];
    if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}
    else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}};

// Menu button pattern
const mb=$('#mb'),ml=$('#ml'),mi=$$('[role=menuitem]',ml);
const om=i=>{ml.hidden=false;mb.setAttribute('aria-expanded',true);mi[i].focus();};
const cm=f=>{ml.hidden=true;mb.setAttribute('aria-expanded',false);if(f)mb.focus();};
mb.onclick=()=>ml.hidden?om(0):cm(1);
mb.onkeydown=e=>{if(e.key==='ArrowDown'){e.preventDefault();om(0);}if(e.key==='ArrowUp'){e.preventDefault();om(mi.length-1);}};
ml.onkeydown=e=>{const i=mi.indexOf(document.activeElement),
  m={ArrowDown:(i+1)%mi.length,ArrowUp:(i-1+mi.length)%mi.length,Home:0,End:mi.length-1}[e.key];
  if(m!==undefined){e.preventDefault();mi[m].focus();}else if(e.key==='Escape')cm(1);else if(e.key==='Tab')cm();};
mi.forEach(x=>x.onclick=()=>{cm(1);say(x.textContent+' chosen');});

// Form: error summary takes focus; each field gets aria-invalid + aria-describedby message (SC 3.3.1)
$('#f').onsubmit=e=>{e.preventDefault();const errs=[];
  ['name','email'].forEach(id=>{const i=$('#'+id);let m='';
    if(!i.value.trim())m=i.labels[0].textContent+' is required.';
    else if(id==='email'&&!/^\S+@\S+\.\S+$/.test(i.value))m='Enter a valid email like name@example.com.';
    i.setAttribute('aria-invalid',!!m);$('#e-'+id).textContent=m;if(m)errs.push([id,m]);});
  const s=$('#es');s.hidden=!errs.length;
  if(errs.length){s.innerHTML='<h4>'+errs.length+' error(s) found</h4><ul>'+errs.map(([i,m])=>`<li><a href="#${i}">${esc(m)}</a></li>`).join('')+'</ul>';s.focus();}
  else say('Form submitted successfully.');};
$('#es').onclick=e=>{if(e.target.tagName==='A'){e.preventDefault();$(e.target.hash).focus();}};
$('#tb').onclick=()=>say('Settings saved.');

// Sortable table: aria-sort on the th, only the active column carries it
$$('#dt th button').forEach(b=>b.onclick=()=>{const th=b.parentNode,asc=th.getAttribute('aria-sort')!=='ascending',c=th.cellIndex,tb=$('#dt tbody');
  $$('#dt th').forEach(x=>x.removeAttribute('aria-sort'));th.setAttribute('aria-sort',asc?'ascending':'descending');
  [...tb.rows].sort((x,y)=>x.cells[c].textContent.localeCompare(y.cells[c].textContent,undefined,{numeric:true})*(asc?1:-1)).forEach(r=>tb.append(r));
  say('Sorted by '+b.textContent+(asc?', ascending':', descending'));});

// Keyboard log (SC 2.4.3 focus order). Name shown is approximate, not the full accessible-name algorithm.
document.addEventListener('keydown',e=>{const a=document.activeElement,li=document.createElement('li');
  li.textContent=`${e.key} → <${a.tagName.toLowerCase()}> role=${a.getAttribute('role')||'-'} name="${(a.getAttribute('aria-label')||a.textContent||a.value||'').trim().slice(0,30)}"`;
  const l=$('#log');l.prepend(li);while(l.children.length>8)l.lastChild.remove();});

// ARIA inspector
function refreshInsp(){$$('#p1 *').forEach(x=>{const i=[...x.attributes].filter(a=>/^(role|aria-)/.test(a.name)).map(a=>a.name+'='+a.value).join(' ');
  if(i&&$('#insp').checked)x.dataset.info=i;else delete x.dataset.info;});}
$('#insp').onchange=e=>{document.body.classList.toggle('inspect',e.target.checked);refreshInsp();};
['click','keyup'].forEach(t=>document.addEventListener(t,()=>$('#insp').checked&&refreshInsp()));