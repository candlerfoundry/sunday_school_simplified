# Sunday School Simplified

Online **flipbooks** and downloadable **PDF packets** for the *Sunday School
Simplified* series from The Candler Foundry. One shared flipbook **engine** powers
every packet; each packet supplies only its own content and assets.

- **Live site:** deployed on Netlify from this repo (`main` branch).
- **Series landing:** `index.html` — lists every packet (reads `packets/index.json`).
- **Shared engine:** `engine/` — `render.js` (page builder + StPageFlip driver) and
  `styles.css`. Fix or improve the engine once; every packet inherits it.
- **Packets:** `packets/<slug>/` — each is self-contained.

## Layout

```
sunday_school_simplified/
  index.html                     # series landing page
  engine/
    render.js                    # shared flipbook engine
    styles.css                   # shared flipbook styling
  packets/
    index.json                   # manifest the landing page renders from
    beyond-bumper-stickers/
      index.html                 # thin shell: loads content.js + ../../engine/*
      content.js                 # this packet's copy (window.BBS_CONTENT)
      assets/                    # logo, QR codes, packet art
      Beyond Bumper Stickers.pdf # downloadable packet
  netlify.toml
```

URLs: the series hub is `/`, each packet is `/packets/<slug>/`, and its PDF sits
beside it. The engine files are shared, so a packet page is just a ~40-line shell
plus its `content.js`.

## Adding a new packet

1. `cp -r packets/beyond-bumper-stickers packets/<new-slug>` and replace
   `content.js`, `assets/`, and the PDF with the new packet's.
2. Add an entry to `packets/index.json` (`slug`, `title`, `subtitle`, `accent`,
   `lessons`, `pdf`, `status`).
3. Commit and push — Netlify redeploys; the new card appears on the landing page.

No engine files change. To restyle or fix the flip behavior for *all* packets,
edit `engine/render.js` / `engine/styles.css` once.

## Content schema (`content.js`)

`window.BBS_CONTENT = { meta, contentsIntro, howto, lessons[] }`. Each lesson:

```
{ n, accent, reference, shortRef, title, subtitle,
  openingPrayer, closingPrayer,
  scriptureRef, videoTitle, videoSubtitle, scriptureUrl?, videoUrl?,
  questions: [ five strings ] }
```

Each lesson renders as **two flipbook pages** (one open spread): left = header +
opening prayer + Scripture/video cards; right = five questions + closing prayer.

## Local development

Pure static — serve the folder root:

```sh
python -m http.server    # then open http://localhost:8000/
```

## How code lands here (important)

This repo is mirrored into a **cloud-synced (Dropbox) folder**, where a live `.git`
and large text writes are unreliable. So **GitHub is the source of truth**: changes
are committed straight to `main` via the GitHub API (the token lives in a gitignored
`.claude-git-token.txt` at the Dropbox root, never committed), and the local folder
is a browse-only mirror. Netlify auto-deploys on every push to `main`.

## Planned next

- **Browser editor** (`admin.html`) + Netlify `save-content` function so staff can
  edit any packet's copy and publish without touching code (`/admin` redirect is
  already wired in `netlify.toml`).
- Real per-lesson **QR codes / links** for the Scripture reading and 3-Minute Bible video.
- Mobile (single-page) layout polish.
