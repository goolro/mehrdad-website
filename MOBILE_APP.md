# 📱 Mobile App — Mehrdad.ir (PWA + TWA)

The new mehrdad.ir site is a full **PWA (Progressive Web App)**, which gives us **two ways** to ship a mobile app — with **one single codebase** (no React Native needed).

---

## 1. Installable PWA (already live ✅)

The site already ships:

| Feature | Status |
|---|---|
| `manifest.json` (name, icons, theme color #7c3aed, standalone display) | ✅ |
| Service worker (`/sw.js`) — offline shell, API cache, image cache | ✅ |
| AI-generated app icon (192 / 512 / 180 / maskable) | ✅ |
| In-browser "Install app" prompt (`beforeinstallprompt`) | ✅ |
| App shortcuts (Blog, AI Chat, Contact) — long-press the icon | ✅ |
| iOS `apple-touch-icon` + standalone meta | ✅ |

**Users can install it right now:**
- **Android/Chrome/Edge**: the "Install Mehrdad app" pill appears automatically → tap Install.
- **iOS/Safari**: Share → Add to Home Screen.

---

## 2. TWA (Trusted Web Activity) — Android APK/AAB ✅ prepared, awaiting owner keystore

A TWA wraps the PWA in a real Android app **published on Google Play**, running fullscreen **without browser UI**. All updates deploy through the website (no Play Store review for content).

**→ The full build & publish runbook now lives in [docs/MOBILE_TWA.md](docs/MOBILE_TWA.md)** (keystore ownership rules, bubblewrap build, fingerprint extraction, the `scripts/generate-assetlinks.ts` generator, Play checklist, troubleshooting).

Short version:

1. `bubblewrap keygen` — create **your** signing keystore (never committed; `*.keystore` is gitignored)
2. `bubblewrap init --manifest=https://mehrdad.ir/manifest.json` + `bubblewrap build` → APK + AAB
3. `keytool -list -v … | grep SHA256:` → `bun scripts/generate-assetlinks.ts "<fingerprint>"`
4. commit + deploy → `https://mehrdad.ir/.well-known/assetlinks.json` verifies the app
5. Play Console upload (internal track first), then add the Play signing fingerprint alongside yours

---

## 3. Mobile app capabilities (what users get)

### Already working (PWA + TWA)
| Capability | How |
|---|---|
| 📴 **Offline reading** — blog articles & pages stay readable offline | Service worker API cache |
| ⚡ **Instant load** — cached shell + images open in <1s | SW cache-first strategy |
| 🏠 **Home screen icon**, splash screen, branded status bar | manifest + theme color |
| 📌 **App shortcuts** — Blog / AI Chat / Contact via long-press | manifest.shortcuts |
| 🤖 **AI Assistant** — full RAG chatbot on Mehrdad's content | /api/chat |
| 🔔 **Push notification capability** | enabled in twa-manifest (`enableNotifications: true`); needs a push backend when you want to send campaigns |
| 📷 Camera / file upload, geolocation | enabled via TWA delegations |
| 🌓 Dark/light theme, EN/FA + full RTL | site features |
| ✍️ **Commenting** on articles (with moderation) | new Comment system |
| 🔗 **One codebase** — site + app update together | TWA = live website |

### Admin panel (web) — works from phone too
- AI Writer (EN+FA article + AI cover image generation)
- Comment moderation (approve / unapprove / delete)
- Contact messages inbox
- Knowledge-base rebuild, per-post translation

### Optional next steps
- **Web Push**: add VAPID keys + a push API to send "new article" notifications to installed users (works in PWA and TWA).
- **iOS App Store**: use PWABuilder.com (iOS wrapper) or Capacitor to publish an iOS app from the same PWA.
- **Native features**: if you ever need native-only features, an Expo/React Native app can reuse all existing `/api/*` endpoints unchanged.

---

## Files added in this update

```
public/manifest.json           ← PWA manifest
public/sw.js                   ← service worker (offline + caching)
public/icons/icon-*.png        ← AI-generated app icons
public/.well-known/assetlinks.json  ← TWA site↔app verification (fill fingerprint)
twa-manifest.json              ← Bubblewrap config (package: ir.mehrdad.twa)
src/components/site/PwaClient.tsx   ← SW registration + install prompt
```
