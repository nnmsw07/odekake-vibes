from pathlib import Path
import re

p = Path('index.html')
if not p.exists():
    raise SystemExit('index.html not found')
html = p.read_text(encoding='utf-8')

# terrace-after-sunset は記事専用Heroを固定表示する。
# Google Places のホテル写真へ差し替えず、hero-clean の非表示対象にも入れない。
pattern = re.compile(
    r'(<a class="magazine-preview-card warm" href="magazine/terrace-after-sunset/">)'
    r'<div class="magazine-preview-media image-shell"[^>]*>'
    r'<img[^>]*alt="まだ帰りたくない日の、外ごはん。東京・横浜のテラス6選"[^>]*>'
)
replacement = (
    r'\1<div class="magazine-preview-media image-shell">'
    r'<img src="assets/editorial/terrace-after-sunset.webp" '
    r'alt="まだ帰りたくない日の、外ごはん。東京・横浜のテラス6選" '
    r'loading="eager" referrerpolicy="no-referrer">'
)
new_html, count = pattern.subn(replacement, html, count=1)
if count != 1:
    # Be tolerant of attribute order from v20.12.6.
    start = html.find('href="magazine/terrace-after-sunset/"')
    if start < 0:
        raise SystemExit('terrace-after-sunset card not found')
    end = html.find('</a>', start)
    chunk = html[start:end]
    chunk2 = re.sub(r'<div class="magazine-preview-media image-shell"[^>]*>', '<div class="magazine-preview-media image-shell">', chunk, count=1)
    chunk2 = re.sub(
        r'<img[^>]*>',
        '<img src="assets/editorial/terrace-after-sunset.webp" alt="まだ帰りたくない日の、外ごはん。東京・横浜のテラス6選" loading="eager" referrerpolicy="no-referrer">',
        chunk2,
        count=1,
    )
    new_html = html[:start] + chunk2 + html[end:]

p.write_text(new_html, encoding='utf-8')
print('v20.12.6.1: terrace preview fixed to static editorial hero')
