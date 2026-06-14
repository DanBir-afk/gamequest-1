window.__gqParts.push(function () {
    // ===== REAL FRIENDS (Supabase) =====
    const friendsList = document.getElementById('friends-list');
    const addFriendBtn = document.getElementById('add-friend-btn');
    const friendNameInput = document.getElementById('friend-name-input');
    const addFriendContainer = document.querySelector('.add-friend-container');
    const viewAllFriendsBtn = document.getElementById('view-all-friends-btn');
    const friendsPage = document.getElementById('friends-page');

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
    function normalizeAvatar(av) {
        return typeof av === 'string' ? av.trim() : '';
    }
    function isImageAvatar(av) {
        const s = normalizeAvatar(av);
        if (!s) return false;
        if (s.startsWith('data:') || s.startsWith('http://') || s.startsWith('https://')) return true;
        if (s.length > 120 && /;base64,|[A-Za-z0-9+/]{80,}={0,2}$/.test(s)) return true;
        return false;
    }
    function isEmojiAvatar(av) {
        const s = normalizeAvatar(av);
        if (!s || isImageAvatar(s) || s.length > 16) return false;
        return /\p{Extended_Pictographic}/u.test(s);
    }
    function fallbackEmoji(profile) {
        const name = (profile && profile.username) || '?';
        return AVATARS[hashStr(name) % AVATARS.length];
    }
    function mountFriendAvatar(container, profile) {
        if (!container) return;
        container.innerHTML = '';
        const av = profile && profile.avatar;
        if (isImageAvatar(av)) {
            const img = document.createElement('img');
            img.src = normalizeAvatar(av);
            img.alt = '';
            container.appendChild(img);
            return;
        }
        if (isEmojiAvatar(av)) {
            container.textContent = normalizeAvatar(av);
            return;
        }
        container.textContent = fallbackEmoji(profile);
    }
    function levelOf(profile) {
        if (typeof window.getProfileLevel === 'function') return window.getProfileLevel(profile);
        const xp = Number(profile?.xp ?? profile?.experience ?? profile?.points ?? 0) || 0;
        return typeof window.getLevelFromXp === 'function' ? window.getLevelFromXp(xp) : 0;
    }
    function onlineStatusText(profile) {
        if (typeof window.Presence?.statusText === 'function') {
            return window.Presence.statusText(profile);
        }
        const u = me();
        if (u && profile?.user_id === u.id) return { text: 'online', online: true };
        return { text: 'offline', online: false };
    }
    function esc(s) {
        const d = document.createElement('div');
        d.textContent = s == null ? '' : s;
        return d.innerHTML;
    }
    function nameHtml(username) {
        return typeof window.displayNameHtml === 'function'
            ? window.displayNameHtml(username)
            : esc(username);
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
    // Pull pinned list from the logged-in account profile into the local cache
    function syncPinnedFromProfile() {
        const prof = window.currentProfile;
        if (prof && Array.isArray(prof.pinned_friends)) {
            savePinned(new Set(prof.pinned_friends));
        }
    }
    // Persist pinned list to the account (Supabase)
    async function savePinnedRemote(set) {
        const c = client();
        const u = me();
        if (!c || !u) return;
        const arr = Array.from(set);
        try {
            const { error } = await c.from('profiles').update({ pinned_friends: arr }).eq('user_id', u.id);
            if (error) throw error;
            if (window.currentProfile) window.currentProfile.pinned_friends = arr;
        } catch (e) {
            console.warn('savePinnedRemote failed (run pinned_friends_setup.sql?):', e);
        }
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
            const cc = client();
            if (presenceChannel && cc) {
                try { cc.removeChannel(presenceChannel); } catch (e) { /* ignore */ }
            }
            presenceChannel = null;
            renderAll();
            return;
        }
        loading = true;
        try {
            // Restore pinned friends saved on the account
            syncPinnedFromProfile();

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
            subscribePresenceRealtime();
        }
    }

    // ===== Rendering: sidebar =====
    function renderAll() {
        renderSidebar();
        if (friendsPage && friendsPage.classList.contains('active')) fmRenderList();
        // Friend-count based achievements (silent — no popup spam on load)
        if (window.Achievements) window.Achievements.evaluate({ notify: false });
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

        // Sidebar: only pinned friends (rest live in All Friends modal)
        const pinned = getPinned();
        const pinnedFriends = friends.filter(item => pinned.has(item.profile.user_id));
        pinnedFriends.forEach(item => friendsList.appendChild(friendRow(item)));

        // Outgoing pending
        outgoing.forEach(item => friendsList.appendChild(outgoingRow(item)));

        const hasListContent = incoming.length > 0 || pinnedFriends.length > 0 || outgoing.length > 0;
        if (!hasListContent) {
            if (friends.length > 0) {
                friendsList.innerHTML = `<div class="friends-empty-hint">No pinned friends — open All Friends to pin someone</div>`;
            } else {
                friendsList.innerHTML = `<div class="friends-empty-hint">No friends yet — search by name above</div>`;
            }
        }

        updateCountBadge();
    }

    function friendRow(item) {
        const p = item.profile;
        const el = document.createElement('div');
        el.className = 'friend-item pinned';
        el.dataset.userId = p.user_id;
        const status = onlineStatusText(p);
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'friend-avatar';
        mountFriendAvatar(avatarDiv, p);
        el.appendChild(avatarDiv);
        const info = document.createElement('div');
        info.className = 'friend-info';
        info.innerHTML = `
            <div class="friend-name">${nameHtml(p.username)}</div>
            <div class="friend-sub ${status.online ? 'is-online' : 'is-offline'}">${status.text}</div>`;
        el.appendChild(info);
        const badge = document.createElement('div');
        badge.className = 'friend-level-badge';
        badge.textContent = `Lv ${levelOf(p)}`;
        el.appendChild(badge);
        el.addEventListener('click', () => openFriendPage(item.id));
        return el;
    }

    function incomingRow(item) {
        const p = item.profile;
        const el = document.createElement('div');
        el.className = 'friend-item incoming-request';
        el.dataset.userId = p.user_id;
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'friend-avatar';
        mountFriendAvatar(avatarDiv, p);
        el.appendChild(avatarDiv);
        const info = document.createElement('div');
        info.className = 'friend-info';
        info.innerHTML = `
            <div class="friend-name">${nameHtml(p.username)}</div>
            <div class="friend-sub">Wants to be friends</div>`;
        el.appendChild(info);
        const acceptBtn = document.createElement('button');
        acceptBtn.className = 'accept-friend-btn';
        acceptBtn.title = 'Accept';
        acceptBtn.textContent = '✓';
        acceptBtn.addEventListener('click', e => {
            e.stopPropagation();
            acceptRequest(item.id, p.username);
        });
        el.appendChild(acceptBtn);
        const declineBtn = document.createElement('button');
        declineBtn.className = 'decline-friend-btn';
        declineBtn.title = 'Decline';
        declineBtn.textContent = '×';
        declineBtn.addEventListener('click', e => {
            e.stopPropagation();
            removeFriendship(item.id, p.username, 'Request declined');
        });
        el.appendChild(declineBtn);
        return el;
    }

    function outgoingRow(item) {
        const p = item.profile;
        const el = document.createElement('div');
        el.className = 'friend-item pending-request';
        el.dataset.userId = p.user_id;
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'friend-avatar';
        mountFriendAvatar(avatarDiv, p);
        el.appendChild(avatarDiv);
        const info = document.createElement('div');
        info.className = 'friend-info';
        info.innerHTML = `
            <div class="friend-name">${nameHtml(p.username)}</div>
            <div class="friend-sub pending-status">Waiting for a response...</div>`;
        el.appendChild(info);
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'cancel-request-btn';
        cancelBtn.title = 'Cancel request';
        cancelBtn.textContent = '×';
        cancelBtn.addEventListener('click', e => {
            e.stopPropagation();
            removeFriendship(item.id, p.username, 'Request cancelled');
        });
        el.appendChild(cancelBtn);
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
        savePinnedRemote(pinned);
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
                    <div class="fsr-avatar"></div>
                    <div class="fsr-info">
                        <div class="fsr-name">${nameHtml(p.username)}</div>
                        <div class="fsr-sub">Lv ${levelOf(p)}</div>
                    </div>
                    <button class="fsr-add" ${already ? 'disabled' : ''}>${already ? 'Added' : '+ Add'}</button>`;
                mountFriendAvatar(row.querySelector('.fsr-avatar'), p);
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
    let friendPageReturnTo = 'profile';

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
            pinned: friends.filter(f => getPinned().has(f.profile.user_id)).length,
            pending: incoming.length + outgoing.length,
        };
        const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        set('fm-count-all', counts.all);
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

        if (entries.length === 0) {
            let msg = 'No friends yet';
            if (fmSearchQuery) msg = 'Nothing found for this search';
            else if (fmActiveTab === 'pinned') msg = 'No pinned friends';
            else if (fmActiveTab === 'pending') msg = 'No pending requests';
            listEl.innerHTML = `<div class="fm-empty"><div class="fm-empty-icon">🔍</div><div>${msg}</div></div>`;
            return;
        }

        listEl.innerHTML = entries.map(fmRow).join('');
        listEl.querySelectorAll('.fm-friend').forEach((row, i) => {
            mountFriendAvatar(row.querySelector('.fm-friend-avatar'), entries[i].profile);
        });
        listEl.querySelectorAll('.fm-friend').forEach(row => {
            row.addEventListener('click', () => {
                openFriendPage(row.dataset.id, { returnTo: 'friends-page' });
            });
        });
        listEl.querySelectorAll('.fm-pin-btn').forEach(btn => {
            btn.addEventListener('click', ev => {
                ev.stopPropagation();
                togglePin(btn.dataset.uid);
            });
        });
    }

    function fmRow(e) {
        const p = e.profile;
        let sub = '';
        let subClass = 'fm-friend-sub';
        if (e.kind === 'incoming') sub = 'Wants to be friends';
        else if (e.kind === 'outgoing') sub = 'Request sent';
        else {
            const status = onlineStatusText(p);
            sub = status.text;
            subClass += status.online ? ' is-online' : ' is-offline';
        }
        const pendingClass = (e.kind === 'incoming' || e.kind === 'outgoing') ? ' pending' : '';
        const pinnedClass = e.pinned ? ' is-pinned' : '';
        const pinBtn = e.kind === 'friend'
            ? `<button type="button" class="fm-pin-btn${pinnedClass}" data-uid="${p.user_id}" title="${e.pinned ? 'Pined' : 'Pin'}" aria-label="${e.pinned ? 'Pined friend' : 'Pin friend'}">${e.pinned ? 'Pined' : 'Pin'}</button>`
            : '';
        return `
            <div class="fm-friend${pendingClass}${e.pinned ? ' pinned' : ''}" data-id="${e.id}">
                <div class="fm-friend-avatar"></div>
                <div class="fm-friend-info">
                    <div class="fm-friend-name">${nameHtml(p.username)}</div>
                    <div class="${subClass}">${sub}</div>
                </div>
                ${pinBtn}
            </div>`;
    }

    function findEntryById(id) {
        return friends.find(e => e.id === id)
            || incoming.find(e => e.id === id)
            || outgoing.find(e => e.id === id);
    }

    function renderFriendProfile(id, container) {
        const entry = findEntryById(id);
        if (!entry || !container) return;
        const p = entry.profile;
        const isIncoming = incoming.some(e => e.id === id);
        const isOutgoing = outgoing.some(e => e.id === id);
        const isPinned = getPinned().has(p.user_id);

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
        const favGames = Array.isArray(p.favorite_games) ? p.favorite_games : [];
        const gamesHtml = (typeof window.favGamesHtml === 'function')
            ? window.favGamesHtml(favGames)
            : '<div class="fav-game-empty">No favorite games yet</div>';
        const presence = onlineStatusText(p);

        container.innerHTML = `
            <div class="friend-profile-header-section">
                <div class="friend-profile-top">
                    <div class="friend-profile-avatar-large"></div>
                    <div class="friend-profile-info-section">
                        <div class="friend-profile-name-large">${nameHtml(p.username)}</div>
                        <div class="friend-profile-stats">
                            <span class="${presence.online ? 'is-online' : 'is-offline'}">${presence.text}</span>
                            <span>·</span>
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
            ${p.bio ? `<div class="friend-profile-section"><h3>About</h3><div class="friend-profile-bio">${esc(p.bio)}</div></div>` : ''}
            <div class="friend-profile-section">
                <h3>Favorite Games</h3>
                <div class="fav-games-modal">${gamesHtml}</div>
            </div>
            <div class="friend-profile-section">
                <h3>Friends <span class="fp-section-count" id="fp-friends-count"></span></h3>
                <div class="fp-friends-mini" id="fp-friends-mini">
                    <div class="fp-loading-mini">Loading...</div>
                </div>
            </div>
            <div class="friend-profile-section">
                <h3>Guestbook</h3>
                <div class="fp-guestbook"></div>
            </div>`;

        mountFriendAvatar(container.querySelector('.friend-profile-avatar-large'), p);

        container.querySelectorAll('[data-act]').forEach(btn => {
            btn.addEventListener('click', () => {
                const act = btn.dataset.act;
                const fid = btn.dataset.id;
                if (act === 'pin') { togglePin(btn.dataset.uid); renderFriendProfile(id, container); return; }
                closeProfileModal();
                if (act === 'accept') acceptRequest(fid, p.username);
                else if (act === 'decline') removeFriendship(fid, p.username, 'Request declined');
                else if (act === 'cancel') removeFriendship(fid, p.username, 'Request cancelled');
                else if (act === 'remove') removeFriendship(fid, p.username);
            });
        });

        // Guestbook (Supabase wall for this friend)
        const gbContainer = container.querySelector('.fp-guestbook');
        if (gbContainer && window.Guestbook) window.Guestbook.mount(gbContainer, p.user_id);

        // This friend's own friends list
        loadFriendFriends(p.user_id);
    }

    // ===== Dedicated friend profile modal (enter a friend's profile) =====
    let profileModal = null;
    let profileFromList = false;

    function ensureProfileModal() {
        if (profileModal) return profileModal;
        profileModal = document.createElement('div');
        profileModal.className = 'fp-modal';
        profileModal.id = 'fp-modal';
        profileModal.innerHTML = `
            <div class="fp-modal-content">
                <div class="fp-modal-header">
                    <button class="fp-modal-back" title="Back">←</button>
                    <h2>Profile</h2>
                    <button class="fp-modal-close" title="Close">×</button>
                </div>
                <div class="fp-modal-body"></div>
            </div>`;
        document.body.appendChild(profileModal);
        profileModal.querySelector('.fp-modal-back').addEventListener('click', () => {
            // Back returns to the friends list (which stays open underneath)
            closeProfileModal();
        });
        profileModal.querySelector('.fp-modal-close').addEventListener('click', () => {
            closeProfileModal();
        });
        profileModal.addEventListener('click', e => { if (e.target === profileModal) closeProfileModal(); });
        return profileModal;
    }

    function openFriendProfile(id, opts) {
        opts = opts || {};
        profileFromList = !!opts.fromList;
        const modal = ensureProfileModal();
        const backBtn = modal.querySelector('.fp-modal-back');
        if (backBtn) backBtn.style.display = profileFromList ? 'flex' : 'none';
        const body = modal.querySelector('.fp-modal-body');
        body.scrollTop = 0;
        renderFriendProfile(id, body);
        modal.classList.add('active');
    }

    function closeProfileModal() {
        if (profileModal) profileModal.classList.remove('active');
    }

    // ===== Friend profile page (cloned from own profile for 1:1 styling) =====
    // Rendered as a normal in-flow page (navbar stays visible on top),
    // just like Home / Profile / Settings — not a fullscreen overlay.
    const STD_PAGE_IDS = ['home-page', 'leaderboard-page', 'quests-page', 'profile-page', 'friends-page', 'settings-page'];

    function hideStandardPages() {
        STD_PAGE_IDS.forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.style.display = 'none'; el.classList.remove('active'); }
        });
    }

    function closeFriendPage() {
        const el = document.getElementById('friend-page');
        if (el) el.remove();
        document.body.classList.remove('friend-page-open');

        const returnTo = friendPageReturnTo;
        friendPageReturnTo = 'profile';

        if (returnTo === 'friends-page') {
            reopenFriendsPage();
            window.scrollTo(0, 0);
            return;
        }

        // Return to the user's own profile page
        if (typeof window.showPage === 'function') {
            window.showPage('profile');
        } else {
            const prof = document.getElementById('profile-page');
            if (prof) { prof.style.display = 'block'; prof.classList.add('active'); }
        }
        window.scrollTo(0, 0);
    }

    function reopenFriendsPage() {
        if (typeof window.showPage === 'function') {
            window.showPage('friends');
        } else if (friendsPage) {
            friendsPage.style.display = 'block';
            friendsPage.classList.add('active');
            fmRenderList();
        }
    }

    function openFriendsPage() {
        if (!friendsPage) return;
        fmSelectedId = null;
        fmSearchQuery = '';
        fmActiveTab = 'all';
        const searchInput = document.getElementById('fm-search');
        if (searchInput) searchInput.value = '';
        document.querySelectorAll('.fm-nav-item').forEach(t => t.classList.toggle('active', t.dataset.tab === 'all'));
        loadData();
    }

    async function fillFriendPageFriends(userId, listEl, countEl) {
        if (!listEl) return;
        listEl.innerHTML = '<div class="friends-empty-hint">Loading...</div>';
        const c = client();
        if (!c) { listEl.innerHTML = ''; return; }
        try {
            const { data: rels, error } = await c
                .from('friendships')
                .select('*')
                .eq('status', 'accepted')
                .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
            if (error) throw error;
            const ids = (rels || []).map(r => r.requester_id === userId ? r.addressee_id : r.requester_id);
            if (countEl) countEl.textContent = ids.length;
            if (!ids.length) { listEl.innerHTML = '<div class="friends-empty-hint">No friends yet</div>'; return; }
            const { data: profs } = await c.from('profiles').select('*').in('user_id', ids);
            listEl.innerHTML = '';
            (profs || []).forEach(fp => {
                const el = document.createElement('div');
                el.className = 'friend-item';
                const avatarDiv = document.createElement('div');
                avatarDiv.className = 'friend-avatar';
                mountFriendAvatar(avatarDiv, fp);
                el.appendChild(avatarDiv);
                const info = document.createElement('div');
                info.className = 'friend-info';
                info.innerHTML = `<div class="friend-name">${nameHtml(fp.username)}</div>`;
                el.appendChild(info);
                const badge = document.createElement('div');
                badge.className = 'friend-level-badge';
                badge.textContent = `Lv ${levelOf(fp)}`;
                el.appendChild(badge);
                listEl.appendChild(el);
            });
        } catch (err) {
            console.warn('fillFriendPageFriends error:', err);
            if (countEl) countEl.textContent = '0';
            listEl.innerHTML = '<div class="friends-empty-hint">Friends list is private</div>';
        }
    }

    function openFriendPage(id, opts) {
        opts = opts || {};
        friendPageReturnTo = opts.returnTo === 'friends-page' ? 'friends-page' : 'profile';

        const entry = findEntryById(id);
        if (!entry) return;
        const p = entry.profile;
        const src = document.getElementById('profile-page');
        if (!src) return;

        // Remove any previous friend page without bouncing back to the profile
        const existing = document.getElementById('friend-page');
        if (existing) existing.remove();

        const pageEl = src.cloneNode(true);
        pageEl.id = 'friend-page';
        pageEl.classList.add('friend-page', 'active');
        // Render as a normal in-flow page (navbar stays visible at the top)
        pageEl.style.display = 'block';

        // Capture elements (by original id) before stripping ids to avoid duplicates
        const nameEl = pageEl.querySelector('.profile-name');
        const levelEl = pageEl.querySelector('.profile-level');
        const xpEl = pageEl.querySelector('.profile-xp');
        const fillEl = pageEl.querySelector('.progress-fill');
        const avatarEl = pageEl.querySelector('.profile-avatar');
        const bioEl = pageEl.querySelector('#profile-bio');
        const favListEl = pageEl.querySelector('#fav-games-list');
        const friendsListEl = pageEl.querySelector('#friends-list');
        const friendsCountEl = pageEl.querySelector('#friends-count');
        const gbContainerEl = pageEl.querySelector('.gb-container');
        const headerRow = pageEl.querySelector('.profile-header-top');
        const addFriendContainer = pageEl.querySelector('.add-friend-container');
        const viewAllBtn = pageEl.querySelector('#view-all-friends-btn');

        // Strip all ids inside the clone so it never collides with the real page
        pageEl.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));

        const progress = typeof window.getProfileProgress === 'function'
            ? window.getProfileProgress(p)
            : { level: levelOf(p), xpIntoLevel: 0, xpForNext: 1000, percent: 0 };
        if (nameEl) {
            if (typeof window.mountDisplayName === 'function') window.mountDisplayName(nameEl, p.username, 'Player');
            else nameEl.textContent = p.username || 'Player';
        }
        if (levelEl) levelEl.textContent = `Level: ${progress.level}`;
        if (xpEl) {
            xpEl.textContent = `XP: ${progress.xpIntoLevel.toLocaleString('en-US')} XP / ${progress.xpForNext.toLocaleString('en-US')} XP`;
        }
        if (typeof window.syncProfileDevBadge === 'function') {
            window.syncProfileDevBadge(p.username, pageEl);
        }
        if (fillEl) fillEl.style.width = `${progress.percent}%`;
        if (avatarEl) mountFriendAvatar(avatarEl, p);
        const bannerMedia = pageEl.querySelector('.profile-hero-banner-media');
        if (bannerMedia) {
            if (p.banner) bannerMedia.dataset.bannerUrl = p.banner;
            else delete bannerMedia.dataset.bannerUrl;
        }
        if (typeof window.updateProfileBanner === 'function') {
            window.updateProfileBanner(pageEl, p.banner || null);
        }
        if (bioEl) bioEl.textContent = p.bio || 'No bio yet.';
        if (favListEl && typeof window.favGamesHtml === 'function') {
            favListEl.innerHTML = window.favGamesHtml(Array.isArray(p.favorite_games) ? p.favorite_games : []);
        }
        const socialListEl = pageEl.querySelector('#profile-social-list');
        if (socialListEl && typeof window.socialLinksHtml === 'function') {
            socialListEl.innerHTML = window.socialLinksHtml(p.social_links || {});
        }

        // Back button in the profile header (replaces the old logout button spot)
        if (headerRow) {
            const backBtn = document.createElement('button');
            backBtn.className = 'profile-logout-btn friend-page-back-btn';
            backBtn.title = 'Back';
            backBtn.innerHTML = '<span>←</span><span>Back</span>';
            backBtn.addEventListener('click', closeFriendPage);
            headerRow.appendChild(backBtn);
        }

        // The add-friend controls and "All Friends" button don't apply to someone else's page
        if (addFriendContainer) addFriendContainer.style.display = 'none';
        if (viewAllBtn) viewAllBtn.style.display = 'none';

        // Hide the standard pages and insert the friend page right after the
        // real profile page so it sits in the normal flow, below the navbar.
        hideStandardPages();
        if (src.parentNode) {
            src.parentNode.insertBefore(pageEl, src.nextSibling);
        } else {
            document.body.appendChild(pageEl);
        }
        window.scrollTo(0, 0);

        // Rank badges: grey out the ones this friend hasn't earned
        if (typeof window.applyRankBadges === 'function') {
            window.applyRankBadges(pageEl, { level: levelOf(p), quests: Number(p.quests_completed) || 0 });
        }

        // Achievements preview reflects THIS friend's unlocked set (not the viewer's)
        if (window.Achievements && typeof window.Achievements.renderPreviewFor === 'function') {
            const map = (p.achievements && typeof p.achievements === 'object') ? p.achievements : {};
            const pinned = Array.isArray(p.pinned_achievements) ? p.pinned_achievements : [];
            window.Achievements.renderPreviewFor(pageEl, map, pinned);
        }

        // Friend's own friends in the left sidebar + friend's guestbook wall
        fillFriendPageFriends(p.user_id, friendsListEl, friendsCountEl);
        if (gbContainerEl && window.Guestbook) window.Guestbook.mount(gbContainerEl, p.user_id);
    }

    async function loadFriendFriends(userId) {
        const countEl = document.getElementById('fp-friends-count');
        const listEl = document.getElementById('fp-friends-mini');
        if (!listEl) return;
        const c = client();
        if (!c) { listEl.innerHTML = '<div class="fp-empty-mini">—</div>'; return; }
        try {
            const { data: rels, error } = await c
                .from('friendships')
                .select('*')
                .eq('status', 'accepted')
                .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
            if (error) throw error;
            const ids = (rels || []).map(r => r.requester_id === userId ? r.addressee_id : r.requester_id);
            if (countEl) countEl.textContent = ids.length ? `(${ids.length})` : '';
            if (!ids.length) { listEl.innerHTML = '<div class="fp-empty-mini">No friends yet</div>'; return; }
            const { data: profs } = await c.from('profiles').select('*').in('user_id', ids);
            const list = profs || [];
            listEl.innerHTML = list.map(fp => `
                <div class="fp-friend-mini">
                    <div class="fp-friend-mini-avatar"></div>
                    <div class="fp-friend-mini-name">${nameHtml(fp.username)}</div>
                    <div class="fp-friend-mini-lvl">Lv ${levelOf(fp)}</div>
                </div>`).join('');
            listEl.querySelectorAll('.fp-friend-mini').forEach((row, i) => {
                mountFriendAvatar(row.querySelector('.fp-friend-mini-avatar'), list[i]);
            });
        } catch (err) {
            console.warn('loadFriendFriends error (run guestbook_setup.sql for the friends policy?):', err);
            if (countEl) countEl.textContent = '';
            listEl.innerHTML = '<div class="fp-empty-mini">Friends list is private</div>';
        }
    }

    document.querySelectorAll('.fm-nav-item').forEach(tab => {
        tab.addEventListener('click', () => {
            fmActiveTab = tab.dataset.tab;
            document.querySelectorAll('.fm-nav-item').forEach(t => t.classList.toggle('active', t === tab));
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

    if (viewAllFriendsBtn) {
        viewAllFriendsBtn.addEventListener('click', () => {
            if (typeof window.showPage === 'function') window.showPage('friends');
            else openFriendsPage();
        });
    }

    const friendsPageBackBtn = document.getElementById('friends-page-back-btn');
    if (friendsPageBackBtn) {
        friendsPageBackBtn.addEventListener('click', () => {
            if (typeof window.showPage === 'function') window.showPage('profile');
        });
    }

    document.addEventListener('keydown', e => {
        if (e.key !== 'Escape') return;
        if (document.getElementById('friend-page')) { closeFriendPage(); return; }
        if (profileModal && profileModal.classList.contains('active')) { closeProfileModal(); return; }
        if (friendsPage && friendsPage.classList.contains('active')) {
            if (typeof window.showPage === 'function') window.showPage('profile');
        }
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
    let presenceChannel = null;
    let presencePollTimer = null;

    function applyPresenceUpdate(profileRow) {
        if (!profileRow?.user_id) return;
        let changed = false;
        const touch = (entry) => {
            if (entry.profile.user_id === profileRow.user_id) {
                entry.profile.last_seen_at = profileRow.last_seen_at;
                changed = true;
            }
        };
        friends.forEach(touch);
        incoming.forEach(touch);
        outgoing.forEach(touch);
        if (changed) renderAll();
    }

    function subscribePresenceRealtime() {
        const c = client();
        const u = me();
        if (!c || !u || !c.channel) return;

        if (presenceChannel) {
            try { c.removeChannel(presenceChannel); } catch (e) { /* ignore */ }
            presenceChannel = null;
        }

        const friendIds = friends.map(item => item.profile.user_id).filter(Boolean);
        if (!friendIds.length) return;

        try {
            presenceChannel = c
                .channel('presence-' + u.id)
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles',
                    filter: `user_id=in.(${friendIds.join(',')})`,
                }, (payload) => applyPresenceUpdate(payload.new))
                .subscribe();
        } catch (e) { /* realtime optional */ }
    }

    function startPresencePoll() {
        if (presencePollTimer) clearInterval(presencePollTimer);
        presencePollTimer = setInterval(() => {
            if (!friends.length) return;
            renderAll();
        }, 30000);
    }

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
        const u = me();
        if (u) {
            if (window.Presence?.start) window.Presence.start();
        } else if (window.Presence?.stop) {
            window.Presence.stop(false);
        }
        loadData();
        subscribeRealtime();
        if (u) startPresencePoll();
        else if (presencePollTimer) {
            clearInterval(presencePollTimer);
            presencePollTimer = null;
        }
    };

    // Initial load (in case user is already logged in)
    if (me() && window.Presence?.start) window.Presence.start();
    loadData();
    startPresencePoll();

    window.addActivityLog = addActivityLog;
    window.openFriendsPage = openFriendsPage;
    window.openFriendsModal = openFriendsPage;
    window.getFriendsCount = function () { return friends.length; };
    window.getFriendsList = function () {
        return friends.map(item => ({
            id: item.id,
            user_id: item.profile.user_id,
            username: item.profile.username,
            avatar: item.profile.avatar,
            level: levelOf(item.profile),
            last_seen_at: item.profile.last_seen_at,
        }));
    };
});
