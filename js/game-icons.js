/**
 * Resolves game cover images. Files: img/quests/<id>.jpg (real art) or .svg (fallback).
 */
window.GameIcons = (function() {
    const BASE = 'img/quests/';

    function url(gameId, ext) {
        if (!gameId) return null;
        return `${BASE}${gameId}.${ext || 'jpg'}`;
    }

    function resolve(game) {
        if (!game) return null;
        if (game.image && /\.(jpe?g|webp|png)$/i.test(game.image)) return game.image;
        if (game.id) return url(game.id, 'jpg');
        return game.image || null;
    }

    function backgroundStyle(game) {
        const src = resolve(game);
        return src ? `background-image: url('${src}')` : '';
    }

    return { url, resolve, backgroundStyle, BASE };
})();
