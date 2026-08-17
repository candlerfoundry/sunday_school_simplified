# Webflow embeds — SSS public landing + logged-in customer portal

Source of truth for the **Webflow HTML Embed** code that builds the two Sunday School
Simplified marketing surfaces. The pages live in **Webflow** (`candlerfoundry.emory.edu`);
these files are the canonical copies of the embeds so we never have to reconstruct them.
Each `<!-- BLOCK n of 3 -->` is pasted into its own Webflow HTML Embed, stacked in order.

- **`landing.html`** — public landing page: 1) hero, 2) "Let's Get Started", 3) "Choose Your Packet".
- **`portal.html`** — logged-in "My Lessons" portal: 1) hero, 2) "Let's Learn, NAME", 3) "Your Packets".

## Canva sources
- **Web-page sections** (these embeds' baked art): design **`DAHRnlJvmA4`**
  ("Sunday School Simplified Landing Page"), shortlink `https://canva.link/l2565l075ywv8cs`.
  Pages: **5** landing hero · **6** landing get-started · **7** landing choose-packet ·
  **8** portal hero · **9** portal let's-learn · **10** portal your-packets.
- **Flipbook lesson art** (the packets themselves): design **`DAHOtl4BNMk`** (separate).

## Assets (in this repo's `assets/`, served from Netlify)
`sss-landing-hero-v3.png` · `sss-landing-getstarted-v2.png` · `sss-landing-packets-v3.png` ·
`sss-portal-hero-v3.png` · `sss-portal-letslearn.png` · `sss-portal-tile-bbs.png` ·
`sss-portal-tile-women.png`. Re-export from Canva, verify PNG (`IEND` + PIL decode), push via
the Git Data API. Netlify serves them + auto-deploys.

## How the dynamic bits work (Foxy website-helpers `foxy-logic.js`, already on the portal)
- **First name:** `foxy-logic-display="customer-first-name"` fills a hidden `.ll-src`; a small
  script uppercases it, **shrinks-to-fit**, and falls back to **FRIEND** (empty or > 16 chars).
- **Font = `Thierry Leonie`** (`engine/assets/fonts/thierry.woff2`, CORS-enabled via repo `_headers`).
  **Sizing calibration (important):** Thierry caps are **96% of the em** (very tall). Baked
  "LET'S LEARN," cap-height = **102px at 2400px width** (capH/W = 0.0425). Live name font-size =
  **`containerWidth * 0.0443`** to match, box `top:0;height:28.3%` bottom-anchored to the baseline.
  (An earlier `0.060` factor made the name 35% too big and clipped — fixed Aug 14.)
- **Per-packet gating:** `foxy-logic-transaction-includes="SSS-BEYONDBUMPER"` / `"SSS-GOSPELWOMEN"`
  (hidden by default; shown only if that code is in the customer's transactions — free $0 reg counts).
- **URLs:** Register = Foxy `category=SSS` $0 links (from Course & OND Planner). LOG IN →
  `/customer-portal/account`. Browse → `/sunday-school-simplified`. Open Booklet → `/sss/<slug>`.
  Printable PDF → `window.open` popout of `/packets/<slug>/<PDF>`.

## ✅ RESOLVED — portal "Your Packets" (section 3) — Emily's isolated tiles (Aug 17 2026)
Emily designed **each packet as its own self-contained Canva tile** (design `DAHRnlJvmA4` **pages 11 =
BBS, 12 = Women**), each a clean card on **white**. Claude crops each to the card (centered, unified
1322×1062 on white) → `assets/sss-portal-tile-bbs-v2.png` / `sss-portal-tile-women-v2.png`, wraps each
in its `foxy-logic-transaction-includes` gate + Open Booklet / Printable PDF hotspots. **Section
background is WHITE** so the tiles (baked on white, with their own drop shadow) blend seamlessly — the
old gradient-seam problem is gone. Header = live Thierry "Your Packets". Single owned tile centers.
**If a colored section background is ever wanted:** re-export the tiles on that color in Canva, OR
re-crop tight to the card + add CSS `border-radius`/`box-shadow` (as the earlier `-v1` tiles did).
(Superseded `sss-portal-tile-bbs.png`/`women.png` were slide-10 crops — no longer referenced.)
