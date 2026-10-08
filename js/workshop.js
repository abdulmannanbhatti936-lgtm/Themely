const IMG="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%230b57d0'/%3E%3C/svg%3E";
// BEFORE: every line below contains a deliberate failure (see the issue list)
const B=p=>`<h2>ShopFast</h2><a href="#" tabindex="3">Sale</a> <a href="#" tabindex="1">Home</a>
<h4>Featured</h4><p style="color:#aaa">Free shipping on all orders</p>
<img src="${IMG}" width="40" height="40"> <img src="${IMG}" width="20" height="20" alt="line">
<p><div class="btn" onclick="this.textContent='Added!'">Add to cart</div> <button><i></i></button></p>
<p class="ic"><input placeholder="Email"> <input class="err" value="abc" placeholder="Phone"></p>
<p><a href="#">click here</a></p>
<p><input placeholder="Search (trap)" onkeydown="if(event.key==='Escape')this.blur();else if(event.key==='Tab')event.preventDefault()"><br><small>Trap demo: press Esc to leave.</small></p>
<p>Deal ends in <span class="tick">0</span>s</p>
<table><tr><td>Item</td><td>Price</td></tr><tr><td>Mug</td><td>$8</td></tr></table>
<div style="width:400px;height:2em;overflow:hidden;font-size:12px">Limited offer: long promotional text that will clip when text is resized or spaced.</div>
<p><button onclick="this.nextElementSibling.textContent='Subscribed!'">Subscribe</button><span></span></p>`;
// AFTER: same content, every issue fixed (em units so it scales with zoom)
const A=p=>`<h2>ShopFast</h2><nav aria-label="Main"><a href="#">Home</a> <a href="#">Sale</a></nav>
<h3>Featured</h3><p style="color:#595959">Free shipping on all orders</p>
<img src="${IMG}" width="40" height="40" alt="Blue mug"> <img src="${IMG}" width="20" height="20" alt="">
<p><button class="go" type="button" onclick="this.textContent='Added!'">Add to cart</button> <button class="ic" type="button" aria-label="Close"><i aria-hidden="true"></i></button></p>
<p><label for="${p}e">Email</label><br><input id="${p}e" autocomplete="email"></p>
<p><label for="${p}p">Phone</label><br><input id="${p}p" aria-invalid="true" aria-describedby="${p}pe"><br><small id="${p}pe">⚠ Invalid phone number</small></p>
<p><a href="#">View sale details</a></p>
<p><label for="${p}s">Search</label><br><input id="${p}s"></p>
<p>Deal ends in <span class="tick">0</span>s <button class="pause" type="button">Pause</button></p>
<table><caption>Prices</caption><thead><tr><th scope="col">Item</th><th scope="col">Price</th></tr></thead><tbody><tr><td>Mug</td><td>$8</td></tr></tbody></table>
<div class="promo" style="font-size:1em">Limited offer: long promotional text that wraps and never clips.</div>
<p><button type="button" onclick="this.nextElementSibling.textContent='Subscribed!'">Subscribe</button><span role="status"></span></p>`;
[['sB',B,'s','bad'],['sA',A,'s','good'],['wB',B,'w','bad'],['wA',A,'w','good']].forEach(([id,f,p,c])=>{const e=$('#'+id);e.innerHTML=f(p);e.classList.add(c);});

// Ticker: Before has no pause (SC 2.2.2); After pauses via button
setInterval(()=>$$('.tick').forEach(t=>{if(!t.dataset.p)t.textContent=+t.textContent+1;}),1000);
document.addEventListener('click',e=>{if(e.target.matches('.pause')){const t=e.target.closest('.ui').querySelector('.tick');
  t.dataset.p=t.dataset.p?'':'1';e.target.textContent=t.dataset.p?'Resume':'Pause';}});

// [description, "SC name", level, affected users, how to detect, how to fix, before, after]
const I=[
['Low-contrast text','1.4.3 Contrast (Minimum)','AA','Low vision','Contrast checker / axe','Use at least 4.5:1','color:#aaa','color:#595959'],
['Faint input border','1.4.11 Non-text Contrast','AA','Low vision','Measure border vs background','Use at least 3:1','border:1px solid #ddd','border:2px solid #6b7280'],
['Image missing alt','1.1.1 Non-text Content','A','Blind users','axe: image-alt','Add meaningful alt','<img src="mug.png">','<img src="mug.png" alt="Blue mug">'],
['Decorative image announced','1.1.1 Non-text Content','A','Screen reader users','Listen with a screen reader','Use empty alt','<img alt="line">','<img alt="">'],
['Clickable div','2.1.1 Keyboard','A','Keyboard users','Tab through the page','Use a real button','<div onclick="...">','<button type="button">'],
['Placeholder-only field','3.3.2 Labels or Instructions','A','Screen reader, cognitive','Look for visible labels','Add a label','<input placeholder="Email">','<label for="e">Email</label><input id="e">'],
['Color-only error','1.4.1 Use of Color','A','Color-blind users','Apply greyscale filter','Add text/icon and aria-invalid','border-color:red','<small>⚠ Invalid phone</small>'],
['No focus indicator','2.4.7 Focus Visible','AA','Keyboard users','Tab and watch','Never remove outline unreplaced',':focus{outline:none}',':focus-visible{outline:3px solid}'],
['Positive tabindex','2.4.3 Focus Order','A','Keyboard, SR users','Compare Tab order to visual order','Use DOM order','tabindex="3"','(no tabindex)'],
['Missing page language','3.1.1 Language of Page','A','Screen reader users','Inspect <html>','Add lang','<html>','<html lang="en">'],
['"click here" link','2.4.4 Link Purpose (In Context)','A','Screen reader users','Open the links list','Descriptive link text','click here','View sale details'],
['Skipped heading level','1.3.1 Info and Relationships','A','Screen reader users','Headings outline','Use sequential levels','<h2>…<h4>','<h2>…<h3>'],
['Keyboard trap','2.1.2 No Keyboard Trap','A','Keyboard users','Try to Tab out of fields','Do not block Tab','keydown: preventDefault on Tab','(remove handler)'],
['Auto-updating, no pause','2.2.2 Pause, Stop, Hide','A','Cognitive, SR users','Watch for moving content','Add Pause control','setInterval only','+ Pause button'],
['Icon-only button, no name','4.1.2 Name, Role, Value','A','Screen reader, voice users','Check accessibility tree','Add aria-label','<button><i></i></button>','<button aria-label="Close">'],
['Table without headers','1.3.1 Info and Relationships','A','Screen reader users','Navigate table cells','Use th scope + caption','<td>Item</td>','<th scope="col">Item</th>'],
['Fixed px sizes','1.4.4 Resize Text','AA','Low vision','Zoom to 200%','Use em/rem, no fixed height','height:2em;font-size:12px','min-height;font-size:1em'],
['Status not announced','4.1.3 Status Messages','AA','Screen reader users','Test with a screen reader','Add role="status"','<span></span>','<span role="status"></span>']];
$('#tr').innerHTML=I.map((x,i)=>`<li class="card"><h4>${esc(x[0])} (SC ${esc(x[1])}, Level ${x[2]})</h4>
<p>Affects: ${esc(x[3])}. Detect: ${esc(x[4])}. Fix: ${esc(x[5])}.</p>
<pre><code>Before: ${esc(x[6])}\nAfter:  ${esc(x[7])}</code></pre>
<label><input type="checkbox" class="fd" aria-label="Found: ${esc(x[0])}"> Found</label>
<label><input type="checkbox" aria-label="Fixed: ${esc(x[0])}"> Fixed</label></li>`).join('');
const prog=()=>$('#prog').textContent=`Found ${$$('.fd:checked').length} of ${I.length} issues`;
$('#tr').onchange=prog;prog();

// Before / After / side-by-side
$$('[name=vw]').forEach(r=>r.onchange=()=>{const v=r.value;$('#wB').hidden=v==='A';$('#wA').hidden=v==='B';$('#wv').classList.toggle('side',v==='S');});