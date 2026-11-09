/* Presentation only: no analytics, payment, storage, form submission or customer data. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.design-header');
  if (header) {
    const nav = header.querySelector('nav'), toggle = header.querySelector('.design-menu-toggle');
    const narrow = matchMedia('(max-width: 1050px)');
    const layout = () => { toggle.hidden = !narrow.matches; nav.hidden = narrow.matches && toggle.getAttribute('aria-expanded') !== 'true'; };
    toggle.addEventListener('click', () => { toggle.setAttribute('aria-expanded',String(toggle.getAttribute('aria-expanded') !== 'true')); layout(); });
    header.addEventListener('keydown',e=>{if(e.key==='Escape'){header.querySelectorAll('details[open]').forEach(d=>d.open=false);if(narrow.matches){toggle.setAttribute('aria-expanded','false');layout();toggle.focus();}}});
    header.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)header.querySelectorAll('details').forEach(other=>{if(other!==d)other.open=false;});}));
    document.addEventListener('click',e=>{if(!header.contains(e.target))header.querySelectorAll('details').forEach(d=>d.open=false);});
    narrow.addEventListener('change',layout); layout();
  }
  const demo = document.querySelector('[data-activity-demo]');
  if (demo) {
    const messages = [...demo.querySelectorAll('[data-activity-message]')];
    const bar=demo.querySelector('.activity-toolbar'),pause=demo.querySelector('[data-activity-pause]'),next=demo.querySelector('[data-activity-next]');
    let index=0,userPaused=false,timer,transitionTimer,onScreen=true;
    bar.hidden=false;
    const clear = () => {clearTimeout(timer);clearTimeout(transitionTimer);};
    const show = () => {
      messages.forEach((el,i)=>{el.hidden=i!==index;el.classList.remove('is-leaving','is-arriving');});
      messages[index].classList.add('is-arriving');
      demo.querySelector('[data-activity-position]').textContent=`${index+1} / ${messages.length}`;
    };
    const canRun=()=>!userPaused&&!reduced.matches&&!document.hidden&&onScreen&&!demo.matches(':hover')&&!demo.contains(document.activeElement);
    const schedule=()=>{clearTimeout(timer);if(canRun())timer=setTimeout(()=>advance(true),5600);};
    const advance=(animated=false)=>{
      clear();
      const swap=()=>{index=(index+1)%messages.length;show();schedule();};
      if(animated&&!reduced.matches){messages[index].classList.add('is-leaving');transitionTimer=setTimeout(swap,260);}else swap();
    };
    const controls=()=>{pause.disabled=reduced.matches;pause.textContent=reduced.matches?'Motion off':userPaused?'Play demo':'Pause demo';pause.setAttribute('aria-pressed',String(userPaused));};
    pause.addEventListener('click',()=>{userPaused=!userPaused;clear();messages[index].classList.remove('is-leaving');controls();schedule();});
    next.addEventListener('click',()=>{userPaused=true;controls();advance();});
    demo.addEventListener('mouseenter',()=>{clear();messages[index].classList.remove('is-leaving');});
    demo.addEventListener('mouseleave',schedule);demo.addEventListener('focusin',()=>{clear();messages[index].classList.remove('is-leaving');});
    demo.addEventListener('focusout',()=>requestAnimationFrame(schedule));
    document.addEventListener('visibilitychange',()=>{clear();messages[index].classList.remove('is-leaving');schedule();});
    reduced.addEventListener('change',()=>{clear();controls();show();schedule();});
    if('IntersectionObserver'in window)new IntersectionObserver(entries=>{onScreen=entries[0].isIntersecting;clear();schedule();}).observe(demo);
    show();controls();schedule();
  }
  document.querySelectorAll('[data-school-journey]').forEach(region=>{
    const buttons=[...region.querySelectorAll('[data-school-view]')],panels=[...region.querySelectorAll('[data-school-panel]')];
    const render=index=>{buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));panels.forEach((p,i)=>p.hidden=i!==index);};
    buttons.forEach((b,i)=>b.addEventListener('click',()=>render(i)));
    region.querySelector('.parent-stages').hidden=false;region.classList.add('is-enhanced');render(Math.min(1,panels.length-1));
  });
})();
