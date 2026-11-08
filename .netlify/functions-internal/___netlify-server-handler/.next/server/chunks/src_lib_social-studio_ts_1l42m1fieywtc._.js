module.exports=[22224,e=>e.a(async(t,n)=>{try{var r=e.i(43793),a=e.i(66013),i=e.i(30316),o=t([r,a,i]);[r,a,i]=o.then?(await o)():o;let d={linkedin:{limit:3e3,label:"LinkedIn",style:`Professional storytelling post.
- First 2 lines = the hook (they show before "...see more"), must create curiosity or state a bold insight
- Short paragraphs (1-2 sentences), blank line between them
- 1 practical insight or lesson the reader can use
- End with a soft CTA pointing to https://mehrdad.ir
- 3-5 relevant hashtags at the very end
- Length: 600-1300 characters`},instagram:{limit:2200,label:"Instagram",style:`Casual, energetic caption.
- First line = scroll-stopping hook
- Friendly, conversational, a few well-placed emojis (not one per word)
- Value in short scannable lines
- End with a CTA to follow + visit https://mehrdad.ir
- 8-12 hashtags at the very end (mix broad and niche)
- Length: 300-1500 characters`},x:{limit:280,label:"X (Twitter)",style:`Punchy one-post tweet.
- One strong idea, no fluff, fits 280 characters STRICTLY
- 1-2 hashtags max, optional
- Mention https://mehrdad.ir only if it fits naturally
- Length: under 280 characters — this is a hard limit`},telegram:{limit:4096,label:"Telegram",style:`Informative channel post.
- Bold headline line first
- 3-6 short paragraphs with substance (tips, facts, insights)
- End with a link line: https://mehrdad.ir
- Length: 500-2000 characters`}},p=`You write social media posts for Mehrdad — an independent product builder & engineer.
His world: startups, smart city technology, AI, inventions, product design, digital marketing.
Site: https://mehrdad.ir — his portfolio, services and blog live there.
Voice: confident but not boastful, practical, forward-looking, concrete examples over vague hype. He shares lessons, not ads.

FACTS POLICY (hard rules — violations get the output rejected):
- Use ONLY facts, numbers and events that appear in the SOURCE material. Never invent metrics, dates, partnerships, product names, or publishing events.
- The post must stand alone: no references to other posts ("the previous post"), no "published today", no "in collaboration with", no pointers to pages other than mehrdad.ir.
- Never mention the writing process, SEO tests, or that the post is AI-generated.
- Mehrdad's name in Persian is \xabمهرداد\xbb — never spell it \xabمهراد\xbb.`;function s(e){return e.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<\/(p|h2|h3|li|div)>/gi,"\n").replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/[ \t]+/g," ").replace(/\n{3,}/g,"\n\n").trim()}async function l(e){for(let t of(await (0,a.S)()))try{let n=await (0,a.o)(t,e,{timeoutMs:1e5,maxTokens:4e3,temperature:.75});if(n)return n}catch(e){console.error(`social generate: provider ${t.name} failed:`,e)}return(0,a.d)(e,{timeoutMs:1e5,maxTokens:4e3,temperature:.75})}async function h(e,t){var n;if("topic"===e.source){let t=await (0,i.t)(e.topic||"",4),n=(0,i.H)(t);return{block:`TOPIC:
${e.topic}

Existing site knowledge (may inform the post, never copy verbatim):
${n||"(none)"}`,note:n?"":"NO site knowledge was found for this topic in the site knowledge base. The topic description above is your ONLY source. Do NOT invent or cite any specific statistics, percentages, survey results, prices, dates of events, or named studies — keep every claim qualitative. If the topic cannot be written about without such specifics, write about the underlying principle instead.",grounded:!!n}}let a=await r.f.post.findUnique({where:{slug:e.slug}});if(!a)throw Error("Post not found");let o=s(a.contentFa||""),l=s(a.contentEn||""),h="",c="";if("fa"===t?o.length>=300?h=o:l.length>=300&&(h=l,c="The source post is only available in English. Write the social post in natural Persian — translate and adapt the substance; do NOT copy English sentences into the post."):l.length>=300?h=l:o.length>=300&&(h=o,c="The source post is only available in Persian. Write the social post in natural English — translate and adapt the substance; do NOT copy Persian sentences into the post."),!h)throw Error("source post has too little text (< 300 chars) to ground a social post");let u=(a.titleFa||a.titleEn||"").trim();return{block:`SOURCE BLOG POST (already published on mehrdad.ir):
Title: ${u}
URL: https://mehrdad.ir/blog/${a.slug}
Content:
${(n=h).length<=2200?n:`${n.slice(0,2199)}…`}

Turn THIS post into social content — do not invent a different subject.`,note:c,grounded:!0}}async function c(e,t,n,r,a,i={}){let o=`${p}

PLATFORM: ${e.label}
FORMAT RULES:
${e.style}

${"fa"===n?"Write the ENTIRE post in fluent natural Persian (Farsi) — hook, body and hashtags all in Persian. Latin text is only allowed for unavoidable tech/product terms (e.g. MVP, AI) and URLs. Do NOT include an English version.":"Write the ENTIRE post in natural English — hook, body and hashtags all in English."}Return ONLY valid JSON (no markdown fences) in this exact shape:
{"posts":[{"lang":"${n}","hook":"first line / hook","content":"full post text"}]}
"content" must include the hook as its first line. The "lang" field must be exactly "${n}".`,s=`${r}${a?`

${a}`:""}`,h=`${p}

PLATFORM: ${e.label}
FORMAT RULES:
${e.style}

${"fa"===n?"Write the ENTIRE post in fluent natural Persian (Farsi) — hook, body and hashtags all in Persian. Latin text is only allowed for unavoidable tech/product terms (e.g. MVP, AI) and URLs. Do NOT include an English version.":"Write the ENTIRE post in natural English — hook, body and hashtags all in English."}
OUTPUT FORMAT (STRICT): reply with PLAIN TEXT only — NO JSON, no markdown fences, no commentary — in exactly this shape:
===HOOK===
<one-line hook>
===POST===
<the full post text>`,u=e=>"quantitative"===e?"Your previous answer was REJECTED: it contained numerals/statistics, but NO source material exists for this topic, so every number would be invented. Rewrite the full post with ZERO numerals (no percentages, no figures, no years, no counts) — qualitative statements only. Return ONLY the JSON.":"json"===e?`Your previous answer was REJECTED: it was NOT valid JSON (SyntaxError). Return ONLY valid JSON — no markdown fences, no trailing commas, no raw newlines inside strings, escape every double quote — in this exact shape: {"posts":[{"lang":"${n}","hook":"first line / hook","content":"full post text"}]}`:"fa"===n?"Your previous answer was REJECTED: it was not written in Persian. Try again and return ONLY the JSON — the full post (hook, body, hashtags) written entirely in fluent natural Persian.":"Your previous answer was REJECTED: it was not written in English. Try again and return ONLY the JSON — the full post (hook, body, hashtags) written entirely in natural English.",d=(r,a)=>{let o,s=a.trim().replace(/مهراد/g,"مهرداد");if(s.length<80)throw Error(`suspiciously short output (${s.length} chars)`);let l=(o=s.match(/\p{L}/gu)||[]).length<20?-1:(s.match(/[\u0600-\u06FF]/g)||[]).length/o.length;if(!(l<0)){if("fa"===n&&l<.6)throw Error(`language check failed — Persian letter ratio ${l.toFixed(2)} < 0.6 (output is probably English)`);if("en"===n&&l>.25)throw Error(`language check failed — Persian letter ratio ${l.toFixed(2)} > 0.25 (output is probably Persian)`)}return i.banNumerals&&function(e){let t=e.replace(/https?:\/\/\S+/g," "),n=t.match(/[\d\u06F0-\u06F9]/);if(n){let e=n.index??0,r=t.slice(Math.max(0,e-40),e+40).replace(/\s+/g," ").trim();throw Error(`quantitative-claim check failed — ungrounded topic posts must contain no numerals, found "${n[0]}" near: …${r}…`)}}(s),{platform:t,lang:n,hook:(r.trim()||s.split("\n")[0]||"").slice(0,200),content:"x"===t?s.slice(0,280):s,limit:e.limit}},g=null;for(let e=1;e<=3;e++)try{if(3===e){let e=await l([{role:"system",content:h},{role:"user",content:s}]),t=function(e){let t="===HOOK===",n="===POST===",r=e.indexOf(t),a=e.indexOf(n);if(-1===a)return null;let i=-1!==r&&a>r?e.slice(r+t.length,a).trim():"",o=e.slice(a+n.length).trim();return o?{hook:i,content:o}:null}(e.replace(/```[a-z]*\n?/gi,""));if(!t)throw Error("marker-mode output missing ===POST=== section");return d(t.hook,t.content)}let t=1===e?null:g instanceof Error&&g.message.startsWith("quantitative-claim")?"quantitative":g instanceof Error&&g.message.includes("JSON")?"json":"language",n=1===e?[{role:"system",content:o},{role:"user",content:s}]:[{role:"system",content:o},{role:"user",content:s},{role:"user",content:u(t)}],r=(await l(n)).replace(/```json|```/g,"").trim(),a=r.indexOf("{"),i=r.lastIndexOf("}");if(-1===a||-1===i)throw Error("AI did not return JSON");let c=(JSON.parse(r.slice(a,i+1)).posts||[]).find(e=>(e.content||"").trim());if(!c)throw Error("empty generation result");return d(c.hook||"",c.content||"")}catch(r){g=r,console.error(`social generate: ${t}/${n} attempt ${e} failed:`,r)}throw g instanceof Error?g:Error("generation failed after retry")}async function u(e){let t="both"===e.lang?["fa","en"]:[e.lang],n=[];for(let r of e.platforms){let a=d[r];if(!a)throw Error(`Unknown platform: ${r}`);for(let i of t){let{block:t,note:o,grounded:s}=await h(e,i);n.push(await c(a,r,i,t,o,{banNumerals:!s}))}}if(!n.length)throw Error("Empty generation result");return n}e.s(["b",0,d,"_",0,u,"c",0,s]),n()}catch(e){n(e)}},!1)];

//# sourceMappingURL=src_lib_social-studio_ts_1l42m1fieywtc._.js.map