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
  a tethered label, the tab reads as part of the binder). It's a real `<a ... download>`
  styled as a `.tab.download`, rendered by the engine only when the packet ships a PDF
  (`meta.pdf`); the click handler skips it so the browser handles the download. Colored via
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

- **All six lessons' discussion questions are FINAL** (Emily's approved wording).
- **Scripture text is in place (NRSVUE)** and opens in the popout modal.
- **Cover** is Emily's FINAL Canva cover (`assets/cover.png`, 1632x2112, tagline
  "Scripture That Sticks", July 2026).
- **Binder design shipped** (July 2026). Lesson 1 uses Emily's header art; lessons 2-6 use the engine-drawn header until art arrives.

**Pending inputs from Emily:**
- **Vimeo `videoUrl`s** per lesson (a few weeks out; the 3-Minute Bible MP4s are ~408 MB,
  so they must embed from Vimeo, not self-host).
- ~~Header art~~ **DONE July 2026** — all six lessons use Emily's art
  (`assets/headers/lesson-0N.png`, 1632x560, integrity-verified). Note: lesson 4's art
  reads "Through Christ" while `title`/TOC say "Through Him" (flagged to Emily).
- **Hand-drawn red section icons approved and shipped** (July 2026).
- **New back cover** in the blue design (optional — back page currently dropped).
- **PDF re-cut with Vimeo links** once videoUrls exist (current PDF shipped July 2026
  with "coming soon" video notes; see The PDF section).

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
- **All six lessons now render from Emily's own Canva art (July 2026).** Emily reworked every lesson's two pages herself in Canva (she was unhappy with the engine-drawn variant-B layouts), and all six are now in via the image-based mechanism above: `assets/pages/<slug>-a.png` + `-b.png` (1632×2112, exported through the Canva connector from design `DAHOtl4BNMk` pages 8–19 — hannah 8–9, two-daughters 10–11, shiphrah-puah 12–13, zelophehad 14–15, tamar 16–17, widow 18–19). The layout is a shared template, so the **hotspots are identical across all six** (measured + overlay-verified July 2026): scripture `x 8.7 / y 48.06 / w 81.74 / h 7.05`, video `x 14.77 / y 62.5 / w 70.4 / h 31.06` (video box 1149×656 ≈ 16:9). **Re-measure the hotspots every time the art is re-exported** — detect the empty gold scripture box + the dark video rectangle (dark-pixel density projection, robust to the white “3 Minute Bible” text inside the box) and confirm with a drawn overlay before trusting the numbers. The art is authoritative **visually**; the `content.js` prayer/question fields remain the written record + PDF source and may differ from the art. **Only Lesson 2 (Two Daughters) has a live `videoUrl`** (`player.vimeo.com/video/1210281687`) — it plays in-frame with a ⭢ pop-out; the other five show their own “3 Minute Bible” placeholder until Vimeo links land, at which point the in-frame player + pop-out light up automatically. Four art typos were fixed in Canva before export (SHIPHRAH headline, “Jairus”, “how they deliberated”, “jars are empty”) plus Hannah’s “Nazirite” spelling; Hannah’s visible opening prayer now reads “Gracious God…”.
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
(`tools/make_women_pdf.js`; re-cut when videoUrls/content change) · wire the
Foxy/portal access (below).

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
  **Hero — shared "Sunday School, Simplified." component (updated Aug 2026), used on BOTH the My Lessons
  portal AND the public landing page.** Replaced the old navy-gradient hero at Emily's request. It is
  **live HTML/CSS text over a text-free background photo**, NOT a baked image, so copy edits, mobile
  wrapping, and accessibility all stay live: a serif headline "Sunday School, / *Simplified.*" + subtitle
  ("Free, no-prep, scholar-created lessons.") sit over the photo behind a left-to-right white gradient
  wash, above a navy **READ · WATCH · DISCUSS** bar, then a powder-blue **"Start with a packet"** intro
  box (pointing-hand manicule + copy + an "Already registered? Log in" line → `/customer-portal/account`),
  then the packet cards. **The hero photo is self-hosted** at `assets/sss-hero-photo.jpg` (a text-free
  crop of the Impact Dashboard discussion photo *Master Class Student Talking 5*, 2000×847 progressive
  JPEG, ~250 KB — cropped locally with PIL, never the Dropbox mount) and referenced as
  `https://sundayschoolsimplified.netlify.app/assets/sss-hero-photo.jpg`. Serif face = Iowan Old Style /
  Palatino / Book Antiqua / Georgia. (The earlier baked-text Canva banner `assets/sss-hero-banner.jpg`,
  design `DAHRnlJvmA4`, is **superseded** by this live-text version and left in the repo unused.) The
  design markup itself (styles + intro + manicule SVG) lives in the **Webflow HTML Embed**, not this repo
  — only the photo + covers are hosted here. **Landing vs portal differ only in the cards:** portal =
  `foxy-logic-transaction-includes` gating + "Open the flipbook" / "Download PDF"; landing = ungated +
  "Register / Get this packet" → the `category=SSS` Foxy checkout URLs. Gates:
  `<div foxy-logic-transaction-includes="SSS-BEYONDBUMPER">…</div>` and `SSS-GOSPELWOMEN`; gate value =
  Foxy product `code` (= Airtable "Course Code" = the `code`/`h:course_code` in the checkout URL).
  "My Lessons" added to the shared portal nav. The embed lives in **Webflow only** (not this repo) — if
  it needs editing, it's the HTML Embed on that page. **Reveal not yet proven with a real logged-in
  registrant — pending the $0 test (see below).** All downstream links (portal cards, welcome email)
  use the branded `/sss/` URLs; the flipbook's `index.html` is the public **storefront**.
- Building it needs **Webflow Designer** access (new page + nav link + the portal embed); the
  show/hide itself is just those attributes — no custom JavaScript required.

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
- **NEXT PRIORITY (start here) — build the Sunday School Simplified LANDING PAGE (Webflow).** There is
  currently **no public series landing/storefront page** for SSS — only the `/sss/*` wrapper pages that
  iframe the Netlify flipbooks. Build one on `candlerfoundry.emory.edu`, modeled on the `/on-demand`
  courses page: a series overview + a card per packet, each with a **"Register / Get this packet" CTA
  linking to that packet's `category=SSS` Foxy checkout URL** (from the SSS formula above). This is
  where the public **"Register" buttons** live. The build can start now; **do NOT publicly
  promote/distribute until Emily finalizes packet content** (packet #2 letter + prayer pass, Vimeo
  videos).
- **Executive dashboard hand-off** — rewire the **"Sunday School Simplified" card on the Executive
  BI / Impact Dashboard** (repo `candlerfoundry/executive-bi-dashboard`, `candlerfoundry.netlify.app`)
  so its flip-side keys to these lessons (the My Lessons portal / the `/sss` flipbooks). Approach TBD;
  tracked for later.
- **Not doing:** listing packets in the Webflow course catalog (the `Publish to Webflow` step) —
  decided against for SSS (Aug 2026).
Upgrade path if leakage ever matters (not built): a Netlify Edge Function checking a Foxy JWT +
per-product entitlement.

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

