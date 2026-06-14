"""
Download real game cover art into img/quests/<id>.jpg
Sources: Steam CDN + Wikimedia (non-Steam titles).
"""
import re
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / 'js' / 'games-catalog.js'
MANIFEST = ROOT / 'js' / 'games-manifest.js'
OUT = ROOT / 'img' / 'quests'
OUT.mkdir(parents=True, exist_ok=True)

STEAM_CDN = 'https://cdn.cloudflare.steamstatic.com/steam/apps/{appid}/header.jpg'

# Steam App IDs (only games where header.jpg is the correct title)
STEAM = {
    'overwatch2': 2357570,
    'pokemon-scarlet': 2378900,
    'gta5': 271590,
    'cs2': 730,
    'elden-ring': 1245620,
    'baldurs-gate-3': 1086940,
    'hogwarts-legacy': 990080,
    'witcher3': 292030,
    'apex-legends': 1172470,
    'helldivers-2': 553850,
    'palworld': 1623730,
    'dota2': 570,
    'skyrim': 489830,
    'rocket-league': 252950,
    'among-us': 945360,
    'call-of-duty': 1938090,
    'rdr2': 1174180,
    'fallout-4': 377160,
    'dark-souls-3': 374320,
    'sekiro': 814380,
    'god-of-war': 1593500,
    'spider-man': 1817070,
    'resident-evil-4': 2050650,
    'last-of-us': 1888930,
    'horizon-zero-dawn': 1151640,
    'hollow-knight': 367520,
    'hades': 1145360,
    'stardew-valley': 413150,
    'terraria': 105600,
    'portal-2': 620,
    'team-fortress-2': 440,
    'half-life-alyx': 546560,
    'doom-eternal': 782330,
    'diablo-4': 2344520,
    'starfield': 1716740,
    'mass-effect': 1328670,
    'ff7-remake': 1462040,
    'persona-5': 1687950,
    'forza-horizon-5': 1551360,
    'rust': 252490,
    'ac-mirage': 3035570,
    'sea-of-thieves': 1172620,
    'dead-by-daylight': 381210,
    'garrys-mod': 4000,
    'satisfactory': 526870,
    'bloons-td-6': 960990,
}

# Non-Steam / wrong Steam header — use RAWG or official CDN (checked first)
CUSTOM = {
    'minecraft': [
        'https://media.rawg.io/media/resize/1280/-/games/b4e/b4e4c73d5aa4ec66bbf75375c4847a2b.jpg',
    ],
    'league-of-legends': [
        'https://media.rawg.io/media/resize/1280/-/games/78b/78bc81e247fc7e77af700cbd632a9297.jpg',
    ],
    'valorant': [
        'https://media.rawg.io/media/resize/1280/-/games/b11/b11127b9ee3c3701bd15b9af3286d20e.jpg',
    ],
    'genshin-impact': [
        'https://media.rawg.io/media/resize/1280/-/games/c38/c38bdb5da139005777176d33c463d70f.jpg',
    ],
    'cyberpunk': [
        'https://media.rawg.io/media/resize/1280/-/games/26d/26d4437715bee60138dab4a7c8c59c92.jpg',
    ],
    'fortnite': [
        'https://media.rawg.io/media/resize/1280/-/games/d97/d97f663b752a6484df105993f17abb49.jpg',
    ],
    'roblox': [
        'https://media.rawg.io/media/resize/1280/-/games/3af/3af386b6e26be6741b711ae6215ef42f.jpg',
    ],
    'mario-odyssey': [
        'https://media.rawg.io/media/resize/1280/-/games/267/267bd0dbc496f52692487d07d014c061.jpg',
    ],
    'zelda-totk': [
        'https://assets.nintendo.com/image/upload/c_fill,w_1200/q_auto/f_auto/dpr_2.0/ncom/en_US/games/switch/t/the-legend-of-zelda-tears-of-the-kingdom-switch/hero',
    ],
}

UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'


def parse_ids(path: Path) -> list[str]:
    text = path.read_text(encoding='utf-8')
    if 'window.gamesCatalog' in text:
        text = text.split('window.gamesCatalog', 1)[1].split('];')[0]
    elif 'profileOnly' in text:
        text = text.split('profileOnly:')[1].split('],')[0]
    return re.findall(r"id:\s*'([^']+)'", text)


def all_game_ids() -> list[str]:
    seen = set()
    ids = []
    for path in (CATALOG, MANIFEST):
        for gid in parse_ids(path):
            if gid not in seen:
                seen.add(gid)
                ids.append(gid)
    return ids


def download_url(url: str, dest: Path) -> bool:
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
            if len(data) < 2000:
                return False
            dest.write_bytes(data)
            return True
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError):
        return False


def urls_for(game_id: str) -> list[str]:
    urls = list(CUSTOM.get(game_id, []))
    if game_id in STEAM:
        urls.append(STEAM_CDN.format(appid=STEAM[game_id]))
        urls.append(
            f'https://cdn.cloudflare.steamstatic.com/steam/apps/{STEAM[game_id]}/library_600x900.jpg'
        )
    return urls


def patch_catalog() -> None:
    text = CATALOG.read_text(encoding='utf-8')
    for gid in all_game_ids():
        jpg = f"img/quests/{gid}.jpg"
        if (OUT / f'{gid}.jpg').exists():
            text = re.sub(
                rf"(id: '{re.escape(gid)}'[\s\S]*?image: ')[^']+(')",
                rf"\g<1>{jpg}\2",
                text,
                count=1,
            )
    CATALOG.write_text(text, encoding='utf-8')
    print('Patched games-catalog.js')


def main():
    ok, fail = [], []
    for gid in all_game_ids():
        dest = OUT / f'{gid}.jpg'
        saved = False
        for url in urls_for(gid):
            if download_url(url, dest):
                print(f'OK  {gid} <- {url[:70]}...')
                ok.append(gid)
                saved = True
                break
        if not saved:
            print(f'FAIL {gid}')
            fail.append(gid)
    patch_catalog()
    print(f'\nDone: {len(ok)} ok, {len(fail)} failed')
    if fail:
        print('Failed:', ', '.join(fail))


if __name__ == '__main__':
    main()
