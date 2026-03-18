
Role: Principal Product Designer + Design System Architect

Mission:
Design a premium, production-ready SaaS interface for a fitness management platform.
Focus on two pages:
1. Members List (/members)
2. Member Profile (/members/:id)

The design must feel like a top-tier SaaS product (Linear, Stripe, Notion level).
Avoid generic dashboard patterns at all costs.

---

GLOBAL UX PRINCIPLES:

- Clarity first: information must be readable in <2 seconds
- Density balance: not too compact, not too sparse
- Every component must have a clear purpose
- Optimize for daily usage by staff (speed > aesthetics)
- Consistency across all components (design system mindset)

---

VISUAL LANGUAGE:

- Minimalist, elegant, structured
- Strong hierarchy using spacing, not borders
- Use contrast and typography instead of heavy UI decoration
- Subtle depth (soft shadows, layered cards)

---

DESIGN TOKENS:

Spacing Scale:
4 / 8 / 12 / 16 / 24 / 32 / 48

Radius:
- Small: 8px
- Medium: 12px
- Large: 16px
- Pill: 999px

Colors:
- Background: #F5F6FA
- Surface: #FFFFFF
- Primary: #4880FF
- Success: #00B69B
- Warning: #FF9066
- Danger: #FF4747
- Text Primary: #111827
- Text Secondary: #6B7280
- Border subtle: rgba(0,0,0,0.06)

Shadows:
- Soft: 0px 4px 20px rgba(0,0,0,0.06)
- Hover: slightly elevated

Typography:
- Font: Inter
- H1: Bold, large
- H2: Semi-bold
- Body: Regular/Medium
- Labels: Small, uppercase

---

PAGE 1 — MEMBERS LIST:

Structure:
- Sticky header (title + count + CTA)
- Filter/search bar
- Data table (core element)
- Pagination footer

Table Requirements:
- Highly readable rows
- Avatar + name as primary focus
- Status badges with color + dot
- Relative dates ("2 days ago")
- Engagement indicator (visual)

Interactions:
- Row hover highlight
- Click row → open profile
- CMD/CTRL click → new tab
- Smooth loading transitions

Premium Feature:
- Slide-in "Quick Preview Panel"
  - Width: ~420px
  - Frosted glass (backdrop blur)
  - Contains summary + quick actions

States:
- Loading (skeleton rows, realistic)
- Empty (illustration + reset CTA)
- Error (inline retry)

---

PAGE 2 — MEMBER PROFILE:

Layout:
- Sticky header
- Two-column layout:
  - Left: detailed info (70%)
  - Right: actions & insights (30%)

Sections (LEFT):
- Personal Info Card
- Subscription Card
- Activity Card (with mini graph)
- Visit History Table

Sections (RIGHT):
- Quick Actions Card (sticky)
- Alerts Card (important signals)
- Notes Card (internal usage)
- Stats Summary Card

Key UX:
- Inline editing (no separate edit page)
- Visual alerts (inactive, expired plan)
- Clear hierarchy between sections

---

COMPONENT RULES:

- All components must be reusable
- Use consistent spacing and alignment
- Avoid visual noise
- Use subtle hover + transitions

---

DATA:

Use realistic European data (French/Belgian context).
NO lorem ipsum.

---

STATES TO GENERATE:

- Default
- Hover
- Loading
- Empty
- Error

---

ANTI-PATTERNS:

- No clutter
- No heavy borders everywhere
- No generic UI kits look
- No overuse of colors
- No cramped layouts

---

OUTPUT:

A cohesive, high-end SaaS interface with strong usability, refined visuals, and consistent design system logic.
```

---

# 💣 2. MINI DESIGN SYSTEM (SPÉCIAL PAGE 3 & 4)

👉 Ça c’est ce qui va faire la différence en dev.

---

## 🎨 2.1 Design Tokens (à intégrer direct)

### Colors

```text
Primary: #4880FF
Success: #00B69B
Warning: #FF9066
Danger: #FF4747

Background: #F5F6FA
Surface: #FFFFFF

Text Primary: #111827
Text Secondary: #6B7280
```

---

## 📏 2.2 Spacing system

```text
4px  → micro spacing
8px  → tight
12px → compact
16px → standard
24px → section spacing
32px → large sections
```

---

## 🔲 2.3 Core Components

---

### 🧩 1. Table Row

Variants:

* default
* hover
* selected
* loading

Structure:

```text
[Avatar] Name
Email (secondary)
Status badge
Plan
Club
Last visit
Visits
Actions
```

---

### 🧩 2. Status Badge

Variants:

* Active (green)
* Suspended (orange)
* Anonymized (grey)

Style:

* pill
* soft background
* small dot

---

### 🧩 3. Card

Variants:

* default
* hover
* loading

Style:

* padding: 16–24px
* radius: 16px
* shadow: soft

---

### 🧩 4. Button

Types:

* Primary
* Secondary
* Ghost
* Danger

States:

* default
* hover
* disabled

---

### 🧩 5. Input / Search

* left icon
* clear button (X)
* focus state (blue ring)

---

### 🧩 6. Quick Preview Panel

* slide-in right
* backdrop blur
* layered above table

---

## ⚡ 2.4 Interaction System

* Hover → subtle background change
* Click → instant feedback
* Loading → skeleton (no spinner full page)
* Transitions → 150–250ms

---

## 🧠 2.5 Data States

Tu DOIS avoir :

* Loading (skeleton)
* Empty
* Error
* With data

---

## 🧱 2.6 Layout Grid

```text
Max width: 1280–1440px
Grid: 12 columns
Gutters: 24px
```

---

## 🔥 2.7 Naming convention (Figma & Angular)

```text
Component/TableRow
Component/StatusBadge
Component/Card
Component/Button
Component/Input

Section/MembersTable
Section/FiltersBar
Section/ProfileHeader
Section/ActivityCard
