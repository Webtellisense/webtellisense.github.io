/* Shared presentation only. No payment, analytics or form-submission transport. */
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const header=document.querySelector('[data-site-header]');
 if(header){
  const menu=header.querySelector('.chrome-menu'),nav=header.querySelector('nav'),narrow=matchMedia('(max-width:1180px)'),details=[...header.querySelectorAll('[data-mega]')];
  const layout=()=>{menu.hidden=!narrow.matches;nav.hidden=narrow.matches&&menu.getAttribute('aria-expanded')!=='true';};
  const close=()=>details.forEach(d=>d.open=false);
  menu.addEventListener('click',()=>{menu.setAttribute('aria-expanded',String(menu.getAttribute('aria-expanded')!=='true'));close();layout();});
  details.forEach(d=>{
   d.querySelector('summary').addEventListener('click',()=>{if(!d.open)details.filter(x=>x!==d).forEach(x=>x.open=false);});
   d.addEventListener('toggle',()=>{if(d.open)details.filter(x=>x!==d).forEach(x=>x.open=false);});
  });
  header.addEventListener('keydown',e=>{if(e.key==='Escape'){const open=details.find(d=>d.open);close();if(narrow.matches){menu.setAttribute('aria-expanded','false');layout();menu.focus();}else open?.querySelector('summary').focus();}});
  document.addEventListener('click',e=>{if(!header.contains(e.target))close();});
  header.addEventListener('focusout',()=>requestAnimationFrame(()=>{if(!header.contains(document.activeElement))close();}));
  narrow.addEventListener('change',()=>{close();layout();});layout();
  const current=location.pathname.replace(/\.html$/,'').replace(/\/$/,'')||'/';
  nav.querySelectorAll('a').forEach(a=>{if(new URL(a.href).pathname===current&&!new URL(a.href).hash)a.setAttribute('aria-current','page');});
 }
 const gallery=document.querySelector('[data-project-gallery]');
 if(gallery){
  const filters=gallery.querySelector('[data-project-filters]'),buttons=[...filters.querySelectorAll('button')],cards=[...gallery.querySelectorAll('[data-category]')],status=gallery.querySelector('[data-gallery-status]');
  filters.hidden=false;
  buttons.forEach(button=>button.addEventListener('click',()=>{const category=button.dataset.projectFilter;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));cards.forEach(c=>c.hidden=category!=='all'&&c.dataset.category!==category);status.textContent=`${cards.filter(c=>!c.hidden).length} projects · ${button.textContent.trim()}`;}));
 }
 const reviews=document.querySelector('[data-review-marquee]');
 if(reviews){
  const rows=[...reviews.querySelectorAll('[data-review-row]')],control=reviews.querySelector('[data-review-motion]');
  let paused=false,onScreen=false,frame,last,positions=[];
  const width=row=>{const set=row.querySelector('.review-set');return set.getBoundingClientRect().width+parseFloat(getComputedStyle(row.querySelector('.review-track')).columnGap||0);};
  const canRun=()=>!paused&&!reduced.matches&&!document.hidden&&onScreen&&!reviews.matches(':hover')&&!reviews.contains(document.activeElement);
  const stop=()=>{cancelAnimationFrame(frame);last=undefined;};
  const label=()=>{control.disabled=reduced.matches;control.textContent=reduced.matches?'Motion off':paused?'Play reviews':'Pause motion';control.setAttribute('aria-pressed',String(!paused&&!reduced.matches));};
  const tick=time=>{
   if(!canRun()){stop();return;}
   if(last!==undefined){const distance=Math.min(time-last,45)*.022;rows.forEach((row,i)=>{const w=width(row);positions[i]=((positions[i]+(i?-distance:distance))%w+w)%w;row.scrollLeft=positions[i];});}
   last=time;frame=requestAnimationFrame(tick);
  };
  const start=()=>{stop();positions=rows.map(row=>row.scrollLeft);if(canRun())frame=requestAnimationFrame(tick);};
  const arrange=()=>{
   rows.forEach((row,i)=>{row.querySelectorAll('[data-review-clone]').forEach(c=>c.remove());if(!reduced.matches){const set=row.querySelector('.review-set'),track=row.querySelector('.review-track'),w=width(row);for(let n=0;n<Math.ceil(row.clientWidth/w)+1;n++){const clone=set.cloneNode(true);clone.setAttribute('aria-hidden','true');clone.setAttribute('inert','');clone.dataset.reviewClone='';track.append(clone);}row.scrollLeft=i?w:0;}else row.scrollLeft=0;});label();start();
  };
  control.hidden=false;reviews.querySelectorAll('.review-controls').forEach(c=>c.hidden=false);
  control.addEventListener('click',()=>{paused=!paused;label();start();});
  const manual=(row,direction)=>{paused=true;label();stop();row.scrollBy({left:direction*Math.min(row.clientWidth*.85,400),behavior:reduced.matches?'instant':'smooth'});};
  rows.forEach(row=>{row.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();manual(row,e.key==='ArrowLeft'?-1:1);}});row.addEventListener('pointerdown',()=>{paused=true;label();stop();});});
  reviews.querySelectorAll('[data-review-step]').forEach(b=>b.addEventListener('click',()=>manual(rows[Number(b.dataset.reviewLane)],Number(b.dataset.reviewStep))));
  reviews.addEventListener('mouseenter',stop);reviews.addEventListener('mouseleave',start);reviews.addEventListener('focusin',stop);reviews.addEventListener('focusout',()=>requestAnimationFrame(start));document.addEventListener('visibilitychange',start);
  reduced.addEventListener('change',arrange);let resize;window.addEventListener('resize',()=>{clearTimeout(resize);resize=setTimeout(arrange,150);});
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{onScreen=entries[0].isIntersecting;start();}).observe(reviews);
  document.fonts.ready.then(arrange);
 }
})();
