"""LangGap offline tests (no network)."""
import csv
import json
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from services.langgap.scanner.analysis import hreflangs_of, looks_english, score, section_weight
from services.langgap.scanner.discovery import walk_sitemap
from services.langgap.scanner.queue import load_previous, write_target_output

SITEMAP_INDEX = """<?xml version="1.0" encoding="utf-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<sitemap><loc>https://example.com/blog/sitemap.xml</loc></sitemap>
</sitemapindex>"""

SITEMAP_LEAF = """<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>https://example.com/blog/a</loc><lastmod>2026-03-01</lastmod></url>
<url><loc>https://example.com/blog/b</loc></url>
</urlset>"""


class SitemapFetchTest(unittest.TestCase):
    def test_walk_sitemap_recursive(self):
        calls = {}
        def fake_fetch(url, **_):
            calls[url] = True
            if "sitemapindex" in url:
                return SITEMAP_INDEX
            return SITEMAP_LEAF
        with patch("services.langgap.scanner.discovery.fetch", side_effect=fake_fetch):
            urls = list(walk_sitemap("https://example.com/sitemapindex.xml"))
        self.assertEqual(len(urls), 2)
        self.assertEqual(urls[0][0], "https://example.com/blog/a")
        self.assertEqual(urls[0][1], "2026-03-01")
        self.assertEqual(urls[1][0], "https://example.com/blog/b")


class AnalysisTest(unittest.TestCase):
    def test_score_orders_blog_above_contact(self):
        self.assertGreater(score("https://x.com/blog/a"), score("https://x.com/contact"))

    def test_looks_english_without_codes(self):
        self.assertTrue(looks_english("https://x.com/blog/a", None))
        self.assertFalse(looks_english("https://x.com/de/abc", None))

    def test_missing_de_es(self):
        codes = {"en", "en-us", "x-default"}
        self.assertEqual(sorted(codes), ["en", "en-us", "x-default"])


class DiffModeTest(unittest.TestCase):
    def test_write_output_and_diff(self):
        import tempfile
        with tempfile.TemporaryDirectory() as tmp:
            outdir = Path(tmp)
            rows = [
                {"score": 100, "url": "https://x.com/a", "lastmod": "", "section_weight": 50,
                 "declared_hreflangs": "(none)", "missing": "de|es"},
                {"score": 90, "url": "https://x.com/b", "lastmod": "", "section_weight": 40,
                 "declared_hreflangs": "(none)", "missing": "de|es"},
            ]
            manifest = write_target_output(rows, {"domain": "x.com", "role": "own"}, outdir, diff=True)
            csv_path = outdir / "x_com_queue.csv"
            self.assertTrue(csv_path.exists())
            with csv_path.open(encoding="utf-8") as f:
                read_rows = list(csv.DictReader(f))
            self.assertEqual(len(read_rows), 2)
            self.assertIn("url", read_rows[0])
            # diff against state file
            prev = load_previous(outdir / "state", "x.com")
            self.assertEqual(prev, {"https://x.com/a", "https://x.com/b"})


if __name__ == "__main__":
    unittest.main(verbosity=2)
