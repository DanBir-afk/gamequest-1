window.__gqParts.push(function() {
// ===== ACHIEVEMENTS MODAL =====
const achievementsModal = document.getElementById('achievements-modal');
const achievementsModalClose = document.getElementById('achievements-modal-close');
const viewAllAchievementsBtn = document.getElementById('view-all-achievements-btn');
const amGrid = document.getElementById('am-grid');
const amTabs = document.querySelectorAll('.am-nav-item');
let amActiveTab = 'all';

const AM_PANEL_TITLES = {
    all: 'All Achievements',
    unlocked: 'Unlocked',
    locked: 'Available',
    secret: 'Secret',
};

// Live achievement state comes from the Achievements engine (js/achievements.js)
function amList() {
    return (window.Achievements && typeof window.Achievements.getState === 'function')
        ? window.Achievements.getState()
        : [];
}

function amCounts() {
    const list = amList();
    return {
        all: list.length,
        unlocked: list.filter(a => a.unlocked).length,
        locked: list.filter(a => !a.unlocked && !a.secret).length,
        secret: list.filter(a => a.secret).length,
    };
}

function amFilter() {
    const list = amList();
    if (amActiveTab === 'unlocked') return list.filter(a => a.unlocked);
    if (amActiveTab === 'locked') return list.filter(a => !a.unlocked && !a.secret);
    if (amActiveTab === 'secret') return list.filter(a => a.secret);
    return list;
}


function amRender() {
    const counts = amCounts();
    document.getElementById('am-count-all').textContent = counts.all;
    document.getElementById('am-count-unlocked').textContent = counts.unlocked;
    document.getElementById('am-count-locked').textContent = counts.locked;
    document.getElementById('am-count-secret').textContent = counts.secret;

    const percent = counts.all > 0 ? Math.round((counts.unlocked / counts.all) * 100) : 0;
    document.getElementById('am-progress-fill').style.width = percent + '%';
    document.getElementById('am-progress-text').textContent = percent + '%';
    document.getElementById('am-subtitle').textContent = `${counts.unlocked} of ${counts.all} unlocked · ${percent}%`;

    const panelTitle = document.getElementById('am-panel-title');
    if (panelTitle) panelTitle.textContent = AM_PANEL_TITLES[amActiveTab] || 'Achievements';

    const filtered = amFilter();
    if (filtered.length === 0) {
        amGrid.innerHTML = `
            <div class="am-empty">
                <div class="am-empty-icon">🔍</div>
                <div>Nothing here yet</div>
            </div>`;
        return;
    }

    amGrid.innerHTML = filtered.map(a => {
        const classes = ['am-card', a.rarity];
        if (!a.unlocked) classes.push('locked');
        if (a.secret) classes.push('secret');

        const hide = a.secret && !a.unlocked;
        const icon = (window.Achievements && typeof window.Achievements.iconHtml === 'function')
            ? window.Achievements.iconHtml(a, hide)
            : (hide ? '❔' : a.icon);
        const name = hide ? 'Hidden' : a.name;
        const tip = (window.Achievements && typeof window.Achievements.tooltipHtml === 'function')
            ? window.Achievements.tooltipHtml(a, hide)
            : '';

        return `
            <div class="${classes.join(' ')}">
                <div class="am-icon">${icon}</div>
                <div class="am-name">${name}</div>
                ${tip}
                ${a.unlocked && a.date ? `<div class="am-date">Unlocked ${a.date}</div>` : ''}
            </div>`;
    }).join('');
}

function openAchievementsModal() {
    amActiveTab = 'all';
    amTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === 'all'));
    if (window.Achievements) window.Achievements.evaluate({ notify: false });
    amRender();
    achievementsModal.classList.add('active');
    if (typeof window.lockBodyScroll === 'function') window.lockBodyScroll();
}

function closeAchievementsModal() {
    achievementsModal.classList.remove('active');
    if (typeof window.unlockBodyScroll === 'function') window.unlockBodyScroll();
}

// Allow the achievements engine to refresh the modal live when something unlocks
window.refreshAchievementsModal = function () {
    if (achievementsModal && achievementsModal.classList.contains('active')) amRender();
};

if (viewAllAchievementsBtn) {
    viewAllAchievementsBtn.addEventListener('click', openAchievementsModal);
}
achievementsModalClose.addEventListener('click', closeAchievementsModal);
achievementsModal.addEventListener('click', e => {
    if (e.target === achievementsModal) closeAchievementsModal();
});

// Block wheel/touch scroll from reaching the page behind the modal
function amTrapScroll(e) {
    if (!achievementsModal || !achievementsModal.classList.contains('active')) return;
    const scrollEl = e.target.closest('.am-body');
    if (scrollEl && scrollEl.scrollHeight > scrollEl.clientHeight) {
        const atTop = scrollEl.scrollTop <= 0;
        const atBottom = scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 1;
        const delta = e.deltaY || 0;
        if ((delta < 0 && atTop) || (delta > 0 && atBottom)) e.preventDefault();
        return;
    }
    e.preventDefault();
}

if (achievementsModal) {
    achievementsModal.addEventListener('wheel', amTrapScroll, { passive: false });
    achievementsModal.addEventListener('touchmove', amTrapScroll, { passive: false });
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && achievementsModal.classList.contains('active')) closeAchievementsModal();
});

amTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        amActiveTab = tab.dataset.tab;
        amTabs.forEach(t => t.classList.toggle('active', t === tab));
        amRender();
    });
});
// ===== END ACHIEVEMENTS MODAL =====

// ===== FAVORITE GAMES (inline in Settings) =====
const favGamesList = document.getElementById('fav-games-list');
const settingsFavGrid = document.getElementById('settings-fav-grid');
const settingsFavCount = document.getElementById('settings-fav-count');

// Catalog of all games — built from gamesManifest (single source of truth)
function buildAllGames() {
    const manifest = window.gamesManifest;
    if (!manifest) return [];
    const fromGames = (manifest.games || []).map(g => ({
        id: g.id,
        icon: g.emoji || '🎮',
        name: g.gameName || g.title,
        desc: g.favDesc || g.subtitle || '',
    }));
    const profileOnly = (manifest.profileOnly || []).map(g => ({
        id: g.id,
        icon: g.emoji || '🎮',
        name: g.gameName,
        desc: g.favDesc || '',
    }));
    const seen = new Set();
    return [...fromGames, ...profileOnly].filter(g => {
        if (seen.has(g.id)) return false;
        seen.add(g.id);
        return true;
    });
}

const allGames = buildAllGames();

const FAV_KEY = 'gq_fav_games';
const MAX_FAV = 5;
const MEDALS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

// Returns array of { id, desc }
function loadFavGames() {
    const saved = safeGet(FAV_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.length && typeof parsed[0] === 'string') {
                return parsed.map(id => {
                    const g = allGames.find(x => x.id === id);
                    return { id, desc: g ? g.desc : '' };
                });
            }
            return parsed;
        } catch (e) {}
    }
    return [
        { id: 'cyberpunk', desc: 'Open world of Night City' },
        { id: 'witcher3', desc: 'Dark fantasy with choices' },
        { id: 'cs2', desc: 'Tactical shooter' },
    ];
}

function saveFavGames(list) {
    safeSet(FAV_KEY, JSON.stringify(list));
}

// Working state for settings (committed on save)
let favSelected = loadFavGames().map(x => ({ ...x }));

function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

// Get an HTML snippet for a game icon
function gameIconHtml(g) {
    const src = window.GameIcons?.resolve({ id: g.id, image: g.image });
    if (src) {
        return `<img src="${src}" alt="${escapeHtml(g.name)}" class="fav-game-img" loading="lazy">`;
    }
    return g.icon;
}

// Render the read-only list on the profile
function renderFavGamesList() {
    const list = loadFavGames();
    if (!favGamesList) return;
    if (list.length === 0) {
        favGamesList.innerHTML = `<div class="fav-game-empty">Add favorite games in settings</div>`;
        return;
    }
    favGamesList.innerHTML = list.map((item, i) => {
        const g = allGames.find(x => x.id === item.id);
        if (!g) return '';
        const desc = item.desc || g.desc || '';
        return `
            <div class="fav-game">
                <div class="fav-game-icon">${gameIconHtml(g)}</div>
                <div class="fav-game-info">
                    <div class="fav-game-name">${g.name}</div>
                    ${desc ? `<div class="fav-game-stats">${escapeHtml(desc)}</div>` : ''}
                </div>
            </div>`;
    }).join('');
}

// Render the editable grid inside Settings
function renderSettingsFavGrid() {
    if (!settingsFavGrid) return;
    settingsFavGrid.innerHTML = allGames.map(g => {
        const sel = favSelected.find(x => x.id === g.id);
        const idx = sel ? favSelected.indexOf(sel) : -1;
        const isSelected = idx >= 0;
        const currentDesc = sel ? sel.desc : g.desc;
        return `
            <div class="settings-fav-card ${isSelected ? 'selected' : ''}" data-id="${g.id}">
                <div class="settings-fav-head" data-id="${g.id}">
                    <div class="settings-fav-icon">${gameIconHtml(g)}</div>
                    <div class="settings-fav-name">${g.name}</div>
                    <div class="settings-fav-rank">${isSelected ? (idx + 1) : ''}</div>
                </div>
                ${isSelected ? `
                    <input type="text" class="settings-fav-desc-input" data-id="${g.id}" value="${escapeHtml(currentDesc)}" maxlength="50" placeholder="Short description (optional)">
                ` : ''}
            </div>`;
    }).join('');

    settingsFavGrid.querySelectorAll('.settings-fav-head').forEach(head => {
        head.addEventListener('click', () => toggleSettingsFavGame(head.dataset.id));
    });

    settingsFavGrid.querySelectorAll('.settings-fav-desc-input').forEach(input => {
        input.addEventListener('click', e => e.stopPropagation());
        input.addEventListener('input', e => {
            const id = e.target.dataset.id;
            const sel = favSelected.find(x => x.id === id);
            if (sel) sel.desc = e.target.value;
        });
    });

    updateSettingsFavCount();
}

function toggleSettingsFavGame(id) {
    const idx = favSelected.findIndex(x => x.id === id);
    if (idx >= 0) {
        favSelected.splice(idx, 1);
    } else {
        if (favSelected.length >= MAX_FAV) {
            if (typeof showNotification === 'function') {
                window.showNotification(`You can choose up to ${MAX_FAV} games`, '#6b7280');
            }
            return;
        }
        const g = allGames.find(x => x.id === id);
        favSelected.push({ id, desc: g ? g.desc : '' });
    }
    renderSettingsFavGrid();
}

function updateSettingsFavCount() {
    if (settingsFavCount) settingsFavCount.textContent = favSelected.length;
}

// Initial render
renderFavGamesList();
renderSettingsFavGrid();
// ===== END FAVORITE GAMES =====

// ===== SETTINGS SIDEBAR NAV =====
const settingsNavItems = document.querySelectorAll('.settings-nav-item');
const settingsPanels = document.querySelectorAll('.settings-panel');

settingsNavItems.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.panel;
        settingsNavItems.forEach(b => b.classList.toggle('active', b === btn));
        settingsPanels.forEach(p => p.classList.toggle('active', p.dataset.panel === target));
        if (target === 'achievements' && window.Achievements && typeof window.Achievements.renderSettingsPinGrid === 'function') {
            window.Achievements.renderSettingsPinGrid();
        }
    });
});
// ===== END SETTINGS SIDEBAR NAV =====
// ===== GUESTBOOK v2 =====
const gbTextInput = document.getElementById('gb-text-input');
const gbSendBtn = document.getElementById('gb-send-btn');
const gbCounterInput = document.getElementById('gb-counter-input');
const gbComposerAvatar = document.getElementById('gb-composer-avatar');
const gbComposerName = document.getElementById('gb-composer-name');
const gbList = document.getElementById('gb-list');
const gbTotal = document.getElementById('gb-total');
const gbSortBtns = document.querySelectorAll('.gb-sort-btn');

const MAX_LEN = 280;

// Get current user info. avatar is what gets stored (lightweight),
// avatarHtml is what gets rendered (may include img tag).
function gbCurrentUser() {
    // Priority: Supabase profile → localStorage → default
    let name = 'DenBir';
    if (window.currentProfile && window.currentProfile.username) {
        name = window.currentProfile.username;
    } else if (localStorage.getItem('gamequest_username')) {
        name = localStorage.getItem('gamequest_username');
    }
    const storedAvatar = (window.currentProfile && window.currentProfile.avatar) || localStorage.getItem('gamequest_avatar') || '🏹';
    const profileAvatarEl = document.querySelector('.profile-avatar');
    let hasPhoto = false;
    if (profileAvatarEl && profileAvatarEl.querySelector('img')) {
        hasPhoto = true;
    } else if (typeof storedAvatar === 'string' && (storedAvatar.startsWith('data:') || storedAvatar.startsWith('http'))) {
        hasPhoto = true;
    }
    const emoji = hasPhoto ? (localStorage.getItem('gamequest_avatar') || '🏹') : storedAvatar;
    return {
        name,
        emoji,
        hasPhoto,
        // Store a small marker, not the full data URL:
        avatar: hasPhoto ? '__profile_photo__' : emoji
    };
}

// Resolve stored avatar value into actual rendered HTML.
// Only "own" messages with __profile_photo__ get the live profile picture.
function gbAvatarHtml(storedAvatar, isOwn) {
    if (storedAvatar === '__profile_photo__' && isOwn) {
        const profileAvatarEl = document.querySelector('.profile-avatar');
        const img = profileAvatarEl ? profileAvatarEl.querySelector('img') : null;
        if (img && img.src) {
            return `<img src="${img.src}" alt="">`;
        }
        // Fallback: profile no longer has a photo, show emoji
        return localStorage.getItem('gamequest_avatar') || '🏹';
    }
    return storedAvatar;
}

function gbSyncComposer() {
    const me = gbCurrentUser();
    gbComposerName.textContent = me.name;
    if (me.hasPhoto) {
        const profileAvatarEl = document.querySelector('.profile-avatar');
        const img = profileAvatarEl.querySelector('img');
        gbComposerAvatar.innerHTML = `<img src="${img.src}" alt="">`;
    } else {
        gbComposerAvatar.textContent = me.emoji;
    }
}

// Seed messages on first load
const defaultMessages = [
    { id: 1, author: 'Ivan', handle: 'vanya', avatar: '⚔️', text: 'Bro, you finished "City Secrets" in 22 minutes? Wild, I barely managed it in 40 🔥', time: Date.now() - 1000*60*60*2, likes: 4, likedBy: [], isOwn: false },
    { id: 2, author: 'Gleb', handle: 'gleb', avatar: '🏹', text: 'When are we playing Co-op? I\'ll wait for you online tonight!', time: Date.now() - 1000*60*60*24, likes: 2, likedBy: [], isOwn: false },
    { id: 3, author: 'Anton', handle: 'anton', avatar: '🗡️', text: 'Congrats on Master rank 🏆', time: Date.now() - 1000*60*60*24*3, likes: 7, likedBy: [], isOwn: false }
];

let gbSort = localStorage.getItem('gb_sort_v2') || 'newest';

function gbLoad() {
    const saved = localStorage.getItem('gb_messages_v2');
    if (saved) {
        try {
            const arr = JSON.parse(saved);
            // Sanitize: strip heavy data URLs from previously saved messages
            let needsResave = false;
            arr.forEach(m => {
                if (typeof m.avatar === 'string' && m.avatar.length > 200) {
                    // Old format: had full <img src="data:..."> embedded. Replace with marker.
                    m.avatar = m.isOwn ? '__profile_photo__' : '🎮';
                    needsResave = true;
                }
            });
            if (needsResave) {
                try { localStorage.setItem('gb_messages_v2', JSON.stringify(arr)); } catch(e) {}
            }
            return arr;
        } catch(e) {
            return [...defaultMessages];
        }
    }
    return [...defaultMessages];
}

function gbSave(messages) {
    try {
        localStorage.setItem('gb_messages_v2', JSON.stringify(messages));
        return true;
    } catch (e) {
        // Storage full — keep only the most recent 100 messages
        console.warn('Storage full, trimming guestbook history');
        const trimmed = [...messages].sort((a,b) => b.time - a.time).slice(0, 100);
        try {
            localStorage.setItem('gb_messages_v2', JSON.stringify(trimmed));
            return true;
        } catch (e2) {
            window.showNotification('Storage is full. Clear old messages.', '#6b7280');
            return false;
        }
    }
}

let gbMessages = gbLoad();

function gbEscape(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

function gbFormatTime(ts) {
    const diff = Date.now() - ts;
    const m = Math.floor(diff/60000);
    const h = Math.floor(diff/3600000);
    const d = Math.floor(diff/86400000);
    if (m < 1) return 'just now';
    if (m < 60) return m + 'm';
    if (h < 24) return h + 'h';
    if (d < 7) return d + 'd';
    const dt = new Date(ts);
    return dt.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

function gbMakeHandle(name) {
    return name.toLowerCase()
        
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 15) || 'guest';
}

function gbSorted() {
    const arr = [...gbMessages];
    if (gbSort === 'newest') arr.sort((a,b) => b.time - a.time);
    else if (gbSort === 'oldest') arr.sort((a,b) => a.time - b.time);
    else if (gbSort === 'liked') arr.sort((a,b) => (b.likes||0) - (a.likes||0) || b.time - a.time);
    return arr;
}

function gbRender() {
    gbTotal.textContent = gbMessages.length;

    if (gbMessages.length === 0) {
        gbList.innerHTML = `
            <div class="gb-empty">
                <div class="gb-empty-icon">💬</div>
                <div class="gb-empty-text">Empty for now. Be the first to write!</div>
            </div>`;
        return;
    }

    gbList.innerHTML = gbSorted().map(m => {
        const handle = m.handle || gbMakeHandle(m.author);
        const liked = m.isLiked || (m.likedBy && m.likedBy.includes('me'));
        return `
            <div class="gb-msg" data-id="${m.id}">
                <div class="gb-msg-avatar">${gbAvatarHtml(m.avatar, m.isOwn)}</div>
                <div class="gb-msg-body">
                    <div class="gb-msg-head">
                        <span class="gb-msg-name">${gbEscape(m.author)}</span>
                        <span class="gb-msg-handle">@${handle}</span>
                        <span class="gb-msg-time">${gbFormatTime(m.time)}</span>
                    </div>
                    <div class="gb-msg-text">${gbEscape(m.text)}</div>
                    <div class="gb-msg-actions">
                        <button class="gb-action gb-like ${liked ? 'liked' : ''}" data-id="${m.id}" title="Like">
                            <span class="gb-action-icon">${liked ? '♥' : '♡'}</span>
                            <span class="gb-action-count">${m.likes || 0}</span>
                        </button>
                    </div>
                </div>
                ${m.isOwn ? `<button class="gb-msg-delete" data-id="${m.id}" title="Remove">×</button>` : ''}
            </div>
        `;
    }).join('');

    // Wire up actions
    gbList.querySelectorAll('.gb-like').forEach(btn => {
        btn.addEventListener('click', () => gbToggleLike(parseInt(btn.dataset.id)));
    });
    gbList.querySelectorAll('.gb-msg-delete').forEach(btn => {
        btn.addEventListener('click', () => gbDelete(parseInt(btn.dataset.id)));
    });
}

function gbToggleLike(id) {
    const msg = gbMessages.find(m => m.id === id);
    if (!msg) return;
    if (!msg.likedBy) msg.likedBy = [];
    const idx = msg.likedBy.indexOf('me');
    if (idx >= 0) {
        msg.likedBy.splice(idx, 1);
        msg.likes = Math.max(0, (msg.likes || 0) - 1);
        msg.isLiked = false;
    } else {
        msg.likedBy.push('me');
        msg.likes = (msg.likes || 0) + 1;
        msg.isLiked = true;
    }
    gbSave(gbMessages);
    gbRender();
}

function gbDelete(id) {
    gbMessages = gbMessages.filter(m => m.id !== id);
    gbSave(gbMessages);
    gbRender();
    window.showNotification('Message deleted', '#6b7280');
}

function gbUpdateComposer() {
    const len = gbTextInput.value.length;
    const remaining = MAX_LEN - len;
    gbCounterInput.textContent = remaining;
    gbCounterInput.classList.toggle('warn', remaining < 40 && remaining >= 0);
    gbCounterInput.classList.toggle('over', remaining < 0);
    gbSendBtn.disabled = gbTextInput.value.trim().length === 0 || remaining < 0;

    // auto-grow
    gbTextInput.style.height = 'auto';
    gbTextInput.style.height = Math.min(gbTextInput.scrollHeight, 140) + 'px';
}

function gbPostMessage() {
    const text = gbTextInput.value.trim();
    if (!text || text.length > MAX_LEN) return;

    const me = gbCurrentUser();
    const newMsg = {
        id: Date.now(),
        author: me.name,
        handle: gbMakeHandle(me.name),
        avatar: me.avatar,
        text: text,
        time: Date.now(),
        likes: 0,
        likedBy: [],
        isOwn: true
    };

    gbMessages.push(newMsg);
    gbSave(gbMessages);

    gbTextInput.value = '';
    gbUpdateComposer();
    // jump to newest sort to show their post
    gbSort = 'newest';
    localStorage.setItem('gb_sort_v2', 'newest');
    gbSortBtns.forEach(b => b.classList.toggle('active', b.dataset.sort === 'newest'));
    gbRender();
}

// Own-profile guestbook is now backed by Supabase via window.Guestbook.
// (Legacy localStorage helpers above are no longer wired up.)
window.mountOwnGuestbook = function () {
    const container = document.querySelector('.gb-container');
    if (!container) return;
    const u = window.currentUser;
    if (!u || !u.id || !window.Guestbook) {
        container.innerHTML = '<div class="gb-empty"><div class="gb-empty-icon">💬</div><div class="gb-empty-text">Log in to use the guestbook</div></div>';
        return;
    }
    window.Guestbook.mount(container, u.id);
};
// ===== END GUESTBOOK v2 =====

    window.loadFavGames = loadFavGames;
    window.saveFavGames = saveFavGames;
    window.renderFavGamesList = renderFavGamesList;
    window.renderSettingsFavGrid = renderSettingsFavGrid;
    window.commitFavGames = function () {
        saveFavGames(favSelected);
        renderFavGamesList();
    };
    window.resetFavSelected = function () {
        favSelected = loadFavGames().map(x => ({ ...x }));
        renderSettingsFavGrid();
    };
    // Used by account-settings sync (main.js / auth.js)
    window.getFavSelected = function () {
        return favSelected.map(x => ({ ...x }));
    };
    window.setFavGames = function (list) {
        if (!Array.isArray(list)) return;
        const clean = list.filter(x => x && x.id).map(x => ({ id: x.id, desc: x.desc || '' }));
        favSelected = clean.map(x => ({ ...x }));
        saveFavGames(clean);
        renderSettingsFavGrid();
        renderFavGamesList();
    };
    // Render a read-only favorite-games list for ANY profile (used by friend modal)
    window.favGamesHtml = function (list) {
        if (!Array.isArray(list) || list.length === 0) {
            return '<div class="fav-game-empty">No favorite games yet</div>';
        }
        return list.map(item => {
            const g = allGames.find(x => x.id === item.id);
            if (!g) return '';
            const desc = (item && item.desc) || g.desc || '';
            return `
                <div class="fav-game">
                    <div class="fav-game-icon">${gameIconHtml(g)}</div>
                    <div class="fav-game-info">
                        <div class="fav-game-name">${g.name}</div>
                        ${desc ? `<div class="fav-game-stats">${escapeHtml(desc)}</div>` : ''}
                    </div>
                </div>`;
        }).join('');
    };
});
