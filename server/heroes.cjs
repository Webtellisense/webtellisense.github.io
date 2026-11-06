const {fail}=require('./payments.cjs');
const defaults={start:'08:00',end:'19:00',timezone:'Africa/Lagos'};
function callbackPolicy(confirmedAt,env={},now=new Date()) {
 const start=env.HEROES_CONTACT_START || defaults.start,end=env.HEROES_CONTACT_END || defaults.end;
 const minutes=s=>{if(!/^\d{2}:\d{2}$/.test(s))fail(503,'Contact hours require configuration.');const [h,m]=s.split(':').map(Number);if(h>23||m>59)fail(503,'Contact hours require configuration.');return h*60+m;};
 const open=minutes(start),close=minutes(end);if(open>=close)fail(503,'Contact hours require configuration.');
 const confirmed=new Date(confirmedAt);if(!Number.isFinite(confirmed.getTime()))fail(503,'Payment confirmation time is unavailable.');
 // Africa/Lagos is UTC+01:00 all year; no daylight-saving transition.
 const local=new Date(confirmed.getTime()+3600000),minute=local.getUTCHours()*60+local.getUTCMinutes();
 const within=minute>=open && minute<close;
 const next=new Date(local);next.setUTCHours(Math.floor(open/60),open%60,0,0);if(minute>=close)next.setUTCDate(next.getUTCDate()+1);
 const starts=within?new Date(confirmed.getTime()+3600000):new Date(next.getTime()-3600000);
 const deadline=within?new Date(confirmed.getTime()+7200000):null;
 const time=d=>new Intl.DateTimeFormat('en-NG',{timeZone:defaults.timezone,hour:'numeric',minute:'2-digit',hour12:true}).format(d);
 const date=d=>new Intl.DateTimeFormat('en-NG',{timeZone:defaults.timezone,day:'numeric',month:'long',year:'numeric'}).format(d);
 const hours=`${time(new Date('2026-01-01T'+start+':00+01:00'))}–${time(new Date('2026-01-01T'+end+':00+01:00'))}, every day (Africa/Lagos)`;
 const overdue=deadline?now>deadline:false;
 const promise=overdue?'Your personal callback is due. Let’s get you connected.':within?"We’ll call you personally within 1–2 hours to welcome you and arrange your onboarding.":`We’ll begin callbacks at ${time(starts)} on ${date(starts)} to welcome you and arrange your onboarding.`;
 return {promise,hours,timezone:defaults.timezone,startsAt:starts.toISOString(),deadline:deadline?.toISOString() || null,windowLabel:within?`${time(starts)}–${time(deadline)} on ${date(starts)} (Lagos time)`:`From ${time(starts)} on ${date(starts)} (Lagos time)`,overdue};
}
function heroesDetails(order,env,now) {
 if(order.status!=='paid' || order.quote.packageId!=='heroes')fail(403,'Verified Heroes payment required.');
 const tier={v1:'Heroes V1',v2:'Heroes V2',v3:'Heroes V3'}[order.quote.tier];if(!tier)fail(409,'Heroes tier could not be confirmed.');
 return {tier,amountKobo:Number(order.amount_kobo),currency:order.currency,confirmedAt:new Date(order.paid_at).toISOString(),callback:callbackPolicy(order.paid_at,env,now)};
}
module.exports={callbackPolicy,heroesDetails};
