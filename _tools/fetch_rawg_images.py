import re
import urllib.request

UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
slugs = {
    'minecraft': 'minecraft',
    'league-of-legends': 'league-of-legends',
    'valorant': 'valorant',
    'genshin-impact': 'genshin-impact',
    'cyberpunk': 'cyberpunk-2077',
}

for gid, slug in slugs.items():
    url = f'https://rawg.io/games/{slug}'
    html = urllib.request.urlopen(
        urllib.request.Request(url, headers={'User-Agent': UA}), timeout=20
    ).read().decode('utf-8', 'ignore')
    og = re.search(r'property="og:image" content="([^"]+)"', html)
    print(f"{gid}: {og.group(1) if og else 'NONE'}")
