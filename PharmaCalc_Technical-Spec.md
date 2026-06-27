# PharmaCalc — Technical Specification

> Living spec for the **React/Vite** PharmaCalc app. Written for a future
> developer or AI agent picking up enhancements. Reflects the codebase as of
> 2026-06-26 (git `0335de4`). Keep this file in sync when behaviour changes.

---

## 1. Overview

PharmaCalc is a mobile-first, single-page pharmacy calculator aimed at UK
community-pharmacy workflows (BMI, prescription dates, fertility estimates,
clinical calculations, patient counselling, and dosing tools).

- **The shippable app is the React/Vite app**, not the static
  `PharmaCalc_design-prototype.html` (that is a design prototype only). Apply all
  feature/UX work to the React app unless explicitly told otherwise.
- **Live site:** https://pharmacal4u.netlify.app
- **Repo:** https://github.com/alicekyyu/PharmaCalc (branch `main`)
- **CD:** every push to `main` triggers a Netlify build + deploy. No manual
  `dist` uploads.

---

## 2. Tech stack & project layout

| Item | Value |
|------|-------|
| Framework | React 19 |
| Build tool | Vite 6 |
| Language | JSX (no TypeScript) |
| Styling | Hand-written CSS, dark theme, CSS variables |
| State | React hooks + Context (no external state lib) |
| Persistence | `localStorage` |
| Hosting | Netlify (Git-based continuous deployment) |

```
PharmaCalc/
├── index.html                 # Vite entry; <link rel=manifest> only (no SW registration)
├── netlify.toml               # build + SPA redirect + /assets 404 guard
├── public/
│   └── sw.js                  # self-destructing service worker (see §10)
├── src/
│   ├── main.jsx               # React root; unregisters any old service worker
│   ├── App.jsx                # ENTIRE component tree lives here (single file)
│   └── styles.css             # all styles
├── PharmaCalc_Technical-Spec.md   # this file
├── PharmaCalc_UX-UI-Design-Doc.md # original design doc
└── PharmaCalc Requirement Doc.md  # original requirements
```

> **Convention:** the whole component tree is intentionally kept in
> `src/App.jsx`. New tools/components are added there. Styles go in
> `src/styles.css`.

Dev server: `npm run dev` (Vite, host 127.0.0.1, port 5173). Build: `npm run
build`. The `.claude/launch.json` config name is `pharmacalc`.

> **Windows note:** do **not** add `@rollup/rollup-win32-x64-msvc` to
> `package.json` — a Windows-only Rollup binary breaks Netlify's Linux build.
> Rollup pulls the correct platform binary via its own optionalDependencies.

---

## 3. Top-level architecture

`App` wraps the tree in two context providers, then renders `AppShell`:

```
<HistoryProvider>          // calculation history (localStorage: pharmacalc-history)
  <SharedProvider>         // shared patient inputs (localStorage: pharmacalc-patient)
    <AppShell />
  </SharedProvider>
</HistoryProvider>
```

`AppShell` renders: header (logo + history button), the tab bar, the
`SharedBar`, and the active tab's component inside `<main class="content">`.

### Contexts

| Context | Purpose |
|---------|---------|
| `HistoryContext` | calculation history store (`records`, `addOrUpdate`, `remove`, `clear`) |
| `CategoryContext` | names the current tool so each result knows its history category |
| `SharedContext` | shared patient inputs (`patient`, `setField`, `clearAll`) |

### Tabs and sub-tabs

Top tabs: **BMI · Dates · Fertility · Clinical · Patient · Dosing**

| Tab | Sub-tabs |
|-----|----------|
| BMI | _(none)_ |
| Dates | Rx Validity · Mixed FP10 · Emergency Supply · Age · Duration |
| Fertility | Trying to Conceive · Cycle Tracker |
| Clinical | CrCl · BSA · Paediatric · Converter |
| Patient | Due Date · Alcohol · Smoking |
| Dosing | Dose Timing · Days' Supply · Med Sync |

Each tab/sub-tool is **conditionally rendered**, so switching unmounts the old
one and mounts the new fresh (inputs reset on switch by default). On switch the
page scrolls to top.

---

## 4. Navigation & gestures

- **Tab bar:** `flex: 1 1 0` so all 6 tabs fit on one row without horizontal
  scrolling.
- **Swipe:** `useSwipe(onLeft, onRight)` on `<main>`. A mostly-horizontal swipe
  (|dx| ≥ 64px and |dx| > 1.8·|dy|) moves to the next/previous tab; clamps at
  ends. Swipes that **start** on `input, select, textarea, .calendar-strip,
  .dp-pop, .time-selects, .quick-add` are ignored so those elements keep their
  own behaviour.
- **Scroll-to-top:** `useEffect` on `activeTab`, and `SubTabs` onChange.

---

## 5. Custom date & time pickers

> **Hard rule:** never use native `<input type="date">` or `<input
> type="time">`. On the user's iPhone they render device-locale text (e.g.
> `年/月/日`, `上午/下午`). Native inputs follow the OS region, not the page
> `lang`, and can't be reliably forced to English.

### DateField + CalendarPopover
- Button shows `DD/MM/YYYY, Ddd` (weekday). Opens a Monday-first calendar.
- **Header has month + year dropdowns** (year range: current+10 down to
  current−120, newest first) for fast jumps — essential for DOB entry. The
  ‹ › arrows still step months.
- Dates are stored as ISO `yyyy-mm-dd` strings; rendered via `fmtDate`/`fmtShort`
  (always DD/MM/YYYY, never locale digits).
- Closes on outside click. Optional "Today" button.

### TimeField
- Single field showing `HH:MM` (24h). One tap opens a popover with **hour and
  minute columns** (English digits). Minutes in **15-minute steps**
  (00/15/30/45). Hour column auto-scrolls to the current value. Closes on Done
  or outside click.
- `MINUTES`/`HOURS` constants drive the options. To change granularity, edit
  `MINUTES` (e.g. `i * 5` for 5-min steps).

> Selects and other small inputs use **font-size ≥ 16px** to prevent iOS
> auto-zoom-on-focus.

---

## 6. Shared patient inputs  ⭐ (cross-section autofill)

Lets the same patient measurement be entered once and reused everywhere, with
accurate unit conversion and an "original units" cross-check.

### Store
`SharedProvider` holds a single `patient` object, persisted to `localStorage`
key **`pharmacalc-patient`**:

```js
patient = {
  weightKg: number | null,     // canonical
  weightUnit: 'kg' | 'lb' | 'stlb' | undefined,   // unit it was last entered in
  heightCm: number | null,     // canonical
  heightUnit: 'cm' | 'ftin' | 'in' | undefined,
  age: string,                 // years
  sex: 'M' | 'F' | undefined,
  nonce: number                // bumped on Clear; used as remount key
}
```

API: `setField(partial)` merges; `clearAll()` resets to `{ nonce: prev+1 }`.

### Conversion helpers (module-level)
- Constants: `KG_PER_LB = 0.453592`, `CM_PER_IN = 2.54`.
- `r1(v)` → round to 1 dp (number); `r1s(v)` → same as string.
- `fmtWeight(kg, unit)` / `fmtHeight(cm, unit)` → human string in that unit
  (used for the bar chips and the "entered as …" hints).
- `weightFields(kg, mode)` / `heightFields(cm, mode)` → the per-mode field
  strings used to initialise a tool's local inputs from canonical.

> **Accuracy:** canonical kg/cm are stored at full float precision; only the
> *display* is rounded to 1 dp. Round-tripping a unit (e.g. enter 120 lb →
> show kg → switch back) returns the original to display precision.

### Which fields each tool shares

| Tool | Shares |
|------|--------|
| BMI | weight (kg/lb/st·lb), height (cm/ft·in/in) |
| CrCl | age, sex, weight (kg) |
| BSA | height (cm), weight (kg) |
| Paediatric | weight (kg) |

### Per-tool integration pattern
1. `const { patient, setField } = useShared();`
2. **Init local state on mount** from `patient` (converted to the tool's unit),
   e.g. `useState(patient.weightKg != null ? r1s(patient.weightKg) : "")`.
   BMI initialises its unit mode from `patient.weightUnit || "kg"` (and
   `heightUnit || "ftin"`), so it reopens in the unit last entered.
3. **Write on user edit only** (never in an effect — that would overwrite the
   origin unit on mount). Each `onChange` wrapper calls `setField({ weightKg,
   weightUnit })` etc.
4. **Original-units hint:** when a tool's field unit differs from
   `patient.weightUnit`/`heightUnit`, render a `.shared-hint` line
   ("≡ entered as 120 lb").
5. **Per-tool Clear** also clears the shared fields it owns (so clearing
   actually sticks rather than re-filling from the store on next mount).

### SharedBar (the "top" UI + global Clear)
- Sticky bar under the tab bar. Shows chips for any set values
  (`Wt 120 lb`, `Ht 5ft 9in`, `Age 72`, `Female`). Hidden when nothing set.
- **"Clear inputs"** button → `clearAll()`.

### Clear = remount via nonce
`clearAll` only changes `nonce`. In `AppShell`, BMI and Clinical are rendered
with `key={`bmi-${nonce}`}` / `key={`clin-${nonce}`}`, so a clear remounts them
and their local fields re-init from the now-empty store.

> **Known side-effect:** remounting Clinical resets its sub-tab to **CrCl**.
> Acceptable; document if changing.

> **Why no live cross-component sync:** only one tab is mounted at a time, so a
> tool just needs to (a) read shared on mount and (b) write on edit. There is no
> need for reactive syncing between two mounted tools.

---

## 7. Calculation history  ⭐ (auto-record)

### Store
`HistoryProvider`, persisted to `localStorage` key **`pharmacalc-history`**
(capped at `HISTORY_MAX = 200`). Each record:

```js
{ id, category, title, value, sub, input, formula, summary, ts }
```

### Auto-capture
- `useAutoRecord(entry)` debounces **1100 ms** then writes. Pass `null` to skip.
- It is called inside `ResultBlock` (so every result-bearing tool logs
  automatically) using the `CategoryContext` value as `category`. Tools that
  don't use `ResultBlock` (e.g. **Med Sync**) call `useAutoRecord` directly.
- **De-dup:** each `ResultBlock`/tool instance owns one record `id`; editing
  updates that record in place (keeps original `ts`) instead of adding rows.
  A fresh visit (remount) creates a new record.
- Capture is **automatic** (user-chosen). Debounce keeps typing from spamming;
  quick swipe-throughs (< 1.1 s) don't log. Date-default tools (Rx Validity,
  Age, Due Date) can log on dwell since they show a result immediately.

### Panel
- Opened from the **clock button** (top-right, with a count badge).
- Full-screen overlay, newest first. Each row: category chip, `DD/MM/YYYY HH:MM`
  time, optional **Input:** line, the result summary, optional sub, optional
  **formula** line. Per-row delete + **Clear all**.

### Not logged
The **Alcohol** running tally (it's a live cumulative counter) is intentionally
excluded.

---

## 8. ResultBlock contract

`ResultBlock` is the shared result card and the main history hook point. Props:

| Prop | Meaning |
|------|---------|
| `category` | overrides `CategoryContext` for history filing |
| `badge`, `tone` | status pill + colour (`info`/`valid`/`warn`/`error`) |
| `label`, `value`, `sub` | headline result |
| `input` | concise input echo → stored in history & shown as "Input:" |
| `formula` | calculation with the user's numbers → shown in a mono box & history |
| `links`, `copyText`, `children` | sources, copy button text, custom body |

**Formulas** are shown with the actual values substituted (e.g.
`BMI = 54.4 kg / (1.75 m)² = 17.7`) for cross-checking. Tools with formulas:
BMI, CrCl, BSA, Paediatric, Smoking pack-years, EDD, Days' Supply, unit
converter, Fertility ovulation, Duration add/subtract. Rule-based tools (Rx
Validity, Emergency Supply, Dose Timing) put their method in result text and
capture an `input` string.

---

## 9. Tool reference (calculations)

| Tool | Inputs | Output / formula |
|------|--------|------------------|
| **BMI** | height (cm/ft·in/in), weight (kg/lb/st·lb), NICE-ethnic toggle | `wKg / hM²`; switching units **converts** (doesn't clear) |
| **Rx Validity** | appropriate date, schedule (6-month vs CD 28-day), dispensing date | expiry = date + 6 months or 28 days |
| **Mixed FP10** | per-item schedule (Standard/Sched-5 vs CD 2/3/4) | per-item expiry |
| **Emergency Supply** | 3 legal criteria + medicine type | max supply / cannot supply |
| **Age** | DOB | y/m/d + total weeks/days |
| **Duration** | two date-times, or base ± N units | length, or shifted date |
| **Fertility** | LMP, cycle length (**default 28**) | fertile window; ovulation = LMP + cycle − 14; strip auto-scrolls to window start |
| **CrCl** | age, sex, weight (kg), SCr | Cockcroft-Gault; CKD stage |
| **BSA** | height (cm), weight (kg) | Mosteller `√(cm·kg/3600)` |
| **Paediatric** | weight, mg/kg, doses/day, max single | single & daily dose, max-dose flag |
| **Converter** | mg↔mcg, %w/v↔mg/mL, mg/mL↔mmol/L, Vit D IU↔mcg, Vit E IU↔mg | substituted formula |
| **Due Date** | LMP | EDD = LMP + 280 days |
| **Alcohol** | quick-add drinks or volume×ABV | session + weekly units vs 14-unit limit |
| **Smoking** | cigs/day, years | pack-years `(cigs/20)·years` |
| **Dose Timing** | wake/bed, doses/day, empty-stomach + meals | evenly-spaced suggested times |
| **Days' Supply** | dose×freq/day or /week, qty or weeks | days it lasts / quantity to order |
| **Med Sync** | rows of {med, use/day, stock} | aligns run-out dates; logs to history |

---

## 10. Deployment & service worker

### Continuous deployment
`netlify.toml`: `npm run build` → publish `dist`, Node 20. Includes:
- **`/assets/*` → 404** rule (before the SPA fallback) so a stale `index.html`
  requesting a deleted hashed bundle gets a clean 404 instead of being served
  `index.html` (which caused a blank screen / MIME error).
- SPA fallback `/* → /index.html` (200).

### Service worker (important history)
An earlier scaffold shipped a **cache-first** `public/sw.js` that pinned a stale
`index.html` and broke every deploy (blank screen, unfixable by refresh). It was
replaced by a **self-destructing** worker that clears all caches, unregisters
itself, and reloads clients. `src/main.jsx` no longer registers a worker and
proactively unregisters any leftover one.

> **Do not reintroduce a cache-first service worker.** If offline/PWA support is
> ever wanted, use a tested setup (e.g. `vite-plugin-pwa`) with network-first
> navigation and versioned caches.

---

## 11. localStorage keys

| Key | Owner | Contents |
|-----|-------|----------|
| `pharmacalc-history` | HistoryProvider | array of result records (≤ 200) |
| `pharmacalc-patient` | SharedProvider | shared weight/height/age/sex + nonce |

---

## 12. Conventions & gotchas (read before editing)

- **Single-file tree:** add components in `src/App.jsx`.
- **No native date/time inputs** (§5).
- **Dates:** DD/MM/YYYY; ISO strings internally. **Times:** 24h HH:MM.
- **Inputs ≥ 16px font** to avoid iOS zoom.
- **Units:** UK-first defaults (BMI height ft/in, weight kg with lb & st/lb
  options). Conversions must stay accurate — keep canonical at full precision,
  round only for display.
- **Shared inputs:** write to the store **on user edit only**, never in a
  mount effect, or you'll clobber the origin unit.
- **History:** keep `useAutoRecord` debounced; don't log on every keystroke.
- **Clear/nonce:** remounting Clinical resets its sub-tab to CrCl.
- **Commit/deploy:** commit + push to `main`; Netlify deploys automatically.

---

## 13. Suggested future enhancements

- Share inputs into more tools (e.g. carry age into Smoking/Fertility where
  relevant); consider sharing SCr or DOB.
- Log the Alcohol weekly total to history if desired.
- Add a substituted formula line to the vitamin converters.
- Optional finer time granularity (5-min) per field.
- Export/share history (CSV / link).
- Proper PWA/offline via `vite-plugin-pwa` (only if explicitly requested).
