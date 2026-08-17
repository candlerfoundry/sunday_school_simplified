#!/usr/bin/env python3
"""Beyond Bumper Stickers — printable packet. Layout lives in packet_pdf.py (shared
with the Women packet so the two can't drift); this file only picks the palette.
Needs content.json + cover.png + fonts/ beside it. Read packet_pdf.py's header first —
especially the Mulish instancing warning."""
import os
from packet_pdf import build
build(os.path.dirname(os.path.abspath(__file__)), 'bbs')
