/* The Gospel According to the Women — printable packet generator.
 * Ink-light, print-friendly: white pages, brown/gold ink, QR+link for scripture
 * and videos, full-color cover only. Renders a print-optimized HTML page to PDF
 * with headless Chromium (reuses the packet's own fonts/palette). This is the
 * women packet's generator — separate from Beyond Bumper Stickers' reportlab
 * make_pdf.py — because these lessons carry a mustard/brown facelift and extra
 * fields (optionalReadings, funFact). Content comes straight from content.js, so
 * re-cut whenever prayers/questions/videoUrls change.
 *
 * Re-cut procedure:
 *   1. npm i playwright-core qrcode
 *   2. node node_modules/playwright-core/cli.js install chromium-headless-shell
 *   3. node tools/make_women_pdf.js   (run from the repo root)
 *   4. Rasterize + eyeball every page (e.g. PyMuPDF fitz.open(...).get_pixmap()),
 *      then push packets/gospel-according-to-the-women/The Gospel According to the Women.pdf
 * Scripture always links+QRs to scriptureUrl (Bible Gateway NRSVUE); videos
 * link+QR when videoUrl/optionalVideo.url is set, else a "coming soon" note. */
const { chromium } = require('playwright-core');
const QR = require('qrcode');
const fs = require('fs'), path = require('path');

const REPO = path.resolve(__dirname, '..');
const PKG = path.join(REPO, 'packets/gospel-according-to-the-women');
const OUT = path.join(PKG, 'The Gospel According to the Women.pdf');
const SITE = 'https://sundayschoolsimplified.netlify.app/gospel-according-to-the-women/';

global.window = {};
require(path.join(PKG, 'content.js'));
const C = global.window.BBS_CONTENT;

const esc = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const bold = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
const NUMW = ['','One','Two','Three','Four','Five','Six'];
const pad2 = n => n < 10 ? '0'+n : ''+n;

async function qr(url){ return QR.toDataURL(url, { margin: 0, width: 240, color:{ dark:'#4a3411', light:'#ffffff' } }); }

const ICON = {
  prayer: 'assets/icons/icon-prayer.svg', book: 'assets/icons/icon-book.svg',
  play: 'assets/icons/icon-play.svg', dialogue: 'assets/icons/icon-dialogue.svg',
};
const sec = (icon, label) =>
  `<div class="sec"><span class="ic"><img src="${ICON[icon]}"></span><span class="lbl">${esc(label)}</span><span class="leader"></span></div>`;

const prayerBox = t => `<div class="pbox">${esc(t)}</div>`;

async function linkBox(title, sub, url, linkLabel){
  const q = await qr(url);
  return `<a class="lbox" href="${esc(url)}">
    <div class="lbmid"><div class="lbtitle">${esc(title)}</div>
      ${sub ? `<div class="lbsub">${esc(sub)}</div>` : ''}
      <div class="lblink">${esc(linkLabel)}</div></div>
    <img class="lbqr" src="${q}" alt="QR code">
  </a>`;
}
const infoBox = (title, sub, note) => `<div class="lbox info">
    <div class="lbmid"><div class="lbtitle">${esc(title)}</div>
      ${sub ? `<div class="lbsub">${esc(sub)}</div>` : ''}
      <div class="lbnote">${esc(note)}</div></div></div>`;

async function build(){
  const pages = [];

  // 1) cover
  pages.push(`<section class="page cover"><img src="assets/cover.png" alt="${esc(C.meta.title)}"></section>`);

  // 2) letter
  const L = C.meta.letter;
  const quotes = `<div class="quotes">${L.quotes.map(q=>`<div>${esc(q)}</div>`).join('')}</div>`;
  pages.push(`<section class="page pad">
    <div class="redrule"></div>
    <h1 class="letterhead">${esc(L.heading)}</h1>
    <div class="lbody">
      ${L.paragraphs.map(t=>`<p>${bold(t)}</p>`).join('')}
      ${quotes}
      ${L.paragraphs2.map(t=>`<p>${bold(t)}</p>`).join('')}
      ${L.paragraphs3.map(t=>`<p>${bold(t)}</p>`).join('')}
      <div class="signoff"><div>${esc(L.grace)}</div><div class="sign">${esc(L.signName)}</div></div>
    </div>
    ${footer(C.meta.title)}
  </section>`);

  // 3) contents + rhythm
  const rows = C.lessons.map(l=>`<div class="crow"><span class="cn">${l.n}</span>
      <span class="ct">${esc(l.title)}</span><span class="cref">${esc(l.shortRef||l.reference)}</span></div>`).join('');
  const steps = L.steps.map((s,i)=>`<div class="rstep"><span class="rn">${i+1}</span><span class="rt">${esc(s)}</span></div>`).join('');
  pages.push(`<section class="page pad">
    <h1 class="ph">In This Packet</h1>
    <div class="clist">${rows}</div>
    <div class="rhythm"><div class="rtitle">${esc(L.rhythmTitle)}</div><div class="rsteps">${steps}</div></div>
    ${footer(C.meta.title)}
  </section>`);

  // 4) lessons (2 pages each)
  for (const l of C.lessons){
    const foot = `${esc(C.meta.title)} · Lesson ${pad2(l.n)} of ${C.lessons.length}`;
    // page A
    const scr = await linkBox(l.scriptureRef, 'New Revised Standard Version, Updated Edition (NRSVUE)',
      l.scriptureUrl, 'Read online at Bible Gateway — or scan the code');
    const vid = l.videoUrl
      ? await linkBox(l.videoSubtitle, '3-Minute Bible video',
          l.videoUrl, 'Watch on Vimeo — or scan the code')
      : infoBox(l.videoSubtitle, '3-Minute Bible video', 'Video coming soon — it will play in the online flipbook.');
    const fun = l.funFact ? `<div class="funfact"><span class="ffl">Did you know?</span><span class="fft">${esc(l.funFact)}</span></div>` : '';
    pages.push(`<section class="page pad lesson">
      <div class="lhead"><div class="eyebrow">Lesson ${NUMW[l.n]||l.n}</div>
        <div class="ltitle">${esc(l.title)}</div><div class="lref">${esc(l.reference)}</div></div>
      ${sec('prayer','Opening Prayer')}${prayerBox(l.openingPrayer)}
      ${sec('book','Read the Scripture')}${scr}
      ${sec('play','Watch the 3-Minute Bible')}${vid}
      ${fun}
      ${footer(foot)}
    </section>`);
    // page B
    const qs = l.questions.map((q,i)=>`<div class="q"><span class="qn">${i+1}</span><p>${esc(q)}</p></div>`).join('');
    pages.push(`<section class="page pad lesson">
      ${sec('dialogue','Discussion Questions')}
      <div class="qs${l.questions.length>=6?' qmany':''}">${qs}</div>
      ${sec('prayer','Closing Prayer')}${prayerBox(l.closingPrayer)}
      ${footer(foot)}
    </section>`);
  }

  // 5) additional resources
  let rcards = '';
  for (const l of C.lessons){
    const ref = 'Lesson ' + l.n + ' · ' + (l.tabRef || l.shortRef);
    if (l.optionalVideo){
      const o = l.optionalVideo;
      rcards += o.url
        ? await rcard('play', o.title, ref + ' · ' + (o.subtitle||''), o.url, 'Watch on Vimeo — or scan')
        : rcardInfo('play', o.title, ref + ' · ' + (o.subtitle||''), 'Coming soon — plays in the online flipbook.');
    }
    for (const r of (l.optionalReadings||[])){
      rcards += await rcard('book', r.title, ref + ' · ' + (r.subtitle||''), r.url, 'Read online — or scan the code');
    }
  }
  pages.push(`<section class="page pad">
    <h1 class="ph">Additional Resources</h1>
    <p class="lede">Optional viewing and reading for classes that want to go deeper.</p>
    <div class="rlist">${rcards}</div>
    ${footer(C.meta.title)}
  </section>`);

  // 6) end page
  pages.push(`<section class="page pad endpg">
    <div class="redrule center"></div>
    <img class="endlogo" src="assets/candler-foundry-logo.png" alt="The Candler Foundry">
    <p class="endtag">${esc(C.meta.series)} is a project of The Candler Foundry, making the best of biblical scholarship accessible to everyone.</p>
    <div class="endurl">candlerfoundry.emory.edu</div>
    <div class="attrib">Scripture quotations are from the New Revised Standard Version, Updated Edition. Copyright © 2021 National Council of Churches.</div>
  </section>`);

  return pages.join('\n');

  async function rcard(icon, title, sub, url, ll){
    const q = await qr(url);
    return `<a class="rc" href="${esc(url)}"><span class="ic"><img src="${ICON[icon]}"></span>
      <span class="rcmid"><span class="rct">${esc(title)}</span><span class="rcs">${esc(sub)}</span><span class="rcl">${esc(ll)}</span></span>
      <img class="rcqr" src="${q}"></a>`;
  }
  function rcardInfo(icon, title, sub, note){
    return `<div class="rc info"><span class="ic"><img src="${ICON[icon]}"></span>
      <span class="rcmid"><span class="rct">${esc(title)}</span><span class="rcs">${esc(sub)}</span><span class="rcl note">${esc(note)}</span></span></div>`;
  }
}
function footer(text){ return `<div class="foot"><span>${esc(text)}</span></div>`; }

const CSS = `
@font-face{font-family:'Hello Handmade';src:url('../../engine/assets/fonts/hello-handmade.woff2') format('woff2');font-display:swap;}
@font-face{font-family:'Thierry';src:url('../../engine/assets/fonts/thierry.woff2') format('woff2');font-display:swap;}
*{box-sizing:border-box;margin:0;padding:0;}
:root{--ink:#332e26;--gold:#B8860B;--brown:#6d4f26;--rule:#d9c9a1;--pale:#F4E9C4;--faint:#FBF6DE;}
@page{size:8.5in 11in;margin:0;}
html,body{background:#fff;}
body{font-family:'Mulish',system-ui,sans-serif;color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact;}
.page{width:8.5in;height:11in;position:relative;overflow:hidden;background:#fff;page-break-after:always;}
.page:last-child{page-break-after:auto;}
.pad{padding:0.62in 0.66in 0.55in;}
.cover{padding:0;}
.cover img{width:8.5in;height:11in;object-fit:cover;display:block;}
.redrule{width:58px;height:3px;background:var(--gold);border-radius:2px;margin:0 auto 14px;}
.redrule.center{margin:0 auto 18px;}
/* letter */
.letterhead{font-family:'Hello Handmade',cursive;font-weight:400;font-size:27px;color:var(--gold);text-align:center;margin-bottom:20px;}
.lbody p{font-size:11pt;line-height:1.5;margin-bottom:10px;color:var(--ink);}
.lbody strong{color:var(--brown);}
.quotes{border-left:3px solid var(--gold);padding:4px 0 4px 16px;margin:6px 0 14px;}
.quotes div{font-style:italic;color:var(--brown);font-size:11pt;line-height:1.55;}
.signoff{margin-top:14px;font-size:11pt;color:var(--ink);}
.signoff .sign{font-family:'Hello Handmade',cursive;font-size:18px;color:var(--gold);margin-top:2px;}
/* headings */
.ph{font-family:'Hello Handmade',cursive;font-weight:400;font-size:30px;color:var(--gold);margin-bottom:16px;}
.lede{font-style:italic;color:var(--brown);font-size:10.5pt;margin:-8px 0 16px;}
/* contents */
.clist{display:flex;flex-direction:column;gap:9px;}
.crow{display:flex;align-items:center;border:1.4px solid var(--rule);border-radius:9px;padding:10px 14px;}
.crow .cn{font-family:'Hello Handmade',cursive;font-size:20px;color:var(--gold);width:30px;}
.crow .ct{font-weight:800;font-size:12.5pt;color:var(--ink);flex:1;}
.crow .cref{font-weight:800;font-size:8.5pt;letter-spacing:.04em;text-transform:uppercase;color:var(--brown);}
.rhythm{margin-top:20px;border-top:1.4px dashed var(--rule);padding-top:14px;}
.rtitle{text-align:center;font-weight:800;font-size:9pt;letter-spacing:.12em;text-transform:uppercase;color:var(--brown);margin-bottom:12px;}
.rsteps{display:flex;gap:10px;}
.rstep{flex:1;text-align:center;}
.rstep .rn{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:var(--gold);color:#fff;font-weight:800;font-size:10pt;margin-bottom:6px;}
.rstep .rt{display:block;font-weight:700;font-size:8.4pt;line-height:1.25;color:var(--ink);}
/* lesson header */
.lhead{margin-bottom:4px;padding-bottom:12px;border-bottom:2px solid var(--brown);}
.lhead .eyebrow{font-weight:800;font-size:9.5pt;letter-spacing:.14em;text-transform:uppercase;color:var(--brown);margin-bottom:5px;}
.lhead .ltitle{font-family:'Hello Handmade',cursive;font-weight:400;font-size:34px;color:var(--gold);line-height:1;}
.lhead .lref{font-weight:700;font-size:12pt;color:var(--brown);margin-top:7px;}
/* section header */
.sec{display:flex;align-items:center;gap:9px;margin:16px 0 9px;}
.sec .ic{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:var(--pale);border:1.4px solid var(--gold);flex:0 0 auto;}
.sec .ic img{width:13px;height:13px;}
.sec .lbl{font-weight:800;font-size:10pt;letter-spacing:.06em;text-transform:uppercase;color:var(--brown);}
.sec .leader{flex:1;border-top:1.3px dotted var(--rule);height:0;margin-top:3px;}
.lesson .sec:first-child{margin-top:6px;}
/* prayer box */
.pbox{border:1.4px solid var(--brown);border-left:7px solid var(--gold);border-radius:11px;padding:12px 15px;font-size:10.6pt;line-height:1.5;color:var(--ink);}
/* link / info box */
.lbox{display:flex;align-items:stretch;gap:12px;border:1.4px solid var(--brown);border-radius:11px;padding:12px 14px;text-decoration:none;color:var(--ink);}
.lbox.info{border-style:dashed;border-color:var(--rule);}
.lbmid{flex:1;display:flex;flex-direction:column;justify-content:center;}
.lbtitle{font-weight:800;font-size:12.5pt;color:var(--brown);}
.lbsub{font-size:9.5pt;color:var(--ink);margin-top:2px;}
.lblink{font-weight:700;font-size:9pt;color:var(--gold);text-decoration:underline;margin-top:7px;}
.lbnote{font-style:italic;font-size:9.5pt;color:var(--brown);margin-top:7px;}
.lbqr{width:66px;height:66px;flex:0 0 auto;align-self:center;}
/* fun fact */
.funfact{margin-top:12px;border-left:3px solid var(--gold);padding-left:11px;}
.funfact .ffl{font-family:'Hello Handmade',cursive;color:var(--gold);font-size:14px;display:block;}
.funfact .fft{font-style:italic;font-size:9.7pt;line-height:1.45;color:var(--ink);}
/* questions */
.qs{display:flex;flex-direction:column;}
.q{display:flex;gap:11px;padding:9px 0;border-bottom:1px dotted var(--rule);}
.q:last-child{border-bottom:0;}
.qs.qmany .q{padding:7px 0;}
.q .qn{flex:0 0 auto;width:21px;height:21px;border-radius:50%;background:var(--gold);color:#fff;font-weight:800;font-size:10pt;display:inline-flex;align-items:center;justify-content:center;margin-top:1px;}
.q p{font-size:10.6pt;line-height:1.42;color:var(--ink);}
.qs.qmany .q p{font-size:10pt;line-height:1.36;}
/* resources */
.rlist{display:flex;flex-direction:column;gap:10px;}
.rc{display:flex;align-items:center;gap:12px;border:1.4px solid var(--rule);border-radius:11px;padding:11px 14px;text-decoration:none;color:var(--ink);}
.rc .ic{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:var(--gold);flex:0 0 auto;}
.rc .ic img{width:15px;height:15px;filter:brightness(0) invert(1);}
.rcmid{flex:1;display:flex;flex-direction:column;}
.rct{font-weight:800;font-size:12pt;color:var(--brown);}
.rcs{font-size:9pt;color:var(--ink);margin-top:1px;}
.rcl{font-weight:700;font-size:8.6pt;color:var(--gold);text-decoration:underline;margin-top:5px;}
.rcl.note{color:var(--brown);text-decoration:none;font-style:italic;}
.rcqr{width:52px;height:52px;flex:0 0 auto;}
/* footer */
.foot{position:absolute;left:0.66in;right:0.66in;bottom:0.42in;border-top:1px solid var(--rule);padding-top:6px;font-weight:800;font-size:7.5pt;letter-spacing:.05em;text-transform:uppercase;color:var(--brown);}
/* end page */
.endpg{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;}
.endlogo{width:230px;margin-bottom:20px;}
.endtag{font-style:italic;color:var(--brown);font-size:11pt;line-height:1.5;max-width:340px;margin-bottom:16px;}
.endurl{font-weight:800;font-size:10pt;letter-spacing:.03em;color:var(--gold);}
.attrib{position:absolute;left:0.66in;right:0.66in;bottom:0.5in;font-size:8pt;color:var(--brown);text-align:center;}
`;

(async ()=>{
  const bodyHtml = await build();
  const html = `<!doctype html><html><head><meta charset="utf-8">
    <link href="https://fonts.googleapis.com/css2?family=Mulish:ital,wght@0,400;0,500;0,700;0,800;1,500&display=swap" rel="stylesheet">
    <style>${CSS}</style></head><body>${bodyHtml}</body></html>`;
  const htmlPath = path.join(PKG, '__print.html');
  fs.writeFileSync(htmlPath, html);

  const b = await chromium.launch({ channel:'chromium-headless-shell' });
  const pg = await (await b.newContext()).newPage();
  await pg.goto('file://' + htmlPath.replace(/\\/g,'/'), { waitUntil:'load' });
  await pg.evaluate(()=>document.fonts.ready);
  await pg.waitForTimeout(1500);
  await pg.pdf({ path: OUT, width:'8.5in', height:'11in', printBackground:true,
    margin:{top:'0',bottom:'0',left:'0',right:'0'}, preferCSSPageSize:true });
  await b.close();
  fs.unlinkSync(htmlPath);
  console.log('PDF written ->', OUT, fs.statSync(OUT).size, 'bytes');
})().catch(e=>{ console.error(e); process.exit(1); });
