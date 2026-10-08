// WCAG 2.x relative luminance. 0.03928 is the threshold printed in WCAG 2.x (sRGB spec says 0.04045; results are the same to 2 decimals)
const hex2rgb=h=>{h=h.replace('#','');if(h.length===3)h=[...h].map(c=>c+c).join('');return /^[0-9a-f]{6}$/i.test(h)?[0,2,4].map(i=>parseInt(h.substr(i,2),16)):null;};
const lum=c=>{const [r,g,b]=c.map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return .2126*r+.7152*g+.0722*b;};
const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
const toHex=c=>'#'+c.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
// Move the text color toward black or white in 1% steps until the target ratio is met
function nearest(f,b,t){const to=lum(b)>.18?0:255;for(let i=0;i<=100;i++){const c=f.map(v=>v+(to-v)*i/100);if(ratio(c,b)>=t)return toHex(c);}return null;}

const tests=[['Normal text AA',4.5],['Large text AA',3],['UI components/graphics AA (SC 1.4.11)',3],['Normal text AAA',7],['Large text AAA',4.5]];
function run(){const f=hex2rgb($('#fgh').value),b=hex2rgb($('#bgh').value);
  if(!f||!b){$('#ratio').textContent='Enter valid hex colors like #1a1a1a.';return;}
  const r=ratio(f,b);$('#ratio').textContent=r.toFixed(2)+':1';
  // Pass/fail uses text + icon, never color alone (SC 1.4.1)
  $('#res').innerHTML=tests.map(([n,t])=>`<li>${r>=t?'✔ Pass':'✖ Fail'}: ${n} (needs ${t}:1)</li>`).join('');
  $('#pv').style.color=toHex(f);$('#pv').style.background=toHex(b);}
function sync(c,h){c.oninput=()=>{h.value=c.value;run();};h.oninput=()=>{const r=hex2rgb(h.value);if(r){c.value=toHex(r);run();}};}
sync($('#fg'),$('#fgh'));sync($('#bg'),$('#bgh'));run();
$('#sug').onclick=()=>{const f=hex2rgb($('#fgh').value),b=hex2rgb($('#bgh').value);if(!f||!b)return;
  const c=nearest(f,b,+$('#tgt').value);
  if(c){$('#fgh').value=$('#fg').value=c;run();say('Suggested text color '+c);}else say('No passing text color for this background. Change the background.');};

// Scanner: finds elements with their own text nodes, walks up to find the effective background
function bgOf(el){while(el){const m=getComputedStyle(el).backgroundColor.match(/[\d.]+/g);if(m&&(m.length<4||+m[3]>0))return m.slice(0,3).map(Number);el=el.parentElement;}return[255,255,255];}
$('#scan').onclick=()=>{const rows=[];
  $$('#stage .ui *').forEach(el=>{if(![...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))return;
    const cs=getComputedStyle(el),fg=cs.color.match(/[\d.]+/g).slice(0,3).map(Number),bgc=bgOf(el),r=ratio(fg,bgc),
      px=parseFloat(cs.fontSize),large=px>=24||(+cs.fontWeight>=700&&px>=18.66),need=large?3:4.5;
    if(r<need)rows.push(`<tr><td>${el.closest('.ui').dataset.v}</td><td>&lt;${el.tagName.toLowerCase()}&gt; ${esc(el.textContent.trim().slice(0,22))}</td><td>${toHex(fg)} on ${toHex(bgc)}</td><td>${r.toFixed(2)}:1</td><td>${need}:1</td><td>${nearest(fg,bgc,need)||'change background'}</td></tr>`);});
  $('#scanT tbody').innerHTML=rows.join('')||'<tr><td colspan="6">No failures found (opacity and images are not analyzed).</td></tr>';
  $('#mres').textContent=rows.length+' contrast failure(s) found.';};

// Magnification tests act on #stage (simulation only)
const st=$('#stage');
$('#zm').oninput=e=>{st.style.fontSize=e.target.value+'%';$('#zo').textContent=e.target.value+'%';
  $('#mres').textContent='At 200%+ check that no content or function is lost (SC 1.4.4).';};
function tog(b,fn){b.onclick=()=>{const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on);fn(on);};}
tog($('#rf'),on=>{st.style.width=on?'320px':'';
  $('#mres').textContent=on?(st.scrollWidth>st.clientWidth?'✖ Horizontal scrolling at 320px (fails SC 1.4.10).':'✔ No horizontal scrolling at 320px.'):'Reflow test off.';});
tog($('#tsp'),on=>{st.classList.toggle('ts',on);
  if(!on){$('#mres').textContent='Text spacing off.';return;}
  const c=$$('#stage *').filter(e=>getComputedStyle(e).overflow!=='visible'&&e.scrollHeight>e.clientHeight+1);
  $('#mres').textContent=c.length?'✖ '+c.length+' element(s) clip content (fails SC 1.4.12).':'✔ No clipping detected.';});
$('#cb').onchange=e=>st.style.filter=e.target.value?`url(#${e.target.value})`:'';