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
- Serve the repo root (`python3 -m http.server`) and screenshot **every spread at two
  viewports** (e.g. 1536x816 and 1920x1080), plus interaction checks: scripture-card
  click must open the modal **without flipping the page**, tab clicks must jump to the
  right spread. Actually READ the screenshots — measure with `getBoundingClientRect`
  when something looks off; don't guess from theory.
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
  (plus arrow keys / edge arrows). No "page N of M" pill. Tab rail is 132px wide;
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
- **Download:** a fixed vertical red **ribbon** docked to the right viewport edge
  ("Download Printable Packet"), OUTSIDE the book. Its font/padding are `clamp()`ed on
  `vh` and it's capped at `max-height:calc(50vh - 62px)` so it can never reach the
  mid-height nav arrow on short laptop windows. The fit formula reserves nothing at the
  bottom: scale = min((vw-130)/(68+1632+132), (vh-24)/1056).
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
  the Women) keeps the navy chrome but sets `--powder` to pale yellow, `--smoky`/`--red`
  to brown, warms the neutrals, recolors the section-icon SVGs (packet-local copies under
  the packet's `assets/icons/`), makes the download ribbon bright yellow, and tightens
  `.qs .q` spacing so long question sets fit.
- **Type:** **Thierry Leonie** (display numerals), **Mulish** (body; upsized ~10% vs the
  old layout for readability/accessibility — body 18-19px), **Hello-Handmade Sans**
  (handmade display: letter heading, TOC title, tab numerals, fallback lesson titles).
  Thierry + Hello-Handmade via `@font-face` from `engine/assets/fonts/`; Mulish + Font
  Awesome from CDN.
- **Section icons:** Emily's **hand-drawn SVG icons in brand red** inside the powder
  circles (`engine/assets/icons/icon-*.svg`, single-path recolorable — prayer hands =
  Opening Prayer, open book = Scripture, play = Watch, dialogue bubble = Questions,
  heart = Closing Prayer). Font Awesome still supplies chrome glyphs (tabs, ribbon,
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
           questions: [ ... ] } // 5-6 strings
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

- **Palette (navy binder, warm interior):** keeps the shared engine's navy chrome; the rest
  is re-skinned via CSS-variable overrides (see "Per-packet theming"): pale-yellow
  `#FFF59C` circles, brown `#6d4f26` accents (rules, verse numbers, recolored section icons,
  header sparks), warm cream cards/stage, a **bright-yellow download ribbon** (`#FFD21E`,
  navy text — Emily wants it to grab the eye), and soft-khaki video "hills" (kept out of
  olive — an earlier olive-green chrome read muddy against the yellow cover and was dropped
  in favor of navy). Cover is Emily's Canva cover (`assets/cover.png`, 1632×2112,
  gold-on-yellow, integrity-verified).
- **Lesson 1 (Hannah) questions are FINAL** — exactly Emily's five, with one edit she
  approved (Samuel "raised at the sanctuary, not at home with Hannah" — the earlier draft
  said "the temple," anachronistic here). Lessons 3–6 questions, the letter, and the
  remaining prayers are **first drafts pending Emily's review** (Shiphrah & Puah next).
- **Lesson 2 (Eve) is FINAL (July 2026)** — rebuilt around Emily's "honest context"
  approach: no feminist gloss on Gen 3:16 (the video's "rule with/alongside" preposition
  claim doesn't survive scrutiny — `mashal` + *bet* means "rule over" everywhere it
  occurs); instead the questions teach etiology, name the writers' patriarchal world
  plainly, confront the video-vs-translations tension directly (trust > tidiness), and
  end redemptively (God near; *khavvah* = "life"). Scope broadened to the whole Eden
  narrative (**Genesis 2:4–3:24**, `shortRef` "Genesis 2–3"). Eve's prayers retuned to
  match. Extras: `funFact` (no apple/Satan/"sin" in Genesis), `optionalVideo` stub
  ("Genesis" 3-Minute Bible, Vimeo link pending), and two `optionalReadings`
  (Bible Odyssey "Eve"; Yale Bible Study "Genesis" — both free-access, links only).
- **Tabs/titles use the women's names** (`tabRef`), not the scripture reference, which suits
  this packet; `shortRef` carries the reference on the Contents rows.
- **Scripture modals are intentionally empty** for now — the pop-out links to the
  authoritative NRSVUE on Bible Gateway (with attribution) via `scriptureUrl`, so nothing is
  misquoted; full vetted passage text will be dropped in later (as BBS got its text).
- **Headers are engine-drawn** (`headerImage: null`) — no per-lesson art yet.
- **Page-fit:** the packet slightly tightens question spacing (`.qs .q` overrides) so long
  question sets (e.g. Hannah's five) never collide with the closing prayer.
- **Optional video** "Orphan, Widow, and Stranger" is stubbed on the Additional Resources
  page under Hannah (Emily to provide the Vimeo link).
- **Listed in `packets/index.json` (July 2026)** — Emily asked for it on the storefront
  for her own ease of review access from the landing page. This changes nothing about
  exposure (the packet URL was already public, same as BBS); nothing is *distributed* to
  users until Emily approves the content. Card: subtitle from `meta.tagline`, brown
  accent `#6d4f26`, `status:"live"` (a `"soon"` card renders dimmed with no link), no
  `pdf` key yet.

Pending: Shiphrah & Puah→Widow question approval (lessons 3–6 are DRAFT — do not
distribute links until approved) · full NRSVUE passage text · Vimeo `videoUrl`s
(including the "Genesis" optional video) · optional per-lesson header art · the PDF
(secondary; note `tools/make_pdf.py` predates `optionalReadings`/`funFact` and will
need those added at re-cut time) · wire the Foxy/portal access (below).

## Access / paywall model (packets)

Agreed with Emily (July 2026) for selling packets, mirroring The Candler Foundry's existing
on-demand **courses** flow (Foxy + Webflow customer portal):

- **Unit of sale:** the **whole packet** — one Foxy product, one-time purchase, lifetime
  access. Not per-lesson.
- **Registration is required at checkout** (Foxy forces account creation). The real goal is
  capturing buyers onto the **mailing list**; Emily is not worried about lesson
  leakage/forwarding and plans to give many away — a **free lesson = a $0 Foxy product** that
  still forces registration.
- **Gating is cosmetic**, handled entirely by the **existing Foxy customer portal +
  show/hide** on Webflow — the flipbook itself has **no login/unlock code**. After purchase, a
  welcome email links to the portal (and directly to the packet); the portal's "My Lessons"
  tab reveals the purchased packet via Foxy show/hide, linking out to the Netlify flipbook.
- **URLs:** one packet URL plus six per-lesson deep links (`?lesson=N`) for the portal cards
  and welcome email. The series landing page (`index.html`) is the public **storefront**; the
  lessons are reached via the links Emily distributes.
- Packet #1 (Beyond Bumper Stickers) is to move behind the same portal gate.
- If leakage ever becomes a real concern, the upgrade path (not built) is a real edge-function
  gate (Foxy JWT + per-product entitlement check), e.g. via a Netlify Edge Function.

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

## Adding a new packet

1. `cp -r packets/beyond-bumper-stickers packets/<new-slug>`; replace `content.js`,
   `assets/`, and the PDF.
2. Add an entry to `packets/index.json`.
3. Push to `main`; Netlify redeploys and the packet appears at `/<new-slug>/`.

Engine files never change when adding a packet.

## Local development

Pure static — serve the repo root (`python -m http.server`) and open `/`.
