module.exports=[57e3,e=>e.a(async(t,a)=>{try{var r=e.i(73296),i=e.i(43793),o=t([i]);[i]=o.then?(await o)():o;let h=(process.env.CONTACT_TO_EMAIL||"moshtarakinapp@gmail.com").trim(),c=(process.env.SMTP_USER||"").trim(),u=process.env.SMTP_PASS||"",f="https://mehrdad.ir",w=null;function n(){return w||(w=(async()=>{await i.f.$executeRawUnsafe('ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "nurtureStep" INTEGER NOT NULL DEFAULT 0').catch(async()=>{await i.f.$executeRawUnsafe('ALTER TABLE "Lead" ADD COLUMN "nurtureStep" INTEGER NOT NULL DEFAULT 0').catch(()=>{})})})().catch(e=>{throw w=null,e})),w}function l(e,t,a,r){let i=`<p style="margin:20px 0"><a href="${r}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600">${a}</a></p>`;return`<div dir="${e}" style="font:14px/1.8 -apple-system,Segoe UI,Tahoma,sans-serif;color:#222;max-width:560px">`+t.map(e=>`<p style="margin:0 0 12px">${e}</p>`).join("")+i+'<p style="color:#888;font-size:12px;margin-top:24px">mehrdad.ir</p></div>'}async function s(e,t){if(!(c&&u))return!1;try{let a;return await (a=Number(process.env.SMTP_PORT||465),r.f.createTransport({host:process.env.SMTP_HOST||"smtp.gmail.com",port:a,secure:465===a,auth:{user:c,pass:u},connectionTimeout:8e3,greetingTimeout:6e3,socketTimeout:1e4})).sendMail({from:`"Mehrdad — mehrdad.ir" <${c}>`,to:e.email,replyTo:h,subject:t.subject,text:t.text,html:t.html}),!0}catch(e){return console.error("lead nurture email failed:",e),!1}}async function p(e){let t=await s(e,"en"===e.lang?{subject:"Your idea landed — here is the next step",text:`Hi!

Your email reached me — I'm Mehrdad, a product builder at mehrdad.ir.

If you have an idea that deserves to go live: in one MVP Sprint I take it from first sketch to a real product in about two weeks — design, development and deployment together.

Two ways to continue:
1) See the MVP Sprint page: ${f}/mvp-sprint
2) Just reply to this email — I read every reply myself.

No spam: at most one more email later (a real example).

Mehrdad — mehrdad.ir`,html:l("ltr",["Hi!","Your email reached me — I'm <b>Mehrdad</b>, a product builder at mehrdad.ir.","If you have an idea that deserves to go live: in one <b>MVP Sprint</b> I take it from first sketch to a real product in about two weeks — design, development and deployment together.","Two ways to continue: see the MVP Sprint page or just reply to this email — I read every reply myself.","No spam: at most one more email later (a real example)."],"See the MVP Sprint",`${f}/mvp-sprint`)}:{subject:"ایده‌ات رسید — قدم بعدی چیست؟",text:`سلام!

ایمیلت رسید — من مهردادم؛ سازندهٔ محصول در mehrdad.ir.

اگر ایده‌ای داری که باید زنده شود: در یک اسپرینت MVP آن را در حدود دو هفته از اولین طرح تا محصول واقعی می‌رسانم — طراحی و توسعه و استقرار با هم.

دو راه برای ادامه:
۱) صفحهٔ اسپرینت MVP را ببین: ${f}/mvp-sprint
۲) فقط به همین ایمیل جواب بده — خودم می‌خوانم.

قرار نیست اسپم بفرستم؛ حداکثر یک ایمیل دیگر (معرفی یک نمونهٔ واقعی) بعداً برایت می‌فرستم.

مهرداد — mehrdad.ir`,html:l("rtl",["سلام!","ایمیلت رسید — من <b>مهردادم</b>؛ سازندهٔ محصول در mehrdad.ir.","اگر ایده‌ای داری که باید زنده شود: در یک <b>اسپرینت MVP</b> آن را در حدود دو هفته از اولین طرح تا محصول واقعی می‌رسانم — طراحی و توسعه و استقرار با هم.","دو راه برای ادامه: صفحهٔ اسپرینت MVP را ببین یا فقط به همین ایمیل جواب بده — خودم می‌خوانم.","قرار نیست اسپم بفرستم؛ حداکثر یک ایمیل دیگر (معرفی یک نمونهٔ واقعی) بعداً برایت می‌فرستم."],"اسپرینت MVP را ببین",`${f}/mvp-sprint`)});return t&&await i.f.lead.update({where:{id:e.id},data:{nurtureStep:1}}).catch(()=>{}),t}async function d(e){let t=await s(e,"en"===e.lang?{subject:"A real example: from pitch deck to fintech super-app",text:`Hi again!

Two days ago your email reached me. Here is a real example of how this path works end to end:

kilika — a fintech super-app pitch for Iran: a full investor deck plus a project page telling the whole product story:
${f}/work/kilika-fintech

And if you would rather jump straight to your own idea:
${f}/mvp-sprint
Or simply reply to this email.

If the timing is not right — no problem; this was my last email.

Mehrdad — mehrdad.ir`,html:l("ltr",["Hi again!","Two days ago your email reached me. Here is a <b>real example</b> of how this path works end to end:","kilika — a fintech super-app pitch for Iran: a full investor deck plus a project page telling the whole product story.","If you would rather jump straight to your own idea: open the MVP Sprint page or simply reply to this email.","If the timing is not right — no problem; this was my last email."],"See the MVP Sprint",`${f}/mvp-sprint`)}:{subject:"یک نمونهٔ واقعی: از دِک سرمایه‌گذاری تا ابراپ فین‌تک",text:`سلام دوباره!

دو روز پیش ایمیلت را گرفتم. یک نمونهٔ واقعی برای اینکه ببینی این مسیر سر تا ته چطور انجام می‌شود:

کلیکا — دِک سرمایه‌گذاری یک ابراپ فین‌تک برای ایران + صفحهٔ پروژه با داستان کامل محصول:
${f}/work/kilika-fintech

و اگر ترجیح می‌دهی مستقیم سراغ ایدهٔ خودت برویم:
${f}/mvp-sprint
یا ساده‌تر: همین ایمیل را جواب بده.

اگر فعلاً وقتش نیست — اشکالی ندارد؛ این آخرین ایمیل من بود.

مهرداد — mehrdad.ir`,html:l("rtl",["سلام دوباره!","دو روز پیش ایمیلت را گرفتم. یک <b>نمونهٔ واقعی</b> برای اینکه ببینی این مسیر سر تا ته چطور انجام می‌شود:","کلیکا — دِک سرمایه‌گذاری یک ابراپ فین‌تک برای ایران + صفحهٔ پروژه با داستان کامل محصول.","اگر ترجیح می‌دهی مستقیم سراغ ایدهٔ خودت برویم: صفحهٔ اسپرینت MVP را باز کن یا همین ایمیل را جواب بده.","اگر فعلاً وقتش نیست — اشکالی ندارد؛ این آخرین ایمیل من بود."],"اسپرینت MVP را ببین",`${f}/mvp-sprint`)});return t&&await i.f.lead.update({where:{id:e.id},data:{nurtureStep:2}}).catch(()=>{}),t}async function m(e=Date.now()){await n();let t={checked:0,welcomed:0,followed:0,failed:0};if(!(c&&u))return t;for(let a of(await i.f.lead.findMany({orderBy:{createdAt:"asc"}}))){t.checked++;let r=a.nurtureStep??0;!(r>=2)&&(e-new Date(a.createdAt).getTime()>=1728e5?await d(a)?t.followed++:t.failed++:0===r&&(await p(a)?t.welcomed++:t.failed++))}return t}e.s(["R",0,n,"N",0,m,"D",0,p]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=src_lib_lead-nurture_ts_1-oh_3vh63933._.js.map