# Sunday School Simplified

Online **flipbooks** (the primary product) plus optional downloadable **PDF packets**
for the *Sunday School Simplified* series from The Candler Foundry. One shared flipbook
**engine** powers every packet; each packet supplies only its own content and assets.

- **Live site:** deployed on Netlify from this repo (`main` branch), one site for the
  whole series, each packet at its own clean URL (`/<slug>/`).
- **Series landing:** `index.html` — lists every packet (reads `packets/index.json`).
- **Shared engine:** `engine/` — `render.js` (page builder + StPageFlip driver),
  `styles.css` (retro design system), and `assets/` (shared brand art, e.g. the TV).
- **Packets:** `packets/<slug>/` — each self-contained (shell + `content.js` + assets + PDF).

## Layout

```
sunday_school_simplified/
  index.html                     # series landing page
  engine/
    render.js                    # shared flipbook engine
    styles.css                   # shared retro design system
    assets/tv.png                # shared brand art (vintage TV video frame)
  packets/
    index.json                   # manifest the landing page renders from
    beyond-bumper-stickers/
      index.html                 # thin shell: loads content.js + ../../engine/*
      content.js                 # this packet's copy (window.BBS_CONTENT)
      assets/                    # cover.jpg + packet art
      Beyond Bumper Stickers.pdf # optional downloadable packet (see note below)
  netlify.toml
```

## Design system (flipbook)

A warm, tactile 1970s road-trip aesthetic pulled from the cover art:

- **Palette:** manila/cream paper, ink navy, and a per-lesson accent from a faded
  retro set (rust, teal, harvest gold, plum, denim, brick). Each lesson page sets
  `--accent` inline and every component reads it.
- **Type:** `Anton` (condensed display / titles), `Oswald` (labels, plates, kickers),
  `Newsreader` (serif body, prayers, questions).
- **Texture:** subtle paper grain + vignette on every page; taped-photo corners.
- **Motifs:** photo cover (closed book), route-shield lesson numbers, license-plate
  references, roadside "Scripture Stop" signs, route-marker question numbers.
- **The TV module (replaces QR):** each lesson's left page shows a vintage TV that
  "plays" that lesson's 3-Minute Bible video *inside the screen*. Set `videoUrl` on
  the lesson (a YouTube/Vimeo embed URL) and the engine drops an iframe into the
  screen; with no `videoUrl` it shows a styled "paused" title card.

## Content schema (`content.js`)

`window.BBS_CONTENT = { meta, contentsIntro, howto, lessons[] }`. Each lesson:

```
{ n, accent, reference, shortRef, title, subtitle,
  openingPrayer, closingPrayer,
  scriptureRef, scriptureUrl, videoTitle, videoSubtitle, videoUrl,
  questions: [ five strings ] }
```

Each lesson renders as **two flipbook pages** (one open spread): left = header +
opening prayer + vintage-TV video + Scripture sign; right = five questions + closing
prayer.

## The PDF (secondary, print-friendly product)

The flipbook is the main product; the PDF is an **optional** download people can print.
Because it will often be printed on home/office printers, the PDF is deliberately
**ink-light**: it should use line-art versions of the motifs (drawn bumper sticker,
license plate, TV) rather than full-bleed photos, plenty of white paper, and accent
color only as small spots that still read in black-and-white — no heavy color images.
For the video it carries a short printed link or QR instead of an embed.

> Current status: the PDF in each packet is still the **earlier clean design** and has
> not yet been re-cut to match the new flipbook or the ink-light guidance above. It's a
> secondary deliverable to design after the flipbook content is finalized. See the
> render recipe in the project notes for how the PDF is produced.

## Adding a new packet

1. `cp -r packets/beyond-bumper-stickers packets/<new-slug>`, replace `content.js`,
   `assets/cover.jpg`, and the PDF.
2. Add an entry to `packets/index.json` (`slug`, `title`, `subtitle`, `accent`,
   `lessons`, `pdf`, `status`).
3. Commit and push to `main` — Netlify redeploys and the new packet appears.

No engine files change. To restyle or fix flip behavior for *all* packets, edit
`engine/render.js` / `engine/styles.css` once.

## Clean URLs

`netlify.toml` rewrites `/<slug>/...` to `/packets/<slug>/...`, so each packet's public
URL is `/<slug>/` (e.g. `/beyond-bumper-stickers/`). Attach a Foundry subdomain as a
Netlify **custom domain** (CNAME) and it serves under that hostname directly.

## Local development

Pure static — serve the repo root: `python -m http.server`, then open `/`.

## How code lands here

This repo is mirrored into a **cloud-synced (Dropbox) folder** where a live `.git` and
large text writes are unreliable, so **GitHub is the source of truth**: changes are
committed to `main` via the GitHub API (token in a gitignored `.claude-git-token.txt`
at the Dropbox root), and the local folder is a browse-only mirror. Netlify auto-deploys
on every push to `main`.

## Planned next

- Real per-lesson **video embed URLs** (`videoUrl`) so the TVs actually play.
- Refine the **discussion questions** (drawing on the 3-Minute Bible video themes).
- Re-cut the **PDF** to the ink-light print treatment described above.
- **Browser editor** (`admin.html`) + Netlify `save-content` function (`/admin` wired).
- Mobile (single-page) layout polish.
