// D-046 — owner order: «دکمه بالای پیج دک فقط بذار بازگشت به وب‌سایت را داشته
// باشه … هر کسی اینو دید — باید با گرافیک بخونه؛ همچنین چت آنلاین روی پیج دک
// روی این صفحه هم نمایش داده شود».
//
// Two additions to the standalone Health & Wellness deck (EN + FA mirror),
// following the EXACT surgical pattern of lang-toggle.ts / cs-scroll.ts:
//
// 1) TOP NAV BUTTON: the «Invest →» / «سرمایه‌گذاری ←» nav button (asserted
//    unique in both landing files) is swapped 1:1 in the SAME .btn sm slot —
//    same gradient pill, same size, same .ar arrow span — so it reads natively
//    with the deck graphics («باید با گرافیک بخونه»). New label:
//    «Back to website» / «بازگشت به وب‌سایت» → https://mehrdad.ir/ (the deck
//    already uses ↗ as its "go to Mehrdad.ir" arrow in the founder CTA).
//
// 2) ONLINE CHAT: the site's AI assistant (the same /api/chat + SSE stream the
//    ChatWidget on every site page uses) becomes available ON the deck — the
//    route handler bypasses the root layout, so the React widget physically
//    cannot reach this page; a self-contained vanilla-JS twin (same visual
//    identity: violet→fuchsia gradient launcher, AI badge, streaming transcript,
//    privacy note) is injected as ONE inline <script> before </body>. Bilingual:
//    EN deck → English chat, FA deck → Persian chat (zero «،» per standing
//    rule). CSP on /deck/health/:path* (D-035) already allows 'unsafe-inline'
//    scripts + connect-src 'self' — verified, no config change needed.
//
// landing-en.ts / landing-fa.ts stay byte-frozen; both swaps are asserted
// unique and fail loud (same discipline as cs-scroll.ts).

/** Exact nav-button strings inside the two landing files (asserted unique). */
export const NAV_BTN_EN = '<a class="btn sm" href="#invest">Invest <span class="ar">→</span></a>';
export const NAV_BTN_FA = '<a class="btn sm" href="#invest">سرمایه\u200Cگذاری <span class="ar">←</span></a>';

/** 1:1 same-slot replacement: «Back to website» / «بازگشت به وب‌سایت». */
export function backToSiteBtn(lang: 'en' | 'fa'): string {
  return (
    '<a class="btn sm" href="https://mehrdad.ir/">' +
    (lang === 'fa' ? 'بازگشت به وب\u200Cسایت' : 'Back to website') +
    ' <span class="ar">↗</span></a>'
  );
}

/* ── deck-chat widget ──────────────────────────────────────────────────────
   Vanilla JS twin of src/components/site/ChatWidget.tsx (send() flow, SSE
   event handling, session token capture, clear-via-DELETE). Written as a raw
   string — NOT a stringified function — so dev and production build output
   inject byte-identical widget code (no reliance on minifier behavior).
   Rules for the body below: no backticks, no ${, no `</script` sequence,
   string concatenation only. */

const DC_CSS = [
  '#dc-fab{position:fixed;bottom:20px;inset-inline-end:20px;z-index:2147483000;width:56px;height:56px;border:0;border-radius:9999px;cursor:pointer;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#7c3aed,#c026d3);color:#fff;box-shadow:0 12px 30px -8px rgba(124,58,237,.55);transition:transform .2s ease}',
  '#dc-fab:hover{transform:scale(1.06)}',
  '#dc-fab svg{width:24px;height:24px}',
  '#dc-ai{position:absolute;top:-4px;inset-inline-end:-4px;width:17px;height:17px;border-radius:9999px;background:#047857;color:#fff;font:700 9px/17px Inter,Arial,sans-serif;text-align:center}',
  '#dc-panel{position:fixed;bottom:20px;inset-inline-end:20px;z-index:2147483001;width:min(384px,calc(100vw - 40px));height:512px;height:min(512px,calc(100dvh - 40px));display:flex;flex-direction:column;overflow:hidden;border-radius:16px;border:1px solid #e4e4e7;background:#fff;color:#18181b;box-shadow:0 25px 60px -12px rgba(0,0,0,.3);font-family:inherit;font-size:14px;line-height:1.55;text-align:start}',
  '#dc-panel[hidden]{display:none}',
  '#dc-panel *{box-sizing:border-box}',
  '#dc-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px;background:linear-gradient(90deg,#7c3aed,#c026d3);color:#fff;flex:0 0 auto}',
  '#dc-tt{display:flex;align-items:center;gap:10px;min-width:0}',
  '#dc-tic{display:flex}',
  '#dc-tic svg{width:20px;height:20px}',
  '#dc-name{font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '#dc-st{font-size:10px;opacity:.85}',
  '#dc-hb{display:flex;gap:2px}',
  '.dc-hbtn{border:0;background:transparent;color:#fff;padding:6px;border-radius:8px;cursor:pointer;display:flex}',
  '.dc-hbtn:hover{background:rgba(255,255,255,.2)}',
  '.dc-hbtn svg{width:16px;height:16px}',
  '#dc-log{flex:1 1 auto;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:12px;scrollbar-width:thin;scrollbar-color:#d4d4d8 transparent}',
  '#dc-log::-webkit-scrollbar{width:6px}',
  '#dc-log::-webkit-scrollbar-thumb{background:#d4d4d8;border-radius:9999px}',
  '.dc-b{max-width:85%;white-space:pre-wrap;border-radius:16px;padding:10px 14px;font-size:13.5px;line-height:1.6;word-break:break-word}',
  '.dc-u{align-self:flex-end;background:linear-gradient(90deg,#7c3aed,#a21caf);color:#fff}',
  '.dc-a{align-self:flex-start;background:#f4f4f5;color:#18181b}',
  '#dc-dots{display:inline-flex;gap:4px;padding:14px}',
  '.dc-dot{width:7px;height:7px;border-radius:9999px;background:#a855f7;animation:dc-b 1s infinite}',
  '.dc-dot:nth-child(2){animation-delay:.15s}',
  '.dc-dot:nth-child(3){animation-delay:.3s}',
  '@keyframes dc-b{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-4px);opacity:1}}',
  '.dc-cur{display:inline-block;width:7px;height:14px;margin-inline-start:2px;vertical-align:middle;background:#a855f7;border-radius:2px;animation:dc-p 1s infinite}',
  '@keyframes dc-p{50%{opacity:.2}}',
  '#dc-note{flex:0 0 auto;border-top:1px solid #e4e4e7;padding:7px 12px 4px;font-size:10px;line-height:1.5;color:#71717a}',
  '#dc-form{flex:0 0 auto;display:flex;gap:8px;padding:10px 12px 12px;border-top:1px solid #e4e4e7}',
  '#dc-in{flex:1;min-width:0;border:1px solid #e4e4e7;border-radius:10px;padding:9px 12px;font:inherit;font-size:13.5px;background:#fff;color:#18181b;outline:none}',
  '#dc-in:focus{border-color:#c084fc;box-shadow:0 0 0 3px rgba(192,132,252,.25)}',
  '#dc-send{flex:0 0 auto;width:40px;height:40px;border:0;border-radius:10px;background:linear-gradient(90deg,#7c3aed,#c026d3);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center}',
  '#dc-send svg{width:17px;height:17px}',
  '#dc-send:disabled{opacity:.45;cursor:default}',
  '[dir=rtl] #dc-send svg{transform:scaleX(-1)}',
  '@media (max-width:480px){#dc-fab{bottom:12px;inset-inline-end:12px}#dc-panel{bottom:12px;inset-inline-end:12px;width:calc(100vw - 24px);height:min(480px,calc(100dvh - 24px))}}',
].join('');

const DC_BODY = `
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
`;

interface DeckChatTexts {
  lang: 'en' | 'fa';
  dir: 'ltr' | 'rtl';
  // injected at build time into the config (never hand-written per language)
  CSS?: string;
  title: string;
  status: string;
  welcome: string;
  placeholder: string;
  privacy: string;
  tooFast: string;
  thinking: string;
  error: string;
  clear: string;
  close: string;
  send: string;
}

// EN texts: verbatim from ui.en.chat (i18n.ts) — the same words the site
// widget speaks. FA texts: same wording adapted to the deck's standing
// zero-«،» rule (semicolon / «و … و» constructions instead of Persian commas).
const TEXTS: Record<'en' | 'fa', DeckChatTexts> = {
  en: {
    lang: 'en',
    dir: 'ltr',
    title: 'Mehrdad AI Assistant',
    status: 'Online · Trained on site content',
    welcome:
      "Hi! I'm Mehrdad's AI assistant. I know everything about the projects, services, startups and articles on this site. How can I help you?",
    placeholder: 'Ask anything...',
    privacy:
      "⚠ Don't share passwords, national IDs, or banking details. Conversations are stored to improve the site and processed by an AI service.",
    tooFast: "You're sending messages too fast — please wait a moment and try again.",
    thinking: 'Thinking...',
    error: 'Something went wrong. Please try again.',
    clear: 'Clear chat',
    close: 'Close',
    send: 'Send',
  },
  fa: {
    lang: 'fa',
    dir: 'rtl',
    title: 'دستیار هوش مصنوعی مهرداد',
    status: 'آنلاین · آموزش‌دیده روی محتوای سایت',
    welcome:
      'سلام! من دستیار هوش مصنوعی مهرداد هستم؛ همه چیز درباره پروژه‌ها و خدمات و استارتاپ‌ها و مقالات این سایت را می‌دانم. چطور می‌توانم کمک کنم؟',
    placeholder: 'هر سوالی دارید بپرسید...',
    privacy:
      '⚠ لطفاً رمز عبور یا کد ملی یا اطلاعات بانکی ارسال نکنید؛ گفتگوها برای بهبود سایت ذخیره و توسط سرویس هوش مصنوعی پردازش می‌شوند.',
    tooFast: 'پیام‌ها را خیلی سریع می‌فرستید — چند لحظه صبر کنید و دوباره امتحان کنید.',
    thinking: 'در حال فکر کردن...',
    error: 'مشکلی پیش آمد. دوباره تلاش کنید.',
    clear: 'پاک کردن گفتگو',
    close: 'بستن',
    send: 'ارسال',
  },
};

/** inline <script> twin of the site ChatWidget for the standalone deck */
export function deckChatScript(lang: 'en' | 'fa'): string {
  // explicit key mapping: the widget body reads UPPERCASE config keys (a JSON
  // serialization contract, immune to minifier property mangling) — the
  // stylesheet travels inside the same object, so the body stays
  // placeholder-free and byte-identical in dev and production builds
  const t = TEXTS[lang];
  const cfg = {
    LANG: t.lang,
    DIR: t.dir,
    CSS: DC_CSS,
    TITLE: t.title,
    STATUS: t.status,
    WELCOME: t.welcome,
    PLACEHOLDER: t.placeholder,
    PRIVACY: t.privacy,
    TOFAST: t.tooFast,
    THINKING: t.thinking,
    ERROR: t.error,
    CLEAR: t.clear,
    CLOSE: t.close,
    SEND: t.send,
  };
  return '<script>var C=' + JSON.stringify(cfg) + ';' + DC_BODY + '</script>';
}

function assertUniqueReplace(html: string, find: string, repl: string, what: string): string {
  const first = html.indexOf(find);
  if (first === -1) throw new Error(`site-chat: anchor not found: ${what}`);
  if (html.indexOf(find, first + 1) !== -1) throw new Error(`site-chat: anchor not unique: ${what}`);
  return html.slice(0, first) + repl + html.slice(first + find.length);
}

/**
 * Both D-046 additions in one pass: nav button swap (same .btn sm slot) +
 * online-chat injection before </body>. Asserted unique, fail loud.
 */
export function deckSiteChat(html: string, lang: 'en' | 'fa'): string {
  const withBtn = assertUniqueReplace(
    html,
    lang === 'fa' ? NAV_BTN_FA : NAV_BTN_EN,
    backToSiteBtn(lang),
    `nav button (${lang})`,
  );
  return assertUniqueReplace(withBtn, '</body>', deckChatScript(lang) + '</body>', '</body>');
}
