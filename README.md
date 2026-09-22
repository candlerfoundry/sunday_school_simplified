# Sunday School Simplified — flipbook site

The *Sunday School Simplified* series from The Candler Foundry, published as **three
surfaces from one source**: the **flipbook** (tablet + desktop), the **phone reader**, and the
**printable PDF**. One shared **engine** powers every packet; each packet supplies only its own
`content.js` and assets. See **The Three Surfaces** below before changing anything — they have
different renderers and different rules.


---

> ## ▶ READ THIS FIRST — and note this is the *only* "read first" block in the file
>
> This README is the canonical source of truth: the surfaces, the schema, the rules and the
> workflow. **Read this block, the Standing Rules, and The Three Surfaces before you touch
> anything.**
>
> **Everything under `## History` at the bottom is a dated session log — context, not
> instructions.** It is kept because the *reasoning* behind a decision is usually worth more
> than the decision, but it is history: where it disagrees with the reference sections above
> it, the reference sections win. Do not treat an old "LATEST" heading as current.
>
> **Keep this file current.** Any push that changes a surface, the schema, the workflow or the
> status must update this README *in the same push*.
>
> (AI sessions: your "memory" files, if any, live in the assistant's own store — **not** in
> Dropbox and **not** in this repo. Don't hunt the Dropbox mount for canonical files.)

---

## ⚑ Standing rules — apply every session

**About the 3 Minute Bibles**

1. **Never refer to a 3MB by number alone.** Emily does not know them by number. Always write
   **`3MB-<code>` + the title** — "3MB-85, *Orphan, widow, stranger*". Questions, status
   updates, commit messages, anything she reads.
2. **Airtable is the authoritative list of which 3MBs exist** — base `appiL0Z2RilcAT2Cw`,
   table `tblS1Bk29cXyGGUdo`. Look it up before saying a video does or doesn't exist. Do not
   infer it from the Dropbox folder or from Vimeo; both are incomplete.
3. **Burned captions never start until BOTH the title card AND the name/intro card have
   cleared** (13–17s; Bonfiglio ≈15.5s, Arnold ≈17s). The silent opening is INTENTIONAL —
   never "fix" it, even for word studies. Detail: pipeline README §0/§4/§9.
4. **Vimeo auto-captions must be OFF on every upload.** Our captions are burned into the
   picture; Vimeo auto-generates its own track and marks it active, so a player draws **two
   sets at once**. One-time fix: **Vimeo Account settings → Upload defaults → uncheck "Allow
   viewers to enable automatically generated captions"**. Verify per video (**Languages**
   panel, or `GET /videos/<id>/texttracks` → `active: false`). ⚠ The Vimeo MCP can **read**
   text tracks but **not write** them. The embed parameters `texttrack=false` / `texttrack=0`
   do **not** work, and phone emulation cannot reproduce the bug. Detail: pipeline README §5a.

**About the code**

5. **Never add autoplay to a video embed in the phone reader.** iOS forces muted autoplay and
   Vimeo does not reliably offer an unmute control when it does — that is how lessons 1, 2 and
   6 ended up silent with no way back. With no autoplay the viewer's tap lands on Vimeo's own
   play button *inside* the iframe, which is a real user gesture, so sound always works. This
   looks like a free optimisation. It is not.
6. **Never route a phone at `/pdfview.html`.** It rasterises every page to its own canvas and
   keeps them all alive (~48–56MB). Phones link straight at the PDF file.
7. **PDFs never auto-download, and links inside them open in a new tab.** Serve with no
   `Content-Disposition`. On desktop, opening links in a new tab is what `/pdfview.html` is for.
8. **Line endings: `packets/*/content.js` are CRLF; everything else is LF.** There is no
   `.gitattributes`, and Emily's git has `core.autocrlf=true` globally, so a fresh clone can
   turn a 9-line edit into a 790-line whole-file rewrite. In any clone, set
   `core.autocrlf` to false first. Check endings **with Python** — reading the file with
   `newline=""` and counting carriage returns. The obvious `grep -c` one-liner for a carriage
   return silently degenerates to an empty pattern in Git Bash and reports **every** line as
   CRLF, which will send you chasing a problem that isn't there.
9. **When asking Emily a multiple-choice question, ask in plain chat** — the picker tool drops
   her free-text answers.

---

## Per-packet theming (added 2026-09-22)

**The reader is themed from the same place the flipbook is.** Each packet's own
`index.html` carries a `:root` block; the flipbook has always read it, and the reader now does
too via a set of `--mq-*` variables. **A new packet is themed the moment it declares them** —
there is nothing to change in the engine.

The `--mq-*` defaults in `engine/styles.css` reproduce **Beyond Bumper Stickers exactly**, so a
packet that declares nothing looks like BBS. BBS itself has no `:root` override at all.

Fetch colours, never invent them. The three authoritative sources, which agree:

| | Where |
| --- | --- |
| Flipbook palette | the packet's `index.html` `:root` |
| PDF palette | `tools/packet_pdf.py` -> `PALETTES` |
| Per-lesson accents | `content.js` `lesson.accent` (largely unused by the engine — a spare lever) |

**The Women reader is NOT simply the Women flipbook palette**, and the difference is deliberate:

- The page is plain **ivory `#FFFDF3`** (`--page`), *not* the flipbook's sand `--stage` `#EAE7CE`.
  Emily rejected the sand on a phone. Cards are white; the tan hairline separates them.
- Type is **brown `#6d4f26`** throughout. There is **no navy anywhere** in the Women reader,
  the Back button included.
- Lesson titles are **mustard gold `#B8860B`** — the same value as `packet_pdf.py`
  `PALETTES['women']['display']` and the flipbook's `--gold`.

### ⚠ Contrast is a real constraint in this palette, not a formality

Checked, and it decided three design choices:

| Pairing | Ratio | Consequence |
| --- | --- | --- |
| gold `#B8860B` on ivory | **3.19** | **large text ONLY.** Fine for the 34–42px lesson title. **Never reuse the gold at small sizes** — that is why the Optional Resources heading stays brown (`--mq-label`), not gold. |
| cream `#FDF3D8` on gold | **2.94** | **FAILS.** The packet's own comment calls `--cream` "text/icons on gold" — it is not safe at small sizes. |
| cream on olive / muted | 2.9–3.8 | all **fail**, which is why the resource chips are **uniform** pale gold with brown text: only brown clears 4.5:1 at 10.5px. The WORD distinguishes them, not the colour — which is the better practice anyway. |
| brown on ivory / white | 7.36 / 7.51 | body text |

### Two engine-level rules for every packet's reader

- **Never name the flipbook.** Someone on a phone has never seen it and never will, so
  mentioning it only raises a question the page cannot answer.
- The footer is the **Candler Foundry wordmark, MASKED not drawn**, linking to
  `https://candlerfoundry.emory.edu`. It takes its colour from `--mq-logo` (navy on BBS, brown on
  Women). Why masked: `candler-foundry-logo-black.png` is **PNG colour type 2 with no `tRNS`, i.e.
  no alpha at all** — it is an opaque rectangle — and `candler-foundry-logo.svg` is transparent but
  a hardcoded navy. Masking the SVG is the only way to get transparency *and* a per-packet tint from
  one asset. Without mask support the SVG paints directly; acceptable fallback.
- ⚠ **The hostname is `candlerfoundry.emory.edu` with NO `www`.** `www.candlerfoundry.emory.edu`
  has **no DNS record** — a link to it cannot resolve, anywhere, ever. It had been sitting in both
  flipbook footers as well; fixed 2026-09-22. Check any new link against DNS, not against habit.
- ⚠ **iOS Safari's bottom toolbar floats OVER the end of the document.** The last element on the
  page is visible but untappable — Emily hit this on the footer logo and the foot "Back to Lessons".
  `.mq` therefore ends with `padding-bottom: calc(96px + env(safe-area-inset-bottom,0px))`.
  **`env()` alone does nothing here**: it reports 0 unless the viewport meta carries
  `viewport-fit=cover`, which we deliberately do not set because it would also change the
  flipbook's layout. The fixed 96px is what actually does the work.

---

## The three surfaces

**One `content.js` per packet feeds three different products.** They are not responsive
variants of one another: different renderers, different constraints, different rules. Most
mistakes in this repo come from changing one and assuming the others followed.

| | **Flipbook** | **Phone reader** | **Printable PDF** |
|---|---|---|---|
| Who gets it | tablet + desktop | phones | anyone who taps the link |
| Built by | `engine/render.js` (page-flip) | `engine/render.js`, the `mq*` functions | `tools/packet_pdf.py` |
| Selected by | default | the phone gate (below) | user action |
| Layout | fixed Canva page art | reflowing text | fixed print pages |
| Weight | **~219MB decoded bitmap** | **~1.1MB** | 0.6–0.7MB file |
| Main video | pop-out modal | player rendered inline | link |
| Extras | accordion rows per lesson | "Optional Resources" panel | grouped by lesson |
| Scripture | pop-out modal | inline `<details>`, collapsed | printed in full |

### Surface 1 — the flipbook (tablet + desktop)

The original product and still the primary one. Page art is exported from Canva and drawn as
images; the engine overlays **hotspots** (percentage rectangles) for the scripture and video
taps. Because the pages are pictures, **the words on them are not editable here** — a wording
change means Emily re-exports the Canva page.

- **Canva page numbers MOVE.** Never trust a remembered page number; re-check before asking
  her to edit one.
- The video opens in a **modal**, deliberately, so the Vimeo preview chrome never shows.
- ~219MB of decoded bitmap is why phones cannot have this. **Tablets still carry it** —
  lazy-loading the images would cut it to roughly 40–60MB and is still not done.

### Surface 2 — the phone reader

Not a shrunken flipbook — a **different rendering of the same lesson** as real reflowing text:
opening prayer, passage, video, every discussion question, closing prayer, Optional Resources,
prev/next. Hash-routed (`#lesson-3`) so Back works and a lesson can be linked.

**The gate** — the shorter screen side under 540px, *and* a coarse pointer:

- **Not viewport width.** An iPhone 16 Pro Max in landscape is 956px wide; an iPad mini is
  744px. A width rule serves the flipbook to the phone and the reader to the iPad — backwards.
- The **shorter screen side** is a hardware property that does not change with rotation.
  Largest iPhone short side **440**; smallest iPad **744**. No device sits in the gap.
- It never reads the user agent, so **iPadOS claiming to be a Mac cannot fool it**.
- **Fails toward the flipbook.** Unreadable screen or no `matchMedia` → flipbook. Never gate a
  tablet.
- ⚠ **It must run before a single `<img>` exists**, and after the `var` helpers it uses.
  Building the pages and then hiding them still decodes all 219MB, so the crash survives — and
  placing it above `var esc = ...` leaves `esc` undefined, the gate throws, and **the page
  renders nothing at all**.

**Rules specific to this surface**

- **No autoplay, ever** (Standing Rule 5).
- **The PDF link points at the PDF file, not `/pdfview.html`** (Standing Rule 6).
- `html,body{height:100%}` + `body{overflow:hidden}` pin the page for the flipbook's fixed
  stage, so the reader marks **`<html>`** too (`.mqhtml`) or **it cannot scroll**. A body class
  alone cannot override a rule that also targets html.
- Optional Resources is deliberately **not** styled like the lesson — display face, dashed
  rule, page background, an explicit "not part of the lesson" line, and a type chip on every
  row. In the lesson's own font, people read it as part of the lesson.
- Extra videos open **in place**; art and readings link out, because they live on Wikimedia and
  Bible Gateway and there is nothing to embed.
- Every tap target at least 44px.

### Surface 3 — the printable PDF

Generated by `tools/packet_pdf.py` (fonts via `tools/prep_fonts.py`, regenerable). It is the
**written record**: for art-based lessons the titles, prayers and questions live in the Canva
art, but the same text stays in `content.js` precisely so the PDF can set it properly.

- **12pt Times is the type floor.** Do not go smaller to make something fit.
- Watch the **Mulish instancing trap** — un-instanced font copies render everything ExtraLight
  *without failing*.
- The PDF shares `cover.png` and the logo and needs **print resolution**: never downscale those
  originals. Only the lesson page PNGs are flipbook-only.
- **Never auto-download.**
- ⚠ `/pdfview.html`, the desktop viewer for this file, still rasterises **every page at once** —
  about 56MB on the Women packet. An old iPad is not obviously safe. Not yet fixed.

### Before you edit — which surface are you touching?

| Change | Flipbook | Phone reader | PDF |
|---|---|---|---|
| Wording inside Canva page art | re-export in Canva | **from `content.js`** | **from `content.js`** |
| Wording in `content.js` | only if not art-based | yes | yes, re-cut the PDF |
| A new or changed 3MB video | `videoUrl` | `videoUrl` | `videoUrl` |
| A new artwork or reading | accordion row | Optional Resources | resources page |
| Engine look or behaviour | `engine/*` | `engine/*` (the `mq*` functions) | not affected |
| Anything in `tools/packet_pdf.py` | not affected | not affected | re-cut both PDFs |

**A wording fix on an art-based lesson page is three jobs, not one**: a Canva re-export, plus a
`content.js` edit so the reader and the PDF agree. Do not assume one covers the others.

---

## Adding a new packet (the packet #3 runbook)

The engine is shared, so **a new packet gets the flipbook and the phone reader for free** the
moment its `content.js` exists. There is no separate "mobile version" to build — if someone
asks for one, it already exists. What a new packet actually needs:

1. `cp -r packets/gospel-according-to-the-women packets/<new-slug>` — copy the *newer* packet;
   it has `artwork` and `optionalReadings`, which Beyond Bumper Stickers does not.
2. **Replace `content.js`.** This is the real work, and it feeds all three surfaces. Follow the
   schema below exactly. Remember it is **CRLF** (Standing Rule 8).
3. **Assets in `packets/<slug>/assets/`:**
   - `cover.png` — full resolution, shared with the PDF, **never downscaled**.
   - **`cover-thumb.png` — 480px wide.** Easy to forget: the phone reader uses it *because* the
     real `cover.png` decodes to roughly 52MB. **Never point the reader at `cover.png`.**
   - lesson page art and header images as the packet needs.
4. **Add an entry to `packets/index.json`.**
5. **Cut the PDF** with `tools/packet_pdf.py`; verify the render with PyMuPDF.
6. **Wire the videos** — each lesson's `videoUrl`, plus `optionalVideos` for supplementals.
   Check Airtable for what exists (Standing Rule 2) and confirm new uploads have auto-captions
   off (Standing Rule 4).
7. **Push to `main`.** Netlify has no build step, so it is a pure file sync — live in 30–60s at
   `/packets/<new-slug>/`.
8. **Verify all three surfaces** before calling it done:
   - desktop → flipbook renders and the gate did **not** fire;
   - phone width with a coarse pointer → reader renders, **zero** flipbook images;
   - the PDF opens inline as `application/pdf` with **no** `Content-Disposition`.
9. **Update this README** in the same push.

Engine files should not need to change to add a packet. If you find yourself editing
`engine/*`, you are changing the *design*, which affects every packet — say so out loud.

---
## Where things stand (updated 2026-09-22)

The single current-status section. The per-packet sections further down carry the detail and
the history; **this block wins** if they disagree.

**Live on `sundayschoolsimplified.netlify.app`, all three surfaces, both packets:**

| | Beyond Bumper Stickers | The Gospel According to the Women |
|---|---|---|
| Flipbook | live, 6 lessons | live, 6 lessons |
| Phone reader | live | live |
| Printable PDF | live, 19pp | live, 22pp |
| Main 3MB per lesson | all 6 wired | all 6 wired |
| Supplemental resources | 7 optional videos | 8 optional videos, artwork, 3 readings |

The **phone reader shipped 2026-09-22**. Production immediately before that release was
**`54cf70c`** — reset `main` to it and push to roll back; there is no build step, so the old
site is back inside a minute.

### Open items

**Needs Emily**

- **Test an iPad.** It must show the **flipbook**. Never tested on hardware — she shipped first
  and is testing after, deliberately (phones were already broken, so the release could only
  improve them, and rollback is cheap). The arithmetic is sound — largest iPhone short side
  440, smallest iPad 744 — but that is not the same as what iPadOS reports. **If an iPad shows
  the reader, that is the bug.**
- **Two supplemental Vimeo videos still have auto-captions ON**: *What Happened During the
  Exile?* (`1219870379`, BBS L1) and **3MB-273, *What is khanun?*** (`1221254097`, Women L1).
  Every other video in both packets is off.
- **The Vimeo Upload-defaults checkbox** (Standing Rule 4) — stops this recurring.
- **Passage in the reader: collapsed or expanded by default?** Currently collapsed, so the
  questions are not buried under ~1,700 characters of scripture. Reversible either way.
- **The course/instructor flipbook's phone-block wording** — asked several times, still open.
  Wanted so both products say the same thing.

**Queued work — a "tablet health" pass**

Both of these are the same class of bug as the two already fixed on phones: eager bitmaps that
are never released. Deliberately *not* bundled with the phone release, so that a regression
would have an obvious cause.

- **Lazy-load the flipbook art.** Tablets still carry ~219MB; lazy-loading takes it to roughly
  40–60MB with no visual change. ⚠ Needs testing — the page-flip library may want dimensions up
  front.
- **`/pdfview.html` rasterises every page at once** (~56MB on the Women packet). Phones no
  longer touch it, but tablets and desktop still do.

**Also unshipped:** `assets/web/` screen derivatives (816w) were generated once and lost to a
scratchpad prune — **regenerate, don't hunt for them**.

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

**Traps that have actually cost time here — check these first (added 2026-08-17):**

- **Editing `content.js` — do NOT hand-edit or blind-rewrite it.** Parse the JSON out of
  `window.BBS_CONTENT = {...};` and re-emit through a **format-preserving serializer**, then assert the
  round-trip is **byte-identical BEFORE applying any change**. Do that and the diff contains only real
  edits. Gotcha: the two packets were hand-formatted **oppositely** — the Women file keeps
  `pageImages` / `hotspots` collapsed on one line, BBS keeps them expanded, and BBS keeps
  `meta.letter.quotes` multi-line — so the writer must sniff the original text per file. When sniffing,
  match **same-line** patterns (`[^\S
]*`, i.e. horizontal space only); a plain `\s*` spans newlines and
  will happily "detect" the expanded form as compact.
- **Re-measure the Women lesson hotspots after EVERY re-export**, and beware the detector trap: the
  outer **gold page frame** is itself a full-height gold rule, so a naive scan locks onto the page frame
  (x71/x1547) instead of the scripture box (x142/x1476). Filter out columns whose gold run spans the page,
  then take the rule-pair whose interior is empty. Also **the six pages are not identical** — the Widow's
  opening prayer is 3 lines instead of 5, so her boxes sit ~0.7% higher and she needs her own values.
  Always confirm with a drawn overlay before trusting numbers.
- **Verifying a PDF:** check with PyMuPDF for **both** out-of-bounds blocks **and overlapping** blocks —
  an overlap is how the end-page URL collision hid (nothing was outside the frame, two things were simply
  on top of each other). Then render every page and actually look at it.
- **Testing "the PDF opens in a pop-out":** headless Chromium has **no PDF viewer**, so *any* navigation
  to a PDF is reported as a **download**. That is a test artifact, not a bug. Prove the behaviour by
  intercepting `window.open` and asserting the URL, window name and feature string, plus
  `event.defaultPrevented`.
- **GitHub's blob endpoint 503s intermittently.** `POST /git/blobs` can return
  *"No server is currently available to service your request"* with no rate-limit headers, sometimes for
  many minutes on one file while other pushes succeed. Retry with backoff; if it stays down, fall back to
  the **Contents API** (`PUT /repos/.../contents/<path>` with the file's current `sha`), which is a
  different code path and has worked when Git Data was failing.
- **LINE ENDINGS: this repo is MIXED, and a global `core.autocrlf=true` will silently rewrite whole
  files (cost time 2026-09-04).** The two `packets/*/content.js` are stored **CRLF**; `README.md`,
  `engine/render.js`, `engine/styles.css`, `pdfview.html` and `tools/packet_pdf.py` are stored **LF**.
  There is no `.gitattributes` to enforce either. Emily's git has `core.autocrlf=true` globally, so a
  fresh clone checks everything out as CRLF and commits it back as LF - which turns a 9-line content
  edit into a 790-line whole-file diff and destroys the "the diff contains only real edits" guarantee.
  Also, Python's default text read gives you LF regardless, so writing the file back re-flattens it.
  **Do this:** `git config core.autocrlf false` in the clone, and after editing any text file, compare
  its line-ending style against `git cat-file -p HEAD:<path>` and restore it byte-for-byte. Then
  `git diff --stat` should show single-digit line counts for a small edit. If it shows the whole file,
  STOP - `git diff --ignore-cr-at-eol --stat` will confirm the noise is line endings, and you must fix
  it before committing, not after.
- **Writing Windows paths into docs from a script:** use `chr(92)` or raw strings. A non-raw Python
  literal turned `\\3MB` into a `0x03` control character and silently corrupted a README line to
  `\DropboxMBMB VideosMB-44`. Scan for control characters (`ord(ch) < 32`) before pushing prose.

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

meta   = { series, title, pdf, letter: { heading, paragraphs[], quotes[], paragraphs2[],
           rhythmTitle, steps[], paragraphs3[], grace, signName },
           recommendedReading: [ { title, authors, isbn13, amazon, bookshop }, ... ] }
         // rhythmTitle+steps render on the CONTENTS page (bottom strip), not the letter.
         // recommendedReading (2026-08-18): shared book list shown ONCE on the Additional
         //   Resources page (its own accordion row) + the PDF; identical on both packets.
         //   bookshop may be "" (omitted) when a title is not stocked there.

lesson = { n, accent, reference, shortRef, title,
           tabRef,              // side-tab label, spelled out, e.g. "Jeremiah 29"
           subtitle,            // DEAD on all three surfaces (see the table below);
                                //   kept only as a record. Do not reintroduce.
           openingPrayer, closingPrayer,
           scriptureRef, scriptureUrl,   // scriptureUrl uses version=NRSVUE
           scriptureText,       // HTML string shown in the popout modal
           videoTitle, videoSubtitle, videoUrl,   // videoUrl empty until Vimeo links exist
           optionalVideos,      // [ { title, subtitle, url }, ... ] — supplemental 3MB
                                //   video(s) on the Additional Resources page (a lesson may
                                //   have MORE THAN ONE). url "" => renders "Coming soon".
                                //   subtitle is just "3 Minute Bible" (NOT "· optional").
                                //   (legacy singular `optionalVideo` is still accepted.)
           artwork,             // [ { title, subtitle, url }, ... ] or null — link-out to
                                //   the hosting museum/archive (subtitle = "Artist · Museum").
                                //   Never host/reproduce the image; link only.
           optionalReadings,    // [ { title, subtitle, url }, ... ] or null — free-access
                                //   reading LINKS (link out only, never reproduce content).
                                //   All three render as cards inside that lesson's accordion
                                //   row: videos, then artwork, then readings.
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

To change **content**, edit `content.js` — it feeds **all three surfaces**. To change the
**look or behaviour for every packet**, edit `engine/render.js` / `engine/styles.css` once (the
flipbook and the phone reader both live there). To change the **printed** product, edit
`tools/packet_pdf.py` and re-cut both PDFs.

### Which surface consumes which field

The same field often renders three different ways, and a few are read by only one surface.
This is the table to check before assuming an edit shows up where you expect.

| Field | Flipbook | Phone reader | PDF |
|---|---|---|---|
| `meta.letter` | letter page | — | letter page |
| `meta.recommendedReading` | Additional Resources | — | resources page |
| `meta.pdf` | "Printable PDF" tile → `/pdfview.html` | link **straight at the file** | — |
| `title`, `reference` | **in the art** when `pageImages` is set | heading | printed |
| `openingPrayer`, `closingPrayer` | **in the art** when `pageImages` is set | own sections | printed |
| `questions` | **in the art** when `pageImages` is set | numbered list | printed |
| `scriptureRef`, `scriptureUrl` | hotspot → modal | reference + Bible Gateway link | printed |
| `scriptureText` | modal | inline `<details>`, collapsed | printed in full |
| `videoUrl` | hotspot → modal player | **inline player, no autoplay** | link |
| `videoTitle` | video card | player title | caption |
| `videoSubtitle` | video card caption | — | caption |
| `funFact` | "Did you know?" aside | — | aside |
| `optionalVideos` | accordion row | **Optional Resources → chip "Video", opens in place** | resources page |
| `artwork` | accordion row | **Optional Resources → chip "Art", links out** | resources page |
| `optionalReadings` | accordion row | **Optional Resources → chip "Reading", links out** | resources page |
| `pageImages`, `hotspots` | the whole page | **ignored** | ignored |
| `headerImage` | lesson header | — | — |
| `tabRef`, `accent` | side tab, colour | — | — |
| `subtitle` | — | — | — |

**Consequences worth internalising:**

- **`pageImages` lessons are the dangerous case.** The flipbook shows the *art*; the reader and
  the PDF show the *fields*. Editing `content.js` there changes two surfaces and not the third,
  and editing the Canva art changes the third and not the other two. They silently drift apart.
- **`subtitle` is dead on all three.** It held an editorialised one-liner ("A promise to exiles
  — not a personal good-luck charm"); the reader was its last consumer until Emily had it
  removed on 2026-09-22. The field is still in `content.js` as a record. Do not reintroduce it.
- **The reader ignores `pageImages` and `hotspots` entirely** — that is the whole point. It
  never touches the heavy art, which is why it is ~1.1MB instead of ~219MB.


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
  publication). **✅ L4 Philippians (`3MB-44`) is now wired too** — `player.vimeo.com/video/1218993379`.
  Emily said upload as-is, so the **February captioned master** went up unchanged from
  `…\Dropbox\3MB\3MB Videos\3MB-44 - Did the biblical texts…\…Horizontal (Captioned).mp4`
  (byte-parity verified off the mount; 1920×1080 h264, 3:29). Its Vimeo **title comes from the Airtable
  `Name`** — *"Did the biblical texts have chapters, verses, and section headings?"* — because unlike
  283/287/288 this video has no short on-screen slide title; rename it if that reads long. Airtable got
  the **Vimeo Link only** (its `Transcript` was already final and `Status` already Complete).
  **⚠ Caption-style mismatch:** this master uses the **February** style (up to 3 lines, different
  placement) rather than the v2 **≤2-line** standard the other nine use. Re-caption at medium and
  re-burn if the packet should look uniform. **The Dropbox URL is in Airtable** (`Video - Dropbox URL
  (Captioned)` / `Final Dropbox URL`) if the local copy is ever missing. (Draft on-brand **title cards** for 283/287/288 were designed +
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

**✅ L6 VIDEO LANDED (2026-08-17) — and its title-card splice did NOT follow the usual template.**
The delivered master (`NEW VIDEOS GO HERE\Widow of Sidon.mp4`, 1920x1080, **23.976fps**, 3:00) had the
wrong on-screen title ("Widow of Sidon"), so Emily made a corrected slide at **Canva `DAHOtl4BNMk`
page 34** ("The Widow of Zarephath") and it was spliced in **before** captioning, per the pipeline
README §3b. **Two things differ from 283/287/288 and will bite anyone who assumes the stored recipe:**
(1) this video's title card is **MID-VIDEO (~13.0–16.8s)**, after the presenter has already been
speaking — not in the 3–8s opening; and (2) it **crossfades** in and out instead of hard-cutting, so
there is **no clean-navy gap** to key the overlay off. Measured on this master: the old title is first
visible **~13.00** and fully gone **~16.80**. So the navy blocker **fades in** (`st=12.70 d=0.25`,
fully opaque by 12.95 while the frame is still clean footage) and does not begin dissolving until
`OUT=16.85`; the new card fades in at 13.05. Frame-verified on both fades — no "Widow of Sidon" ghost.
**Measurement trap:** `ffmpeg -ss` BEFORE `-i` is input seeking and is NOT frame-accurate; it shifted
every timing reading and produced a first splice with the old title visible. Use `-i file -ss t`
(output seeking) for verification frames, and trust the rendered frames over a brightness metric.
Captioning then ran normally (Whisper **medium**, intro cut **17.0s** for Arnold — which here also
lands just after the mid-roll card; 44 cues → 40 captions). Two manual proof fixes the narrow AI prompt
left alone, both confirmed against the human Airtable draft: **"Now I take that back" → "No, I take
that back"** and **"gentile" → "Gentile"**. Vimeo `1219007254`, Airtable `3MB-280` Transcript +
Vimeo Link, full working set archived to `3MB Videos\3MB-280 - The Widow of Zarephath - Arnold\`.

**PDF re-cut in the BBS format — DONE (2026-08-17).** Emily asked for the Women printable packet to
follow the **same design/format as Beyond Bumper Stickers**. It now literally does: the layout lives in
the shared **[`tools/packet_pdf.py`](tools/packet_pdf.py)** and `tools/make_women_pdf.py` is a thin
wrapper that only selects the `women` palette (mustard **GOLD `#B8860B`** where BBS uses red, brown
**`#6D4F26`** where BBS uses smoky, same navy body ink — each packet's PDF echoes its own art).
**It supersedes `tools/make_women_pdf.js`**, which is kept only for reference. Two behaviours this
packet needs and BBS doesn't: the Additional Resources page **paginates** (3 optional videos + 4 optional
readings), and it renders **`optionalReadings`** as well as `optionalVideo`.
**Output = 19 pages**, re-cut again on 2026-08-17 once L6's video landed — the only "coming soon" notes
left in the whole packet are the **"Orphan, Widow, and Stranger" optional** video, which still has no
URL. (It grew to 19 when Emily's larger type pushed Shiphrah & Puah's questions onto a
"Discussion Questions (cont.)" page — the pagination is automatic, and the closing prayer stays with the
last question). Verified with PyMuPDF for out-of-bounds AND overlapping text blocks (0 of each) and
eyeballed page by page. Cover embeds at full 1632x2112; the file is ~397KB (down from ~1MB) purely
because the fonts are now subset. **Read the font trap in "The PDF" section before re-cutting anything.**

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

## Carried-forward open items (was "Next session — Monday 2026-08-10")

**The ▶ START HERE block at the top of this file is the current state — read that first.** The items
below are what is left from Emily's 2026-08-07 priority list. Cross-cutting rules still apply: **GitHub
`main` is source of truth**; author in a native temp dir, `node --check` any JS, push via the Git Data
API, verify byte parity; **re-cut the affected PDF and re-verify after any content change.** Remember
the split brains: the **Women packet's VISIBLE flipbook pages are Canva art** (`pageImages`, design
`DAHOtl4BNMk`, **pages 19-30** as of 2026-08-17) so `content.js` there is only the PDF source + written
record, while **BBS is engine-rendered from `content.js`** so editing it changes the flipbook AND the PDF.

1. ~~**Clean up the copy of the flipbooks and PDFs.**~~ **✅ DONE.** BBS copy was cleaned Aug 13 (incl.
   the old lesson-4 "Through Him"/"Through Christ" mismatch — the title is now **"I Can Do All Things
   Through Christ"** and BBS is image-based, so there is no separate header art to reconcile). The Women
   packet's full copy rework shipped **2026-08-17** (Canva pages 19-30 → art + `content.js` + PDF).
   Both PDFs were re-cut 2026-08-17 with Emily's larger type. Only her letter + prayer pass remain.
   - Still worth doing if that art is ever reused: the landing/portal **Canva slide-4 typo**
     ("below Perfect for groups" → add the period) in `DAHRnlJvmA4`; the live portal HTML already reads
     correctly.

2. **Clean up the URL folders on Webflow.** *(still open)* **Plan set Aug 10 2026 (with Emily):** the
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

3. **Update the Additional Resources sections** *(partly open)*. The spread is **engine-rendered from
   `content.js`** (`optionalVideo` + `optionalReadings`) for BOTH packets — even the Women packet (only
   its lesson pages are Canva art, not the resources spread). So edit `content.js` → re-cut the PDF.
   **"Background to the Exodus" is no longer pending** — it is live as the Women L3 lesson video
   (`1214331923`). Still missing: the **"Orphan, Widow, and Stranger"** optional video, stubbed with an
   empty `url` under BOTH Hannah and Zelophehad, which renders as a "coming soon" note box. Ask Emily
   whether that one exists yet.

4. **LOWER — rewire the Executive dashboard SSS card to the flipbooks.** *(still open)* Repo
   `candlerfoundry/executive-bi-dashboard` (local `C:\Scripts\executive-bi-dashboard`, prod
   `candlerfoundry.netlify.app`) — **read its `CANONICAL.md` first**; separate repo + push flow. The
   "Sunday School Simplified" offering card currently maps to the `graphic-1-reader-presenter.png`
   vignette (~`index.html` line 10406) and there's an `assets/Sunday School Simplified/` folder. Rewire
   its flip-side / links to point at the **My Lessons portal** and/or the branded `/sss/<slug>` flipbooks.
   Approach TBD.

Memory (Cowork) also carries this: `project-sss-landing-portal` + `reference-foxy-logic-display`.

## The PDF (secondary, print-friendly product)

Each packet ships a printable US-Letter PDF alongside the flipbook. **As of 2026-08-17 the layout lives
in ONE shared module — [`tools/packet_pdf.py`](tools/packet_pdf.py)** — and `tools/make_pdf.py` (BBS) and
`tools/make_women_pdf.py` (Women) are thin wrappers that do nothing but pick a palette. That was
deliberate: Emily wants the two packets consistent, and they had already drifted once. **Edit the shared
module, never one packet's copy of the layout.** `tools/make_women_pdf.js` (the old playwright-core
HTML→PDF pipeline) is **superseded** and kept only for reference.

**Current output:** Beyond Bumper Stickers **17 pages**, The Gospel According to the Women **19 pages**
(its resources spread and one questions page run long). Structure is identical: full-color Canva cover,
letter, contents (+ rhythm strip), two pages per lesson, Additional Resources (paginates), Foundry end
page with the NRSVUE notice.

**Palettes** (`PALETTES` in the module) — each packet's PDF echoes its OWN art, which is why they differ:

| | accent (border, numerals, rules, links) | secondary (eyebrows, refs, footers) | body ink |
|---|---|---|---|
| `bbs` | red `#FB1616` | `#2F5972` | navy `#0A274C` |
| `women` | mustard gold `#B8860B` | brown `#6D4F26` | navy `#0A274C` |

**Type scale — Emily's brief (2026-08-17):** *"the font could generally be bigger… at least consistent
with 12 point Times New Roman… a lot of users will be older and we should make this as user-friendly and
readable as possible."* That floor was met by measurement, not eyeball: Times New Roman's x-height is
**0.4473 em** (5.37pt at 12pt) and Mulish's is **0.5000 em**, so questions + prayers are set at **13pt**
(6.50pt x-height = **121% of 12pt Times**), prose at 12pt, box titles 13.5, captions 11, section labels
16.5. **Never set Mulish below ~10.75pt or you drop under her floor.**

**Other rules baked into the module — do not regress these:**
- **Question numerals are vertically centred on their question block.** They used to sit at the top of
  multi-line questions and Emily flagged it. Thierry's digits centre **0.469 em above the baseline**
  (`THIERRY_DIGIT_CENTRE`); that constant is what makes them look true rather than roughly centred.
- **Video boxes print the Vimeo URL as text** beside the QR — a printed packet has to be usable without
  a phone. Both the QR and the printed link point at **`vimeo.com/<id>`**, never the bare
  `player.vimeo.com` embed (that URL is an embed target, not a page a human should land on).
  Bible Gateway URLs are deliberately **not** printed: they are 90+ character encoded query strings that
  wrap badly and cannot be typed. Scripture keeps QR + hyperlink only.
- **Boxes size themselves from their content and question pages paginate** ("Discussion Questions
  (cont.)"), so a type-size bump can never silently overflow.
- A lesson with no `videoUrl` renders a **"coming soon" note box with no QR** instead of a link box.

**Re-cut procedure** (also in the module header):

```
pip install reportlab qrcode pillow fonttools brotli cu2qu pymupdf
python tools/prep_fonts.py --out fonts        # regenerates all six TTFs; verifies them
# then, beside each wrapper: content.json + cover.png + fonts/
python tools/make_pdf.py          # or make_women_pdf.py
```

`content.json` is the `window.BBS_CONTENT` object dumped out of that packet's `content.js`.
**Verify with PyMuPDF for BOTH out-of-bounds and overlapping text blocks, then eyeball every page**,
and push. Re-cut whenever the art, copy, or `videoUrl`s change.

**[`tools/prep_fonts.py`](tools/prep_fonts.py) makes the build reproducible from this repo alone** —
added 2026-08-17 because the six TTFs previously existed only in a throwaway session scratchpad, so a
fresh session could not re-cut a PDF at all. It derives **Thierry** and **Hello-Handmade** from this
repo's own `engine/assets/fonts/*.woff2` and fetches **Mulish** from google/fonts, pinning real static
instances. Verified: a clean checkout + this script rebuilds **both** PDFs **pixel-identically** to the
published ones (identical text, mean pixel difference < 0.001).

Converting Hello-Handmade from CFF to TrueType needs three things, and missing any one of them fails
in a different place: build `glyf` outlines with cu2qu, **flip the sfnt header from `OTTO` to the
TrueType tag** (otherwise reportlab says *"postscript outlines are not supported"* even though a glyf
table is present), and **move `maxp` from version 0.5 to 1.0 and recalc it** (otherwise reportlab says
*"Unknown maxp table version 0.5000"*; `maxp.recalc` also needs each pen-built glyph's bbox computed
first). The script's verification therefore **registers every font with reportlab** rather than merely
checking that a glyf table exists — the weaker check passed on files reportlab then refused.

> ### ⚠ The font trap — read before any re-cut
> `fonts/Mulish-normal-500/700/800.ttf` and `Mulish-italic-500.ttf` must be **real static instances** of
> the google/fonts variable font. The copies reused for months were **not**: they still carried an `fvar`
> table with `usWeightClass 200`, and 500 and 700 were **byte-identical**. reportlab therefore rendered
> **every Mulish weight as ExtraLight** — body, bold and extra-bold all the same thin stroke — and it
> shipped undetected. Much of Emily's "the font is too small" complaint was actually this.
> **Fix:** `fontTools.varLib.instancer.instantiateVariableFont(f, {"wght": N})` per weight, then set
> `OS/2.usWeightClass`. **Verify:** no `fvar`, correct `usWeightClass`, and the `I` stem width differs
> per weight (**93 / 129 / 156** units at 500 / 700 / 800). Correct weights are also *wider*, so re-check
> page fit after fixing — that is exactly what pushed the end-page blurb from 2 lines to 3 and made it
> collide with a fixed-y URL (the module now flows that URL from the paragraph's real bottom).
> Prepared TTFs persist in old session scratchpads, but **re-instance the Mulish ones before trusting them.**

## Re-doing a video that is already published (re-burn / re-splice)

Emily changes a title card, or a caption error surfaces, **after** the video is live. **Do NOT re-run
the whole pipeline** — the archived working set makes this cheap. Every published video has 8 files in
`…\Dropbox\3MB\3MB Videos\3MB-<code> - <Title> - <Speaker>\`:

| file | what it is / why you need it |
|---|---|
| `… - Horizontal - Uncaptioned.mp4` | the clean video **after** any title splice, **before** captions — **always re-burn onto THIS** |
| `… (Captioned).mp4` | exactly what went to Vimeo |
| `… (Captions).srt` | the burned cues only (intro already trimmed) |
| `… - Transcript (Clean).txt` | the full transcript — this is what goes to Airtable |
| `… - Transcript (Time-Stamped).srt`, `… .vtt` | full transcript, other formats |
| `… .corrected.json` | AI-proofed cues + the intro cut time |
| `… .words.json` | **the Whisper word-level cache — this is what makes re-runs cheap** (`--from-raw`) |

### Case 1 — caption TEXT fix, video unchanged

1. Edit `(Captions).srt`. **Mirror the same fix into** `Transcript (Clean).txt`,
   `Transcript (Time-Stamped).srt`, `.vtt` and `.corrected.json` so the written record matches what is
   on screen — they are separate files and nothing syncs them.
2. Re-burn onto the **Uncaptioned** master. Copy the SRT to a plain `_sub.srt` **first** — commas and
   colons in the real filename break ffmpeg's `subtitles=` filter — and run from that directory:

```
ffmpeg -y -i "<base> - Horizontal - Uncaptioned.mp4"   -vf "subtitles=_sub.srt:force_style='Fontname=Arial,Fontsize=18,Outline=1,Shadow=0,BorderStyle=1,Spacing=1,MarginV=60'"   -c:v libx264 -preset medium -crf 20 -c:a copy "<base> (Captioned).mp4"
```

3. Verify a frame at the changed cue, then re-upload / re-wire / re-cut (see **Vimeo** below).
4. Update the Airtable `Transcript` if the wording changed.

### Case 2 — NEW TITLE CARD on an already-published video (the `3MB-44` case)

1. Export the new slide via the Canva connector (PNG, 1920×1080). Verify it decodes and that its
   background really is `(30,37,48)` — a full-screen replacement only looks seamless because it matches.
2. **MEASURE THIS VIDEO'S OWN CARD. Never reuse another video's IN/OUT.** There are **two templates**
   in this batch (see §3b in the pipeline README): *Case A* — card in the opening (~3.4–7.5s) reached
   by a **hard cut**, so a clean-navy instant exists; *Case B* — card **mid-roll** and **crossfaded**,
   so no clean gap exists and the navy blocker needs its own fade-in.
3. **Extract verification frames with OUTPUT seeking — `ffmpeg -i file -ss t`.** `-ss` placed *before*
   `-i` is input seeking and is **not frame-accurate**; it shifted every reading and produced one
   entirely wrong splice. Crop to the title band and find (a) the last frame **before** the old title
   appears and (b) the first frame **after** it is gone. **Trust the rendered frames, not a brightness
   metric** — a metric over the wrong band "confirmed" a clean gap that did not exist.
4. Splice into the **Uncaptioned** master (never the captioned one — you would be burning over the
   existing captions).
5. **Re-burn the existing `(Captions).srt`** onto the spliced result. The captions themselves are
   unchanged, so there is **no re-transcription** — this is the whole reason to keep the archive.
6. Frame-verify **both** fades plus one caption frame.
7. Re-upload, re-wire, re-cut the PDF, update Airtable, and archive the new working set over the old.

**DONE 2026-08-18 — and it turned out to be a THIRD template, not one of the two above.** On `3MB-44`
the orange brand card **diagonally wipes** into an opening title card, and the old title is already
legible *during* the wipe, so there is no clean-navy instant (same problem as Case B, different cause).
Fade the navy blocker in over the tail of the ORANGE card. Values (**exactly 24fps**):
`NAVY_IN=2.75 d=0.25`, `CARD_IN=3.05 d=0.30`, `OUT=10.95 d=0.45`, `OUTEND=11.40`. The branded wipe is
unavoidably lost (becomes a short orange→navy dissolve) — Emily approved that trade-off; don't try to
rebuild the wipe. New card was Canva **page 35**; new Vimeo id **1219267316**.

**Measure by FRAME NUMBER, not by time.** Output seeking still misread this one — an `-ss` strip and a
`fps=` contact sheet disagreed by ~0.5s. Use
`-vf "select='between(n\,A\,B)',tile=..." -vsync 0`; frame `n` is exactly `n/fps` seconds.

**The Canva title slides place the CF logo higher and larger than the logo burned into the footage**, so
it doubles briefly during the fade-out. All four slides (283/287/288/44) do this and the first three
shipped, so it is the established look — do not "correct" it on one video alone.

**⚠ Do not tidy the Dropbox filename after swapping a video.** Overwriting the file in place is safe
(Dropbox logs an `EDIT`, the id and its public link survive). **Renaming or moving it with the local
client is delete+add** — new file id, and the public shared link in Airtable dies. If a rename is truly
needed, use the Dropbox **server-side move API**. This bit us on 3MB-44.

### Vimeo: you canNOT replace a video's file in place

Checked 2026-08-17: the `/videos/<id>/versions` connection is **GET-only** with our token (scopes:
`private edit upload video_files public`). So **a re-cut means a NEW upload → a NEW video id → re-wire
that lesson's `videoUrl` → re-cut that packet's PDF.** The old video can be deleted
(`metadata.interactions.delete` is available) or left up — **ask Emily**, don't delete on your own.
**Never assume a Vimeo URL survives a re-cut.**

### What we did in the past (copy these)

- **`3MB-283` *The Story of Jerusalem*, `3MB-287` *Scripture Inspired by God*, `3MB-288` *Love Is
  Patient, Love Is Kind*** (Aug 13–17) — Case A splice. Values: **283 IN=3.33 / OUT=7.40**;
  **287 IN=3.40 / OUT=7.40**; **288 IN=3.40 / OUT=7.15**. Then the full pipeline.
- **`3MB-280` *The Widow of Zarephath*** (Aug 17) — Case B. **NAVY_IN=12.70 d=0.25 · CARD_IN=13.05
  d=0.30 · OUT=16.85 d=0.45 · OUTEND=17.30**, and it is **23.976fps** (`-r 24000/1001`), not 24.
- **Manual caption fixes** (the AI proof deliberately leaves these alone — see below):
  `3MB-287` "Church"→"church" ×5 and "scripture"→"Scripture"; `3MB-283` "Washington DC"→"Washington,
  D.C."; `3MB-280` "Now I take that back"→"**No,** I take that back" and "gentile"→"**G**entile".

### Why a human proof pass is still required

`caption_pipeline.py`'s AI step is deliberately narrow: it fixes **Hebrew/Greek terms**, normalises
**scripture references to `Book Chapter:Verse`**, and repairs **obvious ASR errors** — and it **never
rewords**. So plausible-but-wrong words survive it ("Now" for "No"). **Always diff the new transcript
against the record's existing Airtable transcript**, which is human-written, and hand-fix the
differences. That diff is how every fix listed above was found.

## Adding a new packet

**Moved to the top of this file** — see "Adding a new packet (the packet #3 runbook)". The old
three-line version here was wrong by omission: it never mentioned `cover-thumb.png`, the three
surfaces, or verifying any of them.

## Local development

Pure static — serve the repo root (`python -m http.server`) and open `/`.

---

# History — dated session notes

**Context, not instructions.** Newest first. These record *why* decisions were made, which is
usually worth more than the decisions themselves. But they are a log: where one of them
disagrees with the reference sections at the top of this file, **the reference sections win**,
and an old "LATEST" heading does not mean current.

### ▶ START HERE — current status (updated 2026-08-18)


### >> SHIPPED TO PRODUCTION 2026-09-22 - the phone reader is LIVE.

`mobile-gate-preview` was merged to `main` (fast-forward, 13 commits) and is live on
`sundayschoolsimplified.netlify.app`. Phones now get the reader; tablets and desktop are unchanged.

**Rollback, if it is ever needed:** production before this release was **`54cf70c`**. Reset `main`
to it and push; Netlify has no build step, so the old site is back in under a minute.

**Verified on production after deploy**

| Check | Result |
| --- | --- |
| Desktop (1920x1080, fine pointer) | gate does NOT fire, flipbook renders, 14 images |
| Phone (375x812, coarse) | gate fires, reader renders, **0 flipbook images** |
| Both packets | reader correct; Women L2 shows Video/Video/Art/Art/Art |
| Lesson title | Hello Handmade; no editorialised subtitle |
| Back to Lessons | 2 buttons per lesson |
| Main video | inline, **no autoplay parameter** |
| Optional Resources | correct heading, Emily's wording, type chips, 2 in-place video buttons |
| Printable packet | links at the **PDF itself**, `application/pdf`, **no `Content-Disposition`** |
| Cover page | duplicate title gone |
| Horizontal overflow | none |

**⚠ The iPad has still not been tested on hardware.** Emily shipped first and is testing after, which
is a deliberate choice: phones were already broken, so the release can only improve them, and rollback
is a minute. What *is* established is the arithmetic - the gate is `min(screen.width, screen.height)
< 540`, the largest iPhone's short side is **440** and the smallest iPad's is **744**, so no Apple
device sits in the gap. That verifies the rule, **not** what iPadOS actually reports. If an iPad ever
shows the reader, that is the bug to chase, and the flipbook is one revert away.

---

### >> LATEST (2026-09-22, third round) - the phone must NOT use /pdfview.html.

Emily: the printable-packet button *"does not consistently work... I suspect it's the same issue
that prompted us to get rid of the mobile flipbook in the first place."* **She was right.**

`pdfview.html`'s `renderAll()` rasterises **every page to its own canvas and keeps them all alive** -
no virtualisation, nothing released. Letter pages (612x792) at `DPR` 2 on a 375px phone is ~2.5MB of
canvas per page:

| Packet | Pages | Canvas held at once |
| --- | --- | --- |
| Beyond Bumper Stickers | 19 | **~48 MB** |
| The Gospel According to the Women | 22 | **~56 MB** |

That is the flipbook's failure in miniature - eager full-document bitmaps, all retained. It also
opens in a **new tab**, so the reader is still resident behind it and iOS chooses which to jettison,
which is why it failed **intermittently** rather than every time. Intermittent is the tell.

**Fix: on a phone, `mqPdfHref()` now returns the PDF's own URL.** Same principle as the reader -
do not optimise a renderer you cannot measure on a fleet you cannot test; take it out of the path.
iOS's PDF viewer is progressive and OS-managed and gives Share / Save to Files / Print, which is the
entire point of a printable packet. The two jobs `pdfview.html` exists for - forcing in-PDF links
into a new tab, and resolving internal `dest` jumps - are **desktop** problems; the native viewer
handles link taps itself. Verified the files serve as `application/pdf` with **no**
`Content-Disposition`, so they still open inline and never auto-download.

**Tablets and desktop still use `pdfview.html`; that path is untouched.** But note the same eager
rasterisation applies there (~56MB on the Women packet), so **an old iPad is not obviously safe**.
Not changed here on purpose - it belongs with the tablet lazy-loading work, not bundled into the
phone release, or you will not know which change caused a regression.

---

### >> LATEST (2026-09-22, second round) - Optional Resources, inline player, sound.

Branch `mobile-gate-preview` only. Three more notes from Emily after the round below.

### 1. "Going Further" -> "Optional Resources", and it no longer reads as part of the lesson

Emily: *"it reads as part of the lesson b/c it's the same font."* Correct - it was an ordinary
`.mq-s` section with an ordinary `.mq-h2` label, indistinguishable from Opening Prayer or Read.
It is now set apart on every axis available at once, because one signal was clearly not enough:

- heading in **Hello Handmade** (the lesson's own section labels are uppercase Mulish);
- a **dashed** rule instead of a solid card, on the **page background** instead of the cream used
  for lesson content - it deliberately does not look like a content card;
- an explicit line: *"Extras if you want to go further - not part of the lesson."*

Every row carries a **type chip - Video / Art / Reading** - so a painting is not mistaken for a
video before you tap it. **Artwork and optional readings were not in the reader at all before this**;
only `optionalVideos` was rendered. The phone now carries everything the lesson offers, which is the
whole point of the reader. Sources: `optionalVideos` (+ legacy singular `optionalVideo`), `artwork`,
`optionalReadings`. Classes are `.mq-x*`; `.mq-lk` is gone.

**Extra videos play in place** ("Watch here"), rather than throwing the reader out to vimeo.com -
Emily, correctly: leaving the site mid-lesson is the wrong trade. They are **tap-to-reveal**, not
rendered inline like the main lesson video, because 1-3 further 16:9 players would make Optional
Resources the largest thing on the page - the opposite of what the panel is for. Artwork and readings
genuinely have to leave (Wikimedia, Bible Gateway), so those stay as links. The revealed player
carries **no autoplay**, same as the main one; the cost is two taps (reveal, then Vimeo's play
button) and that second tap is exactly the user gesture that guarantees sound.

### 2. The video is rendered inline - no tap-to-load button

Emily: *"I don't want the video to appear as a drop-down option. It should just automatically appear,
and the user presses play."* The tap-to-load button was justified by "one player at a time, never all
six" - but **that reasoning never applied here**: the reader shows a single lesson, so there is only
ever one main video on screen. The iframe is now in the markup with `loading="lazy"`.

`title=0&byline=0&portrait=0` keeps the player's preview chrome off, which is the same objection
`videoCard()` records for the flipbook.

### 3. ...which is also what fixes the sound. DO NOT PUT AUTOPLAY BACK.

Emily first said the audio was fine, then found it was not: lessons **1, 2 and 6 had no unmute
control at all** while the others did.

**It is not the videos.** Checked before changing anything: every lesson video reports
`separate_av: true` with five DASH streams - identical across the ones that worked and the ones that
did not. The audio is there.

**It was `?autoplay=1`.** iOS forces muted autoplay, and Vimeo does not reliably draw an unmute
affordance when it has fallen back to muted - hence "no unmute option" on some videos and not others.
Removing the parameter removes the whole failure mode: with no autoplay, the viewer's tap lands on
Vimeo's own play button **inside** the iframe, which is a real user gesture, so playback always starts
**with sound**, on every platform. This is why the inline player is not merely cosmetic - **re-adding
autoplay would bring the muted-with-no-unmute bug straight back.**

---

### >> LATEST (2026-09-22) - Emily's four review notes on the phone reader.

Branch `mobile-gate-preview` only. Production (`main`) is still the flipbook for everyone.
Emily reviewed the preview on a phone and raised four things; all four are fixed and deployed
to the branch. The 2026-09-17 block below still describes the reader's design and the gate.

### 1. Two sets of captions on the videos - and it was NOT the wrong Vimeo

Emily saw our burned-in captions PLUS a second set along the bottom, on the phone but not in
the flipbook, and reasonably assumed the reader was pointing at different videos. It is not:
`mqLesson()` pulls the id out of the same `lesson.videoUrl` the flipbook's modal uses, so both
build the identical `player.vimeo.com/video/<id>?autoplay=1`. **The videos were never the problem.**

The real cause is at the Vimeo end. Every 3MB video carries an auto-generated Vimeo subtitle
track (`en-x-autogen`, `provenance: autogen_source_audio`) with **`active: true`**, which the
player config reports as **`default: true`** - so a player that honours the default draws Vimeo's
AI transcript over our reviewed, burned-in captions. Checked 2026-09-22: **all 12 lesson videos
have it**, and so do the supplemental ones (spot-checked 3MB-273 *What is khanun?*).

Things that were tried and **do not work** - do not retry them:

| Attempt | Result |
| --- | --- |
| `?texttrack=false` | player config still reports `default: true` |
| `?texttrack=0` | player config still reports `default: true` |
| Reproducing it in the browser pane under phone emulation | **cannot** - control and treated both report `mode: "disabled"`. This is an iOS-side behaviour (native player / system caption preference). Emulation will not show you this bug. |

What shipped is `silenceVimeoCaptions()` in `render.js`: it asks the player to switch the track
off over the **postMessage protocol the embed already speaks** - the same thing the Vimeo Player
SDK's `disableTextTrack()` does, without pulling in the SDK (which would have undone the point of
a lightweight reader). Re-sent on `play` and `texttrackchange`, capped at 8 sends so it cannot
loop. Applied to the **flipbook's modal too** - same latent defect there, it just needs an iPad
with captions switched on to show up.

**This is the belt, not the braces.** The durable fix is clearing `active` on the autogenerated
track at the Vimeo end, which also fixes the supplemental videos - they open on vimeo.com in a new
tab, where our embed code cannot reach them at all. **The Vimeo MCP can only READ text tracks
(`get_text_tracks`); there is no write tool**, so Claude cannot do this - it is Emily, in the Vimeo
admin, per video. Turning the track off does not reduce accessibility: our captions are burned into
the picture and always visible.

### 2. The editorialised summary under the lesson title is gone

`lesson.subtitle` - e.g. *"A promise to exiles - not a personal good-luck charm."* The reader was
its **only** consumer; neither the flipbook nor the printable PDF ever rendered it. (`o.subtitle`
elsewhere in `render.js` and in `packet_pdf.py` is a *resource* subtitle - a different object. Do
not confuse them.) The field is still in `content.js` and untouched, so nothing else can break.

### 3. Titles are larger and in the flipbook's display face

`.mq-t2` (lesson) and `.mq-t` (packet) now use **Hello Handmade**, the same face as the flipbook's
`.htitle`, at `clamp(34px,10.2vw,42px)` and `clamp(30px,8.6vw,36px)` - up from Mulish 800 at 26/25px.

**`font-weight:400` is deliberate.** Hello Handmade ships a single weight; leaving the old `800`
would make the browser synthesise a fake bold and the face would look smeared. If you add more
Hello Handmade rules to the reader, set weight 400 there too.

The index's lesson-card titles (`.mq-lt`) were deliberately **left in Mulish 800** - they mirror the
flipbook's contents rows (`.crow .ct`), which are also Mulish 800. Display titles take the
handwritten face; list rows do not. This costs the reader one 133KB woff2.

### 4. "< All lessons" is now a real button

It read as decoration. Replaced by `.mq-bk` - **"Back to Lessons"**, 48px tall, outlined at the top
of the lesson and **filled navy at the foot**, below the prev/next row. `.mq-back`/`.mq-sub` are gone
from `styles.css`; `.mq-f` is still the index's footer link and was left alone.

### Branch bookkeeping - a trap worth knowing

The 2026-09-17 README commit (`54cf70c`) was pushed to **`main`**, not to `mobile-gate-preview`, so
the branch never carried its own status block. Merged across on 2026-09-22 so the branch is a clean
superset of main. If you find the branch missing README history again, check `main` before rewriting it.

### Still open

Unchanged from 17 Sep and still Emily's call: the **real-device test** (iPhone shows the reader,
iPad must show the ordinary flipbook), **passage collapsed vs expanded**, the **course-flipbook
phone-block wording**, and **`loading="lazy"` for tablets before merge**. Added 22 Sep: **clearing
the autogenerated caption tracks in Vimeo**, which is the only complete fix for item 1.

---

### >> LATEST (2026-09-17) - PHONE READER built and deployed to a PREVIEW BRANCH.
### Not merged. Production is untouched.

The `>> OPEN (2026-09-14)` block below is the diagnosis (unreadable / unflippable / crashing).
This block is what we decided and built. **Nothing has shipped:** `main` still serves the flipbook
to every device.

### The decision

**Phones do not get the flipbook. They get a full lesson reader.** Not a notice, not a PDF dead end.
Emily, when an earlier PDF-only version was shown: *"the whole point is to let folks access the
lesson and follow along from their phones, including the discussion questions."* That version was
rejected and replaced.

Chosen over optimising the flipbook for phones because the device fleet is **unknowable and
untestable** - this is client-facing, on every kind of phone. When you cannot measure the weakest
device, **elimination beats optimisation**: if the flipbook never initialises, the 219MB is never
allocated, which is a guarantee rather than a hope. Precedent: the course/instructor flipbook already
blocks phones.

Supporting evidence (Vimeo analytics, 1 Aug - 16 Sep, account-wide): iOS is the **largest single OS by
unique viewers** (53, vs Mac 48 and Windows 29). Mobile is ~35% of views and ~43% of unique viewers,
so a phone dead end would have been expensive. Caveat: account-wide rather than SSS-only, and Vimeo
counts iPadOS as "iOS".

### What is built - branch `mobile-gate-preview`, NOT merged

Preview, works on any phone with no login:
`https://mobile-gate-preview--sundayschoolsimplified.netlify.app/packets/beyond-bumper-stickers/`

- **`engine/render.js`** gains a phone reader: an index of the six lessons, then per lesson the
  opening prayer, the passage (inline `<details>`, collapsed, plus the Bible Gateway link), the video
  (loads only when tapped, one player at a time), **every discussion question**, the closing prayer,
  "Going Further" extras, and prev/next. **Hash-routed** (`#lesson-3`), so the phone's Back button
  works and a lesson is directly linkable.
- All of that content **already lives in `content.js`** - it is the printable packet's source - so the
  phone gets a few hundred KB of reflowing, pinch-zoomable text instead of 219MB of fixed page art.
- **New asset `packets/*/assets/cover-thumb.png`** (480px). Deliberate: the real `cover.png` is
  **52.6MB decoded** and using it here would have undone the entire fix.
- **`engine/styles.css`** gains a block scoped to `body.mqbody` / `html.mqhtml`.

| | Decoded bitmap | Flipbook |
|---|---|---|
| Phones (6 configs) | **219MB -> 1.1MB** | replaced by the reader |
| Tablets (5 configs) | 218.7MB unchanged | intact |
| Desktop, incl. a 380px-wide window | 218.7MB unchanged | intact |

13 device configurations pass against the deployed preview. The test fails if a gated page so much as
*requests* a lesson image.

### The gate rule, and why it is not viewport width

```js
min(screen.width, screen.height) < 540  &&  matchMedia('(pointer: coarse)')
```

An **iPhone 14 Pro Max in landscape is 740px wide**; an **iPad (gen 11) in portrait is 656px**. A rule
on viewport width therefore serves the flipbook to the phone and gates the iPad - exactly backwards.
The shorter screen side is hardware and does not change with rotation. Validated against Playwright's
device registry: **every phone <= 480, every tablet >= 600**, a 120px gap with no device in it, so 540
sits in clear air. It also **never reads the user agent**, so iPadOS reporting itself as a Mac (the
default "Request Desktop Website") cannot fool it. If the screen is unreadable or `matchMedia` is
missing it **fails toward the flipbook** - Emily's rule is never gate a tablet.

### ⚠ Three traps this cost, in order

1. **The gate must run before any `<img>` is constructed.** Building the pages and then hiding them
   still loads and decodes all 219MB, so the crash survives. It sits after the helper definitions and
   ~90 lines before the first `<img>`.
2. **Putting it too early fails silently.** The first attempt sat above `var esc = function ...`.
   `esc` is a hoisted `var`, so it was `undefined`, the gate threw, and the page rendered **nothing at
   all** - not the reader, not the flipbook. "Gate too early" looks exactly like "gate not working".
3. **The reader could not scroll.** `styles.css` lines 9-10 pin the page for the flipbook's fixed
   stage: `html,body{height:100%}` plus `body{overflow:hidden}`. A `body.mqbody` class **cannot**
   override a rule that also targets `html`, so the gate now adds `.mqhtml` to `<html>` and
   `html.mqhtml, html.mqhtml body.mqbody` restores `height:auto; min-height:100%; overflow-y:auto`.
   Emily found this on a real iPhone: the device matrix had asserted horizontal overflow and tap
   targets but never that the page actually scrolls.

### Testing notes

- `scroll-test.mjs` now asserts real scrollability (4 phones x 3 views, both packets) **and** counts
  non-passive `touchstart`/`touchmove` listeners, which must be 0 - page-flip never initialises on a
  gated phone, so nothing can swallow the gesture.
- **Playwright's `mouse.wheel` does NOT scroll under touch emulation.** It reported a false failure
  after the scroll fix was already working. Drive `window.scrollTo` and assert `scrollY`.
- Only **Chromium** is installed here; WebKit is absent (`npx playwright install webkit`). **No
  emulator can reproduce an iOS memory jettison, so a real device is the acceptance gate.**

### Netlify + GitHub facts worth keeping

- **Branch deploys were OFF.** Emily enabled them 2026-09-17 for `mobile-gate-preview`. The production
  branch stays `main`, so a branch deploy can never reach a customer.
- **Netlify only builds a branch deploy on a PUSH to that branch.** "Trigger deploy" rebuilds
  production. After enabling the setting you must push a commit to the branch or nothing appears -
  this cost a round trip.
- **The repo PAT cannot open pull requests** (`403 Resource not accessible by personal access token`),
  so deploy-previews-via-PR are not available. Branch deploys are the route.

### ⚑ PICK UP HERE

**Waiting on Emily:**
1. **Test the preview on a real iPhone and a real iPad.** The iPad must show the ordinary flipbook,
   unchanged - if a tablet ever shows the reader, that is a bug. The real test is moving between
   several lessons repeatedly, which is what used to crash.
2. **Should the passage default to collapsed or expanded?** Currently collapsed, so the discussion
   questions are not buried under ~1,700 characters of scripture.
3. **The course/instructor flipbook's phone-block wording** - asked three times, still unanswered.
   Wanted so both products say the same thing to users.
4. **Lazy-loading for tablets before merge?** Recommended. Tablets still load 219MB and an older 2GB
   iPad is not obviously safe; `loading="lazy"` cuts it to ~40-60MB with no visual change at all.

**Not yet done:** the `assets/web/` 816w screen derivatives were generated once and lost to a
scratchpad prune - **regenerate them, do not go hunting** (same trap as the un-instanced Mulish TTFs).
And the reminder that outranks them: **the printable PDF embeds `cover.png` full-bleed and the logo at
214pt and needs print resolution** - never downscale those originals. Only the lesson page PNGs are
flipbook-only, and that is where 157 of the 219MB lives.

### >> OPEN (2026-09-14) - MOBILE IS BROKEN ON iPhone: unreadable, unflippable, and it CRASHES.
### Diagnosed only. NOTHING CHANGED YET.

Emily reported three symptoms on her iPhone: text cannot be enlarged, the page flip does not work,
and tapping between lessons produces Safari's **"A problem repeatedly occurred"**. All three were
reproduced and measured against the live site (commit `20841f2b`). No fix has shipped - the packets
are in active customer use and nothing lands without a sandbox pass and Emily's sign-off.

### The measurement (iPhone 13, 390x664 viewport, both packets identical)

| | |
|---|---|
| `--book-scale` | **0.142** |
| Whole two-page spread on screen | **232 x 150 px** |
| One page | **116 px wide** (designed at 816) |
| 16px body text | renders at **2.3 px** |
| Lesson tab hit targets | **20 x 8 px** (Apple's minimum is 44x44) |
| Decoded bitmap held in RAM | **219 MB** (BBS) / **179 MB** (Women) |

### Cause 1 - the book is drawn at 1/7 size

`engine/render.js` `fit()` always lays out the **full two-page spread** (1832px incl. spine + tabs)
and always reserves **130px for the nav arrows**, then scales to fit. On a 390px phone that leaves
260px for an 1832px book. **`engine/styles.css` contains no `@media` query at all** - there is no
mobile layout, only one desktop layout shrunk down.

### Cause 2 - pinch-zoom is actively suppressed

`render.js:285` sets `mobileScrollSupport: false`. Inside page-flip 2.0.7 that flag does exactly this
on every touch: `...mobileScrollSupport || t.preventDefault()`. `preventDefault()` on `touchstart`
makes iOS discard the default gesture - **including pinch-to-zoom and double-tap-to-zoom**. Verified
by instrumenting `Event.prototype.preventDefault` (fires once per touch). Neither our viewport meta
nor Webflow's disables zoom; both are a clean `width=device-width, initial-scale=1`. The listener is
bound only to `.stf__block` (232x150px), so **pinching the empty background outside the book should
still zoom** - a usable interim answer for customers, but confirm on a real device.

### Cause 3 - corner-drag is mathematically broken at phone scale

page-flip reads finger position as `clientX - rect.left` with **no compensation for the CSS
`transform: scale()`** on `#binder-scaler`. It measures the finger in *visual* px but compares against
the book's *internal* 1632x1056 space. Same slow corner-drag, both sizes:

| | corner touch maps to | result |
|---|---|---|
| iPhone (scale 0.142) | 13.9% across, 13.8% down | **nothing happens** |
| Desktop (scale 0.715) | 71.3% across, 71.1% down | **page turns** |

The bug is proportional to the scale, which is why desktop never showed it. Compounding it,
`disableFlipByClick: true` (library default is `false`) means **tap-to-turn is off**, so the only
gesture that still works is a fast flick: >30px horizontal, <60px vertical, **under 250ms**. Anything
slower falls into the broken corner-drag. That is why flipping feels random rather than dead.
The arrow buttons and the tab column do still work.

> **⚑ `disableFlipByClick: true` IS DELIBERATE - DO NOT SIMPLY UNDO IT (Emily, 2026-09-14).** It was
> switched off during the **course/instructor flipbook** work because it caused **accidental page
> turns**. Any mobile tap-to-turn must therefore be *designed around* that, not reverted: scope it to
> narrow viewports only, restrict it to a dedicated edge/margin zone, and keep it off anywhere it
> could fire over the scripture, video or TIP hotspots (which on the lesson pages cover most of the
> page). If tap-to-turn cannot be made safe, bigger arrow/tab targets (#7) carry mobile navigation
> instead.

### Cause 4 - "A problem repeatedly occurred" is a memory jettison

That message is iOS killing the WebContent process. Every packet eagerly loads **all** page art at
full resolution and holds it resident - every `<img>` is `loading=(none) decoding=(none)`:

| Asset | Pixels | Decoded |
|---|---|---|
| BBS `cover.png` | 3264x4224 | **52.6 MB** |
| 12 x lesson page PNGs | 1632x2112 each | **157.5 MB** |
| `candler-foundry-logo.png` | 2337x939 | **8.4 MB** |
| | | **219 MB** |

Only 11.8 MB over the wire - PNG decompresses ~19x, and the browser holds `w*h*4` bytes **regardless
of display size**. On the phone we hold a 1632px bitmap to draw a 116px page. Flipping is the trigger:
each turn rasterizes new layers and, under pressure, iOS evicts decoded images and must re-decode them
on the next flip - a decode/evict thrash that ends in the jettison. Desktop never hits it because
there is no per-tab cap. The `/sss/<slug>` Webflow wrapper makes it worse: the flipbook iframe shares
one memory budget with jQuery, the Webflow runtime and the Foxy portal scripts.

### ⚠ TRAP - the flipbook and the printable PDF SHARE assets, and the PDF needs print resolution

Do **not** "just downscale the big PNGs". `tools/packet_pdf.py` draws `cover.png` full-bleed across the
whole letter page (`c.drawImage(cover, 0, 0, W, H)`) and `logo.png` at 214pt wide:

- BBS `cover.png` 3264x4224 = **384 dpi** in print. Halving it drops the printed cover to 192 dpi.
  (Women's cover is already 1632x2112 = 192 dpi, so that is evidently tolerable - but it is a
  print-quality decision for Emily, not a free win.)
- `candler-foundry-logo.png` = **786 dpi** at its 214pt placement. Genuinely over-provisioned;
  892px is the 300 dpi floor.
- **The 12 lesson page PNGs are flipbook-only** (`packet_pdf.py` never reads `assets/pages/`), so they
  are free to optimise. That is also where 157 of the 219 MB lives.

The clean fix is to **decouple**: leave the print originals alone and give the flipbook its own
screen-resolution derivatives under `assets/web/`.

### Fix menu (none applied)

| | Change | Effect | Risk |
|---|---|---|---|
| **1** | `loading="lazy"` + `decoding="async"` on page art | 219 MB -> ~40-60 MB resident, **quality untouched** | Needs testing: pages live off-screen in the flip container; a not-yet-decoded page may flash blank on turn |
| **2** | `srcset` to `assets/web/` derivatives | phone decodes ~3.3 MB/page instead of 13.1; transfer 11.8 MB -> 5.6 MB PNG / **1.2 MB WebP** | Low - desktop keeps the 1632w source |
| **3** | `mobileScrollSupport: true` | restores pinch-zoom and double-tap-zoom | Low, but changes touch handling on desktop too |
| **4** | tap-to-turn on narrow screens, in a safe edge zone only | tap to turn the page | **Medium - see the warning above; a plain `disableFlipByClick: false` re-introduces the accidental page turns it was disabled for** |
| **5** | `usePortrait: true` + a mobile `@media` block | one page at a time filling the width: **3.4x bigger** type, and frees the 130px the arrows reserve | Medium - first real mobile layout, needs design review |
| **6** | Divide touch coords by `--book-scale` | fixes corner-drag at every size | Medium - patching library behaviour; `size:"stretch"` may be cleaner |
| **7** | Bigger tab/arrow hit areas on mobile | tabs become tappable | Low |
| **8** | A reflowing mobile reader | genuinely readable text, no zooming | Large - but **all the text already exists in `content.js`** (it is the PDF source), so it needs no Canva round-trip |

**WebP fixes transfer, NOT the crash** - decoded size is `w*h*4` whatever the file format. Say so
before anyone proposes it as the memory fix.

Note the ceiling: even perfect portrait mode puts 16px type at ~7.6px, because an 816px page does not
fit a 390px screen. #1-#7 make the flipbook *usable*; only #8 makes it *readable* without zooming.

### Derivatives already generated (not committed)

`assets/web/` at 816x1056 for every lesson page + cover, and a 462x186 screen logo, for both packets.
Originals untouched. Totals: transfer 23.6 -> 11.4 MB (PNG) or **2.4 MB** (WebP); decoded 398 -> 86 MB
(**4.6x less**). A quality proof at three real display sizes shows them identical on a standard
desktop and marginally softer on Retina / dpr-3 phones - hence `srcset` rather than replacement.

### ⚑ NEXT SESSION - PICK UP HERE

**Nothing has shipped. Production is untouched.** The derivatives above live only in a session
scratchpad, so **regenerate them** rather than hunting for them (same trap as the old un-instanced
Mulish TTFs): the generator resizes `assets/pages/*`, `cover.png` and the logo with Pillow LANCZOS
into `assets/<slug>/assets/web/`, and takes ~1 minute.

**Agreed first sandbox build** (proposed, Emily has not yet picked): `loading="lazy"` +
`decoding="async"` (#1), `srcset` -> `assets/web/` (#2), and `mobileScrollSupport: true` (#3). That
addresses the crash and the zoom with the least surface area. Portrait mode (#5) and the coordinate
fix (#6) are a separate, design-reviewed change. #8 is its own project.

**Test ladder** (see the mobile plan): local static server + Playwright for iteration; Playwright
**WebKit** (Safari's engine - **not installed**, `npx playwright install webkit`) for touch/zoom
fidelity; then a **branch deploy** at `https://<branch>--sundayschoolsimplified.netlify.app` - never
`main`, and a non-production branch cannot become production in Netlify's model. **The acceptance gate
is a real iPhone**, because no emulator can reproduce an iOS memory jettison: toggle all six lessons
repeatedly against the preview URL. Also test it inside a temporary Webflow page iframing the preview,
since the `/sss/<slug>` wrapper adds real memory pressure.

**Pass/fail:** decoded bitmap < 60 MB (from 219); 16px text >= 7px on screen (from 2.3); tap/drag
flip works; tab targets >= 44x44; **desktop scale, corner-drag, modals, deep links and the PDF viewer
all unchanged**.

### >> LATEST (2026-09-04) - No em dashes in the letters, BBS L3 reading extended, TIP in print,
### clickable contents, new back-page sign-off.

Five changes Emily asked for. Both packets rebuilt and verified; baseline reproduction was confirmed
first (a rebuild from unmodified inputs matched the published PDFs pixel-for-pixel on every page), so
every page listed below changed because we changed it.

1. **Em dashes are gone from the opening letters (both packets).** BBS had two:
   "noticed - as we have - that" became "noticed, as we have, that", and "to be easy - you can study"
   became "to be easy. You can study". The Women letter had none, but used a spaced HYPHEN for the same
   job ("six of these stories - Hannah,"); that is now a colon. The letter page is engine-rendered from
   `meta.letter`, so this lands in the flipbook AND the PDF from one edit. Line breaks and page fit are
   unchanged. **Still present elsewhere and NOT touched** (Emily has not ruled on them): the generator's
   hard-coded "Read at Bible Gateway (NRSVUE) - or scan the code" (6x per packet) and "Open at Bible
   Gateway - or scan the code" on the Women resources pages, plus four BBS discussion questions
   (L1 Q4, L2 Q5, L5 Q4, L6 Q4). **Careful with the questions:** they are baked into the Canva art, so
   editing `content.js` alone would desync the PDF from the flipbook.

2. **BBS Lesson 3 now reads `Genesis 1:1-2:9; 2:15`** (was `1:1-2:4a; 2:15`). The old reading jumped
   from the end of creation-story one to a single orphaned verse of creation-story two, with nothing to
   explain who "the man" is or where the garden came from. Adding 2:4b-9 supplies exactly that setup
   (the barren ground, the human formed from dust, the garden planted) and stops short of the rivers-of-
   Eden geography. Emily updated the Canva art herself (design `DAHOtl4BNMk` **page 8**) and the new
   `lesson-3-a.png` is in. **Hotspots did NOT need re-measuring this time** - a pixel diff of old vs new
   art shows the ONLY changed region is the reference line (x485-1147, y400-461); the scripture, video
   and TIP boxes are untouched. Always prove that with a diff before trusting it.
   `scriptureText` gained 2:4b-9 in NRSVUE, following the house pattern already used by BBS L5 (which
   quotes 2:4-7), including the `<p class="super">Another Account of the Creation</p>` seam.

3. **The Lesson 3 TIP now prints.** It used to exist only in the flipbook (a red starburst baked into
   the art plus a `hotspots.tip` hotspot), so the printable packet never mentioned it - the
   inconsistency Emily flagged. `tools/packet_pdf.py` gained **`tip_box()`**: a full-width aside with the
   red TIP badge, the wrapped tip text, a QR, and the underlined link label, drawn on lesson page A after
   the video box when a lesson has `tipText`. Height is computed from the wrapped text so it cannot
   overflow; L3 page A had ~235pt free, and the box did not push the questions onto a new page (BBS is
   still 19pp). The tip copy was rewritten for the new reading and repointed at **Genesis 2:10-25**
   (`tipUrl`, `tipLinkText`), and it no longer uses em dashes.

4. **The printable contents page is clickable on screen.** Each "In This Packet" row is now an internal
   PDF link to that lesson's page A: `c.bookmarkPage('lesson%d')` on each lesson page A, and
   `c.linkRect('', 'lesson%d', ..., Border='[0 0 0]')` on the contents row (forward references resolve at
   save time). No annotation border, so **the printed page is unchanged**.
   **`pdfview.html` had to learn internal links too** - it only ever overlaid `an.url` annotations, so a
   `dest` link would have been DEAD in our own viewer. It now handles both: `an.url` keeps opening a new
   tab, while `an.dest` gets a `.lk-in` anchor whose click resolves the destination
   (`getDestination` -> `getPageIndex`) and smooth-scrolls to that page, offset by the sticky toolbar.
   The page lookup happens at CLICK time, because pages render in order and the target may not be in the
   DOM yet when the link is built.

5. **Back page (PDF end page): stubby rule removed, new sign-off copy.** The 52x3pt accent `roundRect`
   above the logo read as a stray line; it is gone. The blurb is now "<series> is a project of The Candler
   Foundry, an initiative of Emory University's Candler School of Theology. We aim to make Bible and
   theology fun and easy." **The flipbook now says the same thing** - `.resfoot` previously carried only
   the logo and the URL, so `engine/render.js` adds a `.resfoot-blurb` div and `engine/styles.css` styles
   it (12px italic, max-width 470px) while tightening `.resfoot` margins/gap to claw back the height.
   NOTE the flipbook keeps its full-width dotted separator above the footer - that is a structural
   divider between the accordion and the sign-off, not the stubby rule Emily meant.

6. **The Additional Resources lede no longer promises artwork a packet doesn't have.** Both surfaces
   said "Extra viewing, artwork, and reading...", but BBS has **no** `artwork[]` on any lesson (still a
   pending item), so it advertised a category that never appeared. The lede is now derived from the data
   - `C.lessons.some(l => (l.artwork||[]).length)` in `engine/render.js`, `any(l.get('artwork') ...)` in
   `res_header()` - so it reads "Extra viewing and reading..." for BBS and keeps the artwork wording for
   Women. It will start saying "artwork" for BBS automatically the moment artwork is wired, with no code
   change. Proof it is inert where artwork exists: the rebuilt **Women PDF differs on ZERO pages** (so it
   was not re-committed); only BBS p16 changed. Watch the comma - "Extra viewing, and reading" is wrong
   with only two items, so the whole phrase is swapped, not just the middle. The empty-state strings
   ("Extra videos, artwork, and readings will appear here as they are added") are deliberately left
   alone: they only fire when a packet has NO resources at all, where they read as forward-looking.

**Verification (all done, none of it assumed).** Baseline rebuild = pixel-identical to the published
PDFs. After the changes, the only pages that differ are BBS 2/8/19 and Women 2/22; page counts hold at
19/22; PyMuPDF found no out-of-bounds and no overlapping text blocks anywhere. **The Browser pane cannot
verify pdf.js** - the live, unmodified viewer stalls at 1 rendered page there too, so that is an
environment artifact, not a regression; use **Playwright** instead (`work/verify-pdfview.mjs` pattern).
Playwright confirmed: 19 pages, 6 internal links on the contents page, all 6 landing on pages 4/6/8/10/
12/14 with 0px offset, 64 external links all still `target="_blank"`, no console errors. Allow ~3s for
the smooth scroll to settle before asserting position, or long jumps read as failures. The flipbook was
checked too: new art loads, the scripture modal header reads "Genesis 1:1-2:9; 2:15" with the garden and
tree-of-life verses present, the TIP pop-out shows the new copy and the 2:10-25 link, and the new footer
blurb fits inside the fixed 816x1056 page on both packets.

### >> LATEST (2026-09-02) - Landing block 2 full-width + Foxy checkout code saved.

- **Landing "HERE'S HOW IT WORKS" (block 2) is now full-width.** It was capped `max-width:1200px` and
  looked small next to the portal's equivalent "Let's get going" band, which has no cap. Removed the cap
  so `webflow-embeds/landing.html` block 2 wrapper is just `position:relative;width:100%;line-height:0` -
  structurally identical to the portal's `.sss-ll`, so it renders at the same scale. Hotspot is %-based
  (stays aligned); single image (proportional). Commit 4da55fcb. ⚠ **Emily re-pastes landing.html block 2.**
  (Block 1 hero is still capped at 1200px - widen the same way if you want all three consistent.)
- **Foxy checkout custom code is now version-controlled in `foxy-embeds/`** (mirrors `webflow-embeds/`;
  this code lives in the Foxy admin checkout config, NOT auto-served - Emily pastes it). Includes the
  **account-forcing footer**, whose `FORCE_LOGIN_CATEGORY` had omitted SSS - so SSS checkouts ran
  guest-allowed and the occasional shopper registered with no account/password. Fixed by also matching the
  `SSS-` product-code prefix. ⚠ **Emily must paste the corrected footer into Foxy.** It's client-side
  (bypassable) - a server-side pre-payment webhook is the bulletproof follow-up (not built).
- **Foundry-wide operational reference:** `Dropbox/Operations/Claude Context Docs/Candler Foundry -
  Operations Playbook.md` (systems, access, standing rules, procedures, project index).

### >> LATEST (2026-09-01) - Resources grouped by lesson + PDF links open in a NEW window.

Two printable-packet changes Emily asked for:

1. **Additional Resources grouped by lesson.** `tools/packet_pdf.py` no longer lists resources as a flat run
   with the lesson stamped inside each pill. It now renders one subsection per lesson (accent numeral + lesson
   title + a hairline rule) with that lesson's resource pills **compact and indented** beneath it; the per-pill
   "Lesson N" tag is gone. `box()`, `link_box()`, `note_box()` gained `x/w/compact` params (defaults reproduce
   the old full-size boxes on the lesson pages EXACTLY, so only the resources section changed). Both PDFs re-cut
   + pushed (BBS 19pp, Women 22pp), rendered + verified, byte-parity confirmed live. Commit 3ab80c7e.

2. **PDF links open in a NEW window - via an in-page pdf.js viewer, NOT a change to the PDF.** The
   scripture/video/resource links inside the PDF used to replace the PDF's own window with no way back. There is
   **no way to fix this inside the PDF file** for the browser case: browsers' built-in PDF viewers navigate the
   same window on a plain URI link and **ignore PDF JavaScript** (the `app.launchURL(url,true)` "new window"
   trick) - verified two ways in the real browser (a document OpenAction never fired; a JS link annotation did
   nothing). So the fix lives at the page that PRESENTS the PDF:
   - **`/pdfview.html`** (NEW, repo root) renders the packet PDF with pdf.js (cdnjs 3.11.174, UMD global
     `pdfjsLib`) and overlays **every link annotation as a real `<a target="_blank">`**, positioned via
     `viewport.convertToViewportRectangle(annot.rect)`. Same-origin `?file=` guard, `?title=` for the header,
     Download/Print + zoom, DPR-crisp canvas. Plain HTML anchors => new-tab works in ALL browsers. Commit 202da6f0.
   - **`engine/render.js`** - the flipbook "Printable Packet" tab now opens `/pdfview.html?file=<pdf>&title=<t>`
     in a **NORMAL browser tab** (address bar + back button; `target="sssPdf"` reuses the tab) - NOT the old
     chromeless `window.open(...,width/height)` pop-out (Emily disliked the box with no back button). Live + verified.
   - **`webflow-embeds/portal.html`** - `sssPDF()` now opens the Netlify-hosted `/pdfview.html` in a normal tab
     (`window.open(v,'sssPdf')`, no size features) instead of the raw PDF, so the portal "Printable PDF" tiles
     match. **Emily must RE-PASTE portal.html BLOCK 3 into Webflow** for the portal side to go live (the flipbook +
     PDFs are repo-served and already live). Commits dc2facf6 (viewer routing) + 4df0613b (normal tab).
   - **Skipped** the optional `app.launchURL` add-on for downloaded-in-Adobe copies: it would DEAD-LINK the PDF
     for anyone who downloads it and opens it in Chrome/Edge, and the viewer makes it unnecessary. Offer if asked.

### >> LATEST (2026-08-21) - MY LESSONS inline login + block-2 redesign (portal).

**The logged-in "My Lessons" portal page now has an INLINE sign-in** (Aug-19 UX fix). It solved: the welcome
email linked to a login page that, once signed in, defaulted to **My Courses** (On-Demand) not My Lessons - and
most email clicks land LOGGED-OUT (email opens in an isolated in-app browser). New flow: the user signs in **in
place on My Lessons** and never navigates away. Canonical code: `webflow-embeds/portal.html` (3 Webflow HTML
embeds, stacked). Live: `candlerfoundry.emory.edu/customer-portal/my-lessons`. Latest portal.html commit: 7a91b5c.

### Block 3 - "Your Packets" + inline sign-in (self-switching by login state)
- Both states live in ONE section; **`foxy-logic` shows exactly one** (hides the wrong one, reveals the right
  one - never both). NOTE: previewing the raw HTML with no foxy-logic present shows BOTH; that is a preview
  artifact only, not the live behavior.
  - **Logged OUT** -> `.pk-login` card (`foxy-logic-authenticated="false"`).
  - **Logged IN** -> the packet tiles (`foxy-logic-transaction-includes="SSS-BEYONDBUMPER" / "SSS-GOSPELWOMEN"`).
- The card = Emily's Canva art for ALL typography (baked transparent PNGs on Netlify) + flat-color backgrounds +
  the live Foxy form. Assets: `assets/sss-portal-lock.png` (open-padlock woodcut), `assets/sss-portal-signin-head.png`
  ("Don't see your lessons? Please sign in below:"), header `assets/sss-portal-header-v2.png`. Backgrounds: lavender
  `#DFE6F4` + white card `#fff` (sampled from Emily's Canva). **NEVER re-render her display fonts live - she vetoed
  that (renders poorly); all her text is baked PNGs, only the Foxy form fields are live.** Layout: heading centered
  full-width on top (~510px), then a centered row [lock 92px | Foxy form 400px]; card max-width 600px; stacks on mobile.
- **After an inline sign-in we `location.reload()`** (on the Foxy element's `signin` event) so foxy-logic
  re-evaluates the now-logged-in session and swaps to the tiles - same URL, user stays on My Lessons. If the
  `signin` event name is ever wrong, sign-in still works; tiles just need one manual refresh. NOT YET OBSERVED
  FIRING LIVE - verify on a real sign-in.

**>> SECTION-3 SCALE MATCH + NEXT-SESSION PICK-UP (2026-08-21 pt.7). READ THIS FIRST.**
Emily wants the LANDING "Choose Your Packet" (block 3) and the logged-in PORTAL "Your Packets" (block 3) at the SAME
card scale, and **prefers the larger portal size**. So: portal.html was left at its original size (do NOT cap it);
landing.html block 3 was scaled UP to match — removed its `max-width:1200px` cap and wrapped the image in
`<div style="max-width:2530px;margin:0 auto;padding:0 2.6%;box-sizing:border-box">` (2.6% side padding = the portal
`.pk3` side padding; the positioned image div stays padding-free so the 4 hotspots keep aligning). Verified: landing
card 604px vs portal card 605px in a shared 1400px container (both scale linearly → match at every width). NOTE
landing blocks 1 & 2 (hero, how-it-works) are still `max-width:1200px` — only block 3 widened.

**CURRENT canonical assets (all live on Netlify):** landing = `sss-landing-hero-v3`, `sss-landing-getstarted-v4`
(slide 6), `sss-landing-packets-v4` (slide 7) + `sss-landing-packets-edge` (full-bleed strip). portal =
`sss-portal-hero-v3`, `sss-portal-letslearn-v3`, `sss-portal-header-v3` (slide 14), `sss-portal-tile-bbs-v4` /
`sss-portal-tile-women-v4` (slides 12/13), plus `sss-portal-lock` / `sss-portal-signin-head` (sign-in card).

**DONE + LIVE (repo-served, no paste needed):** flipbook **Cover tab**; **Recommended Reading swap** in both packets
+ both PDFs re-cut (BBS 19pp, Women 22pp); BBS L4 title etc. **DONE in repo, ⚠ EMILY MUST PASTE into Webflow/ESP:**
`webflow-embeds/landing.html` blocks **2 & 3**, `webflow-embeds/portal.html` block **3** (has clickable covers +
v4 tiles at preferred size), and the refreshed **welcome-email HTML** (now stored at `webflow-embeds/welcome-email.html` for recoverability;
destination = Emily's ESP — flow = one action, inline-login language, no password blurb; keeps the
`{{=gives["375476935"][...]}}` merge tokens).

**STILL OPEN (Emily's input needed):** (1) **BBS artwork pick** (only De Morgan→L1 + Rembrandt→L4 found; Claude
proposed Michelangelo→L5, Hicks→L3, maps, word-study tip) → then wire `artwork[]` + re-cut BBS PDF. (2) **3MB-273 khanun** — ✅ **2026-08-26 SHIPPED + LIVE**: corrected Larry masters arrived; captioned (name card now "LARRY VARGHESE"), **Vimeo `1221254097`**, wired into Women L1 `optionalVideos`, **Women PDF re-cut (22pp)**, Airtable set (Vimeo/Dropbox/Status/proofed transcript). ⚠ Only remainder: Emily must add "Larry Varghese" as an Airtable `Instructor/Speaker` single-select option (API can't create it) to correct the speaker (currently wrongly Bonfiglio). (3) **Drag 11 supplemental Vimeos** into
the "3 Minute Bible" folder (token lacks interact scope). (4) Optional: widen landing blocks 1 & 2 to match block 3.

**✅ Vimeo POSTER de-blur (2026-08-26).** Some flipbook Additional-Resources 3MB videos loaded with a **blurry title-card still** (Vimeo auto-picked a poster frame mid-animation; playback was fine). Fixed all **14 optional videos** → crisp title-card posters via the Vimeo pictures API (sample intro frames, pick the sharpest dark title card, set active — no re-upload). The **12 main lesson videos** can get the same treatment (offered).

**⚑ NEXT-SESSION HANDOFF (2026-08-26).** **(A) Webflow nav:** add **"Sunday School Simplified"** to the Candler Foundry homepage **Resources** dropdown → link **`/sunday-school-simplified`** (manual in Webflow Designer — that's the Foundry Webflow site, NOT this Netlify repo; the navbar is likely a global symbol, so one edit applies site-wide; confirm the exact live slug — a scripted GET returned 401). **(B) 3MB backlog:** caption the **17 "missing-record" 3MB videos** (Airtable Type=3MB with no Vimeo link and no captioned master) and add transcripts + Vimeo/Dropbox links; source = the Lavender July-2026 delivery (Arnold 13 + Bonfiglio 15 + Larry 6). ⚠ Several "Bonfiglio"-labeled records are actually **Larry Varghese** (271 hesed, 272 rakhum confirmed). A separate **50** already-captioned records (Status=Complete) just need a Vimeo upload + link. **3 decisions await Emily:** scope (the 17 vs also the 50) / review-gate style / OK to fix mislabeled speakers (+ she must add the "Larry Varghese" Airtable option). Full detail: the 3MB pipeline README (`Dropbox\3MB\SSS 3MB Captioning Pipeline\README.md`) + memory `project-3mb-july2026-delivery`.

**>> COVER TAB + RECOMMENDED-READING SWAP (2026-08-21 pt.6).** (a) **Flipbook Cover tab** — `engine/render.js`
now renders a **"Cover"** tab (first in the tab column, `fa-book` icon) that jumps back to the front cover
(`flip.flip(0)`); active when `pageIndex<=1`. Shared engine → both packets. Verified live on BBS (Contents→Cover
returns `on-cover`, active "cover"). (b) **Recommended Reading swap (BOTH packets)** — dropped both *Womanist
Midrash* volumes; added **The Old Testament: A Historical and Literary Introduction to the Hebrew Scriptures**
(Coogan & Chapman, Oxford, **5th ed** 978-0-19-776817-4) + **The Writings of the New Testament: An Interpretation**
(L.T. Johnson & Todd C. Penner, Fortress, **3rd ed** 978-0-8006-6361-2); both on Amazon + Bookshop (verified live).
`meta.recommendedReading` updated in both content.js (targeted edit, `·` = U+00B7 separator). **Both PDFs re-cut**
(`packet_pdf.py`; BBS 19pp, Women 22pp; reading page paginates to an "(cont.)" page — verified render, Coogan 2-line
title wraps clean, no Womanist). All pushed + Netlify-verified. ⚠ Emily: no paste needed for these (flipbook/PDF are
repo-served) — but the landing/portal Webflow pastes (pt.4/pt.5) are still pending.

**>> LANDING v4 + PORTAL CLICKABLE COVERS (2026-08-21 pt.5).** (a) **Landing section 2** = new Canva slide 6
(formatting fixes) -> `assets/sss-landing-getstarted-v4.png`; landing.html block-2 src bumped v3->v4, "CLICK HERE"
hotspot unchanged (`44/79.5/12.5/6.5`, re-verified). (b) **Landing section 3** = new Canva slide 7 (readability
redesign: cream cards, cover-left, buttons now STACKED on the right) -> `assets/sss-landing-packets-v4.png` + regen
full-bleed edge strip. Register/Learn More hotspots restacked (were side-by-side): BBS Register `27.1/70.7/13.8/8.4`
+ Learn More `27.1/77.7/13.9/8.3`; Women Register `76.3/70.7/13.8/8.4` + Learn More `76.3/77.7/13.9/8.3`. (c)
**Portal tiles: the packet COVER thumbnail is now clickable** -> `/sss/<slug>` (hotspot `5.5/8.5/46/80`, radius 14),
added on BOTH tiles alongside Open Packet/Printable PDF. All assets live on Netlify; landing.html + portal.html
pushed. ⚠ Emily re-pastes landing blocks 2&3 + portal block 3. **STILL OPEN (finalize today):** flipbook COVER tab
(engine `render.js`); Recommended-Reading swap (drop Womanist Midrash both packets, add L.T. Johnson *Writings of
the NT* 3e 9780800663612 + Coogan/Chapman *The Old Testament* 4e 9780190608651 or 5e 9780197768174) + re-cut both
PDFs.

**>> BLOCK-3 TILE REDESIGN (2026-08-21 pt.4).** Emily redesigned the logged-in "Your Packets" tiles for readability
(Canva `DAHRnlJvmA4` slides 11-14: 11=assembled reference, 12=BBS tile, 13=Women tile, 14=background+header;
`YOUR PACKETS` header). New tiles are a LANDSCAPE card (cover LEFT; VOLUME + title + description RIGHT; **Open Packet**
filled pill above **Printable PDF** outlined pill; "6 LESSONS" footer) - same ~1.315 aspect as the old portrait-ish
tiles so the existing `.pk-grid` layout was reused. Assets (exported via Canva connector, cropped to the card by
opaque-alpha bbox, 256-color FASTOCTREE PNGs preserving the transparent rounded corners): `sss-portal-tile-bbs-v4.png`
(1093x831, 45KB), `sss-portal-tile-women-v4.png` (1095x831, 40KB), header `sss-portal-header-v3.png` (752x197, from
slide 14; section bg stays flat #DFE6F4 = slide-14 bg). **Hotspots RESTACKED** (were side-by-side Open Booklet/PDF):
both tiles use **Open Packet `left:55.5% top:70% w:28% h:10%`** + **Printable PDF `left:55.5% top:80.3% w:28% h:10%`**
(color-detected pill bboxes + padding; overlay-verified). Labels "Open the ... packet". **Removed the stale mobile
`.tile a{top:78.3%;height:14%}` override** (it forced both hotspots to one row - wrong for the stacked layout; the %
hotspots scale fine on mobile). Header `.pk-head` bumped to width:40%/max 752px. Verified assembled at 1200px. Old
`sss-portal-tile-bbs/women-v3` + `sss-portal-header-v2` are SUPERSEDED. ⚠ Emily re-pastes portal.html block 3.

### Foxy `<foxy-customer-portal>` customization - REUSABLE REFERENCE
Same element as the Account page (`base="https://the-candler-foundry.foxycart.com/s/customer/"`, module
`https://cdn-js.foxy.io/elements@1/foxy-customer-portal.js` + the i18n `onResourceFetch` hook). Auth is
**email + password** (NOT magic-link - which is why inline login works without a second webview).
- **Show/hide sub-controls via `hiddencontrols`** (BooleanSelector, space-separated). The logged-out view
  (`InternalCustomerPortalLoggedOutView`, `infer=""` so paths are un-prefixed from the element) exposes:
  `sign-in:header` (Foxy's own "Sign in" + "Please enter your email and password"), `sign-in:signup`
  ("Create account"), `sign-in:recover` ("Get temporary password" = forgot-password), `sign-in:form`.
  **We set `hiddencontrols="customer:subscriptions sign-in:header sign-in:signup"`** -> hides the duplicative
  header (Emily's baked heading replaces it) + truly removes Create-account from the DOM (no phantom click
  target), and KEEPS "Get temporary password". (A store-level "disable sign-up" toggle would strip Create-account
  everywhere incl. the real customer portal - Emily won't do that; hiddencontrols is per-embed.)
- **Theming = Lumo design tokens** (`--lumo-*` on the element). GOTCHAS learned by inspecting the LIVE DOM:
  - The primary **"Sign in" BUTTON background is NOT themeable** - Foxy paints it its own blue `rgb(22,118,243)`
    internally, ignores `--lumo-primary-color`, exposes no `::part`. **Button stays Foxy blue (Emily OK with it).**
    A fully custom form could recolor it but would own the session foxy-logic reads = risky; not worth it.
  - The tertiary **"Get temporary password" link TEXT color = `--lumo-primary-text-color`**. Set it to NAVY
    `#24364b` (NOT white - white made the link INVISIBLE on the white card; real bug we fixed). The Sign in button
    keeps its white label (uses `--lumo-primary-contrast-color`, unaffected).
  - Also set: `--lumo-primary-color:#24364b`, `--lumo-border-radius-m/l:11px`, `--lumo-base-color:#fff`,
    `--lumo-font-family:'Avenir Next',...`.
  - Control-name / part source of truth: `Foxy/foxy-elements` repo,
    `src/elements/public/CustomerPortal/InternalCustomerPortalLoggedOutView.ts` + `SignInForm/SignInForm.ts`; i18n
    keys in `cdn-js.foxy.io/elements@1/translations/customer-portal/en.json` (keys under `sign-in-form.*`).

### Block 2 - redesigned "LET'S GET GOING!" (Canva slide 10)
- **Dropped the personalized "LET'S LEARN, <NAME>"** -> REMOVED the live Thierry name overlay, its shrink-to-fit
  script, the `@font-face`, and the `foxy-logic-display` source. **This permanently kills the mobile FRIEND-pill /
  Thierry-font-drift problem, and the old "upload thierry.woff2 to Webflow" to-do is no longer needed for the
  portal.** Also dropped the "Don't see your lessons? LOG IN" hotspot (login is now inline in block 3). Block 2 is
  now just the band image + two hotspots.
- New band image `assets/sss-portal-letslearn-v3.png` (2400x750, same framing as v2). Hotspots (nudge % if they
  drift): "Browse available lessons HERE" -> `/sunday-school-simplified` (left:65.5% top:66% w:5.5% h:6.5%);
  "Email us HERE" -> `mailto:candlerfoundry@emory.edu` (left:51.5% top:75.5% w:5.5% h:6.5%). CONFIRM the email addr.

### >> DONE (2026-08-21): LANDING page block-2 copy refreshed (Canva slide 6)
Emily's "more seamless" landing block-2 is shipped in `webflow-embeds/landing.html`. Slide 6 (design `DAHRnlJvmA4`)
was retitled from "Let's get started" to a 3-step **"HERE'S HOW IT WORKS:"** card (1 Register for your FREE
packet(s) below / 2 Check your inbox / 3 Open packet - each includes SIX lessons) + footer "Already registered?
CLICK HERE to access your lessons." Exported slide 6 -> `assets/sss-landing-getstarted-v3.png` (2400x1000, 256-color
PNG 137KB, live on Netlify). **The "CLICK HERE" hotspot now points to `/customer-portal/my-lessons`** (was
`/customer-portal/account`) - inline login lives there now. Hotspot re-measured on the new crop:
`left:44% top:79.5% w:12.5% h:6.5%` (overlay-verified snug over the bold "CLICK HERE"). Alt text refreshed.
Also fixed the block-3 "Learn More" modal Widow ref `1 Kings 17:1-16` -> `17:1-24` (matches the packet).

**BLOCK-3 FULL-BLEED FIX (2026-08-21):** the "Choose Your Packet" lavender band was capped at 1200px (baked into
`sss-landing-packets-v3.png`), so the color stopped short of the browser edges. Restored the original full-bleed
intent (README "heroes reshaped" block: art bands full-bleed, tiles at 1200px): block 3's outer div is now
`width:100%` with the lavender running edge-to-edge via a STRETCHED EDGE-STRIP background
(`assets/sss-landing-packets-edge.png`, an 8x1200 crop of the panel's left edge, `background-size:100% 100%`) so the
baked vertical gradient matches seamlessly at the 1200px boundary; the packet-card image stays centered at max
1200px on top. Verified at 1500px viewport (lavender fills both edges, no seam). If the band still stops short on
Emily's live page, her HTML Embed is inside a constrained Webflow container (not a full-width section) - move the
Embed to a full-width section, or switch the wrapper to `width:100vw;margin-left:calc(50% - 50vw)`.

**⚠ Emily still has to PASTE landing.html blocks 2 AND 3 into their Webflow embeds to go live.** Latest landing.html
commit supersedes the older one. Remaining tie-in: repoint the **welcome email** link straight at My Lessons
(DONE 2026-08-21 - welcome email refreshed to one-action inline-login flow; lives in Emily's ESP, not the repo).

### How the portal work was verified
Tested on the LIVE page via the in-app browser + JS injection on the real Foxy component (hiddencontrols removing
the header/create-account, the navy recover link, the centered/enlarged heading) BEFORE baking into portal.html.
Emily re-pastes each block into the Webflow embeds to go live.

### ▶▶ LATEST (2026-08-18) — it supersedes older status below

**Additional Resources page was REDESIGNED as a dropdown accordion (shared engine).** `resourcesPage()`
in `engine/render.js` now builds one collapsible row per lesson that has extras + a shared **Recommended
Reading** row. **The separate end page is GONE** — the Candler Foundry sign-off (a **shrunk, LINKABLE**
logo `assets/candler-foundry-logo.png` + **linkable** `candlerfoundry.emory.edu`) now sits at the bottom
of the resources page. (The old end-page URL said `candlerfoundry.org` — WRONG; fixed everywhere.)
**Video labels no longer say "· optional."** Schema now: per-lesson **`optionalVideos`** (ARRAY;
singular `optionalVideo` still accepted for back-compat) + **`artwork`** (array, link-out) + meta-level
**`recommendedReading`** (array). Verified live on both packets; the page fits the fixed 816×1056 page
with the fullest row open (`.acc` is flex:1 scroll, footer flex:0).

**Women "extra 3MB per lesson" (Additional Resources) — status:**

| Women lesson | supplemental 3MB | Vimeo | state |
|---|---|---|---|
| L1 Hannah | `3MB-273` *khanun* | — | **ON HOLD** — see below |
| L2 Two Daughters | `3MB-258` *pistis* | `1219313246` | LIVE (L2 also keeps *Mark's Secret Messiah* `1210281410`) |
| L3 Shiphrah & Puah | `3MB-68` *What is Torah?* | `1219255056` | LIVE |
| L4 Zelophehad | `3MB-267` *mishpat* | `1219343599` | LIVE |
| L5 Tamar | `3MB-65` *Are OT figures a model of faithfulness?* | `1219254921` | LIVE |
| L6 Widow | `3MB-85` *Orphan, widow, stranger* | `1219255238` | LIVE |

- **`3MB-273` *khanun* is ON HOLD.** Its baked name lower-third reads only **"LARRY"**; the speaker is
  **Rev. Larry Varghese**, NOT Bonfiglio — and **Airtable's `Instructor/Speaker` for 3MB-273 wrongly says
  Bonfiglio**. **The producer is re-cutting ALL of Larry's videos to fix the name card**; wire khanun
  (and any other Larry 3MBs) only when those corrected masters arrive. Then: caption → Vimeo → Airtable
  (also fix the speaker field) → wire Women L1 → re-cut Women PDF. Do NOT publish the current file.
- **Per-lesson ARTWORK** (link-out, 2–3 per Women lesson) is wired from Emily's list. **BBS artwork is
  PENDING** (Emily's Codex is researching it).
- **Yale "The Gospel of Mark" reading was removed** from Women L2 (Emily's call).

**Recommended Reading (5 commentaries) is on BOTH packets** (`meta.recommendedReading`): Women's Bible
Commentary 3e `9780664237073`; Theological Bible Commentary `9780664227111` (**Amazon-only — not on
Bookshop**); NT in Color `9780830814091`; Womanist Midrash v1 `9780664239039`; v2 `9780664266011`.
Amazon = `amazon.com/dp/<isbn10>`, Bookshop = `bookshop.org/book/<isbn13>`.

**Both printable PDFs were re-cut** (`tools/packet_pdf.py` updated): resources section reads
`optionalVideos[]` + `artwork[]` + `optionalReadings` + a Recommended Reading section (new `book_box`),
and **the end page now uses the real logo IMAGE (linkable) instead of the flipbook-font wordmark**, URL
`candlerfoundry.emory.edu` (logo + URL both linkable). PDF build = **Python 3.14** (`/c/Python314/python`
has reportlab/qrcode/pymupdf/fontTools/cu2qu/brotli); reconstruct the repo tree, run
`tools/prep_fonts.py --out fonts`, put `content.json`(from content.js)+`cover.png`+**`logo.png`**(=
packet `assets/candler-foundry-logo.png`) beside `make_pdf.py`/`make_women_pdf.py`. PDFs live at
`packets/<pkg>/<meta.pdf>`.

**⚠ VIMEO FOLDER FILING PENDING — Emily to do (or give an `interact`-scoped token).** These 5 published
videos are public but could NOT be filed into the **"3 Minute Bible"** folder (project `27506621`) via
API — the token scope is `private edit upload video_files public` (no `interact`), so the folder PUT
returns 403. Drag them into the folder in the Vimeo UI:
`3MB-65` (1219254921) · `3MB-68` (1219255056) · `3MB-85` (1219255238) · `3MB-258` (1219313246) ·
`3MB-267` (1219343599).

**✅ DONE (2026-08-20) — 6 supplemental 3MBs wired into BEYOND BUMPER STICKERS.** All uploaded public,
Airtable `Vimeo Link` set, wired into `content.js` `optionalVideos[]`, and in the re-cut PDF (19pp),
verified live on Netlify:

| BBS lesson | supplemental 3MB | Vimeo |
|---|---|---|
| L1 For I Know the Plans | `3MB-249` *What happened during the exile?* | `1219870379` |
| L2 Be Still | `3MB-74` *Who wrote the Psalms?* | `1219870516` |
| L3 Have Dominion | `3MB-262` *What is adam?* | `1219676911` (wired Aug 19) |
| L4 I Can Do All Things | `3MB-42` *What is an encomium?* | `1219870600` |
| L5 All Scripture Is Inspired | `3MB-20` *Who wrote the Pauline letters?* + `3MB-25` *What are the Pastorals?* | `1219870709` · `1219870840` |
| L6 Love Is Patient | `3MB-28` *Understanding Paul's Letters* | `1219870939` |

**⚠ Emily to do:** drag these 6 into the Vimeo "3 Minute Bible" folder (project `27506621`) — the token
lacks `interact` scope (403). **BBS artwork still PENDING** — Emily's Codex found only 2 pieces (De Morgan
*By the Waters of Babylon* → L1; Rembrandt *Saint Paul in Prison* → a Paul lesson, likely L4). Because
several BBS lessons are abstract (not narrative), Claude proposed additions tied to a concrete anchor in
each text: Michelangelo *Creation of Adam* → L5 (2 Tim "God-breathed" + Gen 2:7), Edward Hicks *Peaceable
Kingdom* → L3 (dominion-as-care), plus non-painting supports (maps; a word-study "tip" sidebar like L3's;
Psalm 46 → Luther's "A Mighty Fortress"). Awaiting Emily's pick before wiring `artwork[]` + re-cutting PDF.

**The pattern (for future BBS/Women supplemental additions).** For EACH:
1. **Look it up in Airtable first** (base `appiL0Z2RilcAT2Cw`, table `tblS1Bk29cXyGGUdo`) — code, `Name`,
   `Instructor/Speaker`, existing transcript/Vimeo. Refer to it by **`3MB-<code>` + title**, never number.
2. **If it lacks a captioned master, caption it** via the pipeline (`…\Dropbox\3MB\SSS 3MB Captioning
   Pipeline\`): Whisper **medium** + AI proof (Greek/Hebrew, scripture refs, ASR), **intro-gate**
   (captions start only after the name card clears — 3rd standing rule), ≤2-line burn. Then Emily's
   review gate unless she says otherwise. Diff the new transcript vs the Airtable transcript and
   hand-fix (e.g. "Biblical"→"biblical"). See that README's §3 (naming/filing) + §4 (pipeline).
3. **Upload to Vimeo PUBLIC** — stage the file OFF the Dropbox mount first (WinError 389 guard), create
   with `privacy.view=anybody, embed=public`, name = Airtable `Name` (e.g. "What is Torah?"), desc =
   "A 3 Minute Bible with <Speaker>. From The Candler Foundry…". (Folder add will 403 — see above.)
4. **Airtable**: write the `Vimeo Link` (and `Transcript` if newly proofed). Status stays "Draft".
5. **Wire into `packets/beyond-bumper-stickers/content.js`** as `optionalVideos: [ {title, subtitle:"3
   Minute Bible", url} ]` on the right lesson (do NOT write "optional"). content.js keeps short arrays
   inline — edit with TARGETED string replacements, never a full `json.dumps` reserialize.
6. **Re-cut the BBS PDF** (see build note above) and push it to `packets/beyond-bumper-stickers/`.
7. **Naming/filing taxonomy** for the working files: `3MB-<code> - <Title> - <Speaker last name>\` with
   `(Captioned).mp4` / `- Horizontal - Uncaptioned.mp4` / transcripts / `.words.json` — pipeline README §3.


**This block is the current state of the project — read it first.** Anything left over from the older
2026-08-07 priority list now lives under **"Carried-forward open items"** near the bottom of this file.
Three workstreams; two are essentially done and the third is waiting on Emily.

**1) Videos — ✅ ALL DONE except one held master (2026-08-17).** Emily approved the corrected batch and
said "embed all of the videos", so four went up public in one session, all wired, all verified playing
live, all written to Airtable:

| Packet · lesson | 3MB code | Vimeo | Vimeo title |
|---|---|---|---|
| BBS L1 | `3MB-283` | `1218983605` | The Story of Jerusalem |
| BBS L4 | `3MB-44`  | `1218993379` | Did the biblical texts have chapters, verses, and section headings? |
| BBS L5 | `3MB-287` | `1218983645` | Scripture Inspired by God |
| BBS L6 | `3MB-288` | `1218983700` | Love Is Patient, Love Is Kind |
| Women L6 | `3MB-280` | `1219007254` | The Widow of Zarephath |

**✅ EVERY LESSON IN BOTH PACKETS NOW HAS AN EMBEDDED VIDEO — 12 of 12.** The Widow master finally
landed and went through the full pipeline on 2026-08-17 (see the Packet #2 section for its splice,
which did NOT follow the usual template). Titles are the **on-screen slide titles with no series
suffix**, per Emily;
`3MB-44` has no short slide title so its Vimeo name came from the **Airtable `Name`** field — rename it
if that reads long. Two things to know for next time: the whole batch deliberately stays
**Status = "Draft"** in Airtable (matching the six published in July — Status does not track publication
in that table), and **`3MB-44` carries the FEBRUARY caption style** (up to 3 lines, different placement)
rather than the v2 ≤2-line standard the other nine use — it was uploaded as-is at Emily's direction, so
re-caption at medium and re-burn if the packet should look uniform. Historical detail below.

<details><summary>How they got here (Aug 14 note)</summary>

**3 captioned, awaiting Emily's review (HARD GATE before Vimeo).**
`3MB-283` (Jeremiah / L1), `287` (2 Timothy / L5), `288` (1 Corinthians / L6) are spliced with the
corrected title cards, captioned at Whisper-**medium** + AI-proofed, and **re-burned 2026-08-14 with
proofing fixes** (287 "Church"→"church"; 283 "Washington DC"→"Washington, D.C."; "scripture"→
"Scripture" normalized; Greek/Hebrew transliterations verified public-friendly). Review copies live in
`…\Dropbox\3MB\NEW VIDEOS GO HERE\_CAPTIONED FOR REVIEW\`. **Next after Emily approves:** Vimeo (public)
→ Airtable (Transcript + Vimeo Link) → wire BBS **L1/L5/L6** `videoUrl` in `content.js` → re-cut the BBS
PDF. **Also open:** L4 **Philippians (`3MB-44`)** — captioned (Feb) + filed already; Emily to decide
**upload as-is vs re-caption at medium**. Canonical runbook = the pipeline-folder README
(`…\Dropbox\3MB\SSS 3MB Captioning Pipeline\`).
</details>

**2) Webflow marketing surfaces — public landing + logged-in "My Lessons" portal.**
**Canonical embed code now lives in [`webflow-embeds/`](webflow-embeds/)** (`landing.html`, `portal.html`,
`README.md`) — do NOT reconstruct it. Built from Canva **`DAHRnlJvmA4`** (shortlink
`canva.link/l2565l075ywv8cs`). **CURRENT assets in `assets/`** (older versions superseded — use these
exact names): landing = `sss-landing-hero-v3`, `sss-landing-getstarted-v2`, `sss-landing-packets-v3`;
portal = `sss-portal-hero-v3`, `sss-portal-letslearn-v2`, `sss-portal-header-v2`,
`sss-portal-tile-bbs-v3`, `sss-portal-tile-women-v3`. The personalized greeting uses self-hosted
**Thierry Leonie** (`engine/assets/fonts/thierry.woff2`, CORS via repo `_headers`). **Sizing factor is
per-band and must be RE-MEASURED whenever the art changes** — Thierry caps are 96% of the em, so
factor = (baked cap-height / imgWidth) / 0.96. The current compact band (`sss-portal-letslearn-v2`,
2400x750) uses **`clientWidth * 0.0269`**; the older 2400x1000 band used 0.0443. Landing (hero /
get-started / choose-packet) + portal (hero / let's-learn / your-packets) are built. **Two things are
waiting on Emily, and nothing changes on the live site until she does them:**
   - **⚠ PASTE THE SECTION-3 EMBED.** The rebuilt "Your Packets" code sits in
     [`webflow-embeds/portal.html`](webflow-embeds/portal.html) but has **not** been pasted into the
     Webflow embed yet.
   - **⚠ THE `SSSThierry` FONT ISSUE IS STILL OPEN** (portal section 2). The live "LET'S LEARN, NAME"
     text fell back to a system font on Emily's Webflow page. Playwright proved the Netlify font loads
     fine cross-origin (200, `Access-Control-Allow-Origin: *`), so it is **Webflow-environment-specific**
     — either a CSP on `candlerfoundry.emory.edu` blocking the cross-origin font, or a conflicting
     "Thierry Leonie" already in Webflow. The shipped fix renames the `@font-face` to a unique
     **`SSSThierry`** so it cannot clash, and falls back to `'Thierry Leonie'`. **Emily to do:** upload
     `thierry.woff2` to **Webflow → Project Settings → Fonts** named exactly **"Thierry Leonie"** (serves
     it same-origin, CSP-proof). **If it is still wrong after that upload it IS a CSP** — have her open
     the live page console (F12) and look for a red CSP / `thierry.woff2` / `netlify` error.
     **LESSON: always test the DEPLOYED setup via Playwright; a local same-origin @font-face test hides
     CORS/CSP problems.**

Section-3 detail:
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
lessons in Canva **`DAHOtl4BNMk` pages 19-30** (shortlink `canva.link/acnz1mieryl38ts`) — the range
**MOVED** (it was 8-19), so **always re-read the design; never trust stored page numbers**. All 12 pages
were re-exported, verified and pushed; `content.js` was re-synced to the art; hotspots were re-measured;
and the printable PDF was re-cut in the Beyond Bumper Stickers format. See "Packet #2" below for the
per-lesson list of what changed. **Still open on this packet:** the **letter + a packet-wide prayer pass**, which are Emily's own
writing items. Its L6 video landed 2026-08-17, so the packet is otherwise complete.

**4) NEW + BIG — caption the whole 3 Minute Bible back catalogue.** Emily (2026-08-17): the new 3MBs
"all need captions burned in with whisper medium, using AI to check and correct the transcriptions that
are created and focusing in particular on greek and hebrew words, biblical naming conventions and
spelling, and other academic and punctuation errors." That is exactly what `caption_pipeline.py`
already does — this is a **backlog run of the existing pipeline**, not new tooling. Scope from Airtable
on 2026-08-17: **206 records total · 163 have a Dropbox video · 199 have some transcript · only 11 have
a Vimeo link → ~195 unpublished, of which ~163 have a file to work from.** Budget roughly **5–6 minutes
of Whisper-medium per 3-minute video on this CPU**, plus AI proof and burn. Practical plan: work in
batches, keep Emily's review gate, and see **"Re-doing a video that is already published"** below for
the mechanics. Confirm the batch order with Emily — the SSS-linked ones are already done.

**Everything that is genuinely still open, in one place:**

**A. Emily's actions**

| # | Item | Where |
|---|---|---|
| A1 | Upload `thierry.woff2` to Webflow → Project Settings → Fonts as **"Thierry Leonie"** — fixes the live greeting font. If still wrong afterwards it IS a CSP; send the F12 console error | Webflow |
| A2 | Women packet **letter + packet-wide prayer pass** (her writing) | `content.js` |
| A3 | Fix the **Women** portal tile's "Printable PDF" pill — it has a baked drop shadow the **BBS** tile lacks | Canva `DAHRnlJvmA4` p12 |
| A4 | Decide the batch order / priority for the big captioning backlog (workstream 4 above) | — |

*(A1 is all that remains of the portal work — Emily embedded the section-3 code in Webflow on 2026-08-17.)*

**B. Claude's queue — approved, just needs doing**

| # | Item | Notes |
|---|---|---|
| B1 | **Re-splice `3MB-44`** with the new title card (Canva `DAHOtl4BNMk` **page 35**, "Understanding Biblical Structure") | It is already published, so follow **"Re-doing a video that is already published"** below. Vimeo canNOT replace a file in place → new id → re-wire BBS L4 + re-cut the BBS PDF. Vimeo title already renamed to "Understanding Biblical Structure" (2026-08-17). |
| B2 | ~~Upload `3MB-85` and wire under Women L1/L4~~ — **DONE / SUPERSEDED (2026-08-18).** `3MB-85` is now the supplemental video on **Women L6** (`1219255238`); the whole Additional-Resources redesign shipped. See the **▶▶ LATEST** block at the top. |
| B3 | **Bitly-shorten the scripture links in the PDF** so a printed Bible Gateway URL is typable | Emily's call (2026-08-17). Currently QR + hyperlink only, because the raw URLs are 90+ char encoded query strings. **Needs a Bitly account/API token — ask Emily where it lives.** |
| B4 | Webflow greeting should read **"LET'S LEARN, EMILY!"** — add the exclamation mark | `webflow-embeds/portal.html` section 2. **Batch with B5** so Emily only re-pastes once. |
| B5 | The **landing-page header animation** exists in the design but not in the Webflow embed code — identify it and reproduce it | `webflow-embeds/landing.html`. **Batch with B4.** |
| B6 | Big captioning backlog (workstream 4) once Emily sets the order | ~163 videos with files |
| B8 | **Housekeeping - clear published copies out of `_CAPTIONED FOR REVIEW`.** `3MB-283` *The Story of Jerusalem*, `3MB-287` *Scripture Inspired by God* and `3MB-288` *Love Is Patient, Love Is Kind* are published but their review copies still sit there. **LEAVE** `3MB-254/255/256/257` (the word studies) and `3MB-279` *Eve* - those are archive-only and were never reviewed. Emily pre-authorised this in principle but **confirm before deleting anything** | `...\NEW VIDEOS GO HERE\_CAPTIONED FOR REVIEW\` |
| B7 | Optional: re-caption `3MB-44` at Whisper medium so its captions match the other nine | It carries the FEBRUARY caption style (up to 3 lines) vs the v2 ≤2-line standard. Can be folded into B1. |

**C. Larger / not started**

| # | Item |
|---|---|
| C1 | Webflow URL reorg — landing moves to top-level `/sunday-school-simplified`; flipbook wrappers stay in `/sss/` (see "Carried-forward" below) |
| C2 | Rewire the Executive dashboard SSS card to the flipbooks/portal (separate repo — read its `CANONICAL.md` first) |
| C3 | Canva `DAHRnlJvmA4` slide-4 typo ("below Perfect for groups" → add the period) — only if that art is reused; the live HTML reads correctly |

**Settled 2026-08-17 — do not re-ask:** `3MB-280` *The Widow of Zarephath* captions are correct and
start at the right time (no re-burn). All 12 wired lesson videos are Airtable **Status = Complete**.
`3MB-44` is renamed on Vimeo. `3MB-85` *Orphan, widow, stranger* **does exist** (it is in Airtable).

**Not a to-do:** the PDF build's fonts. They were previously un-reproducible, but
[`tools/prep_fonts.py`](tools/prep_fonts.py) now regenerates them from this repo — verified to rebuild
both PDFs pixel-identically. Nothing is required of Emily. **Claude: never source these fonts from an
old session scratchpad** — un-instanced copies are still lying around there and they render everything
ExtraLight *without failing*.

---
