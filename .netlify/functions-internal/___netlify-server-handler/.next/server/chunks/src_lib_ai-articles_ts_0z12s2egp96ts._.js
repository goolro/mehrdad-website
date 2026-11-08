module.exports=[58154,e=>e.a(async(t,n)=>{try{var a=e.i(43793),i=e.i(66013),r=e.i(30316),s=e.i(85849),o=e.i(73638),l=e.i(22224),c=t([a,i,r,s,l]);[a,i,r,s,l]=c.then?(await c)():c;let D=`Mehrdad — an independent product builder & engineer.
His world: startups, smart city technology, AI, inventions, product design, digital marketing.
Site: https://mehrdad.ir — portfolio, services and blog live there.
Voice: confident but not boastful, practical, forward-looking, concrete examples over vague hype.`,M=`HUMAN-VOICE ALGORITHM (every rule mandatory — the goal is prose a human editor would sign without suspecting machine assistance):
1. RHYTHM BURST: alternate 3-8 word sentences with 20-30 word ones. Never write three consecutive sentences with similar length or shape. Mechanical evenness is the #1 machine fingerprint.
2. BANNED PHRASES — never write: \xabدر دنیای امروز\xbb، \xabدر عصر دیجیتال\xbb، \xabدر دنیای پرسرعت امروز\xbb، \xabشایان ذکر است\xbb، \xabلازم به ذکر است\xbb، \xabبدون شک\xbb، \xabبر هیچ‌کس پوشیده نیست\xbb، \xabدر نهایت می‌توان گفت\xbb، \xabهمان‌طور که می‌دانید\xbb، \xabدر این مقاله قصد دارم\xbb، "in today's fast-paced world"، "it's important to note"، "delve"، "unlock"، "moreover"، "in conclusion". If a sentence could open a Wikipedia article, delete it.
3. OPEN CONCRETE: the first paragraph is a specific moment — a real situation, a question a client actually asked, a number from your own work, a mistake you made. Never a definition of the topic.
4. FIRST PERSON, OPINIONATED: \xabبه نظرم\xbb، \xabاشتباه من این بود که\xbb، \xabدیگر انجامش نمی‌دهم\xbb. Take sides: say what most people get wrong and what you refuse to do. Zero neutral-encyclopedia tone.
5. SPECIFIC OR DELETE: every section carries one concrete artifact — a number, duration, price, tool name, version, before/after. Ban vague intensity words (\xabبی‌نظیر\xbb، \xabشگفت‌انگیز\xbb، \xabفوق‌العاده\xbb) unless attached to a concrete fact.
6. NO FAKE RESEARCH: never invent statistics, surveys, university studies, or named reports. Numbers only as rough first-person experience (\xabحدود سه برابر\xbb، \xabدر یکی از پروژه‌ها به این نتیجه رسیدم\xbb).
7. ASYMMETRY: sections must be visibly different lengths — one can be just two sentences. At most ONE bullet list in the whole article; humans argue in prose. Never start two consecutive sentences with the same word.
8. WARM CONNECTORS, SPARINGLY: \xabراستش\xbb، \xabببینید\xbb، \xabحالا\xbb، \xabمشکل اینجاست که\xbb — 3-5 across the whole piece, not one per paragraph.
9. LIGHT IMPERFECTION: up to two rhetorical questions, one parenthetical aside, a couple of one-sentence paragraphs. Do not close every section with a tidy summary — humans just move on. No exclamation-mark spam.
10. PERSIAN CRAFT: native fluent Persian — correct نیم‌فاصله (\xabمی‌شود\xbb، \xabبی‌نظیر\xbb)، Persian digits (۱۲۳) inside Persian text, no translationese (\xabاز آنجایی که... لذا\xbb is lawyer-language, humans say \xabچون\xbb.`,U=null;function u(){return U||(U=(async()=>{await a.f.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "AiArticle" (
          "id" TEXT NOT NULL,
          "target" TEXT NOT NULL DEFAULT 'website',
          "lang" TEXT NOT NULL DEFAULT 'fa',
          "topic" TEXT NOT NULL,
          "keyword" TEXT,
          "status" TEXT NOT NULL DEFAULT 'draft',
          "titleFa" TEXT,
          "titleEn" TEXT,
          "slugIdea" TEXT,
          "excerptFa" TEXT,
          "excerptEn" TEXT,
          "metaTitle" TEXT,
          "metaDescription" TEXT,
          "keywords" TEXT,
          "internalLinks" TEXT,
          "hashtags" TEXT,
          "contentFa" TEXT,
          "contentEn" TEXT,
          "reviews" TEXT,
          "seoScore" INTEGER,
          "editorScore" INTEGER,
          "revision" INTEGER NOT NULL DEFAULT 1,
          "lastError" TEXT,
          "publishedSlug" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "AiArticle_pkey" PRIMARY KEY ("id")
        )
      `),await a.f.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "AiArticle_status_createdAt_idx" ON "AiArticle"("status", "createdAt")').catch(()=>{}),await a.f.$executeRawUnsafe('ALTER TABLE "AiArticle" ADD COLUMN IF NOT EXISTS "brief" TEXT').catch(async()=>{await a.f.$executeRawUnsafe('ALTER TABLE "AiArticle" ADD COLUMN "brief" TEXT').catch(()=>{})})})().catch(e=>{throw U=null,e})),U}async function h(e,t={}){let n=await (0,i.S)(),a=n.length?(t.agentSlot??0)%n.length:0;for(let r of n.length>1?[...n.slice(a),...n.slice(0,a)]:n)try{let n=await (0,i.o)(r,e,{timeoutMs:t.timeoutMs??1e5,maxTokens:t.maxTokens??2e3,temperature:t.temperature??.7});if(n)return n}catch(e){console.error(`pipeline agent: provider ${r.name} failed:`,e)}return(0,i.d)(e,{timeoutMs:t.timeoutMs??1e5,maxTokens:t.maxTokens??2e3,temperature:t.temperature??.7})}function d(e){let t=e.replace(/```json|```/g,"").trim(),n=t.indexOf("{");if(-1===n)throw Error("AI did not return JSON");let a=t.slice(n);try{return JSON.parse(a)}catch{}let i=a.lastIndexOf("}");if(-1!==i)try{return JSON.parse(a.slice(0,i+1))}catch{}try{return JSON.parse(function(e){let t=!1,n=!1,a=[];for(let i of e){if(n){n=!1;continue}if("\\"===i){t&&(n=!0);continue}if('"'===i){t=!t;continue}t||("{"===i?a.push("}"):"["===i?a.push("]"):("}"===i||"]"===i)&&a.pop())}let i=e;for(t&&(i+='"');a.length;)i+=a.pop();return i}(a))}catch{throw Error("AI did not return valid JSON")}}async function p(e,t){let n=await h(e,t);try{return d(n)}catch{return console.error("pipeline: first JSON attempt unparseable — retrying once"),d(await h([...e,{role:"assistant",content:g(n,1500)},{role:"user",content:"Your previous reply was not parseable JSON. Answer again with ONLY the JSON object itself — no explanations, no markdown fences, no text before or after. Do not truncate the JSON."}],{...t,temperature:.55}))}}function g(e,t){return e.length<=t?e:`${e.slice(0,t-1)}…`}async function f(){return(await a.f.post.findMany({where:{published:!0},orderBy:{date:"desc"},take:40,select:{slug:!0,titleEn:!0,titleFa:!0}})).filter(e=>!(0,s.u)(e.slug)).map(e=>({slug:e.slug,title:(e.titleFa||e.titleEn||e.slug).trim()}))}function b(e){let t=[e],n=e;for(let e=0;e<3;e++){let e;try{e=decodeURIComponent(n)}catch{break}if(e===n)break;t.push(e),n=e}return t}function m(e){let t,n=[],a=new Set,i=/<a\s[^>]*href="(\/blog\/([^"]+))"[^>]*>([\s\S]*?)<\/a>/gi;for(;t=i.exec(e);){let e=t[2];a.has(e)||(a.add(e),n.push({slug:e,anchor:t[3].replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim().slice(0,80)}))}return n}function w(e,t){let n=t.map(e=>`<li><a href="/blog/${e.slug}">${e.title}</a></li>`).join("");return`<h2>${"fa"===e?"مطالب مرتبط":"Related posts"}</h2><ul>${n}</ul>`}function E(e,t){return e.replace(/<a\s[^>]*href="\/blog\/([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,(e,n,a)=>{let i=b(n);if(t.some(e=>i.includes(e.slug)))return e;let r=t.filter(e=>{let t=b(e.slug);return i.some(e=>e.length>3&&t.some(t=>t.endsWith(e)))});return 1===r.length?`<a href="/blog/${r[0].slug}">${a}</a>`:a})}function y(e,t,n,a){let i=t,r=n;if("website"!==e.target)return{contentFa:i,contentEn:r,links:[]};i=i?E(i,a):i,r=r?E(r,a):r;let s=m(i||""),o=m(r||"");if((s.length<3||o.length<3)&&a.length>0){var l,c;let t,n=new Set([...s,...o].map(e=>e.slug)),u=(l=e.topic,c=e.keyword,t=`${l} ${c||""}`.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(e=>e.length>2),a.filter(e=>!n.has(e.slug)).map(e=>{let n=e.title.toLowerCase();return{p:e,score:t.reduce((e,t)=>e+ +!!n.includes(t),0)}}).sort((e,t)=>t.score-e.score).slice(0,3).map(e=>e.p));u.length&&(i&&s.length<3&&(i+=w("fa",u)),r&&o.length<3&&(r+=w("en",u)))}let u=[],h=new Set;for(let e of[...m(i||""),...m(r||"")]){let t=b(e.slug),n=a.find(e=>t.includes(e.slug));n&&(h.has(n.slug)||(h.add(n.slug),u.push({slug:n.slug,anchor:e.anchor})))}return{contentFa:i,contentEn:r,links:u}}let C=`SEO REQUIREMENTS (all mandatory):
- Focus keyword appears in: title, meta title, meta description, the first paragraph, and at least two H2 headings — naturally, never stuffed.
- <metaTitle> ≤ 60 chars. <metaDescription> ≤ 155 chars, written to earn the click.
- Body: 900-1300 words per language. Semantic structure with <h2> main sections and <h2>/<h3> sub-points. Paragraphs short (2-4 sentences).
- Include a "FAQ" section at the end: 3-4 <h3> questions each answered in 2-3 sentences (targets rich results and People-Also-Ask).
- INTERNAL LINKING: pick 3-6 truly relevant targets from the ALLOWED LIST below and weave them into the body as <a href="/blog/SLUG">descriptive anchor text</a>. Anchor text must describe the target page (never "click here"). NEVER invent a slug that is not on the list.
- Content must teach something concrete: steps, examples, numbers, real trade-offs. No fluff introductions like "in today's fast-paced world".
- End the body (before FAQ) with one short actionable takeaway paragraph.`,P=`GEO / AI-CITABILITY RULES (mandatory — answer engines quote self-contained passages):
- Write 2-3 "answer blocks" in the body: single <p> of 40-60 words that stands completely alone — names the subject explicitly, states one concrete fact pattern (what it is / how it works / what it costs / who wins) and could be quoted verbatim by an AI engine with zero surrounding context.
- Every FAQ answer opens with the direct answer in its FIRST sentence, then adds nuance — answer-first, never buildup-first.
- Include at least one explicit definition sentence per key concept (\xabX یعنی ...\xbb / "X is ...") — definitions are the most-cited passage type.
- These blocks must not read like the rest of the article's voice work: plain, declarative, fact-dense. Everything around them keeps the HUMAN-VOICE ALGORITHM.`;async function T(e,t){let n,a,i=await f(),s=await (0,r.t)(`${e.topic} ${e.keyword||""}`,5),o=(0,r.H)(s),l="fa"===e.lang?"Write in fluent, natural Persian (Farsi) — prose a native editor would sign, not machine translation.":"Write in English.";return"website"===e.target?(n=`You are AI WRITER (agent 1 of 3) in the content pipeline for ${D}

TASK: write a complete, publication-ready, fully SEO-optimized blog article that reads 100% human.

${M}

${C}

${P}

ALLOWED INTERNAL LINKS (the ONLY slugs you may link to):
${i.map(e=>`- /blog/${e.slug} → ${e.title}`).join("\n")}

EXISTING SITE KNOWLEDGE (stay consistent with Mehrdad's other content, never copy verbatim):
${o||"(none)"}

${l}
Respond with ONLY valid JSON (no markdown fences) in this exact shape:
{"titleFa":"","titleEn":"","slug":"kebab-case-from-english-title","excerptFa":"","excerptEn":"","metaTitle":"","metaDescription":"","keywords":["","",""],"contentFa":"<h2>…</h2><p>…</p>…","contentEn":"<h2>…</h2><p>…</p>…"}
Both languages are always produced. The HTML must use only <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <a> tags — no <html>/<body>/<h1>.`,a=`Topic: ${e.topic}${e.keyword?`
Focus keyword: ${e.keyword}`:""}${e.brief?`

CONTENT BRIEF (from the SEO brief builder — MANDATORY: follow its H2/H3 outline, cover every listed topic, and answer the FAQ questions in a dedicated FAQ section):
${e.brief}`:""}${t?`

REVISION REQUEST (${e.lang} version must be rewritten; keep the other language version as-is):
${t}`:""}

Write the full article now.`):(n=`You are AI WRITER (agent 1 of 3) in the content pipeline for ${D}

TASK: write a LinkedIn post that looks human, earns dwell time, and drives profile/blog visits.

FORMAT RULES:
- First 2 lines = the hook (they show before "...see more") — curiosity or a bold, specific insight
- Short paragraphs (1-2 sentences), blank line between them
- One practical insight or lesson the reader can use (steps, numbers, concrete examples)
- End with a soft CTA pointing to https://mehrdad.ir
- 3-5 relevant hashtags at the very end
- Length: 600-1300 characters — never exceed

HUMAN-VOICE RULES (mandatory): first person with one real scene from work (a client call, a launch, a bug); alternate short punchy and long sentences; no \xabدر دنیای امروز\xbb-style openers and no clich\xe9s (\xabشایان ذکر است\xbb، \xabبدون شک\xbb، \xabهمان‌طور که می‌دانید\xbb); never invent statistics — only rough first-person experience; no perfectly parallel lines, no empty superlatives (\xabبی‌نظیر\xbb، \xabشگفت‌انگیز\xbb); sound like a builder sharing what happened, not a brand page announcing.

EXISTING SITE KNOWLEDGE (may inform the post, never copy verbatim):
${o||"(none)"}

${l}
Respond with ONLY valid JSON (no markdown fences) in this exact shape:
{"titleFa":"","titleEn":"","contentFa":"","contentEn":"","hashtags":["","",""]}
Fill contentFa and contentEn both; hashtags apply to both versions.`,a=`Topic: ${e.topic}${e.keyword?`
Angle/keyword: ${e.keyword}`:""}${t?`

REVISION REQUEST (rewrite the ${e.lang} version; keep the other as-is):
${t}`:""}

Write the post now.`),await p([{role:"system",content:n},{role:"user",content:a}],{maxTokens:6e3,temperature:t?.65:.75,timeoutMs:11e4,agentSlot:0})}function v(){return`Respond with ONLY valid JSON (no markdown fences):
{"score":0-100,"verdict":"approve"|"revise","issues":["…"],"must_fix":["…"],"notes":"one short paragraph"}
- score ≥ 85 AND empty must_fix is required for "approve"
- must_fix = blocking problems only (empty array when you approve)
- issues = non-blocking improvement suggestions`}async function x(e,t,n){let a="seo"===e?1:2;try{return await p(t,{maxTokens:1600,temperature:.4,timeoutMs:9e4,agentSlot:a})}catch(i){console.error(`${e} reviewer: JSON retry exhausted — salvaging raw reply`);let n=function(e){let t=e.match(/"score"\s*:\s*(\d{1,3})/);if(!t)return null;let n=e.match(/"verdict"\s*:\s*"(approve|revise)"/);return{score:Math.min(100,Number(t[1])),verdict:n?.[1]||"revise",issues:[],must_fix:[],notes:"salvaged from a partial reply"}}(await h(t,{maxTokens:1600,temperature:.3,timeoutMs:9e4,agentSlot:a}));if(n)return n;throw i}}function k(e,t,n){return{agent:t,revision:n,score:Math.max(0,Math.min(100,Math.round(Number(e.score)||0))),verdict:"approve"===e.verdict?"approve":"revise",issues:Array.isArray(e.issues)?e.issues.map(String).slice(0,8):[],must_fix:Array.isArray(e.must_fix)?e.must_fix.map(String).slice(0,8):[],notes:String(e.notes||"").slice(0,600),at:new Date().toISOString()}}async function N(e){let t="fa"===e.lang?e.contentFa:e.contentEn,n="fa"===e.lang?e.contentEn:e.contentFa,a=new Set(e.linkPool.map(e=>e.slug)),i=e.internalLinks.filter(e=>!a.has(e.slug)),r=`You are AI SEO AUDITOR (agent 2 of 3) — a ruthless but fair technical SEO reviewer for ${D}
You review revision #${e.revision}. Target: ${"linkedin"===e.target?"LinkedIn post":"blog article (website)"}.
${"linkedin"===e.target?`LINKEDIN CHECKLIST (score 0-100, be strict — a 90+ must deserve publishing):
1. Hook: first 2 lines must earn the "see more" tap — curiosity, bold specific insight, or a concrete scene
2. Content depth: one practical, usable takeaway (steps/numbers/concrete example); 600-1300 characters total
3. Platform-native tone: reads like a person, not a brand page; short paragraphs with blank lines between them
4. CTA: soft, honest, points to https://mehrdad.ir — and ZERO fake/pretend links inside the text (LinkedIn posts cannot carry hyperlinks)
5. Hashtags: 3-5 relevant ones at the very end, no spam
6. HUMAN-LIKENESS: no AI clich\xe9s (\xabدر دنیای امروز\xbb، \xabشایان ذکر است\xbb، \xabبدون شک\xbb), no invented statistics, no uniform parallel lines
   NOTE: meta title/description/internal links DO NOT APPLY to LinkedIn — never flag their absence.`:`WEBSITE CHECKLIST (score 0-100, be strict — a 90+ must deserve publication):
1. Focus keyword usage: title, first paragraph, headings — natural, not stuffed
2. Meta title ≤ 60 chars; meta description ≤ 155 chars and click-worthy
3. Heading hierarchy: semantic <h2>/<h3>, no keyword-stuffed headings
4. Internal links: 3-6 contextual links with descriptive anchors. LinkedIn: zero fake links
5. Content depth: concrete examples/steps, scannable paragraphs, 900-1300 words
6. FAQ section present
7. Link integrity: every internal link slug must exist in the ALLOWED LIST${i.length?`

DETECTED HALLUCINATED LINKS (automatic must_fix): ${i.map(e=>e.slug).join(", ")}`:""}
8. GEO citability: 2-3 self-contained 40-60 word answer blocks present (subject named explicitly, quoteable with zero context); FAQ answers open with the direct answer in the first sentence; at least one explicit definition sentence per key concept`}

ALLOWED INTERNAL LINK SLUGS:
${e.linkPool.map(e=>e.slug).join("\n")||"(none)"}

${v()}`,s=`Topic: ${e.topic}
Focus keyword: ${e.keyword||"(writer chose)"}
Meta title (${(e.metaTitle||"").length} chars, limit 60): ${e.metaTitle||"(missing)"}
Meta description (${(e.metaDescription||"").length} chars, limit 155): ${e.metaDescription||"(missing)"}
Internal links used (${e.internalLinks.length}): ${JSON.stringify(e.internalLinks)}
NOTE: the lengths/counts above are pre-measured by code — they are exact. Do NOT flag a length or count violation unless the measured number actually exceeds the limit.
Review-language content:
${g((0,l.c)(t||""),3500)}
(The other-language version exists but is not under review this round: ${n?`${(0,l.c)(n).length} chars`:"missing"})`;return k(await x("seo",[{role:"system",content:r},{role:"user",content:s}],e.revision),"seo",e.revision)}async function A(e){let t="fa"===e.lang?e.contentFa:e.contentEn,n=`You are AI EDITOR-IN-CHIEF (agent 3 of 3) — the quality gate for ${D}
You review revision #${e.revision} INDEPENDENTLY (you cannot see the SEO auditor's opinion).

CHECKLIST (score 0-100, be strict):
1. Accuracy & honesty: no invented statistics, fake claims, or facts about Mehrdad that are not given. Flag anything that sounds fabricated
2. HUMAN-LIKENESS (act as an AI-pattern detector): the piece must read like a sharp human practitioner wrote it in one sitting. Flag every sentence a careful reader would label machine-written: uniform sentence rhythm, symmetric section lengths, generic encyclopedia openings, clich\xe9 transitions (\xabدر دنیای امروز\xbb، \xabشایان ذکر است\xbb، "moreover")، stacked hedging, empty superlatives (\xabبی‌نظیر\xbb، \xabشگفت‌انگیز\xbb), tidy summary closings on every section. If YOU would guess "AI-generated", score below 85 and put the exact offending sentences in must_fix with a concrete rewrite direction
3. Voice: confident but not boastful, practical, concrete examples over hype. Reads like Mehrdad, not like a generic AI
4. Language quality: native-level ${"fa"===e.lang?"Persian (no translationese)":"English"}
5. Structure & flow: logical progression, no repeated sentences, no filler phrases
6. Value: the reader finishes knowing something they can actually use
7. CTA: present and honest${"linkedin"===e.target?"; hook must work in the first 2 lines":""}
8. GEO (website target only): at least two passages a search-AI could quote verbatim — self-contained, fact-dense, 40-60 words${"linkedin"===e.target?" (N/A for LinkedIn)":""}

${v()}`,a=`Topic: ${e.topic}
Content under review:
${g((0,l.c)(t||""),3500)}`;return k(await x("editor",[{role:"system",content:n},{role:"user",content:a}],e.revision),"editor",e.revision)}function S(e,t){let n=e.trim();if(n.length<=t)return n;let a=n.slice(0,t),i=a.lastIndexOf(" ");return`${(i>.6*t?a.slice(0,i):a).trim()}…`}function I(e){return e.contentFa&&(e.contentFa=(0,o.E)(e.contentFa)),e.contentEn&&(e.contentEn=(0,o.E)(e.contentEn)),e.metaTitle&&(e.metaTitle=S(e.metaTitle,60)),e.metaDescription&&(e.metaDescription=S(e.metaDescription,155)),e}async function O(e){await u();let t=I(await T(e)),n=await f(),i=y(e,t.contentFa||void 0,t.contentEn||void 0,n);return(await a.f.aiArticle.create({data:{target:e.target,lang:e.lang,topic:e.topic,keyword:e.keyword||null,brief:e.brief||null,status:"draft",titleFa:t.titleFa||null,titleEn:t.titleEn||null,slugIdea:t.slug||null,excerptFa:t.excerptFa||null,excerptEn:t.excerptEn||null,metaTitle:t.metaTitle||null,metaDescription:t.metaDescription||null,keywords:JSON.stringify(t.keywords||[]),internalLinks:JSON.stringify(i.links),hashtags:JSON.stringify(t.hashtags||[]),contentFa:i.contentFa||null,contentEn:i.contentEn||null,revision:1}})).id}async function L(e){await u();let t=await a.f.aiArticle.findUnique({where:{id:e}});if(!t)throw Error("Article not found");if("published"===t.status)throw Error("Article already published");let n=await f(),i={target:t.target,lang:t.lang,topic:t.topic,keyword:t.keyword,metaTitle:t.metaTitle,metaDescription:t.metaDescription,contentFa:t.contentFa,contentEn:t.contentEn,internalLinks:JSON.parse(t.internalLinks||"[]"),linkPool:n,revision:t.revision},[r,s]=await Promise.all([N(i).catch(e=>(console.error("seo reviewer failed:",e),null)),A(i).catch(e=>(console.error("editor reviewer failed:",e),null))]);if(!r&&!s)throw Error("Both reviewers failed");let o=JSON.parse(t.reviews||"[]"),l=[r,s].filter(Boolean);o.push(...l);let c=r?.score??t.seoScore??void 0,h=s?.score??t.editorScore??void 0,d=l.flatMap(e=>e.must_fix),p=2===l.length&&(c??0)>=85&&(h??0)>=85&&0===d.length&&r?.verdict==="approve"&&s?.verdict==="approve";return await a.f.aiArticle.update({where:{id:e},data:{status:p?"approved":"needs_revision",seoScore:"number"==typeof c?c:null,editorScore:"number"==typeof h?h:null,reviews:JSON.stringify(o),lastError:null}}),{id:e,status:p?"approved":"needs_revision",seoScore:c,editorScore:h,reviews:l}}async function $(e){await u();let t=await a.f.aiArticle.findUnique({where:{id:e}});if(!t)throw Error("Article not found");if(t.revision>=3)throw Error("Revision limit reached — human decision required");let n=JSON.parse(t.reviews||"[]").filter(e=>(e.revision??1)===t.revision),i=n.flatMap(e=>e.must_fix.map(t=>`[${e.agent??"reviewer"}] ${t}`)),r=n.flatMap(e=>e.issues.map(t=>`[${e.agent??"reviewer"}] ${t}`));if(!i.length&&!r.length)throw Error("No feedback to apply — run a review first");let s=[i.length?`BLOCKING (must all be fixed):
${i.map(e=>`- ${e}`).join("\n")}`:"",r.length?`IMPROVEMENTS (apply what makes sense):
${r.map(e=>`- ${e}`).join("\n")}`:"",`Latest scores: SEO ${t.seoScore??"?"}/100, Editor ${t.editorScore??"?"}/100. Target: 85+ on both.`].filter(Boolean).join("\n\n"),o=I(await T({topic:t.topic,keyword:t.keyword||void 0,target:t.target,lang:t.lang,brief:t.brief||void 0},s)),l=await f(),c=y({topic:t.topic,keyword:t.keyword||void 0,target:t.target,lang:t.lang},o.contentFa||t.contentFa||void 0,o.contentEn||t.contentEn||void 0,l);return await a.f.aiArticle.update({where:{id:e},data:{titleFa:o.titleFa||t.titleFa,titleEn:o.titleEn||t.titleEn,slugIdea:o.slug||t.slugIdea,excerptFa:o.excerptFa||t.excerptFa,excerptEn:o.excerptEn||t.excerptEn,metaTitle:o.metaTitle||t.metaTitle,metaDescription:o.metaDescription||t.metaDescription,keywords:JSON.stringify(o.keywords||[]),internalLinks:JSON.stringify(c.links),hashtags:JSON.stringify(o.hashtags||[]),contentFa:c.contentFa||t.contentFa,contentEn:c.contentEn||t.contentEn,revision:t.revision+1,status:"draft",lastError:null}}),{id:e,revision:t.revision+1}}async function F(e){let t=e.toLowerCase().replace(/[^\w\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"").slice(0,90)||"ai-article",n=t,i=1;for(;await a.f.post.findUnique({where:{slug:n}});)i+=1,n=`${t}-${i}`;return n}async function R(t,n){let i=await a.f.aiArticle.findUnique({where:{id:t}});if(!i)throw Error("Article not found");if("published"===i.status)throw Error("Already published");if("website"===i.target){let r=i.slugIdea||i.titleEn||i.titleFa||i.topic,s=await F(r),l=await a.f.post.create({data:{slug:s,titleEn:i.titleEn||null,titleFa:i.titleFa||null,excerptEn:i.excerptEn||null,excerptFa:i.excerptFa||null,contentEn:(0,o.E)(i.contentEn||"")||null,contentFa:(0,o.E)(i.contentFa||"")||null,cover:n.cover||null,published:!0,featured:!1,source:"ai",date:new Date,...n.categoryId?{categories:{connect:[{id:n.categoryId}]}}:{}}}),{addPostToKb:c}=await e.A(90174);await c(l.id).catch(e=>console.error("pipeline publish: kb failed:",e)),process.env.VERCEL_DEPLOY_HOOK_URL&&await fetch(process.env.VERCEL_DEPLOY_HOOK_URL,{method:"POST"}).catch(()=>{});let{notifyIndexNow:u}=await e.A(64704),h=(process.env.SITE_ORIGIN||"https://mehrdad.ir").replace(/\/+$/,"");return u([`${h}/blog/${encodeURIComponent(l.slug)}`,`${h}/blog`]),await a.f.aiArticle.update({where:{id:t},data:{status:"published",publishedSlug:l.slug}}),{target:"website",slug:l.slug}}let r="en"===i.lang?"en":"fa",s=(("en"===i.lang?i.contentEn:i.contentFa)||i.contentEn||i.contentFa||"").trim();if(!s)throw Error("Empty LinkedIn content");let l=await a.f.socialDraft.create({data:{platform:"linkedin",lang:r,topic:i.titleFa||i.titleEn||i.topic,sourceSlug:i.publishedSlug||null,content:s}});return await a.f.aiArticle.update({where:{id:t},data:{status:"published"}}),{target:"linkedin",draftId:l.id}}e.s(["P",0,D,"k",0,P,"p",0,M,"$",0,u,"H",0,O,"S",0,R,"M",0,L,"z",0,$,"j",0,function(e){return{...e,keywords:JSON.parse(e.keywords||"[]"),internalLinks:JSON.parse(e.internalLinks||"[]"),hashtags:JSON.parse(e.hashtags||"[]"),reviews:JSON.parse(e.reviews||"[]")}}]),n()}catch(e){n(e)}},!1)];

//# sourceMappingURL=src_lib_ai-articles_ts_0z12s2egp96ts._.js.map