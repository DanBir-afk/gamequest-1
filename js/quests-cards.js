/**
 * Renders quest/showcase cards from gamesManifest.
 * Add games in games-manifest.js only — no HTML edits.
 */
window.QuestCards = (function() {
    const MODE_LABELS = { solo: 'Solo', coop: 'Co-op' };

    const sectionState = {
        'trending-today': { games: [], shown: 0 },
        popular: { games: [], shown: 0 },
    };

    const SECTION_CONFIG = {
        'trending-today': {
            gridId: 'trending-today-grid',
            countId: 'trending-today-count',
            loadMoreId: 'trending-today-load-more',
        },
        popular: {
            gridId: 'popular-grid',
            countId: 'popular-count',
            loadMoreId: 'popular-load-more',
        },
    };

    const TRENDING_TOP_LIMIT = 4;

    function pageSize() {
        return window.gamesManifest?.pageSize || 24;
    }

    function manifestGames() {
        return window.gamesManifest?.games || [];
    }

    function resolveListSection(game) {
        if (game.section === 'popular') return 'popular';
        if (game.section === 'trending') {
            const featured = Number(game.featured) || 99;
            return featured <= TRENDING_TOP_LIMIT ? 'trending-today' : 'popular';
        }
        return game.section || 'popular';
    }

    function gamesForSection(section) {
        const games = manifestGames()
            .filter(g => resolveListSection(g) === section)
            .sort((a, b) => (a.featured || 99) - (b.featured || 99));
        if (section === 'trending-today') {
            return games.slice(0, TRENDING_TOP_LIMIT);
        }
        return games;
    }

    function showcaseGames() {
        return manifestGames()
            .filter(g => g.showcaseSize)
            .sort((a, b) => (a.featured || 99) - (b.featured || 99));
    }

    function modeLabel(mode) {
        return MODE_LABELS[mode] || mode || 'Solo';
    }

    function gameIconUrl(game) {
        return window.GameIcons?.resolve(game) || null;
    }

    function questImageHtml(game) {
        const rating = '<div class="quest-rating">0.0 ☆☆☆☆☆</div>';
        const icon = gameIconUrl(game);
        if (icon) {
            return `<div class="quest-image has-bg" style="background-image: url('${icon}')">${rating}</div>`;
        }
        return `<div class="quest-image">${rating}${game.emoji || '🎮'}</div>`;
    }

    function renderQuestCard(game) {
        const card = document.createElement('div');
        card.className = 'quest-card';
        if (game.hasQuest !== false && game.id) {
            card.dataset.questId = game.id;
        }
        if (game.mode) card.dataset.mode = game.mode;
        card.dataset.section = resolveListSection(game);

        const difficultyLabel = game.hasQuest === false ? 'Coming soon' : 'Easy · Med · Hard';
        const metaParts = [
            modeLabel(game.mode),
            difficultyLabel,
        ].filter(Boolean);

        card.innerHTML = `
            ${questImageHtml(game)}
            <div class="quest-info">
                <div class="quest-title">${game.title || game.gameName}</div>
                <div class="quest-meta">${metaParts.join(' • ')}</div>
            </div>`;
        return card;
    }

    function renderShowcaseTile(game, index) {
        const size = game.showcaseSize || 'small';
        const tile = document.createElement('a');
        tile.href = '#';
        tile.className = `showcase-tile showcase-tile-${size}`;
        if (game.hasQuest !== false && game.id) {
            tile.dataset.questLink = game.id;
        }

        const icon = gameIconUrl(game);
        const posterStyle = icon ? `style="background-image: url('${icon}')"` : '';
        const posterInner = icon
            ? ''
            : `<div class="showcase-emoji-fallback">${game.emoji || '🎮'}</div>`;

        const badge = index === 0 && game.featured === 1
            ? '<div class="showcase-badge">Top 1</div>'
            : '';

        const stats = window.getQuestRatingStats
            ? window.getQuestRatingStats(game.id)
            : { average: 0, count: 0 };
        const ratingText = stats.count
            ? `⭐ ${stats.average.toFixed(1)}`
            : '⭐ —';

        tile.innerHTML = `
            <div class="showcase-poster" ${posterStyle}>${posterInner}</div>
            <div class="showcase-overlay"></div>
            ${badge}
            <div class="showcase-info">
                <div class="showcase-game-tag">${game.showcaseTag || game.subtitle || ''}</div>
                <div class="showcase-game-name">${game.gameName || game.title}</div>
                <div class="showcase-game-meta">
                    <span>${ratingText}</span>
                    <span>${game.durationLabel || ''}</span>
                    ${game.favDesc ? `<span>${game.favDesc}</span>` : ''}
                </div>
            </div>`;
        return tile;
    }

    function updateCountBadge(section, total) {
        const cfg = SECTION_CONFIG[section];
        const el = cfg ? document.getElementById(cfg.countId) : null;
        if (el) el.textContent = String(total);
    }

    function updateLoadMoreBtn(section) {
        const cfg = SECTION_CONFIG[section];
        const btn = cfg ? document.getElementById(cfg.loadMoreId) : null;
        const st = sectionState[section];
        if (!btn || !st) return;
        const remaining = st.games.length - st.shown;
        btn.hidden = remaining <= 0;
        if (!btn.hidden) {
            btn.textContent = `Show more (${Math.min(pageSize(), remaining)})`;
        }
    }

    function appendSectionCards(section) {
        const cfg = SECTION_CONFIG[section];
        const grid = cfg ? document.getElementById(cfg.gridId) : null;
        const st = sectionState[section];
        if (!grid || !st) return;

        const slice = st.games.slice(st.shown, st.shown + pageSize());
        const frag = document.createDocumentFragment();
        slice.forEach(g => frag.appendChild(renderQuestCard(g)));
        grid.appendChild(frag);
        st.shown += slice.length;

        updateLoadMoreBtn(section);
        updateCountBadge(section, st.games.length);

        if (typeof window.initQuestCardActions === 'function') {
            window.initQuestCardActions();
        }
        if (typeof window.markCompletedQuestCards === 'function') {
            window.markCompletedQuestCards();
        }
        if (typeof window.updateQuestRatingDisplays === 'function') {
            window.updateQuestRatingDisplays();
        }
        if (typeof window.applyQuestFilters === 'function') {
            window.applyQuestFilters();
        }
    }

    function initSection(section) {
        const cfg = SECTION_CONFIG[section];
        const grid = cfg ? document.getElementById(cfg.gridId) : null;
        if (!grid) return;

        sectionState[section] = {
            games: gamesForSection(section),
            shown: 0,
        };
        grid.innerHTML = '';
        appendSectionCards(section);

        const btn = cfg ? document.getElementById(cfg.loadMoreId) : null;
        if (btn && !btn.dataset.bound) {
            btn.dataset.bound = '1';
            btn.addEventListener('click', () => appendSectionCards(section));
        }
    }

    function renderShowcase() {
        const grid = document.getElementById('showcase-grid');
        if (!grid) return;
        grid.innerHTML = '';
        const frag = document.createDocumentFragment();
        showcaseGames().forEach((g, i) => frag.appendChild(renderShowcaseTile(g, i)));
        grid.appendChild(frag);
    }

    function init() {
        if (!window.gamesManifest) return;
        renderShowcase();
        initSection('trending-today');
        initSection('popular');
    }

    function getGameMeta(questId) {
        const id = window.QuestLoader?.resolveCanonicalId(questId) || questId;
        const game = manifestGames().find(g => g.id === id);
        if (!game) return { duration: 'medium', mode: 'solo' };
        return {
            duration: game.duration || 'medium',
            mode: game.mode || 'solo',
            title: game.title,
            gameName: game.gameName,
        };
    }

    return { init, renderShowcase, getGameMeta, renderQuestCard };
})();
