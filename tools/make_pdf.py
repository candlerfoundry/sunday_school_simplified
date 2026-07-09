#!/usr/bin/env python3
"""Beyond Bumper Stickers — printable packet generator.

Re-cut procedure (e.g. when Vimeo videoUrls land in content.js):
  1. pip install reportlab qrcode pillow fonttools brotli cu2qu pymupdf
  2. Set SSS_REPO (repo root) and SSS_WORK (scratch dir), then prep assets:
     - content.json:  node -e "global.window={};require('$SSS_REPO/packets/beyond-bumper-stickers/content.js');console.log(JSON.stringify(window.BBS_CONTENT))" > $SSS_WORK/content.json
     - fonts: convert engine/assets/fonts/*.woff2 to TTF in $SSS_WORK/fonts/
       (Thierry.ttf, HelloHandmade.ttf — HelloHandmade is CFF and needs cu2qu
       CFF->glyf conversion for reportlab); fetch Mulish 500/700/800/italic-500
       from Google Fonts as Mulish-normal-500.ttf etc.
     - icons: rasterize engine/assets/icons/icon-*.svg to $SSS_WORK/icon-*.png
       (PyMuPDF, 3x matrix, alpha) and the recolorable Foundry logo (navy) to
       $SSS_WORK/logo-navy.png
  3. python3 tools/make_pdf.py
  4. Verify EVERY page visually (render via PyMuPDF), check link annotations,
     then push as packets/beyond-bumper-stickers/Beyond Bumper Stickers.pdf.

Video blocks: use lesson.videoUrl / optionalVideo.url (Vimeo) when set —
link + QR; otherwise a "coming soon" note with no QR (Emily's call, July 2026).
Scripture blocks always link+QR to scriptureUrl (Bible Gateway NRSVUE).
"""
import os
ROOT = os.environ.get('SSS_REPO', '/tmp/repo')
WORK = os.environ.get('SSS_WORK', '/tmp/pdfbuild')

import json, io, re, html
import qrcode
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

C = json.load(open(WORK + '/content.json'))
NAVY, SMOKY, RED = HexColor('#0A274C'), HexColor('#2F5972'), HexColor('#FB1616')
RULE, POWDER = HexColor('#C6DBF0'), HexColor('#CCE0F5')
W, H = letter            # 612 x 792
M = 54                   # margins
CW = W - 2*M             # 504 content width
SITE = 'https://sundayschoolsimplified.netlify.app/beyond-bumper-stickers/'

for name, path in [('Thierry', 'Thierry.ttf'), ('Hello', 'HelloHandmade.ttf'),
                   ('Mulish', 'Mulish-normal-500.ttf'), ('Mulish-Bold', 'Mulish-normal-700.ttf'),
                   ('Mulish-XB', 'Mulish-normal-800.ttf'), ('Mulish-It', 'Mulish-italic-500.ttf')]:
    pdfmetrics.registerFont(TTFont(name, WORK + '/fonts/' + name_path if (name_path := path) else path))

def style(font, size, color, leading=None, align=0):
    return ParagraphStyle('s', fontName=font, fontSize=size, textColor=color,
                          leading=leading or size*1.45, alignment=align)

def qr_image(url):
    q = qrcode.QRCode(border=1, box_size=8, error_correction=qrcode.constants.ERROR_CORRECT_M)
    q.add_data(url); q.make(fit=True)
    img = q.make_image(fill_color='#0A274C', back_color='white').convert('RGB')
    buf = io.BytesIO(); img.save(buf, 'PNG'); buf.seek(0)
    return ImageReader(buf)

def para(c, text, st, x, y_top, w):
    p = Paragraph(text, st)
    _, ph = p.wrap(w, 10000)
    p.drawOn(c, x, y_top - ph)
    return y_top - ph

def sec_header(c, y, icon, label):
    """red hand-drawn icon in powder circle + label + dotted leader; returns new y"""
    r = 11
    cx, cy = M + r, y - r
    c.setFillColor(POWDER); c.circle(cx, cy, r, stroke=0, fill=1)
    img = ImageReader(WORK + '/icon-%s.png' % icon)
    iw, ih = img.getSize(); s = (r*1.25) / max(iw, ih)
    c.drawImage(img, cx - iw*s/2, cy - ih*s/2, iw*s, ih*s, mask='auto')
    c.setFont('Mulish-XB', 10.5); c.setFillColor(NAVY)
    tx = M + 2*r + 8
    c.drawString(tx, cy - 3.5, label.upper())
    tw = c.stringWidth(label.upper(), 'Mulish-XB', 10.5)
    c.setStrokeColor(RULE); c.setLineWidth(1); c.setDash(1, 3)
    c.line(tx + tw + 10, cy, W - M, cy); c.setDash()
    return y - 2*r - 8

def link_qr_box(c, y, title, sub, url, link_label, box_h=74):
    """outlined box: title/sub/link left, QR right; whole QR + link clickable."""
    c.setStrokeColor(RULE); c.setLineWidth(0.9)
    c.roundRect(M, y - box_h, CW, box_h, 8, stroke=1, fill=0)
    qs = box_h - 14
    qx, qy = W - M - qs - 8, y - box_h + 7
    c.drawImage(qr_image(url), qx, qy, qs, qs)
    c.linkURL(url, (qx, qy, qx + qs, qy + qs), relative=0)
    c.setFont('Mulish-Bold', 13); c.setFillColor(NAVY)
    c.drawString(M + 14, y - 24, title)
    ty = y - 24
    if sub:
        c.setFont('Mulish', 10); c.setFillColor(SMOKY)
        c.drawString(M + 14, y - 40, sub); ty = y - 40
    c.setFont('Mulish-Bold', 9.5); c.setFillColor(SMOKY)
    ly = y - box_h + 14
    c.drawString(M + 14, ly, link_label)
    lw = c.stringWidth(link_label, 'Mulish-Bold', 9.5)
    c.setStrokeColor(SMOKY); c.setLineWidth(0.6)
    c.line(M + 14, ly - 1.5, M + 14 + lw, ly - 1.5)
    c.linkURL(url, (M + 14, ly - 3, M + 14 + lw, ly + 9), relative=0)
    c.setFont('Mulish', 7.5); c.setFillColor(SMOKY)
    c.drawRightString(qx + qs, qy - 0.5, '')
    return y - box_h

def info_box(c, y, title, sub, note, box_h=64):
    c.setStrokeColor(RULE); c.setLineWidth(0.9)
    c.roundRect(M, y - box_h, CW, box_h, 8, stroke=1, fill=0)
    c.setFont('Mulish-Bold', 13); c.setFillColor(NAVY)
    c.drawString(M + 14, y - 24, title)
    if sub:
        c.setFont('Mulish', 10); c.setFillColor(SMOKY)
        c.drawString(M + 14, y - 40, sub)
    c.setFont('Mulish-It', 9.5); c.setFillColor(SMOKY)
    c.drawString(M + 14, y - box_h + 14, note)
    return y - box_h

def prayer_box(c, y, text):
    st = style('Mulish', 10.5, NAVY, leading=15)
    p = Paragraph(html.escape(text), st)
    _, ph = p.wrap(CW - 28, 10000)
    bh = ph + 20
    c.setStrokeColor(RULE); c.setLineWidth(0.9)
    c.roundRect(M, y - bh, CW, bh, 8, stroke=1, fill=0)
    p.drawOn(c, M + 14, y - bh + 10)
    return y - bh

def footer(c, text, page_no):
    c.setStrokeColor(RULE); c.setLineWidth(0.7)
    c.line(M, 40, W - M, 40)
    c.setFont('Mulish-XB', 7.5); c.setFillColor(SMOKY)
    c.drawString(M, 29, text.upper())
    c.drawRightString(W - M, 29, 'PAGE %d' % page_no)

c = canvas.Canvas(WORK + '/Beyond Bumper Stickers.pdf', pagesize=letter)
c.setTitle('Beyond Bumper Stickers — Sunday School Simplified')
c.setAuthor('The Candler Foundry')
c.setSubject('Scripture That Sticks — a six lesson packet')
page = 0

# ---------- cover (full color, exact page aspect) ----------
c.drawImage(ROOT + '/packets/beyond-bumper-stickers/assets/cover.png', 0, 0, W, H)
c.showPage(); page += 1

# ---------- letter ----------
L = C['meta']['letter']
c.setFillColor(RED); c.roundRect(W/2 - 30, H - 64, 60, 3.2, 1.6, stroke=0, fill=1)
c.setFont('Hello', 24); c.setFillColor(NAVY)
c.drawCentredString(W/2, H - 92, L['heading'])
y = H - 128
body = style('Mulish', 10.5, NAVY, leading=15.5)
bold_body = re.compile(r'\*\*(.+?)\*\*')
for t in L['paragraphs']:
    y = para(c, bold_body.sub(r'<b>\1</b>', html.escape(t)), body, M + 10, y, CW - 20) - 9
c.setStrokeColor(RED); c.setLineWidth(2)
qy_top = y - 2
qst = style('Mulish-It', 10.5, SMOKY, leading=16)
for q in L['quotes']:
    y = para(c, html.escape(q), qst, M + 26, y - 2, CW - 46)
c.line(M + 14, qy_top, M + 14, y + 3)
y -= 11
for t in L['paragraphs2'] + L['paragraphs3']:
    y = para(c, bold_body.sub(r'<b>\1</b>', html.escape(t)), body, M + 10, y, CW - 20) - 9
y = para(c, html.escape(L['grace']), body, M + 10, y - 4, CW - 20)
c.setFont('Hello', 17); c.setFillColor(NAVY)
c.drawString(M + 10, y - 22, L['signName'])
footer(c, C['meta']['title'], page)
c.showPage(); page += 1

# ---------- contents ----------
c.setFont('Hello', 30); c.setFillColor(NAVY)
c.drawString(M, H - 88, 'In This Packet')
y = H - 118
for l in C['lessons']:
    rh = 44
    c.setStrokeColor(RULE); c.setLineWidth(0.9)
    c.roundRect(M, y - rh, CW, rh, 8, stroke=1, fill=0)
    c.setFont('Hello', 20); c.setFillColor(NAVY)
    c.drawCentredString(M + 26, y - rh/2 - 7, str(l['n']))
    c.setFont('Mulish-XB', 12.5)
    c.drawString(M + 50, y - rh/2 - 4.5, l['title'])
    c.setFont('Mulish-XB', 8.5); c.setFillColor(SMOKY)
    c.drawRightString(W - M - 14, y - rh/2 - 3, l['shortRef'].upper())
    y -= rh + 10
# rhythm strip
y -= 8
c.setStrokeColor(RULE); c.setLineWidth(1); c.setDash(1, 3)
c.line(M, y, W - M, y); c.setDash()
c.setFont('Mulish-XB', 9); c.setFillColor(SMOKY)
c.drawCentredString(W/2, y - 20, C['meta']['letter']['rhythmTitle'].upper())
steps = C['meta']['letter']['steps']
colw = CW / len(steps)
sst = style('Mulish-Bold', 8.5, NAVY, leading=11, align=1)
for i, s in enumerate(steps):
    cx = M + colw*i + colw/2
    c.setFillColor(RED); c.circle(cx, y - 44, 9, stroke=0, fill=1)
    c.setFillColor(white); c.setFont('Mulish-XB', 9.5)
    c.drawCentredString(cx, y - 47.5, str(i+1))
    para(c, html.escape(s), sst, M + colw*i + 4, y - 58, colw - 8)
footer(c, C['meta']['title'], page)
c.showPage(); page += 1

# ---------- lessons ----------
for l in C['lessons']:
    n = l['n']
    # page A
    hw = CW; hh = hw * 560/1632
    c.drawImage(ROOT + '/packets/beyond-bumper-stickers/assets/headers/lesson-0%d.png' % n, M, H - 40 - hh, hw, hh)
    y = H - 40 - hh - 24
    y = sec_header(c, y, 'prayer', 'Opening Prayer')
    y = prayer_box(c, y, l['openingPrayer']) - 20
    y = sec_header(c, y, 'book', 'Read the Scripture')
    y = link_qr_box(c, y, l['scriptureRef'], 'New Revised Standard Version, Updated Edition',
                    l['scriptureUrl'], 'Read online at Bible Gateway (NRSVUE) — or scan the code') - 20
    y = sec_header(c, y, 'play', 'Watch the 3-Minute Bible')
    if l.get('videoUrl'):
        y = link_qr_box(c, y, l['videoSubtitle'], '3-Minute Bible video',
                        l['videoUrl'], 'Watch on Vimeo — or scan the code')
    else:
        y = info_box(c, y, l['videoSubtitle'], '3-Minute Bible video',
                     'Video coming soon — it will play in the online flipbook.')
    footer(c, '%s · Lesson %02d of %d' % (C['meta']['title'], n, len(C['lessons'])), page)
    c.showPage(); page += 1
    # page B
    y = H - 54
    y = sec_header(c, y, 'dialogue', 'Discussion Questions')
    many = len(l['questions']) >= 6
    qst = style('Mulish', 9.8 if many else 10.4, NAVY, leading=(13.6 if many else 14.6))
    gap = 10 if many else 14
    for i, qtext in enumerate(l['questions']):
        qr_ = 8.5
        c.setStrokeColor(NAVY); c.setLineWidth(0.9)
        c.circle(M + qr_, y - qr_ - 2, qr_, stroke=1, fill=0)
        c.setFont('Mulish-XB', 9); c.setFillColor(NAVY)
        c.drawCentredString(M + qr_, y - qr_ - 5, str(i+1))
        y = para(c, html.escape(qtext), qst, M + 2*qr_ + 10, y, CW - 2*qr_ - 14) - gap
        if i < len(l['questions']) - 1:
            c.setStrokeColor(RULE); c.setLineWidth(0.7); c.setDash(1, 3)
            c.line(M + 2*qr_ + 10, y + gap/2 + 1, W - M, y + gap/2 + 1); c.setDash()
    y -= 8
    y = sec_header(c, y, 'heart', 'Closing Prayer')
    y = prayer_box(c, y, l['closingPrayer'])
    footer(c, '%s · Lesson %02d of %d' % (C['meta']['title'], n, len(C['lessons'])), page)
    c.showPage(); page += 1

# ---------- additional resources ----------
c.setFont('Hello', 30); c.setFillColor(NAVY)
c.drawString(M, H - 88, 'Additional Resources')
y = para(c, 'Optional viewing for classes that want to go deeper — each is a short 3-Minute Bible video.',
         style('Mulish-It', 10.5, SMOKY, leading=15), M, H - 100, CW) - 22
for l in C['lessons']:
    o = l.get('optionalVideo')
    if not o: continue
    sub = 'Lesson %d · %s · %s' % (l['n'], l.get('tabRef') or l['shortRef'], o.get('subtitle') or '')
    if o.get('url'):
        y = link_qr_box(c, y, o['title'], sub, o['url'], 'Watch on Vimeo — or scan the code') - 16
    else:
        y = info_box(c, y, o['title'], sub, 'Video coming soon — it will play in the online flipbook.') - 16
footer(c, C['meta']['title'], page)
c.showPage(); page += 1

# ---------- end page ----------
img = ImageReader(WORK + '/logo-navy.png')
iw, ih = img.getSize(); lw = 230; lh = lw * ih/iw
c.setFillColor(RED); c.roundRect(W/2 - 30, H/2 + 170, 60, 3.2, 1.6, stroke=0, fill=1)
c.drawImage(img, W/2 - lw/2, H/2 + 150 - lh, lw, lh, mask='auto')
est = style('Mulish-It', 10.5, SMOKY, leading=15.5, align=1)
ty = para(c, html.escape('%s is a project of The Candler Foundry, making the best of biblical scholarship accessible to everyone.' % C['meta']['series']),
     est, W/2 - 150, H/2 + 116 - lh, 300)
uy = ty - 26
c.setFont('Mulish-XB', 9.5); c.setFillColor(NAVY)
c.drawCentredString(W/2, uy, 'CANDLERFOUNDRY.EMORY.EDU')
c.linkURL('https://www.candlerfoundry.emory.edu', (W/2 - 100, uy - 4, W/2 + 100, uy + 10), relative=0)
c.setFont('Mulish', 8); c.setFillColor(SMOKY)
c.drawCentredString(W/2, 42, 'Scripture quotations are from the New Revised Standard Version, Updated Edition. Copyright © 2021 National Council of Churches.')
c.showPage()
c.save()
print('PDF written')
