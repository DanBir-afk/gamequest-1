window.__gqParts.push(function () {
    // ===== REAL FRIENDS (Supabase) =====
    const friendsList = document.getElementById('friends-list');
    const addFriendBtn = document.getElementById('add-friend-btn');
    const friendNameInput = document.getElementById('friend-name-input');
    const addFriendContainer = document.querySelector('.add-friend-container');
    const viewAllFriendsBtn = document.getElementById('view-all-friends-btn');
    const friendsModal = document.getElementById('friends-modal');
    const closeFriendsModal = document.getElementById('close-friends-modal');
    const friendProfileView = document.getElementById('friend-profile-view');
    const friendProfileEmpty = document.querySelector('.friend-profile-empty');

    if (!friendsList) return; // profile page markup not present

    const AVATARS = ['⚔️', '🏹', '🗡️', '🛡️', '✨', '🔮', '⚡', '🎯', '🏆', '💎', '🌟', '🔥'];

    // ---- helpers ----
    function notify(message, color) {
        if (typeof window.showNotification === 'function') window.showNotification(message, color);
    }
    function client() {
        if (typeof window.supabaseClient !== 'undefined' && window.supabaseClient) return window.supabaseClient;
        if (typeof window.initSupabaseClient === 'function') return window.initSupabaseClient();
        return null;
    }
    function me() { return window.currentUser || null; }

    function hashStr(str) {
        let h = 0;
        for (let i = 0; i < String(str).length; i++) h = ((h << 5) - h + String(str).charCodeAt(i)) | 0;
        return Math.abs(h);
    }
    function avatarFor(profile) {
        if (profile && profile.avatar && /\p{Emoji}/u.test(profile.avatar)) return profile.avatar;
        const name = (profile && profile.username) || '?';
        return AVATARS[hashStr(name) % AVATARS.length];
    }
    function levelOf(profile) {
        const xp = Number(profile?.xp ?? profile?.experience ?? profile?.points ?? 0) || 0;
        const lvl = Number(profile?.level ?? profile?.lvl ?? 0) || 0;
        return lvl || Math.floor(xp / 1000);
    }
    function esc(s) {
        const d = document.createElement('div');
        d.textContent = s == null ? '' : s;
        return d.innerHTML;
    }

    // ---- pinned friends (local, per user) ----
    function pinKey() {
        const u = me();
        return u ? `gq_${u.id}_pinned_friends` : 'gq_pinned_friends';
    }
    function getPinned() {
        try { return new Set(JSON.parse(localStorage.getItem(pinKey()) || '[]')); }
        catch (e) { return new Set(); }
    }
    function savePinned(set) {
        try { localStorage.setItem(pinKey(), JSON.stringify(Array.from(set))); } catch (e) {}
    }

    // ---- state ----
    let friends = [];   // { id, profile }
    let incoming = [];  // { id, profile }
    let outgoing = [];  // { id, profile }
    let loading = false;

    // ===== Data loading =====
    async function loadData() {
        const c = client();
        const u = me();
        if (!c || !u) {
            friends = []; incoming = []; outgoing = [];
            renderAll();
            return;
        }
        loading = true;
        try {
            const { data: rels, error } = await c
                .from('friendships')
                .select('*')
                .or(`requester_id.eq.${u.id},addressee_id.eq.${u.id}`);
            if (error) throw error;

            const otherIds = (rels || []).map(r => r.requester_id === u.id ? r.addressee_id : r.requester_id);
            const profilesById = {};
            if (otherIds.length) {
                const { data: profs } = await c
                    .from('profiles')
                    .select('*')
                    .in('user_id', otherIds);
                (profs || []).forEach(p => { profilesById[p.user_id] = p; });
            }

            friends = []; incoming = []; outgoing = [];
            (rels || []).forEach(r => {
                const otherId = r.requester_id === u.id ? r.addressee_id : r.requester_id;
                const profile = profilesById[otherId] || { user_id: otherId, username: 'Unknown' };
                const entry = { id: r.id, profile };
                if (r.status === 'accepted') friends.push(entry);
                else if (r.requester_id === u.id) outgoing.push(entry);
                else incoming.push(entry);
            });
        } catch (err) {
            console.error('loadData (friends) error:', err);
            if (err && /relation .*friendships.* does not exist|could not find the table/i.test(err.message || '')) {
                notify('Run supabase/friends_setup.sql first', '#ef4444');
            }
        } finally {
            loading = false;
            renderAll();
        }
    }

    // ===== Rendering: sidebar =====
    function renderAll() {
        renderSidebar();
        if (friendsModal && friendsModal.classList.contains('active')) fmRenderList();
    }

    function updateCountBadge() {
        const badge = document.getElementById('friends-count');
        if (badge) badge.textContent = friends.length;
        if (viewAllFriendsBtn) viewAllFriendsBtn.style.display = 'flex';
    }

    function renderSidebar() {
        const u = me();
        friendsList.innerHTML = '';

        if (!u) {
            friendsList.innerHTML = `<div class="friends-empty-hint">Log in to find and add friends</div>`;
            updateCountBadge();
            return;
        }

        if (loading) {
            friendsList.innerHTML = `<div class="friends-empty-hint">Loading...</div>`;
            return;
        }

        // Incoming requests first (need a response)
        incoming.forEach(item => friendsList.appendChild(incomingRow(item)));

        // Friends (pinned first)
        const pinned = getPinned();
        const sorted = [...friends].sort((a, b) =>
            (pinned.has(b.profile.user_id) ? 1 : 0) - (pinned.has(a.profile.user_id) ? 1 : 0));
        sorted.forEach(item => friendsList.appendChild(friendRow(item, pinned.has(item.profile.user_id))));

        // Outgoing pending
        outgoing.forEach(item => friendsList.appendChild(outgoingRow(item)));

        if (incoming.length === 0 && friends.length === 0 && outgoing.length === 0) {
            friendsList.innerHTML = `<div class="friends-empty-hint">No friends yet — search by name above</div>`;
        }

        updateCountBadge();
    }

    function friendRow(item, isPinned) {
        const p = item.profile;
        const el = document.createElement('div');
        el.className = 'friend-item ' + (isPinned ? 'pinned' : 'unpinned');
        el.dataset.userId = p.user_id;
        el.innerHTML = `
            <div class="friend-avatar">${avatarFor(p)}</div>
            <div class="friend-info">
                <div class="friend-name">${esc(p.username)}</div>
                <div class="friend-sub">Lv ${levelOf(p)}</div>
            </div>
            <button class="pin-friend-btn" title="${isPinned ? 'Unpin friend' : 'Pin friend'}"></button>
            <button class="remove-friend-btn" title="Remove friend">×</button>`;
        el.querySelector('.pin-friend-btn').addEventListener('click', e => {
            e.stopPropagation();
            togglePin(p.user_id);
        });
        el.querySelector('.remove-friend-btn').addEventListener('click', e => {
            e.stopPropagation();
            removeFriendship(item.id, p.username);
        });
        return el;
    }

    function incomingRow(item) {
        const p = item.profile;
        const el = document.createElement('div');
        el.className = 'friend-item incoming-request';
        el.dataset.userId = p.user_id;
        el.innerHTML = `
            <div class="friend-avatar">${avatarFor(p)}</div>
            <div class="friend-info">
                <div class="friend-name">${esc(p.username)}</div>
                <div class="friend-sub">Wants to be friends</div>
            </div>
            <button class="accept-friend-btn" title="Accept">✓</button>
            <button class="decline-friend-btn" title="Decline">×</button>`;
        el.querySelector('.accept-friend-btn').addEventListener('click', e => {
            e.stopPropagation();
            acceptRequest(item.id, p.username);
        });
        el.querySelector('.decline-friend-btn').addEventListener('click', e => {
            e.stopPropagation();
            removeFriendship(item.id, p.username, 'Request declined');
        });
        return el;
    }

    function outgoingRow(item) {
        const p = item.profile;
        const el = document.createElement('div');
        el.className = 'friend-item pending-request';
        el.dataset.userId = p.user_id;
        el.innerHTML = `
            <div class="friend-avatar">${avatarFor(p)}</div>
            <div class="friend-info">
                <div class="friend-name">${esc(p.username)}</div>
                <div class="friend-sub pending-status">Waiting for a response...</div>
            </div>
            <button class="cancel-request-btn" title="Cancel request">×</button>`;
        el.querySelector('.cancel-request-btn').addEventListener('click', e => {
            e.stopPropagation();
            removeFriendship(item.id, p.username, 'Request cancelled');
        });
        return el;
    }

    // ===== Actions =====
    async function sendRequest(target) {
        const c = client();
        const u = me();
        if (!u) { notify('Log in to add friends', '#6b7280'); return; }
        if (!target || !target.user_id) return;
        if (target.user_id === u.id) { notify('You cannot add yourself', '#f59e0b'); return; }

        try {
            // Check existing relationship in either direction
            const { data: existing } = await c
                .from('friendships')
                .select('*')
                .or(`and(requester_id.eq.${u.id},addressee_id.eq.${target.user_id}),and(requester_id.eq.${target.user_id},addressee_id.eq.${u.id})`);

            if (existing && existing.length) {
                const rel = existing[0];
                if (rel.status === 'accepted') { notify('You are already friends', '#f59e0b'); return; }
                if (rel.requester_id === u.id) { notify('Request already sent', '#f59e0b'); return; }
                // They already requested you — accept instead
                await acceptRequest(rel.id, target.username);
                return;
            }

            const { error } = await c.from('friendships').insert({
                requester_id: u.id,
                addressee_id: target.user_id,
                status: 'pending'
            });
            if (error) throw error;

            notify(`✓ Request sent to ${target.username}`, '#10b981');
            addActivityLog(`Friend request sent to ${target.username}`, 'friend');
            await loadData();
        } catch (err) {
            console.error('sendRequest error:', err);
            if (err && err.code === '23505') notify('Request already exists', '#f59e0b');
            else notify('Error: ' + (err.message || 'could not send request'), '#ef4444');
        }
    }

    async function acceptRequest(friendshipId, username) {
        const c = client();
        try {
            const { error } = await c.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId);
            if (error) throw error;
            notify(`✓ You and ${username} are now friends!`, '#10b981');
            addActivityLog(`You and ${username} are now friends`, 'friend');
            await loadData();
        } catch (err) {
            console.error('acceptRequest error:', err);
            notify('Error: ' + (err.message || 'could not accept'), '#ef4444');
        }
    }

    async function removeFriendship(friendshipId, username, msg) {
        const c = client();
        try {
            const { error } = await c.from('friendships').delete().eq('id', friendshipId);
            if (error) throw error;
            notify(msg || `✓ ${username} removed`, '#6b7280');
            fmSelectedId = null;
            await loadData();
        } catch (err) {
            console.error('removeFriendship error:', err);
            notify('Error: ' + (err.message || 'could not remove'), '#ef4444');
        }
    }

    function togglePin(userId) {
        const pinned = getPinned();
        if (pinned.has(userId)) {
            pinned.delete(userId);
            notify('Friend unpinned', '#6b7280');
        } else {
            if (pinned.size >= 10) { notify('❌ Maximum 10 pinned friends!', '#ffffff'); return; }
            pinned.add(userId);
            notify('✓ Friend pinned!', '#ffffff');
        }
        savePinned(pinned);
        renderAll();
    }

    // ===== Search for new people =====
    let searchResultsEl = null;
    function ensureSearchResults() {
        if (searchResultsEl) return searchResultsEl;
        searchResultsEl = document.createElement('div');
        searchResultsEl.className = 'friend-search-results';
        searchResultsEl.style.display = 'none';
        if (addFriendContainer) addFriendContainer.appendChild(searchResultsEl);
        return searchResultsEl;
    }

    function hideSearchResults() {
        if (searchResultsEl) searchResultsEl.style.display = 'none';
    }

    async function searchPeople(query) {
        const c = client();
        const u = me();
        const box = ensureSearchResults();
        if (!u) { notify('Log in to search', '#6b7280'); return; }
        if (!query) { hideSearchResults(); return; }

        box.style.display = 'block';
        box.innerHTML = `<div class="fsr-hint">Searching...</div>`;

        try {
            const { data, error } = await c
                .from('profiles')
                .select('*')
                .ilike('username', `%${query}%`)
                .neq('user_id', u.id)
                .limit(8);
            if (error) throw error;

            const known = new Set([
                ...friends.map(f => f.profile.user_id),
                ...outgoing.map(f => f.profile.user_id),
                ...incoming.map(f => f.profile.user_id),
            ]);

            if (!data || data.length === 0) {
                box.innerHTML = `<div class="fsr-hint">No users found for "${esc(query)}"</div>`;
                return;
            }

            box.innerHTML = '';
            data.forEach(p => {
                const row = document.createElement('div');
                row.className = 'fsr-item';
                const already = known.has(p.user_id);
                row.innerHTML = `
                    <div class="fsr-avatar">${avatarFor(p)}</div>
                    <div class="fsr-info">
                        <div class="fsr-name">${esc(p.username)}</div>
                        <div class="fsr-sub">Lv ${levelOf(p)}</div>
                    </div>
                    <button class="fsr-add" ${already ? 'disabled' : ''}>${already ? 'Added' : '+ Add'}</button>`;
                const btn = row.querySelector('.fsr-add');
                if (!already) {
                    btn.addEventListener('click', async () => {
                        btn.disabled = true;
                        btn.textContent = '...';
                        await sendRequest(p);
                        hideSearchResults();
                        friendNameInput.value = '';
                    });
                }
                box.appendChild(row);
            });
        } catch (err) {
            console.error('searchPeople error:', err);
            box.innerHTML = `<div class="fsr-hint">Search error: ${esc(err.message || 'unknown')}</div>`;
        }
    }

    let searchTimer;
    if (friendNameInput) {
        friendNameInput.addEventListener('input', e => {
            clearTimeout(searchTimer);
            const q = e.target.value.trim();
            searchTimer = setTimeout(() => searchPeople(q), 250);
        });
        friendNameInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                clearTimeout(searchTimer);
                searchPeople(friendNameInput.value.trim());
            }
        });
    }
    if (addFriendBtn) {
        addFriendBtn.addEventListener('click', () => {
            searchPeople((friendNameInput.value || '').trim());
        });
    }
    // Hide dropdown when clicking outside
    document.addEventListener('click', e => {
        if (addFriendContainer && !addFriendContainer.contains(e.target)) hideSearchResults();
    });

    // ===== Friends modal =====
    let fmActiveTab = 'all';
    let fmSearchQuery = '';
    let fmSelectedId = null;

    function fmEntries() {
        if (fmActiveTab === 'pending') {
            return [
                ...incoming.map(e => ({ ...e, kind: 'incoming' })),
                ...outgoing.map(e => ({ ...e, kind: 'outgoing' })),
            ];
        }
        const pinned = getPinned();
        let list = friends.map(e => ({ ...e, kind: 'friend', pinned: pinned.has(e.profile.user_id) }));
        if (fmActiveTab === 'pinned') list = list.filter(e => e.pinned);
        return list;
    }

    function fmRenderList() {
        const counts = {
            all: friends.length,
            online: 0,
            pinned: friends.filter(f => getPinned().has(f.profile.user_id)).length,
            pending: incoming.length + outgoing.length,
        };
        const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        set('fm-count-all', counts.all);
        set('fm-count-online', counts.online);
        set('fm-count-pinned', counts.pinned);
        set('fm-count-pending', counts.pending);

        const subtitle = document.getElementById('fm-subtitle');
        if (subtitle) subtitle.textContent = `${counts.all} ${counts.all === 1 ? 'friend' : 'friends'} · ${counts.pending} pending`;

        const listEl = document.getElementById('fm-list');
        if (!listEl) return;

        let entries = fmEntries();
        if (fmSearchQuery) {
            const q = fmSearchQuery.toLowerCase();
            entries = entries.filter(e => (e.profile.username || '').toLowerCase().includes(q));
        }

        if (fmActiveTab === 'online') {
            listEl.innerHTML = `<div class="fm-empty"><div class="fm-empty-icon">🟢</div><div>Online status isn't tracked yet</div></div>`;
            return;
        }

        if (entries.length === 0) {
            let msg = 'No friends yet';
            if (fmSearchQuery) msg = 'Nothing found for this search';
            else if (fmActiveTab === 'pinned') msg = 'No pinned friends';
            else if (fmActiveTab === 'pending') msg = 'No pending requests';
            listEl.innerHTML = `<div class="fm-empty"><div class="fm-empty-icon">🔍</div><div>${msg}</div></div>`;
            return;
        }

        listEl.innerHTML = entries.map(fmRow).join('');
        listEl.querySelectorAll('.fm-friend').forEach(row => {
            row.addEventListener('click', () => {
                fmSelectedId = row.dataset.id;
                listEl.querySelectorAll('.fm-friend').forEach(r => r.classList.remove('active'));
                row.classList.add('active');
                fmShowProfile(fmSelectedId);
            });
        });

        if (fmSelectedId && entries.find(e => e.id === fmSelectedId)) {
            const row = listEl.querySelector(`.fm-friend[data-id="${fmSelectedId}"]`);
            if (row) row.classList.add('active');
            fmShowProfile(fmSelectedId);
        } else {
            fmSelectedId = null;
            if (friendProfileEmpty) friendProfileEmpty.style.display = 'flex';
            if (friendProfileView) friendProfileView.style.display = 'none';
        }
    }

    function fmRow(e) {
        const p = e.profile;
        const pinBadge = e.pinned ? '<span class="fm-pin-badge">📌</span>' : '';
        let sub = `Lv ${levelOf(p)}`;
        if (e.kind === 'incoming') sub = 'Wants to be friends';
        else if (e.kind === 'outgoing') sub = 'Request sent';
        const pendingClass = (e.kind === 'incoming' || e.kind === 'outgoing') ? ' pending' : '';
        return `
            <div class="fm-friend${pendingClass}" data-id="${e.id}">
                <div class="fm-friend-avatar">${avatarFor(p)}</div>
                <div class="fm-friend-info">
                    <div class="fm-friend-name">${esc(p.username)} ${pinBadge}</div>
                    <div class="fm-friend-sub">${sub}</div>
                </div>
            </div>`;
    }

    function findEntryById(id) {
        return friends.find(e => e.id === id)
            || incoming.find(e => e.id === id)
            || outgoing.find(e => e.id === id);
    }

    function fmShowProfile(id) {
        const entry = findEntryById(id);
        if (!entry || !friendProfileView) return;
        const p = entry.profile;
        const isIncoming = incoming.some(e => e.id === id);
        const isOutgoing = outgoing.some(e => e.id === id);
        const isPinned = getPinned().has(p.user_id);

        if (friendProfileEmpty) friendProfileEmpty.style.display = 'none';
        friendProfileView.style.display = 'block';
        friendProfileView.classList.add('active');

        let actions = '';
        if (isIncoming) {
            actions = `
                <button class="friend-action-btn message-btn" data-act="accept" data-id="${id}">✓ Accept</button>
                <button class="friend-action-btn remove-friend-large-btn" data-act="decline" data-id="${id}">Decline</button>`;
        } else if (isOutgoing) {
            actions = `
                <div style="color: rgba(255,255,255,0.5); font-size:13px; font-style:italic;">Waiting for a response...</div>
                <button class="friend-action-btn remove-friend-large-btn" data-act="cancel" data-id="${id}">Cancel request</button>`;
        } else {
            actions = `
                <button class="friend-action-btn pin-friend-large-btn" data-act="pin" data-uid="${p.user_id}">${isPinned ? '📌 Unpin' : '📌 Pin'}</button>
                <button class="friend-action-btn remove-friend-large-btn" data-act="remove" data-id="${id}">Remove</button>`;
        }

        const xp = Number(p.xp ?? p.experience ?? p.points ?? 0) || 0;

        friendProfileView.innerHTML = `
            <div class="friend-profile-header-section">
                <div class="friend-profile-top">
                    <div class="friend-profile-avatar-large">${avatarFor(p)}</div>
                    <div class="friend-profile-info-section">
                        <div class="friend-profile-name-large">${esc(p.username)}</div>
                        <div class="friend-profile-stats">
                            <span>Level ${levelOf(p)}</span>
                            <span>·</span>
                            <span>${xp.toLocaleString('en-US')} XP</span>
                        </div>
                    </div>
                </div>
                <div class="friend-profile-actions">${actions}</div>
            </div>
            <div class="fm-stats-grid">
                <div class="fm-stat-card">
                    <div class="fm-stat-value">${xp.toLocaleString('en-US')}</div>
                    <div class="fm-stat-label">XP</div>
                </div>
                <div class="fm-stat-card">
                    <div class="fm-stat-value">${levelOf(p)}</div>
                    <div class="fm-stat-label">Level</div>
                </div>
            </div>
            ${p.bio ? `<div class="friend-profile-section"><h3>About</h3><div style="color:rgba(255,255,255,0.8);font-size:14px;">${esc(p.bio)}</div></div>` : ''}`;

        friendProfileView.querySelectorAll('[data-act]').forEach(btn => {
            btn.addEventListener('click', () => {
                const act = btn.dataset.act;
                const fid = btn.dataset.id;
                if (act === 'accept') acceptRequest(fid, p.username);
                else if (act === 'decline') removeFriendship(fid, p.username, 'Request declined');
                else if (act === 'cancel') removeFriendship(fid, p.username, 'Request cancelled');
                else if (act === 'remove') removeFriendship(fid, p.username);
                else if (act === 'pin') togglePin(btn.dataset.uid);
            });
        });
    }

    function openFriendsModal() {
        if (!friendsModal) return;
        fmSelectedId = null;
        fmSearchQuery = '';
        fmActiveTab = 'all';
        const searchInput = document.getElementById('fm-search');
        if (searchInput) searchInput.value = '';
        document.querySelectorAll('.fm-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === 'all'));
        friendsModal.classList.add('active');
        loadData();
    }

    function closeFriendsModalFunc() {
        if (friendsModal) friendsModal.classList.remove('active');
    }

    document.querySelectorAll('.fm-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            fmActiveTab = tab.dataset.tab;
            document.querySelectorAll('.fm-tab').forEach(t => t.classList.toggle('active', t === tab));
            fmRenderList();
        });
    });

    const fmSearchEl = document.getElementById('fm-search');
    if (fmSearchEl) {
        let t;
        fmSearchEl.addEventListener('input', e => {
            clearTimeout(t);
            t = setTimeout(() => { fmSearchQuery = e.target.value.trim(); fmRenderList(); }, 150);
        });
    }

    if (viewAllFriendsBtn) viewAllFriendsBtn.addEventListener('click', openFriendsModal);
    if (closeFriendsModal) closeFriendsModal.addEventListener('click', closeFriendsModalFunc);
    if (friendsModal) {
        friendsModal.addEventListener('click', e => { if (e.target === friendsModal) closeFriendsModalFunc(); });
    }
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && friendsModal && friendsModal.classList.contains('active')) closeFriendsModalFunc();
    });

    // ===== Activity log (kept from before) =====
    function addActivityLog(title, type) {
        const activityLog = document.getElementById('activity-log');
        if (!activityLog) return;
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.style.animation = 'slideIn 0.3s ease';
        let icon = '📋';
        if (type === 'quest_complete') icon = '✓';
        else if (type === 'quest_start') icon = '▶';
        else if (type === 'friend') icon = '👥';
        else if (type === 'achievement') icon = '🏆';
        activityItem.innerHTML = `
            <div class="activity-icon" style="background: rgba(255, 255, 255, 0.15); color: #ffffff;">${icon}</div>
            <div class="activity-info">
                <div class="activity-title">${esc(title)}</div>
                <div class="activity-time">Just now</div>
            </div>`;
        activityLog.insertBefore(activityItem, activityLog.firstChild);
        const items = activityLog.querySelectorAll('.activity-item');
        if (items.length > 20) activityLog.removeChild(items[items.length - 1]);
    }

    // ===== Realtime + refresh wiring =====
    let realtimeChannel = null;
    function subscribeRealtime() {
        const c = client();
        const u = me();
        if (!c || !u || realtimeChannel || !c.channel) return;
        try {
            realtimeChannel = c
                .channel('friendships-' + u.id)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => loadData())
                .subscribe();
        } catch (e) { /* realtime optional */ }
    }

    window.refreshFriends = function () {
        loadData();
        subscribeRealtime();
    };

    // Initial load (in case user is already logged in)
    loadData();

    window.addActivityLog = addActivityLog;
    window.openFriendsModal = openFriendsModal;
});
