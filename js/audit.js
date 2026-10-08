// [principle, SC, name] (WCAG 2.1 Level A/AA only)
const C=[['Perceivable','1.1.1','Non-text Content'],['Perceivable','1.2.2','Captions (Prerecorded)'],['Perceivable','1.3.1','Info and Relationships'],
['Perceivable','1.3.4','Orientation'],['Perceivable','1.3.5','Identify Input Purpose'],['Perceivable','1.4.1','Use of Color'],['Perceivable','1.4.3','Contrast (Minimum)'],
['Perceivable','1.4.4','Resize Text'],['Perceivable','1.4.5','Images of Text'],['Perceivable','1.4.10','Reflow'],['Perceivable','1.4.11','Non-text Contrast'],
['Perceivable','1.4.12','Text Spacing'],['Perceivable','1.4.13','Content on Hover or Focus'],
['Operable','2.1.1','Keyboard'],['Operable','2.1.2','No Keyboard Trap'],['Operable','2.2.2','Pause, Stop, Hide'],['Operable','2.4.1','Bypass Blocks'],
['Operable','2.4.2','Page Titled'],['Operable','2.4.3','Focus Order'],['Operable','2.4.4','Link Purpose (In Context)'],['Operable','2.4.6','Headings and Labels'],
['Operable','2.4.7','Focus Visible'],['Operable','2.5.3','Label in Name'],
['Understandable','3.1.1','Language of Page'],['Understandable','3.2.1','On Focus'],['Understandable','3.3.1','Error Identification'],
['Understandable','3.3.2','Labels or Instructions'],['Understandable','3.3.3','Error Suggestion'],
['Robust','4.1.1','Parsing'],['Robust','4.1.2','Name, Role, Value'],['Robust','4.1.3','Status Messages']];
$('#ck').innerHTML=C.map((c,i)=>`<fieldset class="card"><legend>${c[0]}: SC ${c[1]} ${c[2]}</legend>
${['pass','fail','na'].map(v=>`<label><input type="radio" name="r${i}" value="${v}"> ${{pass:'Pass',fail:'Fail',na:'Not applicable'}[v]}</label>`).join(' ')}
<br><label for="n${i}">Notes</label> <input id="n${i}" style="width:min(100%,24rem)"></fieldset>`).join('');

let txt='';
function build(){const P={},fails=[];
  C.forEach((c,i)=>{const v=($(`[name=r${i}]:checked`)||{}).value,p=P[c[0]]=P[c[0]]||{pass:0,fail:0,na:0,u:0};
    p[v||'u']++;if(v==='fail')fails.push(`SC ${c[1]} ${c[2]}: ${$('#n'+i).value||'(no notes)'}`);});
  const L=['A11y Lab audit report','='.repeat(22)];
  Object.entries(P).forEach(([k,p])=>{const t=p.pass+p.fail;L.push(`${k}: pass ${p.pass}, fail ${p.fail}, N/A ${p.na}, untested ${p.u}, pass rate ${t?Math.round(p.pass/t*100)+'%':'n/a'}`);});
  L.push('','Failed items:',...(fails.length?fails:['None recorded']));
  txt=L.join('\n');$('#rep').innerHTML='<h3>Report</h3><pre>'+esc(txt)+'</pre>';$('#rep').focus();}
$('#gen').onclick=build;
$('#cp').onclick=()=>{build();navigator.clipboard.writeText(txt).then(()=>say('Report copied.'),()=>say('Copy failed. Select the text manually.'));};
$('#pr').onclick=()=>{build();print();};