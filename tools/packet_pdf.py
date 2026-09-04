#!/usr/bin/env python3
"""Shared printable-packet layout for Sunday School Simplified.

ONE layout, used by both packets (Emily wants them consistent) — `make_pdf.py`
(Beyond Bumper Stickers) and `make_women_pdf.py` (The Gospel According to the Women)
are thin wrappers that only pass a PALETTE. Design brief (Emily, Aug 2026): clean and
easy to print, no graphics, replicate the packet fonts, keep the borders, minimal color.

TYPE SIZES (Emily, 2026-08-17): "at least consistent with 12 point Times New Roman —
a lot of users will be older". Times New Roman's x-height is 0.4473 em, so 12pt Times
has a 5.37pt x-height. Mulish's x-height is 0.5000 em, so the BODY_* sizes below sit
comfortably above that floor (13pt Mulish = 6.50pt x-height = 121% of 12pt Times).
Do not drop below ~10.75pt Mulish or you fall under her floor.

QUESTION NUMBERS are vertically centred on their question block (Emily, 2026-08-17:
they used to sit at the top of multi-line questions). Thierry's digits centre 0.469 em
above the baseline — that constant is why the numerals sit true.

LINKS: every scripture box carries a Bible Gateway QR + link. Every video box carries a
Vimeo QR **and the Vimeo URL printed in full** (Emily, 2026-08-17 — a printed packet has
to be usable without a phone). QR + printed URL both point at the human `vimeo.com/<id>`
page, not the bare `player.vimeo.com` embed.

Re-cut:
  1. pip install reportlab qrcode pillow fonttools brotli cu2qu pymupdf
  2. work/content.json = window.BBS_CONTENT dumped from that packet's content.js
  3. work/cover.png ; fonts/ (see the font warning below)
  4. python make_pdf.py  /  python make_women_pdf.py ; verify; push.

⚠ FONTS: Mulish-normal-500/700/800.ttf + Mulish-italic-500.ttf must be REAL static
instances of the variable font (fontTools.varLib.instancer, pinning wght, then set
OS/2.usWeightClass). If they still carry an `fvar` table, reportlab silently renders
EVERY weight as ExtraLight — that shipped undetected for months. Verify: no fvar, and
the `I` stem width differs per weight (93 / 129 / 156 units at 500 / 700 / 800).
"""
import os, json, io, re, html
import qrcode
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

W, H = letter                     # 612 x 792
M = 52
CW = W - 2 * M
NUM = {1: 'ONE', 2: 'TWO', 3: 'THREE', 4: 'FOUR', 5: 'FIVE', 6: 'SIX'}
BOLD = re.compile(r'\*\*(.+?)\*\*')
THIERRY_DIGIT_CENTRE = 0.469      # em above baseline; keeps numerals optically centred

# ---- type scale (see the header note on the 12pt Times floor) ----
BODY, BODY_LEAD = 12, 17.5        # letter / prose
Q_SIZE, Q_LEAD = 13, 18.5         # discussion questions
PRAYER, PRAYER_LEAD = 13, 18.5
SECTION = 16.5                    # Hello-Handmade section labels
BOX_TITLE, BOX_SUB, BOX_LINK = 13.5, 11, 10.5
NUMERAL = 17                      # Thierry question numbers
FOOT = 8

PALETTES = {
    # accent  : borders, numerals, rules, links   (BBS red / Women mustard gold)
    # second  : eyebrows, references, footers, captions
    # ink     : body + display text
    'bbs':   dict(accent='#FB1616', second='#2F5972', ink='#0A274C',
                  display='#0A274C', box='#0A274C', rule='#D8E2EC', qr='#0A274C'),
    'women': dict(accent='#B8860B', second='#6D4F26', ink='#0A274C',
                  display='#B8860B', box='#B8860B', rule='#E6D9B8', qr='#6D4F26'),
}


def build(work, palette, fonts_dir=None):
    P = {k: HexColor(v) for k, v in PALETTES[palette].items()}
    ACCENT, SECOND, INK = P['accent'], P['second'], P['ink']
    DISPLAY, BOXC, RULE = P['display'], P['box'], P['rule']
    QRC = PALETTES[palette]['qr']
    FD = fonts_dir or os.path.join(work, 'fonts')
    C = json.load(open(os.path.join(work, 'content.json'), encoding='utf-8'))

    for name, path in [('Thierry', 'Thierry.ttf'), ('Hello', 'HelloHandmade.ttf'),
                       ('Mulish', 'Mulish-normal-500.ttf'), ('Mulish-Bold', 'Mulish-normal-700.ttf'),
                       ('Mulish-XB', 'Mulish-normal-800.ttf'), ('Mulish-It', 'Mulish-italic-500.ttf')]:
        pdfmetrics.registerFont(TTFont(name, os.path.join(FD, path)))

    def st(font, size, color, leading=None, align=0):
        return ParagraphStyle('s', fontName=font, fontSize=size, textColor=color,
                              leading=leading or size * 1.42, alignment=align)

    def para(c, text, style, x, y_top, w):
        p = Paragraph(text, style)
        _, ph = p.wrap(w, 10000)
        p.drawOn(c, x, y_top - ph)
        return y_top - ph

    def esc(t):
        return html.escape(t)

    def border(c):
        c.setStrokeColor(ACCENT); c.setLineWidth(1.6)
        c.roundRect(24, 24, W - 48, H - 48, 10, stroke=1, fill=0)

    def spaced(t, n=2):
        return (' ' * n).join(list(t))

    def footer(c, text, page_no):
        c.setFont('Mulish-XB', FOOT); c.setFillColor(SECOND)
        c.drawString(M, 33, text.upper())
        c.drawRightString(W - M, 33, 'PAGE %d' % page_no)

    def section(c, y, label):
        c.setFont('Hello', SECTION); c.setFillColor(SECOND)
        c.drawString(M, y - SECTION + 2, label)
        return y - SECTION - 8

    def box(c, y, h, x=M, w=CW):
        c.setStrokeColor(BOXC); c.setLineWidth(1.1)
        c.roundRect(x, y - h, w, h, 7, stroke=1, fill=0)

    def prayer_h(c, text):
        p = Paragraph(esc(text), st('Mulish', PRAYER, INK, leading=PRAYER_LEAD))
        _, ph = p.wrap(CW - 28, 10000)
        return ph + 22, p

    def prayer_box(c, y, text):
        bh, p = prayer_h(c, text)
        box(c, y, bh)
        p.drawOn(c, M + 14, y - bh + 11)
        return y - bh

    def qr_img(url):
        q = qrcode.QRCode(border=1, box_size=8, error_correction=qrcode.constants.ERROR_CORRECT_M)
        q.add_data(url); q.make(fit=True)
        img = q.make_image(fill_color=QRC, back_color='white').convert('RGB')
        buf = io.BytesIO(); img.save(buf, 'PNG'); buf.seek(0)
        return ImageReader(buf)

    def vimeo_watch(url):
        """player.vimeo.com/video/123 -> vimeo.com/123 (the page a human can actually open)."""
        m = re.search(r'vimeo\.com/(?:video/)?(\d+)', url or '')
        return 'https://vimeo.com/%s' % m.group(1) if m else url

    def link_box(c, y, title, sub, url, link_label, show_url=None, x=M, w=CW, compact=False):
        """Height is computed from the content so bigger type can't overflow the frame.
        `compact` (used for the per-lesson resource pills) shrinks the type + box and lets
        the caller indent it under a lesson heading via x/w."""
        bt = 12 if compact else BOX_TITLE
        bs = 10 if compact else BOX_SUB
        bl = 9.5 if compact else BOX_LINK
        lh = 14 if compact else 15
        pad = 12 if compact else 14
        minh = 70 if compact else 80
        hpad = 24 if compact else 26
        lines = 1 + (1 if sub else 0) + (1 if show_url else 0) + 1
        h = max(minh, hpad + lines * lh)
        box(c, y, h, x, w)
        qs = h - 18
        qx, qy = x + w - qs - 10, y - h + 9
        c.drawImage(qr_img(url), qx, qy, qs, qs)
        c.linkURL(url, (qx, qy, qx + qs, qy + qs), relative=0)
        ty = y - (22 if compact else 24)
        c.setFont('Mulish-Bold', bt); c.setFillColor(INK)
        c.drawString(x + pad, ty, title[:54 if compact else 60])
        if sub:
            ty -= (14 if compact else 16)
            c.setFont('Mulish', bs); c.setFillColor(SECOND)
            c.drawString(x + pad, ty, sub[:70])
        if show_url:
            ty -= (14 if compact else 16)
            c.setFont('Mulish-Bold', bs); c.setFillColor(INK)
            c.drawString(x + pad, ty, show_url)
            uw = c.stringWidth(show_url, 'Mulish-Bold', bs)
            c.linkURL(url, (x + pad, ty - 3, x + pad + uw, ty + 10), relative=0)
        ly = y - h + (13 if compact else 14)
        c.setFont('Mulish-Bold', bl); c.setFillColor(ACCENT)
        c.drawString(x + pad, ly, link_label)
        lw = c.stringWidth(link_label, 'Mulish-Bold', bl)
        c.setStrokeColor(ACCENT); c.setLineWidth(0.6)
        c.line(x + pad, ly - 2, x + pad + lw, ly - 2)
        c.linkURL(url, (x + pad, ly - 3, x + pad + lw, ly + 10), relative=0)
        return y - h

    def note_box(c, y, title, sub, note, x=M, w=CW, compact=False):
        bt = 12 if compact else BOX_TITLE
        bs = 10 if compact else BOX_SUB
        pad = 12 if compact else 14
        lh = 14 if compact else 15
        minh = 60 if compact else 70
        hpad = 24 if compact else 26
        h = max(minh, hpad + (2 + (1 if sub else 0)) * lh)
        box(c, y, h, x, w)
        ty = y - (22 if compact else 24)
        c.setFont('Mulish-Bold', bt); c.setFillColor(INK)
        c.drawString(x + pad, ty, title[:54 if compact else 60])
        if sub:
            ty -= (14 if compact else 16)
            c.setFont('Mulish', bs); c.setFillColor(SECOND)
            c.drawString(x + pad, ty, sub[:70])
        c.setFont('Mulish-It', bs); c.setFillColor(SECOND)
        c.drawString(x + pad, y - h + (13 if compact else 14), note)
        return y - h

    def tip_box(c, y, text, url=None, link_label=None):
        """Lesson-page aside that mirrors the flipbook's red TIP badge: optional further
        reading for classes with time. Height is computed from the wrapped text, so the
        box can't overflow its frame. Print-usable: QR plus the underlined link label."""
        pad, badge_w, badge_h, qs = 14, 34, 15, 62
        has_link = bool(url and link_label)
        tw = CW - pad * 2 - ((qs + 16) if url else 0)
        p = Paragraph(esc(text), st('Mulish', 11, INK, leading=15))
        _, ph = p.wrap(tw, 10000)
        h = max(qs + 20, ph + badge_h + (50 if has_link else 28))
        box(c, y, h)
        if url:
            qx, qy = M + CW - qs - 10, y - h + (h - qs) / 2
            c.drawImage(qr_img(url), qx, qy, qs, qs)
            c.linkURL(url, (qx, qy, qx + qs, qy + qs), relative=0)
        bx, by = M + pad, y - pad - badge_h
        c.setFillColor(ACCENT); c.roundRect(bx, by, badge_w, badge_h, 3.5, stroke=0, fill=1)
        c.setFont('Mulish-XB', 8.5); c.setFillColor(white)
        c.drawCentredString(bx + badge_w / 2, by + 4.6, 'TIP')
        p.drawOn(c, M + pad, by - 8 - ph)
        if has_link:
            ly = by - 8 - ph - 16
            c.setFont('Mulish-Bold', BOX_LINK); c.setFillColor(ACCENT)
            c.drawString(M + pad, ly, link_label)
            lw = c.stringWidth(link_label, 'Mulish-Bold', BOX_LINK)
            c.setStrokeColor(ACCENT); c.setLineWidth(0.6)
            c.line(M + pad, ly - 2, M + pad + lw, ly - 2)
            c.linkURL(url, (M + pad, ly - 3, M + pad + lw, ly + 10), relative=0)
        return y - h

    def book_box(c, y, b):
        # manual word-wrap of the title to <=2 lines (predictable spacing)
        maxw = CW - 28
        words = (b.get('title') or '').split(' ')
        lines, cur = [], ''
        for w in words:
            t = (cur + ' ' + w).strip()
            if c.stringWidth(t, 'Mulish-Bold', BOX_TITLE) <= maxw:
                cur = t
            else:
                if cur:
                    lines.append(cur)
                cur = w
        if cur:
            lines.append(cur)
        lines = lines[:2]
        h = 66 + 16 * len(lines)
        box(c, y, h)
        ty = y - 22
        c.setFont('Mulish-Bold', BOX_TITLE); c.setFillColor(INK)
        for ln in lines:
            c.drawString(M + 14, ty, ln); ty -= 16
        c.setFont('Mulish', BOX_SUB); c.setFillColor(SECOND)
        c.drawString(M + 14, ty, (b.get('authors') or '')[:96])
        ty -= 15
        if b.get('isbn13'):
            c.setFont('Mulish-Bold', BOX_SUB); c.setFillColor(INK)
            c.drawString(M + 14, ty, 'ISBN ' + b['isbn13'])
        lx = M + 14; ly = y - h + 14
        for label, url in [('Amazon', b.get('amazon')), ('Bookshop.org', b.get('bookshop'))]:
            if not url:
                continue
            c.setFont('Mulish-Bold', BOX_LINK); c.setFillColor(ACCENT)
            c.drawString(lx, ly, label)
            lw = c.stringWidth(label, 'Mulish-Bold', BOX_LINK)
            c.setStrokeColor(ACCENT); c.setLineWidth(0.6); c.line(lx, ly - 2, lx + lw, ly - 2)
            c.linkURL(url, (lx, ly - 3, lx + lw, ly + 10), relative=0)
            lx += lw + 24
        return y - h

    out_path = os.path.join(work, C['meta']['pdf'])
    c = canvas.Canvas(out_path, pagesize=letter)
    c.setTitle('%s — Sunday School Simplified' % C['meta']['title'])
    c.setAuthor('The Candler Foundry')
    c.setSubject('%s — a six lesson packet' % C['meta'].get('tagline', ''))
    page = 0

    # ---------- cover ----------
    c.drawImage(os.path.join(work, 'cover.png'), 0, 0, W, H)
    c.showPage(); page += 1

    # ---------- letter ----------
    L = C['meta']['letter']
    border(c)
    c.setFillColor(ACCENT); c.roundRect(W / 2 - 26, H - 70, 52, 3, 1.5, stroke=0, fill=1)
    c.setFont('Hello', 24); c.setFillColor(DISPLAY)
    c.drawCentredString(W / 2, H - 98, L['heading'])
    y = H - 134
    body = st('Mulish', BODY, INK, leading=BODY_LEAD)
    for t in L['paragraphs']:
        y = para(c, BOLD.sub(r'<b>\1</b>', esc(t)), body, M, y, CW) - 9
    if L.get('quotes'):
        qtop = y - 2
        qs2 = st('Mulish-It', BODY, SECOND, leading=BODY_LEAD + 1)
        for q in L['quotes']:
            y = para(c, esc(q), qs2, M + 16, y - 2, CW - 30)
        c.setStrokeColor(ACCENT); c.setLineWidth(2); c.line(M + 4, qtop, M + 4, y + 3)
        y -= 11
    for t in L.get('paragraphs2', []) + L.get('paragraphs3', []):
        y = para(c, BOLD.sub(r'<b>\1</b>', esc(t)), body, M, y, CW) - 9
    y = para(c, esc(L['grace']), body, M, y - 4, CW)
    c.setFont('Hello', 17); c.setFillColor(DISPLAY)
    c.drawString(M, y - 26, L['signName'])
    footer(c, C['meta']['title'], page)
    c.showPage(); page += 1

    # ---------- contents ----------
    border(c)
    c.setFont('Hello', 27); c.setFillColor(DISPLAY)
    c.drawString(M, H - 84, 'In This Packet')
    y = H - 114
    for l in C['lessons']:
        rh = 48
        box(c, y, rh)
        c.setFont('Thierry', 23); c.setFillColor(ACCENT)
        c.drawCentredString(M + 28, y - rh / 2 - 23 * THIERRY_DIGIT_CENTRE, str(l['n']))
        c.setFont('Mulish-XB', 13); c.setFillColor(INK)
        c.drawString(M + 56, y - rh / 2 - 4, l['title'][:44])
        c.setFont('Mulish-XB', 9); c.setFillColor(SECOND)
        c.drawRightString(W - M - 14, y - rh / 2 - 3.5, l['shortRef'].upper())
        # on screen the row jumps to that lesson; invisible in print (no annotation border)
        c.linkRect('', 'lesson%d' % l['n'], (M, y - rh, W - M, y),
                   relative=0, Border='[0 0 0]')
        y -= rh + 9
    if L.get('rhythmTitle') and L.get('steps'):
        y -= 6
        c.setStrokeColor(ACCENT); c.setLineWidth(0.8); c.setDash(1, 3)
        c.line(M, y, W - M, y); c.setDash()
        c.setFont('Mulish-XB', 9.5); c.setFillColor(SECOND)
        c.drawCentredString(W / 2, y - 21, L['rhythmTitle'].upper())
        steps = L['steps']; colw = CW / len(steps)
        sst = st('Mulish-Bold', 9, INK, leading=12, align=1)
        for i, s in enumerate(steps):
            cx = M + colw * i + colw / 2
            c.setFillColor(ACCENT); c.circle(cx, y - 46, 9.5, stroke=0, fill=1)
            c.setFillColor(white); c.setFont('Mulish-XB', 10)
            c.drawCentredString(cx, y - 49.5, str(i + 1))
            para(c, esc(s), sst, M + colw * i + 4, y - 61, colw - 8)
    footer(c, C['meta']['title'], page)
    c.showPage(); page += 1

    # ---------- lessons ----------
    for l in C['lessons']:
        n = l['n']
        lf = '%s · Lesson %02d of %d' % (C['meta']['title'], n, len(C['lessons']))
        # ---- page A ----
        border(c)
        c.bookmarkPage('lesson%d' % n)   # destination for the contents-page link
        c.setFont('Mulish-XB', 11.5); c.setFillColor(SECOND)
        c.drawCentredString(W / 2, H - 66, spaced('LESSON ' + NUM[n], 1))
        title = l['title']
        tf = 28 if len(title) <= 26 else (24 if len(title) <= 34 else 20)
        c.setFont('Hello', tf); c.setFillColor(DISPLAY)
        c.drawCentredString(W / 2, H - 97, title)
        c.setFont('Mulish', 13); c.setFillColor(SECOND)
        c.drawCentredString(W / 2, H - 118, l['reference'])
        c.setStrokeColor(ACCENT); c.setLineWidth(1.4); c.line(M, H - 128, W - M, H - 128)
        y = H - 152
        y = section(c, y, 'Opening Prayer')
        y = prayer_box(c, y, l['openingPrayer']) - 20
        y = section(c, y, 'Read the Scripture')
        y = link_box(c, y, l['scriptureRef'], 'New Revised Standard Version, Updated Edition',
                     l['scriptureUrl'], 'Read at Bible Gateway (NRSVUE) — or scan the code') - 20
        y = section(c, y, 'Watch the 3 Minute Bible')
        if l.get('videoUrl'):
            watch = vimeo_watch(l['videoUrl'])
            y = link_box(c, y, l.get('videoSubtitle') or '3 Minute Bible', '3 Minute Bible video',
                         watch, 'Scan the code, or type the link above',
                         show_url=watch.replace('https://', ''))
        else:
            y = note_box(c, y, l.get('videoSubtitle') or '3 Minute Bible', '3 Minute Bible video',
                         'Video coming soon — it will play in the online flipbook.')
        if l.get('tipText'):
            y = tip_box(c, y - 20, l['tipText'], l.get('tipUrl'), l.get('tipLinkText'))
        footer(c, lf, page)
        c.showPage(); page += 1

        # ---- page B: questions + closing prayer (paginates if the type no longer fits) ----
        border(c)
        y = H - 76
        y = section(c, y, 'Discussion Questions')
        y -= 4
        qs = l['questions']
        qstyle = st('Mulish', Q_SIZE, INK, leading=Q_LEAD)
        pray_h, _ = prayer_h(c, l['closingPrayer'])
        reserve = pray_h + SECTION + 26
        for i, qt in enumerate(qs):
            p = Paragraph(esc(qt), qstyle)
            _, ph = p.wrap(CW - 30, 10000)
            last = (i == len(qs) - 1)
            need = ph + 14 + (reserve if last else 0)
            if y - need < 58:
                footer(c, lf, page); c.showPage(); page += 1
                border(c); y = H - 76
                y = section(c, y, 'Discussion Questions (cont.)') - 4
            # numeral centred on the question block
            cy = y - ph / 2
            c.setFont('Thierry', NUMERAL); c.setFillColor(ACCENT)
            c.drawString(M + 3, cy - NUMERAL * THIERRY_DIGIT_CENTRE, str(i + 1))
            p.drawOn(c, M + 30, y - ph)
            y -= ph + 14
            if not last:
                c.setStrokeColor(RULE); c.setLineWidth(0.7)
                c.line(M + 30, y + 7, W - M, y + 7)
        y -= 6
        y = section(c, y, 'Closing Prayer')
        prayer_box(c, y, l['closingPrayer'])
        footer(c, lf, page)
        c.showPage(); page += 1

    # ---------- additional resources (paginates) ----------
    def res_header(c, first):
        border(c)
        c.setFont('Hello', 27); c.setFillColor(DISPLAY)
        c.drawString(M, H - 84, 'Additional Resources' if first else 'Additional Resources (cont.)')
        if first:
            return para(c, 'Extra viewing, artwork, and reading for classes that want to go deeper.',
                        st('Mulish-It', BODY, SECOND, leading=BODY_LEAD), M, H - 100, CW) - 22
        return H - 106

    def res_lesson_header(c, y, n, title, cont=False):
        """Per-lesson subsection heading: accent numeral + lesson title + a hairline rule,
        so each lesson's resources read as their own grouped block."""
        c.setFont('Thierry', 19); c.setFillColor(ACCENT)
        c.drawString(M, y - 15, str(n))
        label = ('%s (cont.)' % title) if cont else title
        c.setFont('Mulish-XB', 12.5); c.setFillColor(INK)
        c.drawString(M + 26, y - 13, label[:50])
        c.setStrokeColor(RULE); c.setLineWidth(0.8)
        c.line(M, y - 23, W - M, y - 23)
        return y - 33

    # Group each lesson's extras under its own subsection heading (Emily, 2026-09-01):
    # the lesson is the heading, not a pill tag; the pills themselves are compact + indented.
    RES_INDENT = 22
    groups = []
    for l in C['lessons']:
        li = []
        vids = l.get('optionalVideos') or ([l['optionalVideo']] if l.get('optionalVideo') else [])
        for o in vids:
            li.append(('video', o.get('title'), o.get('subtitle'), o.get('url')))
        for a in (l.get('artwork') or []):
            li.append(('art', a.get('title'), a.get('subtitle'), a.get('url')))
        for r in (l.get('optionalReadings') or []):
            li.append(('read', r.get('title'), r.get('subtitle'), r.get('url')))
        if li:
            groups.append((l, li))

    rr = C['meta'].get('recommendedReading') or []
    y = res_header(c, True)
    if not groups and not rr:
        para(c, 'Extra videos, artwork, and readings will appear here as they are added to future lessons.',
             st('Mulish-It', BODY, SECOND, leading=BODY_LEAD), M, y, CW)
    else:
        xi, wi = M + RES_INDENT, CW - RES_INDENT
        for l, li in groups:
            ltitle = l.get('title') or l.get('shortRef') or ('Lesson %d' % l['n'])
            # keep the heading with its first pill — never orphan a heading at a page foot
            if y - (33 + 100) < 62:
                footer(c, C['meta']['title'], page); c.showPage(); page += 1
                y = res_header(c, False)
            y = res_lesson_header(c, y, l['n'], ltitle)
            for kind, title, sub, url in li:
                if y - 100 < 62:
                    footer(c, C['meta']['title'], page); c.showPage(); page += 1
                    y = res_header(c, False)
                    y = res_lesson_header(c, y, l['n'], ltitle, cont=True)
                if not url:
                    y = note_box(c, y, title, sub,
                                 'Coming soon — it will appear in the online flipbook.',
                                 x=xi, w=wi, compact=True) - 12
                elif kind == 'video':
                    u = vimeo_watch(url)
                    y = link_box(c, y, title, sub, u, 'Scan the code, or type the link above',
                                 show_url=u.replace('https://', ''), x=xi, w=wi, compact=True) - 12
                elif kind == 'art':
                    y = link_box(c, y, title, sub, url, 'Scan the code to view the artwork',
                                 x=xi, w=wi, compact=True) - 12
                else:
                    y = link_box(c, y, title, sub, url, 'Open at Bible Gateway — or scan the code',
                                 x=xi, w=wi, compact=True) - 12
            y -= 6   # a little air between lesson groups
        if rr:
            if y - 156 < 62:
                footer(c, C['meta']['title'], page); c.showPage(); page += 1
                y = res_header(c, False)
            y = section(c, y - 4, 'Recommended Reading')
            y = para(c, 'Scholarly commentaries for every lesson in this packet.',
                     st('Mulish-It', BOX_SUB, SECOND, leading=15), M, y, CW) - 10
            for b in rr:
                if y - 132 < 62:
                    footer(c, C['meta']['title'], page); c.showPage(); page += 1
                    y = res_header(c, False)
                y = book_box(c, y, b) - 14
    footer(c, C['meta']['title'], page)
    c.showPage(); page += 1

    # ---------- end page ----------
    border(c)
    # (no accent rule above the logo — it read as a stubby stray line)
    # the actual Candler Foundry logo (linkable), replacing the flipbook-font wordmark
    _lr = ImageReader(os.path.join(work, 'logo.png')); _iw, _ih = _lr.getSize()
    _lw = 214.0; _lh = _lw * _ih / _iw; _lx = W / 2 - _lw / 2; _ly = H / 2 + 116 - _lh
    c.drawImage(_lr, _lx, _ly, _lw, _lh, mask='auto')
    c.linkURL('https://candlerfoundry.emory.edu', (_lx, _ly, _lx + _lw, _ly + _lh), relative=0)
    ey = para(c, esc('%s is a project of The Candler Foundry, an initiative of Emory '
                     'University’s Candler School of Theology. We aim to make Bible '
                     'and theology fun and easy.' % C['meta']['series']),
              st('Mulish-It', BODY, SECOND, leading=BODY_LEAD, align=1), W / 2 - 175, _ly - 16, 350)
    c.setFont('Mulish-XB', 10.5); c.setFillColor(INK)
    uy = ey - 24
    c.drawCentredString(W / 2, uy, 'CANDLERFOUNDRY.EMORY.EDU')
    c.linkURL('https://candlerfoundry.emory.edu',
              (W / 2 - 110, uy - 4, W / 2 + 110, uy + 11), relative=0)
    c.setFont('Mulish', 8.5); c.setFillColor(SECOND)
    c.drawCentredString(W / 2, 47, 'Scripture quotations are from the New Revised Standard Version, Updated Edition.')
    c.drawCentredString(W / 2, 36, 'Copyright © 2021 National Council of Churches.')
    c.showPage()
    c.save()
    print('PDF written: %d pages -> %s' % (page + 1, C['meta']['pdf']))
    return out_path
