# PharmaCalc — UX / UI Design Document
## Design Specification & Prototype Brief

**Version:** v1.0
**Date:** June 2026
**Audience:** UI Designer (Claude Design), Front-end Developer, UX Reviewer
**Companion doc:** PharmaCalc PRD v0.2

---

## 1. Design Brief

### 1.1 Product in one sentence
A dark-background, tab-based web app used at the pharmacy counter — glance at it, get the answer, move on.

### 1.2 User & context
- **Primary user:** UK community pharmacist / pharmacy technician
- **Device at point of use:** Landscape phone or portrait tablet on the dispensing bench; also desktop browser
- **Cognitive load at point of use:** HIGH — user is mid-task, may be speaking to a patient simultaneously
- **Session length:** Under 60 seconds per visit, multiple times per shift
- **Secondary user:** Patient self-service (Tab 5 only — must be legible without explanation)

### 1.3 Design mandate (from brief)
- Dark background
- Clean layout, no unnecessary wording
- English, UK date (DD/MM/YYYY) and number format (commas as thousands separator)
- Small logo "PharmaCalc" as page name only — no hero, no marketing text
- Responsive web app
- Instant access to every key function and sub-function

### 1.4 Design philosophy
> **Every pixel earns its place. If it isn't helping the pharmacist get to an answer in under 15 seconds, it doesn't exist.**

Three constraints drive every decision:
1. **Speed** — inputs visible, results immediate, no modals blocking the path
2. **Trust** — result states (valid / expired / warning) must be unambiguous at a glance; colour is never the only signal
3. **Restraint** — no decoration, no gradient hero, no animation beyond micro-feedback

---

## 2. Design Token System

### 2.1 Colour Palette

| Token name | Hex | Role |
|---|---|---|
| `--bg-base` | `#0E1117` | Page background — near-black, not pure black (reduces eye strain under fluorescent lighting) |
| `--bg-surface` | `#161B25` | Card / panel background |
| `--bg-elevated` | `#1E2535` | Input fields, active tab, hover states |
| `--border` | `#2A3347` | Dividers, input borders, tab separators |
| `--text-primary` | `#E8EDF5` | Body text, labels, values |
| `--text-secondary` | `#8A97AE` | Sub-labels, hints, unit labels |
| `--text-tertiary` | `#52617A` | Placeholders, disabled, source links |
| `--accent-cyan` | `#00C2CC` | Active tab indicator, interactive focus ring, copy button, primary action |
| `--status-valid` | `#22C55E` | ✓ Valid / in-date result |
| `--status-warn` | `#F59E0B` | ⚠ Expiring within 7 days |
| `--status-expired` | `#EF4444` | ✗ Expired / cannot supply |
| `--status-info` | `#6BA3F5` | Informational callout |

**Design rationale:** `--accent-cyan` (#00C2CC) is drawn from the cyan on NHS clinical equipment displays — it signals "clinical tool" without feeling like a consumer health app. It is not the default acid-green of generic dark-mode templates.

### 2.2 Typography

| Role | Typeface | Weight | Size (desktop / mobile) | Notes |
|---|---|---|---|---|
| **Logo wordmark** | `JetBrains Mono` | 500 | 13px / 12px | Monospace signals "precision tool"; used only for the wordmark |
| **Tab labels** | `Inter` | 500 | 13px / 12px | Short, legible, condensed |
| **Section heading** | `Inter` | 600 | 15px / 14px | All-caps, tracked +0.08em |
| **Input label** | `Inter` | 400 | 13px / 12px | `--text-secondary` colour |
| **Input value** | `Inter` | 400 | 16px / 15px | High contrast; `--text-primary` |
| **Result value** | `Inter` | 700 | 28px / 24px | The number the pharmacist needs to read across the bench |
| **Result label** | `Inter` | 400 | 12px / 11px | `--text-secondary`; above the value |
| **Body / hint** | `Inter` | 400 | 12px / 11px | `--text-secondary` |
| **Source link** | `Inter` | 400 | 11px / 10px | `--text-tertiary`; underline on hover |
| **Data / monospace** | `JetBrains Mono` | 400 | 12px / 11px | Dates, calculated values inline, CD schedule code |

**Type scale:** 10 / 11 / 12 / 13 / 15 / 16 / 24 / 28px. No decorative display face — this is a tool, not a brand publication.

### 2.3 Spacing System (8px base grid)

| Token | Value | Use |
|---|---|---|
| `--space-1` | 4px | Icon padding, tight gaps |
| `--space-2` | 8px | Between label and input |
| `--space-3` | 12px | Between input fields |
| `--space-4` | 16px | Card internal padding |
| `--space-5` | 24px | Between cards / sections |
| `--space-6` | 32px | Tab content top padding |

### 2.4 Border Radius

| Context | Value |
|---|---|
| Cards / panels | `6px` |
| Input fields | `4px` |
| Pills / badges | `3px` |
| Buttons | `4px` |
| Status banners | `4px` |

### 2.5 Elevation / Shadow
No drop shadows — unnecessary on a dark background. Layering is communicated through the three background tones (`--bg-base` → `--bg-surface` → `--bg-elevated`).

---

## 3. Signature Element
**The result block.**
Every calculator surfaces a single large number (or date) in `--accent-cyan` or a status colour, at 28px bold, immediately below the inputs — no scroll required. This is the one deliberate visual moment. Everything else is quiet around it.

The result block contains:
```
[STATUS BADGE]
[LABEL in --text-secondary 12px]
[VALUE in 28px bold, colour = status]
[Days remaining / days overdue in 13px --text-secondary]
[Source link ↗ in 11px --text-tertiary]
[Copy icon]
```

This pattern is consistent across all five tabs.

---

## 4. Layout Architecture

### 4.1 Page Shell

```
┌─────────────────────────────────────────────────────┐
│  PharmaCalc                          [England ▾] [?] │  ← Header: 44px tall
├───────┬───────┬───────┬───────┬─────────────────────┤
│  BMI  │ Dates │Fertility│Clinical│   Patient Tools    │  ← Tab bar: 48px tall (mobile: scroll)
├─────────────────────────────────────────────────────┤
│                                                     │
│              TAB CONTENT AREA                       │  ← Scrollable
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Header (44px):**
- Left: `PharmaCalc` in JetBrains Mono 13px `--text-secondary` — small, understated
- Right: Region selector (`[England ▾]`) + Help icon (`?`)
- No full-width coloured header bar — header sits on `--bg-base` with a single 1px `--border` bottom line

**Tab bar (48px):**
- Five tabs, full-width distribution on mobile; fixed-width on desktop (128px each)
- Active tab: `--accent-cyan` 2px underline + `--text-primary` label
- Inactive: `--text-secondary` label, no underline
- On mobile screens < 480px: tab bar scrolls horizontally; active tab always visible

**Content area:**
- Max-width: 860px, centred
- Mobile: 16px horizontal padding
- Desktop: 32px horizontal padding
- No full-width section backgrounds — content "floats" on `--bg-base`

### 4.2 Card Pattern

Every sub-section of a tab is a card:
```
┌─ Card ──────────────────────────────────────────────┐
│  SECTION LABEL           [sub-tab pills if needed]  │
│  ─────────────────────────────────────────────────  │
│  [Input row]                                        │
│  [Input row]                                        │
│                                                     │
│  ┌─ Result block ──────────────────────────────┐    │
│  │  ● VALID                                    │    │
│  │  Expires                                    │    │
│  │  30 Sep 2026          ↗ NHS source  [Copy]  │    │
│  │  183 days remaining                         │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  [ Clear ]                                          │
└─────────────────────────────────────────────────────┘
```

### 4.3 Input Row Pattern

```
┌───────────────────────────────────────────────────┐
│  Height                              [cm] [ft / in]│
│  ┌──────────────────────────────────┐              │
│  │  175                        cm   │              │
│  └──────────────────────────────────┘              │
└───────────────────────────────────────────────────┘
```

- Label: 12px `--text-secondary`, above field
- Unit toggle: pill buttons right-aligned in the label row (`[cm]` / `[ft / in]`)
- Field: `--bg-elevated` background, `--border` border, `--text-primary` value
- Placeholder: `--text-tertiary`
- Focus ring: 2px solid `--accent-cyan`, offset 2px
- No `<form>` submit — calculation fires on every `onChange`

---

## 5. Tab-by-Tab Screen Specifications

---

### Tab 1 — BMI

**Tab label:** `BMI`
**Icon:** None (label only — consistent across all tabs)

#### Layout

```
┌─ BMI Calculator ────────────────────────────────────┐
│                                                     │
│  Height                             [cm] [ft / in]  │
│  ┌─────────────────────────────────────────────┐    │
│  │                                        cm   │    │
│  └─────────────────────────────────────────────┘    │
│  (ft / in expanded: two fields — Feet | Inches)     │
│                                                     │
│  Weight                           [kg] [st / lb]    │
│  ┌─────────────────────────────────────────────┐    │
│  │                                        kg   │    │
│  └─────────────────────────────────────────────┘    │
│  (st / lb expanded: two fields — Stone | Pounds)    │
│                                                     │
│  ┌─ Result ──────────────────────────────────────┐  │
│  │  BMI                                          │  │
│  │  24.9           Healthy weight      [Copy]    │  │
│  │  ─────────────────────────────────────────── │  │
│  │  NHS range: 18.5 – 24.9                       │  │
│  │  ↗ NICE NG246                                 │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ☐ Use ethnic minority thresholds (NICE NG246)      │
│    South Asian · Chinese · Black African/Caribbean  │
│    · Middle Eastern                                 │
│    Overweight ≥ 23 · Obese ≥ 27.5                  │
│                                                     │
│  ⚠  BMI is not suitable for: pregnant women ·      │
│     high muscle mass · under 18s (use centile chart)│
│                                                     │
│  [ Clear ]                                          │
└─────────────────────────────────────────────────────┘
```

**BMI result colour coding:**

| Range | Status colour | Badge text |
|---|---|---|
| < 18.5 | `--status-warn` | UNDERWEIGHT |
| 18.5–24.9 | `--status-valid` | HEALTHY WEIGHT |
| 25.0–29.9 | `--status-warn` | OVERWEIGHT |
| 30.0–34.9 | `--status-expired` | OBESE CLASS I |
| 35.0–39.9 | `--status-expired` | OBESE CLASS II |
| ≥ 40.0 | `--status-expired` | OBESE CLASS III |

When ethnic thresholds toggle is ON:
- Ranges shift as per NICE NG246
- A small badge `NICE ethnic thresholds active` appears inside the result block in `--status-info` colour

---

### Tab 2 — Dates

**Tab label:** `Dates`

Three sub-tabs rendered as pill buttons inside the card:

```
[ Rx Validity ]  [ Mixed FP10 ]  [ Emergency Supply ]
```

---

#### Sub-tab 2A — Rx Validity

```
┌─ Prescription Validity ─────────────────────────────┐
│  [ Rx Validity ]  [ Mixed FP10 ]  [ Emergency ]     │
│                                                     │
│  Appropriate date (date on prescription)            │
│  ┌──────────────────────────────────────────────┐   │
│  │  DD / MM / YYYY                     [Today]  │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  Drug schedule                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ ○ Standard POM / Schedule 5 CD   (6 months)   │ │
│  │ ○ Schedule 2 CD                  (28 days)    │ │
│  │ ○ Schedule 3 CD                  (28 days)    │ │
│  │ ○ Schedule 4 CD                  (28 days)    │ │
│  └────────────────────────────────────────────────┘ │
│                                                     │
│  Dispensing date (today or planned date)            │
│  ┌──────────────────────────────────────────────┐   │
│  │  DD / MM / YYYY                     [Today]  │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  ┌─ Result ──────────────────────────────────────┐  │
│  │  ● VALID                                      │  │
│  │  Expires                                      │  │
│  │  30 Sep 2026                      [Copy]      │  │
│  │  183 days remaining                           │  │
│  │  ↗ NHSBSA FAQ · NHS.uk · CPE (Apr 2026)       │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  [ Clear ]                                          │
└─────────────────────────────────────────────────────┘
```

**Result states:**

| Condition | Badge colour | Badge text | Value colour |
|---|---|---|---|
| > 7 days remaining | `--status-valid` | ✓ VALID | `--status-valid` |
| 1–7 days remaining | `--status-warn` | ⚠ EXPIRING SOON | `--status-warn` |
| Expired | `--status-expired` | ✗ EXPIRED | `--status-expired` |

For CD items: an additional line in the result block reads:
`CD Sched. 2/3/4 — 28-day rule applies · ↗ CPE Apr 2026`

Month-end rounding note (shown only when triggered):
`Note: Expiry adjusted to last day of month (30 Sep, not 31 Sep)`

---

#### Sub-tab 2B — Mixed FP10

```
┌─ Mixed FP10 — Item-by-item checker ────────────────┐
│  [ Rx Validity ]  [ Mixed FP10 ]  [ Emergency ]    │
│                                                     │
│  Appropriate date                                   │
│  ┌──────────────────────────────────────────────┐  │
│  │  DD / MM / YYYY                     [Today]  │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  Items on this prescription                         │
│  ┌─────────────────────────────────────────────┐   │
│  │  Item 1   [Standard POM  ▾]   Expires 30 Sep 2026  ✓  │
│  │  Item 2   [Sched. 2 CD   ▾]   Expires 30 Jul 2026  ✗  │
│  │  Item 3   [Sched. 3 CD   ▾]   Expires 30 Jul 2026  ✗  │
│  │                                             [+ Add item] │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ⚠  Each item has its own expiry. CD items          │
│     (Sched. 2/3/4) expire after 28 days;            │
│     non-CD items after 6 months.                    │
│  ↗ NHSBSA FAQ KA-01561                              │
│                                                     │
│  [ Clear all ]                                      │
└─────────────────────────────────────────────────────┘
```

Each item row: dropdown (schedule selector) + auto-calculated expiry date + status badge. Max 8 items. Items can be removed with a small `×` on the right.

---

#### Sub-tab 2C — Emergency Supply

```
┌─ Emergency Supply Checker ──────────────────────────┐
│  [ Rx Validity ]  [ Mixed FP10 ]  [ Emergency ]    │
│                                                     │
│  Legal criteria — all must be met                   │
│  ┌─────────────────────────────────────────────┐   │
│  │  ☐  Previously prescribed this medicine     │   │
│  │  ☐  Immediate need — health at risk         │   │
│  │  ☐  Unable to obtain a prescription now     │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Medicine type                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ ○ Standard POM (incl. Sched. 5 CD)          │   │
│  │ ○ Schedule 4 CD                             │   │
│  │ ○ Schedule 1 / 2 / 3 CD                     │   │
│  │ ○ Inhaler / cream / ointment                │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─ Result ──────────────────────────────────────┐  │
│  │  ● MAY SUPPLY                                 │  │
│  │  Maximum supply                               │  │
│  │  30 days                          [Copy]      │  │
│  │  ↗ CPE Emergency Supply Spec · NHS.uk         │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ⚠  Final decision rests with the pharmacist.       │
│     Consult RPS MEP / GPhC standards.               │
│  ↗ GPhC Standards  ↗ RPS MEP                        │
│                                                     │
│  [ Clear ]                                          │
└─────────────────────────────────────────────────────┘
```

**Result states for Emergency Supply:**

| Medicine type | Criteria met | Result badge | Max supply |
|---|---|---|---|
| Standard POM | All ✓ | ● MAY SUPPLY | 30 days |
| Sched. 4/5 CD | All ✓ | ● MAY SUPPLY | 5 days |
| Inhaler / cream | All ✓ | ● MAY SUPPLY | Smallest pack |
| Sched. 1/2/3 CD | Any | ✗ CANNOT SUPPLY | — |
| Any type | Not all ✓ | ✗ CRITERIA NOT MET | — |

If Sched. 1/2/3 CD is selected, result immediately shows `✗ CANNOT SUPPLY` in full-width `--status-expired` block, regardless of checklist. Below it, in smaller text: `Exception: phenobarbitone / phenobarbital for epilepsy — use pharmacist discretion.`

---

### Tab 3 — Fertility

**Tab label:** `Fertility`

Two sub-tabs: `[ Trying to Conceive ]` `[ Cycle Tracker ]`

---

#### Sub-tab 3A — Trying to Conceive

```
┌─ Fertility Window ──────────────────────────────────┐
│  [ Trying to Conceive ]  [ Cycle Tracker ]          │
│                                                     │
│  First day of last period (LMP)                     │
│  ┌──────────────────────────────────────────────┐   │
│  │  DD / MM / YYYY                              │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  Average cycle length                               │
│  ┌──────────────────────────────────────────────┐   │
│  │  28                                    days  │   │
│  └──────────────────────────────────────────────┘   │
│  (Slider 21–35 days alongside the field)            │
│                                                     │
│  ┌─ Result ──────────────────────────────────────┐  │
│  │  FERTILE WINDOW                               │  │
│  │  Tue 08 Jul — Sun 13 Jul 2026     [Copy]      │  │
│  │  Estimated ovulation: Mon 14 Jul 2026         │  │
│  │  Next period: Mon 28 Jul 2026                 │  │
│  │  ─────────────────────────────────────────── │  │
│  │  ↗ FSRH Fertility Awareness · ↗ NHS           │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ℹ  Estimates only. Individual cycles vary.          │
│     Consider ovulation strips or BBT tracking.      │
│                                                     │
│  Folic acid reminder                                │
│  400 µg/day — start before conception,              │
│  continue to 12 weeks                               │
│  ↗ NHS Vitamins in pregnancy                        │
│                                                     │
│  [ Clear ]                                          │
└─────────────────────────────────────────────────────┘
```

The fertile window is displayed as a coloured horizontal bar (5-day window + ovulation day) on a minimal 4-week calendar strip — this is the signature visual moment for Tab 3. Days outside the fertile window are in `--bg-elevated`; the window days are in `--accent-cyan` at 15% opacity with a solid `--accent-cyan` border on the ovulation day.

---

#### Sub-tab 3B — Cycle Tracker

Identical inputs to 3A. Output shows same calendar strip. A prominent banner (not dismissible) reads:

```
┌─ Safety Notice ───────────────────────────────────────┐
│  ⚠  Fertility awareness alone is not a reliable       │
│     contraceptive method. Typical-use failure rate    │
│     is significantly higher than other methods.       │
│     For contraception advice, consult a pharmacist    │
│     or clinician.  ↗ FSRH Guidance                   │
└───────────────────────────────────────────────────────┘
```

No dates are labelled as "safe days" or "safe period" — the calendar shows the fertile window only.

---

### Tab 4 — Clinical

**Tab label:** `Clinical`

Four sub-tabs: `[ CrCl ]` `[ BSA ]` `[ Paediatric ]` `[ Unit Converter ]`

---

#### Sub-tab 4A — CrCl (Cockcroft-Gault)

```
┌─ Creatinine Clearance — Cockcroft-Gault ────────────┐
│  [ CrCl ]  [ BSA ]  [ Paediatric ]  [ Converter ]   │
│                                                     │
│  ⚠  For renal drug dosing (DOACs, gentamicin etc.)  │
│     Use CrCl — not eGFR. See SPS / BNF.             │
│                                                     │
│  Age           Sex           Weight to use           │
│  ┌──────┐    [Male][Female]  [Actual][Ideal][Adj.]   │
│  │      │                                           │
│  └──────┘  years                                    │
│                                                     │
│  Weight                            Height (for IBW) │
│  ┌──────────────────────┐  ┌─────────────────────┐  │
│  │                  kg  │  │                  cm  │  │
│  └──────────────────────┘  └─────────────────────┘  │
│                                                     │
│  Serum creatinine                                   │
│  ┌──────────────────────────────────────────────┐   │
│  │                                    µmol/L    │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  ┌─ Result ──────────────────────────────────────┐  │
│  │  CrCl (Cockcroft-Gault)                       │  │
│  │  42.3 mL/min                      [Copy]      │  │
│  │  CKD Stage 3b  (30–44 mL/min)                 │  │
│  │  ─────────────────────────────────────────── │  │
│  │  ↗ NHS SPS — Kidney function                  │  │
│  │  ↗ NHS SPS — DOAC monitoring                  │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ⚠  CrCl is an estimate. Check BNF for drug-specific│
│     dose adjustments. This tool does not give doses. │
│  ↗ BNF online                                       │
│                                                     │
│  [ Clear ]                                          │
└─────────────────────────────────────────────────────┘
```

**CKD staging colour (result label only, not the value):**

| CrCl (mL/min) | CKD Stage | Label colour |
|---|---|---|
| ≥ 90 | G1 | `--status-valid` |
| 60–89 | G2 | `--status-valid` |
| 45–59 | G3a | `--status-warn` |
| 30–44 | G3b | `--status-warn` |
| 15–29 | G4 | `--status-expired` |
| < 15 | G5 | `--status-expired` |

---

#### Sub-tab 4B — BSA (Mosteller)

```
┌─ Body Surface Area — Mosteller ─────────────────────┐
│  [ CrCl ]  [ BSA ]  [ Paediatric ]  [ Converter ]   │
│                                                     │
│  Height                   Weight                    │
│  ┌─────────────────┐   ┌────────────────────────┐   │
│  │             cm  │   │                    kg  │   │
│  └─────────────────┘   └────────────────────────┘   │
│                                                     │
│  ┌─ Result ──────────────────────────────────────┐  │
│  │  BSA (Mosteller)                              │  │
│  │  1.73 m²                          [Copy]      │  │
│  │  Formula: √(H × W / 3600)                     │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  [ Clear ]                                          │
└─────────────────────────────────────────────────────┘
```

---

#### Sub-tab 4C — Paediatric mg/kg

```
┌─ Paediatric Dose Calculator ────────────────────────┐
│  [ CrCl ]  [ BSA ]  [ Paediatric ]  [ Converter ]   │
│                                                     │
│  Weight                   Dose per kg               │
│  ┌──────────────────┐   ┌──────────────────────┐    │
│  │              kg  │   │           mg/kg/dose  │    │
│  └──────────────────┘   └──────────────────────┘    │
│                                                     │
│  Doses per day         Max single dose (optional)   │
│  ┌──────────────────┐   ┌──────────────────────┐    │
│  │                  │   │                  mg  │    │
│  └──────────────────┘   └──────────────────────┘    │
│                                                     │
│  Max daily dose (optional)                          │
│  ┌──────────────────────────────────────────────┐   │
│  │                                          mg  │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  ┌─ Result ──────────────────────────────────────┐  │
│  │  Single dose          Daily total             │  │
│  │  125 mg               500 mg      [Copy]      │  │
│  └───────────────────────────────────────────────┘  │
│  (If exceeds max: red banner "⚠ Exceeds maximum     │
│   single dose of X mg — check BNFc")               │
│                                                     │
│  ⚠  Verify dose, indication and age limits in BNFc. │
│  ↗ BNF for Children online                          │
│                                                     │
│  [ Clear ]                                          │
└─────────────────────────────────────────────────────┘
```

---

#### Sub-tab 4D — Unit Converter

```
┌─ Unit Converter ────────────────────────────────────┐
│  [ CrCl ]  [ BSA ]  [ Paediatric ]  [ Converter ]   │
│                                                     │
│  Conversion type                                    │
│  ┌─────────────────────────────────────────────┐   │
│  │ ○ mg ↔ µg                                   │   │
│  │ ○ % w/v ↔ mg/mL                             │   │
│  │ ○ mg/mL ↔ mmol/L (enter mol. weight)        │   │
│  │ ○ IV drip rate: mL/hr ↔ drops/min           │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  [Contextual input fields change by selection]      │
│                                                     │
│  ┌─ Result ──────────────────────────────────────┐  │
│  │  =  250 µg                        [Copy]      │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  [ Clear ]                                          │
└─────────────────────────────────────────────────────┘
```

---

### Tab 5 — Patient

**Tab label:** `Patient`

Three sub-tabs: `[ Due Date ]` `[ Alcohol ]` `[ Smoking ]`

---

#### Sub-tab 5A — Due Date

```
┌─ Due Date Calculator ───────────────────────────────┐
│  [ Due Date ]  [ Alcohol ]  [ Smoking ]             │
│                                                     │
│  First day of last period (LMP)                     │
│  ┌──────────────────────────────────────────────┐   │
│  │  DD / MM / YYYY                              │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  ┌─ Result ──────────────────────────────────────┐  │
│  │  Estimated due date                           │  │
│  │  Thu 26 Mar 2027                  [Copy]      │  │
│  │  Currently: 6 weeks + 2 days                 │  │
│  │  ─────────────────────────────────────────── │  │
│  │  ↗ NHS Due Date Calculator                   │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ℹ  Scan date overrides LMP-based estimate.         │
│     400 µg folic acid daily until 12 weeks.         │
│  ↗ NHS Vitamins in pregnancy                        │
│                                                     │
│  [ Clear ]                                          │
└─────────────────────────────────────────────────────┘
```

---

#### Sub-tab 5B — Alcohol Units

```
┌─ Alcohol Units ─────────────────────────────────────┐
│  [ Due Date ]  [ Alcohol ]  [ Smoking ]             │
│                                                     │
│  Quick add                                          │
│  [Pint 4%] [175ml wine] [250ml wine] [25ml spirit] [35ml spirit] │
│                                                     │
│  Or enter manually                                  │
│  Volume (mL)         ABV (%)                        │
│  ┌─────────────────┐  ┌─────────────────────────┐   │
│  │                 │  │                       % │   │
│  └─────────────────┘  └─────────────────────────┘   │
│  [ + Add drink ]                                    │
│                                                     │
│  ┌─ Running total ───────────────────────────────┐  │
│  │  This session                Weekly total     │  │
│  │  3.2 units             3.2 units   [Copy]     │  │
│  │  ───────────────────────────────────────────  │  │
│  │  UK limit: 14 units/week                      │  │
│  │  ████████░░░░░░░░░░░░░  3.2 / 14 units        │  │
│  │  ↗ NHS — Alcohol units · ↗ UK CMO Guidelines  │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ℹ  Spread over 3+ days. Avoid saving units         │
│     for one or two sessions.                        │
│                                                     │
│  [ Clear session ]  [ Clear weekly total ]          │
└─────────────────────────────────────────────────────┘
```

Progress bar: segments fill with `--accent-cyan` up to 10 units, then `--status-warn` 10–14, then `--status-expired` above 14.

---

#### Sub-tab 5C — Smoking (Pack-years)

```
┌─ Smoking History ───────────────────────────────────┐
│  [ Due Date ]  [ Alcohol ]  [ Smoking ]             │
│                                                     │
│  Cigarettes per day     Years smoked                │
│  ┌─────────────────┐    ┌────────────────────────┐  │
│  │                 │    │                  years  │  │
│  └─────────────────┘    └────────────────────────┘  │
│                                                     │
│  ┌─ Result ──────────────────────────────────────┐  │
│  │  Pack-years                                   │  │
│  │  17.5                             [Copy]      │  │
│  │  Formula: (cigs/day ÷ 20) × years             │  │
│  │  ↗ NICE NG209 — Tobacco dependence            │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ℹ  For use in smoking cessation consultations.     │
│  ↗ NHS Stop Smoking services                        │
│                                                     │
│  [ Clear ]                                          │
└─────────────────────────────────────────────────────┘
```

---

## 6. Component Library

### 6.1 Status Badge

```
 ● VALID         — background: --status-valid at 15% opacity
                   border: 1px --status-valid
                   text: --status-valid

 ⚠ EXPIRING SOON — background: --status-warn at 15% opacity
                   border: 1px --status-warn
                   text: --status-warn

 ✗ EXPIRED       — background: --status-expired at 15% opacity
                   border: 1px --status-expired
                   text: --status-expired

 ● MAY SUPPLY    — same as VALID
 ✗ CANNOT SUPPLY — same as EXPIRED
```

Always: 3px border-radius, 5px 10px padding, 11px Inter 500, all-caps.
The coloured dot (●/⚠/✗) is not the only signal — the text label always carries the meaning.

### 6.2 Result Block

```css
/* Token definition */
.result-block {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 16px;
  margin-top: 16px;
}
.result-value {
  font-size: 28px;       /* desktop */
  font-size: 24px;       /* mobile */
  font-weight: 700;
  font-family: 'Inter';
  line-height: 1.1;
  /* colour set by JS based on status */
}
.result-label {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}
.result-source {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-top: 8px;
  border-top: 1px solid var(--border);
  padding-top: 8px;
}
.result-source a {
  color: var(--text-tertiary);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.result-source a:hover {
  color: var(--text-secondary);
}
```

### 6.3 Copy Button

- Icon: clipboard outline, 14px, `--text-tertiary`
- On hover: `--text-secondary`
- On click: icon changes to checkmark for 1.5s, then resets
- No toast — the in-place feedback is sufficient in a noisy pharmacy environment
- Copies plain text (date + value + label, no HTML)

### 6.4 Unit Toggle Pills

```
[cm]  [ft / in]
```

- Both pills visible at all times; selected has `--bg-elevated` background + `--accent-cyan` 1px border + `--text-primary`
- Unselected: `--bg-surface` + `--border` + `--text-secondary`
- Switching unit instantly recalculates if value present

### 6.5 Clear Button

- Text only: `Clear`
- 12px Inter 400, `--text-tertiary`
- On hover: `--text-secondary`
- Resets all fields in current sub-tab only
- Never deletes data from other sub-tabs

### 6.6 Today Shortcut

Date inputs have a `[Today]` button that fills the field with today's date in DD/MM/YYYY. Styled as a small pill inside the field on the right edge.

### 6.7 Disclaimer Footer (inline, per tab)

Not a modal, not a page-level banner. Appears at the bottom of each calculator card, always visible:

```
ℹ  Decision-support tool only. Verify results with BNF / NICE / FSRH.
   Not a substitute for professional judgement. ↗ Source
```

11px Inter 400, `--text-tertiary`. The `ℹ` icon is `--status-info` colour.

---

## 7. Interaction & Motion Spec

### 7.1 Calculation trigger
- All calculations fire on `input` / `onChange` — zero submit buttons
- If a required field is empty: result block shows `—` placeholders, not an error state
- If input is out of valid range: inline validation appears below the field in `--status-warn` colour: `Must be between X and Y`

### 7.2 Micro-interactions (minimal by design)
- Tab switch: instant, no slide animation (reduces motion for accessibility)
- Result value update: 100ms cross-fade on the value text when recalculating (respects `prefers-reduced-motion`)
- Status badge: instant colour swap, no transition
- Copy button: 150ms icon swap; no toast, no sound

### 7.3 No modals
No confirmation dialogs. No full-screen overlays. The source links open in a new browser tab (`target="_blank" rel="noopener"`).

### 7.4 Keyboard navigation
- Tab order: header → tab bar → first input → unit toggle → subsequent inputs → result (read-only) → clear → next card
- Active tab: `Space` or `Enter` to select
- All interactive elements have visible focus ring: 2px solid `--accent-cyan`, 2px offset
- Unit toggles: arrow keys navigate between options

---

## 8. Responsive Breakpoints

| Breakpoint | Width | Layout changes |
|---|---|---|
| **Mobile S** | < 380px | Single column; font sizes drop 1 step; tab labels abbreviate (BMI / Dates / Fert / Clin / Patient) |
| **Mobile** | 380–639px | Single column; tab bar scrolls horizontally |
| **Tablet** | 640–1023px | Single column, wider cards; tab bar fixed, no scroll |
| **Desktop** | ≥ 1024px | Max-width 860px centred; optional two-column layout for tabs with many inputs (CrCl, Paediatric) |

### Mobile-specific rules
- All input fields: minimum 44px touch target height
- The result value (28px) reduces to 24px
- Sub-tab pills stack if > 3 options: wrap to 2 rows with consistent gap
- Fertile window calendar strip collapses to a text list on < 380px

---

## 9. Header & Navigation Detail

```
┌─────────────────────────────────────────────────────────┐
│  PharmaCalc          [England ▾]              [?]        │
└─────────────────────────────────────────────────────────┘
```

| Element | Spec |
|---|---|
| Logo `PharmaCalc` | JetBrains Mono 500, 13px, `--text-secondary`; left-aligned; no icon, no colour accent |
| Region selector | `[England ▾]` — 12px Inter, `--text-secondary`; dropdown: England / Scotland / Wales / Northern Ireland; changes Tab 2 emergency supply rules |
| Help icon `?` | 16px, `--text-tertiary`; opens a right-side drawer (not modal) with a one-paragraph plain-English description of each tab |
| Header height | 44px |
| Header background | `--bg-base` (same as page — no separate bar colour) |
| Header bottom border | 1px solid `--border` |

---

## 10. Date & Number Formatting Rules

These rules apply globally, with no exceptions:

| Data type | Format | Example |
|---|---|---|
| Date (input) | DD/MM/YYYY | `30/07/2026` |
| Date (displayed result) | `D Mon YYYY` | `30 Jul 2026` |
| Day + date (result) | `Ddd D Mon YYYY` | `Thu 30 Jul 2026` |
| Large numbers | Comma separator | `1,234` |
| Decimals | Point separator | `24.9` |
| BMI | 1 decimal place | `24.9` |
| CrCl | 1 decimal place | `42.3 mL/min` |
| BSA | 2 decimal places | `1.73 m²` |
| Doses | Whole mg unless < 1 mg | `125 mg` or `0.5 mg` |
| Units (alcohol) | 1 decimal place | `3.2 units` |
| Pack-years | 1 decimal place | `17.5` |
| Durations | `N days`, never `N day` for 0 or > 1 | `183 days remaining` |

---

## 11. Accessibility Requirements

| Requirement | Implementation |
|---|---|
| WCAG 2.2 AA | Minimum conformance level for all components |
| Colour contrast | All text: minimum 4.5:1 against background. `--status-expired` (#EF4444) on `--bg-surface` (#161B25) = 5.1:1 ✓ |
| Non-colour status signals | Every status badge uses text label + symbol (●/⚠/✗) — colour never sole signal |
| Focus indicator | 2px solid `--accent-cyan`, 2px offset — visible on all interactive elements |
| `prefers-reduced-motion` | Cross-fade on result value suppressed; only instant state changes |
| Font minimum | 11px minimum rendered size; no text smaller than 10px |
| Touch targets | Minimum 44×44px for all tappable elements (iOS / Android HIG compliant) |
| Screen reader | All inputs have `<label>` elements; status badges have `aria-live="polite"` on result block; source links have descriptive `aria-label` |
| Keyboard-only operation | Full operation without mouse; no mouse-only hover states that are required for function |

---

## 12. PWA / Offline Behaviour

| State | Behaviour |
|---|---|
| Online | Full function |
| Offline (after first load) | All 5 tabs fully functional — all calculations are client-side |
| Offline source links | Links remain visible but show a small `(link requires connection)` note next to them |
| Install prompt | Standard PWA install banner on first visit; once dismissed, accessible via browser's "Add to Home Screen" only |
| App icon | Dark background (`#0E1117`) with "Pc" in JetBrains Mono `--accent-cyan` — minimal, no medical cross symbol |

---

## 13. Handoff Checklist for Designer (Claude Design)

The following screens / states are required as deliverables:

**Desktop (1280px) frames:**
- [ ] Full page shell with Tab 1 (BMI) active
- [ ] Tab 2A (Rx Validity) — VALID state
- [ ] Tab 2A (Rx Validity) — EXPIRED state
- [ ] Tab 2A (Rx Validity) — EXPIRING SOON state
- [ ] Tab 2B (Mixed FP10) — 3 items, mixed states
- [ ] Tab 2C (Emergency Supply) — MAY SUPPLY state
- [ ] Tab 2C (Emergency Supply) — CANNOT SUPPLY state (Sched. 1/2/3 CD)
- [ ] Tab 3A (Trying to Conceive) — fertile window visible
- [ ] Tab 3B (Cycle Tracker) — safety notice visible
- [ ] Tab 4A (CrCl) — result with CKD staging
- [ ] Tab 4C (Paediatric) — dose exceeded warning
- [ ] Tab 5B (Alcohol) — progress bar at 80% of limit
- [ ] Header with region selector open

**Mobile (390px) frames:**
- [ ] Tab 1 (BMI) — ft/in toggle active
- [ ] Tab 2A (Rx Validity) — EXPIRED state
- [ ] Tab 2C (Emergency Supply) — CANNOT SUPPLY
- [ ] Tab 3A (Fertility) — calendar strip visible

**Component sheet:**
- [ ] All status badge variants
- [ ] Input field states: default / focus / filled / error
- [ ] Unit toggle: selected / unselected
- [ ] Copy button: default / copied
- [ ] Sub-tab pills: selected / unselected
- [ ] Today shortcut button
- [ ] Clear button
- [ ] Source link (default / hover)
- [ ] Disclaimer footer

---

## 14. Design Decisions Log

| Decision | Rationale |
|---|---|
| Dark background (#0E1117 not pure black) | Reduces halation under fluorescent pharmacy lighting; pure black creates harsh glare contrast |
| JetBrains Mono for logo only | Signals precision/clinical tool without making body text harder to scan at speed |
| `--accent-cyan` (#00C2CC) not acid-green | Draws from NHS equipment display cyan; avoids the default dark-mode template look; distinctive without being garish in a clinical setting |
| No animation on tab switch | Pharmacist switching tabs at speed doesn't want to wait for a slide transition |
| Status badge + text + symbol (never colour only) | Accessible; readable in poor lighting or by someone with colour vision deficiency |
| Sub-tabs as pills, not a second tab bar | Keeps visual hierarchy clear: main tabs = navigation; sub-tabs = view mode within same tool |
| Source links always visible (not in a collapse) | Compliance is the whole point — the source must always be in sight, not hidden behind "more info" |
| No modal dialogs | On a phone at a busy counter, a modal requires a deliberate dismiss; inline states are faster |
| Copy icon, not a toast notification | A toast requires visual attention away from the counter; the in-place icon flip is perceptible without being intrusive |
| Region selector in header, not per-tab | Region affects multiple tabs (mainly Tab 2); one global setting is cleaner than repeating it in each tab |
| Max-width 860px | Wide enough for two-column CrCl inputs on desktop; narrow enough to feel focused and not spreadsheet-like |

---

*PharmaCalc UX/UI Design Document v1.0 — June 2026*
*Companion: PharmaCalc PRD v0.2*
*For Claude Design prototype: use this document as the sole design authority. All colours, typefaces, sizes and copy are specified above. Do not introduce additional typefaces, colours, or decorative elements not listed in Section 2.*
