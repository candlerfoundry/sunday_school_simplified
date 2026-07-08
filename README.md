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
- Push with the **Git Data API**: GET `git/ref/heads/main` -> read the base commit's tree ->
  POST `git/blobs` (base64) per file -> POST `git/trees` (with `base_tree`) -> POST
  `git/commits` -> PATCH `git/refs/heads/main`. (One commit can carry several files.)
- **Token:** a fine-grained PAT (Contents: Read & Write, this repo only) is at
  `C:\Users\esavant\Dropbox\Sunday School Simplified\.claude-git-token.txt`. Use it;
  **never echo or print the token value.**
- **Netlify auto-deploys** every push to `main` (site `sundayschoolsimplified`). Each
  packet is reachable at its clean URL `/<slug>/`. Only push a packet once it's built,
  verified, and approved — pushing makes it live immediately.

## Verify before you push

Render the changed pages and eyeball them before committing:

- Playwright **chromium** lives in the Flipbook project's `node_modules`
  (`.../Flipbook/node_modules/playwright-core`). The headless shell needs
  `libXdamage.so.1`: `apt-get download libxdamage1`, `dpkg-deb -x`, run with
  `LD_LIBRARY_PATH=/tmp/libs`. The browser cache clears between shell calls, so
  **reinstall chromium in the same call** that launches it
  (`node node_modules/playwright-core/cli.js install chromium`).
- Screenshot the specific pages you changed (or build a small standalone HTML harness that
  inlines `styles.css` and the relevant markup) and review it.

---

## What the site is

- **Series landing:** `index.html` — lists every packet (reads `packets/index.json`).
- **Shared engine:** `engine/render.js` (page builder + StPageFlip driver),
  `engine/styles.css` (design system), `engine/assets/fonts/` (the licensed webfonts).
- **Packets:** `packets/<slug>/` — each self-contained (thin `index.html` shell +
  `content.js` + local `assets/` + optional PDF).

```
sunday_school_simplified/
  index.html                     # series landing page
  engine/
    render.js                    # shared flipbook engine (StPageFlip)
    styles.css                   # shared design system
    assets/fonts/                # thierry.woff2, hello-handmade.woff2
  packets/
    index.json                   # manifest the landing page renders from
    beyond-bumper-stickers/
      index.html                 # thin shell: loads content.js + ../../engine/*
      content.js                 # this packet's copy (window.BBS_CONTENT)
      assets/                    # cover.png, back.jpg, headers/*
      Beyond Bumper Stickers.pdf # optional downloadable packet (secondary product)
  netlify.toml                   # publish "."; rewrites /<slug>/ -> /packets/<slug>/
```

## Design system (current — blue, template-driven)

A clean, playful-but-polished template look (this **supersedes** an earlier 1970s
"road-trip / vintage TV" design — ignore any older references to that).

- **Palette:** navy `#0A274C`, powder blue `#CCE0F5`, smoky blue `#2F5972`, page
  `#FCFDFF`, card `#EAF3FC`; brand red **`#FB1616`** used only as small accents.
- **Type:** **Thierry Leonie** (licensed display — cover, big lesson numerals),
  **Mulish** (body; a free stand-in for Avenir), **Hello-Handmade Sans** (all-caps
  handmade display bits — letter heading, TOC title, sign-off). Thierry + Hello-Handmade
  load via `@font-face` from `engine/assets/fonts/`; Mulish + Font Awesome load from CDN.
- **Icons:** Font Awesome (cdnjs) section headers with **no step numbers**.

**Packet structure (page order):** cover (`assets/cover.png`, full-bleed) · **letter
page** (from `meta.letter`) · **Table of Contents** · **two pages per lesson** · back
cover (`assets/back.jpg`).

**Each lesson = one open spread:**
- **Left (page A):** a per-lesson `headerImage` *or* the engine-drawn header (Thierry
  numeral + red spark); **Opening Prayer**; a **Scripture card**; the **Watch the
  3-Minute Bible** video card; and an optional-video bar if `optionalVideo` is set.
- **Right (page B):** **Discussion Questions**; **Closing Prayer**; footer.

**Scripture (NRSVUE):** the whole Scripture card is clickable and opens a **scrollable
popout modal** showing the passage (`scriptureText`, an HTML string), with an **"Open in
Bible Gateway"** link (new tab) and the NRSVUE attribution. Closes on x, backdrop, or Esc.
Bible Gateway retired standalone NRSV (it redirects to **NRSVUE**), so the whole packet
uses **NRSVUE** — text, links, and the badge. NRSVUE permits up to 500 verses free with
attribution; our passages are well within that.

**Video:** each lesson's Watch card is an illustrated SVG placeholder until you set
`videoUrl` (a Vimeo embed URL), at which point the engine drops in an iframe.

## Content schema (`content.js`)

```
window.BBS_CONTENT = { meta, contentsIntro, lessons: [ ... ] }

meta   = { series, title, letter: { heading, paragraphs[], quotes[], paragraphs2[],
           rhythmTitle, steps[], paragraphs3[], grace, signName } }

lesson = { n, accent, reference, shortRef, title,
           subtitle,            // exists but UNUSED — subtitles were removed globally
           openingPrayer, closingPrayer,
           scriptureRef, scriptureUrl,   // scriptureUrl uses version=NRSVUE
           scriptureText,       // HTML string shown in the popout modal
           videoTitle, videoSubtitle, videoUrl,   // videoUrl empty until Vimeo links exist
           optionalVideo,       // { title, subtitle, url } or null
           headerImage,         // path or null (engine draws a header when null)
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
- **Cover** is Emily's current Canva cover (`assets/cover.png`, 1632x2112).

**Pending inputs from Emily:**
- **Vimeo `videoUrl`s** per lesson (a few weeks out; the 3-Minute Bible MP4s are ~408 MB,
  so they must embed from Vimeo, not self-host).
- **Header images** for lessons 2-6 (only Jeremiah has one so far).
- **PDF re-cut** (secondary product; see below).

## The PDF (secondary, print-friendly product)

The flipbook is the main product; the PDF is an optional printable download and is still
the **earlier design** — not yet rebuilt. Emily's spec for the rebuild: on each lesson,
instead of the full passage text, show **(1) a hyperlink to the exact Bible Gateway NRSVUE
passage and (2) a QR code to the same URL.** Keep it ink-light for home printers.

## Adding a new packet

1. `cp -r packets/beyond-bumper-stickers packets/<new-slug>`; replace `content.js`,
   `assets/`, and the PDF.
2. Add an entry to `packets/index.json`.
3. Push to `main`; Netlify redeploys and the packet appears at `/<new-slug>/`.

Engine files never change when adding a packet.

## Local development

Pure static — serve the repo root (`python -m http.server`) and open `/`.
