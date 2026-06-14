import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent
index_path = root / 'index.html'
html = index_path.read_text(encoding='utf-8')

html = re.sub(
    r'<div class="showcase-grid">.*?</div>\s*</section>',
    '<div class="showcase-grid" id="showcase-grid"></div>\n        </section>',
    html,
    count=1,
    flags=re.DOTALL,
)

html = re.sub(
    r'(<div class="quests-grid" id="trending-grid">).*?(</div>\s*<div class="popular-section">)',
    r'\1</div>\n                        <button type="button" class="quests-load-more" id="trending-load-more" hidden>Показать ещё</button>\n                    </div>\n\n                    <div class="popular-section">',
    html,
    count=1,
    flags=re.DOTALL,
)

html = re.sub(
    r'(<div class="quests-grid" id="popular-grid">).*?(</div>\s*</div>\s*</div>\s*<div class="challenges-sidebar)',
    r'\1</div>\n                        <button type="button" class="quests-load-more" id="popular-load-more" hidden>Показать ещё</button>\n                    </div>\n                </div>\n\n                <div class="challenges-sidebar',
    html,
    count=1,
    flags=re.DOTALL,
)

html = html.replace('<script src="js/quests-catalog.js"></script>\n', '')
html = html.replace(
    '<script src="js/profile.js"></script>',
    '<script src="js/games-manifest.js"></script>\n    <script src="js/quest-loader.js"></script>\n    <script src="js/profile.js"></script>',
)
html = html.replace(
    '<script src="js/quests.js"></script>',
    '<script src="js/quests-cards.js"></script>\n    <script src="js/quests.js"></script>',
)

index_path.write_text(html, encoding='utf-8')
print('Slimmed index.html, size:', len(html))
