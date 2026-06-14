window.__gqParts.push(function () {
    // ===== ACHIEVEMENTS ENGINE =====
    // Achievements are awarded automatically as conditions are met.
    // State (what's unlocked + date) is stored in localStorage per player,
    // and synced to Supabase when possible (profiles.achievements).

    const RARITY_COLOR = {
        common: '#9ca3af',
        rare: '#60a5fa',
        epic: '#a78bfa',
        legendary: '#fbbf24',
    };

    const ACH_IMG = 'assets/achievements/';

    // --- Achievement catalog. check(stats) -> bool ---
    const CATALOG = [
        // COMMON
        { id: 'first_step', icon: '🎮', name: 'First Step', desc: 'Complete your first quest', rarity: 'common', check: s => s.quests >= 1 },
        { id: 'identity', icon: '📝', name: 'Identity', desc: 'Write a profile bio', rarity: 'common', check: s => s.bio },
        { id: 'curator', icon: '🎴', name: 'Curator', desc: 'Pick 5 favorite games', rarity: 'common', check: s => s.favGames >= 5 },
        { id: 'new_connection', icon: '👋', name: 'New Connection', desc: 'Add your first friend', rarity: 'common', check: s => s.friends >= 1 },

        // RARE
        { id: 'bullseye', icon: '🎯', name: 'Bullseye', desc: 'Finish a quest with 100% accuracy', rarity: 'rare', check: s => s.perfect >= 1 },
        { id: 'dedicated', icon: '🔟', name: 'Dedicated', desc: 'Complete 10 quests', rarity: 'rare', check: s => s.quests >= 10 },
        { id: 'socialite', icon: '👥', name: 'Socialite', desc: 'Reach 5 friends', rarity: 'rare', check: s => s.friends >= 5 },
        { id: 'rising_star', icon: '⬆️', name: 'Rising Star', desc: 'Reach level 10', rarity: 'rare', check: s => s.level >= 10 },
        { id: 'persistent', icon: '🔁', name: 'Persistent', desc: 'Make 25 quest attempts', rarity: 'rare', check: s => s.attempts >= 25 },

        // EPIC
        { id: 'completionist', icon: '🗺️', name: 'Completionist', desc: 'Complete every quest at least once', rarity: 'epic', check: s => s.totalQuests > 0 && s.quests >= s.totalQuests },
        { id: 'sharpshooter', icon: '✨', name: 'Sharpshooter', desc: 'Score 100% on 5 quests', rarity: 'epic', check: s => s.perfect >= 5 },
        { id: 'hot_streak', icon: '🔥', name: 'Hot Streak', desc: 'Play quests 7 days in a row', rarity: 'epic', check: s => s.streak >= 7 },
        { id: 'veteran', icon: '🌟', name: 'Veteran', desc: 'Reach level 25', rarity: 'epic', check: s => s.level >= 25 },
        { id: 'quest_addict', icon: '📚', name: 'Quest Addict', desc: 'Complete 50 quests', rarity: 'epic', check: s => s.quests >= 50 },

        // LEGENDARY
        { id: 'grandmaster', icon: '👑', name: 'Grandmaster', desc: 'Reach level 50', rarity: 'legendary', check: s => s.level >= 50 },
        { id: 'living_legend', icon: '💎', name: 'Living Legend', desc: 'Earn 50,000 total XP', rarity: 'legendary', check: s => s.xp >= 50000 },
        { id: 'elite', icon: '🏅', name: 'Elite', desc: 'Reach level 100', rarity: 'legendary', check: s => s.level >= 100 },
        { id: 'flawless', icon: '🦾', name: 'Flawless', desc: 'Score 100% on every quest', rarity: 'legendary', check: s => s.perfectAll },

        // SECRET (shown as ??? until unlocked)
        { id: 'night_owl', icon: '🦉', name: 'Night Owl', desc: 'Complete a quest between midnight and 5 AM', rarity: 'epic', secret: true, check: s => s.nightOwl },
        { id: 'redemption', icon: '💪', name: 'Redemption', desc: 'Ace a quest you previously failed', rarity: 'rare', secret: true, check: s => s.comeback },
        { id: 'overachiever', icon: '🚀', name: 'Overachiever', desc: 'Unlock 15 achievements', rarity: 'legendary', secret: true, check: s => s.unlockedCount >= 15 },
    ];

    // --- Collect stats from various modules ---
    function favCount() {
        try {
            const raw = localStorage.getItem('gq_fav_games');
            if (!raw) return 0;
            const arr = JSON.parse(raw);
            return Array.isArray(arr) ? arr.length : 0;
        } catch (e) { return 0; }
    }

    function gatherStats() {
        const qs = (typeof window.getQuestStats === 'function') ? window.getQuestStats() : {};
        const xp = (typeof window.getUserXP === 'function') ? window.getUserXP() : 0;
        const level = (typeof window.getPlayerProgress === 'function') ? window.getPlayerProgress(xp).level : 0;
        const quests = (typeof window.getCompletedQuests === 'function') ? window.getCompletedQuests().length : 0;
        const totalQuests = (typeof window.getTotalQuestCount === 'function') ? window.getTotalQuestCount() : 0;
        const perfectIds = Array.isArray(qs.perfectIds) ? qs.perfectIds : [];
        const profileBio = window.currentProfile && typeof window.currentProfile.bio === 'string' ? window.currentProfile.bio.trim() : '';

        return {
            quests,
            totalQuests,
            attempts: qs.attempts || 0,
            xp,
            level,
            perfect: perfectIds.length,
            perfectAll: totalQuests > 0 && perfectIds.length >= totalQuests,
            streak: qs.streakBest || qs.streak || 0,
            nightOwl: !!qs.nightOwl,
            comeback: !!qs.comeback,
            friends: (typeof window.getFriendsCount === 'function') ? window.getFriendsCount() : 0,
            favGames: favCount(),
            bio: !!profileBio,
            unlockedCount: Object.keys(loadUnlocked()).length,
        };
    }

    // --- Storage for unlocked { id: timestamp } ---
    function storageKey() {
        return (typeof window.playerStorageKey === 'function')
            ? window.playerStorageKey('achievements')
            : 'gamequest_achievements';
    }

    function loadUnlocked() {
        try { return JSON.parse(localStorage.getItem(storageKey()) || '{}') || {}; }
        catch (e) { return {}; }
    }

    const MAX_PINNED = 5;

    function pinnedStorageKey() {
        return (typeof window.playerStorageKey === 'function')
            ? window.playerStorageKey('pinned_achievements')
            : 'gamequest_pinned_achievements';
    }

    function loadPinned() {
        try {
            const raw = localStorage.getItem(pinnedStorageKey());
            const arr = JSON.parse(raw || '[]');
            return Array.isArray(arr) ? arr.filter(id => typeof id === 'string') : [];
        } catch (e) { return []; }
    }

    function savePinned(ids) {
        const clean = Array.isArray(ids) ? ids.filter(id => typeof id === 'string').slice(0, MAX_PINNED) : [];
        try { localStorage.setItem(pinnedStorageKey(), JSON.stringify(clean)); } catch (e) {}
        savePinnedRemote(clean);
        return clean;
    }

    async function savePinnedRemote(ids) {
        const client = (typeof window.initSupabaseClient === 'function') ? window.initSupabaseClient() : window.supabaseClient;
        const user = window.currentUser;
        if (!client || !user) return;
        try {
            const { error } = await client.from('profiles').update({ pinned_achievements: ids }).eq('user_id', user.id);
            if (error) throw error;
            if (window.currentProfile) window.currentProfile.pinned_achievements = ids;
        } catch (e) {
            // Column may not exist — run supabase/pinned_achievements_setup.sql
        }
    }

    function saveUnlocked(map) {
        try { localStorage.setItem(storageKey(), JSON.stringify(map)); } catch (e) {}
        saveRemote(map);
    }

    // Best-effort sync to Supabase (profiles.achievements jsonb column).
    async function saveRemote(map) {
        const client = (typeof window.initSupabaseClient === 'function') ? window.initSupabaseClient() : window.supabaseClient;
        const user = window.currentUser;
        if (!client || !user) return;
        try {
            const { error } = await client.from('profiles').update({ achievements: map }).eq('user_id', user.id);
            if (error) throw error;
            if (window.currentProfile) window.currentProfile.achievements = map;
        } catch (e) {
            // Column may not exist — run supabase/achievements_setup.sql
        }
    }

    function fmtDate(ts) {
        if (!ts) return null;
        try {
            return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch (e) { return null; }
    }

    function rarityLabel(r) {
        return ({ common: 'Common', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' })[r] || 'Common';
    }

    function iconHtml(a, hide) {
        if (hide) return '❔';
        return `<img src="${ACH_IMG}${a.id}.png" alt="${a.name}" class="achievement-img" loading="lazy">`;
    }

    function esc(s) {
        const d = document.createElement('div');
        d.textContent = s || '';
        return d.innerHTML;
    }

    function tooltipText(a, hide) {
        if (hide) return 'Condition unknown...';
        return a.desc || '';
    }

    function tooltipHtml(a, hide) {
        const text = tooltipText(a, hide);
        if (!text) return '';
        return `<div class="ach-tooltip">${esc(text)}</div>`;
    }

    // Full catalog state with unlock flags (for modal/preview)
    function getState() {
        const unlocked = loadUnlocked();
        return CATALOG.map(a => ({
            ...a,
            unlocked: !!unlocked[a.id],
            ts: unlocked[a.id] || null,
            date: fmtDate(unlocked[a.id]),
        }));
    }

    // Main entry: recalculate and award new achievements
    function evaluate(opts) {
        opts = opts || {};
        const stats = gatherStats();
        const unlocked = loadUnlocked();
        const newly = [];

        CATALOG.forEach(a => {
            if (unlocked[a.id]) return;
            let ok = false;
            try { ok = !!a.check(stats); } catch (e) { ok = false; }
            if (ok) {
                unlocked[a.id] = Date.now();
                newly.push(a);
            }
        });

        if (newly.length) {
            saveUnlocked(unlocked);
            if (opts.notify !== false) {
                newly.forEach((a, i) => {
                    setTimeout(() => {
                        if (typeof window.showNotification === 'function') {
                            window.showNotification(`🏆 Achievement unlocked: ${a.name}`, RARITY_COLOR[a.rarity] || '#fbbf24');
                        }
                        if (typeof window.addActivityLog === 'function') {
                            window.addActivityLog(`Unlocked achievement "${a.name}"`, 'achievement');
                        }
                    }, i * 700);
                });
            }
        }

        renderPreview();
        if (typeof window.refreshAchievementsModal === 'function') window.refreshAchievementsModal();
        renderSettingsPinGrid();
        return newly;
    }

    // Build state (catalog + unlocked flags) from an arbitrary unlocked-map
    function stateFromMap(map) {
        map = map || {};
        return CATALOG.map(a => ({
            ...a,
            unlocked: !!map[a.id],
            ts: map[a.id] || null,
            date: fmtDate(map[a.id]),
        }));
    }

    function emptySlotHtml(allowAdd) {
        if (!allowAdd) {
            return `<div class="achievement-card achievement-slot-empty achievement-slot-readonly" aria-hidden="true"></div>`;
        }
        return `
            <button type="button" class="achievement-card achievement-slot-empty" data-action="add-achievement">
                <span class="achievement-slot-plus">+</span>
                <span class="achievement-slot-label">Add</span>
            </button>`;
    }

    function previewHtml(state, pinnedIds, opts) {
        opts = opts || {};
        const allowAdd = opts.allowAdd !== false;
        const unlocked = state.filter(a => a.unlocked);
        const validPinned = (Array.isArray(pinnedIds) ? pinnedIds : [])
            .filter(id => unlocked.some(a => a.id === id))
            .slice(0, MAX_PINNED);

        const pinnedCards = validPinned.map(id => state.find(a => a.id === id)).filter(Boolean);
        const emptyCount = MAX_PINNED - pinnedCards.length;

        const cardsHtml = pinnedCards.map(a => {
            const classes = ['achievement-card', 'pinned', a.rarity];
            const hide = a.secret && !a.unlocked;
            return `
                <div class="${classes.join(' ')}">
                    <div class="achievement-icon">${iconHtml(a, hide)}</div>
                    <div class="achievement-name">${hide ? 'Hidden' : a.name}</div>
                    ${tooltipHtml(a, hide)}
                </div>`;
        }).join('');

        const slotsHtml = emptyCount > 0
            ? Array.from({ length: emptyCount }, () => emptySlotHtml(allowAdd)).join('')
            : '';

        return cardsHtml + slotsHtml;
    }

    function wirePreviewActions(scope) {
        const root = scope || document.getElementById('profile-page');
        if (!root) return;
        root.querySelectorAll('[data-action="add-achievement"]').forEach(btn => {
            btn.addEventListener('click', openAchievementsSettings);
        });
    }

    function openAchievementsSettings() {
        if (!window.currentUser) {
            if (typeof window.openAuthModal === 'function') window.openAuthModal('login');
            return;
        }
        if (typeof window.showPage === 'function') window.showPage('settings');

        document.querySelectorAll('.settings-nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.panel === 'achievements');
        });
        document.querySelectorAll('.settings-panel').forEach(panel => {
            panel.classList.toggle('active', panel.dataset.panel === 'achievements');
        });

        renderSettingsPinGrid();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Profile page preview: pinned only + empty slots with Add button.
    function renderPreview(scope) {
        const root = scope || document.getElementById('profile-page');
        if (!root) return;
        const grid = root.querySelector('.achievements-grid');
        if (!grid) return;
        grid.innerHTML = previewHtml(getState(), loadPinned(), { allowAdd: true });
        wirePreviewActions(root);
    }

    // Preview for another user's profile (friend) — pinned only, no Add button.
    function renderPreviewFor(scope, unlockedMap, pinnedIds) {
        if (!scope) return;
        const grid = scope.querySelector('.achievements-grid');
        if (!grid) return;
        const pinned = Array.isArray(pinnedIds) ? pinnedIds : [];
        grid.innerHTML = previewHtml(stateFromMap(unlockedMap), pinned, { allowAdd: false });
    }

    // --- Settings: pin up to 5 achievements for profile preview ---
    let achPinnedSelected = [];

    function sortForSettingsPicker(state) {
        const pinnedSet = new Set(achPinnedSelected);
        const pinned = achPinnedSelected
            .map(id => state.find(a => a.id === id))
            .filter(Boolean);
        const rest = state.filter(a => !pinnedSet.has(a.id));
        const unlockedRest = rest.filter(a => a.unlocked).sort((a, b) => (b.ts || 0) - (a.ts || 0));
        const lockedRest = rest.filter(a => !a.unlocked);
        return [...pinned, ...unlockedRest, ...lockedRest];
    }

    function renderSettingsPinGrid() {
        const grid = document.getElementById('settings-ach-grid');
        const countEl = document.getElementById('settings-ach-count');
        if (!grid) return;

        const state = getState();
        grid.innerHTML = sortForSettingsPicker(state).map(a => {
            const idx = achPinnedSelected.indexOf(a.id);
            const isPinned = idx >= 0;
            const isLocked = !a.unlocked;
            const hide = a.secret && !a.unlocked;
            const classes = ['settings-ach-card', a.rarity];
            if (isPinned) classes.push('selected');
            if (isLocked) classes.push('locked');

            return `
                <div class="${classes.join(' ')}" data-id="${a.id}" data-locked="${isLocked ? '1' : '0'}">
                    <div class="settings-ach-head" data-id="${a.id}" data-locked="${isLocked ? '1' : '0'}">
                        <div class="settings-ach-icon">${iconHtml(a, hide)}</div>
                        <div class="settings-ach-info">
                            <div class="settings-ach-name">${hide ? 'Hidden' : esc(a.name)}</div>
                            <div class="settings-ach-rarity">${rarityLabel(a.rarity)}</div>
                        </div>
                        <div class="settings-ach-rank">${isPinned ? (idx + 1) : ''}</div>
                    </div>
                </div>`;
        }).join('');

        grid.querySelectorAll('.settings-ach-head').forEach(head => {
            head.addEventListener('click', () => {
                if (head.dataset.locked === '1') {
                    if (typeof window.showNotification === 'function') {
                        window.showNotification('Unlock this achievement first', '#6b7280');
                    }
                    return;
                }
                toggleSettingsPin(head.dataset.id);
            });
        });

        if (countEl) countEl.textContent = achPinnedSelected.length;
    }

    function toggleSettingsPin(id) {
        const idx = achPinnedSelected.indexOf(id);
        if (idx >= 0) {
            achPinnedSelected.splice(idx, 1);
        } else {
            if (achPinnedSelected.length >= MAX_PINNED) {
                if (typeof window.showNotification === 'function') {
                    window.showNotification(`You can pin up to ${MAX_PINNED} achievements`, '#6b7280');
                }
                return;
            }
            achPinnedSelected.push(id);
        }
        renderSettingsPinGrid();
        persistPinnedSelection();
    }

    function persistPinnedSelection() {
        const saved = savePinned(achPinnedSelected);
        achPinnedSelected = saved.slice();
        renderPreview();
    }

    function commitPinnedAchievements() {
        persistPinnedSelection();
    }

    function resetPinnedSelected() {
        achPinnedSelected = loadPinned().slice();
        renderSettingsPinGrid();
        renderPreview();
    }

    function reloadPinnedForCurrentUser() {
        achPinnedSelected = loadPinned().slice();
        renderSettingsPinGrid();
        renderPreview();
    }

    function getPinnedSelected() {
        return achPinnedSelected.slice();
    }

    function setPinnedAchievements(ids) {
        if (!Array.isArray(ids)) return;
        const state = getState();
        const unlockedIds = new Set(state.filter(a => a.unlocked).map(a => a.id));
        const clean = ids.filter(id => unlockedIds.has(id)).slice(0, MAX_PINNED);
        achPinnedSelected = clean.slice();
        try { localStorage.setItem(pinnedStorageKey(), JSON.stringify(clean)); } catch (e) {}
        if (window.currentProfile) window.currentProfile.pinned_achievements = clean;
        renderSettingsPinGrid();
        renderPreview();
    }

    window.reloadPinnedAchievements = reloadPinnedForCurrentUser;

    window.Achievements = {
        evaluate,
        getState,
        gatherStats,
        renderPreview,
        renderPreviewFor,
        renderSettingsPinGrid,
        commitPinnedAchievements,
        resetPinnedSelected,
        setPinnedAchievements,
        reloadPinnedForCurrentUser,
        getPinnedSelected,
        openAchievementsSettings,
        loadPinned,
        rarityLabel,
        iconHtml,
        tooltipHtml,
        catalog: CATALOG,
        maxPinned: MAX_PINNED,
    };
    // ===== END ACHIEVEMENTS ENGINE =====
});
