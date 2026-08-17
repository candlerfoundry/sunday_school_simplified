# Sunday School Simplified — flipbook site

Online **flipbooks** (the primary product) plus optional downloadable **PDF packets**
for the *Sunday School Simplified* series from The Candler Foundry. One shared flipbook
**engine** powers every packet; each packet supplies only its own content and assets.

> **Working on this repo with a Cowork / AI session? START HERE.** This README is the
> canonical, up-to-date source of truth for the project. Read it in full before making
> any change — and **keep it current**: any push that changes the design, schema,
> workflow, or status must update this README in the *same push* (see "Keep this README
> current" below). (Cowork's own "memory" files, if present, auto-load into the session
> and live in Cowork's internal store — they are **not** in Dropbox and **not** in this
> repo, so do not go looking for them in the Dropbox folder.)

---

## ▶ START HERE — current status (updated Mon 2026-08-17; supersedes the older "Monday 2026-08-10" block below)

**Three workstreams are mid-flight. Read this first.**

**1) BBS videos — 3 captioned, awaiting Emily's review (HARD GATE before Vimeo).**
`3MB-283` (Jeremiah / L1), `287` (2 Timothy / L5), `288` (1 Corinthians / L6) are spliced with the
corrected title cards, captioned at Whisper-**medium** + AI-proofed, and **re-burned 2026-08-14 with
proofing fixes** (287 "Church"→"church"; 283 "Washington DC"→"Washington, D.C."; "scripture"→
"Scripture" normalized; Greek/Hebrew transliterations verified public-friendly). Review copies live in
`…\Dropbox\3MB\NEW VIDEOS GO HERE\_CAPTIONED FOR REVIEW\`. **Next after Emily approves:** Vimeo (public)
→ Airtable (Transcript + Vimeo Link) → wire BBS **L1/L5/L6** `videoUrl` in `content.js` → re-cut the BBS
PDF. **Also open:** L4 **Philippians (`3MB-44`)** — captioned (Feb) + filed already; Emily to decide
**upload as-is vs re-caption at medium**. Canonical runbook = the pipeline-folder README
(`…\Dropbox\3MB\SSS 3MB Captioning Pipeline\`).

**2) Webflow marketing surfaces — public landing + logged-in "My Lessons" portal.**
**Canonical embed code now lives in [`webflow-embeds/`](webflow-embeds/)** (`landing.html`, `portal.html`,
`README.md`) — do NOT reconstruct it. Built from Canva **`DAHRnlJvmA4`** (shortlink
`canva.link/l2565l075ywv8cs`), pages 5-10. New assets in `assets/` (`sss-landing-hero-v3`,
`sss-landing-getstarted-v2`, `sss-landing-packets-v3`, `sss-portal-hero-v3`, `sss-portal-letslearn`,
`sss-portal-tile-bbs`, `sss-portal-tile-women`). The personalized greeting uses self-hosted **Thierry
Leonie** (`engine/assets/fonts/thierry.woff2`, CORS via repo `_headers`; sizing factor **0.0443** —
Thierry caps are 96% of the em). Landing (hero / get-started / choose-packet) + portal (hero /
let's-learn / your-packets) are DONE except the open issue:
   - **✅ REBUILT (2026-08-17) — portal "Your Packets" (section 3) now matches the landing page.**
     Emily: the logged-in band looked "sad and empty". Causes, all measured: each tile PNG carried
     **46-73px of baked white padding** on top of the CSS padding; a lone owned tile was capped at
     `max-width:560px`; and the header PNG was a 704px ink blob centred in a 2400px canvas. **Fix =
     background-independent tiles** — cropped tight to the card's black stroke (**1095x832, corner
     radius 52, transparent rounded corners**: `sss-portal-tile-bbs-v3` / `sss-portal-tile-women-v3`),
     shadow re-added in CSS via `filter:drop-shadow()`; header cropped to its ink
     (`sss-portal-header-v2`, 716x162). That removed the "must stay white" constraint, so the section
     now uses the landing's flat lavender **`#DFE6F4`**, exposed as `--pk-bg` (set `#fff` to revert).
     Landing proportions reused (card **45.6%**, gap **3.25%**, side pad **2.6%**); a lone owned packet
     gets `.pk-one` -> `flex-basis:62%` via JS counting cells with `offsetParent!==null`. Both cards are
     the SAME 1095x832 (the old 73-vs-46 difference was only shadow spread). Hotspots re-measured:
     Open Booklet `left:55.4% top:80.5% w:19.6% h:9.5%`, Printable PDF `left:75.4% w:19.8%`.
     Gating unchanged (`foxy-logic-transaction-includes`). Code in
     [`webflow-embeds/portal.html`](webflow-embeds/portal.html) — **Emily must paste it into the
     Webflow embed; nothing changes live until she does.** Art nit for later: the *Women* tile's
     "Printable PDF" pill has a baked drop shadow the *BBS* tile lacks.

**3) Women packet — Emily's copy review is DONE and shipped (2026-08-17).** She reworked all six
lessons in Canva **`DAHOtl4BNMk` pages 19-30** (shortlink `canva.link/acnz1mieryl38ts`) — note the
range MOVED (it was 8-19), so **always re-read the design, never trust stored page numbers**. All 12
pages were re-exported, verified, and pushed; `content.js` was re-synced to the art; and the printable
PDF was re-cut in the **Beyond Bumper Stickers format** via the new **`tools/make_women_pdf.py`**.
See "Packet #2" below for the full detail. **Remaining on this packet:** the Vimeo `videoUrl`s for
L1/L3/L4/L5 are wired, **L6 (Widow, 3MB-280) is still held** with no master, and the letter +
packet-wide prayer pass are still Emily's open items.

---

## The one rule that matters most: how code lands here

This repo is mirrored into a **cloud-synced Dropbox folder** where a live `.git` and
ordinary text writes are **unreliable** (writes get silently truncated; git metadata gets
corrupted). Therefore:

- **Keep this README current — treat it as part of the deliverable.** Whenever a change
  alters the design, the content schema, the workflow, or the project status/pending list,
  update `README.md` and include it in the **same commit** as the change. A push that
  leaves this README stale is an incomplete push. (This file is the only project state
  that survives across sessions in git; do not rely on external notes to carry it.)
- **GitHub `main` is the SOURCE OF TRUTH.** The Dropbox folder is a browse-only mirror —
  never trust or edit local copies; always fetch the current file from GitHub first.
- **Author every change in `/tmp`** (native filesystem), run `node --check` on any JS,
  then **push via the GitHub API** and **verify byte parity** afterward. Do not write code
  files directly into the Dropbox/OneDrive mount.
- **Cowork mounted-folder reads can corrupt BINARY files too** (July 2026: a healthy
  1632x560 PNG on Emily's C: drive repeatedly arrived truncated — same byte count,
  stream cut, no IEND). Before pushing any image that came through a mount, verify it:
  PNG must contain `IEND` and fully decode (`PIL Image.load()`); otherwise get the bytes
  another way rather than pushing garbage. **Known-good workaround:** the bad snapshot
  sticks to the specific file — have Emily duplicate the file in Explorer (any new
  filename); the fresh copy transfers clean. (Verified July 2026 with lesson-1 header.)
- Push with the **Git Data API**: GET `git/ref/heads/main` -> read the base commit's tree ->
  POST `git/blobs` (base64) per file -> POST `git/trees` (with `base_tree`) -> POST
  `git/commits` -> PATCH `git/refs/heads/main`. (One commit can carry several files.)
- **If `api.github.com` is unavailable** (some Cowork cloud sandboxes gate the Git Data API
  host while still allowing git-over-HTTPS): clone with the PAT
  (`https://x-access-token:<PAT>@github.com/...`), author in `/tmp`, and `git push` to
  `main`. This lands identical bytes; verify parity by re-fetching `origin/main` and
  diffing. (Used for the packet-#2 push, July 2026.)
- **Token:** a fine-grained PAT (Contents: Read & Write, this repo only) is at
  `C:\Users\esavant\Dropbox\Sunday School Simplified\.claude-git-token.txt`. Use it;
  **never echo or print the token value.**
- **Netlify auto-deploys** every push to `main` (site `sundayschoolsimplified`). Each
  packet is reachable at its clean URL `/<slug>/`. Only push a packet once it's built,
  verified, and approved — pushing makes it live immediately.

## Verify before you push

Render the changed pages and eyeball them before committing:

- Playwright chromium headless-shell in the work sandbox: `npm i playwright-core`, then
  `node node_modules/playwright-core/cli.js install chromium-headless-shell`. The shell
  needs `libXdamage.so.1`: `apt-get download libxdamage1`, `dpkg-deb -x` to a writable
  dir, run node with `LD_LIBRARY_PATH=<that dir>`.
- On Emily's Windows machine (July 2026, verified): `npm i playwright-core` in a temp
  dir, `node node_modules/playwright-core/cli.js install chromium-headless-shell` —
  works directly, no LD_LIBRARY_PATH dance. Wait on `waitUntil:"load"` +
  `document.fonts.ready` + ~2s (NOT `networkidle` — a live Vimeo iframe never idles).
  Vimeo serves headless/automated clients a Turnstile bot-challenge ("couldn't verify
  the security of your connection") — that black box in screenshots is expected, not a
  privacy error; confirm real availability via `vimeo.com/api/oembed.json?url=…`.
- Serve the repo root (`python3 -m http.server`) and screenshot **every spread at two
  viewports** (e.g. 1536x816 and 1920x1080), plus interaction checks: scripture-card
  click must open the modal **without flipping the page**, tab clicks must jump to the
  right spread. Actually READ the screenshots — measure with `getBoundingClientRect`
  when something looks off; don't guess from theory. **Overflow gotcha (how a clipped
  question shipped once):** `.qs` swallows its own overflow — content slides under the
  closing prayer with no page-bottom symptom. Check `qs.scrollHeight <= qs.clientHeight`
  on every lesson page B, with real webfonts loaded.
- Beware CSS class-name collisions when adding chrome around StPageFlip (a `.vtitle`
  clash between spine and video card once bottom-anchored the spine text).
- **Mind cross-screen scaling (July 2026 lesson):** the binder scales via
  `--book-scale` (set on `:root` by `fit()`), so the free side margins vary a LOT
  between screens ((100vw - 1832px*scale)/2 ≈ 45-95px). Any fixed-position chrome
  (watermark, ribbon, nav arrows) must be sized against that margin — the watermark
  uses `clamp(44px, calc((100vw - 1832px*var(--book-scale))/2 - 20px), 150px)`.
  ALSO keep `fit()`'s `SPINE_W`/`TAB_W` constants in sync with the CSS variables —
  they drifted once (96 vs 132) and silently squeezed every margin. Verify at
  1536x816, 1280x680, 1920x1080, and iPad 1180x820 minimum.

---

## What the site is

- **Series landing:** `index.html` — lists every packet (reads `packets/index.json`).
- **Shared engine:** `engine/render.js` (page builder + StPageFlip driver + binder
  chrome), `engine/styles.css` (design system), `engine/assets/fonts/` (licensed
  webfonts), `engine/assets/candler-foundry-mark-white.svg` (spine mark).
- **Packets:** `packets/<slug>/` — each self-contained (thin `index.html` shell +
  `content.js` + local `assets/` + optional PDF).

```
sunday_school_simplified/
  index.html                     # series landing page
  engine/
    render.js                    # shared flipbook engine (StPageFlip + binder chrome)
    styles.css                   # shared design system
    assets/fonts/                # thierry.woff2, hello-handmade.woff2
    assets/candler-foundry-mark-white.svg
  packets/
    index.json                   # manifest the landing page renders from
    beyond-bumper-stickers/
      index.html                 # thin shell: loads content.js + ../../engine/*
      content.js                 # this packet's copy (window.BBS_CONTENT)
      assets/                    # cover.png, candler-foundry-logo.png, headers/*
      Beyond Bumper Stickers.pdf # optional downloadable packet (secondary product)
  netlify.toml                   # publish "."; rewrites /<slug>/ -> /packets/<slug>/
```

## Design system (current — "binder", blue, template-driven)

The flipbook sits inside a **binder frame** that fills the viewport (approved July 2026;
this supersedes both the 1970s road-trip design AND the earlier floating-book blue
layout — no top bar, no page indicator).

- **Binder frame:** navy **spine** on the left (red dash at top; "Sunday School
  Simplified" in white vertical type reading bottom-to-top, letter tops facing the
  pages; white Candler Foundry circle-mark at the bottom) · the two-page book ·
  **index tabs** on the right. Tabs = one small "Contents" tab, one numbered tab per
  lesson labeled with its abbreviated reference (`tabRef`, e.g. "Jer. 29"), and a small
  "Additional Resources" tab. Active tab is navy. Tabs are the primary navigation
  (plus arrow keys / edge arrows). No "page N of M" pill. Tab rail is 132px wide (the tab numeral `.tn` uses `padding-left:23px` so the numbers clear the rounded left edge — nudged out July 2026 at Emily’s request);
  `tabRef` holds the FULL reference ("Jeremiah 29", "1 Corinthians 13" — Emily wants
  them spelled out, wrapping to two/three lines), and `shortRef` (used on the Contents
  rows) is also spelled out for 1 Corinthians.
- **Cover gloss:** the cover page carries a subtle laminate sheen + right-edge
  highlight (`.pg.coverpg::after/::before`, approved July 2026). No box-shadow or
  border-radius on the page itself — the binder casts the shadow, and rounded corners
  would show background slivers on StPageFlip's square pages.
- **Cover flip (IMPORTANT — hard-won):** Emily wants the cover to turn with the same
  soft page-curl as every other page. StPageFlip's `showCover:true` mode animates the
  lone cover rigidly and slides the whole book sideways, and `data-density` can't fix
  it. The shipped solution: `showCover:false` plus an invisible **blank first page**
  (`.page.blankpg`, transparent) so the cover is the right half of a normal spread —
  soft curl, book stays centered. Do not reintroduce `showCover`.
- **Deep links (used by the printable PDF QR codes):** `?lesson=N` opens lesson N;
  `?goto=resources` / `?goto=contents` open those spreads (handled in render.js after
  init via `flip.turnToPage`).
- **Clicks never flip pages:** `disableFlipByClick:true`. StPageFlip's click-target
  check only looks at the DIRECT event target, so clicks on spans inside buttons/links
  used to trigger a backward flip (the "scripture opens but page flips" bug). Navigation
  is drag/swipe, arrow keys, edge arrows, and the tabs.
- **Magazine chrome** (`.bookdeco`, added July 2026): a soft center-**gutter** shading
  down the spine of every open spread (drawn over the pages), and **page-edge stacks**
  on the outer left/right edges (drawn behind the pages, gradient-shaded). Both hide on
  the cover view (`.binder.on-cover`) and the whole deco fades out while a flip is in
  progress (`.binder.flipping`, driven by StPageFlip's `changeState`).
- **Download:** a **"Printable Packet" tab** at the bottom of the tab rail (July 2026 —
  this replaced the old fixed vertical side ribbon at Emily's request; the ribbon read as
  a tethered label, the tab reads as part of the binder). It's an `<a>` styled as a
  `.tab.download`, rendered by the engine only when the packet ships a PDF (`meta.pdf`).
  **It must never auto-download** (Emily, repeatedly): as of 2026-08-17 `render.js` binds a
  click listener that opens the PDF in its **own pop-out window** (`window.open(..., "sssPdf",
  "width=980,height=1150,...")`) — "a separate box", matching the portal tile's `sssPDF()`.
  There is **no `download` attribute**; if the popup is blocked the handler does NOT
  `preventDefault`, so the anchor's `target="_blank"` still opens it in a tab. Colored via
  `--red` so it grabs the eye — bright **yellow `#FFD21E`** (navy text) on the women packet,
  red on Beyond Bumper Stickers — packets re-theme `.tab.download`. The fit formula is
  unchanged: scale = min((vw-130)/(68+1632+132), (vh-24)/1056).
- **Favicon:** `engine/assets/favicon.svg` — tone-on-tone powder-blue rounded tile with
  the navy Foundry circle-mark (mark only; the full wordmark is illegible at 16px).
  Linked from the packet shell and the landing page.
- **Candler Foundry watermark:** fixed bottom-left (`.wmark`, full navy logo
  `engine/assets/candler-foundry-logo.svg` at ~30% opacity), links to
  https://www.candlerfoundry.emory.edu (new tab). It auto-scales to the free margin
  beside the binder (see scaling note in "Verify before you push") so it stays fully
  visible on every screen; #stage is pointer-events:none so it stays clickable.
- **Palette:** navy `#0A274C`, powder blue `#CCE0F5`, smoky blue `#2F5972`, page
  `#FCFDFF`, card `#EAF3FC`; brand red **`#FB1616`** as small accents only.
- **Per-packet theming:** a packet may re-skin the shared engine by overriding its CSS
  variables (and a few hardcoded-chrome selectors) in an inline `<style>` in the packet's
  own `index.html`, leaving `engine/styles.css` untouched. Packet #2 (Gospel According to
  the Women) does a full **mustard-forward facelift** this way (July 2026 — see that
  packet's status section): navy is reserved for the binder chrome only, the cover's
  **mustard gold `#B8860B`** is the star, brown `#6d4f26` is the ink for rules/borders/
  labels, and butter yellow is demoted to a faint tint. It restyles the header into a
  **number-badge** layout, gives the prayer/scripture cards a real brown border + gold
  accent bar, makes the video a clean on-palette 16:9 panel, and gold-ifies the display
  headings. All still via overrides; the engine stays generic.
- **Optional header eyebrow (engine):** the engine-drawn lesson header emits a
  `<div class="heyebrow">Lesson N</div>` (N spelled out) that is `display:none` in
  `engine/styles.css` by default — so art-header packets and Beyond Bumper Stickers are
  unchanged — and a packet opts in by styling `.heyebrow{display:block}` (packet #2 does).
- **IMAGE-BASED LESSON PAGES (July 2026) — "bring your own art."** A lesson may supply its
  two pages as **full-page artwork** (designed in Canva) instead of being laid out by the
  engine; the engine then renders the art full-bleed and overlays **only the interactive
  bits**. Triggered purely by the presence of `pageImages` on a lesson, so lessons/packets
  without it are untouched. This exists because Emily wants full design control of the
  lesson layouts; the flipbook keeps the two things a flat image can't do:
  - **Scripture hotspot** — a transparent positioned `<button class="imgscrip" data-scrip=N>`
    laid over the art's scripture box; it renders the reference + a "Read the passage /
    NRSVUE" pill and opens the **same** scripture pop-out (`scriptureText`).
  - **Video hotspot** — a **transparent click target** (`.imgvidhot`) over the art's video
    box. The art already draws a clean "3 Minute Bible" placeholder with a play button, so we
    do **NOT** embed the Vimeo iframe in-frame (July 2026 — Emily: its preview chrome, orange
    thumbnail + metadata, is ugly). Clicking the hotspot opens the video large in a centered
    16:9 pop-out modal (`.vscrim`/`.vmodal`, autoplay, Esc/backdrop to close). If the lesson
    has no `videoUrl`, no overlay is drawn and the art's own placeholder just shows through.
  - Hotspots are **percentages of the page**, so they scale with `--book-scale`.
  - **The binder stays** (Emily's call): the art sits inside the navy spine/tab frame.
  - Art spec: **1632 × 2112 PNG** (8.5 × 11 at 2×, same as the cover). Video box must be
    **16:9**. Body text ≥ ~34 px at that scale (= 17 px on the rendered page).
  - **Getting the art in: use the Canva connector, never the Dropbox mount** (the mount
    truncates PNGs). Design `DAHOtl4BNMk` → `export-design` (png, pro, lossless) → download
    from Canva's CDN → verify PNG signature + `IEND` before pushing.
- **Type:** **Thierry Leonie** (display numerals), **Mulish** (body; upsized ~10% vs the
  old layout for readability/accessibility — body 18-19px), **Hello-Handmade Sans**
  (handmade display: letter heading, TOC title, tab numerals, fallback lesson titles).
  Thierry + Hello-Handmade via `@font-face` from `engine/assets/fonts/`; Mulish + Font
  Awesome from CDN.
- **Section icons:** Emily's **hand-drawn SVG icons in brand red** inside the powder
  circles (`engine/assets/icons/icon-*.svg`, single-path recolorable — prayer hands =
  Opening Prayer AND Closing Prayer, open book = Scripture, play = Watch, dialogue
  bubble = Questions). The heart icon was dropped July 2026 (Emily: too cheesy) — both
  prayer sections now use the prayer-hands icon; `icon-heart.svg` files remain on disk
  but are unreferenced. Font Awesome still supplies chrome glyphs (tabs, ribbon,
  modal, resources play button).
- **Page order:** hidden blank page (see below) · cover (`assets/cover.png`,
  full-bleed) · **letter** (no eyebrow logo, no rhythm box) · **Contents**
  (lesson list + relocated **"rhythm of each lesson" 5-step strip** at the bottom) ·
  **two pages per lesson** · **Additional Resources** (all `optionalVideo`s AND
  `optionalReadings` live here — lesson pages carry NO optional-viewing bar) ·
  **end page** (full Candler Foundry logo, tagline, candlerfoundry.org).
  **No back-cover image** (old road-trip `back.jpg` was dropped; a new blue-design
  back cover may return later).
- **Lesson-page extras (July 2026):** (1) `funFact` — an optional per-lesson
  "Did you know?" aside (`.funfact`, Hello-Handmade label + italic note, accent-colored
  left rule) rendered under the video card on page A; null/absent → nothing renders.
  (2) **"More on this lesson" chip** (`.morebtn`) — sits at the right end of page B's
  existing footer row (zero added height) and jumps to the Additional Resources spread;
  renders only when the lesson has an `optionalVideo` or `optionalReadings`. It's a
  real `<button>` (divs would trigger StPageFlip's click-to-flip).
- **Additional Resources readings (July 2026):** the resources page now renders
  `optionalReadings` cards (outlined-circle book icon, `.rcard.rread`) after each
  lesson's video card, linking out in a new tab. These are LINKS ONLY to free-access
  sites (Bible Odyssey, Yale Bible Study, etc.) — never reproduce their content in the
  packet; free-to-view is not open-license. Page lede/empty-state copy now says
  "viewing and reading."
- **Lesson page A:** fixed full-bleed **header slot 816x280** at top — per-lesson art
  (`headerImage`, export at **1632x560**, white background) or, when null, an
  engine-drawn header replicating the approved art style (powder circle + Thierry
  numeral + red sparks, Hello-Handmade title, Mulish reference). Then Opening Prayer
  card, Scripture card, video zone (video card centers in remaining space — no orphan
  gap). **Page B:** questions distributed evenly (space-evenly), Closing Prayer, footer
  ("<title> · Lesson NN of N", left-aligned, no Foundry stamp).
- **Scripture (NRSVUE):** the scripture card is a real `<button>` (this is what stops
  StPageFlip's click-to-flip from firing — divs flip the page, buttons/links don't).
  It opens the scrollable popout modal (`scriptureText` HTML) with "Open in Bible
  Gateway" (NRSVUE) and attribution. Closes on x, backdrop, or Esc.
- **Video:** Watch card is an illustrated SVG placeholder until `videoUrl` (Vimeo embed
  URL) is set, then an iframe.

## Content schema (`content.js`)

```
window.BBS_CONTENT = { meta, contentsIntro, lessons: [ ... ] }
// contentsIntro may be "" — the Contents page renders no lede then (current state;
// Emily removed the "Six of the Bible's most-quoted lines" blurb).

meta   = { series, title, letter: { heading, paragraphs[], quotes[], paragraphs2[],
           rhythmTitle, steps[], paragraphs3[], grace, signName } }
         // rhythmTitle+steps now render on the CONTENTS page (bottom strip),
         // not in the letter.

lesson = { n, accent, reference, shortRef, title,
           tabRef,              // side-tab label, spelled out, e.g. "Jeremiah 29"
           subtitle,            // exists but UNUSED — subtitles were removed globally
           openingPrayer, closingPrayer,
           scriptureRef, scriptureUrl,   // scriptureUrl uses version=NRSVUE
           scriptureText,       // HTML string shown in the popout modal
           videoTitle, videoSubtitle, videoUrl,   // videoUrl empty until Vimeo links exist
           optionalVideo,       // { title, subtitle, url } or null — renders on the
                                //   Additional Resources page, NOT on the lesson page
           optionalReadings,    // [ { title, subtitle, url }, ... ] or null — free-access
                                //   reading LINKS, rendered as book-icon cards on the
                                //   Additional Resources page (link out only, never
                                //   reproduce the content)
           funFact,             // string or null — "Did you know?" aside under the
                                //   video card on lesson page A
           headerImage,         // path or null (engine draws the replica header when null);
                                //   art spec: 1632x560 PNG, white bg, fills 816x280 slot
           questions: [ ... ], // 5-6 strings
           pageImages,          // OPTIONAL ["pageA.png","pageB.png"] — full-page Canva art.
                                //   When present the engine renders the art instead of
                                //   laying the pages out, and only overlays the hotspots.
                                //   Titles/prayers/questions then live in the ART, not here
                                //   (the fields stay for the PDF + as the written record).
           hotspots }           // required with pageImages: percentages of the page,
                                //   { scripture:{x,y,w,h}, video:{x,y,w,h} }
```

`scriptureText` markup: `<h4>` sub-reference headings, `<p>` prose, `<p class="poet">`
poetry (line breaks via `<br>`), `<p class="super">` superscriptions/section titles, and
`<span class="vn">N</span>` red superscript verse numbers.

To change **content**, edit `content.js`. To change the **look or behavior for all
packets**, edit `engine/render.js` / `engine/styles.css` once.

## Packet #1 — Beyond Bumper Stickers (status)

Six lessons, each recovering a famous verse's original context against its bumper-sticker
misuse: Jeremiah 29, Psalm 46, Genesis 1-2, Philippians 2 & 4, 2 Timothy 3 (+ Genesis 2),
1 Corinthians 13.

> **OPEN TODOs — mostly RESOLVED (Emily, Aug 13 2026).** The four small follow-ups below are **DONE**
> and live (single batched push + one PDF re-cut). Kept here as a record; only the videos remain.
> 1. ✅ **L2 closing prayer → "God of peace"** (lowercase p). Flipbook art re-exported from Canva
>    `DAHOtl4BNMk` page 7 → `assets/pages/lesson-2-b.png` (1632×2112, PNG sig + IEND verified). PDF/record:
>    `content.js` L2 `closingPrayer` now "God of peace,".
> 2. ✅ **PDF body text bigger + darker.** `tools/make_pdf.py`: `INK #22303F` → `#0A274C` (near-black navy,
>    now == NAVY); `prayer_box` 10.5→12 (leading 15.4→17), questions 10.3→11.5 (leading 14.4→16). Re-cut +
>    eyeballed all 17 pages: darker/larger, **no overflow** (L2-B is the tightest at 5 Qs and still clears the
>    bottom margin easily). PDF-only — the flipbook lesson body is baked Canva art (letter-page body left at
>    10.5 by design; the INK darkening still applies to it).
> 3. ✅ **"3 Minute Bible" — NO hyphen — everywhere.** Replaced across `content.js` (10×), `engine/render.js`
>    (7×), `tools/make_pdf.py` (4×).
> 4. ✅ **L4 Philippians video title = "Un-Structuring the Bible"** (3MB-44). `content.js` L4 `videoSubtitle`
>    set; renders on the PDF L4 page as the "coming soon" note-box title (video not yet on Vimeo).
> ✅ **Confirmed (Emily asked):** the **Printable Packet** tab opens the PDF in a **new browser tab**
> (`engine/render.js` line ~211: `<a … target="_blank" rel="noopener">`, **no `download` attribute**), so
> browsers render it inline rather than auto-downloading. (Stale "// real <a download>" comment corrected.)
> **Still pending — the 4 videos** (L1 Jeremiah 283, L4 Philippians 3MB-44, L5 2 Timothy 287, L6 1 Corinthians
> 13 288) — draft **title cards** for 283/287/288 were handed to Emily (need her wording + intro-duration
> confirmation + optional production title-frame to match exactly).

- **NOW IMAGE-BASED (Aug 2026) — BBS converted to full-page Canva art, just like the Women
  packet.** Emily reworked all six lessons + the cover in Canva (design `DAHOtl4BNMk`,
  **pages 3–15**: page 3 = cover, pages 4–15 = the 6 lessons × 2 pages). The engine now renders
  the art full-bleed (`pageImages`) and overlays only the interactive hotspots; `content.js`
  is the written record + PDF source (its question/prayer *text* is not shown on the flipbook
  anymore). Art at `assets/pages/lesson-N-a.png` / `-b.png` (1632×2112, integrity-verified).
  **Hotspots are identical across all six page-As** (detected + overlay-verified): scripture
  `x 8.7 / y 48.06 / w 81.74 / h 7.29`, video `x 14.77 / y 62.5 / w 70.4 / h 31.06` — the SAME
  template geometry as the Women packet. Live + verified Aug 2026 (18 pages, no overflow, no
  broken images).
- **Cover fuzziness FIXED (Aug 2026):** `assets/cover.png` re-exported from Canva at **2×
  (3264×4224), lossless** — crisp on the flipbook and the landing/portal thumbnails. (Supersedes
  the earlier "cover blurry" known issue.)
- **Lesson 4 title = "I Can Do All Things Through Christ"** (Aug 2026, Emily's call — the popular
  KJV/NIV phrasing). This **resolves the old "Through Christ" (art) vs "Through Him" (title/TOC)
  mismatch** — title/TOC/tab now all say "Through Christ"; the **scripture reading still uses the
  NRSVUE "through him"** (reference unchanged).
- **Lesson 3 scripture reading expanded to Genesis 1:1–2:4a; 2:15** (was 1:26–31; 2:15) — the whole
  first creation account. The scripture modal now shows the **full NRSVUE text** of Genesis 1:1–2:4a
  (+ 2:15), fetched verbatim from Bible Gateway and formatted to the packet markup (`<h4>` sub-refs,
  `<span class="vn">` verse numbers; truncated at 2:4a). Lessons 1/2/4/5/6 scripture references are
  unchanged.
- **Spine chrome:** the small **red dash at the top of the spine was removed** (Emily, Aug 2026);
  the vertical "Sunday School Simplified" wordmark stays.
- **"Printable Packet" tab now OPENS the PDF** in a new tab (`target="_blank"`, no `download`
  attribute) so the reader can view it first and choose to download — was an auto-download.
- **NEW ENGINE FEATURE — "TIP" hotspot (`imgtip`) → a pop-out box.** A lesson may add a
  `hotspots.tip` rect + `tipText` (the advisory) + `tipUrl` + `tipLinkText`; the engine overlays a
  transparent **`<button>`** over the art's TIP badge that opens a small **pop-out** (scrim + card,
  ×/Esc/backdrop close) showing the advisory text and a link button — NOT a direct jump (Emily,
  Aug 2026: a bare link "makes no sense"). Engine: `render.js` `lessonImagePageA` + the `openTip`
  modal + `[data-tip]` handler; `.tipmodal`/`.imgtip` in `styles.css`. **Lesson 3 uses it**
  (`tip x 71.08 / y 14.87 / w 8.95 / h 6.96`): advisory to read the whole second creation narrative,
  link → Bible Gateway **Genesis 2:4b–25**.
- **All six discussion questions/prayers were revised by Emily (Aug 2026)** and are now **synced
  into `content.js`** (the PDF source / written record) to match the art — via `tools/content-sync`
  (curly-typography merge). The flipbook shows the art either way.
- **Binder chrome unchanged** (navy spine/tabs/nav). Hand-drawn red section icons still apply where
  the engine draws (not on the image pages).

**Videos (3-Minute Bible) — status Aug 2026:**
- **LIVE + wired:** L2 Psalm 46 (`player.vimeo.com/video/1214332162`, 3MB-284) · L3 Genesis 1–2
  (`.../1214332189`, 3MB-285). Both play in the in-frame pop-out.
- **Pending upload/correction:** L1 Jeremiah (3MB-283, held for a corrected title slide) · L4
  Philippians (3MB-44 — captioned in Dropbox but **not yet on Vimeo**) · L5 2 Timothy (3MB-287, held)
  · L6 1 Corinthians (3MB-288). **✅ 2026-08-17 — 283/287/288 uploaded public and wired:**
  L1 = `player.vimeo.com/video/1218983605` (*The Story of Jerusalem*), L5 = `…/1218983645`
  (*Scripture Inspired by God*), L6 = `…/1218983700` (*Love Is Patient, Love Is Kind*) — titles are the
  on-screen slide titles with **no series suffix**, per Emily. All three transcoded, `anybody`/public
  embed. Airtable `Transcript` (proofed, overwriting the draft) + `Vimeo Link` updated for each; note
  the whole batch stays **Status = Draft**, matching the six published in July (Status is not tracking
  publication). **Only L4 Philippians (`3MB-44`) is still unwired** — it is captioned + filed but has
  never been uploaded, and Emily's open decision is upload-as-is vs re-caption at medium. (Draft on-brand **title cards** for 283/287/288 were designed +
  handed to Emily with an `ffmpeg` overlay command that preserves the voiceover.)

**PDF v3 — DONE (2026-08-17), Emily's readability pass.** The layout now lives in ONE shared module,
**`tools/packet_pdf.py`**; `tools/make_pdf.py` and `tools/make_women_pdf.py` are thin wrappers that
only choose a palette, so the two packets can't drift. Emily's brief: *"the font could generally be
bigger… at least consistent with 12 point Times New Roman… a lot of users will be older and we should
make this as user-friendly and readable as possible."* Times New Roman's x-height is **0.4473 em**
(5.37pt at 12pt) and Mulish's is **0.5000 em**, so: questions + prayers **13pt** (6.50pt x-height =
**121% of 12pt Times**), letter/prose **12pt**, box titles 13.5, captions 11, section labels 16.5.
**Never set Mulish below ~10.75pt or you drop under her floor.** Also fixed this round: **question
numerals are vertically centred on their question block** (they used to sit at the top of multi-line
questions — Thierry's digits centre **0.469 em** above the baseline, hence the constant in the module);
**video boxes print the Vimeo URL as text** beside the QR, and both QR and printed link point at
`vimeo.com/<id>`, not the bare `player.vimeo.com` embed; boxes size themselves from their content and
**question pages paginate** ("Discussion Questions (cont.)") so bigger type can never overflow.
Much of the *perceived* smallness was also the ExtraLight font bug below — fixed, so both packets
gained real weight. Verified: 0 out-of-bounds and 0 overlapping text blocks in both PDFs.

<details><summary>Previous (Aug 2026) v2 note — superseded by the above</summary>

`tools/make_pdf.py` was **rewritten**
per Emily's brief ("clean and easy to print, no graphics, replicate the fonts, keep the borders,
minimal color"): no graph-paper/icons/header-art; a **thin red page border**, navy outlined section
boxes, **RED Thierry question numbers**, and the **packet fonts** (Hello-Handmade display, Mulish
body, Thierry numerals). Hello-Handmade is CFF, so the build **converts it to glyf via cu2qu** for
reportlab (font prep documented in the script header). Content comes from the synced `content.js`;
**scripture QR+link (Bible Gateway NRSVUE)** on every lesson, **video QR+link (Vimeo)** on L2 + L3,
"coming soon" note on L1/L4/L5/L6. 17 pages, rendered with PyMuPDF and eyeballed. Re-run when the
art/content or videoUrls change (`content.json` dump + `fonts/` prep + `python make_pdf.py`).
</details>

> **⚠ FONT TRAP (found + FIXED 2026-08-17) — the `fonts/` Mulish files were never
> actually instanced.** They still carried an `fvar` table with `usWeightClass 200`, and
> `Mulish-normal-500.ttf` and `Mulish-normal-700.ttf` were **byte-identical**, so reportlab rendered
> every Mulish weight as **ExtraLight** — body, bold and extra-bold all the same. Fix (used for the
> Women build): `fontTools.varLib.instancer.instantiateVariableFont(f, {"wght": N})` per weight, then
> set `OS/2.usWeightClass`. Verify with: no `fvar`, correct `usWeightClass`, and the `I` stem width
> differing per weight (93 / 129 / 156 units at 500 / 700 / 800). **The BBS PDF still needs this fix
> + a re-cut**; expect text to get slightly wider, so re-check page fit (on the Women build the end
> page's blurb went from 2 lines to 3 and collided with a fixed-y URL — the shared module now flows the
> URL from the paragraph's real bottom). **Both PDFs were re-cut with correct weights on 2026-08-17.**

**Still pending:**
- **New back cover** in the blue design (optional — back page currently dropped).

## Packet #2 — The Gospel According to the Women (status)

Six women whose faith and courage move the biblical story forward: **Hannah**
(1 Sam 1:1–20), **Eve** (Gen 2:18–25), **Shiphrah and Puah** (Exodus 1:8–22), the
**Daughters of Zelophehad** (Numbers 27:1–11), **Tamar** (Genesis 38:6–26), and the
**Widow of Zarephath** (1 Kings 17:8–16). Source material: Emily's 3-Minute Bible
transcripts + a theme/scripture chart (Dropbox).

- **Layout facelift — "number badge" (variant B, July 2026).** Emily reworked the lesson
  layout to carry the cover's personality inward and lean into the cover's mustard gold.
  Sampled from the cover art: butter `#FFF59C` (background), **mustard gold `#B8860B`**
  (the display lettering — now the packet's star), brown `#6d4f26` (rules/ink). Changes,
  all in the packet's inline `<style>`:
  - **Header:** a gold rounded **number badge** (brown border + drop shadow, cream Thierry
    numeral) with a `Lesson N` eyebrow, the gold Hello-Handmade name, and the reference
    beside it, over a full-width brown header rule. Replaces the old giant-navy-numeral
    circle. (Uses the engine's opt-in `.heyebrow`; long names like "Daughters of
    Zelophehad" fit on one line.)
  - **Cards:** prayer + scripture cards get a **1.6px brown border and an 8px gold left-bar**
    (fixes the near-invisible `#E7E3C0`-on-cream borders that read as a wall of text).
  - **Video:** a clean on-palette **16:9 mustard panel** (gradient `#C79412→#9c7209`, brown
    border, cream play, brown "3-Minute Bible" pill, Hello-Handmade caption). The khaki
    "hills" are gone; the placeholder now shares the exact footprint of the real Vimeo
    iframe, so lessons with/without a video look consistent. No orange.
  - **Accents:** display headings (letter title, "In This Packet", TOC numbers, sign-off,
    Additional Resources title, modal "Open in Bible Gateway", resource icons, question-
    number circles) go mustard gold; section labels + references go brown; small icon
    circles are a pale-gold tint with a gold ring. Body text stays navy for readability.
  - **Unchanged:** the navy binder spine/tabs/nav (shared brand chrome). The
    **bright-yellow `#FFD21E`** download control (Emily wants it to grab the eye) is now the
    **"Printable Packet" tab** at the bottom of the rail (was a side ribbon — see Download above).
  Verified July 2026 in Playwright across every surface (lessons incl. long titles and the
  live-video lesson, contents/letter, modal, resources) with no overflow; Beyond Bumper
  Stickers confirmed pixel-unchanged. Cover is Emily's Canva cover (`assets/cover.png`,
  1632×2112, gold-on-yellow, integrity-verified).
- **✅ COPY REWORK SHIPPED (2026-08-17) — all six lessons updated to Emily's corrected Canva copy.**
  Source = **`DAHOtl4BNMk` pages 19-30** (`canva.link/acnz1mieryl38ts`), 1632x2112, exported through the
  Canva connector, PNG-verified (signature + chunk walk + full PIL decode) and pushed to
  `assets/pages/`. **The page range MOVED from 8-19 to 19-30 — re-read the design every time.**
  What actually changed: **Hannah** Q3 (the Nazirite framing and "no wrong answers" are gone) and Q4
  ("five" -> "five more children"); **Shiphrah & Puah** Q1 and Q4; **Zelophehad** Q1/Q3/Q4 ("Moses'"
  -> "Moses's"); **all five Tamar questions** rewritten plus the opening prayer ("God of Love" ->
  "God of love"); **Widow** Q1/Q3/Q4 and the opening prayer ("God of Provision" -> "God of provision").
  **The Widow's passage widened from 1 Kings 17:1-16 to `1 Kings 17:1-24`** — `reference`,
  `scriptureRef`, the Bible Gateway `scriptureUrl` and the modal `scriptureText` were all updated, with
  vv17-24 (Elijah revives the widow's son, NRSVUE) appended as a second `<p>` and Bible Gateway's
  section heading dropped per packet convention. Also normalised **"3-Minute Bible" -> "3 Minute
  Bible"** (12x) to match the art and Emily's Aug-13 ruling. `content.js` was edited by parsing it as
  JSON and re-emitting through a **format-preserving serializer** (it round-trips byte-identical, so
  the diff contains only real changes) — see `tools/` notes; keep that approach.
  **HOTSPOTS RE-MEASURED on the new export** (do this every time): scripture
  `x 8.7 / y 47.96 / w 81.8 / h 7.34`, video `x 14.77 / y 62.5 / w 70.47 / h 31.11` (1150x657 px,
  exactly 16:9) — **except the Widow**, whose opening prayer is 3 lines instead of 5, so her boxes sit
  higher: scripture `y 47.25`, video `y 62.36`. Detector gotcha: the outer **gold page frame** is also
  a full-height gold rule, so filter out columns whose gold count spans the page before taking the
  scripture box's x-range, and pick the rule-pair whose interior is empty.
  **Emily fixed a typo in-session** on slide 24 (L3 Q4 read "there's burning bush"); that page was
  re-exported after her fix and verified.
- **All six lessons render from Emily's own Canva art (July 2026).** Emily reworked every lesson's two pages herself in Canva (she was unhappy with the engine-drawn variant-B layouts), and all six are now in via the image-based mechanism above: `assets/pages/<slug>-a.png` + `-b.png` (1632×2112, exported through the Canva connector). **⚠ The page numbers first recorded here (8–19) are STALE — as of 2026-08-17 the lessons live at pages 19–30; see the Aug-17 entry above. Canva page numbers in this design move; always re-read the design.** The layout is a shared template, so the **hotspots are identical across all six** (measured + overlay-verified). **⚠ Superseded 2026-08-17 — current values are in the Aug-17 entry above (scripture y 47.96 h 7.34; the Widow differs at y 47.25). The numbers in this July note are stale.** **Re-measure the hotspots every time the art is re-exported** — detect the empty gold scripture box + the dark video rectangle (dark-pixel density projection, robust to the white “3 Minute Bible” text inside the box) and confirm with a drawn overlay before trusting the numbers. The art is authoritative **visually**; the `content.js` prayer/question fields remain the written record + PDF source and may differ from the art. **As of 2026-08-17 five of six lessons have a live `videoUrl`** — L1 Hannah `1214331973` (3MB-278), L2 Two Daughters `1210281687`, L3 Shiphrah & Puah `1214331923` (3MB-277), L4 Zelophehad `1214332026` (3MB-281), L5 Tamar `1214332107` (3MB-282); **only L6 (Widow, 3MB-280) is still empty** because that master is held. Each plays in-frame with a ⭢ pop-out; a lesson with no `videoUrl` shows its own “3 Minute Bible” placeholder and lights up automatically when the link lands. Four art typos were fixed in Canva before export (SHIPHRAH headline, “Jairus”, “how they deliberated”, “jars are empty”) plus Hannah’s “Nazirite” spelling; Hannah’s visible opening prayer now reads “Gracious God…”.
- **Lesson 1 (Hannah) questions are FINAL** — exactly Emily's five, with one edit she
  approved (Samuel "raised at the sanctuary, not at home with Hannah" — the earlier draft
  said "the temple," anachronistic here). All six lessons' questions have now been
  workshopped to Emily's reviewed wording (July 2026); the letter and a packet-wide
  final prayer pass are the remaining draft items.
- **Lesson 3 (Shiphrah & Puah) is FINAL (July 2026)** — Emily's five questions:
  narrative-gap imagination, the Hebrew-vs-Egyptian-midwife scholarly debate, Pharaoh's
  gender blind spot, "feared God" glossed as CONSCIENCE (OT idiom: reverence-as-moral-
  decency credited even to those without scriptures — Gen 20:11, 42:18, Deut 25:18 —
  NOT fear-ranking; Emily explicitly rejected the "feared God more than Pharaoh"
  framing), and a conscience-vs-authority experience question kept concrete to avoid
  politics. Opening prayer retuned to the conscience framing. `funFact`: midwives
  named, Pharaoh anonymous. Video "Background to the Exodus" (3MB-277, Vimeo pending).
- **Lesson 2 is "The Two Daughters" (Mark 5:21–43), FINAL (July 2026)** — this
  REPLACED the Eve lesson entirely (Emily was unhappy with Eve; an honest-context
  rework was built and shipped, then scrapped in favor of a new anchor text). Built on
  the existing 3MB **"What is a Markan sandwich?"** (3MB-26, Elizabeth Arnold), whose
  worked example IS the hemorrhaging woman + Jairus's daughter. Emily's six questions
  (final); `videoUrl` is LIVE (public Vimeo, `player.vimeo.com/video/1210281687`) —
  the packet's first embedded video. Extras: `funFact` (*talitha koum* Aramaic),
  `optionalVideo` "Mark's Secret Messiah" (public, vimeo.com/1210281410, link-out),
  `optionalReading` Yale Bible Study "The Gospel of Mark" (free-access, link only).
  The letter's list of women names "the two daughters of Mark 5" in Eve's old slot.
  NOTE deliberately avoided: purity-law-as-social-outcast framing in the questions
  (scholars, esp. Amy-Jill Levine, flag it as an anti-Jewish trope; Mark's text
  grounds her isolation in illness + poverty, v. 26).
- **Lesson 4 (Daughters of Zelophehad) questions revised (July 2026)** — Emily's
  workshopped set of five (down from a six-question draft), analytical rather than
  video-quoting: land allocation and the daughters' vulnerability under patrilineal
  inheritance, the narrator's dramatic tension and the boldness of their claim, the wider
  stakes for descendants and other heirs, who truly owns the land and makes the law (God,
  not Moses), and modern responsibility to care for land and the vulnerable as
  faithfulness to God. **Scripture expanded to Numbers 26:52–56; 27:1–11** (the
  land-by-lot passage sets up Q1); Contents `shortRef` is "Numbers 26–27". `scriptureText`
  now carries the full NRSVUE text (see below). Prayers left as-is pending a later
  final pass (Emily's call). The **"Orphan, Widow, and Stranger" 3MB optional video now
  appears under BOTH Hannah and Zelophehad** (Emily's call; Vimeo link still pending).
  Verified July 2026: 5 questions fit `.qs` with zero overflow; the longer reference sits
  on one header line.
- **Lesson 5 (Tamar) questions revised (July 2026)** — Emily's workshopped set of five
  (down from a six-question draft). Q1 carries the agrarian/levirate context and asks what
  motivates Judah's instruction to Onan and what Tamar is fighting for; then villains vs.
  protagonists and the narrator's framing of her trickery; the OT "courageous underdog /
  trickster" tradition and why it resonates; Onan's sin read through the levirate duty
  (Q4 cites Deut 25:5–10, steering readers away from the anachronistic
  "spilled-seed" misreading) plus God's care for the vulnerable and our duty of care; and
  an honest gut-check on finding theological meaning in a troubling text. **Prayers tuned
  this round** (opening kept; closing rewritten to add the care-for-the-vulnerable thread)
  — note this is ahead of the packet-wide prayer pass Emily still plans. **Two new
  `optionalReadings` on the Additional Resources page** (Emily's pick): "Rahab Hides the
  Spies" (Joshua 2) and "Abram and Sarai before Pharaoh" (Genesis 12:10–20), both tagged
  "Another trickster narrative" and linking to Bible Gateway NRSVUE. Adding
  `optionalReadings` also lights up Tamar's "More on this lesson" chip. Verified July 2026
  in Playwright: 5 questions fit with the closing prayer, scripture modal renders, and both
  reading cards show under Lesson 5 on the resources spread with no overflow.
- **Lesson 6 (Widow of Zarephath) questions revised (July 2026)** — Emily's workshopped
  set of five (down from a six-question draft). **Passage widened to 1 Kings 17:1–16**
  (was 17:8–16) so the ravens at v4 are in view, since Q1 pairs God's "I have commanded
  the ravens" (v4) with "I have commanded a widow" (v9) to probe what divine "command"
  means. Other beats: God entrusting the great prophet's survival to a powerless widow;
  the foreigner-faith reading (Zarephath in Sidon, Jezebel's Baal country) and how the
  narrator weighs faith against ethnic/national identity; hospitality-as-honor and how
  hosting Elijah meets the widow's needs beyond food; and a personal reliance-on-the-
  vulnerable question. **Verse-2 clarification:** the `scriptureText` reads "the word of
  the Lord came to him **[Elijah]**, saying" (bracketed editorial insertion; v1 ends on
  Elijah's speech to Ahab, so bare "him" was ambiguous). New **`optionalReading`**:
  "Jesus Recalls the Widow of Zarephath" (Luke 4:25–26, his Nazareth sermon), reinforcing
  the foreigner theme. Prayers left as-is for the packet-wide pass. Verified July 2026 in
  Playwright: 5 questions fit with the closing prayer; the modal shows all 16 verses with
  the "[Elijah]" clarification and the ravens; the Luke card renders under Lesson 6 with no
  resources-page overflow.
- **Tabs/titles use the women's names** (`tabRef`), not the scripture reference, which suits
  this packet; `shortRef` carries the reference on the Contents rows.
- **Scripture modals carry the full NRSVUE passage text** (added July 2026, fetched from
  Bible Gateway and formatted to the BBS `scriptureText` markup: `<h4>` sub-references,
  `<p>`/`<p class="poet">` with `<span class="vn">N</span>` verse numbers, smart quotes,
  Bible Gateway's thematic section headings dropped for the narrative passages). The modal
  footer shows the required NRSVUE notice ("Copyright © 2021 National Council of Churches")
  and links out to Bible Gateway via `scriptureUrl`. Lesson 4 combines two ranges under two
  `<h4>`s (Numbers 26:52–56 and 27:1–11). Verified July 2026 by opening each modal in the
  engine.
- **Headers: N/A** — every lesson is now full-page Canva art (`pageImages`), so the engine renders the art and draws no header slot; `headerImage` stays `null`.
- **Page-fit (tightened July 2026 after a real overflow shipped):** the packet
  overrides `.qs .q` (8px pad, 16.5px/1.4 text) and `.card p` (17px prayers) in its
  inline `<style>`. At the old sizes Hannah's five questions overflowed `.qs` by 45px —
  the overflow hides INSIDE `.qs` (content slides under the closing prayer, last
  question invisible) and does NOT show up as page-bottom overflow, so geometry checks
  must compare `qs.scrollHeight` vs `qs.clientHeight`, not just child bottoms.
- **Optional video** "Orphan, Widow, and Stranger" is stubbed on the Additional Resources
  page under **both Hannah and Zelophehad** (Emily to provide the Vimeo link).
- **Listed in `packets/index.json` (July 2026)** — Emily asked for it on the storefront
  for her own ease of review access from the landing page. This changes nothing about
  exposure (the packet URL was already public, same as BBS); nothing is *distributed* to
  users until Emily approves the content. Card: subtitle from `meta.tagline`, brown
  accent `#6d4f26`, `status:"live"` (a `"soon"` card renders dimmed with no link), and now
  a `pdf` key (the printable packet).
- **`content.js` synced to the Canva art (July 2026) — the flipbook/Canva is the source of
  truth.** The flipbook shows the art; `content.js` now exists only to feed the **PDF** + as
  the written record, so it was reconciled to match the art exactly: **prayers AND questions
  both synced to the current Canva wording** (e.g. Hannah Q3 reads the art's "not be raised at
  home," Q4 the art's "five children"; the Widow's questions are in the art's visual order —
  read-order from the Canva API is unreliable, so cross-check the rendered page). If Emily
  edits a lesson's text in Canva, re-sync `content.js` and re-cut the PDF so they stay matched.
- **Letter rewritten (July 2026)** to Emily's new copy (no pull-quotes now — `meta.letter.quotes`
  is `[]`, and both the engine `letterPage()` and the PDF generator skip the quotes block when
  it's empty). The letter is engine-drawn from `content.js`, so this updated the flipbook AND
  the PDF in one edit.

Pending: all six lessons' questions are now Emily-reviewed — remaining draft items are
the **letter** and a **packet-wide final prayer pass** (do not distribute links until
Emily signs off on the full content) · remaining Vimeo
`videoUrl`s (lesson 2 has its video; the rest, incl. "Background to the Exodus" and
the "Orphan, Widow, and Stranger" optional, still pending) · the printable PDF is **built**
(now **`tools/make_women_pdf.py`**; re-cut when videoUrls/content change) · wire the
Foxy/portal access (below).

**PDF re-cut in the BBS format — DONE (2026-08-17).** Emily asked for the Women printable packet to
follow the **same design/format as Beyond Bumper Stickers**, so `tools/make_women_pdf.py` is a sibling
of `tools/make_pdf.py` with the identical layout (no graph paper/icons/header art; thin page border,
outlined section boxes, Thierry question numbers, Hello-Handmade display + Mulish body; scripture
QR+link on every lesson, video QR+link when `videoUrl` is set else a "coming soon" note). **Only the
palette differs**, echoing this packet's own art the way the BBS PDF echoes its own: mustard **GOLD
`#B8860B`** where BBS uses red, brown **`#6D4F26`** where BBS uses smoky, navy body ink. It also adds
two things BBS doesn't need: the Additional Resources page **paginates** (this packet has 3 optional
videos + 4 optional readings = 2 pages), and it renders **`optionalReadings`** as well as
`optionalVideo`. **It supersedes `tools/make_women_pdf.js`** (kept only for reference). Output = 18
pages, verified with PyMuPDF for out-of-bounds AND overlapping text blocks (0 of each) and eyeballed
page by page. Cover embeds at full 1632x2112; the file is ~394KB (down from ~1MB) purely because the
fonts are now subset. **Read the font-instancing warning in the BBS PDF section above before re-cutting
anything.**

## Access / registration + portal model (packets)

Decided with Emily (July 2026; **infrastructure specified Aug 2026** — do not lose this
again). Packets are sold/registered through the SAME stack as the Foundry's existing
on-demand **courses**: **Foxy** checkout → **Zapier** automation → **Airtable** CRM +
**Mailchimp** list → **Webflow** customer portal (`candlerfoundry.emory.edu`) gated with
**Foxy show/hide**. The flipbook on Netlify itself has **no login or unlock code** — gating is
cosmetic and lives entirely in the portal. Existing on-demand template to clone:
`https://candlerfoundry.emory.edu/on-demand` (logged-in portal shows "My Courses" / "Account"
/ "Logout" tabs + a "My Certificates" panel).

**Unit of sale & pricing**
- The **whole packet** is one Foxy product (one-time, lifetime access) — never per-lesson.
- Packets currently ship as **free ($0) products**, but registration is still forced. The real
  goal is **capturing registrants into the Airtable CRM + Mailchimp list**, not preventing
  leakage (Emily plans to give many away). A free packet is just a $0 Foxy product.

**Foxy checkout — store `the-candler-foundry.foxycart.com`**
- Each packet has its own Foxy **cart URL, auto-generated by Airtable** (Airtable is the CRM
  and the source of these product URLs). URL params: `name`, `price`, `code` (product code),
  plus two hidden fields `h:course_title` and `h:course_code`. **`course_code` is the key the
  portal's show/hide logic keys off** to decide which packet(s) to reveal.
  - **Beyond Bumper Stickers** — code `SSS-BEYONDBUMPER`:
    `https://the-candler-foundry.foxycart.com/cart?name=Beyond%20Bumper%20Stickers&price=0&code=SSS-BEYONDBUMPER&h:course_title=Beyond%20Bumper%20Stickers&h:course_code=SSS-BEYONDBUMPER`
  - **The Gospel According to the Women** — code `SSS-GOSPELWOMEN`:
    `https://the-candler-foundry.foxycart.com/cart?name=The%20Gospel%20According%20to%20the%20Women&price=0&code=SSS-GOSPELWOMEN&h:course_title=The%20Gospel%20According%20to%20the%20Women&h:course_code=SSS-GOSPELWOMEN`
- On the site a **"Register / Get this packet" button links straight to the packet's Foxy URL**
  to check out. Foxy **forces account creation** (username + password) at checkout — that
  account is what the customer later uses to log into the portal.
- **Optional-donation checkout (Aug 2026):** a new Airtable **formula field "SSS Foxy Registration
  Link"** in `Course & OND Planner` mirrors the standard "Foxy Registration Link" formula but appends
  **`&category=SSS`** (exactly how "Partner Payment Link" appends `&category=Partner`). Resolves e.g.
  `…/cart?name=Beyond%20Bumper%20Stickers&price=0&code=SSS-BEYONDBUMPER&h:course_title=…&h:course_code=SSS-BEYONDBUMPER&category=SSS`.
  `category=SSS` is the signal for a **custom donation box** at checkout (packets are $0, donation
  optional — the **`SSS` category is created in Foxy**, `category=SSS` is the live checkout link, and
  the **custom donation box is BUILT + working (Aug 2026)**. The product **`code` stays `SSS-*`
  unchanged**, so the portal show/hide is unaffected. Implementation lives in Foxy's **new admin →
  Settings → Checkout → "Custom checkout fields"** box (both the field HTML AND a `<script>` go there
  — Foxy executes inline scripts from that box on checkout load), appended after the Candler-Alum +
  Organization fields. It **shows only when the cart holds an `SSS-` product** (JS scans
  `FC.json.items` code prefix; hidden on all course/cert checkouts); on "Add gift" (or Enter) it adds
  a Foxy line item `code=donation`, `category=SSS`, customer-set price, via unsigned `FC.client.request`
  cart links (works because "Prevent product link/form tampering" + CSP are both OFF). Adapted from
  Foxy's donation-on-checkout wiki snippet. **Markup gotcha (cost us a round):** mirror the existing
  fields' simple `.fc-form-group > .col-sm-8.col-sm-offset-3 > .fc-input-group-container` structure —
  a nested Bootstrap `col-xs-*` layout rendered only the label, not the input/button.

**Registration automation — CRM capture + welcome email + Mailchimp all DONE (Aug 2026).**
- **CRM capture already happens for SSS:** the existing generic Foxy→CRM automation creates a
  `CRM Data` record for SSS registrations too — confirmed by a real Aug 2026 $0 Gospel
  registration (`reckS2tCH2Nrzf4f8`): captured Email, Full Name, `Type of Program = "Sunday School
  Simplified"`, linked Course Code (→ the Gospel product rec), `Foxy ID`, `Amt Paid 0`. So **no new
  Zap is needed just to log the registrant.**
- **Welcome email — BUILT + LIVE (Aug 2026), via Zapier.** A Zap triggers on a new `CRM Data`
  record, **filters** to `Type of Program = "Sunday School Simplified"` AND `Welcome Email Sent`
  empty, sends the SSS welcome email, then sets `Welcome Email Sent` (dedupe). Email is warm/simple
  ("Sunday School Simplified" eyebrow, 3-step access, links to **`/customer-portal/my-lessons`** + the
  Account page for password reset, signed **"The Candler Foundry"** with the Foundry logo). Merge
  fields: `First Name`, `Course or Webinar Title`. Verified Aug 2026: email arrives + links work. The
  HTML lives in the Zap (not this repo).
- **Mailchimp — DONE (Aug 2026):** any new Foxy transaction pushes the registrant into Mailchimp
  (the core goal of registration = mailing-list capture). Wired store-wide, so SSS is covered.
- (Aside: each product's `Publish to Webflow` button fires a Zapier catch-hook, so Zapier is in the
  stack alongside Airtable automations.)

**Webflow customer portal (`candlerfoundry.emory.edu/customer-portal/*`) — HOW SHOW/HIDE
ACTUALLY WORKS (reverse-engineered from the live on-demand portal, Aug 2026).** The portal
pages embed Foxy's **`<foxy-customer-portal>`** web component (loader from `cdn-js.foxy.io`)
plus portal footer scripts. Gating uses **`foxy-logic-*` attributes** the component reads after
login: it injects a stylesheet that hides every gated element by default and reveals only the
ones whose condition matches the logged-in customer. Conditions seen live include
`foxy-logic-authenticated`, `foxy-logic-subscribed-to` (recurring), `foxy-logic-customer-
attribute-includes`, and — the one packets use — **`foxy-logic-transaction-includes="<PRODUCT
CODE>"`** (show iff the customer's purchase history contains that product code). Live example
from `/customer-portal/my-courses`: each course card is
`<div foxy-logic-transaction-includes="OND-RES0226">…</div>` whose link points to
`/on-demand-access/<slug>` (14 such gated cards on that page).
- **URL masking (decided Aug 2026): branded Webflow wrapper pages that iframe the flipbook.**
  The customer-facing URL must never expose `netlify.app`. Method mirrors the exec dashboard's
  embed (`<iframe src="https://candlerfoundry.netlify.app" style="width:100%;height:100vh;border:none;">`):
  a **Webflow folder `sss`** with **one subpage per packet**, each holding an
  HTML Embed of a full-width `100vh` borderless iframe pointing at the Netlify packet URL.
  Confirmed frame-safe — the Netlify packet pages send **no `X-Frame-Options`/CSP** (checked Aug
  2026). **LIVE + verified Aug 2026** (both render full-screen inside the frame, no site nav on
  these pages, so no `calc()` clip fix needed):
  - `candlerfoundry.emory.edu/sss/beyond-bumper-stickers`
    → iframes `…netlify.app/packets/beyond-bumper-stickers/`
  - `candlerfoundry.emory.edu/sss/gospel-according-to-the-women`
    → iframes `…netlify.app/packets/gospel-according-to-the-women/`
  A Webflow folder has no page of its own, so bare `/sss/` won't resolve unless an index page is
  added (optional future series-storefront slot). Note: the wrapper iframe `src` is fixed, so a
  branded per-lesson deep link (`/sss/<slug>?lesson=N`) does NOT pass through to the flipbook as-is
  — fine for My Lessons (links to packet home); if per-lesson links are ever needed in the welcome
  email, add a one-line script in the embed that appends `location.search` to the iframe `src`.
- **"My Lessons" portal tab — BUILT + LIVE (Aug 2026)** at
  `candlerfoundry.emory.edu/customer-portal/my-lessons`. Built by **duplicating the My Courses page**
  (to inherit the working `<foxy-customer-portal>` login + portal scripts + nav), then replacing its
  heading/intro/CMS card-grid with a **single HTML Embed**: a hero + intro + "Log in" helper line
  (→ `/customer-portal/account`) and **two gated cards** using the real packet covers, each with an
  **"Open the flipbook →"** button to the branded `/sss/<slug>` wrapper + a **"Download PDF"** button
  (netlify PDF, `download` attr).
  **Hero + intro — shared top, used on BOTH the My Lessons portal AND the public landing page (updated
  Aug 2026, Emily's final direction).** The top two sections are **Emily's own Canva artwork** (design
  `DAHRnlJvmA4`, "Sunday School Simplified Landing Page", **2 pages, each 2400×1000**), baked images she
  controls end-to-end:
    1. **Hero** = Canva page 1: "Sunday School, / *Simplified.*" over a discussion photo behind a white
       wash, "Take your Bible study to the next level with our FREE, no-prep lessons.", then a navy
       **READ SCRIPTURE | WATCH VIDEO | DISCUSS** bar. Hosted at `assets/sss-hero.jpg` (2000px progressive
       JPEG, ~210 KB). Displayed full-width with `border-radius:26px 26px 0 0`. Shared by both surfaces.
    2. **Intro band — two variants, one per surface** (both Canva page 2, on white, with the woodcut
       pointing-hand; "Log in / LOG IN" text is baked in, so a **transparent `<a>` hotspot** overlays it):
       - **Landing** = the current Canva page 2 "**Let's get started.**" — 3 register steps (1 Register for
         your FREE packet(s) · 2 Check your inbox · 3 Open packet — SIX lessons each) + "Already registered?
         **LOG IN**". Hosted at `assets/sss-landing-intro.png` (2000px PNG, ~355 KB). Hotspot ≈ left 52% /
         top 91% / w 9% / h 6.5% → `/customer-portal/account`.
       - **Portal (My Lessons)** = Canva **pages 3 & 4**. Page 3 = same hero, subtitle "Your lessons are
         ready. Let's learn!" → `assets/sss-portal-hero.jpg`. Page 4's band ("Emily's packets" + a woodcut
         **thumbs-up** + copy) is **rebuilt as LIVE HTML — NOT used as a baked image**, because the name has
         to personalize per customer: a heading `<span foxy-logic-display="customer-first-name"></span>&rsquo;s
         Packets` wrapped in `foxy-logic-authenticated="true"` (fallback "Your Packets" when `="false"`);
         live copy; a login line shown only when `foxy-logic-authenticated="false"`. The thumbs-up is cropped
         from page 4 → `assets/sss-thumbsup.png`. Building it live also kills page 4's big bottom whitespace
         (Emily's note) so the tiles sit right under the copy. **`foxy-logic-display` / `foxy-logic-authenticated`
         are built into `cdn-js.foxy.io/website-helpers@1/foxy-logic.js`, already loaded on the portal**
         (verified in source: `el.innerHTML = customerDetails.first_name`; supported display keys include
         `customer-first-name`, `customer-last-name`, `customer-email-address`, `customer-id`). No new script.
       - (Superseded portal band: the earlier "Start with a packet." `assets/sss-intro.png`.)
       (Canva design **`DAHRnlJvmA4` now has 7 pages** — the CURRENT landing/portal art is **pages 2–5**
       (2 = landing hero, 3 = landing intro, 4 = portal hero, 5 = portal intro); pages 1, 6, 7 are the old/superseded
       versions and are ignored. Re-measure any hotspot % and re-crop the hand whenever the art is re-exported.)

**UPDATE Aug 10 2026 — heroes reshaped to a wide/short band + landing full-bleed + Louize font fix (with Emily).**
- **Why:** on a wide monitor the old hero (2.4:1) looked either boxed (the 1180px `.sss-page` cap → big side gutters)
  or, at full width, *enormous* (793px tall). Emily reshaped the hero in Canva to a **wide/short band
  (2400×720 ≈ 3.33:1)** so it can run full-bleed without being tall.
- **New assets hosted** (from Canva `DAHRnlJvmA4`, exported via the connector → optimized with PIL → pushed via Git
  Data API → byte-verified): `assets/sss-hero-v2.jpg` (2000×600 landing hero, ~120KB),
  `assets/sss-landing-intro-v2.png` (2000×833), `assets/sss-portal-hero-v2.jpg` (2000×600 portal hero),
  `assets/sss-portal-intro-v2.png` (2000×667). The old `sss-hero.jpg` / `sss-landing-intro.png` / `sss-portal-hero.jpg`
  remain on disk but are superseded. **Landing hero subtitle copy changed** to "Make Bible study easy and fun with our
  FREE, no-prep lessons." (baked into the new image); the READ|WATCH|DISCUSS bar is now short-form.
- **Landing embed changes (Webflow HTML Embed `<style>` on the landing page):** point the hero `<img>` at
  `sss-hero-v2.jpg` and the intro `<img>` at `sss-landing-intro-v2.png`; set `.sss-page{max-width:none}` (full-bleed)
  and add `.sss-packets{max-width:1200px;margin:0 auto}` so the register tiles stay readable while the art bands go
  edge-to-edge. Verified live via Chrome preview Aug 10 2026.
- **FONT FIX (both embeds).** Louize IS uploaded to Webflow, but its family name there is **`Louize 205 Tf`** (weight
  **400 only**, normal + italic — NO bold). The embeds' `--louize` var asked for `"Louize"` → no match → fell back to
  Palatino/Georgia (the "wrong font" Emily saw). Fix: change `--louize`'s first value to `"Louize 205 Tf"`.
  **`--avenir` (body) is left EXACTLY as-is** — Emily only wanted the fallback serif replaced with real Louize, not body
  text changed. If bold Louize headings are ever wanted, upload the bold weight file to Webflow.
- **PORTAL CAVEAT — do NOT bake Canva page 5 as a flat image.** Page 5 (portal intro) has **"Emily" baked into the
  heading** plus baked "LOG IN"/"HERE" links; as an image it would show "Emily" to every customer and kill per-customer
  personalization. The portal band MUST stay **LIVE HTML** (`foxy-logic-display="customer-first-name"`, see
  [[reference-foxy-logic-display]]). The portal HERO (page 4 → `sss-portal-hero-v2.jpg`) is fine to swap.
- **PORTAL BAND — Option A rebuilt as live HTML (code delivered Aug 10 2026; Emily to paste + publish).** The My Lessons
  band (`.pl-band`) was rebuilt to Canva page-5's new design, still live/personalized. Structure: `.pl-hand` (reuses the
  existing `assets/sss-thumbsup.png`) + `.pl-text` → `h2.pl-greeting` (authenticated: `<span foxy-logic-display=
  "customer-first-name"></span>, let's get started.` / fallback `Let's get started.`), `p.pl-copy` ("Your lessons are
  below. Access the online packet, or download and print a PDF copy."), and **two** helper lines: `span.pl-login`
  [gated `foxy-logic-authenticated="false"`] lock-icon "Don't see your lessons? **Log in** (→ `/customer-portal/account`)
  and try again." + a NEW `span.pl-browse` [ungated] arrow-icon "Need more? Browse available lessons **here**
  (→ `/sunday-school-simplified`)." New CSS added for `.pl-browse` (mirrors `.pl-login` but `display:flex` so the two
  lines stack). The portal embed also gets the SAME landing edits: hero `sss-portal-hero.jpg`→`-v2`, `--louize`→
  `"Louize 205 Tf"`, `.sss-page{max-width:none}`, `.sss-packets{max-width:1200px;margin:0 auto}`. Verified in Chrome
  (logged-out fallback state) Aug 10 2026; the personalized name only fills in for a logged-in customer.
  Both exported via the Canva connector (`export-design` PNG, per-page) → verified (PNG signature + full
  PIL decode) → optimized locally → pushed; never the Dropbox mount.
  **The packet tiles BELOW the intro are live HTML** (built in the Webflow embed, not this repo): a white
  card, cover on a tint wash (blue `#f0f8ff` + navy left rule for BBS; butter `#fff7d2` + gold rule for
  Women), then eyebrow / title / desc / **two pill buttons**. **Fonts (Emily's pick): titles = "Louize"
  (serif); all other text = "Avenir Next Arabic Light".** Both are COMMERCIAL fonts not on Google — they
  must be added to the Webflow project (Louize self-hosted webfont files under her license; Avenir Next
  Arabic via Adobe Fonts or upload). Mockups fall back to Palatino/Georgia (serif) + a light system sans.
  (Superseded, left unused: `assets/sss-hero-banner.jpg`, `assets/sss-hero-photo.jpg` — earlier hero attempts.)
  **Landing vs portal differ in the tiles:** **landing** = ungated, two buttons — **"Register for free →"**
  (→ `category=SSS` Foxy checkout) + **"Learn more"** which opens a **self-contained JS pop-out modal**
  (`.sss-modal`; scrim/×/Esc close, `document.documentElement.overflow` locked) listing the packet's six
  lessons + a Register CTA — works inside a Webflow HTML Embed (inline `<script>` runs there). **Portal** =
  `foxy-logic-transaction-includes` gating + "Open the flipbook" / "Download PDF". Gates:
  `<div foxy-logic-transaction-includes="SSS-BEYONDBUMPER">…</div>` and `SSS-GOSPELWOMEN`; gate value =
  Foxy product `code` (= Airtable "Course Code" = the `code`/`h:course_code` in the checkout URL).
  "My Lessons" added to the shared portal nav. The embed lives in **Webflow only** (not this repo) — if
  it needs editing, it's the HTML Embed on that page. **Reveal not yet proven with a real logged-in
  registrant — pending the $0 test (see below).** All downstream links (portal cards, welcome email)
  use the branded `/sss/` URLs; the flipbook's `index.html` is the public **storefront**.
- Building it needs **Webflow Designer** access (new page + nav link + the portal embed); the
  show/hide itself is just those attributes — no custom JavaScript required.

**UPDATE Aug 11 2026 — public landing page rebuilt as THREE stacked image sections (with Emily).**
The `/sunday-school-simplified` front door is now three full-width **flat-image bands** exported from
Canva `DAHRnlJvmA4` (**slides 5, 6, 7**), each pasted into its **own Webflow HTML Embed** so Emily controls
the padding between them.
- **Hosted in-repo, served from Netlify** (`sundayschoolsimplified.netlify.app`):
  `assets/sss-landing-hero.png` (2400×720, slide 5 hero), `assets/sss-landing-getstarted.png`
  (2400×1000, slide 6 "Let's get started"), `assets/sss-landing-packets.png` (2400×1200, slide 7
  "Choose Your Packet"). Re-push the SAME filenames whenever the Canva slides change; Netlify redeploys.
- **Three separate embeds, NOT one** — for independent padding, per-section background (Emily's
  INTENTIONAL white / white / powder-blue, to differentiate the sections), and % hotspots that stay
  relative to each image's own box. Each embed carries a **faint top divider**
  (`border-top:1px solid rgba(10,39,76,.15)`) — which also separates the hero from the white nav bar.
- **Type is baked into the images** (Emily's chunky display face, deliberately unified with the
  packet-cover lettering), so **no Webflow font upload is needed** for this landing; `alt` text carries
  the copy for SEO / screen readers.
- **Hotspots = invisible `<a>`/`<button>` overlays sized in %** (measured + overlay-verified):
  slide 6 **LOG IN → `/customer-portal/account`**; slide 7 **Register-Free → the `category=SSS` Foxy
  checkout URLs**; slide 7 **Learn More → a self-contained JS pop-out modal** listing that packet's six
  lessons + a Register CTA. **Learn More must NOT open the flipbook** — that would let visitors read the
  whole packet without registering and defeats the capture goal (Emily, Aug 11 2026).
- Paste-ready code delivered to Emily (`webflow-sss-embeds.html`). The **BBS cover still reads soft** in
  slide 7's tile — re-export per the known-issue note in Packet #1 above.

**Where the CRM machinery already lives (Aug 2026 — this is a CLONE of the existing course
flow, not a from-scratch build).** Airtable base **"Candler Foundry: Master CRM"**
(`appiL0Z2RilcAT2Cw`):
- **`Course & OND Planner`** (`tblQNAsrQcdnM8UZC`) = the product catalog. It **auto-generates
  every Foxy link** (`Foxy Registration Link` free/$0, plus `+CEU` $25, `Partner`,
  `Certificates Only`, `On-Demand` category variants) and has a **`Publish to Webflow`** button
  that fires an existing Zapier catch-hook (`hooks.zapier.com/hooks/catch/13043534/u8jkfsc`) to
  push the item into the Webflow CMS. Both packets are already rows here (view **"Sunday School
  Simplified Packets"**, `Type = "Sunday School Simplified"`): **Beyond Bumper Stickers**
  `recod9vr0DJcECFDO` and **The Gospel According to the Women** `recbbdhjeOJAxvFs6`. Both are
  `Status: "Draft - Confirmed"` and **not yet published** (`Automated: Item Sent > Webflow? = No`).
- **`CRM Data`** (`tbldN1Ak4SHS41PvM`) = registrants. Foxy checkout populates it (`Email`,
  `Course Code - DO NOT MODIFY`, `Foxy ID`, `Foxy Category`), and it drives the welcome email
  (`Welcome Email Sent` / `Manual Send of Welcome Email`) and Mailchimp (`Mailchimp Export`
  view). Whether the existing Foxy→CRM Zap is generic on `course_code` (so packets are
  auto-captured) or per-product is the first thing to verify.

**Status (Aug 2026) — the registration → access loop is LIVE and verified end-to-end for BOTH
packets:** register → Foxy account created → `CRM Data` record auto-created → welcome email →
portal **My Lessons** reveals the purchased packet → branded `/sss` flipbook + printable PDF.
DONE: branded `/sss` wrapper URLs · My Lessons tab (facelifted, gated, nav link on all portal
pages) · SSS Foxy formula + **`SSS` category created in Foxy** + `category=SSS` checkout URL ·
welcome-email Zap · **Mailchimp** (store-wide, any Foxy txn → Mailchimp) · **custom donation box**
at checkout (SSS-only optional gift; see the Foxy checkout section above). **Remaining:**
- **Landing page + logged-in My Lessons UI — DESIGNED + CODE DELIVERED (Aug 7 2026).** Full
  paste-ready Webflow HTML-embed code exists for BOTH the **public landing/register page** and the
  **logged-in My Lessons portal**, built from Emily's Canva design `DAHRnlJvmA4` (see the "Hero + intro"
  block under My Lessons above for the whole asset map + how it works). **Remaining for Emily/Webflow:**
  paste the embeds, **add the Louize + Avenir Next Arabic fonts to the Webflow project** (or it falls
  back to Palatino/Georgia + system sans), verify the "Log in" hotspot % on the live page, and Publish.
  Do NOT publicly promote until packet content is finalized (below).
- **Executive dashboard hand-off** — rewire the **"Sunday School Simplified" card on the Executive
  BI / Impact Dashboard** (repo `candlerfoundry/executive-bi-dashboard`, `candlerfoundry.netlify.app`)
  so its flip-side keys to these lessons (the My Lessons portal / the `/sss` flipbooks). Approach TBD;
  **now scheduled — see "Next session (Monday)" below.**
- **Not doing:** listing packets in the Webflow course catalog (the `Publish to Webflow` step) —
  decided against for SSS (Aug 2026).
Upgrade path if leakage ever matters (not built): a Netlify Edge Function checking a Foxy JWT +
per-product entitlement.

## Next session — Monday 2026-08-10 (START HERE)

Priorities set by Emily on 2026-08-07 (she'll open a fresh chat). Do them in this order.
Cross-cutting rules: **GitHub `main` is source of truth**; author in a native temp dir, `node --check`
any JS, push via the Git Data API, verify byte parity. **Re-cut the affected PDF and re-verify with
Playwright screenshots after any content change.** Remember the split brains: **Women packet's VISIBLE
flipbook pages are Canva art** (`pageImages`, Canva design `DAHOtl4BNMk`, pages 8–19) — `content.js` is
only the PDF source + written record; **BBS is engine-rendered from `content.js`** so editing it changes
the flipbook AND the PDF.

1. **TOP PRIORITY — clean up the copy of the flipbooks and PDFs** (both packets, lesson by lesson:
   prayers, questions, scripture intros, letter, tile/packet descriptions; fix typos).
   - **Beyond Bumper Stickers:** edit `packets/beyond-bumper-stickers/content.js` → updates the flipbook
     AND is the PDF source → re-run **`tools/make_pdf.py`** (reportlab). Known open item: lesson 4 header
     **art reads "Through Christ" but `title`/TOC say "Through Him"** — decide one and make them match
     (art fix = re-export the header image; text fix = `content.js`).
   - **Gospel According to the Women:** the visible flipbook copy is in **Canva `DAHOtl4BNMk`** — to change
     what readers see, edit Canva → `export-design` the affected page(s) → verify PNG sig + `IEND` + PIL
     decode → **re-measure the scripture/video hotspots** → push to `packets/gospel-according-to-the-women/assets/pages/`.
     Also reconcile `content.js` to match, then re-run **`tools/make_women_pdf.js`** (playwright-core HTML→PDF)
     so the PDF matches. (Its letter + a packet-wide prayer pass were the last known draft items.)
   - Tidy the landing/portal **Canva slide-4 typo** ("below Perfect for groups" → add the period) in Canva
     `DAHRnlJvmA4` if that art is reused; the live portal HTML already reads correctly.

2. **Clean up the URL folders on Webflow.** **Plan set Aug 10 2026 (with Emily):** the
   **landing/register page moves OUT of the `sss` folder to top-level `/sunday-school-simplified`** —
   Webflow folders can't have an index page of their own, which is exactly why the landing was awkwardly
   nested at `/sss/sunday-school-simplified`. Top-level makes it the clean public front door. It's
   **behind a password wall for now** — re-confirm the per-page PW survives the move (Webflow page
   passwords are per-page; folder-level passwords are separate). The **two flipbook wrappers STAY in the
   `sss` folder** — `/sss/beyond-bumper-stickers` and `/sss/gospel-according-to-the-women` (each an
   HTML-embed `100vh` iframe of the Netlify packet) — because the welcome-email Zap, the My Lessons portal
   tiles, and the exec-dashboard card already link there; renaming the folder would 404 all of them for no
   user-visible gain (visitors never type flipbook URLs — they arrive via the portal/register/email links).
   Make sure the landing "Register" + portal "Open the flipbook" links point at the final URLs.
   - **DEFERRED — Emily to do later (added Aug 10 2026, she explicitly deferred it):** add a **301 redirect
     `/sss` → `/sunday-school-simplified`** (Webflow → Project Settings → Publishing → 301 Redirects, then
     republish) so a trimmed `/sss` folder URL lands on the front door instead of Webflow's 404 (the folder
     has no index page). Optional insurance, not blocking the reorg.
   - (Reminder: the wrapper iframe `src` is fixed, so `/sss/<slug>?lesson=N` deep links don't pass through
     unless a one-line script appends `location.search` to the iframe `src`.)

3. **Update the Additional Resources sections** (both flipbooks + PDFs). The Additional Resources spread
   is **engine-rendered from `content.js`** (`optionalVideo` + `optionalReadings`) for BOTH packets — even
   the Women packet (only its lesson pages are Canva art, not the resources spread). So edit `content.js`
   → re-cut the PDF. Still-pending inputs: several **Vimeo `optionalVideo` links** (e.g. "Orphan, Widow,
   and Stranger" under Hannah + Zelophehad; "Background to the Exodus"). Ask Emily what to add/refresh.

4. **LOWER — rewire the Executive dashboard SSS card to the flipbooks.** Repo
   `candlerfoundry/executive-bi-dashboard` (local `C:\Scripts\executive-bi-dashboard`, prod
   `candlerfoundry.netlify.app`) — **read its `CANONICAL.md` first**; separate repo + push flow. The
   "Sunday School Simplified" offering card currently maps to the `graphic-1-reader-presenter.png`
   vignette (~`index.html` line 10406) and there's an `assets/Sunday School Simplified/` folder. Rewire
   its flip-side / links to point at the **My Lessons portal** and/or the branded `/sss/<slug>` flipbooks.
   Approach TBD.

Memory (Cowork) also carries this: `project-sss-landing-portal` + `reference-foxy-logic-display`.

## The PDF (secondary, print-friendly product)

**Rebuilt July 2026** in the binder-era design (generator: `tools/make_pdf.py`, which
documents the full re-cut procedure). US Letter, 17 pages: full-color cover, ink-light
interior (white bg, navy text, outlined boxes, red hand-drawn icons), letter, contents
(+rhythm strip), two pages per lesson with Emily's header art, additional resources,
Foundry end page with NRSVUE attribution. Each lesson: **scripture = hyperlink + QR to
the exact Bible Gateway NRSVUE passage**; **video = Vimeo link + QR when
`videoUrl`/`optionalVideo.url` is set, otherwise a "coming soon" note with no QR**
(Emily prefers Vimeo links over flipbook deep-links in print). **Re-cut the PDF when
the Vimeo URLs land in content.js.** The engine's `?lesson=N` deep links remain
available for sharing even though the PDF no longer uses them.

**The Gospel According to the Women PDF — built July 2026** (`The Gospel According to the
Women.pdf`, 17 pages). Same ink-light, print-friendly philosophy, but a **separate
generator** (`tools/make_women_pdf.js`) because this packet has the mustard/brown facelift
and extra fields. It's an **HTML-to-PDF** pipeline (a print-optimized page rendered by
headless Chromium via `playwright-core` + `qrcode`) rather than BBS's reportlab — no font
conversion needed, reuses the packet's own webfonts (Hello Handmade / Mulish) and palette
(gold `#B8860B` headings, brown `#6d4f26` ink, white pages). Full-color Canva cover; clean
text lesson headers (the flipbook's headers are baked into the full-page art, so the PDF
draws its own eyebrow + gold title + reference + rule); QR+link scripture (Bible Gateway
NRSVUE) and videos; `funFact` "Did you know?" notes; Additional Resources cards for
`optionalVideo`/`optionalReadings`. Content comes straight from `content.js`, which is kept
synced to the Canva art (prayers + questions + letter), so the **PDF matches the flipbook**.
**Re-cut when the art/content or videoUrls change** (procedure in the script header). Only
lesson 2 currently has a live Vimeo QR; the rest show "coming soon."

## Adding a new packet

1. `cp -r packets/beyond-bumper-stickers packets/<new-slug>`; replace `content.js`,
   `assets/`, and the PDF.
2. Add an entry to `packets/index.json`.
3. Push to `main`; Netlify redeploys and the packet appears at `/<new-slug>/`.

Engine files never change when adding a packet.

## Local development

Pure static — serve the repo root (`python -m http.server`) and open `/`.

