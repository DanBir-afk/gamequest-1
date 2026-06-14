import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent
catalog_path = root / 'js' / 'quests-catalog.js'
data_dir = root / 'js' / 'quests' / 'data'
data_dir.mkdir(parents=True, exist_ok=True)

text = catalog_path.read_text(encoding='utf-8')
start = text.index('{', text.index('window.questsCatalog'))
text = text[start:].rstrip().rstrip(';')

def extract_entry(src, key):
    needle = f"'{key}':"
    idx = src.find(needle)
    if idx == -1:
        return None
    i = src.index('{', idx)
    depth = 0
    for j in range(i, len(src)):
        ch = src[j]
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                return src[i:j + 1]
    return None

mapping = {
    'photo-hunt': 'witcher3',
    'city-secrets': 'cyberpunk',
    'review-marathon': 'skyrim',
    'cs2': 'cs2',
    'rocket-league': 'rocket-league',
    'minecraft': 'minecraft',
    'half-life-alyx': 'half-life-alyx',
    'ac-mirage': 'ac-mirage',
    'cyberpunk': 'cyberpunk',
}

written = set()
for old_id, new_id in mapping.items():
    if new_id in written:
        continue
    block = extract_entry(text, old_id)
    if not block:
        print('Skip', old_id)
        continue
    out = data_dir / f'{new_id}.js'
    out.write_text(
        f'window.QuestLoader.register({json.dumps(new_id)}, {block});\n',
        encoding='utf-8',
    )
    written.add(new_id)
    print('Wrote', new_id)
