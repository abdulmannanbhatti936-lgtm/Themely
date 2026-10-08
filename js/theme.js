// Theme shifter: self-contained, so it works even if main.js changes.
(()=>{
    const root=document.documentElement,
          sel=document.getElementById('theme'),
          btn=document.getElementById('themeToggle'),
          mq=window.matchMedia('(prefers-color-scheme: dark)'),
          KEY='a11y-lab-theme';
  
    const isDark=()=>{
      const t=root.dataset.theme;
      return t==='dark'||t==='hc'||(t==='auto'&&mq.matches);
    };
    const sync=()=>btn.setAttribute('aria-pressed',String(isDark()));
    const save=t=>{try{localStorage.setItem(KEY,t);}catch(e){}};
  
    function apply(t){
      root.dataset.theme=t;
      sel.value=t;
      save(t);
      sync();
    }
  
    btn.addEventListener('click',()=>apply(isDark()?'light':'dark'));
    sel.addEventListener('change',()=>apply(sel.value));
    if(mq.addEventListener)mq.addEventListener('change',sync);
    else if(mq.addListener)mq.addListener(sync);
  
    sel.value=root.dataset.theme||'auto';
    sync();
  })();