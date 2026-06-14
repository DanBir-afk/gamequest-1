import fs from 'fs';
import vm from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const catalogPath = path.join(root, 'js', 'quests-catalog.js');
const dataDir = path.join(root, 'js', 'quests', 'data');
fs.mkdirSync(dataDir, { recursive: true });

const src = fs.readFileSync(catalogPath, 'utf8');
const sandbox = { questsCatalog: null };
vm.runInNewContext(src.replace('window.questsCatalog', 'questsCatalog'), sandbox);
const catalog = sandbox.questsCatalog;

const map = {
    'photo-hunt': 'witcher3',
    'city-secrets': 'cyberpunk',
    'review-marathon': 'skyrim',
    'cs2': 'cs2',
    'rocket-league': 'rocket-league',
    'minecraft': 'minecraft',
    'half-life-alyx': 'half-life-alyx',
    'ac-mirage': 'ac-mirage',
    'cyberpunk': 'cyberpunk',
};

const written = new Set();
for (const [oldId, newId] of Object.entries(map)) {
    if (!catalog[oldId] || written.has(newId)) continue;
    const body = JSON.stringify(catalog[oldId], null, 4);
    fs.writeFileSync(
        path.join(dataDir, `${newId}.js`),
        `window.QuestLoader.register(${JSON.stringify(newId)}, ${body});\n`,
        'utf8'
    );
    written.add(newId);
    console.log('Wrote', newId);
}

// Slim index.html
const indexPath = path.join(root, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

html = html.replace(
    /<div class="showcase-grid">[\s\S]*?<\/div>\s*<\/section>/,
    '<div class="showcase-grid" id="showcase-grid"></div>\n        </section>'
);

html = html.replace(
    /<div class="quests-grid" id="trending-grid">[\s\S]*?<\/div>\s*<div class="popular-section">/,
    `<div class="quests-grid" id="trending-grid"></div>
                        <button type="button" class="quests-load-more" id="trending-load-more" hidden>Показать ещё</button>
                    </div>

                    <div class="popular-section">`
);

html = html.replace(
    /<div class="quests-grid" id="popular-grid">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<div class="challenges-sidebar/,
    `<div class="quests-grid" id="popular-grid"></div>
                        <button type="button" class="quests-load-more" id="popular-load-more" hidden>Показать ещё</button>
                    </div>
                </div>

                <div class="challenges-sidebar`
);

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Slimmed index.html');
