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

## ⚠️ OPEN ISSUE — portal "Your Packets" (section 3) — resolve Monday
The current section 3 **crops slide 10 into two tiles** + a **live "YOUR PACKETS" header** on a
solid `#dce2ee` background. Emily's verdict: it reads as a **reconstruction, not her exact asset**
(bg shade / spacing / header differ from her single cohesive slide-10 image). A single baked image
can't gate per-packet, hence the split.

**AGREED RESOLUTION (Emily, Aug 14):** Emily will **design each packet as its own self-contained
tile in Canva** (its own card, exactly as she wants it). Then Claude drops each tile image into a
`foxy-logic-transaction-includes` wrapper and shows only owned ones — every tile is 100% her asset,
no cropping. **TBD when her tiles arrive:** (a) is the "Your Packets" header baked into a tile or a
separate always-shown strip? (b) what section background color sits behind the tiles? Replace
`sss-portal-tile-bbs.png` / `sss-portal-tile-women.png` with her new per-packet tiles and drop the
slide-10 cropping.
