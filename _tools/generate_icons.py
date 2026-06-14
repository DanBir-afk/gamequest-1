"""Generate img/quests/<id>.svg icons from games-catalog + profileOnly."""
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / 'js' / 'games-catalog.js'
MANIFEST = ROOT / 'js' / 'games-manifest.js'
OUT = ROOT / 'img' / 'quests'
OUT.mkdir(parents=True, exist_ok=True)


def parse_catalog(path: Path) -> list[tuple[str, str]]:
    text = path.read_text(encoding='utf-8')
    if 'window.gamesCatalog' in text:
        text = text.split('window.gamesCatalog', 1)[1]
    text = text.split('];', 1)[0]
    games = []
    for m in re.finditer(r"id:\s*'([^']+)'[\s\S]*?emoji:\s*'([^']+)'", text):
        games.append((m.group(1), m.group(2)))
    return games


def parse_profile_only(path: Path) -> list[tuple[str, str]]:
    text = path.read_text(encoding='utf-8')
    section = text.split('profileOnly:')[1].split('],')[0]
    games = []
    for block in re.split(r'\{', section)[1:]:
        id_m = re.search(r"id:\s*'([^']+)'", block)
        emoji_m = re.search(r"emoji:\s*'([^']+)'", block)
        if id_m and emoji_m:
            games.append((id_m.group(1), emoji_m.group(1)))
    return games


def colors(game_id: str) -> tuple[str, str]:
    digest = hashlib.md5(game_id.encode()).hexdigest()
    h = int(digest[:3], 16) % 360
    h2 = (h + 38) % 360
    return f'hsl({h}, 58%, 22%)', f'hsl({h2}, 72%, 42%)'


def svg_for(game_id: str, emoji: str) -> str:
    c1, c2 = colors(game_id)
    safe_emoji = emoji.replace('&', '&amp;').replace('<', '&lt;')
    label = game_id.replace('-', ' ')[:18]
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225" role="img">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{c1}"/>
      <stop offset="100%" stop-color="{c2}"/>
    </linearGradient>
    <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(255,255,255,0)"/>
      <stop offset="50%" stop-color="rgba(255,255,255,0.12)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
  </defs>
  <rect width="400" height="225" rx="12" fill="url(#bg)"/>
  <rect width="400" height="225" rx="12" fill="url(#shine)"/>
  <circle cx="340" cy="40" r="80" fill="rgba(255,255,255,0.06)"/>
  <circle cx="60" cy="190" r="60" fill="rgba(0,0,0,0.15)"/>
  <text x="200" y="128" text-anchor="middle" font-size="72"
        font-family="Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif">{safe_emoji}</text>
  <text x="200" y="200" text-anchor="middle" font-size="13" fill="rgba(255,255,255,0.55)"
        font-family="Segoe UI, system-ui, sans-serif" letter-spacing="0.08em">{label.upper()}</text>
</svg>
'''


def main():
    seen = set()
    all_games = parse_catalog(CATALOG) + parse_profile_only(MANIFEST)
    written = 0
    for game_id, emoji in all_games:
        if game_id in seen:
            continue
        seen.add(game_id)
        out = OUT / f'{game_id}.svg'
        out.write_text(svg_for(game_id, emoji), encoding='utf-8')
        written += 1
        print('Wrote', game_id)
    print(f'Done: {written} icons in {OUT}')


if __name__ == '__main__':
    main()
