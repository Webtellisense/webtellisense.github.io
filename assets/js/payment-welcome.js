(() => {
  const reference=new URLSearchParams(location.search).get('reference') || sessionStorage.getItem('wt-payment-reference');
  if(/^WT-[a-f0-9-]{36}$/.test(reference || ''))sessionStorage.setItem('wt-payment-reference',reference);
  // Remove provider/query identifiers before loading any third-party content.
  history.replaceState(null,'',location.pathname);
  const message=document.getElementById('payment-status');
  const retry=document.getElementById('payment-retry');
  async function verify() {
    retry.hidden=true;
    if(!/^WT-[a-f0-9-]{36}$/.test(reference || '')) {
      message.textContent='No verifiable payment reference was provided.';
      document.getElementById('unauthorized-msg').style.display='block';return;
    }
    try {
      const response=await fetch('/.netlify/functions/payment-status',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({reference})});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error || 'Verification unavailable.');
      if(data.status!=='paid'){message.textContent='Payment is not yet confirmed. Retry after completing checkout.';retry.hidden=false;return;}
      message.textContent='Payment verified.';
      document.getElementById('client-first-name').textContent=data.name.split(' ')[0];
      document.getElementById('client-onboarding-view').style.display='block';
      // No customer PII or proof-of-payment tokens are sent to the public form URL.
      document.getElementById('tally-onboarding-frame').src='https://tally.so/r/3yD4kx?transparentBackground=1';
    } catch(error){message.textContent=error.message;retry.hidden=false;}
  }
  retry.addEventListener('click',verify);
  verify();
})();
