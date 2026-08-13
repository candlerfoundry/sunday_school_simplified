#!/usr/bin/env python3
"""Beyond Bumper Stickers — printable packet generator (v2, clean/print-friendly).

Design (Emily, Aug 2026): CLEAN + easy to print. No graph-paper background, no
section icons, no per-lesson header art. Keep: the packet fonts (Thierry / Hello-
Handmade / Mulish), a thin RED page border like the art, outlined section boxes,
and RED question numbers. Minimal color (red border + red numbers, navy text).

Re-cut:
  1. pip install reportlab qrcode pillow fonttools brotli cu2qu
  2. content.json  = window.BBS_CONTENT dumped from packets/beyond-bumper-stickers/content.js
  3. fonts/  = Thierry.ttf, HelloHandmade.ttf (CFF->glyf via cu2qu), Mulish-normal-500/700/800.ttf,
     Mulish-italic-500.ttf (Mulish instanced from the google/fonts variable font)
  4. cover.png in WORK ; python make_pdf.py ; verify every page (PyMuPDF) ; push the PDF.
Scripture always links+QR to scriptureUrl (Bible Gateway NRSVUE); video links+QR to
videoUrl (Vimeo) when set, else a "coming soon" note.
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

WORK = os.path.join(os.path.dirname(os.path.abspath(__file__)))
FD = os.path.join(WORK, 'fonts')
C = json.load(open(os.path.join(WORK, 'content.json'), encoding='utf-8'))

NAVY, SMOKY, RED = HexColor('#0A274C'), HexColor('#2F5972'), HexColor('#FB1616')
INK = HexColor('#22303F')          # body text
BOX = HexColor('#0A274C')          # box outline (navy, thin)
W, H = letter                      # 612 x 792
M = 52
CW = W - 2 * M
NUM = {1: 'ONE', 2: 'TWO', 3: 'THREE', 4: 'FOUR', 5: 'FIVE', 6: 'SIX'}

for name, path in [('Thierry', 'Thierry.ttf'), ('Hello', 'HelloHandmade.ttf'),
                   ('Mulish', 'Mulish-normal-500.ttf'), ('Mulish-Bold', 'Mulish-normal-700.ttf'),
                   ('Mulish-XB', 'Mulish-normal-800.ttf'), ('Mulish-It', 'Mulish-italic-500.ttf')]:
    pdfmetrics.registerFont(TTFont(name, os.path.join(FD, path)))

BOLD = re.compile(r'\*\*(.+?)\*\*')

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
    c.setStrokeColor(RED); c.setLineWidth(1.6)
    c.roundRect(24, 24, W - 48, H - 48, 10, stroke=1, fill=0)

def spaced(t, n=2):
    return (' ' * n).join(list(t))

def footer(c, text, page_no):
    c.setFont('Mulish-XB', 7); c.setFillColor(SMOKY)
    c.drawString(M, 33, text.upper())
    c.drawRightString(W - M, 33, 'PAGE %d' % page_no)

def section(c, y, label):
    c.setFont('Hello', 15); c.setFillColor(NAVY)
    c.drawString(M, y - 13, label)
    return y - 22

def box(c, y, h):
    c.setStrokeColor(BOX); c.setLineWidth(1.1)
    c.roundRect(M, y - h, CW, h, 7, stroke=1, fill=0)

def prayer_box(c, y, text):
    s = st('Mulish', 10.5, INK, leading=15.4)
    p = Paragraph(esc(text), s)
    _, ph = p.wrap(CW - 28, 10000)
    bh = ph + 20
    box(c, y, bh)
    p.drawOn(c, M + 14, y - bh + 10)
    return y - bh

def qr_img(url):
    q = qrcode.QRCode(border=1, box_size=8, error_correction=qrcode.constants.ERROR_CORRECT_M)
    q.add_data(url); q.make(fit=True)
    img = q.make_image(fill_color='#0A274C', back_color='white').convert('RGB')
    buf = io.BytesIO(); img.save(buf, 'PNG'); buf.seek(0)
    return ImageReader(buf)

def link_box(c, y, title, sub, url, link_label, h=76):
    box(c, y, h)
    qs = h - 16
    qx, qy = W - M - qs - 9, y - h + 8
    c.drawImage(qr_img(url), qx, qy, qs, qs)
    c.linkURL(url, (qx, qy, qx + qs, qy + qs), relative=0)
    c.setFont('Mulish-Bold', 12.5); c.setFillColor(NAVY)
    c.drawString(M + 14, y - 23, title)
    ty = y - 23
    if sub:
        c.setFont('Mulish', 9.5); c.setFillColor(SMOKY)
        c.drawString(M + 14, y - 38, sub)
    c.setFont('Mulish-Bold', 9); c.setFillColor(RED)
    ly = y - h + 15
    c.drawString(M + 14, ly, link_label)
    lw = c.stringWidth(link_label, 'Mulish-Bold', 9)
    c.setStrokeColor(RED); c.setLineWidth(0.6)
    c.line(M + 14, ly - 2, M + 14 + lw, ly - 2)
    c.linkURL(url, (M + 14, ly - 3, M + 14 + lw, ly + 9), relative=0)
    return y - h

def note_box(c, y, title, sub, note, h=64):
    box(c, y, h)
    c.setFont('Mulish-Bold', 12.5); c.setFillColor(NAVY)
    c.drawString(M + 14, y - 23, title)
    if sub:
        c.setFont('Mulish', 9.5); c.setFillColor(SMOKY)
        c.drawString(M + 14, y - 38, sub)
    c.setFont('Mulish-It', 9.5); c.setFillColor(SMOKY)
    c.drawString(M + 14, y - h + 15, note)
    return y - h

c = canvas.Canvas(os.path.join(WORK, 'Beyond Bumper Stickers.pdf'), pagesize=letter)
c.setTitle('Beyond Bumper Stickers — Sunday School Simplified')
c.setAuthor('The Candler Foundry')
c.setSubject('Scripture That Sticks — a six lesson packet')
page = 0

# ---------- cover (full color) ----------
c.drawImage(os.path.join(WORK, 'cover.png'), 0, 0, W, H)
c.showPage(); page += 1

# ---------- letter ----------
L = C['meta']['letter']
border(c)
c.setFillColor(RED); c.roundRect(W / 2 - 26, H - 70, 52, 3, 1.5, stroke=0, fill=1)
c.setFont('Hello', 23); c.setFillColor(NAVY)
c.drawCentredString(W / 2, H - 98, L['heading'])
y = H - 132
body = st('Mulish', 10.5, INK, leading=15.5)
for t in L['paragraphs']:
    y = para(c, BOLD.sub(r'<b>\1</b>', esc(t)), body, M, y, CW) - 9
if L.get('quotes'):
    qtop = y - 2
    qs2 = st('Mulish-It', 10.5, SMOKY, leading=16)
    for q in L['quotes']:
        y = para(c, esc(q), qs2, M + 16, y - 2, CW - 30)
    c.setStrokeColor(RED); c.setLineWidth(2); c.line(M + 4, qtop, M + 4, y + 3)
    y -= 11
for t in L.get('paragraphs2', []) + L.get('paragraphs3', []):
    y = para(c, BOLD.sub(r'<b>\1</b>', esc(t)), body, M, y, CW) - 9
y = para(c, esc(L['grace']), body, M, y - 4, CW)
c.setFont('Hello', 16); c.setFillColor(NAVY)
c.drawString(M, y - 24, L['signName'])
footer(c, C['meta']['title'], page)
c.showPage(); page += 1

# ---------- contents ----------
border(c)
c.setFont('Hello', 27); c.setFillColor(NAVY)
c.drawString(M, H - 84, 'In This Packet')
y = H - 112
for l in C['lessons']:
    rh = 46
    box(c, y, rh)
    c.setFont('Thierry', 22); c.setFillColor(RED)
    c.drawCentredString(M + 28, y - rh / 2 - 8, str(l['n']))
    c.setFont('Mulish-XB', 12); c.setFillColor(NAVY)
    c.drawString(M + 56, y - rh / 2 - 3, l['title'])
    c.setFont('Mulish-XB', 8.5); c.setFillColor(SMOKY)
    c.drawRightString(W - M - 14, y - rh / 2 - 2.5, l['shortRef'].upper())
    y -= rh + 9
if L.get('rhythmTitle') and L.get('steps'):
    y -= 6
    c.setStrokeColor(RED); c.setLineWidth(0.8); c.setDash(1, 3)
    c.line(M, y, W - M, y); c.setDash()
    c.setFont('Mulish-XB', 9); c.setFillColor(SMOKY)
    c.drawCentredString(W / 2, y - 20, L['rhythmTitle'].upper())
    steps = L['steps']; colw = CW / len(steps)
    sst = st('Mulish-Bold', 8.5, NAVY, leading=11, align=1)
    for i, s in enumerate(steps):
        cx = M + colw * i + colw / 2
        c.setFillColor(RED); c.circle(cx, y - 44, 9, stroke=0, fill=1)
        c.setFillColor(white); c.setFont('Mulish-XB', 9.5)
        c.drawCentredString(cx, y - 47.5, str(i + 1))
        para(c, esc(s), sst, M + colw * i + 4, y - 58, colw - 8)
footer(c, C['meta']['title'], page)
c.showPage(); page += 1

# ---------- lessons ----------
for l in C['lessons']:
    n = l['n']
    # ---- page A ----
    border(c)
    c.setFont('Mulish-XB', 11); c.setFillColor(SMOKY)
    c.drawCentredString(W / 2, H - 66, spaced('LESSON ' + NUM[n], 1))
    title = l['title']
    tf = 27 if len(title) <= 26 else (23 if len(title) <= 34 else 20)
    c.setFont('Hello', tf); c.setFillColor(NAVY)
    c.drawCentredString(W / 2, H - 96, title)
    c.setFont('Mulish', 12.5); c.setFillColor(SMOKY)
    c.drawCentredString(W / 2, H - 116, l['reference'])
    c.setStrokeColor(RED); c.setLineWidth(1.4); c.line(M, H - 126, W - M, H - 126)
    y = H - 150
    y = section(c, y, 'Opening Prayer')
    y = prayer_box(c, y, l['openingPrayer']) - 20
    y = section(c, y, 'Read the Scripture')
    y = link_box(c, y, l['scriptureRef'], 'New Revised Standard Version, Updated Edition',
                 l['scriptureUrl'], 'Read at Bible Gateway (NRSVUE) — or scan the code') - 20
    y = section(c, y, 'Watch the 3-Minute Bible')
    if l.get('videoUrl'):
        y = link_box(c, y, l.get('videoSubtitle') or '3-Minute Bible', '3-Minute Bible video',
                     l['videoUrl'], 'Watch on Vimeo — or scan the code')
    else:
        y = note_box(c, y, l.get('videoSubtitle') or '3-Minute Bible', '3-Minute Bible video',
                     'Video coming soon — it will play in the online flipbook.')
    footer(c, '%s · Lesson %02d of %d' % (C['meta']['title'], n, len(C['lessons'])), page)
    c.showPage(); page += 1
    # ---- page B ----
    border(c)
    y = H - 74
    y = section(c, y, 'Discussion Questions')
    y -= 4
    qs = l['questions']
    qstyle = st('Mulish', 10.3, INK, leading=14.4)
    for i, qt in enumerate(qs):
        nx = M + 3
        c.setFont('Thierry', 15); c.setFillColor(RED)
        c.drawString(nx, y - 12, str(i + 1))
        y = para(c, esc(qt), qstyle, M + 26, y, CW - 26) - 13
        if i < len(qs) - 1:
            c.setStrokeColor(HexColor('#D8E2EC')); c.setLineWidth(0.7)
            c.line(M + 26, y + 6.5, W - M, y + 6.5)
    y -= 6
    y = section(c, y, 'Closing Prayer')
    prayer_box(c, y, l['closingPrayer'])
    footer(c, '%s · Lesson %02d of %d' % (C['meta']['title'], n, len(C['lessons'])), page)
    c.showPage(); page += 1

# ---------- additional resources ----------
border(c)
c.setFont('Hello', 27); c.setFillColor(NAVY)
c.drawString(M, H - 84, 'Additional Resources')
y = para(c, 'Optional viewing for classes that want to go deeper — each is a short 3-Minute Bible video.',
         st('Mulish-It', 10.5, SMOKY, leading=15), M, H - 98, CW) - 22
any_res = False
for l in C['lessons']:
    o = l.get('optionalVideo')
    if not o:
        continue
    any_res = True
    sub = 'Lesson %d · %s' % (l['n'], l.get('tabRef') or l['shortRef'])
    if o.get('url'):
        y = link_box(c, y, o['title'], sub, o['url'], 'Watch on Vimeo — or scan the code') - 16
    else:
        y = note_box(c, y, o['title'], sub, 'Video coming soon — it will play in the online flipbook.') - 16
if not any_res:
    para(c, 'Optional videos and readings will appear here as they are added to future lessons.',
         st('Mulish-It', 10.5, SMOKY, leading=15), M, y, CW)
footer(c, C['meta']['title'], page)
c.showPage(); page += 1

# ---------- end page ----------
border(c)
c.setFillColor(RED); c.roundRect(W / 2 - 26, H / 2 + 96, 52, 3, 1.5, stroke=0, fill=1)
c.setFont('Hello', 30); c.setFillColor(NAVY)
c.drawCentredString(W / 2, H / 2 + 54, 'The Candler Foundry')
para(c, esc('%s is a project of The Candler Foundry, making the best of biblical scholarship accessible to everyone.' % C['meta']['series']),
     st('Mulish-It', 10.5, SMOKY, leading=15.5, align=1), W / 2 - 150, H / 2 + 34, 300)
c.setFont('Mulish-XB', 9.5); c.setFillColor(NAVY)
c.drawCentredString(W / 2, H / 2 - 6, 'CANDLERFOUNDRY.EMORY.EDU')
c.linkURL('https://www.candlerfoundry.emory.edu', (W / 2 - 100, H / 2 - 10, W / 2 + 100, H / 2 + 4), relative=0)
c.setFont('Mulish', 8); c.setFillColor(SMOKY)
c.drawCentredString(W / 2, 46, 'Scripture quotations are from the New Revised Standard Version, Updated Edition.')
c.drawCentredString(W / 2, 36, 'Copyright © 2021 National Council of Churches.')
c.showPage()
c.save()
print('PDF written:', page + 1, 'pages')
