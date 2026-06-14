import re
from pathlib import Path

p = Path(__file__).resolve().parent.parent / 'js' / 'games-catalog.js'
text = p.read_text(encoding='utf-8')
text = text.replace('.webp', '.svg')

def add_image(block: str) -> str:
    if 'image:' in block:
        return block
    id_m = re.search(r"id: '([^']+)'", block)
    if not id_m:
        return block
    gid = id_m.group(1)
    return block.replace(
        "emoji: '",
        f"image: 'img/quests/{gid}.svg',\n        emoji: '",
        1,
    )

parts = re.split(r'(\{)', text)
out = []
i = 0
while i < len(parts):
    part = parts[i]
    if part == '{' and i + 1 < len(parts):
        chunk = part
        i += 1
        depth = 1
        while i < len(parts) and depth > 0:
            chunk += parts[i]
            depth += parts[i].count('{') - parts[i].count('}')
            i += 1
        if "id: '" in chunk and "emoji: '" in chunk:
            chunk = add_image(chunk)
        out.append(chunk)
    else:
        out.append(part)
        i += 1

p.write_text(''.join(out), encoding='utf-8')
print('Updated', p)
