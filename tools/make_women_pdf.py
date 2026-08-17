#!/usr/bin/env python3
"""The Gospel According to the Women — printable packet. Layout lives in packet_pdf.py
(shared with Beyond Bumper Stickers so the two can't drift); this file only picks the
palette. Needs content.json + cover.png + fonts/ beside it. Read packet_pdf.py's header
first — especially the Mulish instancing warning. Supersedes make_women_pdf.js."""
import os
from packet_pdf import build
build(os.path.dirname(os.path.abspath(__file__)), 'women')
