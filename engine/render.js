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
    var quotes = '<div class="quotes">' + L.quotes.map(function (q) { return "<div>" + esc(q) + "</div>"; }).join("") + "</div>";
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

  function headerSlot(l) {
    if (l.headerImage) return '<div class="hdrslot"><img src="' + esc(l.headerImage) + '" alt="Lesson ' + l.n + ' — ' + esc(l.title) + '"></div>';
    return '<div class="hdrslot"><div class="hcir">' + SPARKS + '<span class="hnum">' + pad2(l.n) + '</span></div>' +
      '<div class="hright"><div class="htitle">' + esc(l.title) + '</div>' +
      '<div class="href">' + esc(l.reference) + '</div></div></div>';
  }

  function lessonPageA(l) {
    return '<div class="pg lesson">' + headerSlot(l) +
      '<div class="sec tight">' + ico("prayer") + '<span class="sl">Opening Prayer</span><span class="lead"></span></div>' +
      '<div class="card"><p>' + esc(l.openingPrayer) + '</p></div>' +
      '<div class="sec">' + ico("book") + '<span class="sl">Read the Scripture</span><span class="lead"></span></div>' +
      '<button class="scripcard" type="button" data-scrip="' + l.n + '"><span class="ref">' + esc(l.scriptureRef) + '</span>' +
      '<span class="scripbtn">Read the passage <span class="badge">NRSVUE</span> <i class="fa-solid fa-book-open"></i></span></button>' +
      '<div class="sec">' + ico("play") + '<span class="sl">Watch the 3-Minute Bible</span><span class="lead"></span></div>' +
      '<div class="vzone">' + videoCard(l) + funFact(l) + '</div></div>';
  }

  function funFact(l) {
    if (!l.funFact) return "";
    return '<div class="funfact"><span class="fflabel">Did you know?</span><p>' + esc(l.funFact) + '</p></div>';
  }

  function videoCard(l) {
    if (l.videoUrl) return '<div class="vcard"><iframe src="' + esc(l.videoUrl) + '" title="3-Minute Bible" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>';
    return '<div class="vcard"><span class="vlabel">3-Minute Bible</span>' + HILLS +
      '<div class="vplay"><i class="fa-solid fa-play"></i></div><span class="vcap">' + esc(l.videoSubtitle) + '</span></div>';
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

  // rendered only when the lesson has extras waiting in the back; a real <button>
  // (buttons don't trigger StPageFlip's click-to-flip) that jumps to Additional Resources
  function moreBtn(l) {
    if (!l.optionalVideo && !(l.optionalReadings && l.optionalReadings.length)) return "";
    return '<button class="morebtn" type="button" data-gotores="1">More on this lesson <i class="fa-solid fa-arrow-right"></i></button>';
  }

  function resourcesPage() {
    function rcard(l, o, kind) {
      var icon = kind === "read" ? "fa-book-open" : "fa-play";
      var defSub = kind === "read" ? "Free online reading" : "3-Minute Bible · optional";
      var inner = '<span class="rp"><i class="fa-solid ' + icon + '"></i></span>' +
        '<span class="rmid"><span class="rtl">' + esc(o.title) + '</span><span class="rsub">' + esc(o.subtitle || defSub) + '</span></span>' +
        '<span class="rref">Lesson ' + l.n + ' &middot; ' + esc(l.tabRef || l.shortRef) + '</span>';
      var cls = "rcard" + (kind === "read" ? " rread" : "");
      return o.url
        ? '<a class="' + cls + '" href="' + esc(o.url) + '" target="_blank" rel="noopener">' + inner + '</a>'
        : '<div class="' + cls + '">' + inner + '</div>';
    }
    var cards = C.lessons.map(function (l) {
      var out = "";
      if (l.optionalVideo) out += rcard(l, l.optionalVideo, "video");
      (l.optionalReadings || []).forEach(function (r) { out += rcard(l, r, "read"); });
      return out;
    }).join("");
    if (!cards) cards = '<div class="rnone">Optional videos and readings will appear here as they are added.</div>';
    return '<div class="pg resources"><div class="chead">Additional Resources</div>' +
      '<div class="lede">Optional viewing and reading for classes that want to go deeper.</div>' +
      '<div class="rlist">' + cards + '</div>' +
      '<div class="rnote">More optional videos and readings will appear here as they’re added to future lessons.</div></div>';
  }

  function endPage() {
    return '<div class="pg endpg"><div class="redrule"></div>' +
      '<img class="biglogo" src="assets/candler-foundry-logo.png" alt="The Candler Foundry">' +
      '<div class="em">' + esc(C.meta.series) + ' is a project of The Candler Foundry, making the best of biblical scholarship accessible to everyone.</div>' +
      '<div class="url">candlerfoundry.org</div></div>';
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
    push(lessonPageA(l)); pageToLesson.push(l.n);
    push(lessonPageB(l)); pageToLesson.push(l.n);
  });
  var RESOURCES_IDX = pages.length;
  push(resourcesPage()); pageToLesson.push(-1);
  push(endPage()); pageToLesson.push(-1);
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
  spine.innerHTML = '<div class="dash"></div><div class="svtitle">' + esc(C.meta.series) + '</div>' +
    '<div class="foundrymark" title="The Candler Foundry"></div>';

  var tabsEl = document.getElementById("tabs");
  var tabsHtml = '<div class="tab small" data-tab="contents"><span class="ti"><i class="fa-solid fa-list"></i></span><span class="tl">Contents</span></div>';
  C.lessons.forEach(function (l) {
    tabsHtml += '<div class="tab" data-tab="' + l.n + '"><span class="tn">' + l.n + '</span><span class="tl">' + esc(l.tabRef || l.shortRef) + '</span></div>';
  });
  tabsHtml += '<div class="tab small" data-tab="resources"><span class="ti"><i class="fa-solid fa-circle-play"></i></span><span class="tl">Additional Resources</span></div>';
  tabsEl.innerHTML = tabsHtml;

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
    if (i >= 2 && i <= 3) active = "contents";
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
    if (t === "contents") flip.flip(2);
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

  flipEl.addEventListener("click", function (e) {
    var card = e.target.closest(".scripcard");
    if (card) { e.stopPropagation(); openScrip(parseInt(card.getAttribute("data-scrip"), 10)); return; }
    var m = e.target.closest("[data-gotores]");
    if (m) { e.stopPropagation(); flip.flip(RESOURCES_IDX); return; }
    var t = e.target.closest("[data-goto]");
    if (t) gotoLesson(parseInt(t.getAttribute("data-goto"), 10));
  });
})();
