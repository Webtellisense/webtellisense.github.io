(() => {
 const $=id=>document.getElementById(id);
 let reference=new URLSearchParams(location.search).get('reference');
 try {reference ||= sessionStorage.getItem('wt-payment-reference');if(/^WT-[a-f0-9-]{36}$/.test(reference || ''))sessionStorage.setItem('wt-payment-reference',reference);}catch{/* Verification still works with a reference on this return URL. */}
 history.replaceState(null,'',location.pathname);
 const message=$('verification-message'),retry=$('verification-retry');
 let checking=false;
 async function verify(){
  if(checking)return;checking=true;retry.hidden=true;
  try {
   if(!/^WT-[a-f0-9-]{36}$/.test(reference || '')){ $('verification-title').textContent='Let’s help you reconnect.';message.textContent='We couldn’t securely reconnect this browser to your purchase. Contact us below and we’ll help you check it.';return;}
   const response=await fetch('/.netlify/functions/payment-status',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({reference})});
   const data=await response.json();
   if(response.status===403){$('verification-title').textContent='Let’s help you reconnect.';message.textContent='Your secure session may have expired or this may be a different browser. Contact us below so we can help. This doesn’t mean your payment failed.';return;}
   if(!response.ok)throw new Error('unavailable');
   if(data.status!=='paid'){$('verification-title').textContent='Your payment is still being checked.';message.textContent='Payment hasn’t been confirmed yet. If you’ve already paid, please don’t pay again. Check again shortly or contact us below.';retry.hidden=false;return;}
   if(data.packageId!=='heroes'){location.replace('/welcome.html');return;}
   const h=data.heroes;if(!h || !h.callback || !['v1','v2','v3'].includes(data.tier))throw new Error('unavailable');
   $('heroes-name').textContent=data.name.split(' ')[0];$('heroes-tier').textContent=h.tier;
   $('heroes-badge').src=`assets/img/badges/heroes_badge_t${data.tier.slice(1)}.png`;
   $('callback-title').textContent=h.callback.promise;$('callback-window').textContent=h.callback.windowLabel;
   $('contact-hours').textContent=h.callback.hours;$('callback-overdue').hidden=!h.callback.overdue;
   $('receipt-tier').textContent=h.tier;$('receipt-reference').textContent=data.reference;
   $('receipt-amount').textContent=new Intl.NumberFormat('en-NG',{style:'currency',currency:h.currency}).format(h.amountKobo/100);
   $('receipt-time').textContent=new Intl.DateTimeFormat('en-NG',{timeZone:'Africa/Lagos',day:'numeric',month:'short',year:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date(h.confirmedAt))+' (Lagos time)';
   $('profile-reference').value=data.reference;
   $('verification-panel').hidden=true;$('verified-welcome').hidden=false;
  }catch{$('verification-title').textContent='We can’t check your payment right now.';message.textContent='Verification is taking longer than expected. Please try again, or contact us below. This doesn’t mean your payment failed.';retry.hidden=false;}
  finally{checking=false;}
 }
 retry.addEventListener('click',verify);
 $('heroes-profile-form').addEventListener('submit',async event=>{
  event.preventDefault();const form=event.target,button=$('profile-submit'),status=$('profile-status');
  if(button.disabled)return;button.disabled=true;status.textContent='Sending your profile…';
  try {
   const response=await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(form)).toString()});
   if(!response.ok)throw new Error('submission failed');
   status.textContent='Thank you. Your profile has been submitted. We’ll still call you personally to arrange onboarding.';
   button.textContent='Profile submitted';
  }catch{status.textContent='We couldn’t confirm your submission. Your answers are still here. You can try again or share them when we call.';button.disabled=false;}
 });
 verify();
})();
