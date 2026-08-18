#!/usr/bin/env python3
"""Regenerate the fonts/ directory the packet PDFs need — from scratch, no scratchpad.

The PDF build (tools/packet_pdf.py) needs six TTFs that are NOT stored in this repo:
Thierry, Hello-Handmade, and four Mulish weights. They used to live only in a session
scratchpad, which meant a fresh session could not re-cut a PDF. Run this instead:

    pip install fonttools brotli cu2qu
    python tools/prep_fonts.py --out fonts

Sources: Thierry + Hello-Handmade come from this repo's own engine/assets/fonts/*.woff2
(decompressed; Hello-Handmade is CFF so its outlines are converted to quadratic/glyf via
cu2qu because reportlab only reads TrueType outlines). Mulish is fetched from
google/fonts and pinned to real static instances.

⚠ THE TRAP THIS SCRIPT EXISTS TO PREVENT: the Mulish files must be REAL instances. If they
still carry an `fvar` table, reportlab silently renders EVERY weight as ExtraLight — that
shipped undetected for months. This script asserts no fvar and that the `I` stem width
actually differs per weight before it will finish.
"""
import argparse, io, os, sys, urllib.request
from fontTools.ttLib import TTFont
from fontTools.ttLib.woff2 import decompress
from fontTools.varLib import instancer
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.boundsPen import BoundsPen

REPO_FONTS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                          "engine", "assets", "fonts")
MULISH = {
    "roman":  "https://github.com/google/fonts/raw/main/ofl/mulish/Mulish%5Bwght%5D.ttf",
    "italic": "https://github.com/google/fonts/raw/main/ofl/mulish/Mulish-Italic%5Bwght%5D.ttf",
}
MAX_ERR = 1.0   # cu2qu conversion tolerance, in em units/1000


def woff2_to_ttf(src, dst):
    with open(src, "rb") as f:
        buf = io.BytesIO()
        decompress(f, buf)
    buf.seek(0)
    with open(dst, "wb") as f:
        f.write(buf.read())
    return TTFont(dst)


def cff_to_glyf(path):
    """reportlab can't read CFF outlines; redraw them as quadratic glyf."""
    f = TTFont(path)
    if "glyf" in f:
        f.close(); return False
    glyphSet = f.getGlyphSet()
    upm = f["head"].unitsPerEm
    pen_glyphs = {}
    for name in f.getGlyphOrder():
        tpen = TTGlyphPen(pen_glyphs)
        glyphSet[name].draw(Cu2QuPen(tpen, MAX_ERR * upm / 1000.0))
        pen_glyphs[name] = tpen.glyph()
    from fontTools.ttLib.tables._g_l_y_f import table__g_l_y_f
    glyf = table__g_l_y_f()
    glyf.glyphs = pen_glyphs
    glyf.glyphOrder = f.getGlyphOrder()
    f["glyf"] = glyf
    # pen-built glyphs carry no bbox yet; maxp.recalc reads g.xMin, so compute them first
    for _g in pen_glyphs.values():
        _g.recalcBounds(glyf)
    from fontTools.ttLib.tables._l_o_c_a import table__l_o_c_a
    f["loca"] = table__l_o_c_a()
    f["maxp"].numGlyphs = len(pen_glyphs)
    for tag in ("CFF ", "CFF2", "VORG"):
        if tag in f:
            del f[tag]
    f["head"].indexToLocFormat = 0
    # maxp must move from the CFF version (0.5) to the TrueType version (1.0) and gain the
    # glyf-derived counts, or reportlab bails with "Unknown maxp table version 0.5000".
    f["maxp"].tableVersion = 0x00010000
    for fld, val in [("maxZones", 1), ("maxTwilightPoints", 0), ("maxStorage", 0),
                     ("maxFunctionDefs", 0), ("maxInstructionDefs", 0),
                     ("maxStackElements", 0), ("maxSizeOfInstructions", 0)]:
        setattr(f["maxp"], fld, val)
    f["maxp"].recalc(f)
    # CRITICAL: the sfnt header still says 'OTTO' (CFF). reportlab reads THAT, not the
    # presence of a glyf table, and refuses the file with "postscript outlines are not
    # supported". Flip it to the TrueType tag.
    f.sfntVersion = chr(0) + chr(1) + chr(0) + chr(0)   # TrueType sfnt tag
    f.save(path)
    f.close()
    return True


def stem_width(path, ch="I"):
    f = TTFont(path, lazy=True)
    gs = f.getGlyphSet(); cmap = f.getBestCmap()
    bp = BoundsPen(gs); gs[cmap[ord(ch)]].draw(bp)
    f.close()
    return round(bp.bounds[2] - bp.bounds[0])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="fonts")
    ap.add_argument("--repo-fonts", default=REPO_FONTS)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)

    # ---- 1. Thierry + Hello-Handmade, straight from this repo -------------
    for woff2, ttf in [("thierry.woff2", "Thierry.ttf"),
                       ("hello-handmade.woff2", "HelloHandmade.ttf")]:
        src = os.path.join(a.repo_fonts, woff2)
        if not os.path.exists(src):
            sys.exit(f"missing {src} — run from a full checkout, or pass --repo-fonts")
        dst = os.path.join(a.out, ttf)
        woff2_to_ttf(src, dst)
        conv = cff_to_glyf(dst)
        print(f"  {ttf:26s} from {woff2}{'  (CFF -> glyf via cu2qu)' if conv else ''}")

    # ---- 2. Mulish: fetch the variable fonts, then PIN real instances -----
    for kind, url in MULISH.items():
        var = os.path.join(a.out, f"Mulish-{'Italic-' if kind == 'italic' else ''}var.ttf")
        if not os.path.exists(var):
            print(f"  fetching Mulish {kind} variable ...")
            urllib.request.urlretrieve(url, var)
    jobs = [("Mulish-var.ttf", 500, "Mulish-normal-500.ttf"),
            ("Mulish-var.ttf", 700, "Mulish-normal-700.ttf"),
            ("Mulish-var.ttf", 800, "Mulish-normal-800.ttf"),
            ("Mulish-Italic-var.ttf", 500, "Mulish-italic-500.ttf")]
    for src, wght, out in jobs:
        f = TTFont(os.path.join(a.out, src))
        inst = instancer.instantiateVariableFont(f, {"wght": wght}, inplace=False,
                                                 updateFontNames=True)
        inst["OS/2"].usWeightClass = wght
        inst.save(os.path.join(a.out, out))
        print(f"  {out:26s} pinned wght={wght}")

    # ---- 3. VERIFY, or this whole exercise is pointless -------------------
    print("\nverifying:")
    ok = True
    for out in [j[2] for j in jobs]:
        p = os.path.join(a.out, out)
        f = TTFont(p, lazy=True)
        has_fvar = "fvar" in f
        wc = f["OS/2"].usWeightClass
        f.close()
        good = (not has_fvar)
        ok &= good
        print(f"  {out:26s} fvar={has_fvar!s:5s} usWeightClass={wc:4d} I-stem={stem_width(p):4d} "
              f"{'OK' if good else '*** STILL VARIABLE'}")
    stems = [stem_width(os.path.join(a.out, f"Mulish-normal-{w}.ttf")) for w in (500, 700, 800)]
    if len(set(stems)) != 3:
        print(f"  *** stem widths not distinct: {stems} — instancing did not take"); ok = False
    else:
        print(f"  stem widths distinct across weights: {stems}  OK")
    # The only verification that matters: can reportlab actually LOAD each font?
    # (Checking for a glyf table is not enough — the sfnt header can still say OTTO.)
    try:
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.ttfonts import TTFont as RLFont
        for i, t in enumerate(["Thierry.ttf", "HelloHandmade.ttf"] + [j[2] for j in jobs]):
            try:
                pdfmetrics.registerFont(RLFont(f"_chk{i}", os.path.join(a.out, t)))
                print(f"  {t:26s} reportlab loads OK")
            except Exception as e:
                print(f"  {t:26s} *** reportlab REFUSED: {e}"); ok = False
    except ImportError:
        print("  (reportlab not installed - skipping the load check; install it before building)")
    print("\nfonts/ READY" if ok else "\nPROBLEMS — do not build with these")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
