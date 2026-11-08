module.exports=[16790,e=>e.a(async(t,a)=>{try{var n=e.i(54799),s=e.i(43793),i=t([s]);[s]=i.then?(await i)():i;let I=null;function d(){return I||(I=(async()=>{await s.f.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "AgencySession" (
          "id" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "kind" TEXT NOT NULL DEFAULT 'agent',
          "meta" TEXT,
          "createdAt" TEXT NOT NULL,
          "updatedAt" TEXT NOT NULL,
          CONSTRAINT "AgencySession_pkey" PRIMARY KEY ("id")
        )
      `),await s.f.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "AgencySession_updatedAt_idx" ON "AgencySession"("updatedAt")').catch(()=>{}),await s.f.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "AgencyMessage" (
          "id" TEXT NOT NULL,
          "sessionId" TEXT NOT NULL,
          "agentId" TEXT,
          "agentName" TEXT,
          "role" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "createdAt" TEXT NOT NULL,
          CONSTRAINT "AgencyMessage_pkey" PRIMARY KEY ("id")
        )
      `),await s.f.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "AgencyMessage_session_createdAt_idx" ON "AgencyMessage"("sessionId", "createdAt")').catch(()=>{})})().catch(e=>{throw I=null,e})),I}let R=()=>new Date().toISOString();async function c(e){await d();let t={id:(0,n.randomUUID)(),title:e.title,kind:e.kind,meta:void 0===e.meta?null:JSON.stringify(e.meta),createdAt:R(),updatedAt:R()};return await s.f.$executeRawUnsafe('INSERT INTO "AgencySession" ("id","title","kind","meta","createdAt","updatedAt") VALUES (?,?,?,?,?,?)',t.id,t.title,t.kind,t.meta,t.createdAt,t.updatedAt),t}async function E(e){await d();let t=(await s.f.$queryRawUnsafe('SELECT "id","title","kind","meta","createdAt","updatedAt" FROM "AgencySession" WHERE "id" = ? LIMIT 1',e))[0];return t?{...t,kind:t.kind}:null}async function T(e){await d(),await s.f.$executeRawUnsafe('UPDATE "AgencySession" SET "updatedAt" = ? WHERE "id" = ?',R(),e).catch(()=>{})}async function A(e,t){await d(),await s.f.$executeRawUnsafe('UPDATE "AgencySession" SET "title" = ?, "updatedAt" = ? WHERE "id" = ?',t,R(),e)}async function o(e){await d(),await s.f.$executeRawUnsafe('DELETE FROM "AgencyMessage" WHERE "sessionId" = ?',e),await s.f.$executeRawUnsafe('DELETE FROM "AgencySession" WHERE "id" = ?',e)}async function r(e=100){return await d(),(await s.f.$queryRawUnsafe(`SELECT s."id", s."title", s."kind", s."meta", s."createdAt", s."updatedAt",
            (SELECT COUNT(*) FROM "AgencyMessage" m WHERE m."sessionId" = s."id") AS "messageCount",
            (SELECT MAX(m."createdAt") FROM "AgencyMessage" m WHERE m."sessionId" = s."id") AS "lastActivity",
            (SELECT m."content" FROM "AgencyMessage" m WHERE m."sessionId" = s."id" ORDER BY m."createdAt" DESC LIMIT 1) AS "preview"
       FROM "AgencySession" s
       ORDER BY s."updatedAt" DESC
       LIMIT ?`,e)).map(e=>({id:e.id,title:e.title,kind:e.kind,meta:e.meta,createdAt:e.createdAt,updatedAt:e.updatedAt,messageCount:Number(e.messageCount??0),lastActivity:e.lastActivity??e.updatedAt,preview:(e.preview??"").slice(0,140)}))}async function u(e,t=300){return await d(),(await s.f.$queryRawUnsafe(`SELECT "id","sessionId","agentId","agentName","role","content","createdAt"
       FROM "AgencyMessage" WHERE "sessionId" = ?
       ORDER BY "createdAt" DESC LIMIT ?`,e,t)).reverse()}async function g(e){await d();let t={id:(0,n.randomUUID)(),sessionId:e.sessionId,agentId:e.agentId??null,agentName:e.agentName??null,role:e.role,content:e.content,createdAt:R()};return await s.f.$executeRawUnsafe('INSERT INTO "AgencyMessage" ("id","sessionId","agentId","agentName","role","content","createdAt") VALUES (?,?,?,?,?,?,?)',t.id,t.sessionId,t.agentId,t.agentName,t.role,t.content,t.createdAt),await T(e.sessionId),t}e.s(["F",0,g,"G",0,c,"S",0,o,"_",0,E,"e",0,u,"C",0,r,"U",0,A]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=src_lib_agency_store_ts_02n0yr7j_-vb7._.js.map