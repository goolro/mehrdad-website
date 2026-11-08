module.exports=[66680,(e,t,r)=>{t.exports=e.x("node:crypto",()=>require("node:crypto"))},22524,e=>e.a(async(t,r)=>{try{var a=e.i(43793),c=t([a]);[a]=c.then?(await c)():c;let u=null;async function n(e,t,r){try{await (!u&&(u=(async()=>{await a.f.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "RateBucket" (
           "key" TEXT PRIMARY KEY,
           "count" INTEGER NOT NULL,
           "resetAt" BIGINT NOT NULL
         )`)})().catch(e=>{throw u=null,e})),u);let c=Date.now(),n=(await a.f.$queryRaw`
      INSERT INTO "RateBucket" ("key", "count", "resetAt")
      VALUES (${e}, 1, ${c+r})
      ON CONFLICT("key") DO UPDATE SET
        "count" = CASE WHEN ${c} >= "RateBucket"."resetAt" THEN 1
                       ELSE "RateBucket"."count" + 1 END,
        "resetAt" = CASE WHEN ${c} >= "RateBucket"."resetAt" THEN ${c+r}
                         ELSE "RateBucket"."resetAt" END
      RETURNING "count" AS "count", "resetAt" AS "resetAt"`)[0];if(!n)return{ok:!0,retryAfter:0};let E=Number(n.resetAt);if(n.count>t)return{ok:!1,retryAfter:Math.max(1,Math.ceil((E-c)/1e3))};return{ok:!0,retryAfter:0}}catch(t){return console.error(`durableLimit(${e}) unavailable, failing OPEN:`,t instanceof Error?t.message:t),{ok:!0,retryAfter:0}}}e.s(["f",0,n]),r()}catch(e){r(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__0tmis7n8l02h4._.js.map