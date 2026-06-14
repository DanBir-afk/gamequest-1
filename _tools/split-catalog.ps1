# Splits quests-catalog.js into per-game data files + slims index.html
$root = Split-Path $PSScriptRoot -Parent
$catalogPath = Join-Path $root 'js\quests-catalog.js'
$dataDir = Join-Path $root 'js\quests/data'
New-Item -ItemType Directory -Force -Path $dataDir | Out-Null

$map = [ordered]@{
    'photo-hunt' = 'witcher3'
    'city-secrets' = 'cyberpunk'
    'review-marathon' = 'skyrim'
    'cs2' = 'cs2'
    'rocket-league' = 'rocket-league'
    'minecraft' = 'minecraft'
    'half-life-alyx' = 'half-life-alyx'
    'ac-mirage' = 'ac-mirage'
    'cyberpunk' = 'cyberpunk'
}

$content = Get-Content $catalogPath -Raw -Encoding UTF8
$content = $content -replace 'window\.questsCatalog\s*=\s*', '$catalog = '

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('const catalog = {};')
$script = "const catalog = {};" + ($content -replace '(?s)^.*?window\.questsCatalog\s*=\s*', '' -replace ';\s*$', '')
# Parse via node if available
$nodeScript = @"
const fs = require('fs');
const vm = require('vm');
const src = fs.readFileSync('$($catalogPath -replace '\\','/')', 'utf8');
const sandbox = { questsCatalog: null };
const patched = src.replace('window.questsCatalog', 'sandbox.questsCatalog');
vm.runInNewContext(patched, sandbox);
const catalog = sandbox.questsCatalog;
const map = $($map | ConvertTo-Json -Compress);
const outDir = '$($dataDir -replace '\\','/')';
for (const [oldId, newId] of Object.entries(map)) {
  if (!catalog[oldId]) continue;
  if (newId === 'cyberpunk' && oldId === 'city-secrets' && fs.existsSync(outDir + '/cyberpunk.js')) continue;
  const body = JSON.stringify(catalog[oldId], null, 4);
  const file = outDir + '/' + newId + '.js';
  fs.writeFileSync(file,
    'window.QuestLoader.register(' + JSON.stringify(newId) + ', ' + body + ');\n',
    'utf8');
  console.log('Wrote', newId);
}
"@

$nodeScript | node
if ($LASTEXITCODE -ne 0) { Write-Error 'Node split failed'; exit 1 }

# Slim index.html showcase + quest grids
$indexPath = Join-Path $root 'index.html'
$html = Get-Content $indexPath -Raw -Encoding UTF8

$html = $html -replace '(?s)<div class="showcase-grid">.*?</div>\s*</section>', @'
<div class="showcase-grid" id="showcase-grid"></div>
        </section>
'@

$html = $html -replace '(?s)<div class="quests-grid" id="trending-grid">.*?</div>\s*<div class="popular-section">', @'
<div class="quests-grid" id="trending-grid"></div>
                        <button type="button" class="quests-load-more" id="trending-load-more" hidden>Показать ещё</button>
                    </div>

                    <div class="popular-section">
'@

$html = $html -replace '(?s)<div class="quests-grid" id="popular-grid">.*?</div>\s*</div>\s*</div>\s*<div class="challenges-sidebar', @'
<div class="quests-grid" id="popular-grid"></div>
                        <button type="button" class="quests-load-more" id="popular-load-more" hidden>Показать ещё</button>
                    </div>
                </div>

                <div class="challenges-sidebar
'@

Set-Content $indexPath $html -Encoding UTF8 -NoNewline
Write-Host 'Done: data files + slim index.html'
