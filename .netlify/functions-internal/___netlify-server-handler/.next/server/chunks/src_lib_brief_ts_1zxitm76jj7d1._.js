module.exports=[51439,e=>e.a(async(t,a)=>{try{var r=e.i(43793),n=e.i(66013),i=t([r,n]);[r,n]=i.then?(await i)():i;let m=["product","ai","startup"],T=[{name:"The Verge",url:"https://www.theverge.com/",lang:"en",category:"product",active:!0},{name:"Mashable",url:"https://mashable.com/",lang:"en",category:"product",active:!0},{name:"Lifehacker",url:"https://lifehacker.com/",lang:"en",category:"product",active:!0},{name:"Wired",url:"https://www.wired.com/",lang:"en",category:"product",active:!0},{name:"Gizmodo",url:"https://gizmodo.com/",lang:"en",category:"product",active:!1,note:"مسدود برای ربات (403)"},{name:"Product Hunt",url:"https://www.producthunt.com/",lang:"en",category:"product",active:!1,note:"مسدود برای ربات (403)"},{name:"FutureTools",url:"https://www.futuretools.io/",lang:"en",category:"ai",active:!0},{name:"Unite.AI",url:"https://www.unite.ai/",lang:"en",category:"ai",active:!0},{name:"There Is An AI For That",url:"https://theresanaiforthat.com/",lang:"en",category:"ai",active:!1,note:"مسدود برای ربات (403)"},{name:"Futurepedia",url:"https://www.futurepedia.io/",lang:"en",category:"ai",active:!1,note:"مسدود برای ربات (403)"},{name:"Toolify",url:"https://toolify.ai/",lang:"en",category:"ai",active:!1,note:"مسدود برای ربات (403)"},{name:"MarkTechPost",url:"https://www.marktechpost.com/",lang:"en",category:"ai",active:!1,note:"چالش ربات (202)"},{name:"TechCrunch",url:"https://techcrunch.com/",lang:"en",category:"startup",active:!0},{name:"VentureBeat",url:"https://venturebeat.com/",lang:"en",category:"startup",active:!1,note:"محدودیت نرخ (429)"},{name:"Indie Hackers",url:"https://www.indiehackers.com/",lang:"en",category:"startup",active:!0},{name:"Y Combinator",url:"https://www.ycombinator.com/",lang:"en",category:"startup",active:!0},{name:"HackerNoon",url:"https://hackernoon.com/",lang:"en",category:"startup",active:!0},{name:"زومیت",url:"https://www.zoomit.ir/",lang:"fa",category:"product",active:!0},{name:"دیجیاتو",url:"https://digiato.com/",lang:"fa",category:"product",active:!0},{name:"گجت‌نیوز",url:"https://gadgetnews.ir/",lang:"fa",category:"product",active:!0},{name:"دیجی‌کالا مگ",url:"https://www.digikala.com/mag/",lang:"fa",category:"product",active:!0},{name:"آی‌تی‌رسان",url:"https://itresan.com/",lang:"fa",category:"product",active:!0},{name:"نارنجی",url:"https://narenji.ir/",lang:"fa",category:"product",active:!1,note:"خطای شبکه هنگام تست"},{name:"تکنا",url:"https://techna.news/",lang:"fa",category:"ai",active:!0},{name:"جارچی",url:"https://jarchi.io/",lang:"fa",category:"ai",active:!0}],w=null;function o(){return w||(w=(async()=>{if(await r.f.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "BriefSource" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "url" TEXT NOT NULL,
          "lang" TEXT NOT NULL DEFAULT 'en',
          "category" TEXT NOT NULL DEFAULT 'product',
          "active" BOOLEAN NOT NULL DEFAULT true,
          "note" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "BriefSource_pkey" PRIMARY KEY ("id")
        )
      `),await r.f.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "BriefScan" (
          "id" TEXT NOT NULL,
          "sourceId" TEXT NOT NULL,
          "ok" BOOLEAN NOT NULL DEFAULT true,
          "error" TEXT,
          "title" TEXT,
          "headings" TEXT NOT NULL DEFAULT '[]',
          "headingCount" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "BriefScan_pkey" PRIMARY KEY ("id")
        )
      `),await r.f.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Brief" (
          "id" TEXT NOT NULL,
          "topic" TEXT NOT NULL,
          "category" TEXT NOT NULL DEFAULT 'product',
          "status" TEXT NOT NULL DEFAULT 'ready',
          "filtered" TEXT NOT NULL DEFAULT '[]',
          "structure" TEXT,
          "briefMd" TEXT,
          "sourceCount" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Brief_pkey" PRIMARY KEY ("id")
        )
      `),await r.f.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "BriefSource_url_key" ON "BriefSource"("url")').catch(()=>{}),await r.f.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "BriefScan_sourceId_createdAt_idx" ON "BriefScan"("sourceId", "createdAt")').catch(()=>{}),await r.f.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Brief_status_createdAt_idx" ON "Brief"("status", "createdAt")').catch(()=>{}),0===await r.f.briefSource.count())for(let e of T)await r.f.briefSource.create({data:{name:e.name,url:e.url,lang:e.lang,category:e.category,active:e.active,note:e.note||null}}).catch(()=>{})})().catch(e=>{throw w=null,e})),w}function c(e){return e.replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&quot;/gi,'"').replace(/&#0?39;|&apos;|&#x27;/gi,"'").replace(/&hellip;/gi,"…").replace(/&#(\d+);/g,(e,t)=>{try{return String.fromCodePoint(parseInt(t,10))}catch{return""}}).replace(/&#x([0-9a-f]+);/gi,(e,t)=>{try{return String.fromCodePoint(parseInt(t,16))}catch{return""}})}let E=/^(menu|more|search|sign in|sign up|log in|subscribe|newsletter|home|read more|see more|show more|all posts|latest|trending|popular|categories|tags|reviews|news|shop|about|contact|advertise|privacy|terms|jobs|careers|تمام اخبار|ادامه مطلب|مشاهده بیشتر|بیشتر|منو|جستجو|ورود|ثبت نام|عضویت|خانه|صفحه اصلی|درباره|تماس|تبلیغات|حریم خصوصی|آرشیو|دسته‌بندی|برچسب‌ها|محبوب|تازه‌ها|آخرین مطالب|مطالب مرتبط|نظرات)$/i;async function s(e){let t=new AbortController,a=setTimeout(()=>t.abort(),12e3);try{let a=await fetch(e,{headers:{"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",Accept:"text/html,application/xhtml+xml","Accept-Language":"en-US,en;q=0.9,fa;q=0.8"},signal:t.signal,redirect:"follow"}),r=await a.text();if(!a.ok)throw Error(`HTTP ${a.status}`);return r.slice(0,6e5)}finally{clearTimeout(a)}}async function l(e={}){await o();let t=await r.f.briefSource.findMany({where:{active:!0,...e.category?{category:e.category}:{}},orderBy:{createdAt:"asc"}});if(!t.length)return[];let a=new Date(Date.now()-216e5),n=await r.f.briefScan.findMany({where:{sourceId:{in:t.map(e=>e.id)},ok:!0,createdAt:{gt:a}},orderBy:{createdAt:"desc"}}),i=new Map;for(let e of n)i.has(e.sourceId)||i.set(e.sourceId,e);return await Promise.all(t.map(async t=>{let a=e.force?void 0:i.get(t.id);if(a)return{sourceId:t.id,name:t.name,url:t.url,lang:t.lang,category:t.category,ok:!0,title:a.title,headings:JSON.parse(a.headings||"[]"),cached:!0,scanId:a.id};try{let e=await s(t.url),{title:a,headings:n}=function(e){let t,a=e.replace(/<!--[\s\S]*?-->/g," ").replace(/<(script|style|noscript|svg|template)[\s\S]*?<\/\1>/gi," "),r=a.match(/<title[^>]*>([\s\S]*?)<\/title>/i),n=r?c(r[1]).replace(/\s+/g," ").trim().slice(0,200):null,i=[],o=new Set,s=/<h([1-4])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>/gi;for(;(t=s.exec(a))&&i.length<60;){let e=c(t[2].replace(/<[^>]+>/g," ")).replace(/\s+/g," ").trim().slice(0,160);if(e.length<3||e.length>140||E.test(e))continue;let a=e.toLowerCase();o.has(a)||(o.add(a),i.push({tag:`h${t[1]}`,text:e}))}return{title:n,headings:i}}(e),i=await r.f.briefScan.create({data:{sourceId:t.id,ok:!0,title:a,headings:JSON.stringify(n),headingCount:n.length}});return{sourceId:t.id,name:t.name,url:t.url,lang:t.lang,category:t.category,ok:!0,title:a,headings:n,scanId:i.id}}catch(a){let e=a instanceof Error?"AbortError"===a.name?"timeout":a.message:"fetch failed";return await r.f.briefScan.create({data:{sourceId:t.id,ok:!1,error:e.slice(0,300),headings:"[]",headingCount:0}}).catch(()=>{}),{sourceId:t.id,name:t.name,url:t.url,lang:t.lang,category:t.category,ok:!1,error:e,headings:[]}}}))}function u(e){let t=e.replace(/```json|```/g,"").trim(),a=t.indexOf("{");if(-1===a)throw Error("AI did not return JSON");let r=t.slice(a),n=[r],i=r.lastIndexOf("}");for(let e of(-1!==i&&n.push(r.slice(0,i+1)),n)){try{return JSON.parse(e)}catch{}try{return JSON.parse(e.replace(/,\s*([}\]])/g,"$1"))}catch{}}let o=!1,c=!1,s=[];for(let e of r){if(c){c=!1;continue}if("\\"===e){o&&(c=!0);continue}if('"'===e){o=!o;continue}o||("{"===e?s.push("}"):"["===e?s.push("]"):("}"===e||"]"===e)&&s.pop())}let l=r;for(o&&(l+='"');s.length;)l+=s.pop();return JSON.parse(l)}async function p(e,t){try{return u(await (0,n.d)(e,{maxTokens:t,temperature:.45,timeoutMs:9e4}))}catch{return u(await (0,n.d)([...e,{role:"user",content:"Your previous reply was not parseable JSON. Answer again with ONLY the JSON object itself — no markdown fences, no explanations. Escape every double quote inside string values, or simply avoid double quotes in values."}],{maxTokens:t,temperature:.35,timeoutMs:9e4}))}}function g(e){return e.replace(/["\\]/g,"").replace(/\s+/g," ").trim()}function h(e){let t=e.trim();for(;;){let e=t.replace(/^\[h[1-4]\]\s*/i,"").replace(/^\d+\s*[\].):-]\s*/,"").replace(/^[•\-–—]\s*/,"");if(e===t)break;t=e}return t.trim()}async function d(e,t,a){let r=a.filter(e=>e.ok&&e.headings.length>0);if(!r.length)throw Error("هیچ منبعی هدینگ قابل استخراج نداشت — وضعیت اسکن را بررسی کنید");let n=r.map(e=>{let t=e.headings.slice(0,40).map(e=>`[${e.tag}] ${g(e.text)}`);return`## ${g(e.name)} (${e.lang})
${t.join("\n")}`}).join("\n\n");n.length>14e3&&(n=n.slice(0,14e3)+"\n…(trimmed)");let i=[{role:"system",content:"You are an SEO content strategist. You receive raw heading outlines scraped from competitor/reference sites. Respond with ONLY valid JSON — no markdown fences, no prose."},{role:"user",content:`Target page topic: "${e}" (category: ${t})

Raw heading outlines from ${r.length} sources:

${n}

TASK: keep ONLY the headings that are relevant and valuable for building the content structure of the target page. Drop navigation junk, boilerplate, off-topic and pure-duplicate headings (near-duplicates in different languages may both stay — dedupe within a language). Order the kept headings from most to least important.

Respond with ONLY this JSON:
{"keep":["important heading 1","..."],"clusters":["topic cluster name","..."]}

Rules: keep at most 45 headings. Each string must be the BARE heading text — no numbering, no [h2] tag prefixes, no surrounding quotes, and no double quotes inside. clusters = 3-8 short names grouping what the sources cover (e.g. pricing, use cases, alternatives).`}],o=await p(i,1600),c=(o.keep||[]).map(e=>h(g(String(e||"")))).filter(Boolean).slice(0,45),s=(o.clusters||[]).map(e=>h(g(String(e||"")))).filter(Boolean).slice(0,8);if(!c.length)throw Error("فیلتر هوش مصنوعی هیچ هدینگ مهمی برنگرداند");return{keep:c,clusters:s}}async function f(e,t,a,r){let n=r.filter(e=>e.ok).map(e=>`- ${e.name} (${e.lang}) ${e.url}`).join("\n"),i=[{role:"system",content:"You are a senior SEO content strategist who designs content briefs for writers. You design for Search Intent, full Topical Coverage, and the probability of appearing in Google AI Overview. Respond with ONLY valid JSON — no markdown fences, no prose."},{role:"user",content:`می‌خوام برای صفحه \xab${e}\xbb نیازمندی محتوایی تهیه کنم.
صفحات و منابع زیر را به‌صورت کامل تحلیل کن و بر اساس نیاز کاربر ساختار محتوای پیشنهادی این صفحه را ارائه بده.

منابع (رقبای تحلیل‌شده دسته ${t}):
${n}

هدینگ‌های مهم فیلترشده از منابع:
${a.keep.map((e,t)=>`${t+1}. ${g(e)}`).join("\n")}

خوشه‌های موضوعی منابع: ${a.clusters.join(" | ")||"—"}

موارد زیر را مشخص کن:
• تمامی هدینگ‌های اصلی (H2)
• تمامی ساب‌هدینگ‌های ضروری (H3 و H4)
• موضوعات و زیرموضوعاتی که حتماً باید در محتوا پوشش داده شوند
• هدینگ‌هایی که در منابع موجود نیستند اما برای کامل‌تر شدن محتوا لازم هستند
• سوالات متداول و سوالات مرتبط کاربران درباره این موضوع (فقط سوال — بدون پاسخ)

هدف این است که یک ساختار محتوایی کامل، جامع و مبتنی بر نیاز جستجوی کاربران برای نویسنده تهیه شود.
ساختار پیشنهادی را بر اساس Search Intent، پوشش موضوعی کامل (Topical Coverage) و احتمال حضور در نتایج AI Overview گوگل طراحی کن.

Respond with ONLY this JSON shape:
{"h2":["main heading",...],"h3":[{"text":"sub heading","under":"parent H2"}],"topics":["must-cover topic",...],"missing":["heading absent from sources but needed",...],"faq":["user question 1","..."]}

Caps: h2 ≤ 12, h3 ≤ 24, topics ≤ 12, missing ≤ 8, faq ≤ 15. If the target page is Persian-audience, write the structure in Persian; otherwise English.`}],o=await p(i,2400),c=e=>h(g(String(e||""))),s={h2:(o.h2||[]).map(c).filter(Boolean).slice(0,12),h3:(o.h3||[]).map(e=>({text:c(e?.text),under:c(e?.under)})).filter(e=>e.text).slice(0,24),topics:(o.topics||[]).map(c).filter(Boolean).slice(0,12),missing:(o.missing||[]).map(c).filter(Boolean).slice(0,8),faq:(o.faq||[]).map(c).filter(Boolean).slice(0,15)};if(!s.h2.length)throw Error("هوش مصنوعی هیچ H2 در بریف برنگرداند");return s}e.s(["R",0,d,"S",0,f,"q",0,o,"j",0,function(e){return"string"==typeof e&&m.includes(e)},"u",0,function(e,t,a,r,n){let i=n.filter(e=>e.ok),o=[];return o.push(`# نیازمندی محتوا — ${e}`),o.push(""),o.push(`دسته: ${t} \xb7 تاریخ: ${new Date().toISOString().slice(0,10)}`),o.push(`منابع تحلیل‌شده (${i.length}): ${i.map(e=>e.name).join(" · ")}`),o.push(""),r.clusters.length&&(o.push("## خوشه‌های موضوعی منابع"),o.push(r.clusters.map(e=>`- ${e}`).join("\n")),o.push("")),o.push("## هدینگ‌های اصلی (H2)"),o.push(a.h2.map(e=>`- ${e}`).join("\n")),o.push(""),a.h3.length&&(o.push("## ساب‌هدینگ‌های ضروری (H3/H4)"),o.push(a.h3.map(e=>`- ${e.text}${e.under?` _(زیر ${e.under})_`:""}`).join("\n")),o.push("")),o.push("## موضوعات الزامی پوشش"),o.push(a.topics.map(e=>`- ${e}`).join("\n")),o.push(""),a.missing.length&&(o.push("## هدینگ‌های غایب در منابع (مزیت رقابتی)"),o.push(a.missing.map(e=>`- ${e}`).join("\n")),o.push("")),a.faq.length&&(o.push("## سوالات متداول (فقط سوال)"),o.push(a.faq.map(e=>`- ${e}`).join("\n")),o.push("")),o.push("## هدینگ‌های فیلترشده مهم از منابع"),o.push(r.keep.map(e=>`- ${e}`).join("\n")),o.join("\n")},"I",0,l]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=src_lib_brief_ts_1zxitm76jj7d1._.js.map