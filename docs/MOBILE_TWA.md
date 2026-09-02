# MOBILE_TWA — Android app (Trusted Web Activity)

Status: everything prepared · **Blocked on: owner's signing keystore** ·
Last updated: 2026-09-01 · Decision: D-015

This is the definitive runbook for producing and publishing the Android
app. The PWA half (already live) is described in
[MOBILE_APP.md](../MOBILE_APP.md); this document covers the TWA half.

## 0. What a TWA gives you (and what it needs)

A Trusted Web Activity wraps the live website in a real Android app:
fullscreen (no URL bar), installed from Google Play, splash screen, app
shortcuts, notifications capable — while **all content and updates keep
coming from the website itself** (no Play review for content changes).

| Already in the repo | File |
|---|---|
| Bubblewrap config (package `ir.mehrdad.twa`, shortcuts, notifications) | `twa-manifest.json` |
| Site↔app verification file (needs your fingerprint) | `public/.well-known/assetlinks.json` |
| One-command assetlinks generator | `scripts/generate-assetlinks.ts` |
| PWA manifest + icons + service worker (TWA requirement) | `public/manifest.json`, `public/icons/*`, `public/sw.js` |

**Security rules (non-negotiable):**
- `android.keystore` / `*.jks` are **gitignored — never commit them**.
- The keystore password lives only in your password manager. Losing the
  keystore means you can never update the app under the same package id.
- Only the certificate's **SHA-256 fingerprint** is shared/public (it is
  not a secret).

## 1. Prerequisites (one-time, on your machine)

- JDK 17 (`brew install openjdk@17` / `apt install openjdk-17-jdk`)
- Node.js ≥ 18, then: `npm install -g @bubblewrap/cli`
- Android SDK — Bubblewrap offers to install it on first run

## 2. Create your signing keystore (the only step that stays with you)

Option A — let Bubblewrap generate it:

```bash
cd path/to/project   # folder where you will keep android.keystore
bubblewrap keygen    # sets a keystore password + alias "android"
```

Option B — your own key (same result, your tooling):

```bash
keytool -genkeypair -v -keystore android.keystore -alias android \
  -keyalg RSA -keysize 2048 -validity 10000
```

Keep `android.keystore` **outside any git repo** or trust the gitignore —
prefer a folder you back up securely.

## 3. Build the app

```bash
bubblewrap init --manifest=https://mehrdad.ir/manifest.json
#   answer: use twa-manifest.json values from the repo when asked
#   (packageId ir.mehrdad.twa, key path ./android.keystore, alias android)
bubblewrap build
#   → app-release-signed.apk   (direct install / testing)
#   → app-release-bundle.aab   (Google Play upload)
```

Both artifacts are gitignored (`*.apk`, `*.aab`).

## 4. Publish the Digital Asset Links (one command + deploy)

Extract your certificate fingerprint and generate the file:

```bash
keytool -list -v -keystore ./android.keystore -alias android | grep "SHA256:"
bun scripts/generate-assetlinks.ts "AA:BB:…:99"        # paste the fingerprint
git add public/.well-known/assetlinks.json && git commit -m "chore(twa): publish app fingerprint" && git push
```

After deploying, verify:

```bash
curl -s https://mehrdad.ir/.well-known/assetlinks.json | python3 -m json.tool
```

> **Play App Signing:** after your first Play upload, Play re-signs the
> app with its own key. Copy the **App signing key fingerprint** from
> Play Console → Setup → App signing and run the generator with **both**
> fingerprints:
> `bun scripts/generate-assetlinks.ts "<upload-key-fp>" "<play-signing-fp>"`

## 5. Verify app ↔ site linking

On a device with the APK installed:

```bash
adb shell pm verify-app-links --re-verify ir.mehrdad.twa
adb shell dumpsys package domain-preferred-apps | grep -A2 mehrdad
```

Or simply: install → tap a mehrdad.ir link → it must open **fullscreen
with no URL bar**. If you still see a URL bar, the assetlinks response
and your fingerprint do not match — re-check step 4 (exact JSON, HTTPS,
no redirect on `/.well-known/assetlinks.json`).

## 6. Google Play release checklist

- [ ] Play Console account (one-time $25)
- [ ] Upload `app-release-bundle.aab` (internal testing track first)
- [ ] Store listing: name "Mehrdad", the existing app icons, screenshots
- [ ] Privacy policy URL: `https://mehrdad.ir/#about`
- [ ] After approval: add Play signing fingerprint to assetlinks (§4)
- [ ] Tag the repo: `git tag twa-v1.0.0 && git push --tags`

## 7. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| URL bar still visible | assetlinks fingerprint mismatch, or file not deployed — re-run §4 checks |
| Wrong splash/background color | `twa-manifest.json` `backgroundColor`/`themeColor` vs `manifest.json` — keep both `#7c3aed` family |
| App updated but content stale | content is served by the site — the SW caches aggressively offline-first; bump cache version in `public/sw.js` when needed |
| Version upgrade rejected by Play | bump `appVersionName`/`appVersionCode` in `twa-manifest.json` before rebuilding |

## 8. Current state / what remains

- ✅ Config, icons, manifest, assetlinks plumbing, generator script, docs
- ⛔ Signed build — **needs the owner's keystore** (§2) — by design the
  signing key never lives in the repo or with any agent
- ⛔ Play listing — owner account required (§6)
