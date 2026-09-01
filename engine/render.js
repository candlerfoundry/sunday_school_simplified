/* Sunday School Simplified — shared flipbook engine (binder design).
 * cover · letter · contents(TOC + rhythm strip) · 2 pages per lesson ·
 * additional resources · end page. */
(function () {
  "use strict";
  var C = window.BBS_CONTENT;
  if (!C) { console.error("BBS_CONTENT missing"); return; }
  var esc = function (s) { return String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); };
  var bold = function (s) { return esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"); };
  var ico = function (name) { return '<span class="ic ic-' + name + '"></span>'; };
  var pad2 = function (n) { return n < 10 ? "0" + n : String(n); };
  var SPARKS = '<svg class="hsparks" viewBox="0 0 34 34"><g stroke="#FB1616" stroke-width="4" stroke-linecap="round"><path d="M17 2 L17 12"/><path d="M31 8 L23 15"/><path d="M3 8 L11 15"/></g></svg>';
  var HILLS = '<svg class="vhills" viewBox="0 0 700 150" preserveAspectRatio="none"><path d="M0 90 Q160 40 340 78 T700 66 L700 150 L0 150 Z" fill="#B7D3EE"/><path d="M0 118 Q210 70 430 104 T700 100 L700 150 L0 150 Z" fill="#A6C7E8"/></svg>';

  /* ---------- pages ---------- */
  function coverPage() { return '<div class="pg cover"><img class="full" src="assets/cover.png" alt="' + esc(C.meta.title) + '"></div>'; }

  function letterPage() {
    var L = C.meta.letter; if (!L) return '<div class="pg"></div>';
    var p1 = L.paragraphs.map(function (t) { return "<p>" + bold(t) + "</p>"; }).join("");
    var quotes = (L.quotes && L.quotes.length) ? '<div class="quotes">' + L.quotes.map(function (q) { return "<div>" + esc(q) + "</div>"; }).join("") + "</div>" : "";
    var p2 = L.paragraphs2.map(function (t) { return "<p>" + bold(t) + "</p>"; }).join("");
    var p3 = L.paragraphs3.map(function (t) { return "<p>" + bold(t) + "</p>"; }).join("");
    return '<div class="pg letter"><div class="redrule"></div>' +
      '<div class="lettertitle">' + esc(L.heading) + '</div>' +
      '<div class="lbody">' + p1 + quotes + p2 + p3 +
        '<div class="signoff"><div class="g">' + esc(L.grace) + '</div><div class="s">' + esc(L.signName) + '</div></div>' +
      '</div></div>';
  }

  function contentsPage() {
    var rows = C.lessons.map(function (l) {
      return '<a class="crow" data-goto="' + l.n + '"><span class="cn">' + l.n + '</span>' +
        '<span class="ct">' + esc(l.title) + '</span>' +
        '<span class="cref">' + esc(l.shortRef || l.reference) + '</span></a>';
    }).join("");
    var L = C.meta.letter, rhythm = "";
    if (L && L.steps && L.steps.length) {
      rhythm = '<div class="rhythm"><div class="rt">' + esc(L.rhythmTitle) + '</div><div class="rsteps">' +
        L.steps.map(function (s, i) { return '<div class="rstep"><div class="n">' + (i + 1) + '</div><div class="t">' + esc(s) + '</div></div>'; }).join("") +
        '</div></div>';
    }
    var lede = C.contentsIntro ? '<div class="lede">' + esc(C.contentsIntro) + '</div>' : "";
    return '<div class="pg contents"><div class="chead">In This Packet</div>' + lede +
      '<div class="clist">' + rows + '</div>' + rhythm + '</div>';
  }

  var NUMWORDS = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
  function numWord(n) { return NUMWORDS[n] || String(n); }

  function headerSlot(l) {
    if (l.headerImage) return '<div class="hdrslot"><img src="' + esc(l.headerImage) + '" alt="Lesson ' + l.n + ' — ' + esc(l.title) + '"></div>';
    // .heyebrow is display:none in the shared engine (packets opt in via CSS); leaves art-header packets unchanged
    return '<div class="hdrslot"><div class="hcir">' + SPARKS + '<span class="hnum">' + pad2(l.n) + '</span></div>' +
      '<div class="hright"><div class="heyebrow">Lesson ' + numWord(l.n) + '</div><div class="htitle">' + esc(l.title) + '</div>' +
      '<div class="href">' + esc(l.reference) + '</div></div></div>';
  }

  function lessonPageA(l) {
    return '<div class="pg lesson">' + headerSlot(l) +
      '<div class="sec tight">' + ico("prayer") + '<span class="sl">Opening Prayer</span><span class="lead"></span></div>' +
      '<div class="card"><p>' + esc(l.openingPrayer) + '</p></div>' +
      '<div class="sec">' + ico("book") + '<span class="sl">Read the Scripture</span><span class="lead"></span></div>' +
      '<button class="scripcard" type="button" data-scrip="' + l.n + '"><span class="ref">' + esc(l.scriptureRef) + '</span>' +
      '<span class="scripbtn">Read the passage <span class="badge">NRSVUE</span> <i class="fa-solid fa-book-open"></i></span></button>' +
      '<div class="sec">' + ico("play") + '<span class="sl">Watch the 3 Minute Bible</span><span class="lead"></span></div>' +
      '<div class="vzone">' + videoCard(l) + funFact(l) + '</div></div>';
  }

  function funFact(l) {
    if (!l.funFact) return "";
    return '<div class="funfact"><span class="fflabel">Did you know?</span><p>' + esc(l.funFact) + '</p></div>';
  }

  function videoCard(l) {
    // Clean 16:9 placeholder that opens the pop-out modal on click (data-vpop is handled by
    // the delegated flip-container listener). We deliberately do NOT embed the Vimeo iframe
    // in-frame -- its preview chrome (thumbnail + title/byline metadata) is ugly.
    var inner = '<span class="vlabel">3 Minute Bible</span>' + HILLS +
      '<div class="vplay"><i class="fa-solid fa-play"></i></div><span class="vcap">' + esc(l.videoSubtitle) + '</span>';
    if (l.videoUrl) return '<button class="vcard vcardbtn" type="button" data-vpop="' + l.n +
      '" aria-label="Play the 3 Minute Bible video">' + inner + '</button>';
    return '<div class="vcard">' + inner + '</div>';
  }

  function lessonPageB(l) {
    var q = l.questions.map(function (t, i) { return '<div class="q"><span class="qn">' + (i + 1) + '</span><p>' + esc(t) + '</p></div>'; }).join("");
    return '<div class="pg lesson">' +
      '<div class="sec" style="margin-top:0">' + ico("dialogue") + '<span class="sl">Discussion Questions</span><span class="lead"></span></div>' +
      '<div class="qs' + (l.questions.length >= 6 ? ' qmany' : '') + '">' + q + '</div>' +
      '<div class="sec">' + ico("prayer") + '<span class="sl">Closing Prayer</span><span class="lead"></span></div>' +
      '<div class="card"><p>' + esc(l.closingPrayer) + '</p></div>' +
      '<div class="foot"><span>' + esc(C.meta.title) + ' &middot; Lesson ' + pad2(l.n) + ' of ' + C.lessons.length + '</span>' + moreBtn(l) + '</div></div>';
  }

  // image-based lesson pages: the packet supplies full-page art (2 pages) and the engine
  // overlays only the interactive bits (scripture popout hotspot, video). Backward
  // compatible: lessons without pageImages render the normal engine-drawn pages.
  function lessonImagePageA(l) {
    var h = l.hotspots || {}, s = h.scripture, v = h.video;
    var out = '<div class="pg imgpage"><img class="pgimg" src="' + esc(l.pageImages[0]) + '" alt="Lesson ' + l.n + ' — ' + esc(l.title) + '">';
    if (s) out += '<button class="imghot imgscrip" type="button" data-scrip="' + l.n + '" aria-label="Read the passage" ' +
      'style="left:' + s.x + '%;top:' + s.y + '%;width:' + s.w + '%;height:' + s.h + '%">' +
      '<span class="ihs-ref">' + esc(l.scriptureRef) + '</span>' +
      '<span class="ihs-btn">Read the passage <span class="ihs-badge">NRSVUE</span> <i class="fa-solid fa-book-open"></i></span></button>';
    // Video: the art already draws a clean "3 Minute Bible" placeholder with a play button;
    // overlay a transparent hotspot that opens the pop-out modal (autoplay). We do NOT embed
    // the Vimeo iframe in-frame — its preview chrome (orange thumbnail + metadata) is ugly.
    if (v && l.videoUrl) out += '<button class="imghot imgvidhot" type="button" data-vpop="' + l.n + '" aria-label="Play the 3 Minute Bible video" ' +
      'style="left:' + v.x + '%;top:' + v.y + '%;width:' + v.w + '%;height:' + v.h + '%"></button>';
    // Optional "TIP" hotspot: a transparent link over the art's TIP badge that opens an
    // extra passage in a new tab (link-only, no modal). Rendered only when the lesson
    // supplies hotspots.tip + tipUrl (e.g. Lesson 3 -> the full second creation narrative).
    var t = h.tip;
    if (t && (l.tipText || l.tipUrl)) out += '<button class="imghot imgtip" type="button" data-tip="' + l.n + '" ' +
      'aria-label="' + esc(l.tipLabel || l.tipLinkText || 'Optional further reading') + '" ' +
      'style="left:' + t.x + '%;top:' + t.y + '%;width:' + t.w + '%;height:' + t.h + '%"></button>';
    return out + '</div>';
  }
  function lessonImagePageB(l) {
    return '<div class="pg imgpage"><img class="pgimg" src="' + esc(l.pageImages[1]) + '" alt="Lesson ' + l.n + ' — ' + esc(l.title) + ' (continued)"></div>';
  }

  // A lesson's resources, normalized. optionalVideos (array) is the current shape;
  // optionalVideo (single object) is still accepted for backward compatibility.
  function resNorm(l) {
    var vids = l.optionalVideos || (l.optionalVideo ? [l.optionalVideo] : []);
    var arts = l.artwork || [];
    var reads = l.optionalReadings || [];
    return { vids: vids, arts: arts, reads: reads, count: vids.length + arts.length + reads.length };
  }

  // rendered only when the lesson has extras waiting in the back; a real <button>
  // (buttons don't trigger StPageFlip's click-to-flip) jumps to Additional Resources
  // and auto-opens this lesson's accordion row (data-gotores carries the lesson n).
  function moreBtn(l) {
    if (!resNorm(l).count) return "";
    return '<button class="morebtn" type="button" data-gotores="' + l.n + '">More on this lesson <i class="fa-solid fa-arrow-right"></i></button>';
  }

  // one resource card (video / artwork / reading). Videos with no url render as a
  // non-link "coming soon" chip; everything else links out in a new tab.
  function resCard(o, kind) {
    var icon = kind === "art" ? "fa-image" : kind === "read" ? "fa-book-open" : "fa-play";
    var defSub = kind === "art" ? "Artwork" : kind === "read" ? "Free online reading" : "3 Minute Bible";
    var soon = kind === "vid" && !o.url;
    var go = soon ? "Coming soon" : (kind === "vid" ? 'Watch <i class="fa-solid fa-arrow-up-right-from-square"></i>' : 'Open <i class="fa-solid fa-arrow-up-right-from-square"></i>');
    var inner = '<span class="rp"><i class="fa-solid ' + icon + '"></i></span>' +
      '<span class="rmid"><span class="rtl">' + esc(o.title) + '</span><span class="rsub">' + esc(o.subtitle || defSub) + '</span></span>' +
      '<span class="rgo">' + go + '</span>';
    var cls = "rcard r" + kind + (soon ? " rsoon" : "");
    return (o.url && !soon)
      ? '<a class="' + cls + '" href="' + esc(o.url) + '" target="_blank" rel="noopener">' + inner + '</a>'
      : '<div class="' + cls + '">' + inner + '</div>';
  }

  function bookCard(b) {
    var buys = "";
    if (b.amazon) buys += '<a class="buy" href="' + esc(b.amazon) + '" target="_blank" rel="noopener">Amazon <i class="fa-solid fa-arrow-up-right-from-square"></i></a>';
    if (b.bookshop) buys += '<a class="buy" href="' + esc(b.bookshop) + '" target="_blank" rel="noopener">Bookshop.org <i class="fa-solid fa-arrow-up-right-from-square"></i></a>';
    return '<div class="book"><span class="rp"><i class="fa-solid fa-book"></i></span>' +
      '<span class="bookm"><span class="booktl">' + esc(b.title) + '</span>' +
      '<span class="bookby">' + esc(b.authors) + '</span>' +
      (b.isbn13 ? '<span class="bookisbn">ISBN ' + esc(b.isbn13) + '</span>' : '') +
      '<span class="buys">' + buys + '</span></span></div>';
  }

  function accRow(id, chip, chipCls, title, sub, count, bodyHtml) {
    return '<div class="accrow" data-accrow="' + id + '">' +
      '<button class="acchead" type="button">' +
        '<span class="accchip ' + chipCls + '">' + chip + '</span>' +
        '<span class="accti"><span class="acctl">' + esc(title) + '</span><span class="accsub">' + esc(sub) + '</span></span>' +
        '<span class="acccount">' + esc(count) + '</span>' +
        '<span class="acccaret"><i class="fa-solid fa-chevron-right"></i></span>' +
      '</button>' +
      '<div class="accbody"><div class="accbodyin">' + bodyHtml + '</div></div></div>';
  }

  // Additional Resources = a dropdown accordion: one row per lesson that has extras,
  // plus a shared "Recommended Reading" row (meta.recommendedReading) for the packet.
  function resourcesPage() {
    var rows = "";
    C.lessons.forEach(function (l) {
      var r = resNorm(l);
      if (!r.count) return;
      var body = r.vids.map(function (v) { return resCard(v, "vid"); }).join("") +
        r.arts.map(function (a) { return resCard(a, "art"); }).join("") +
        r.reads.map(function (x) { return resCard(x, "read"); }).join("");
      rows += accRow("L" + l.n, l.n, "", l.title, l.shortRef || l.reference,
        r.count + " resource" + (r.count > 1 ? "s" : ""), body);
    });
    var rr = C.meta.recommendedReading || [];
    if (rr.length) {
      rows += accRow("READ", '<i class="fa-solid fa-book"></i>', "accchip-read",
        "Recommended Reading", "For every lesson in this packet",
        rr.length + " books", rr.map(bookCard).join(""));
    }
    if (!rows) rows = '<div class="rnone">Extra videos, artwork, and readings will appear here as they are added.</div>';
    // the resources page is now the LAST page: the Candler Foundry sign-off (shrunk,
    // linkable logo + linkable URL) sits at the bottom, replacing the old end page.
    var foot = '<div class="resfoot">' +
      '<a class="resfoot-logo" href="https://candlerfoundry.emory.edu" target="_blank" rel="noopener" aria-label="The Candler Foundry — candlerfoundry.emory.edu">' +
        '<img src="assets/candler-foundry-logo.png" alt="The Candler Foundry"></a>' +
      '<a class="resfoot-url" href="https://candlerfoundry.emory.edu" target="_blank" rel="noopener">candlerfoundry.emory.edu</a>' +
      '</div>';
    return '<div class="pg resources"><div class="chead">Additional Resources</div>' +
      '<div class="lede">Extra viewing, artwork, and reading for classes that want to go deeper. Tap a lesson to open its resources.</div>' +
      '<div class="acc" id="resacc">' + rows + '</div>' + foot + '</div>';
  }

  /* ---------- assemble ---------- */
  var pages = [], pageToLesson = [];
  function push(html, cls, hard) { pages.push({ html: html, cls: cls || "", hard: !!hard }); }
  // invisible blank page before the cover: makes the cover the right half of a
  // normal spread, so it flips with the same soft curl as every page and the book
  // never slides sideways (StPageFlip's showCover mode animates covers rigidly).
  push('<div class="pg"></div>', "blankpg"); pageToLesson.push(0);
  push(coverPage(), "coverpg"); pageToLesson.push(0);
  push(letterPage()); pageToLesson.push(0);
  push(contentsPage()); pageToLesson.push(0);
  C.lessons.forEach(function (l) {
    var img = l.pageImages && l.pageImages.length >= 2;
    push(img ? lessonImagePageA(l) : lessonPageA(l)); pageToLesson.push(l.n);
    push(img ? lessonImagePageB(l) : lessonPageB(l)); pageToLesson.push(l.n);
  });
  var RESOURCES_IDX = pages.length;
  push(resourcesPage()); pageToLesson.push(-1);
  // spreads pair (0,1),(2,3)... — total must be even
  if (pages.length % 2 !== 0) { push('<div class="pg"></div>'); pageToLesson.push(-1); }

  var flipEl = document.getElementById("pageflip");
  pages.forEach(function (p) {
    var d = document.createElement("div");
    d.className = "page " + p.cls;
    if (p.hard) d.setAttribute("data-density", "hard");
    d.innerHTML = p.html;
    flipEl.appendChild(d);
  });

  /* ---------- binder chrome ---------- */
  var binderEl = document.querySelector(".binder");
  var deco = document.createElement("div");
  deco.className = "bookdeco";
  deco.innerHTML = '<div class="stack left"></div><div class="stack right"></div><div class="gutter"></div>';
  binderEl.appendChild(deco);

  var spine = document.getElementById("spine");
  spine.innerHTML = '<div class="svtitle">' + esc(C.meta.series) + '</div>' +
    '<div class="foundrymark" title="The Candler Foundry"></div>';

  var tabsEl = document.getElementById("tabs");
  var tabsHtml = '<div class="tab small" data-tab="cover"><span class="ti"><i class="fa-solid fa-book"></i></span><span class="tl">Cover</span></div>';
  tabsHtml += '<div class="tab small" data-tab="contents"><span class="ti"><i class="fa-solid fa-list"></i></span><span class="tl">Contents</span></div>';
  C.lessons.forEach(function (l) {
    tabsHtml += '<div class="tab" data-tab="' + l.n + '"><span class="tn">' + l.n + '</span><span class="tl">' + esc(l.tabRef || l.shortRef) + '</span></div>';
  });
  tabsHtml += '<div class="tab small" data-tab="resources"><span class="ti"><i class="fa-solid fa-circle-play"></i></span><span class="tl">Additional Resources</span></div>';
  // download tab (replaces the old fixed side ribbon) — only when the packet ships a PDF
  if (C.meta.pdf) tabsHtml += '<a class="tab small download" data-tab="download" href="' + esc(C.meta.pdf) + '" target="_blank" rel="noopener"><span class="ti"><i class="fa-solid fa-file-pdf"></i></span><span class="tl">Printable Packet</span></a>';
  tabsEl.innerHTML = tabsHtml;
  // Printable Packet opens in its own pop-out window ("a separate box"), never an auto-download.
  // It is routed through the in-page PDF viewer (/pdfview.html) so the packet's scripture, video
  // and resource links open in a NEW browser tab instead of replacing the packet — a browser's
  // built-in PDF viewer navigates the same window and offers no way back (Emily, 2026-09-01).
  // If the browser blocks the popup we do NOT preventDefault, so the anchor (also pointed at the
  // viewer below) still opens it in a new tab.
  var pdfTab = tabsEl.querySelector("a.tab.download");
  if (pdfTab) {
    var pdfAbs = new URL(C.meta.pdf, location.href).href;
    var pdfViewer = "/pdfview.html?file=" + encodeURIComponent(pdfAbs)
                  + "&title=" + encodeURIComponent(C.meta.title || "Printable Packet");
    pdfTab.setAttribute("href", pdfViewer);
    pdfTab.addEventListener("click", function (e) {
      var win = window.open(pdfViewer, "sssPdf", "width=980,height=1150,scrollbars=yes,resizable=yes");
      if (win) { e.preventDefault(); win.focus(); }
    });
  }

  /* ---------- flip ---------- */
  var PageFlip = (window.St && window.St.PageFlip) || window.PageFlip;
  var flip = new PageFlip(flipEl, { width: 816, height: 1056, size: "fixed", showCover: false, usePortrait: false,
    maxShadowOpacity: 0.5, drawShadow: true, flippingTime: 700, mobileScrollSupport: false, disableFlipByClick: true });
  flip.loadFromHTML(document.querySelectorAll("#pageflip .page"));

  var scaler = document.getElementById("binder-scaler");
  var SPINE_W = 68, TAB_W = 132;
  function fit() {
    var w = SPINE_W + 816 * 2 + TAB_W, h = 1056;
    var s = Math.min((window.innerWidth - 130) / w, (window.innerHeight - 24) / h);
    scaler.style.setProperty("--book-scale", s);
    document.documentElement.style.setProperty("--book-scale", s);
  }
  window.addEventListener("resize", fit); fit();

  var prev = document.getElementById("navPrev"), next = document.getElementById("navNext");
  prev.addEventListener("click", function () { flip.flipPrev(); });
  next.addEventListener("click", function () { flip.flipNext(); });
  document.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") flip.flipPrev(); if (e.key === "ArrowRight") flip.flipNext(); });

  function syncUi() {
    var i = flip.getCurrentPageIndex(), t = pages.length;
    prev.disabled = i <= 0; next.disabled = i >= t - 1;
    binderEl.classList.toggle("on-cover", i <= 1);
    var active = null;
    if (i <= 1) active = "cover";
    else if (i >= 2 && i <= 3) active = "contents";
    else if (i >= RESOURCES_IDX) active = "resources";
    else if (pageToLesson[i] > 0) active = String(pageToLesson[i]);
    else if (pageToLesson[i + 1] > 0) active = String(pageToLesson[i + 1]);
    Array.prototype.forEach.call(tabsEl.querySelectorAll(".tab"), function (tb) {
      tb.classList.toggle("active", tb.getAttribute("data-tab") === active);
    });
  }
  flip.on("flip", syncUi); flip.on("init", syncUi); syncUi();

  // deep links from the printable PDF QR codes: ?lesson=N, ?goto=resources|contents
  (function () {
    var q = new URLSearchParams(window.location.search);
    var target = null;
    if (q.get("lesson")) { var n = parseInt(q.get("lesson"), 10); var i = pageToLesson.indexOf(n); if (i > -1) target = i; }
    else if (q.get("goto") === "resources") target = RESOURCES_IDX;
    else if (q.get("goto") === "contents") target = 2;
    if (target !== null) setTimeout(function () { flip.turnToPage(target); syncUi(); }, 60);
  })();
  flip.on("changeState", function (e) {
    binderEl.classList.toggle("flipping", e.data === "flipping" || e.data === "user_fold" || e.data === "fold_corner");
  });

  function gotoLesson(n) { var idx = pageToLesson.indexOf(n); if (idx > -1) flip.flip(idx); }
  tabsEl.addEventListener("click", function (e) {
    var tb = e.target.closest(".tab"); if (!tb) return;
    var t = tb.getAttribute("data-tab");
    if (t === "download") return;   // handled by the pop-out listener above; never auto-downloads
    if (t === "cover") flip.flip(0);
    else if (t === "contents") flip.flip(2);
    else if (t === "resources") flip.flip(RESOURCES_IDX);
    else gotoLesson(parseInt(t, 10));
  });

  /* ---------- scripture popout modal ---------- */
  var scrim = document.createElement("div");
  scrim.className = "scrim"; scrim.setAttribute("aria-hidden", "true");
  scrim.innerHTML = '<div class="modal" role="dialog" aria-modal="true">' +
    '<div class="mhead"><div class="mref"></div>' +
    '<button class="mclose" type="button" aria-label="Close">&times;</button></div>' +
    '<div class="mbody"></div>' +
    '<div class="mfoot"><a class="mopen" target="_blank" rel="noopener">Open in Bible Gateway <i class="fa-solid fa-arrow-up-right-from-square"></i></a>' +
    '<span class="mattr">New Revised Standard Version, Updated Edition (NRSVUE)<br>Copyright &copy; 2021 National Council of Churches</span></div></div>';
  document.body.appendChild(scrim);
  var mref = scrim.querySelector(".mref"), mbody = scrim.querySelector(".mbody"), mopen = scrim.querySelector(".mopen");
  function openScrip(n) {
    var l = null, i;
    for (i = 0; i < C.lessons.length; i++) { if (C.lessons[i].n === n) { l = C.lessons[i]; break; } }
    if (!l) return;
    mref.textContent = l.scriptureRef;
    mbody.innerHTML = l.scriptureText || '<p class="note">Passage text coming soon.</p>';
    if (l.scriptureUrl) { mopen.href = l.scriptureUrl; mopen.style.display = ""; } else { mopen.style.display = "none"; }
    scrim.classList.add("show"); scrim.setAttribute("aria-hidden", "false"); mbody.scrollTop = 0;
  }
  function closeScrip() { scrim.classList.remove("show"); scrim.setAttribute("aria-hidden", "true"); }
  scrim.addEventListener("click", function (e) { if (e.target === scrim || e.target.closest(".mclose")) closeScrip(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeScrip(); });

  /* ---------- video pop-out modal (image-page lessons) ---------- */
  var vscrim = document.createElement("div");
  vscrim.className = "scrim vscrim"; vscrim.setAttribute("aria-hidden", "true");
  vscrim.innerHTML = '<div class="vmodal" role="dialog" aria-modal="true"><button class="vmclose" type="button" aria-label="Close">&times;</button><div class="vmframe"></div></div>';
  document.body.appendChild(vscrim);
  var vmframe = vscrim.querySelector(".vmframe");
  function openVideo(n) {
    var l = null, i; for (i = 0; i < C.lessons.length; i++) { if (C.lessons[i].n === n) { l = C.lessons[i]; break; } }
    if (!l || !l.videoUrl) return;
    var sep = l.videoUrl.indexOf("?") > -1 ? "&" : "?";
    vmframe.innerHTML = '<iframe src="' + esc(l.videoUrl) + sep + 'autoplay=1" title="3 Minute Bible" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>';
    vscrim.classList.add("show"); vscrim.setAttribute("aria-hidden", "false");
  }
  function closeVideo() { vscrim.classList.remove("show"); vscrim.setAttribute("aria-hidden", "true"); vmframe.innerHTML = ""; }
  vscrim.addEventListener("click", function (e) { if (e.target === vscrim || e.target.closest(".vmclose")) closeVideo(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeVideo(); });

  /* ---------- "TIP" pop-out (image-page lessons): advisory note + a link ---------- */
  var tscrim = document.createElement("div");
  tscrim.className = "scrim tipscrim"; tscrim.setAttribute("aria-hidden", "true");
  tscrim.innerHTML = '<div class="tipmodal" role="dialog" aria-modal="true">' +
    '<button class="tmclose" type="button" aria-label="Close">&times;</button>' +
    '<div class="tiphead"><span class="tipbadge">TIP</span></div>' +
    '<div class="tipbody"></div>' +
    '<a class="tipopen" target="_blank" rel="noopener"></a></div>';
  document.body.appendChild(tscrim);
  var tbody = tscrim.querySelector(".tipbody"), topen = tscrim.querySelector(".tipopen");
  function openTip(n) {
    var l = null, i; for (i = 0; i < C.lessons.length; i++) { if (C.lessons[i].n === n) { l = C.lessons[i]; break; } }
    if (!l || !(l.tipText || l.tipUrl)) return;
    tbody.textContent = l.tipText || "";
    if (l.tipUrl) { topen.href = l.tipUrl; topen.innerHTML = esc(l.tipLinkText || "Read the passage") + ' <i class="fa-solid fa-arrow-up-right-from-square"></i>'; topen.style.display = ""; }
    else { topen.style.display = "none"; }
    tscrim.classList.add("show"); tscrim.setAttribute("aria-hidden", "false");
  }
  function closeTip() { tscrim.classList.remove("show"); tscrim.setAttribute("aria-hidden", "true"); }
  tscrim.addEventListener("click", function (e) { if (e.target === tscrim || e.target.closest(".tmclose")) closeTip(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeTip(); });

  /* ---------- resources accordion ---------- */
  function accRows() { return document.querySelectorAll("#resacc .accrow"); }
  function accClose(row) {
    row.classList.remove("open");
    var b = row.querySelector(".accbody");
    if (b) b.style.maxHeight = "0px";
  }
  function accOpen(row) {
    Array.prototype.forEach.call(accRows(), function (o) { if (o !== row) accClose(o); });
    row.classList.add("open");
    var b = row.querySelector(".accbody"), inner = b.querySelector(".accbodyin");
    b.style.maxHeight = inner.scrollHeight + "px";
    // bring the opened row into view; the .acc column scrolls if the body is tall
    setTimeout(function () { row.scrollIntoView({ block: "nearest" }); }, 220);
  }
  function accToggle(row) { row.classList.contains("open") ? accClose(row) : accOpen(row); }
  function accOpenLesson(n) {
    var row = document.querySelector('#resacc [data-accrow="L' + n + '"]');
    if (row) accOpen(row);
  }

  flipEl.addEventListener("click", function (e) {
    var ah = e.target.closest(".acchead");
    if (ah) { e.stopPropagation(); accToggle(ah.parentNode); return; }
    var vp = e.target.closest("[data-vpop]");
    if (vp) { e.stopPropagation(); openVideo(parseInt(vp.getAttribute("data-vpop"), 10)); return; }
    var card = e.target.closest("[data-scrip]");
    if (card) { e.stopPropagation(); openScrip(parseInt(card.getAttribute("data-scrip"), 10)); return; }
    var tp = e.target.closest("[data-tip]");
    if (tp) { e.stopPropagation(); openTip(parseInt(tp.getAttribute("data-tip"), 10)); return; }
    var m = e.target.closest("[data-gotores]");
    if (m) {
      e.stopPropagation();
      var ln = parseInt(m.getAttribute("data-gotores"), 10);
      flip.flip(RESOURCES_IDX);
      if (ln) setTimeout(function () { accOpenLesson(ln); }, 460);
      return;
    }
    var t = e.target.closest("[data-goto]");
    if (t) gotoLesson(parseInt(t.getAttribute("data-goto"), 10));
  });
})();
