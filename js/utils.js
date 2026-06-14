// Polyfill localStorage if it's blocked (private mode, opaque origins, etc.)
// This must run BEFORE DOMContentLoaded to prevent any uncaught SecurityErrors.
(function() {
    try {
        window.localStorage.setItem('__test', '1');
        window.localStorage.removeItem('__test');
    } catch (e) {
        console.warn('localStorage unavailable, using in-memory fallback');
        const mem = {};
        try {
            Object.defineProperty(window, 'localStorage', {
                configurable: true,
                value: {
                    getItem(k) { return mem[k] === undefined ? null : mem[k]; },
                    setItem(k, v) { mem[k] = String(v); },
                    removeItem(k) { delete mem[k]; },
                    clear() { for (const k in mem) delete mem[k]; },
                    key(i) { return Object.keys(mem)[i] || null; },
                    get length() { return Object.keys(mem).length; }
                }
            });
        } catch (e2) {
            // If we can't even redefine, individual try/catch in code will handle it
        }
    }
})();

// Helper function to show notifications
function showNotification(message, color) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${color};
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 2000);
}

function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

// Prevent background page scroll while a modal is open
let _scrollLock = 0;
let _scrollY = 0;
let _bodyPadRight = '';

function lockBodyScroll() {
    _scrollLock++;
    if (_scrollLock !== 1) return;
    _scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    _bodyPadRight = document.body.style.paddingRight;
    document.documentElement.classList.add('modal-scroll-lock');
    document.body.classList.add('modal-scroll-lock');
    document.body.style.paddingRight = gap > 0 ? gap + 'px' : '';
    document.body.style.top = `-${_scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.position = 'fixed';
}

function unlockBodyScroll() {
    if (_scrollLock <= 0) return;
    _scrollLock--;
    if (_scrollLock > 0) return;
    document.documentElement.classList.remove('modal-scroll-lock');
    document.body.classList.remove('modal-scroll-lock');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.paddingRight = _bodyPadRight;
    window.scrollTo(0, _scrollY);
}

window.lockBodyScroll = lockBodyScroll;
window.unlockBodyScroll = unlockBodyScroll;

window.__gqParts = [];

// Progressive leveling: each level costs more total XP.
// L1 = 1,000 | L2 = 2,500 total | L3 = 4,500 | L4 = 7,000 | L5 = 10,000 ...
// Per-level cost: 1,000 + 500 × (current level index), e.g. 1→2 needs +1,500 XP.
const LEVEL_XP_BASE = 1000;
const LEVEL_XP_STEP = 500;

function getXpRequirementForLevel(level) {
    const target = Math.max(1, Math.floor(level));
    return LEVEL_XP_BASE + LEVEL_XP_STEP * (target - 1);
}

function getTotalXpForLevel(level) {
    const L = Math.max(0, Math.floor(level));
    if (L === 0) return 0;
    return LEVEL_XP_BASE * L + (LEVEL_XP_STEP * L * (L - 1)) / 2;
}

function getLevelFromXp(totalXp) {
    const xp = Math.max(0, parseInt(totalXp, 10) || 0);
    let level = 0;
    while (getTotalXpForLevel(level + 1) <= xp) {
        level++;
        if (level > 9999) break;
    }
    return level;
}

function getPlayerProgress(totalXp) {
    const xp = Math.max(0, parseInt(totalXp, 10) || 0);
    const level = getLevelFromXp(xp);
    const xpAtLevelStart = getTotalXpForLevel(level);
    const xpForNext = getXpRequirementForLevel(level + 1);
    const xpIntoLevel = xp - xpAtLevelStart;
    return {
        xp,
        level,
        xpAtLevelStart,
        xpIntoLevel,
        xpForNext,
        xpToNextLevel: getTotalXpForLevel(level + 1),
        percent: xpForNext > 0 ? Math.min(100, (xpIntoLevel / xpForNext) * 100) : 100
    };
}

function getProfileXp(profile) {
    if (!profile) return 0;
    const xp = Number(profile.xp ?? profile.experience ?? profile.points);
    return Number.isFinite(xp) ? Math.max(0, Math.floor(xp)) : 0;
}

function getProfileLevel(profile) {
    if (!profile) return 0;
    const stored = profile.level ?? profile.lvl ?? profile.rank_level;
    if (stored !== undefined && stored !== null && stored !== '') {
        const level = Number(stored);
        if (Number.isFinite(level)) return Math.max(0, Math.floor(level));
    }
    return getLevelFromXp(getProfileXp(profile));
}

function getProfileProgress(profile) {
    const xp = getProfileXp(profile);
    const progress = getPlayerProgress(xp);
    return { ...progress, level: getProfileLevel(profile) };
}

window.getXpRequirementForLevel = getXpRequirementForLevel;
window.getTotalXpForLevel = getTotalXpForLevel;
window.getLevelFromXp = getLevelFromXp;
window.getPlayerProgress = getPlayerProgress;
window.getProfileXp = getProfileXp;
window.getProfileLevel = getProfileLevel;
window.getProfileProgress = getProfileProgress;

const DEVELOPER_USERNAMES = ['d.b.o.c'];
const DEVELOPER_BADGE_SVG = `<svg class="dev-badge" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="#0d1118"/><circle cx="16" cy="16" r="15" fill="none" stroke="#38bdf8" stroke-width="1"/><text x="16" y="13.5" text-anchor="middle" fill="#e5e7eb" font-size="7" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-weight="600">&lt;/&gt;</text><g transform="translate(16 19.5)" fill="none" stroke="#e5e7eb" stroke-width=".85"><circle r="2.1"/><circle r=".7" fill="#e5e7eb" stroke="none"/><path d="M0-2.8v1.1M0 1.7v1.1M-2.8 0h1.1M1.7 0h1.1" stroke-linecap="round"/></g></svg>`;

function developerBadgeMarkup() {
    return `<span class="dev-badge-wrap" title="Developer">${DEVELOPER_BADGE_SVG}</span>`;
}

function isDeveloperUsername(username) {
    const n = String(username || '').trim().toLowerCase();
    return DEVELOPER_USERNAMES.some(d => d.toLowerCase() === n);
}

function appendDeveloperBadge(parent) {
    const wrap = document.createElement('span');
    wrap.className = 'dev-badge-wrap';
    wrap.title = 'Developer';
    wrap.innerHTML = DEVELOPER_BADGE_SVG;
    parent.appendChild(wrap);
}

function displayNameHtml(username, fallback) {
    const raw = String(username || fallback || '?').trim();
    const name = escapeHtml(raw);
    if (!isDeveloperUsername(raw)) return name;
    return `${name}${developerBadgeMarkup()}`;
}

function mountPlainDisplayName(el, username, fallback) {
    if (!el) return;
    el.textContent = String(username || fallback || 'Player').trim();
}

function syncProfileDevBadge(username, root) {
    const scope = root && root.querySelector ? root : document;
    const slot = scope.querySelector('.profile-dev-badge');
    if (!slot) return;
    slot.innerHTML = '';
    if (!isDeveloperUsername(username)) {
        slot.hidden = true;
        return;
    }
    slot.hidden = false;
    slot.innerHTML = `<span class="dev-badge-wrap" title="Developer">${DEVELOPER_BADGE_SVG}</span>`;
}

function mountDisplayName(el, username, fallback) {
    if (!el) return;
    const raw = String(username || fallback || 'Player').trim();
    if (el.classList && el.classList.contains('profile-name')) {
        mountPlainDisplayName(el, raw);
        syncProfileDevBadge(raw, el.closest('#profile-page, #friend-page, .profile-header') || document.getElementById('profile-page'));
        return;
    }
    el.textContent = '';
    el.appendChild(document.createTextNode(raw));
    if (isDeveloperUsername(raw)) appendDeveloperBadge(el);
}

window.isDeveloperUsername = isDeveloperUsername;
window.displayNameHtml = displayNameHtml;
window.mountDisplayName = mountDisplayName;
window.mountPlainDisplayName = mountPlainDisplayName;
window.syncProfileDevBadge = syncProfileDevBadge;
