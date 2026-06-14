/**
 * Lazy-loads quest question packs per game.
 * Only the opened quest is loaded — safe for 1000+ games.
 */
window.QuestLoader = (function() {
    const cache = Object.create(null);
    const pending = Object.create(null);
    let catalogPromise = null;

    function register(id, data) {
        if (!id || !data) return;
        cache[id] = data;
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const existing = document.querySelector(`script[data-quest-pack="${src}"]`);
            if (existing) {
                existing.addEventListener('load', () => resolve());
                existing.addEventListener('error', () => reject(new Error('Failed to load ' + src)));
                if (existing.dataset.loaded === '1') resolve();
                return;
            }
            const s = document.createElement('script');
            s.src = src;
            s.async = true;
            s.dataset.questPack = src;
            s.onload = () => { s.dataset.loaded = '1'; resolve(); };
            s.onerror = () => reject(new Error('Failed to load ' + src));
            document.head.appendChild(s);
        });
    }

    function ensureCatalog() {
        if (window.questsCatalog) return Promise.resolve(window.questsCatalog);
        if (catalogPromise) return catalogPromise;
        catalogPromise = loadScript('js/quests-catalog.js').then(() => window.questsCatalog || {});
        return catalogPromise;
    }

    function resolveCanonicalId(questId) {
        const legacy = window.gamesManifest?.legacyIds || {};
        return legacy[questId] || questId;
    }

    async function load(questId) {
        const id = resolveCanonicalId(questId);
        if (cache[id]) return cache[id];
        if (pending[id]) return pending[id];

        pending[id] = (async () => {
            try {
                await loadScript(`js/quests/data/${id}.js?v=1`);
            } catch (e) {
                // Fallback: monolithic catalog (dev / migration)
                const catalog = await ensureCatalog();
                const legacyKey = Object.entries(window.gamesManifest?.legacyIds || {})
                    .find(([, v]) => v === id)?.[0];
                const entry = catalog[id] || (legacyKey && catalog[legacyKey]);
                if (entry) cache[id] = entry;
            }
            delete pending[id];
            return cache[id] || null;
        })();

        return pending[id];
    }

    function peek(questId) {
        const id = resolveCanonicalId(questId);
        return cache[id] || null;
    }

    function getQuestIds() {
        const manifest = window.gamesManifest?.games || [];
        return manifest.filter(g => g.hasQuest !== false).map(g => g.id);
    }

    return { register, load, peek, resolveCanonicalId, getQuestIds };
})();
