# THEME ENGINE — one shared design system, five themes

Status: shipped 2026-09-01 · Decision: D-014 · Code: `src/lib/themes.ts`,
`src/app/globals.css` ("Site Theme System" section),
`src/components/site/ThemeBackground.tsx`

## What it is

The whole site is styled through **one shared design-token layer**. Every
theme is only a *palette + an animated background* — never a layout or
component change — so all five themes are guaranteed to stay consistent
with the design system by construction.

```
Theme Engine (shared design tokens: Tailwind color CSS variables)
├── Default  ☼  brand violet / fuchsia     · aurora background
├── Autumn   🍂 orange / rose              · falling leaves
├── Winter   ❄️  icy sky / cyan             · snowfall
├── Digital  ⚡ neon cyan / lime           · falling glyphs + grid
└── Nowruz   🌱 emerald / gold             · spring petals

Light / Dark  — separate, independent, persisted user preference
```

## How the tokens work

1. Components use ordinary Tailwind utilities (`violet-*`, `fuchsia-*`).
2. Tailwind 4 compiles those to `var(--color-violet-*)` /
   `var(--color-fuchsia-*)`.
3. A theme block in `globals.css` redefines exactly those variables under
   `:root[data-theme="<id>"]`.
4. The active theme id is set on `<html data-theme>` from the app store
   (`src/app/page.tsx`), which is seeded from the DB
   (`SiteSetting("theme")` via `/api/site`) and changeable live from the
   admin panel (`/#admin` → Theme tab → `PATCH /api/admin/settings`).

Result: the entire site re-colors instantly — including article body
links, blockquotes and table headers, which read the same tokens through
`var()`/`color-mix()` (no per-theme prose overrides exist).

## The five themes

| id | Palette (primary → secondary) | Background effect | Notes |
|---|---|---|---|
| `default` | violet → fuchsia (brand) | `aurora` — drifting blobs + faint grid | The brand identity; also the PWA `themeColor` |
| `autumn` | orange → rose | `leaves` — falling, swaying leaves | Carried over unchanged from v1 |
| `winter` | sky → ice-cyan | `snow` — drifting snowflakes + soft dots | New |
| `digital` | cyan → lime | `matrix` — falling ۰/۱ glyphs over the grid | New; replaces the retired "Midnight Neon" niche |
| `nowruz` | emerald → gold | `petals` — drifting spring flowers | New; haft-sin palette |

## Light / Dark (independent)

- `mode: 'light' | 'dark'` lives in the zustand store
  (`src/components/site/store.ts`) and **is persisted** in
  `localStorage` (`mehrdad-app`, together with `lang`).
- `page.tsx` toggles the `dark` class on `<html>`; the `.dark` token
  block in `globals.css` provides the dark surfaces (shadcn/ui standard).
- The header has an accessible toggle (`aria-pressed`, localized label)
  with Sun/Moon icons.
- Because every theme only remaps *accent* variables, all five themes
  work in both modes.

## Changing / adding a theme (config-only recipe)

1. Add a palette block in `globals.css`: `:root[data-theme="<id>"]`
   redefining `--color-violet-*` (primary scale) and `--color-fuchsia-*`
   (accent scale).
2. (Optional) add an effect: a `ThemeEffect` union member in
   `src/lib/themes.ts`, one CSS class + keyframes, one case in
   `ThemeBackground.tsx`'s particle factory.
3. Append an entry to `THEMES` (id, names, emoji, effect, swatch).

No component changes are ever required — that is the contract.

## Legacy id mapping (v1 → v2)

Stored values written by the pre-engine site are resolved through
`LEGACY_THEME_MAP` at read time **and** were migrated once in the DB
(`analysis/migrate_theme_setting.ts`, marker
`SiteSetting("theme_engine_v2_migrated")` — idempotent):

| old id | → new id | why |
|---|---|---|
| `digital` (violet) | `default` | the old default *is* the brand palette |
| `ocean` | `winter` | teal/cyan ≈ ice |
| `forest` | `nowruz` | emerald ≈ spring |
| `sunset` | `autumn` | warm hues |
| `midnight` | `digital` | dark neon niche |

`getTheme()` also resolves the map, so stale clients can never render
unstyled. The admin settings API validates against the new `THEMES` only.

## Accessibility

- Background layer is `aria-hidden`, `pointer-events: none`, `z-index: 0`
  behind content.
- All animations are disabled under `prefers-reduced-motion: reduce`.
- Mode toggle exposes `aria-pressed` and localized `aria-label`/`title`.

## Known limitations

- ~~**First-paint flash**~~ **FIXED:** an inline synchronous boot script
  in `layout.tsx` now applies the persisted `.dark` class, `fa→rtl`
  direction and the last-known theme cache before first paint (verified
  across reloads).
- Themes change the whole site globally (admin decides); a per-visitor
  theme picker is deliberately out of scope (personal site, one brand at
  a time).
