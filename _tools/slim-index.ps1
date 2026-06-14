$root = Split-Path -Parent $PSScriptRoot
$indexPath = Join-Path $root 'index.html'
$html = Get-Content $indexPath -Raw -Encoding UTF8

$html = [regex]::Replace($html,
    '(?s)<div class="showcase-grid">.*?</div>\s*</section>',
    "<div class=`"showcase-grid`" id=`"showcase-grid`"></div>`n        </section>")

$html = [regex]::Replace($html,
    '(?s)(<div class="quests-grid" id="trending-grid">).*?(</div>\s*<div class="popular-section">)',
    "`$1</div>`n                        <button type=`"button`" class=`"quests-load-more`" id=`"trending-load-more`" hidden>Показать ещё</button>`n                    </div>`n`n                    <div class=`"popular-section`">")

$html = [regex]::Replace($html,
    '(?s)(<div class="quests-grid" id="popular-grid">).*?(</div>\s*</div>\s*</div>\s*<div class="challenges-sidebar)',
    "`$1</div>`n                        <button type=`"button`" class=`"quests-load-more`" id=`"popular-load-more`" hidden>Показать ещё</button>`n                    </div>`n                </div>`n`n                <div class=`"challenges-sidebar")

$html = $html -replace '<script src="js/quests-catalog\.js"></script>\r?\n', ''
$html = $html -replace '<script src="js/profile\.js"></script>',
    @"
<script src="js/games-manifest.js"></script>
    <script src="js/quest-loader.js"></script>
    <script src="js/profile.js"></script>
"@

$html = $html -replace '<script src="js/quests\.js"></script>',
    @"
<script src="js/quests-cards.js"></script>
    <script src="js/quests.js"></script>
"@

[System.IO.File]::WriteAllText($indexPath, $html, [System.Text.UTF8Encoding]::new($false))
Write-Host 'Slimmed index.html'
