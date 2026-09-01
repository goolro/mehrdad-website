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

## 2. TWA (Trusted Web Activity) — Android APK/AAB ✅ ready to build

A TWA wraps the PWA in a real Android app **published on Google Play**, running fullscreen **without browser UI**. All updates deploy through the website (no Play Store review for content).

### Prerequisites
- Java JDK 17 + Android SDK (or use Android Studio)
- Node.js ≥ 18
- The site must be live on **https://mehrdad.ir**

### Build steps (5 minutes)

```bash
# 1. Install Bubblewrap CLI (Google's official TWA builder)
npm install -g @bubblewrap/cli

# 2. In the project root (where twa-manifest.json lives)
bubblewrap init --manifest=https://mehrdad.ir/manifest.json
#    → it can also import our twa-manifest.json directly

# 3. Generate the signing key (keep android.keystore SAFE — never commit it)
bubblewrap keygen

# 4. Build release APK + Play Store AAB
bubblewrap build
#    → app-release-signed.apk  +  app-release-bundle.aab
```

### 5. Publish the Digital Asset Links (required — one time)

Get your signing key's SHA-256 fingerprint:

```bash
keytool -list -v -keystore ./android.keystore -alias android
```

Put the fingerprint into **`public/.well-known/assetlinks.json`** (replace
`REPLACE_WITH_YOUR_APP_SIGNING_CERT_SHA256_FINGERPRINT`) and make sure
`https://mehrdad.ir/.well-known/assetlinks.json` is reachable.
Then the app opens fullscreen with **no URL bar** and gets verified
as the official app of the site.

> Play Store uses "Play App Signing" — after first upload, copy the
> **App signing key fingerprint** from Play Console → Setup → App signing
> into assetlinks.json as well (keep both fingerprints in the array).

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
