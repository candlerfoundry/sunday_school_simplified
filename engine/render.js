/* Beyond Bumper Stickers — flipbook renderer (blue edition).
 * cover (packet cover image), contents, how-to, 2 pages per lesson, back (feature photo).
 * Lesson: header (Thierry numeral) · Opening Prayer · Read the Scripture (NRSV dropdown) ·
 * Watch the 3-Minute Bible · Discussion Questions · Closing Prayer · Optional viewing (end). */
(function () {
  "use strict";
  var C = window.BBS_CONTENT;
  if (!C) { console.error("BBS_CONTENT missing"); return; }
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };
  var ico = function (fa) { return '<span class="ic"><i class="fa-solid ' + fa + '"></i></span>'; };
  var SPARK = '<svg class="spark" viewBox="0 0 34 34"><g stroke="#0A274C" stroke-width="3" stroke-linecap="round"><path d="M17 2 L17 11"/><path d="M31 8 L24 14"/><path d="M3 8 L10 14"/></g></svg>';
  var HILLS = '<svg class="vhills" viewBox="0 0 700 150" preserveAspectRatio="none"><path d="M0 90 Q160 40 340 78 T700 66 L700 150 L0 150 Z" fill="#B7D3EE"/><path d="M0 118 Q210 70 430 104 T700 100 L700 150 L0 150 Z" fill="#A6C7E8"/></svg>' +
    '<svg class="vtree" style="left:70px;bottom:70px" width="26" height="40" viewBox="0 0 26 40"><path d="M13 2 L23 26 L3 26 Z" fill="#7FA9D4"/><path d="M13 14 L21 33 L5 33 Z" fill="#7FA9D4"/><rect x="11" y="32" width="4" height="7" fill="#5C86B5"/></svg>' +
    '<svg class="vtree" style="right:80px;bottom:64px" width="22" height="34" viewBox="0 0 26 40"><path d="M13 2 L23 26 L3 26 Z" fill="#89B0D8"/><path d="M13 14 L21 33 L5 33 Z" fill="#89B0D8"/><rect x="11" y="32" width="4" height="7" fill="#5C86B5"/></svg>';
  var LOGOMARK = '<span class="fl">&#10010;</span>';

  function coverPage() {
    return '<div class="page-inner cover"><img class="full" src="assets/cover.png" alt="' + esc(C.meta.title) + '"></div>';
  }
  function backPage() {
    return '<div class="page-inner back"><img class="full" src="assets/back.jpg" alt="Beyond Bumper Stickers"></div>';
  }

  function contentsPage() {
    var rows = C.lessons.map(function (l) {
      return '<a class="crow" data-goto="' + l.n + '"><span class="cn">' + l.n + '</span>' +
        '<div class="cmid"><div class="ct">' + esc(l.title) + '</div>' +
        '<div class="cs">' + esc(l.subtitle) + '</div></div>' +
        '<span class="cref">' + esc(l.shortRef || l.reference.split(":")[0]) + '</span></a>';
    }).join("");
    return '<div class="page-inner contents">' +
      '<div class="series"><span></span><b>' + esc(C.meta.series) + '</b></div>' +
      '<div class="chead">In This Packet</div>' +
      '<div class="lede">' + esc(C.contentsIntro) + '</div>' +
      '<div class="clist">' + rows + '</div></div>';
  }

  function howToPage() {
    var steps = [
      ["fa-hands-praying", "Open with prayer", "Begin together with the opening prayer on the lesson's first page."],
      ["fa-book-open", "Read the Scripture", "Open the passage right in the page — each lesson carries the full NRSV text."],
      ["fa-play", "Watch the 3-Minute Bible", "Play the short video; it puts the passage back in its original context."],
      ["fa-comment-dots", "Talk through the questions", "The discussion questions move from the text to your own life."],
      ["fa-hands-praying", "Close with prayer", "End with the closing prayer that gathers up the lesson."]
    ].map(function (s) {
      return '<div class="howstep">' + ico(s[0]) + '<div><div class="ht">' + s[1] + '</div><div class="hd">' + s[2] + '</div></div></div>';
    }).join("");
    return '<div class="page-inner contents">' +
      '<div class="series"><span></span><b>How These Lessons Work</b></div>' +
      '<div class="chead">An Hour Together</div>' +
      '<div class="lede">Each lesson stands on its own and takes about an hour. Here is the simple rhythm.</div>' +
      '<div class="howsteps">' + steps + '</div>' +
      '<div class="hownote"><p>' + esc(C.howto) + '</p></div></div>';
  }

  function scriptureDrop(l) {
    var body = l.scriptureText
      ? l.scriptureText
      : '<span class="note">The full NRSV passage of ' + esc(l.scriptureRef) + ' displays here, scrollable. (Text to be supplied.)</span>';
    return '<div class="drop"><div class="drophd"><span class="ref">' + esc(l.scriptureRef) + '</span>' +
      '<span class="rt"><span class="badge">NRSV</span><span class="chev"><i class="fa-solid fa-chevron-down"></i></span></span></div>' +
      '<div class="dropbody"><p>' + body + '</p></div></div>';
  }

  function videoCard(l) {
    if (l.videoUrl) {
      return '<div class="vcard"><iframe src="' + esc(l.videoUrl) + '" title="3-Minute Bible" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
    }
    return '<div class="vcard"><span class="vlabel">3-Minute Bible</span>' + HILLS +
      '<div class="vplay"><i class="fa-solid fa-play"></i></div>' +
      '<span class="vtitle">' + esc(l.videoSubtitle) + '</span></div>';
  }

  function lessonPageA(l) {
    return '<div class="page-inner lesson">' +
      '<div class="lhead"><div class="numwrap"><div class="lnum">' + (l.n < 10 ? "0" + l.n : l.n) + '</div>' + SPARK + '</div>' +
        '<div><div class="kicker">' + esc(l.reference) + ' &middot; Discussion Guide</div>' +
        '<div class="ltitle">' + esc(l.title) + '</div>' +
        '<div class="lsub">' + esc(l.subtitle) + '</div></div></div>' +
      '<div class="sec">' + ico("fa-hands-praying") + '<span class="sl">Opening Prayer</span><span class="lead"></span></div>' +
      '<div class="card"><p>' + esc(l.openingPrayer) + '</p></div>' +
      '<div class="sec">' + ico("fa-book-open") + '<span class="sl">Read the Scripture</span><span class="lead"></span></div>' +
      scriptureDrop(l) +
      '<div class="sec">' + ico("fa-play") + '<span class="sl">Watch the 3-Minute Bible</span><span class="lead"></span></div>' +
      videoCard(l) + '</div>';
  }

  function lessonPageB(l) {
    var q = l.questions.map(function (t, i) {
      return '<div class="q"><span class="qn">' + (i + 1) + '</span><p>' + esc(t) + '</p></div>';
    }).join("");
    var opt = l.optionalVideo
      ? '<div class="opt"><span class="oc"><i class="fa-solid fa-play"></i></span>' +
        '<span class="ot">Optional Viewing<small>' + esc(l.optionalVideo.title) + ' &middot; 3-Minute Bible</small></span></div>'
      : "";
    return '<div class="page-inner lesson">' +
      '<div class="sec">' + ico("fa-comment-dots") + '<span class="sl">Discussion Questions</span><span class="lead"></span></div>' +
      '<div class="qs">' + q + '</div>' +
      '<div class="sec">' + ico("fa-hands-praying") + '<span class="sl">Closing Prayer</span><span class="lead"></span></div>' +
      '<div class="card"><p>' + esc(l.closingPrayer) + '</p></div>' + opt +
      '<div class="foot"><span class="fm">' + LOGOMARK + ' Foundry</span>' +
        '<span>' + esc(C.meta.title) + ' &middot; Lesson ' + (l.n < 10 ? "0" + l.n : l.n) + ' of ' + C.lessons.length + '</span></div></div>';
  }

  var pages = [], pageToLesson = [];
  pages.push({ cls: "cover", html: coverPage() }); pageToLesson.push(0);
  pages.push({ cls: "", html: contentsPage() }); pageToLesson.push(0);
  pages.push({ cls: "", html: howToPage() }); pageToLesson.push(0);
  C.lessons.forEach(function (l) {
    pages.push({ cls: "", html: lessonPageA(l) }); pageToLesson.push(l.n);
    pages.push({ cls: "", html: lessonPageB(l) }); pageToLesson.push(l.n);
  });
  pages.push({ cls: "back", html: backPage() }); pageToLesson.push(0);
  if (pages.length % 2 !== 0) { pages.push({ cls: "", html: '<div class="page-inner"></div>' }); pageToLesson.push(0); }

  var flipEl = document.getElementById("pageflip");
  pages.forEach(function (p) {
    var d = document.createElement("div"); d.className = "page " + p.cls; d.innerHTML = p.html; flipEl.appendChild(d);
  });

  var PageFlip = (window.St && window.St.PageFlip) || window.PageFlip;
  var flip = new PageFlip(flipEl, {
    width: 816, height: 1056, size: "fixed", showCover: true, usePortrait: false,
    maxShadowOpacity: 0.5, drawShadow: true, flippingTime: 700, mobileScrollSupport: false
  });
  flip.loadFromHTML(document.querySelectorAll("#pageflip .page"));

  var stage = document.getElementById("stage"), scaler = document.getElementById("book-scaler");
  function fit() {
    var availW = stage.clientWidth - 40, availH = stage.clientHeight - 40;
    scaler.style.setProperty("--book-scale", Math.min(availW / (816 * 2), availH / 1056));
  }
  window.addEventListener("resize", fit); fit();

  var prev = document.getElementById("navPrev"), next = document.getElementById("navNext"), ind = document.getElementById("pageind");
  prev.addEventListener("click", function () { flip.flipPrev(); });
  next.addEventListener("click", function () { flip.flipNext(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") flip.flipPrev(); if (e.key === "ArrowRight") flip.flipNext();
  });
  function updateInd() {
    var i = flip.getCurrentPageIndex(), total = pages.length;
    prev.disabled = i <= 0; next.disabled = i >= total - 1;
    ind.textContent = "Page " + (i + 1) + " of " + total;
  }
  flip.on("flip", updateInd); flip.on("init", updateInd); updateInd();

  // interactions inside pages: jump-to-lesson + scripture dropdown (stop flip)
  flipEl.addEventListener("click", function (e) {
    var toggle = e.target.closest(".drophd");
    if (toggle) { e.stopPropagation(); toggle.parentNode.classList.toggle("open"); return; }
    var t = e.target.closest("[data-goto]");
    if (t) { var idx = pageToLesson.indexOf(parseInt(t.getAttribute("data-goto"), 10)); if (idx > -1) flip.flip(idx); }
  });
})();
