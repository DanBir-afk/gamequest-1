window.__gqParts.push(function() {
// ===== QUEST GAME ENGINE =====
const questsData = Object.create(null);

async function loadQuestPack(questId) {
    const id = window.QuestLoader?.resolveCanonicalId(questId) || questId;
    if (questsData[id]) return questsData[id];
    if (!window.QuestLoader) return null;
    const pack = await window.QuestLoader.load(id);
    if (pack) questsData[id] = pack;
    return pack;
}

function migrateLegacyStorage() {
    const legacy = window.gamesManifest?.legacyIds || {};
    if (!Object.keys(legacy).length) return;

    const completedKey = playerStorageKey('completed');
    const saved = localStorage.getItem(completedKey);
    if (saved) {
        try {
            const list = JSON.parse(saved);
            if (Array.isArray(list)) {
                let changed = false;
                const migrated = list.map(entry => {
                    const questId = entry.questId || parseQuestRunKey(entry.id).questId;
                    const canonical = legacy[questId] || questId;
                    if (canonical !== questId) changed = true;
                    const difficulty = entry.difficulty || parseQuestRunKey(entry.id).difficulty;
                    return {
                        ...entry,
                        questId: canonical,
                        id: questRunKey(canonical, difficulty),
                    };
                });
                if (changed) localStorage.setItem(completedKey, JSON.stringify(migrated));
            }
        } catch (e) { /* ignore */ }
    }

    const aggs = getQuestRatingAggregates();
    let aggsChanged = false;
    Object.entries(legacy).forEach(([oldId, newId]) => {
        if (aggs[oldId]) {
            if (!aggs[newId]) aggs[newId] = { sum: 0, count: 0 };
            aggs[newId].sum += aggs[oldId].sum;
            aggs[newId].count += aggs[oldId].count;
            delete aggs[oldId];
            aggsChanged = true;
        }
    });
    if (aggsChanged) setQuestRatingAggregates(aggs);

    const userRatings = getUserQuestRatings();
    let ratingsChanged = false;
    Object.entries(legacy).forEach(([oldId, newId]) => {
        if (userRatings[oldId] != null) {
            if (userRatings[newId] == null) userRatings[newId] = userRatings[oldId];
            delete userRatings[oldId];
            ratingsChanged = true;
        }
    });
    if (ratingsChanged) setUserQuestRatings(userRatings);

    const statsKey = playerStorageKey('queststats');
    const statsRaw = localStorage.getItem(statsKey);
    if (statsRaw) {
        try {
            const stats = JSON.parse(statsRaw);
            let statsChanged = false;
            ['perfectIds', 'failedIds'].forEach(field => {
                if (!Array.isArray(stats[field])) return;
                stats[field] = stats[field].map(id => {
                    if (legacy[id]) {
                        statsChanged = true;
                        return legacy[id];
                    }
                    return id;
                });
            });
            if (statsChanged) localStorage.setItem(statsKey, JSON.stringify(stats));
        } catch (e) { /* ignore */ }
    }
}

migrateLegacyStorage();
const QUEST_DIFFICULTY_ORDER = ['easy', 'medium', 'hard'];
const QUEST_XP_BY_DIFFICULTY = { easy: 200, medium: 300, hard: 400 };
const QUEST_QUESTIONS_BY_DIFFICULTY = { easy: 5, medium: 10, hard: 15 };

function questRunKey(questId, difficulty) {
    return `${questId}::${difficulty}`;
}

function parseQuestRunKey(key) {
    if (!key || typeof key !== 'string') return { questId: key, difficulty: null };
    const idx = key.indexOf('::');
    if (idx === -1) return { questId: key, difficulty: null };
    return { questId: key.slice(0, idx), difficulty: key.slice(idx + 2) };
}

function buildQuestRun(questId, difficulty = 'medium') {
    const id = window.QuestLoader?.resolveCanonicalId(questId) || questId;
    const base = questsData[id];
    const pack = base?.difficulties?.[difficulty];
    if (!base || !pack) return null;
    return {
        id: id,
        difficulty,
        runKey: questRunKey(id, difficulty),
        title: base.title,
        subtitle: base.subtitle,
        emoji: base.emoji,
        description: base.description,
        xpReward: QUEST_XP_BY_DIFFICULTY[difficulty],
        questions: pack.questions,
    };
}

function isQuestRunCompleted(questId, difficulty) {
    const key = questRunKey(questId, difficulty);
    return getCompletedQuests().some(c => c.id === key);
}

function isQuestAnyDifficultyCompleted(questId) {
    return QUEST_DIFFICULTY_ORDER.some(d => isQuestRunCompleted(questId, d));
}

const questModal = document.getElementById('quest-modal');
const questModalTitle = document.getElementById('quest-modal-title');
const questModalSubtitle = document.getElementById('quest-modal-subtitle');
const questModalBody = document.getElementById('quest-modal-body');
const questModalClose = document.getElementById('quest-modal-close');

let currentQuest = null;
let currentQuestionIdx = 0;
let correctAnswers = 0;
let answeredCurrent = false;

let previewQuestId = null;
let previewPlayMode = 'solo';
let previewCoopInvite = null;
let previewCoopUnsub = null;
let previewCoopType = 'together';
let activeCoopInvite = null;
let lastLaunchedCoopId = null;
let dismissedCoopSessions = new Set();
let coopAutoLaunchBound = false;
let coopRaceListenerBound = false;
let coopTogetherListenerBound = false;
let raceDefeatShown = false;

const COMBO_STREAK_TARGET = 3;
let consecutiveCorrect = 0;
let pendingCombo = false;
let comboActiveThisQuestion = false;
let questXpEarned = 0;
let comboBonusXp = 0;

function playerStorageKey(key) {
    return window.currentUser?.id ? `gamequest_${window.currentUser.id}_${key}` : `gamequest_${key}`;
}

// ===== Rank badges (earned vs locked) =====
const RANK_ORDER = ['epic', 'warrior', 'grandmaster', 'master', 'elite'];

function isRankEarned(key, level, quests) {
    switch (key) {
        case 'epic': return true;                                 // Starting rank
        case 'warrior': return quests >= 10;                      // Completed 10 quests
        case 'grandmaster': return quests >= 50 && level >= 25;   // 50 quests and Lv 25+
        case 'master': return quests >= 100 && level >= 50;       // 100 quests and Lv 50+
        case 'elite': return level >= 100;                        // Season Top 100 (proxy)
        default: return false;
    }
}

// Toggle the "locked" (greyed) state on rank badges inside a scope element
function applyRankBadges(scope, stats) {
    if (!scope) return;
    const level = Number(stats && stats.level) || 0;
    const quests = Number(stats && stats.quests) || 0;
    RANK_ORDER.forEach(key => {
        const badge = scope.querySelector('.rank-badge.rank-' + key);
        if (!badge) return;
        badge.classList.toggle('locked', !isRankEarned(key, level, quests));
    });
}

// Best-effort: persist completed-quest count so other players' profiles can show ranks
async function saveQuestsCompletedRemote() {
    const client = typeof initSupabaseClient === 'function' ? initSupabaseClient() : supabaseClient;
    const user = window.currentUser;
    if (!client || !user) return;
    const count = getCompletedQuests().length;
    try {
        const { error } = await client.from('profiles').update({ quests_completed: count }).eq('user_id', user.id);
        if (error) throw error;
        if (window.currentProfile) window.currentProfile.quests_completed = count;
    } catch (e) {
        // Column may not exist yet — run supabase/ranks_setup.sql
    }
}

// Load completed quests from storage (per difficulty tier only)
function getCompletedQuests() {
    const saved = localStorage.getItem(playerStorageKey('completed'));
    if (!saved) return [];
    let list;
    try {
        list = JSON.parse(saved);
    } catch (e) {
        return [];
    }
    if (!Array.isArray(list)) return [];

    let changed = false;
    const normalized = [];
    const seen = new Set();

    for (const raw of list) {
        if (!raw?.id) {
            changed = true;
            continue;
        }
        // Drop legacy bare quest ids — they incorrectly marked medium as done
        if (!String(raw.id).includes('::')) {
            changed = true;
            continue;
        }
        const parsed = parseQuestRunKey(raw.id);
        const questId = raw.questId || parsed.questId;
        const difficulty = raw.difficulty || parsed.difficulty;
        if (!questId || !difficulty || !QUEST_DIFFICULTY_ORDER.includes(difficulty)) {
            changed = true;
            continue;
        }
        const entry = {
            ...raw,
            id: questRunKey(questId, difficulty),
            questId,
            difficulty,
        };
        if (seen.has(entry.id)) {
            changed = true;
            continue;
        }
        seen.add(entry.id);
        normalized.push(entry);
    }

    if (changed) {
        localStorage.setItem(playerStorageKey('completed'), JSON.stringify(normalized));
    }
    return normalized;
}

function saveCompletedQuest(questId, difficulty, xpEarned) {
    const key = questRunKey(questId, difficulty);
    const completed = getCompletedQuests();
    const existing = completed.find(c => c.id === key);
    const previousBest = existing ? (existing.xp || 0) : 0;
    const xpToAdd = Math.max(0, xpEarned - previousBest);
    if (existing) {
        existing.id = key;
        existing.questId = questId;
        existing.difficulty = difficulty;
        existing.xp = Math.max(existing.xp, xpEarned);
        existing.attempts = (existing.attempts || 1) + 1;
    } else {
        completed.push({ id: key, questId, difficulty, xp: xpEarned, attempts: 1, date: Date.now() });
    }
    localStorage.setItem(playerStorageKey('completed'), JSON.stringify(completed));
    return xpToAdd;
}

// ===== Quest ratings (community average, starts at 0) =====
const QUEST_RATINGS_AGG_KEY = 'gamequest_quest_rating_aggregates';

function getQuestRatingAggregates() {
    try {
        return JSON.parse(localStorage.getItem(QUEST_RATINGS_AGG_KEY) || '{}') || {};
    } catch (e) {
        return {};
    }
}

function setQuestRatingAggregates(aggregates) {
    localStorage.setItem(QUEST_RATINGS_AGG_KEY, JSON.stringify(aggregates || {}));
}

function getUserQuestRatings() {
    try {
        return JSON.parse(localStorage.getItem(playerStorageKey('quest_ratings')) || '{}') || {};
    } catch (e) {
        return {};
    }
}

function setUserQuestRatings(map) {
    localStorage.setItem(playerStorageKey('quest_ratings'), JSON.stringify(map || {}));
}

function getUserQuestRating(questId) {
    const rating = getUserQuestRatings()[questId];
    return typeof rating === 'number' ? rating : null;
}

function getQuestRatingStats(questId) {
    const entry = getQuestRatingAggregates()[questId];
    if (!entry || !entry.count) return { average: 0, count: 0 };
    return { average: entry.sum / entry.count, count: entry.count };
}

function formatQuestRatingLabel(average, count) {
    if (!count) return '0.0 ☆☆☆☆☆';
    const full = Math.min(5, Math.max(0, Math.round(average)));
    const stars = '⭐'.repeat(full) + '☆'.repeat(5 - full);
    return `${average.toFixed(1)} ${stars}`;
}

function applyLocalQuestRating(questId, rating) {
    const aggs = getQuestRatingAggregates();
    const entry = aggs[questId] || { sum: 0, count: 0 };
    const prev = getUserQuestRating(questId);
    if (prev) {
        entry.sum = entry.sum - prev + rating;
    } else {
        entry.sum += rating;
        entry.count += 1;
    }
    aggs[questId] = entry;
    setQuestRatingAggregates(aggs);

    const userMap = getUserQuestRatings();
    userMap[questId] = rating;
    setUserQuestRatings(userMap);
}

async function saveQuestRatingRemote(questId, rating) {
    const client = typeof initSupabaseClient === 'function' ? initSupabaseClient() : (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
    const user = window.currentUser;
    if (!client || !user) return false;
    try {
        const { error } = await client.from('quest_ratings').upsert({
            quest_id: questId,
            user_id: user.id,
            rating,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'quest_id,user_id' });
        if (error) throw error;
        return true;
    } catch (e) {
        return false;
    }
}

async function fetchQuestRatingAggregates() {
    const client = typeof initSupabaseClient === 'function' ? initSupabaseClient() : (typeof supabaseClient !== 'undefined' ? supabaseClient : null);
    if (!client) return;
    try {
        const { data, error } = await client.from('quest_ratings').select('quest_id, rating');
        if (error) throw error;
        if (!Array.isArray(data)) return;
        const aggs = {};
        data.forEach(row => {
            if (!row?.quest_id || !row.rating) return;
            if (!aggs[row.quest_id]) aggs[row.quest_id] = { sum: 0, count: 0 };
            aggs[row.quest_id].sum += row.rating;
            aggs[row.quest_id].count += 1;
        });
        setQuestRatingAggregates(aggs);
    } catch (e) {
        // Table may not exist yet — run supabase/quest_ratings_setup.sql
    }
}

function updateQuestRatingDisplays() {
    document.querySelectorAll('.quest-card[data-quest-id]').forEach(card => {
        const el = card.querySelector('.quest-rating');
        if (!el) return;
        const questId = card.dataset.questId;
        const stats = getQuestRatingStats(questId);
        el.textContent = formatQuestRatingLabel(stats.average, stats.count);
        el.title = stats.count
            ? `${stats.count} ${stats.count === 1 ? 'rating' : 'ratings'}`
            : 'No ratings yet';
    });
}

function renderQuestRatingInputHtml(selected = 0) {
    return [1, 2, 3, 4, 5].map(n => (
        `<button type="button" class="quest-rate-star${n <= selected ? ' active' : ''}" data-rating="${n}" aria-label="${n} of 5">★</button>`
    )).join('');
}

function bindQuestRatingInput(container, onChange) {
    if (!container) return;
    let selected = 0;
    const stars = container.querySelectorAll('.quest-rate-star');
    const setSelected = (value) => {
        selected = value;
        stars.forEach(star => {
            const n = Number(star.dataset.rating);
            star.classList.toggle('active', n <= selected);
        });
        if (typeof onChange === 'function') onChange(selected);
    };
    stars.forEach(star => {
        star.addEventListener('click', (e) => {
            e.preventDefault();
            setSelected(Number(star.dataset.rating));
        });
    });
    return { getSelected: () => selected, setSelected };
}

async function submitQuestRating(questId, rating) {
    applyLocalQuestRating(questId, rating);
    await saveQuestRatingRemote(questId, rating);
    await fetchQuestRatingAggregates();
    updateQuestRatingDisplays();
}

// ===== Achievement-related quest stats =====
// Aggregated per-player stats used to award achievements
// (accuracy, attempts, daily streak, secret conditions).
function getQuestStats() {
    try { return JSON.parse(localStorage.getItem(playerStorageKey('queststats')) || '{}') || {}; }
    catch (e) { return {}; }
}

function recordQuestResult(questId, percent) {
    const s = getQuestStats();
    s.attempts = (s.attempts || 0) + 1;
    s.perfectIds = Array.isArray(s.perfectIds) ? s.perfectIds : [];
    s.failedIds = Array.isArray(s.failedIds) ? s.failedIds : [];

    // Comeback: previously failed (<40%) this quest, now aced it (100%)
    if (percent >= 100 && s.failedIds.indexOf(questId) !== -1) s.comeback = true;

    if (percent >= 100 && s.perfectIds.indexOf(questId) === -1) s.perfectIds.push(questId);
    if (percent < 40 && s.failedIds.indexOf(questId) === -1) s.failedIds.push(questId);

    // Night owl: played between 00:00 and 04:59
    const hr = new Date().getHours();
    if (hr >= 0 && hr < 5) s.nightOwl = true;

    // Daily streak (consecutive calendar days with at least one quest)
    const dayStr = new Date().toISOString().slice(0, 10);
    if (s.lastDay !== dayStr) {
        let consecutive = false;
        if (s.lastDay) {
            const diff = Math.round((new Date(dayStr) - new Date(s.lastDay)) / 86400000);
            consecutive = diff === 1;
        }
        s.streak = consecutive ? (s.streak || 0) + 1 : 1;
        s.lastDay = dayStr;
    }
    s.streakBest = Math.max(s.streakBest || 0, s.streak || 1);

    localStorage.setItem(playerStorageKey('queststats'), JSON.stringify(s));
    return s;
}

function bumpQuestStat(key, amount = 1) {
    if (!amount) return getQuestStats();
    const s = getQuestStats();
    s[key] = (s[key] || 0) + amount;
    localStorage.setItem(playerStorageKey('queststats'), JSON.stringify(s));
    renderQuestsSidebarStats();
    return s;
}

function recordCoopRaceWin() { bumpQuestStat('coopWins'); }
function recordCoopRaceLoss() { bumpQuestStat('coopLosses'); }
function recordCoopWithFriend() { bumpQuestStat('coopWithFriend'); }
function recordComboX2Bonus() { bumpQuestStat('comboX2'); }

function renderQuestsSidebarStats() {
    const root = document.getElementById('quests-stats-list');
    if (!root) return;

    const s = getQuestStats();
    const progress = typeof window.getProfileProgress === 'function'
        ? window.getProfileProgress(window.currentProfile)
        : window.getPlayerProgress(getUserXP());
    const xpLeft = Math.max(0, progress.xpForNext - progress.xpIntoLevel);
    const nextLevel = progress.level + 1;
    const fmt = (n) => Number(n || 0).toLocaleString('en-US');

    root.innerHTML = `
        <div class="quests-stat-row">
            <span class="quests-stat-label">Wins</span>
            <span class="quests-stat-value">${fmt(s.coopWins)}</span>
        </div>
        <div class="quests-stat-row">
            <span class="quests-stat-label">Losses</span>
            <span class="quests-stat-value">${fmt(s.coopLosses)}</span>
        </div>
        <div class="quests-stat-row">
            <span class="quests-stat-label">With friend</span>
            <span class="quests-stat-value">${fmt(s.coopWithFriend)}</span>
        </div>
        <div class="quests-stat-row">
            <span class="quests-stat-label">x2 bonuses</span>
            <span class="quests-stat-value">${fmt(s.comboX2)}</span>
        </div>
        <div class="quests-stat-divider"></div>
        <div class="quests-stat-level">
            <div class="quests-stat-level-title">To level ${nextLevel}</div>
            <div class="quests-stat-xp-left">${fmt(xpLeft)} XP left</div>
            <div class="quests-stat-progress-bar">
                <div class="quests-stat-progress-fill" style="width:${progress.percent}%"></div>
            </div>
            <div class="quests-stat-xp-sub">${fmt(progress.xpIntoLevel)} / ${fmt(progress.xpForNext)} XP</div>
        </div>`;
}

function getTotalQuestCount() {
    const manifest = window.gamesManifest?.games || [];
    const withQuest = manifest.filter(g => g.hasQuest !== false).length;
    return withQuest || Object.keys(questsData).length;
}

function getUserXP() {
    return typeof window.getProfileXp === 'function'
        ? window.getProfileXp(window.currentProfile)
        : 0;
}

async function savePlayerProgressToSupabase(totalXp) {
    const client = typeof initSupabaseClient === 'function' ? initSupabaseClient() : supabaseClient;
    let user = window.currentUser;
    if (client?.auth?.getUser) {
        try {
            const { data } = await client.auth.getUser();
            if (data?.user) user = data.user;
        } catch (err) {
            console.warn('Could not confirm Supabase user:', err);
        }
    }
    if (!client || !user) return false;

    const progress = window.getPlayerProgress(totalXp);
    const payload = {
        xp: progress.xp,
        level: progress.level
    };

    try {
        const { data, error } = await client
            .from('profiles')
            .update(payload)
            .eq('user_id', user.id)
            .select('xp, level')
            .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error('No profile row was updated. Check user_id and RLS update policy.');
        window.currentProfile = { ...window.currentProfile, ...payload, ...data };
        return true;
    } catch (updateError) {
        console.warn('Profile XP update failed, trying upsert:', updateError);
    }

    try {
        const username = window.currentProfile?.username || user.user_metadata?.username || user.email.split('@')[0];
        const { data, error } = await client
            .from('profiles')
            .upsert(
                { user_id: user.id, username, ...payload },
                { onConflict: 'user_id' }
            )
            .select('xp, level')
            .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error('No profile row was upserted. Check insert policy and user_id unique constraint.');
        window.currentProfile = { ...window.currentProfile, username, ...payload, ...data };
        return true;
    } catch (upsertError) {
        console.error('Could not save XP to Supabase:', upsertError);
        if (typeof showNotification === 'function') {
            window.showNotification('Could not save XP to Supabase. Check profiles table and RLS policies.', '#6b7280');
        }
    }

    return false;
}

async function addUserXP(amount) {
    if (!window.currentUser || !window.currentProfile) return getUserXP();

    const current = getUserXP();
    const newXP = current + Math.max(0, Number(amount) || 0);
    const saved = await savePlayerProgressToSupabase(newXP);
    if (saved) {
        await saveQuestsCompletedRemote();
        updateProfileXP();
        if (window.Achievements && typeof window.Achievements.evaluate === 'function') {
            window.Achievements.evaluate({ notify: false });
        }
    }
    return getUserXP();
}

function updateProfileXP() {
    const progress = typeof window.getProfileProgress === 'function'
        ? window.getProfileProgress(window.currentProfile)
        : window.getPlayerProgress(0);
    const { xp, level, xpIntoLevel, xpForNext, percent } = progress;
    const profileLevelEl = document.querySelector('.profile-level');
    if (profileLevelEl) {
        profileLevelEl.textContent = `Level: ${level}`;
    }
    const profileXpEl = document.querySelector('.profile-xp');
    if (profileXpEl) {
        profileXpEl.textContent = `XP: ${progress.xpIntoLevel.toLocaleString('en-US')} XP / ${progress.xpForNext.toLocaleString('en-US')} XP`;
    }
    if (typeof window.syncProfileDevBadge === 'function') {
        const name = window.currentProfile?.username || document.getElementById('username')?.value;
        window.syncProfileDevBadge(name);
    }
    const fillEls = document.querySelectorAll('.profile-header .progress-fill');
    fillEls.forEach(el => { el.style.width = `${percent}%`; });
    if (typeof updateHeaderPlayerStats === 'function') {
        updateHeaderPlayerStats(window.currentProfile || { xp, level }, !!window.currentUser);
    }
    const questsDone = (typeof getCompletedQuests === 'function') ? getCompletedQuests().length : 0;
    applyRankBadges(document.getElementById('profile-page'), { level, quests: questsDone });
    renderQuestsSidebarStats();
}

function playComboSound() {
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        const ctx = new Ctx();
        const playTone = (freq, start, dur, vol) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(vol, ctx.currentTime + start);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + start);
            osc.stop(ctx.currentTime + start + dur);
        };
        playTone(523.25, 0, 0.1, 0.12);
        playTone(659.25, 0.08, 0.1, 0.12);
        playTone(783.99, 0.16, 0.22, 0.14);
        setTimeout(() => ctx.close(), 500);
    } catch (e) {}
}

function showComboBurst() {
    const burst = document.createElement('div');
    burst.className = 'quest-combo-burst';
    burst.innerHTML = `
        <span class="quest-combo-burst-icon" aria-hidden="true">🔥</span>
        <span class="quest-combo-burst-text">COMBO!</span>
        <span class="quest-combo-burst-sub">x2 XP on next question</span>`;
    if (questModalBody) {
        questModalBody.appendChild(burst);
        requestAnimationFrame(() => burst.classList.add('show'));
        setTimeout(() => burst.remove(), 1900);
    }
    playComboSound();
}

function resetComboState() {
    consecutiveCorrect = 0;
    pendingCombo = false;
    comboActiveThisQuestion = false;
    questXpEarned = 0;
    comboBonusXp = 0;
}

function getQuestionBaseXp() {
    if (!currentQuest || !currentQuest.questions.length) return 0;
    return currentQuest.xpReward / currentQuest.questions.length;
}

function comboStreakHtml() {
    if (comboActiveThisQuestion) {
        return '<span class="quest-combo-badge">x2 XP</span>';
    }
    if (consecutiveCorrect > 0) {
        return `<span class="quest-combo-streak">🔥 ${consecutiveCorrect}/${COMBO_STREAK_TARGET}</span>`;
    }
    return '';
}

const DIFFICULTY_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
const DURATION_LABELS = { short: '< 15 min', medium: '15–30 min', long: '> 30 min' };

function formatDifficulty(key) {
    return DIFFICULTY_LABELS[key] || (key ? key.charAt(0).toUpperCase() + key.slice(1) : 'Medium');
}

function formatDuration(key) {
    return DURATION_LABELS[key] || key || '—';
}

function getQuestCardMeta(questId) {
    if (window.QuestCards?.getGameMeta) {
        return window.QuestCards.getGameMeta(questId);
    }
    const card = document.querySelector(`.quest-card[data-quest-id="${questId}"]`);
    return {
        duration: card?.dataset.duration || 'medium',
        mode: card?.dataset.mode || 'solo',
    };
}

function getCompletedCountForQuest(questId) {
    return QUEST_DIFFICULTY_ORDER.filter(d => isQuestRunCompleted(questId, d)).length;
}

function renderPreviewDifficultyButtons(questId, selected) {
    return QUEST_DIFFICULTY_ORDER.map(d => {
        const done = isQuestRunCompleted(questId, d);
        const xp = QUEST_XP_BY_DIFFICULTY[d];
        const qCount = questsData[questId]?.difficulties?.[d]?.questions?.length || QUEST_QUESTIONS_BY_DIFFICULTY[d] || 0;
        return `<button type="button" class="quest-diff-btn${d === selected ? ' active' : ''}${done ? ' done' : ''}" data-diff="${d}">
            <span class="quest-diff-btn-label">${formatDifficulty(d)}</span>
            <span class="quest-diff-btn-meta">+${xp} XP · ${qCount} q.</span>
        </button>`;
    }).join('');
}

function escHtml(s) {
    const d = document.createElement('div');
    d.textContent = s == null ? '' : s;
    return d.innerHTML;
}

function getPreviewDifficulty() {
    return questModalBody.dataset.previewDifficulty || 'medium';
}

function isCoopLobbyGuest(invite) {
    const u = window.currentUser;
    return !!(invite && u && invite.guest_id === u.id);
}

function coopTypeLabel(type) {
    return window.CoopQuests?.coopTypeLabel(type) || 'Together';
}

function renderCoopTypeSection(invite) {
    const Coop = window.CoopQuests;
    const locked = invite && [
        Coop?.STATUS.PENDING,
        Coop?.STATUS.ACCEPTED,
        Coop?.STATUS.STARTED,
    ].includes(invite.status);
    const type = locked ? (invite.coop_type || previewCoopType) : previewCoopType;

    if (locked) {
        const desc = type === 'race'
            ? 'Who answers faster and more accurately'
            : 'Complete the quest together with a friend';
        return `<div class="coop-type-locked">
            <span class="coop-type-locked-label">Co-op type</span>
            <span class="coop-type-locked-value">${type === 'race' ? '🏁' : '🤝'} ${coopTypeLabel(type)}</span>
            <span class="coop-type-locked-desc">${desc}</span>
        </div>`;
    }

    return `<div class="coop-type-picker">
        <p class="coop-type-picker-title">Co-op type <span class="coop-host-only">(host chooses)</span></p>
        <div class="coop-type-options">
            <button type="button" class="coop-type-btn${type === 'race' ? ' active' : ''}" data-coop-type="race">
                <span class="coop-type-btn-title">🏁 Race</span>
                <span class="coop-type-btn-desc">Compete with a friend</span>
            </button>
            <button type="button" class="coop-type-btn${type === 'together' ? ' active' : ''}" data-coop-type="together">
                <span class="coop-type-btn-title">🤝 Together</span>
                <span class="coop-type-btn-desc">Play on the same team</span>
            </button>
        </div>
    </div>`;
}

function renderCoopFriendsPicker() {
    const friends = typeof window.getFriendsList === 'function' ? window.getFriendsList() : [];
    if (!window.currentUser) {
        return '<p class="coop-empty">Sign in to play Co-op</p>';
    }
    if (!friends.length) {
        return '<p class="coop-empty">Add friends in your profile to invite them to a quest</p>';
    }
    return `<div class="coop-friends-list">${friends.map(f => {
        const online = typeof window.Presence?.isOnline === 'function' && window.Presence.isOnline(f);
        const statusLabel = online ? 'online' : 'offline';
        const statusClass = online ? 'is-online' : 'is-offline';
        return `
        <button type="button" class="coop-friend-btn" data-user-id="${f.user_id}">
            <span class="coop-friend-name">${escHtml(f.username)}</span>
            <span class="coop-friend-meta coop-friend-presence ${statusClass}">${statusLabel} · Lv ${f.level || 0}</span>
            <span class="coop-friend-action">Invite</span>
        </button>`;
    }).join('')}</div>`;
}

function getMyCoopDisplayName() {
    return window.currentProfile?.username
        || window.currentUser?.user_metadata?.username
        || window.currentUser?.email?.split('@')[0]
        || 'You';
}

function renderCoopLobbyRoster(invite) {
    const Coop = window.CoopQuests;
    if (!invite || !Coop) return '';

    const u = window.currentUser;
    const isHost = u && invite.host_id === u.id;
    const partner = Coop.partnerProfile(invite);
    const myName = escHtml(getMyCoopDisplayName());
    const partnerName = escHtml(partner?.username || 'Friend');
    const hostName = isHost ? myName : partnerName;
    const guestName = isHost ? partnerName : myName;

    const guestStatus = invite.status === Coop.STATUS.PENDING
        ? 'waiting'
        : 'in lobby';

    return `<div class="coop-lobby-roster">
        <p class="coop-lobby-title">Lobby</p>
        <div class="coop-lobby-members">
            <div class="coop-lobby-member coop-lobby-host">
                <span class="coop-lobby-role">Host</span>
                <span class="coop-lobby-name">${hostName}</span>
                <span class="coop-lobby-badge">in lobby</span>
            </div>
            <div class="coop-lobby-member coop-lobby-guest">
                <span class="coop-lobby-role">Friend</span>
                <span class="coop-lobby-name">${guestName}</span>
                <span class="coop-lobby-badge coop-lobby-badge-${guestStatus === 'in lobby' ? 'in' : 'wait'}">${guestStatus}</span>
            </div>
        </div>
    </div>`;
}

function getFreshPreviewInvite(questId) {
    const Coop = window.CoopQuests;
    if (!Coop) return null;
    return Coop.getLobbyInviteForQuest(questId);
}

function renderCoopStatus(invite, questId) {
    const Coop = window.CoopQuests;
    if (!invite || !Coop) {
        const stale = questId && Coop?.getActiveInviteForQuest(questId, true);
        const showReset = stale && !Coop.getLobbyInviteForQuest(questId);
        const resetBtn = showReset
            ? '<button type="button" class="coop-reset-btn">Reset lobby</button>'
            : '';
        return `<p class="coop-hint">Pick a friend and send an invite</p>${resetBtn}`;
    }
    const partner = Coop.partnerProfile(invite);
    const name = escHtml(partner?.username || 'friend');
    const u = window.currentUser;
    const isHost = u && invite.host_id === u.id;

    if (invite.status === Coop.STATUS.PENDING) {
        if (isHost) {
            return `<div class="coop-status coop-status-pending">
                <p>⏳ Waiting for <strong>${name}</strong> to accept the invite. The quest will start automatically.</p>
                <button type="button" class="coop-cancel-btn">Cancel invite</button>
            </div>`;
        }
        return `<div class="coop-status coop-status-pending">
            <p>⏳ Accept the invite in the notification above</p>
        </div>`;
    }
    if (invite.status === Coop.STATUS.DECLINED) {
        return '<p class="coop-status coop-status-declined">Friend declined the invite. Pick someone else.</p>';
    }
    if (invite.status === Coop.STATUS.ACCEPTED || invite.status === Coop.STATUS.STARTED) {
        return `<div class="coop-status coop-status-started">
            <p>▶ Everyone is in — starting the quest for both players...</p>
        </div>`;
    }
    return '';
}

function updatePreviewStartButton(questId) {
    const startBtn = questModalBody.querySelector('.quest-preview-start');
    if (!startBtn) return;
    const Coop = window.CoopQuests;
    const diff = getPreviewDifficulty();

    if (previewPlayMode === 'solo') {
        startBtn.disabled = false;
        startBtn.textContent = '▶ Start';
        startBtn.dataset.difficulty = diff;
        return;
    }

    const invite = getFreshPreviewInvite(questId);
    previewCoopInvite = invite;

    const u = window.currentUser;
    const isHost = u && invite && invite.host_id === u.id;
    const isGuest = u && invite && invite.guest_id === u.id;

    startBtn.disabled = true;
    if (!invite) {
        startBtn.textContent = 'Invite a friend';
    } else if (invite.status === Coop.STATUS.PENDING) {
        startBtn.textContent = 'Waiting for friend in lobby...';
    } else if (invite.status === Coop.STATUS.ACCEPTED || invite.status === Coop.STATUS.STARTED) {
        startBtn.textContent = 'Starting quest...';
    } else {
        startBtn.textContent = 'Invite a friend';
    }
}

function renderPreviewCoopPanel(questId) {
    const panel = questModalBody?.querySelector('.quest-preview-coop');
    if (!panel) return;

    const Coop = window.CoopQuests;
    previewCoopInvite = getFreshPreviewInvite(questId);
    const invite = previewCoopInvite;

    const typeEl = panel.querySelector('.coop-type-wrap');
    if (typeEl) typeEl.innerHTML = renderCoopTypeSection(invite);

    const statusEl = panel.querySelector('.coop-status-wrap');
    if (statusEl) statusEl.innerHTML = renderCoopStatus(invite, questId);

    const friendsEl = panel.querySelector('.coop-friends-wrap');
    const u = window.currentUser;
    const isGuest = !!(invite && u && invite.guest_id === u.id);
    const isHost = !!(invite ? (u && invite.host_id === u.id) : u);
    if (friendsEl) {
        const showPicker = isHost && (!invite || invite.status === Coop?.STATUS.DECLINED);
        const showRoster = invite && invite.status !== Coop?.STATUS.DECLINED;
        if (showPicker) {
            friendsEl.innerHTML = renderCoopFriendsPicker();
            friendsEl.style.display = '';
        } else if (showRoster) {
            friendsEl.innerHTML = renderCoopLobbyRoster(invite);
            friendsEl.style.display = '';
        } else {
            friendsEl.innerHTML = '';
            friendsEl.style.display = 'none';
        }
    }

    applyCoopLobbyLocks(questId, invite);

    const coopTypeStatEl = questModalBody.querySelector('.quest-preview-coop-type-value');
    if (coopTypeStatEl && previewPlayMode === 'coop') {
        coopTypeStatEl.textContent = coopTypeLabel(invite?.coop_type || previewCoopType);
    }

    updatePreviewStartButton(questId);
}

function applyCoopLobbyLocks(questId, invite) {
    const guest = isCoopLobbyGuest(invite);
    const locked = guest || (invite && [
        window.CoopQuests?.STATUS.PENDING,
        window.CoopQuests?.STATUS.ACCEPTED,
        window.CoopQuests?.STATUS.STARTED,
    ].includes(invite.status));

    questModalBody.querySelectorAll('.quest-mode-btn').forEach(btn => {
        btn.disabled = guest;
    });

    questModalBody.querySelectorAll('.quest-diff-btn').forEach(btn => {
        btn.disabled = locked;
        btn.classList.toggle('locked', locked);
    });

    const diffHint = questModalBody.querySelector('.quest-preview-diff-hint');
    if (diffHint) {
        diffHint.textContent = guest
            ? 'The host chose the difficulty.'
            : locked
                ? 'Difficulty is locked for this lobby.'
                : 'Choose difficulty: easy — 5 questions, medium — 10, hard — 15.';
    }

    const coopTypeEl = questModalBody.querySelector('.coop-type-wrap');
    if (coopTypeEl) {
        coopTypeEl.classList.toggle('guest-locked', guest);
    }
}

async function refreshPreviewCoopPanel(questId) {
    if (window.CoopQuests?.cleanupStaleHostSessions) {
        await window.CoopQuests.cleanupStaleHostSessions(questId);
    }
    if (window.CoopQuests?.loadInvites) {
        await window.CoopQuests.loadInvites();
    }
    renderPreviewCoopPanel(questId);
}

let coopDelegationBound = false;

function ensureCoopDelegation() {
    if (coopDelegationBound || !questModalBody) return;
    coopDelegationBound = true;

    questModalBody.addEventListener('click', async (e) => {
        const typeBtn = e.target.closest('.coop-type-btn');
        if (typeBtn && previewQuestId) {
            const Coop = window.CoopQuests;
            const invite = getFreshPreviewInvite(previewQuestId);
            if (invite && invite.status !== Coop?.STATUS.DECLINED) return;
            e.preventDefault();
            e.stopPropagation();
            previewCoopType = typeBtn.dataset.coopType || 'together';
            renderPreviewCoopPanel(previewQuestId);
            return;
        }

        const friendBtn = e.target.closest('.coop-friend-btn');
        if (friendBtn && previewQuestId) {
            e.preventDefault();
            e.stopPropagation();
            const Coop = window.CoopQuests;
            const invite = getFreshPreviewInvite(previewQuestId);
            if (!Coop || friendBtn.disabled || (invite && invite.status !== Coop.STATUS.DECLINED)) return;

            friendBtn.disabled = true;
            try {
                const diff = getPreviewDifficulty();
                const sent = await Coop.sendInvite(
                    previewQuestId,
                    diff,
                    friendBtn.dataset.userId,
                    previewCoopType
                );
                if (sent) {
                    previewCoopInvite = sent;
                    previewCoopType = sent.coop_type || previewCoopType;
                    renderPreviewCoopPanel(previewQuestId);
                }
            } finally {
                friendBtn.disabled = false;
            }
            return;
        }

        const cancelBtn = e.target.closest('.coop-cancel-btn');
        if (cancelBtn && previewCoopInvite && previewQuestId) {
            e.preventDefault();
            e.stopPropagation();
            const Coop = window.CoopQuests;
            if (!Coop) return;
            await Coop.cancelInvite(previewCoopInvite.id);
            previewCoopInvite = null;
            renderPreviewCoopPanel(previewQuestId);
            return;
        }

        const resetBtn = e.target.closest('.coop-reset-btn');
        if (resetBtn && previewQuestId) {
            e.preventDefault();
            e.stopPropagation();
            const Coop = window.CoopQuests;
            if (!Coop?.resetHostLobby) return;
            await Coop.resetHostLobby(previewQuestId);
            previewCoopInvite = null;
            renderPreviewCoopPanel(previewQuestId);
        }
    });
}

function bindPreviewCoopHandlers(questId) {
    ensureCoopDelegation();

    questModalBody.querySelectorAll('.quest-mode-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            previewPlayMode = btn.dataset.mode;
            questModalBody.querySelectorAll('.quest-mode-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.mode === previewPlayMode);
            });
            const coopPanel = questModalBody.querySelector('.quest-preview-coop');
            if (coopPanel) coopPanel.classList.toggle('hidden', previewPlayMode !== 'coop');
            const modeEl = questModalBody.querySelector('.quest-preview-coop-type-value');
            if (modeEl) modeEl.textContent = previewPlayMode === 'coop' ? coopTypeLabel(previewCoopType) : 'Solo';
            if (previewPlayMode === 'coop' && window.CoopQuests?.cleanupStaleHostSessions) {
                await window.CoopQuests.cleanupStaleHostSessions(questId);
            }
            renderPreviewCoopPanel(questId);
        });
    });

    if (previewCoopUnsub) previewCoopUnsub();
    if (window.CoopQuests) {
        previewCoopUnsub = window.CoopQuests.onChange(() => {
            if (!previewQuestId || !questModal.classList.contains('active')) return;
            const invite = getFreshPreviewInvite(previewQuestId);
            if (invite) {
                previewCoopInvite = invite;
                previewCoopType = invite.coop_type || previewCoopType;
                if (previewPlayMode !== 'coop') {
                    previewPlayMode = 'coop';
                    questModalBody.querySelectorAll('.quest-mode-btn').forEach(b => {
                        b.classList.toggle('active', b.dataset.mode === 'coop');
                    });
                    const coopPanel = questModalBody.querySelector('.quest-preview-coop');
                    if (coopPanel) coopPanel.classList.remove('hidden');
                }
            }
            renderPreviewCoopPanel(previewQuestId);
        });
    }
}

function bindPreviewDifficultyHandlers(questId) {
    let selected = questModalBody.dataset.previewDifficulty || 'medium';
    const update = (diff) => {
        selected = diff;
        questModalBody.dataset.previewDifficulty = diff;
        const base = questsData[questId];
        const run = buildQuestRun(questId, diff);
        const meta = getQuestCardMeta(questId);
        if (!base || !run) return;

        questModalBody.querySelectorAll('.quest-diff-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.diff === diff);
            btn.classList.toggle('done', isQuestRunCompleted(questId, btn.dataset.diff));
        });
        const diffEl = questModalBody.querySelector('.quest-preview-difficulty-value');
        const xpEl = questModalBody.querySelector('.quest-preview-xp');
        const qEl = questModalBody.querySelector('.quest-preview-qcount');
        if (diffEl) {
            diffEl.className = `quest-preview-value quest-preview-difficulty quest-preview-difficulty-value quest-preview-difficulty-${diff}`;
            diffEl.textContent = formatDifficulty(diff);
        }
        if (xpEl) xpEl.textContent = `+${run.xpReward} XP`;
        if (qEl) qEl.textContent = String(run.questions.length);
        const startBtn = questModalBody.querySelector('.quest-preview-start');
        if (startBtn) startBtn.dataset.difficulty = diff;
        updatePreviewStartButton(questId);
    };

    questModalBody.querySelectorAll('.quest-diff-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (btn.disabled) return;
            update(btn.dataset.diff);
        });
    });

    const startBtn = questModalBody.querySelector('.quest-preview-start');
    if (startBtn) {
        startBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const diff = startBtn.dataset.difficulty || selected;
            if (previewPlayMode === 'coop') {
                return;
            }
            openQuest(questId, diff);
        });
    }
}

async function openQuestPreview(questId, initialDifficulty = 'medium', options = {}) {
    const id = window.QuestLoader?.resolveCanonicalId(questId) || questId;
    const quest = await loadQuestPack(id);
    const run = buildQuestRun(id, initialDifficulty);
    if (!quest || !run) return;
    const meta = getQuestCardMeta(id);
    const desc = quest.description || quest.subtitle || '';
    const doneCount = getCompletedCountForQuest(id);

    previewQuestId = id;
    previewPlayMode = 'solo';
    previewCoopType = 'together';
    previewCoopInvite = null;
    if (window.CoopQuests?.loadInvites) {
        await window.CoopQuests.loadInvites();
    }
    if (window.CoopQuests?.cleanupStaleHostSessions) {
        await window.CoopQuests.cleanupStaleHostSessions(id);
    }
    if (window.CoopQuests?.loadInvites) {
        await window.CoopQuests.loadInvites();
    }
    previewCoopInvite = options.coopInvite
        || window.CoopQuests?.getLobbyInviteForQuest(id)
        || window.CoopQuests?.getActiveInviteForQuest(id, false)
        || null;
    if (previewCoopInvite) {
        previewPlayMode = 'coop';
        previewCoopType = previewCoopInvite.coop_type || 'together';
        initialDifficulty = previewCoopInvite.difficulty || initialDifficulty;
    }

    const coopTypeStat = previewPlayMode === 'coop' ? coopTypeLabel(previewCoopType) : 'Solo';

    questModalTitle.textContent = quest.emoji + ' ' + quest.title;
    questModalSubtitle.textContent = quest.subtitle + (doneCount ? ` · completed ${doneCount}/3` : '');
    questModalBody.dataset.previewDifficulty = initialDifficulty;
    questModalBody.innerHTML = `
        <div class="quest-preview">
            <p class="quest-preview-desc">${desc}</p>
            <div class="quest-preview-mode">
                <button type="button" class="quest-mode-btn${previewPlayMode === 'solo' ? ' active' : ''}" data-mode="solo">Solo</button>
                <button type="button" class="quest-mode-btn${previewPlayMode === 'coop' ? ' active' : ''}" data-mode="coop">Co-op</button>
            </div>
            <div class="quest-preview-coop${previewPlayMode === 'coop' ? '' : ' hidden'}">
                <p class="coop-intro">Create a lobby: pick a Co-op type, difficulty, and invite a friend. The quest starts automatically when your friend joins.</p>
                <div class="coop-type-wrap">${renderCoopTypeSection(previewCoopInvite)}</div>
                <div class="coop-status-wrap">${renderCoopStatus(previewCoopInvite, id)}</div>
                <div class="coop-friends-wrap">${renderCoopFriendsPicker()}</div>
            </div>
            <p class="quest-preview-diff-hint">Choose difficulty: easy — 5 questions, medium — 10, hard — 15.</p>
            <div class="quest-preview-difficulties">${renderPreviewDifficultyButtons(id, initialDifficulty)}</div>
            <div class="quest-preview-stats">
                <div class="quest-preview-stat">
                    <span class="quest-preview-label">Difficulty</span>
                    <span class="quest-preview-value quest-preview-difficulty quest-preview-difficulty-value quest-preview-difficulty-${initialDifficulty}">${formatDifficulty(initialDifficulty)}</span>
                </div>
                <div class="quest-preview-stat">
                    <span class="quest-preview-label">Reward</span>
                    <span class="quest-preview-value quest-preview-xp">+${run.xpReward} XP</span>
                </div>
                <div class="quest-preview-stat">
                    <span class="quest-preview-label">Questions</span>
                    <span class="quest-preview-value quest-preview-qcount">${run.questions.length}</span>
                </div>
                <div class="quest-preview-stat">
                    <span class="quest-preview-label">Co-op</span>
                    <span class="quest-preview-value quest-preview-coop-type-value">${coopTypeStat}</span>
                </div>
            </div>
            <div class="quest-preview-actions">
                <button type="button" class="quest-preview-start" data-quest="${id}" data-difficulty="${initialDifficulty}">▶ Start</button>
            </div>
        </div>`;

    bindPreviewDifficultyHandlers(id);
    bindPreviewCoopHandlers(id);
    renderPreviewCoopPanel(id);
    questModal.classList.add('active');
}

function initQuestCardActions() {
    document.querySelectorAll('.quest-card[data-quest-id]').forEach(card => {
        const questId = card.dataset.questId;
        const info = card.querySelector('.quest-info');
        if (!info || info.querySelector('.quest-actions')) return;

        const actions = document.createElement('div');
        actions.className = 'quest-actions';

        const viewBtn = document.createElement('button');
        viewBtn.type = 'button';
        viewBtn.className = 'view-quest-btn';
        viewBtn.dataset.quest = questId;
        viewBtn.textContent = '👁 Preview';

        actions.appendChild(viewBtn);

        const meta = info.querySelector('.quest-meta');
        if (meta) meta.after(actions);
        else info.appendChild(actions);
    });
}

window.initQuestCardActions = initQuestCardActions;

async function openQuest(questId, difficulty = 'medium', options = {}) {
    const id = window.QuestLoader?.resolveCanonicalId(questId) || questId;
    await loadQuestPack(id);
    const run = buildQuestRun(id, difficulty);
    if (!run) {
        console.warn('openQuest: quest pack not ready', id, difficulty);
        return;
    }

    const coopInvite = options.coopInvite || null;
    if (coopInvite && window.CoopQuests) {
        const Coop = window.CoopQuests;
        activeCoopInvite = Coop.getInvite(coopInvite.id) || coopInvite;
        if (activeCoopInvite?.id) lastLaunchedCoopId = activeCoopInvite.id;
    } else {
        activeCoopInvite = null;
    }

    currentQuest = run;
    currentQuest.coopInvite = activeCoopInvite;
    currentQuestionIdx = 0;
    correctAnswers = 0;
    answeredCurrent = false;
    resetComboState();

    if (activeCoopInvite && window.CoopQuests?.isTogetherInvite(activeCoopInvite)) {
        currentQuestionIdx = activeCoopInvite.together_q_idx || 0;
        correctAnswers = activeCoopInvite.together_correct || 0;
    }

    questModalTitle.textContent = currentQuest.emoji + ' ' + currentQuest.title;
    let subtitle = currentQuest.subtitle + ' · ' + formatDifficulty(difficulty);
    if (activeCoopInvite && window.CoopQuests) {
        const partner = window.CoopQuests.partnerProfile(activeCoopInvite);
        const typeLabel = coopTypeLabel(activeCoopInvite.coop_type);
        if (partner?.username) subtitle += ' · Co-op with ' + partner.username;
        subtitle += ' · ' + typeLabel;
    }
    questModalSubtitle.textContent = subtitle;
    questModal.classList.add('active');
    raceDefeatShown = false;
    if (currentQuestionIdx >= currentQuest.questions.length) {
        showResults();
    } else {
        renderQuestion();
    }
}

function isActiveTogetherCoop() {
    const inv = currentQuest?.coopInvite;
    return !!(inv && window.CoopQuests?.isTogetherInvite(inv));
}

function getCoopInviteFresh() {
    const id = currentQuest?.coopInvite?.id;
    return id ? window.CoopQuests?.getInvite(id) : null;
}

function applyTogetherPick(pick) {
    if (!pick || pick.qIdx !== currentQuestionIdx || answeredCurrent) return;
    answerQuestion(pick.selectedIdx, { fromPartner: true, partnerName: pick.username });
}

function checkCoopTogetherSync() {
    if (!currentQuest?.coopInvite || !window.CoopQuests?.isTogetherInvite(currentQuest.coopInvite)) return;

    const inv = getCoopInviteFresh();
    if (!inv || inv.status !== window.CoopQuests.STATUS.STARTED) return;

    const total = currentQuest.questions.length;
    const serverQ = inv.together_q_idx ?? 0;

    if (serverQ >= total) {
        if (currentQuestionIdx < total) showResults();
        return;
    }

    if (inv.together_pick?.qIdx === currentQuestionIdx && !answeredCurrent) {
        applyTogetherPick(inv.together_pick);
        return;
    }

    if (serverQ !== currentQuestionIdx) {
        currentQuestionIdx = serverQ;
        correctAnswers = inv.together_correct ?? correctAnswers;
        answeredCurrent = false;
        renderQuestion();
        if (inv.together_pick?.qIdx === currentQuestionIdx) {
            applyTogetherPick(inv.together_pick);
        }
    }
}

function showRaceDefeatByPartner(invite) {
    if (raceDefeatShown || !invite || !window.CoopQuests) return;
    raceDefeatShown = true;
    recordCoopRaceLoss();
    recordCoopWithFriend();

    const partner = window.CoopQuests.partnerProfile(invite);
    const name = escHtml(partner?.username || 'Friend');
    const scoreTxt = invite.winner_correct != null && invite.winner_total != null
        ? ` (${invite.winner_correct} of ${invite.winner_total} correct)`
        : '';

    questModalBody.innerHTML = `
        <div class="coop-race-defeat">
            <div class="coop-race-defeat-icon">🏁</div>
            <h3 class="coop-race-defeat-title">${name} won!</h3>
            <p class="coop-race-defeat-text">Your friend finished the quest faster than you${scoreTxt}.</p>
            <button type="button" class="quest-results-btn quest-finish-btn" id="coop-race-defeat-close">Close</button>
        </div>`;

    document.getElementById('coop-race-defeat-close')?.addEventListener('click', () => {
        raceDefeatShown = false;
        closeQuest();
    });
}

function checkCoopRaceDefeat() {
    if (raceDefeatShown || !currentQuest?.coopInvite || !window.CoopQuests) return;

    const Coop = window.CoopQuests;
    const inv = Coop.getInvite(currentQuest.coopInvite.id);
    if (!inv || !Coop.isRaceInvite(inv)) return;
    if (inv.status !== Coop.STATUS.COMPLETED) return;

    const u = window.currentUser;
    if (!u || inv.winner_id === u.id) return;

    showRaceDefeatByPartner(inv);
}

async function closeQuest() {
    const wasPreview = !currentQuest;
    const closingCoop = currentQuest?.coopInvite || previewCoopInvite;
    const closingCoopId = closingCoop?.id;
    const Coop = window.CoopQuests;

    if (closingCoopId) {
        dismissedCoopSessions.add(closingCoopId);
        lastLaunchedCoopId = closingCoopId;
    }

    if (wasPreview && previewCoopInvite && Coop) {
        const inv = Coop.getInvite(previewCoopInvite.id);
        if (inv?.status === 'pending') {
            await Coop.cancelInvite(previewCoopInvite.id, true);
        }
    }

    if (previewCoopUnsub) {
        previewCoopUnsub();
        previewCoopUnsub = null;
    }
    previewCoopInvite = null;
    previewQuestId = null;
    previewPlayMode = 'solo';
    activeCoopInvite = null;
    questModal.classList.remove('active');
    currentQuest = null;
    raceDefeatShown = false;
}

function renderQuestion() {
    const q = currentQuest.questions[currentQuestionIdx];
    const total = currentQuest.questions.length;
    const progress = ((currentQuestionIdx) / total) * 100;
    answeredCurrent = false;

    comboActiveThisQuestion = pendingCombo;
    if (pendingCombo) pendingCombo = false;

    const comboHtml = comboStreakHtml();
    const togetherHint = isActiveTogetherCoop()
        ? '<p class="coop-together-play-hint">🤝 Together: one player\'s answer is visible to both — help each other</p>'
        : '';

    questModalBody.innerHTML = `
        <div class="quest-progress-info">
            <span>Question ${currentQuestionIdx + 1} of ${total}</span>
            <span class="quest-progress-meta">
                ${comboHtml}
                <span>Correct: ${correctAnswers}</span>
            </span>
        </div>
        ${togetherHint}
        <div class="quest-progress-bar">
            <div class="quest-progress-fill" style="width: ${progress}%"></div>
        </div>
        ${comboActiveThisQuestion ? '<div class="quest-combo-active-hint">Combo active — double XP for this question!</div>' : ''}
        <div class="quest-question">${q.q}</div>
        <div class="quest-options" id="quest-options">
            ${q.options.map((opt, i) => `
                <button class="quest-option" data-idx="${i}">${opt}</button>
            `).join('')}
        </div>
        <div class="quest-feedback" id="quest-feedback"></div>
        <button class="quest-next-btn" id="quest-next-btn">
            ${currentQuestionIdx + 1 < total ? 'Next Question →' : 'Finish Quest 🏆'}
        </button>
    `;

    // Attach answer handlers
    document.querySelectorAll('#quest-options .quest-option').forEach(btn => {
        btn.addEventListener('click', function() {
            if (answeredCurrent) return;
            answerQuestion(parseInt(this.dataset.idx, 10));
        });
    });

    document.getElementById('quest-next-btn').addEventListener('click', () => {
        nextQuestion();
    });

    if (isActiveTogetherCoop()) {
        checkCoopTogetherSync();
    }
}

async function answerQuestion(selectedIdx, options = {}) {
    const fromPartner = !!options.fromPartner;
    if (answeredCurrent && !fromPartner) return;

    if (isActiveTogetherCoop() && !fromPartner) {
        const inv = getCoopInviteFresh();
        if (inv?.together_pick?.qIdx === currentQuestionIdx) return;
    }

    answeredCurrent = true;
    const q = currentQuest.questions[currentQuestionIdx];
    const isCorrect = selectedIdx === q.correct;
    const baseXp = getQuestionBaseXp();
    const hadCombo = comboActiveThisQuestion;

    if (!fromPartner) {
        if (isCorrect) {
            correctAnswers++;
            consecutiveCorrect++;
            if (hadCombo) {
                questXpEarned += baseXp * 2;
                comboBonusXp += baseXp;
                recordComboX2Bonus();
            } else {
                questXpEarned += baseXp;
            }
            if (consecutiveCorrect >= COMBO_STREAK_TARGET) {
                pendingCombo = true;
                consecutiveCorrect = 0;
                showComboBurst();
            }
        } else {
            consecutiveCorrect = 0;
        }

        if (isActiveTogetherCoop() && currentQuest.coopInvite) {
            await window.CoopQuests.publishTogetherAnswer(
                currentQuest.coopInvite.id,
                currentQuestionIdx,
                selectedIdx,
                isCorrect,
                correctAnswers
            );
        }
    } else {
        const inv = getCoopInviteFresh();
        correctAnswers = inv?.together_correct ?? correctAnswers;
        if (isCorrect) {
            questXpEarned += baseXp;
        }
    }

    if (hadCombo) comboActiveThisQuestion = false;

    // Highlight answers
    document.querySelectorAll('#quest-options .quest-option').forEach((btn, i) => {
        btn.disabled = true;
        if (i === q.correct) {
            btn.classList.add('correct');
        } else if (i === selectedIdx && !isCorrect) {
            btn.classList.add('wrong');
        }
    });

    // Show feedback
    const feedback = document.getElementById('quest-feedback');
    let feedbackExtra = '';
    if (isCorrect && hadCombo) {
        feedbackExtra = '<br><span class="quest-combo-xp-note">+ double XP!</span>';
    }
    const partnerLead = fromPartner && options.partnerName
        ? `<span class="coop-together-help">🤝 <strong>${escHtml(options.partnerName)}</strong> picked an answer</span><br>`
        : '';
    feedback.className = 'quest-feedback show ' + (isCorrect ? 'correct-feedback' : 'wrong-feedback');
    feedback.innerHTML = `${partnerLead}<strong>${isCorrect ? '✓ Correct!' : '✗ Incorrect'}</strong>${feedbackExtra}<br>${q.explain}`;

    // Show next button
    document.getElementById('quest-next-btn').classList.add('show');

    // Update progress bar
    const total = currentQuest.questions.length;
    const progress = ((currentQuestionIdx + 1) / total) * 100;
    document.querySelector('.quest-progress-fill').style.width = progress + '%';
}

async function nextQuestion() {
    if (isActiveTogetherCoop() && currentQuest.coopInvite) {
        const inv = getCoopInviteFresh();
        if (!inv) return;
        const nextIdx = currentQuestionIdx + 1;
        const total = currentQuest.questions.length;
        await window.CoopQuests.advanceTogetherQuestion(inv.id, currentQuestionIdx, nextIdx);
        if (nextIdx >= total) {
            checkCoopTogetherSync();
        }
        return;
    }

    currentQuestionIdx++;
    if (currentQuestionIdx < currentQuest.questions.length) {
        renderQuestion();
    } else {
        showResults();
    }
}

async function showResults() {
    const total = currentQuest.questions.length;
    const percent = Math.round((correctAnswers / total) * 100);
    const xpEarned = Math.round(questXpEarned);

    let title, icon;
    if (percent === 100) {
        title = 'Perfect!';
        icon = '🏆';
    } else if (percent >= 70) {
        title = 'Great!';
        icon = '⭐';
    } else if (percent >= 40) {
        title = 'Not bad';
        icon = '👍';
    } else {
        title = 'Could be better';
        icon = '💪';
    }

    // Save progress
    const xpAwarded = saveCompletedQuest(currentQuest.id, currentQuest.difficulty || 'medium', xpEarned);

    let raceBanner = '';
    const coopInv = activeCoopInvite;
    if (coopInv && window.CoopQuests) {
        const Coop = window.CoopQuests;
        if (Coop.isRaceInvite(coopInv)) {
            const raceOutcome = await Coop.markRaceFinish(coopInv.id, correctAnswers, total);
            if (raceOutcome?.won) {
                title = 'Victory!';
                icon = '🏁';
                raceBanner = '<p class="coop-race-win-banner">You finished the quest faster than your friend!</p>';
                recordCoopRaceWin();
            } else {
                title = 'Friend was faster';
                icon = '🥈';
                const partner = Coop.partnerProfile(raceOutcome?.invite || coopInv);
                const wCorrect = raceOutcome?.winnerCorrect;
                const wTotal = raceOutcome?.winnerTotal;
                const scoreTxt = wCorrect != null && wTotal != null
                    ? ` (${wCorrect} of ${wTotal} correct)`
                    : '';
                raceBanner = `<p class="coop-race-loss-banner"><strong>${escHtml(partner?.username || 'Friend')}</strong> finished faster${scoreTxt}</p>`;
                recordCoopRaceLoss();
            }
            recordCoopWithFriend();
        } else {
            await Coop.markCompleted(coopInv.id);
            recordCoopWithFriend();
        }
        activeCoopInvite = null;
    }
    recordQuestResult(currentQuest.runKey, percent);
    const newXP = await addUserXP(xpAwarded);

    // Add to activity log
    window.addActivityLog(`Completed quest "${currentQuest.title}" (${correctAnswers}/${total})`, 'quest_complete');

    // Award any achievements unlocked by this result (with celebration popups)
    if (window.Achievements) window.Achievements.evaluate({ notify: true });

    questModalBody.innerHTML = `
        <div class="quest-results">
            ${raceBanner}
            <div class="quest-results-icon">${icon}</div>
            <div class="quest-results-title">${title}</div>
            <div class="quest-results-score">Correct answers: ${correctAnswers} of ${total} (${percent}%) · ${formatDifficulty(currentQuest.difficulty)}</div>
            <div class="quest-rewards">
                <div class="quest-reward-item">
                    <div class="quest-reward-label">XP Earned</div>
                    <div class="quest-reward-value">+${xpAwarded}</div>
                </div>
                <div class="quest-reward-item">
                    <div class="quest-reward-label">Accuracy</div>
                    <div class="quest-reward-value">${percent}%</div>
                </div>
                ${comboBonusXp > 0 ? `
                <div class="quest-reward-item quest-reward-combo">
                    <div class="quest-reward-label">Combo Bonus</div>
                    <div class="quest-reward-value">+${Math.round(comboBonusXp)}</div>
                </div>` : ''}
            </div>
            <div class="quest-rating-prompt">
                <div class="quest-rating-prompt-title">Rate this quest</div>
                <div class="quest-rating-prompt-desc">Your rating helps other players. Pick 1 to 5 stars.</div>
                <div class="quest-rating-input" id="quest-rating-input">${renderQuestRatingInputHtml(getUserQuestRating(currentQuest.id) || 0)}</div>
            </div>
            <div class="quest-results-actions">
                <button class="quest-results-btn quest-retry-btn" id="quest-retry">Try Again</button>
                <button class="quest-results-btn quest-finish-btn" id="quest-finish" disabled>Done</button>
            </div>
        </div>
    `;

    const finishBtn = document.getElementById('quest-finish');
    const ratingInput = document.getElementById('quest-rating-input');
    const priorRating = getUserQuestRating(currentQuest.id);
    const ratingControl = bindQuestRatingInput(ratingInput, (value) => {
        if (finishBtn) finishBtn.disabled = value < 1;
    });
    if (priorRating) {
        ratingControl.setSelected(priorRating);
        if (finishBtn) finishBtn.disabled = false;
    }

    document.getElementById('quest-retry').addEventListener('click', () => {
        openQuest(currentQuest.id, currentQuest.difficulty, { coopInvite: currentQuest.coopInvite });
    });

    finishBtn.addEventListener('click', async () => {
        const value = ratingControl.getSelected();
        if (value < 1) return;
        finishBtn.disabled = true;
        await submitQuestRating(currentQuest.id, value);
        closeQuest();
        markCompletedQuestCards();
    });

    // Mark card as completed
    markCompletedQuestCards();
}

function markCompletedQuestCards() {
    document.querySelectorAll('.quest-card[data-quest-id]').forEach(card => {
        const questId = card.dataset.questId;
        const doneCount = getCompletedCountForQuest(questId);
        const viewBtn = card.querySelector('.view-quest-btn');
        if (!viewBtn) return;
        if (doneCount >= 3) {
            viewBtn.classList.add('completed');
            viewBtn.textContent = '✓ All levels';
        } else if (doneCount > 0) {
            viewBtn.classList.remove('completed');
            viewBtn.textContent = `👁 Preview (${doneCount}/3)`;
        } else {
            viewBtn.classList.remove('completed');
            viewBtn.textContent = '👁 Preview';
        }
    });
}

// Wire up play buttons (delegated for dynamically placed buttons too)
document.addEventListener('click', function(e) {
    const viewBtn = e.target.closest('.view-quest-btn');
    if (viewBtn) {
        e.preventDefault();
        e.stopPropagation();
        completeStep('invite');
        openQuestPreview(viewBtn.dataset.quest).catch(() => {});
    }
});

initQuestCardActions();

// Modal close handlers
questModalClose.addEventListener('click', closeQuest);
questModal.addEventListener('click', function(e) {
    if (e.target === questModal) closeQuest();
});
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && questModal.classList.contains('active')) closeQuest();
});

// Initialize: mark completed quests and load XP
markCompletedQuestCards();
fetchQuestRatingAggregates().then(() => updateQuestRatingDisplays());
updateProfileXP();
renderQuestsSidebarStats();
// ===== END QUEST ENGINE =====

// ===== QUICK START =====
const quickStartBlock = document.getElementById('quick-start-block');
const qsSteps = document.querySelectorAll('.qs-step');
const qsProgressFill = document.getElementById('qs-progress-fill');
const qsProgressText = document.getElementById('qs-progress-text');
const qsReward = document.getElementById('qs-reward');
const qsResetBtn = document.getElementById('qs-reset-btn');

function quickStartKey() {
    return playerStorageKey('quickstart');
}

function getQuickStart() {
    const defaults = { mode: false, time: false, invite: false, rewarded: false, finished: false };
    const saved = localStorage.getItem(quickStartKey()) || localStorage.getItem('gamequest_quickstart');
    if (!saved) return { ...defaults };
    try {
        return { ...defaults, ...JSON.parse(saved) };
    } catch (e) {
        return { ...defaults };
    }
}

function saveQuickStart(state) {
    localStorage.setItem(quickStartKey(), JSON.stringify(state));
    localStorage.removeItem('gamequest_quickstart');
}

function isQuickStartFinished(state) {
    return !!(state && (state.finished || (state.mode && state.time && state.invite)));
}

function hideQuickStartBlock() {
    if (!quickStartBlock) return;
    quickStartBlock.classList.add('quick-start-hidden');
    quickStartBlock.setAttribute('aria-hidden', 'true');
}

function finishQuickStart(state) {
    if (!state.rewarded) {
        state.rewarded = true;
        addUserXP(50);
        window.addActivityLog('Quick Start completed (+50 XP)', 'achievement');
        window.showNotification('🎉 +50 XP for Quick Start!', '#ffffff');
    }
    state.finished = true;
    saveQuickStart(state);
    if (qsReward) qsReward.classList.add('show');
    setTimeout(hideQuickStartBlock, 2200);
}

function renderQuickStart() {
    const state = getQuickStart();
    if (!quickStartBlock) return;

    if (isQuickStartFinished(state)) {
        hideQuickStartBlock();
        return;
    }

    quickStartBlock.classList.remove('quick-start-hidden');
    quickStartBlock.removeAttribute('aria-hidden');

    let done = 0;
    qsSteps.forEach(step => {
        const key = step.dataset.step;
        if (state[key]) {
            step.classList.add('done');
            done++;
        } else {
            step.classList.remove('done');
        }
    });

    if (qsProgressFill) qsProgressFill.style.width = `${(done / 3) * 100}%`;
    if (qsProgressText) qsProgressText.textContent = `${done} / 3 steps`;
    if (qsResetBtn) qsResetBtn.style.display = done > 0 ? 'inline-block' : 'none';
    if (qsReward) qsReward.classList.remove('show');

    if (done === 3) finishQuickStart(state);
}

function completeStep(key) {
    const state = getQuickStart();
    if (state[key]) return; // Already done
    state[key] = true;
    saveQuickStart(state);
    renderQuickStart();
    window.showNotification('✓ Step complete!', '#ffffff');
}

// Helper: highlight element briefly
function highlightElement(el) {
    if (!el) return;
    el.style.transition = 'box-shadow 0.3s ease';
    el.style.boxShadow = '0 0 0 3px #ffffff, 0 0 20px rgba(255, 255, 255, 0.6)';
    el.style.borderRadius = '10px';
    setTimeout(() => {
        el.style.boxShadow = '';
    }, 2000);
}

// Step 1: Mode — scroll to mode filter (does not mark complete on click)
qsSteps[0].addEventListener('click', function() {
    const filters = document.querySelector('.quests-filters');
    if (!filters) return;
    filters.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const modeGroup = Array.from(filters.querySelectorAll('.filter-group')).find(g =>
        (g.querySelector('h4')?.textContent || '').trim().toLowerCase() === 'mode'
    );
    highlightElement(modeGroup || filters.querySelector('.filter-group'));
});

// Step 2: Category — scroll to category filter (does not mark complete on click)
qsSteps[1].addEventListener('click', function() {
    const filters = document.querySelector('.quests-filters');
    if (!filters) return;
    const categoryGroup = Array.from(filters.querySelectorAll('.filter-group')).find(g =>
        (g.querySelector('h4')?.textContent || '').trim().toLowerCase() === 'category'
    );
    const target = categoryGroup || filters.querySelector('.filter-group');
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        highlightElement(target);
    }
});

// Step 3: Start quest — scroll to quest cards (does not mark complete on click)
qsSteps[2].addEventListener('click', function() {
    const trending = document.querySelector('#trending-today-section, .trending-section');
    if (!trending) return;
    trending.scrollIntoView({ behavior: 'smooth', block: 'start' });
    highlightElement(trending.querySelector('.quest-card'));
});

function onQuestFilterChange(cb) {
    if (!cb.checked) return;
    if (cb.dataset.filter === 'mode') completeStep('mode');
    if (cb.dataset.filter === 'section') completeStep('time');
}

// Reset button (only while onboarding is in progress)
if (qsResetBtn) {
    qsResetBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        saveQuickStart({ mode: false, time: false, invite: false, rewarded: false, finished: false });
        renderQuickStart();
        window.showNotification('Quick Start reset', '#6b7280');
    });
}

// Initial render
renderQuickStart();
window.renderQuickStart = renderQuickStart;
// ===== END QUICK START =====

// ===== QUEST FILTERS & SEARCH =====
const questFilters = document.querySelectorAll('.quest-filter');
const questSearchInput = document.getElementById('quest-search-input');
const resetFiltersBtn = document.getElementById('reset-filters-btn');

const QUEST_SECTION_GRIDS = [
    { section: 'trending-today', gridId: 'trending-today-grid', countId: 'trending-today-count' },
    { section: 'popular', gridId: 'popular-grid', countId: 'popular-count' },
];

function getActiveFilters() {
    const filters = { mode: [], section: [], status: [] };
    questFilters.forEach(cb => {
        if (cb.checked) {
            filters[cb.dataset.filter].push(cb.value);
        }
    });
    return filters;
}

function questMatchesFilters(card, filters, search) {
    // Text search by title
    if (search) {
        const title = card.querySelector('.quest-title')?.textContent.toLowerCase() || '';
        if (!title.includes(search)) return false;
    }

    // Mode filter (if any checked, card must match one)
    if (filters.mode.length > 0) {
        const mode = card.dataset.mode;
        if (!mode || !filters.mode.includes(mode)) return false;
    }

    // Status (new vs completed)
    if (filters.status.length > 0) {
        const questId = card.dataset.questId;
        const isCompleted = questId && isQuestAnyDifficultyCompleted(questId);
        const wantNew = filters.status.includes('new');
        const wantCompleted = filters.status.includes('completed');
        if (wantNew && !wantCompleted && isCompleted) return false;
        if (wantCompleted && !wantNew && !isCompleted) return false;
        if (filters.status.includes('completed') && !filters.status.includes('new') && !questId) return false;
    }

    return true;
}

function applyQuestFilters() {
    const filters = getActiveFilters();
    const search = (questSearchInput?.value || '').trim().toLowerCase();

    const anyFilterActive =
        filters.mode.length || filters.section.length || filters.status.length || search;

    if (resetFiltersBtn) {
        resetFiltersBtn.style.display = anyFilterActive ? 'block' : 'none';
    }

    document.querySelectorAll('.quests-section[data-section]').forEach(sectionEl => {
        const sectionId = sectionEl.dataset.section;
        const sectionAllowed =
            filters.section.length === 0 || filters.section.includes(sectionId);
        sectionEl.classList.toggle('hidden', !sectionAllowed);
    });

    QUEST_SECTION_GRIDS.forEach(({ gridId, countId, section }) => {
        const grid = document.getElementById(gridId);
        if (!grid) return;

        const sectionHidden = grid.closest('.quests-section')?.classList.contains('hidden');
        if (sectionHidden) {
            grid.classList.remove('empty');
            const badge = document.getElementById(countId);
            if (badge) badge.textContent = '0';
            return;
        }

        const cards = grid.querySelectorAll('.quest-card');
        let visibleCount = 0;
        cards.forEach(card => {
            if (questMatchesFilters(card, filters, search)) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });

        grid.classList.toggle('empty', visibleCount === 0);
        const badge = document.getElementById(countId);
        if (badge) badge.textContent = String(visibleCount);
    });
}

function resetQuestFilters() {
    questFilters.forEach(cb => cb.checked = false);
    if (questSearchInput) questSearchInput.value = '';
    applyQuestFilters();
    window.showNotification('Filters reset', '#6b7280');
}

// Wire up events
questFilters.forEach(cb => cb.addEventListener('change', function() {
    onQuestFilterChange(this);
    applyQuestFilters();
}));
if (questSearchInput) {
    // Debounced search
    let searchTimer;
    questSearchInput.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(applyQuestFilters, 200);
    });
}
if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', resetQuestFilters);
}

// Re-apply filters when a quest is completed (so status filters update)
const originalSaveCompleted = saveCompletedQuest;
saveCompletedQuest = function(questId, difficulty, xpEarned) {
    const xpToAdd = originalSaveCompleted(questId, difficulty, xpEarned);
    applyQuestFilters();
    return xpToAdd;
};

// Initial state — cards rendered by QuestCards.init()
if (window.QuestCards) {
    window.QuestCards.init();
}
initQuestCardActions();
markCompletedQuestCards();
applyQuestFilters();
// ===== END QUEST FILTERS =====

async function tryLaunchCoopSession(invite) {
    const Coop = window.CoopQuests;
    if (!invite || !Coop || invite.status !== Coop.STATUS.STARTED) return;
    if (!Coop.isRecentSession(invite, 300)) return;
    if (dismissedCoopSessions.has(invite.id)) return;

    const u = window.currentUser;
    if (!u || (invite.host_id !== u.id && invite.guest_id !== u.id)) return;
    if (currentQuest?.coopInvite?.id === invite.id) return;

    const fresh = Coop.getInvite(invite.id) || invite;
    const questId = window.QuestLoader?.resolveCanonicalId(fresh.quest_id) || fresh.quest_id;
    await loadQuestPack(questId);

    lastLaunchedCoopId = fresh.id;
    previewCoopInvite = null;
    previewQuestId = null;
    await openQuest(fresh.quest_id, fresh.difficulty, { coopInvite: fresh });
}

function ensureCoopTogetherListener() {
    if (coopTogetherListenerBound || !window.CoopQuests) return;
    coopTogetherListenerBound = true;
    window.CoopQuests.onChange(() => {
        checkCoopTogetherSync();
    });
}

function ensureCoopRaceListener() {
    if (coopRaceListenerBound || !window.CoopQuests) return;
    coopRaceListenerBound = true;
    window.CoopQuests.onChange(() => {
        checkCoopRaceDefeat();
    });
}

function ensureCoopAutoLaunch() {
    if (coopAutoLaunchBound || !window.CoopQuests) return;
    coopAutoLaunchBound = true;
    ensureCoopRaceListener();
    ensureCoopTogetherListener();
    window.CoopQuests.onChange((invites) => {
        invites.forEach(inv => {
            if (![window.CoopQuests.STATUS.PENDING, window.CoopQuests.STATUS.ACCEPTED, window.CoopQuests.STATUS.STARTED].includes(inv.status)) {
                dismissedCoopSessions.delete(inv.id);
            }
        });
        if (window.CoopQuests.maybeAutoLaunchSessions) {
            window.CoopQuests.maybeAutoLaunchSessions();
        }
    });
}

window.tryLaunchCoopSession = tryLaunchCoopSession;
ensureCoopAutoLaunch();

    window.initQuestCardActions = initQuestCardActions;
    window.markCompletedQuestCards = markCompletedQuestCards;
    window.updateQuestRatingDisplays = updateQuestRatingDisplays;
    window.applyQuestFilters = applyQuestFilters;
    window.loadQuestPack = loadQuestPack;

    window.playerStorageKey = playerStorageKey;
    window.getCompletedQuests = getCompletedQuests;
    window.getUserXP = getUserXP;
    window.addUserXP = addUserXP;
    window.savePlayerProgressToSupabase = savePlayerProgressToSupabase;
    window.updateProfileXP = updateProfileXP;
    window.applyRankBadges = applyRankBadges;
    window.isRankEarned = isRankEarned;
    window.openQuest = openQuest;
    window.openQuestPreview = openQuestPreview;
    window.getQuestStats = getQuestStats;
    window.getTotalQuestCount = getTotalQuestCount;
    window.refreshQuestRatings = async function() {
        await fetchQuestRatingAggregates();
        updateQuestRatingDisplays();
    };

    if (window.Achievements && typeof window.Achievements.reloadPinnedForCurrentUser === 'function') {
        window.Achievements.reloadPinnedForCurrentUser();
    }
});
