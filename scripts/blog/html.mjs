// Small HTML inspection helper for our controlled static templates (not a browser parser).
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const decode = value => String(value).replace(/&#(x[\da-f]+|\d+);|&(amp|lt|gt|quot|apos|nbsp|mdash|ndash|rsquo|lsquo|rdquo|ldquo);/gi, (_, n, name) => n ? String.fromCodePoint(n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):+n) : ({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',mdash:'—',ndash:'–',rsquo:'’',lsquo:'‘',rdquo:'”',ldquo:'“'}[name.toLowerCase()]));
export const text = html => decode(html.replace(/<!--[\s\S]*?-->|<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>/g,' ')).replace(/\s+/g,' ').trim();
export function attrs(s) { const result={}; for(const m of s.matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) result[m[1].toLowerCase()]=decode(m[2]??m[3]??m[4]??''); return result; }
export function nodes(html) {
 const out=[],stack=[],voids=new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
 const re=/<!--[\s\S]*?-->|<\/?([a-z][\w:-]*)\b([^>]*?)>/gi;let m;
 while((m=re.exec(html))){if(!m[1])continue;const tag=m[1].toLowerCase();if(m[0][1]==='/'){let i=stack.findLastIndex(n=>n.tag===tag);if(i>=0){for(const n of stack.splice(i)){n.endStart=m.index;n.end=re.lastIndex;}}continue;}
 const n={tag,attrs:attrs(m[2]),start:m.index,openEnd:re.lastIndex,endStart:re.lastIndex,end:re.lastIndex,parent:stack.at(-1)};out.push(n);
 if(['script','style','textarea'].includes(tag)){const end=new RegExp('</'+tag+'\\s*>','ig');end.lastIndex=re.lastIndex;const close=end.exec(html);if(close){n.endStart=close.index;n.end=end.lastIndex;re.lastIndex=end.lastIndex;}}else if(!voids.has(tag)&&!m[0].endsWith('/>'))stack.push(n);
 }
 for(const n of stack){n.endStart=html.length;n.end=html.length;}return out;
}
export const hasClass=(n,c)=>(n.attrs.class||'').split(/\s+/).includes(c);
export const inner=(html,n)=>html.slice(n.openEnd,n.endStart);
export const outer=(html,n)=>html.slice(n.start,n.end);
export function replaceRanges(html, changes) { for(const [start,end,value] of changes.sort((a,b)=>b[0]-a[0]))html=html.slice(0,start)+value+html.slice(end);return html; }
