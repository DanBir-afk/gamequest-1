window.__gqParts.push(function() {
// ===== HOME PAGE LOGIC =====

// Hero CTA button - go to Quests
const heroStartBtn = document.getElementById('hero-start-btn');
if (heroStartBtn) {
    heroStartBtn.addEventListener('click', function() {
        // Check global currentUser at click time
        if (window.currentUser) {
            window.showPage('quests');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            if (typeof window.openAuthModal === 'function') {
                window.openAuthModal('register');
            }
        }
    });
}

// Season countdown — until end of August
function updateCountdown() {
    const now = new Date();
    // Target: end of current/next August
    let target = new Date(now.getFullYear(), 7, 31, 23, 59, 59); // 31 Aug this year
    if (now > target) {
        target = new Date(now.getFullYear() + 1, 7, 31, 23, 59, 59);
    }
    const diff = target - now;
    if (diff <= 0) return;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);

    const dEl = document.getElementById('cd-days');
    const hEl = document.getElementById('cd-hours');
    const mEl = document.getElementById('cd-mins');
    if (dEl) dEl.textContent = days;
    if (hEl) hEl.textContent = hours;
    if (mEl) mEl.textContent = mins;
}
updateCountdown();
setInterval(updateCountdown, 60000);

// FAQ accordion
document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', function() {
        const item = this.parentElement;
        const wasOpen = item.classList.contains('open');
        // Close others
        document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
        // Toggle this
        if (!wasOpen) item.classList.add('open');
    });
});

// Welcome card progress
function getWelcomeProgress() {
    const profileName = localStorage.getItem('gamequest_username');
    const profileBio = localStorage.getItem('gamequest_bio');
    const profileAvatar = localStorage.getItem('gamequest_avatar');
    const completedQuests = window.getCompletedQuests ? window.getCompletedQuests() : [];

    // Check if at least one custom friend was added (more than the default 5)
    const friendsList = document.getElementById('friends-list');
    const friendCount = friendsList ? friendsList.querySelectorAll('.friend-item:not(.pending-request)').length : 0;

    return {
        profile: !!(profileName && profileName !== 'DenBir') || !!(profileBio && profileBio.trim()),
        avatar: !!profileAvatar,
        quest: completedQuests.length > 0,
        friend: friendCount > 5
    };
}

function renderWelcomeProgress() {
    const progress = getWelcomeProgress();
    const pills = document.querySelectorAll('#welcome-steps .welcome-step-pill');
    let done = 0;

    pills.forEach(pill => {
        const key = pill.dataset.welcome;
        const isDone = progress[key];
        if (isDone) {
            pill.classList.add('done');
            pill.textContent = '✓ ' + pill.textContent.replace(/^[○✓]\s*/, '');
            done++;
        } else {
            pill.classList.remove('done');
            pill.textContent = '○ ' + pill.textContent.replace(/^[○✓]\s*/, '');
        }
    });

    const percent = (done / 4) * 100;
    const fillEl = document.getElementById('welcome-progress-fill');
    const textEl = document.getElementById('welcome-progress-text');
    if (fillEl) fillEl.style.width = percent + '%';
    if (textEl) textEl.textContent = `${done} / 4`;

    // Reward when all done
    if (done === 4 && !localStorage.getItem('gamequest_welcome_rewarded')) {
        localStorage.setItem('gamequest_welcome_rewarded', '1');
        window.addUserXP(100);
        window.addActivityLog('Welcome bonus earned (+100 XP)', 'achievement');
        window.showNotification('🎁 +100 XP for completing the welcome steps!', '#ffffff');
    }
}

// Welcome CTA - go to first uncompleted step
const welcomeCta = document.getElementById('welcome-cta');
if (welcomeCta) {
    welcomeCta.addEventListener('click', function() {
        // Guests need to register first
        if (!window.currentUser) {
            if (typeof window.openAuthModal === 'function') window.openAuthModal('register');
            return;
        }
        const progress = getWelcomeProgress();
        if (!progress.profile || !progress.avatar) {
            window.showPage('settings');
        } else if (!progress.quest) {
            window.showPage('quests');
        } else if (!progress.friend) {
            window.showPage('profile');
        } else {
            window.showPage('quests');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

renderWelcomeProgress();
// Re-check welcome progress periodically and when page becomes visible
setInterval(renderWelcomeProgress, 5000);

// Community buttons
const discordCard = document.getElementById('discord-card');
const telegramCard = document.getElementById('telegram-card');
if (discordCard) {
    discordCard.addEventListener('click', function() {
        window.showNotification('💬 Discord link coming soon!', '#ffffff');
    });
}
if (telegramCard) {
    telegramCard.addEventListener('click', function() {
        window.showNotification('✈️ Telegram link coming soon!', '#ffffff');
    });
}
// ===== HOME: Expand sections + tile clicks =====
document.querySelectorAll('.home-expand-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.target);
        if (!target) return;
        const isExpanded = target.classList.toggle('expanded');
        btn.textContent = isExpanded ? 'Collapse' : 'Show all';
    });
});

// Quest tiles → go to quests page
document.querySelectorAll('[data-quest-link]').forEach(tile => {
    tile.addEventListener('click', (e) => {
        e.preventDefault();
        if (!window.currentUser) {
            if (typeof window.openAuthModal === 'function') window.openAuthModal('register');
            return;
        }
        if (typeof window.showPage === 'function') window.showPage('quests');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// Showcase CTA
const showcaseCtaBtn = document.getElementById('showcase-cta-btn');
if (showcaseCtaBtn) {
    showcaseCtaBtn.addEventListener('click', () => {
        if (!window.currentUser) {
            if (typeof window.openAuthModal === 'function') window.openAuthModal('register');
            return;
        }
        if (typeof window.showPage === 'function') window.showPage('quests');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
// ===== END HOME =====


// ===== END HOME PAGE LOGIC =====
});
