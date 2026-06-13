document.addEventListener('DOMContentLoaded', function() {
    if (!window.__gqParts) window.__gqParts = [];
    window.__gqParts.forEach(function(part) {
        try { part(); } catch (e) { console.error('GameQuest module error:', e); }
    });
});
