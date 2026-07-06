/* Beyond Bumper Stickers — flipbook renderer (retro edition).
 * cover (photo), contents, how-to, 2 pages per lesson, back cover.
 * Lesson spread follows a clear guide: 1 Opening Prayer · 2 Read the Scripture
 * (Bible Gateway NRSV) · 3 Watch the 3-Minute Bible · 4 Discussion Questions ·
 * 5 Closing Prayer. */
(function () {
  "use strict";
  var C = window.BBS_CONTENT;
  if (!C) { console.error("BBS_CONTENT missing"); return; }
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };
  var TV = "../../engine/assets/tv.png";

  function coverPage() {
    return '<div class="page-inner cover"><img class="cover-photo" src="assets/cover.jpg" alt="' +
      esc(C.meta.title) + '"></div>';
  }

  function contentsPage() {
    var rows = C.lessons.map(function (l) {
      return '<a class="crow" data-goto="' + l.n + '" style="--accent:' + l.accent + '">' +
        '<span class="rm">' + l.n + "</span>" +
        '<div class="cmid"><div class="ct">' + esc(l.title) + "</div>" +
          '<div class="cs">' + esc(l.subtitle) + "</div></div>" +
        '<span class="cplate">' + esc(l.shortRef || l.reference.split(":")[0]) + "</span></a>";
    }).join("");
    return '<div class="page-inner contents">' +
      '<div class="series"><span></span><b>' + esc(C.meta.series) + "</b></div>" +
      '<h2 class="disp">In This Packet</h2>' +
      '<div class="lede">' + esc(C.contentsIntro) + "</div>" +
      '<div class="clist">' + rows + "</div></div>";
  }

  function howToPage() {
    var steps = [
      ["Open with prayer", "Begin together with the opening prayer on the lesson's first page."],
      ["Read the Scripture", "Open the passage — each lesson links the NRSV text on Bible Gateway."],
      ["Watch the 3-Minute Bible", "Play the short video inside the set; it puts the passage back in its original context."],
      ["Talk through the questions", "The discussion questions move from the text to your own life."],
      ["Close with prayer", "End with the closing prayer that gathers up the lesson."]
    ].map(function (s, i) {
      return '<div class="q"><span class="rm">' + (i + 1) + "</span><p><b>" + s[0] + ".</b> " + s[1] + "</p></div>";
    }).join("");
    return '<div class="page-inner contents" style="--accent:var(--rust)">' +
      '<div class="series"><span></span><b>How These Lessons Work</b></div>' +
      '<h2 class="disp">An Hour Together</h2>' +
      '<div class="lede">Each lesson stands on its own and takes about an hour. Here is the simple rhythm.</div>' +
      '<div class="qlist steps">' + steps + "</div>" +
      '<div class="howto-note"><p>' + esc(C.howto) + "</p></div></div>";
  }

  function tvScreen(l) {
    if (l.videoUrl) {
      return '<div class="screen"><iframe src="' + esc(l.videoUrl) +
        '" title="3-Minute Bible" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
    }
    return '<div class="screen">' +
      '<div class="lab">CH 3 &middot; 3-Minute Bible</div><div class="live">Play</div>' +
      '<div class="play"></div><div class="ttl">' + esc(l.videoSubtitle) + "</div></div>";
  }

  function stepHead(n, label) {
    return '<div class="step"><span class="sn">' + n + '</span><span class="sl">' + label + "</span></div>";
  }

  function lessonPageA(l) {
    var readLink = l.scriptureUrl
      ? '<a class="gw" href="' + esc(l.scriptureUrl) + '" target="_blank" rel="noopener">Read on Bible Gateway (NRSV) &rarr;</a>'
      : "";
    var opt = l.optionalVideo
      ? '<div class="optvid"><a href="' + esc(l.optionalVideo.url || "#") + '"' +
          (l.optionalVideo.url ? ' target="_blank" rel="noopener"' : "") +
          '>&#9654; Optional &middot; ' + esc(l.optionalVideo.title) + "</a></div>"
      : "";
    return '<div class="page-inner lesson" style="--accent:' + l.accent + '">' +
      '<div class="hdr"><div class="shield"><small>Lesson</small><b>' + (l.n < 10 ? "0" + l.n : l.n) + "</b></div>" +
        '<div class="plate"><span>REF</span> ' + esc(l.reference) + "</div></div>" +
      '<div class="titlewrap"><h1 class="lesson-title">' + esc(l.title) + "</h1>" +
        '<div class="sub">' + esc(l.subtitle) + "</div></div>" +
      stepHead(1, "Opening Prayer") +
        '<div class="prayer"><div class="bar"></div><div><p>' + esc(l.openingPrayer) + "</p></div></div>" +
      stepHead(2, "Read the Scripture") +
        '<div class="read"><div class="ref">' + esc(l.scriptureRef) + "</div>" + readLink + "</div>" +
      stepHead(3, "Watch the 3-Minute Bible") +
        '<div class="tvwrap"><div class="tv"><img src="' + TV + '" alt="Vintage TV">' + tvScreen(l) + "</div>" + opt + "</div>" +
      "</div>";
  }

  function lessonPageB(l) {
    var q = l.questions.map(function (t, i) {
      return '<div class="q"><span class="rm">' + (i + 1) + '</span><p>' + esc(t) + "</p></div>";
    }).join("");
    return '<div class="page-inner lesson" style="--accent:' + l.accent + '">' +
      stepHead(4, "Discussion Questions") +
      '<div class="qlist">' + q + "</div>" +
      '<div class="step step-close"><span class="sn">5</span><span class="sl">Closing Prayer</span></div>' +
      '<div class="prayer"><div class="bar"></div><div><p>' + esc(l.closingPrayer) + "</p></div></div>" +
      '<div class="foot"><span>Beyond Bumper Stickers</span><span>Lesson ' + l.n + " of " + C.lessons.length + "</span></div></div>";
  }

  function backPage() {
    return '<div class="page-inner back"><div class="inner">' +
      '<div class="series"><span></span></div>' +
      "<h2>Read it again,<br>in context.</h2>" +
      "<p>" + esc(C.contentsIntro) + "</p>" +
      '<div class="site">' + esc(C.meta.site) + "</div></div></div>";
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
  flipEl.addEventListener("click", function (e) {
    var t = e.target.closest("[data-goto]"); if (!t) return;
    var idx = pageToLesson.indexOf(parseInt(t.getAttribute("data-goto"), 10));
    if (idx > -1) flip.flip(idx);
  });
})();
