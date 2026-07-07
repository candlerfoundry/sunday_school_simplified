/* Beyond Bumper Stickers — flipbook renderer.
 * cover · letter · contents(TOC) · 2 pages per lesson · back. */
(function () {
  "use strict";
  var C = window.BBS_CONTENT;
  if (!C) { console.error("BBS_CONTENT missing"); return; }
  var esc = function (s) { return String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); };
  var bold = function (s) { return esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"); };
  var ico = function (fa) { return '<span class="ic"><i class="fa-solid ' + fa + '"></i></span>'; };
  var SPARK = '<svg class="spark" viewBox="0 0 34 34"><g stroke="#FB1616" stroke-width="3" stroke-linecap="round"><path d="M17 2 L17 11"/><path d="M31 8 L24 14"/><path d="M3 8 L10 14"/></g></svg>';
  var HILLS = '<svg class="vhills" viewBox="0 0 700 150" preserveAspectRatio="none"><path d="M0 90 Q160 40 340 78 T700 66 L700 150 L0 150 Z" fill="#B7D3EE"/><path d="M0 118 Q210 70 430 104 T700 100 L700 150 L0 150 Z" fill="#A6C7E8"/></svg>' +
    '<svg class="vtree" style="left:70px;bottom:70px" width="26" height="40" viewBox="0 0 26 40"><path d="M13 2 L23 26 L3 26 Z" fill="#7FA9D4"/><path d="M13 14 L21 33 L5 33 Z" fill="#7FA9D4"/><rect x="11" y="32" width="4" height="7" fill="#5C86B5"/></svg>' +
    '<svg class="vtree" style="right:80px;bottom:64px" width="22" height="34" viewBox="0 0 26 40"><path d="M13 2 L23 26 L3 26 Z" fill="#89B0D8"/><path d="M13 14 L21 33 L5 33 Z" fill="#89B0D8"/><rect x="11" y="32" width="4" height="7" fill="#5C86B5"/></svg>';

  function coverPage() { return '<div class="page-inner cover"><img class="full" src="assets/cover.png" alt="' + esc(C.meta.title) + '"></div>'; }
  function backPage() { return '<div class="page-inner back"><img class="full" src="assets/back.jpg" alt="Beyond Bumper Stickers"></div>'; }

  function letterPage() {
    var L = C.meta.letter; if (!L) return '<div class="page-inner"></div>';
    var p1 = L.paragraphs.map(function (t) { return "<p>" + bold(t) + "</p>"; }).join("");
    var quotes = '<div class="quotes">' + L.quotes.map(function (q) { return "<div>" + esc(q) + "</div>"; }).join("") + "</div>";
    var p2 = L.paragraphs2.map(function (t) { return "<p>" + bold(t) + "</p>"; }).join("");
    var steps = L.steps.map(function (s, i) { return '<div class="rstep"><span class="n">' + (i + 1) + '</span><span class="t">' + esc(s) + "</span></div>"; }).join("");
    var p3 = L.paragraphs3.map(function (t) { return "<p>" + bold(t) + "</p>"; }).join("");
    return '<div class="page-inner letter"><div class="inner">' +
      '<div class="eyebrow">' + esc(C.meta.series) + '</div><div class="redrule"></div>' +
      '<div class="lettertitle">' + esc(L.heading) + '</div>' +
      '<div class="lbody">' + p1 + quotes + p2 +
        '<div class="rhythm"><div class="rt">' + esc(L.rhythmTitle) + '</div>' + steps + '</div>' +
        p3 +
        '<div class="signoff"><div class="g">' + esc(L.grace) + '</div><div class="s">' + esc(L.signName) + '</div></div>' +
      '</div></div></div>';
  }

  function contentsPage() {
    var rows = C.lessons.map(function (l) {
      return '<a class="crow" data-goto="' + l.n + '"><span class="cn">' + l.n + '</span>' +
        '<div class="cmid"><div class="ct">' + esc(l.title) + '</div></div>' +
        '<span class="cref">' + esc(l.shortRef || l.reference.split(":")[0]) + '</span></a>';
    }).join("");
    return '<div class="page-inner contents"><div class="inner-pad">' +
      '<div class="series"><span></span><b>' + esc(C.meta.series) + '</b></div>' +
      '<div class="chead">In This Packet</div>' +
      '<div class="lede">' + esc(C.contentsIntro) + '</div>' +
      '<div class="clist">' + rows + '</div></div></div>';
  }

  function engineHeader(l) {
    return '<div class="lhead"><div class="numwrap"><div class="lnum">' + (l.n < 10 ? "0" + l.n : l.n) + '</div>' + SPARK + '</div>' +
      '<div><div class="kicker">' + esc(l.reference) + ' &middot; Discussion Guide</div>' +
      '<div class="ltitle">' + esc(l.title) + '</div></div></div>';
  }

  function scriptureCard(l) {
    return '<div class="scripcard" data-scrip="' + l.n + '"><div class="scriprow"><span class="ref">' + esc(l.scriptureRef) + '</span>' +
      '<span class="scripbtn">Read the passage <span class="badge">NRSVUE</span> <i class="fa-solid fa-book-open"></i></span></div></div>';
  }

  function videoCard(l) {
    if (l.videoUrl) return '<div class="vcard"><iframe src="' + esc(l.videoUrl) + '" title="3-Minute Bible" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>';
    return '<div class="vcard"><span class="vlabel">3-Minute Bible</span>' + HILLS +
      '<div class="vplay"><i class="fa-solid fa-play"></i></div><span class="vtitle">' + esc(l.videoSubtitle) + '</span></div>';
  }

  function lessonPageA(l) {
    var header = l.headerImage ? '<img class="hdrimg" src="' + esc(l.headerImage) + '" alt="Lesson ' + l.n + '">' : engineHeader(l);
    var opt = l.optionalVideo
      ? '<div class="optbar"><span class="oc"><i class="fa-solid fa-play"></i></span><span class="ot">Optional Viewing<small>' + esc(l.optionalVideo.title) + ' &middot; 3-Minute Bible</small></span></div>'
      : "";
    return '<div class="page-inner lesson">' + header +
      '<div class="sec first">' + ico("fa-hands-praying") + '<span class="sl">Opening Prayer</span><span class="lead"></span></div>' +
      '<div class="card"><p>' + esc(l.openingPrayer) + '</p></div>' +
      '<div class="sec">' + ico("fa-book-open") + '<span class="sl">Read the Scripture</span><span class="lead"></span></div>' +
      scriptureCard(l) +
      '<div class="sec">' + ico("fa-play") + '<span class="sl">Watch the 3-Minute Bible</span><span class="lead"></span></div>' +
      '<div class="vwrap">' + videoCard(l) + opt + '</div></div>';
  }

  function lessonPageB(l) {
    var q = l.questions.map(function (t, i) { return '<div class="q"><span class="qn">' + (i + 1) + '</span><p>' + esc(t) + '</p></div>'; }).join("");
    return '<div class="page-inner lesson">' +
      '<div class="sec first">' + ico("fa-comment-dots") + '<span class="sl">Discussion Questions</span><span class="lead"></span></div>' +
      '<div class="qs">' + q + '</div>' +
      '<div class="sec">' + ico("fa-hands-praying") + '<span class="sl">Closing Prayer</span><span class="lead"></span></div>' +
      '<div class="card"><p>' + esc(l.closingPrayer) + '</p></div>' +
      '<div class="foot"><span class="fm"><span class="fl">&#10010;</span> Foundry</span>' +
        '<span>' + esc(C.meta.title) + ' &middot; Lesson ' + (l.n < 10 ? "0" + l.n : l.n) + ' of ' + C.lessons.length + '</span></div></div>';
  }

  var pages = [], pageToLesson = [];
  pages.push({ cls: "cover", html: coverPage() }); pageToLesson.push(0);
  pages.push({ cls: "", html: letterPage() }); pageToLesson.push(0);
  pages.push({ cls: "", html: contentsPage() }); pageToLesson.push(0);
  C.lessons.forEach(function (l) {
    pages.push({ cls: "", html: lessonPageA(l) }); pageToLesson.push(l.n);
    pages.push({ cls: "", html: lessonPageB(l) }); pageToLesson.push(l.n);
  });
  pages.push({ cls: "back", html: backPage() }); pageToLesson.push(0);
  if (pages.length % 2 !== 0) { pages.push({ cls: "", html: '<div class="page-inner"></div>' }); pageToLesson.push(0); }

  var flipEl = document.getElementById("pageflip");
  pages.forEach(function (p) { var d = document.createElement("div"); d.className = "page " + p.cls; d.innerHTML = p.html; flipEl.appendChild(d); });

  var PageFlip = (window.St && window.St.PageFlip) || window.PageFlip;
  var flip = new PageFlip(flipEl, { width: 816, height: 1056, size: "fixed", showCover: true, usePortrait: false,
    maxShadowOpacity: 0.5, drawShadow: true, flippingTime: 700, mobileScrollSupport: false });
  flip.loadFromHTML(document.querySelectorAll("#pageflip .page"));

  var stage = document.getElementById("stage"), scaler = document.getElementById("book-scaler");
  function fit() { var aw = stage.clientWidth - 40, ah = stage.clientHeight - 40; scaler.style.setProperty("--book-scale", Math.min(aw / (816 * 2), ah / 1056)); }
  window.addEventListener("resize", fit); fit();

  var prev = document.getElementById("navPrev"), next = document.getElementById("navNext"), ind = document.getElementById("pageind");
  prev.addEventListener("click", function () { flip.flipPrev(); });
  next.addEventListener("click", function () { flip.flipNext(); });
  document.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") flip.flipPrev(); if (e.key === "ArrowRight") flip.flipNext(); });
  function updateInd() { var i = flip.getCurrentPageIndex(), t = pages.length; prev.disabled = i <= 0; next.disabled = i >= t - 1; ind.textContent = "Page " + (i + 1) + " of " + t; }
  flip.on("flip", updateInd); flip.on("init", updateInd); updateInd();

  // Scripture popout modal (appended to body so it escapes the flip transform)
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
    var t = e.target.closest("[data-goto]");
    if (t) { var idx = pageToLesson.indexOf(parseInt(t.getAttribute("data-goto"), 10)); if (idx > -1) flip.flip(idx); }
  });
})();
