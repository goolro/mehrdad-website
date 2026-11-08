module.exports=[49234,18131,95696,e=>{"use strict";e.s(["l",0,'<small style="font:500 10px Inter;color:var(--mu);border:1px solid var(--line);border-radius:999px;padding:2px 8px;letter-spacing:.06em">WORKING TITLE</small>',"u",0,'<small style="font:500 10px Vazirmatn;color:var(--mu);border:1px solid var(--line);border-radius:999px;padding:2px 8px">عنوان موقت</small>',"o",0,function(e){let t=e.letterSpacing?"letter-spacing:.06em;":"";return"<style>#lang-fab{display:inline-block;font:500 10px "+e.fontFamily+";color:var(--mu);border:1px solid var(--line);border-radius:999px;padding:2px 8px;"+t+'text-decoration:none;transition:color .2s ease,border-color .2s ease}#lang-fab:hover{color:var(--tx);border-color:rgba(255,255,255,.3)}#lang-fab:focus-visible{outline:2px solid var(--b,#19e3c1);outline-offset:2px}</style><a id="lang-fab" href="'+e.href+'" aria-label="'+e.ariaLabel+'" title="'+e.title+'">'+e.label+"</a>"}],49234);let t='<table class="cs">',n="</table>",a=".cs th{color:var(--b);font-size:11px;letter-spacing:.1em;text-transform:uppercase}",i=".cs-scroll{overflow-x:auto}",r='<div class="cs-scroll">',d="</div>";function s(e,t,n){let a=e.indexOf(t);if(-1===a)throw Error(`cs-scroll: anchor not found: ${n}`);if(-1!==e.indexOf(t,a+1))throw Error(`cs-scroll: anchor not unique: ${n}`);return a}e.s(["f",0,function(e){let o=s(e,a,".cs th rule")+a.length,l=e.slice(0,o)+i+e.slice(o),c=s(l,t,".cs table open"),p=l.indexOf(n,c);if(-1===p)throw Error("cs-scroll: .cs table close not found");let b=l.indexOf("<table",c+t.length);if(-1!==b&&b<p)throw Error("cs-scroll: nested table before the expected close");let f=p+n.length,h=l.slice(0,c)+r+l.slice(c,f)+d+l.slice(f);if(h.slice(0,o)+h.slice(o+i.length,c)+h.slice(c+r.length,f+r.length)+h.slice(f+r.length+d.length)!==e)throw Error("cs-scroll: round-trip byte proof failed");return h}],18131);let o=`
var d=document;
function el(t,c){var e=d.createElement(t);if(c)e.className=c;return e;}
function svg(p){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';}
var IC={spark:'<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/>',x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',trash:'<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',send:'<path d="m22 2-7 12.913a1 1 0 0 1-1.624.169L9 11 2.087 4.6A1 1 0 0 1 3 3h18a1 1 0 0 1 1 1z"/><path d="M22 2 11 13"/>'};
var st=d.createElement('style');st.textContent=C.CSS;d.head.appendChild(st);
var fab=el('button');fab.id='dc-fab';fab.type='button';fab.setAttribute('aria-label',C.TITLE);fab.setAttribute('aria-expanded','false');fab.innerHTML=svg(IC.spark)+'<span id="dc-ai">AI</span>';
var pan=el('div');pan.id='dc-panel';pan.hidden=true;pan.setAttribute('role','dialog');pan.setAttribute('aria-label',C.TITLE);
var head=el('div');head.id='dc-head';
var tt=el('div');tt.id='dc-tt';
var tic=el('span');tic.id='dc-tic';tic.innerHTML=svg(IC.spark);
var nm=el('div');nm.id='dc-name';nm.textContent=C.TITLE;
var sx=el('div');sx.id='dc-st';sx.textContent=C.STATUS;
tt.appendChild(tic);tt.appendChild(nm);tt.appendChild(sx);
var hb=el('div');hb.id='dc-hb';
var bClr=el('button','dc-hbtn');bClr.type='button';bClr.setAttribute('aria-label',C.CLEAR);bClr.innerHTML=svg(IC.trash);
var bCls=el('button','dc-hbtn');bCls.type='button';bCls.setAttribute('aria-label',C.CLOSE);bCls.innerHTML=svg(IC.x);
hb.appendChild(bClr);hb.appendChild(bCls);
head.appendChild(tt);head.appendChild(hb);
var log=el('div');log.id='dc-log';
var note=el('div');note.id='dc-note';note.textContent=C.PRIVACY;
var form=el('form');form.id='dc-form';
var inp=el('input');inp.id='dc-in';inp.placeholder=C.PLACEHOLDER;inp.autocomplete='off';inp.setAttribute('dir','auto');inp.setAttribute('aria-label',C.PLACEHOLDER);
var bSnd=el('button');bSnd.id='dc-send';bSnd.type='submit';bSnd.setAttribute('aria-label',C.SEND);bSnd.innerHTML=svg(IC.send);
form.appendChild(inp);form.appendChild(bSnd);
pan.appendChild(head);pan.appendChild(log);pan.appendChild(note);pan.appendChild(form);
d.body.appendChild(fab);d.body.appendChild(pan);
function scrollEnd(){log.scrollTop=log.scrollHeight;}
function bubble(cls,text){var b=el('div','dc-b '+cls);if(text!=null)b.textContent=text;log.appendChild(b);scrollEnd();return b;}
bubble('dc-a',C.WELCOME);
var sid='',tok='',busy=false;
function setOpen(o){pan.hidden=!o;fab.style.display=o?'none':'';fab.setAttribute('aria-expanded',o?'true':'false');if(o){scrollEnd();try{inp.focus();}catch(e){}}}
fab.addEventListener('click',function(){setOpen(pan.hidden);});
bCls.addEventListener('click',function(){setOpen(false);});
d.addEventListener('keydown',function(e){if(e.key==='Escape'&&!pan.hidden)setOpen(false);});
bClr.addEventListener('click',function(){
  if(sid){fetch('/api/chat',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:sid,sessionToken:tok})}).catch(function(){});}
  sid='';tok='';log.innerHTML='';bubble('dc-a',C.WELCOME);
});
form.addEventListener('submit',function(e){e.preventDefault();send();});
function send(){
  var t=(inp.value||'').replace(/^\\s+|\\s+$/g,'');
  if(!t||busy)return;
  inp.value='';
  bubble('dc-u',t);
  busy=true;bSnd.disabled=true;
  var dots=el('div','dc-b dc-a');dots.id='dc-dots';dots.setAttribute('role','status');dots.setAttribute('aria-label',C.THINKING);
  dots.innerHTML='<span class="dc-dot"></span><span class="dc-dot"></span><span class="dc-dot"></span>';
  log.appendChild(dots);scrollEnd();
  var acc='',started=false,sb=null,tn=null;
  function ensure(){
    if(started)return;
    started=true;dots.remove();sb=bubble('dc-a','');
    tn=d.createTextNode('');sb.appendChild(tn);
    var cur=el('span','dc-cur');sb.appendChild(cur);
  }
  function ev(raw){
    var i,lines=raw.split('\\n');
    for(i=0;i<lines.length;i++){
      if(lines[i].indexOf('data:')!==0)continue;
      var e2=null;try{e2=JSON.parse(lines[i].slice(5).trim());}catch(x){continue;}
      if(typeof e2.sessionId==='string'&&e2.sessionId)sid=e2.sessionId;
      if(typeof e2.sessionToken==='string'&&e2.sessionToken)tok=e2.sessionToken;
      if(typeof e2.delta==='string'&&e2.delta){ensure();acc+=e2.delta;tn.data=acc;scrollEnd();}
      if(e2.error){ensure();if(!acc)acc=C.ERROR;tn.data=acc;scrollEnd();}
    }
  }
  function finish(){
    dots.remove();
    if(started&&sb){sb.textContent=acc||C.ERROR;}
    else if(!started){bubble('dc-a',C.ERROR);}
    busy=false;bSnd.disabled=false;scrollEnd();
  }
  fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json',Accept:'text/event-stream'},body:JSON.stringify({message:t,lang:C.LANG,sessionId:sid,sessionToken:tok,stream:true})})
  .then(function(res){
    if(res.status===429){dots.remove();bubble('dc-a',C.TOFAST);busy=false;bSnd.disabled=false;return null;}
    var ct=res.headers.get('content-type')||'';
    if(!res.ok||!res.body||ct.indexOf('text/event-stream')===-1){
      return res.json().catch(function(){return null;}).then(function(j){
        dots.remove();
        if(j&&j.sessionId){sid=j.sessionId;tok=j.sessionToken||'';}
        bubble('dc-a',(j&&j.reply)||C.ERROR);
        busy=false;bSnd.disabled=false;
      });
    }
    var rd=res.body.getReader(),dec=new TextDecoder(),buf='';
    function pump(){
      return rd.read().then(function(r){
        if(r.done){if(buf.replace(/^\\s+|\\s+$/g,''))ev(buf);finish();return;}
        buf+=dec.decode(r.value,{stream:true});
        var i;
        while((i=buf.indexOf('\\n\\n'))>=0){ev(buf.slice(0,i));buf=buf.slice(i+2);}
        return pump();
      });
    }
    return pump().catch(function(){finish();});
  })
  .catch(function(){dots.remove();bubble('dc-a',C.ERROR);busy=false;bSnd.disabled=false;});
}
`,l={en:{lang:"en",dir:"ltr",title:"Mehrdad AI Assistant",status:"Online · Trained on site content",welcome:"Hi! I'm Mehrdad's AI assistant. I know everything about the projects, services, startups and articles on this site. How can I help you?",placeholder:"Ask anything...",privacy:"⚠ Don't share passwords, national IDs, or banking details. Conversations are stored to improve the site and processed by an AI service.",tooFast:"You're sending messages too fast — please wait a moment and try again.",thinking:"Thinking...",error:"Something went wrong. Please try again.",clear:"Clear chat",close:"Close",send:"Send"},fa:{lang:"fa",dir:"rtl",title:"دستیار هوش مصنوعی مهرداد",status:"آنلاین · آموزش‌دیده روی محتوای سایت",welcome:"سلام! من دستیار هوش مصنوعی مهرداد هستم؛ همه چیز درباره پروژه‌ها و خدمات و استارتاپ‌ها و مقالات این سایت را می‌دانم. چطور می‌توانم کمک کنم؟",placeholder:"هر سوالی دارید بپرسید...",privacy:"⚠ لطفاً رمز عبور یا کد ملی یا اطلاعات بانکی ارسال نکنید؛ گفتگوها برای بهبود سایت ذخیره و توسط سرویس هوش مصنوعی پردازش می‌شوند.",tooFast:"پیام‌ها را خیلی سریع می‌فرستید — چند لحظه صبر کنید و دوباره امتحان کنید.",thinking:"در حال فکر کردن...",error:"مشکلی پیش آمد. دوباره تلاش کنید.",clear:"پاک کردن گفتگو",close:"بستن",send:"ارسال"}};function c(e,t,n,a){let i=e.indexOf(t);if(-1===i)throw Error(`site-chat: anchor not found: ${a}`);if(-1!==e.indexOf(t,i+1))throw Error(`site-chat: anchor not unique: ${a}`);return e.slice(0,i)+n+e.slice(i+t.length)}e.s(["f",0,function(e,t){let n,a=c(e,"fa"===t?'<a class="btn sm" href="#invest">سرمایه‌گذاری <span class="ar">←</span></a>':'<a class="btn sm" href="#invest">Invest <span class="ar">→</span></a>','<a class="btn sm" href="https://mehrdad.ir/">'+("fa"===t?"بازگشت به وب‌سایت":"Back to website")+' <span class="ar">↗</span></a>',`nav button (${t})`);return c(a,"</body>","<script>var C="+JSON.stringify({LANG:(n=l[t]).lang,DIR:n.dir,CSS:"#dc-fab{position:fixed;bottom:20px;inset-inline-end:20px;z-index:2147483000;width:56px;height:56px;border:0;border-radius:9999px;cursor:pointer;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#7c3aed,#c026d3);color:#fff;box-shadow:0 12px 30px -8px rgba(124,58,237,.55);transition:transform .2s ease}#dc-fab:hover{transform:scale(1.06)}#dc-fab svg{width:24px;height:24px}#dc-ai{position:absolute;top:-4px;inset-inline-end:-4px;width:17px;height:17px;border-radius:9999px;background:#047857;color:#fff;font:700 9px/17px Inter,Arial,sans-serif;text-align:center}#dc-panel{position:fixed;bottom:20px;inset-inline-end:20px;z-index:2147483001;width:min(384px,calc(100vw - 40px));height:512px;height:min(512px,calc(100dvh - 40px));display:flex;flex-direction:column;overflow:hidden;border-radius:16px;border:1px solid #e4e4e7;background:#fff;color:#18181b;box-shadow:0 25px 60px -12px rgba(0,0,0,.3);font-family:inherit;font-size:14px;line-height:1.55;text-align:start}#dc-panel[hidden]{display:none}#dc-panel *{box-sizing:border-box}#dc-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px;background:linear-gradient(90deg,#7c3aed,#c026d3);color:#fff;flex:0 0 auto}#dc-tt{display:flex;align-items:center;gap:10px;min-width:0}#dc-tic{display:flex}#dc-tic svg{width:20px;height:20px}#dc-name{font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#dc-st{font-size:10px;opacity:.85}#dc-hb{display:flex;gap:2px}.dc-hbtn{border:0;background:transparent;color:#fff;padding:6px;border-radius:8px;cursor:pointer;display:flex}.dc-hbtn:hover{background:rgba(255,255,255,.2)}.dc-hbtn svg{width:16px;height:16px}#dc-log{flex:1 1 auto;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:12px;scrollbar-width:thin;scrollbar-color:#d4d4d8 transparent}#dc-log::-webkit-scrollbar{width:6px}#dc-log::-webkit-scrollbar-thumb{background:#d4d4d8;border-radius:9999px}.dc-b{max-width:85%;white-space:pre-wrap;border-radius:16px;padding:10px 14px;font-size:13.5px;line-height:1.6;word-break:break-word}.dc-u{align-self:flex-end;background:linear-gradient(90deg,#7c3aed,#a21caf);color:#fff}.dc-a{align-self:flex-start;background:#f4f4f5;color:#18181b}#dc-dots{display:inline-flex;gap:4px;padding:14px}.dc-dot{width:7px;height:7px;border-radius:9999px;background:#a855f7;animation:dc-b 1s infinite}.dc-dot:nth-child(2){animation-delay:.15s}.dc-dot:nth-child(3){animation-delay:.3s}@keyframes dc-b{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-4px);opacity:1}}.dc-cur{display:inline-block;width:7px;height:14px;margin-inline-start:2px;vertical-align:middle;background:#a855f7;border-radius:2px;animation:dc-p 1s infinite}@keyframes dc-p{50%{opacity:.2}}#dc-note{flex:0 0 auto;border-top:1px solid #e4e4e7;padding:7px 12px 4px;font-size:10px;line-height:1.5;color:#71717a}#dc-form{flex:0 0 auto;display:flex;gap:8px;padding:10px 12px 12px;border-top:1px solid #e4e4e7}#dc-in{flex:1;min-width:0;border:1px solid #e4e4e7;border-radius:10px;padding:9px 12px;font:inherit;font-size:13.5px;background:#fff;color:#18181b;outline:none}#dc-in:focus{border-color:#c084fc;box-shadow:0 0 0 3px rgba(192,132,252,.25)}#dc-send{flex:0 0 auto;width:40px;height:40px;border:0;border-radius:10px;background:linear-gradient(90deg,#7c3aed,#c026d3);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center}#dc-send svg{width:17px;height:17px}#dc-send:disabled{opacity:.45;cursor:default}[dir=rtl] #dc-send svg{transform:scaleX(-1)}@media (max-width:480px){#dc-fab{bottom:12px;inset-inline-end:12px}#dc-panel{bottom:12px;inset-inline-end:12px;width:calc(100vw - 24px);height:min(480px,calc(100dvh - 24px))}}",TITLE:n.title,STATUS:n.status,WELCOME:n.welcome,PLACEHOLDER:n.placeholder,PRIVACY:n.privacy,TOFAST:n.tooFast,THINKING:n.thinking,ERROR:n.error,CLEAR:n.clear,CLOSE:n.close,SEND:n.send})+";"+o+"</script></body>","</body>")}],95696)}];

//# sourceMappingURL=src_app_%28site%29_deck_health_lang-toggle_ts_19lqph0xp18no._.js.map