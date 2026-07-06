/* Beyond Bumper Stickers — flipbook renderer.
 * Builds pages from window.BBS_CONTENT and drives StPageFlip.
 * Page model: cover, contents, how-to, then 2 pages per lesson
 * (A: header/prayer/cards on the left, B: questions + closing prayer on
 * the right), then a back cover. The how-to page aligns each lesson so its
 * two pages sit together as one open spread. */
(function () {
  "use strict";
  var C = window.BBS_CONTENT;
  if (!C) { console.error("BBS_CONTENT missing"); return; }

  var esc = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };
  var LOGO = "assets/candler-foundry-logo.png";

  function coverPage() {
    var dots = C.lessons.map(function (l) {
      return '<div class="dot" data-goto="' + l.n + '" style="background:' + l.accent +
        ';box-shadow:0 4px 12px ' + l.accent + '55">' + l.n + "</div>";
    }).join("");
    return '<div class="page-inner cover">' +
      '<div class="blob"></div>' +
      '<div class="top"><img src="' + LOGO + '" alt="The Candler Foundry">' +
        '<div class="pill">' + esc(C.meta.subtitle) + "</div></div>" +
      '<div class="series"><span></span><b>' + esc(C.meta.series) + "</b></div>" +
      '<div class="title"><h1>Beyond<br>Bumper<br><em>Stickers</em></h1>' +
        "<p>" + esc(C.meta.tagline) + "</p></div>" +
      '<div class="lessons"><div class="lbl"><em>The Six Lessons</em>' +
        "<small>&mdash; tap a number to jump to it</small></div>" +
        '<div class="dots">' + dots + "</div></div>" +
      '<div class="foot"><div class="l">' + esc(C.meta.footerNote) + "</div>" +
        '<div class="r">' + esc(C.meta.site) + "</div></div>" +
      "</div>";
  }

  function contentsPage() {
    var rows = C.lessons.map(function (l) {
      return '<a class="row" data-goto="' + l.n + '" style="color:' + l.accent + '">' +
        '<div class="num" style="background:' + l.accent + '">' + l.n + "</div>" +
        '<div class="mid"><div class="t">' + esc(l.title) + "</div>" +
          '<div class="s">' + esc(l.subtitle) + "</div></div>" +
        '<div class="ref">' + esc(l.shortRef || l.reference.split(":")[0]) + "</div></a>";
    }).join("");
    return '<div class="page-inner contents">' +
      '<div class="series"><span></span><b>' + esc(C.meta.series) + "</b></div>" +
      "<h2>In This Packet</h2>" +
      '<div class="lede">' + esc(C.contentsIntro) + "</div>" +
      '<div class="list">' + rows + "</div>" +
      "</div>";
  }

  function howToPage() {
    var steps = [
      ["Open with prayer", "Begin together with the opening prayer on the lesson's first page."],
      ["Read the passage aloud", "Scan the Scripture QR code or read the printed reference together."],
      ["Watch the 3-Minute Bible", "A short video sets the passage back in its original context."],
      ["Talk through the questions", "Five discussion questions move from the text to your own life."],
      ["Close with prayer", "End with the closing prayer that gathers up the lesson."]
    ].map(function (s, i) {
      return '<div class="qrow"><span class="n" style="background:#E0612F22;color:#E0612F">' +
        (i + 1) + '</span><span class="q"><strong style="color:#1E364C">' + s[0] +
        ".</strong> " + s[1] + "</span></div>";
    }).join("");
    return '<div class="page-inner contents">' +
      '<div class="series"><span></span><b>How These Lessons Work</b></div>' +
      "<h2>An Hour Together</h2>" +
      '<div class="lede">Each lesson stands on its own and takes about an hour. Here is the simple rhythm.</div>' +
      '<div class="qlist" style="margin-top:30px;gap:18px">' + steps + "</div>" +
      '<div class="howto"><p>' + esc(C.howto) + "</p></div>" +
      "</div>";
  }

  function lessonHead(l) {
    return '<div class="head"><div class="badge" style="background:' + l.accent + '">' +
      (l.n < 10 ? "0" + l.n : l.n) + "</div>" +
      '<div class="meta"><div class="tags">' +
        '<span class="ref" style="color:' + l.accent + '">' + esc(l.reference) + "</span>" +
        '<span class="chip">Discussion Guide</span></div>' +
      "<h2>" + esc(l.title) + "</h2>" +
      '<div class="sub">' + esc(l.subtitle) + "</div></div></div>";
  }

  function pageFoot(l) {
    return '<div class="pagefoot"><img src="' + LOGO + '" alt="The Candler Foundry">' +
      "<span>Beyond Bumper Stickers &middot; Lesson " + l.n + " of " + C.lessons.length + "</span></div>";
  }

  function lessonPageA(l) {
    return '<div class="page-inner lesson">' +
      lessonHead(l) +
      '<div class="prayer opening"><div class="bar" style="background:' + l.accent + '"></div>' +
        '<div><div class="lbl">Opening Prayer</div><p>' + esc(l.openingPrayer) + "</p></div></div>" +
      '<div class="cards">' +
        '<div class="card"><img src="assets/qr-scripture.png" alt="QR code">' +
          '<div><div class="k" style="color:' + l.accent + '">Scripture Reading</div>' +
          '<div class="v">' + esc(l.scriptureRef) + "</div>" +
          '<div class="s">Scan or visit the link &middot; read aloud</div></div></div>' +
        '<div class="card"><img src="assets/qr-video.png" alt="QR code">' +
          '<div><div class="k" style="color:' + l.accent + '">Watch the Video</div>' +
          '<div class="v">' + esc(l.videoTitle || "3-Minute Bible") + "</div>" +
          '<div class="s">' + esc(l.videoSubtitle) + "</div></div></div>" +
      "</div>" +
      pageFoot(l) +
      "</div>";
  }

  function lessonPageB(l) {
    var q = l.questions.map(function (text, i) {
      return '<div class="qrow"><span class="n" style="background:' + l.accent +
        '22;color:' + l.accent + '">' + (i + 1) + "</span>" +
        '<span class="q">' + esc(text) + "</span></div>";
    }).join("");
    return '<div class="page-inner lesson">' +
      '<div class="qhead">Discussion Questions</div>' +
      '<div class="qlist">' + q + "</div>" +
      '<div class="prayer closing" style="margin-top:26px"><div class="bar" style="background:' + l.accent + '"></div>' +
        '<div><div class="lbl" style="color:' + l.accent + '">Closing Prayer</div>' +
        "<p>" + esc(l.closingPrayer) + "</p></div></div>" +
      pageFoot(l) +
      "</div>";
  }

  function backPage() {
    return '<div class="page-inner back"><div class="inner">' +
      '<div class="series"><span></span></div>' +
      "<h2>Read it again,<br>in context.</h2>" +
      "<p>" + esc(C.contentsIntro) + "</p>" +
      '<div class="site">' + esc(C.meta.site) + "</div>" +
      "</div></div>";
  }

  var pages = [];
  var pageToLesson = [];
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
    var d = document.createElement("div");
    d.className = "page " + p.cls;
    d.innerHTML = p.html;
    flipEl.appendChild(d);
  });

  var PageFlip = (window.St && window.St.PageFlip) || window.PageFlip;
  var flip = new PageFlip(flipEl, {
    width: 816, height: 1056, size: "fixed",
    showCover: true, usePortrait: false,
    maxShadowOpacity: 0.5, drawShadow: true,
    flippingTime: 700, mobileScrollSupport: false
  });
  flip.loadFromHTML(document.querySelectorAll("#pageflip .page"));

  var stage = document.getElementById("stage");
  var scaler = document.getElementById("book-scaler");
  function fit() {
    var bookW = 816 * 2, bookH = 1056;
    var availW = stage.clientWidth - 40, availH = stage.clientHeight - 40;
    var scale = Math.min(availW / bookW, availH / bookH);
    scaler.style.setProperty("--book-scale", scale);
  }
  window.addEventListener("resize", fit); fit();

  var prev = document.getElementById("navPrev"), next = document.getElementById("navNext");
  var ind = document.getElementById("pageind");
  prev.addEventListener("click", function () { flip.flipPrev(); });
  next.addEventListener("click", function () { flip.flipNext(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") flip.flipPrev();
    if (e.key === "ArrowRight") flip.flipNext();
  });
  function updateInd() {
    var i = flip.getCurrentPageIndex(), total = pages.length;
    prev.disabled = i <= 0; next.disabled = i >= total - 1;
    ind.textContent = "Page " + (i + 1) + " of " + total;
  }
  flip.on("flip", updateInd);
  flip.on("init", updateInd);
  updateInd();

  flipEl.addEventListener("click", function (e) {
    var t = e.target.closest("[data-goto]");
    if (!t) return;
    var n = parseInt(t.getAttribute("data-goto"), 10);
    var idx = pageToLesson.indexOf(n);
    if (idx > -1) flip.flip(idx);
  });
})();
