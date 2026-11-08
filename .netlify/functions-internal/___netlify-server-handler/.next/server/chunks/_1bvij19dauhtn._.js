module.exports=[85589,a=>{a.v(T=>Promise.all(["server/chunks/[externals]_os_01zxnmmu4p6bj._.js","server/chunks/[root-of-the-server]__1s2kp2tdh3fha._.js"].map(T=>a.l(T))).then(()=>T(41095)))},30378,a=>a.a(async(T,e)=>{try{var t=a.i(43793),c=T([t]);[t]=c.then?(await c)():c;let E=null;a.s(["f",0,function(){return E||(E=(async()=>{await t.f.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "SocialDraft" (
          "id" TEXT NOT NULL,
          "platform" TEXT NOT NULL,
          "lang" TEXT NOT NULL,
          "topic" TEXT,
          "sourceSlug" TEXT,
          "content" TEXT NOT NULL,
          "imageUrl" TEXT,
          "videoUrl" TEXT,
          "posted" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "SocialDraft_pkey" PRIMARY KEY ("id")
        )
      `),await t.f.$executeRawUnsafe('ALTER TABLE "SocialDraft" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT').catch(async()=>{await t.f.$executeRawUnsafe('ALTER TABLE "SocialDraft" ADD COLUMN "imageUrl" TEXT').catch(()=>{})}),await t.f.$executeRawUnsafe('ALTER TABLE "SocialDraft" ADD COLUMN IF NOT EXISTS "videoUrl" TEXT').catch(async()=>{await t.f.$executeRawUnsafe('ALTER TABLE "SocialDraft" ADD COLUMN "videoUrl" TEXT').catch(()=>{})})})().catch(a=>{throw E=null,a})),E}]),e()}catch(a){e(a)}},!1)];

//# sourceMappingURL=_1bvij19dauhtn._.js.map