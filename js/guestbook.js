window.__gqParts.push(function () {
    // ===== Reusable Supabase guestbook (profile wall) =====
    const MAX_LEN = 280;

    function client() {
        if (typeof window.supabaseClient !== 'undefined' && window.supabaseClient) return window.supabaseClient;
        return (typeof window.initSupabaseClient === 'function') ? window.initSupabaseClient() : null;
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
    function handleFor(name) {
        return String(name || '').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 15) || 'guest';
    }
    const AVATARS = ['⚔️', '🏹', '🗡️', '🛡️', '✨', '🔮', '⚡', '🎯', '🏆', '💎', '🌟', '🔥'];
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
    function fallbackEmoji(name) {
        const key = String(name || '?');
        return AVATARS[hashStr(key) % AVATARS.length];
    }
    function mountAvatar(container, avatar, fallbackName) {
        if (!container) return;
        container.innerHTML = '';
        const av = normalizeAvatar(avatar);
        if (isImageAvatar(av)) {
            const img = document.createElement('img');
            img.src = av;
            img.alt = '';
            container.appendChild(img);
            return;
        }
        if (isEmojiAvatar(av)) {
            container.textContent = av;
            return;
        }
        container.textContent = fallbackEmoji(fallbackName);
    }
    function timeAgo(ts) {
        const diff = Date.now() - ts;
        const m = Math.floor(diff / 60000);
        const h = Math.floor(diff / 3600000);
        const d = Math.floor(diff / 86400000);
        if (m < 1) return 'just now';
        if (m < 60) return m + 'm';
        if (h < 24) return h + 'h';
        if (d < 7) return d + 'd';
        return new Date(ts).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    }
    function viewer() {
        const u = window.currentUser || null;
        const prof = window.currentProfile || null;
        const name = (prof && prof.username) || (u && u.email ? u.email.split('@')[0] : null) || 'Guest';
        const avatar = (prof && prof.avatar) || localStorage.getItem('gamequest_avatar') || '🏹';
        return { id: u ? u.id : null, name, avatar };
    }

    function sortMessages(list, sort) {
        const arr = [...list];
        if (sort === 'oldest') arr.sort((a, b) => a.created_at_ms - b.created_at_ms);
        else if (sort === 'liked') arr.sort((a, b) => (b.likes || 0) - (a.likes || 0) || b.created_at_ms - a.created_at_ms);
        else arr.sort((a, b) => b.created_at_ms - a.created_at_ms);
        return arr;
    }

    async function load(state) {
        const c = client();
        if (!c) { state.messages = []; renderList(state); return; }
        try {
            const { data, error } = await c
                .from('guestbook')
                .select('*')
                .eq('profile_id', state.profileId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            state.messages = (data || []).map(row => ({
                ...row,
                created_at_ms: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
                liked_by: Array.isArray(row.liked_by) ? row.liked_by : [],
            }));
        } catch (err) {
            console.warn('guestbook load failed (run guestbook_setup.sql?):', err);
            state.messages = [];
            state.loadError = err && /relation .*guestbook.* does not exist|could not find the table/i.test(err.message || '');
        }
        renderList(state);
    }

    async function postMessage(state) {
        const c = client();
        const v = viewer();
        if (!c || !v.id) { if (window.showNotification) window.showNotification('Log in to post', '#6b7280'); return; }
        const text = state.input.value.trim();
        if (!text || text.length > MAX_LEN) return;

        const row = {
            profile_id: state.profileId,
            author_id: v.id,
            author_name: v.name,
            author_avatar: v.avatar,
            text: text,
            likes: 0,
            liked_by: [],
        };
        try {
            const { error } = await c.from('guestbook').insert(row);
            if (error) throw error;
            state.input.value = '';
            updateComposer(state);
            state.sort = 'newest';
            state.container.querySelectorAll('.gb-sort-btn').forEach(b => b.classList.toggle('active', b.dataset.sort === 'newest'));
            await load(state);
        } catch (err) {
            console.warn('guestbook post failed:', err);
            if (window.showNotification) window.showNotification('Could not post message', '#ef4444');
        }
    }

    async function toggleLike(state, id) {
        const c = client();
        const v = viewer();
        if (!c || !v.id) { if (window.showNotification) window.showNotification('Log in to like', '#6b7280'); return; }
        const msg = state.messages.find(m => m.id === id);
        if (!msg) return;
        const liked = msg.liked_by.includes(v.id);
        const newLikedBy = liked ? msg.liked_by.filter(x => x !== v.id) : [...msg.liked_by, v.id];
        // Optimistic update
        msg.liked_by = newLikedBy;
        msg.likes = newLikedBy.length;
        renderList(state);
        try {
            const { error } = await c.from('guestbook')
                .update({ liked_by: newLikedBy, likes: newLikedBy.length })
                .eq('id', id);
            if (error) throw error;
        } catch (err) {
            console.warn('guestbook like failed:', err);
        }
    }

    async function deleteMessage(state, id) {
        const c = client();
        try {
            const { error } = await c.from('guestbook').delete().eq('id', id);
            if (error) throw error;
            state.messages = state.messages.filter(m => m.id !== id);
            renderList(state);
            if (window.showNotification) window.showNotification('Message deleted', '#6b7280');
        } catch (err) {
            console.warn('guestbook delete failed:', err);
            if (window.showNotification) window.showNotification('Could not delete', '#ef4444');
        }
    }

    function updateComposer(state) {
        if (!state.input) return;
        const remaining = MAX_LEN - state.input.value.length;
        if (state.counter) {
            state.counter.textContent = remaining;
            state.counter.classList.toggle('warn', remaining < 40 && remaining >= 0);
            state.counter.classList.toggle('over', remaining < 0);
        }
        if (state.sendBtn) state.sendBtn.disabled = state.input.value.trim().length === 0 || remaining < 0;
        state.input.style.height = 'auto';
        state.input.style.height = Math.min(state.input.scrollHeight, 140) + 'px';
    }

    function renderList(state) {
        const v = viewer();
        if (state.totalEl) state.totalEl.textContent = state.messages.length;

        if (state.messages.length === 0) {
            const msg = state.loadError ? 'Run guestbook_setup.sql in Supabase' : 'Empty for now. Be the first to write!';
            state.listEl.innerHTML = `
                <div class="gb-empty">
                    <div class="gb-empty-icon">💬</div>
                    <div class="gb-empty-text">${msg}</div>
                </div>`;
            return;
        }

        const sorted = sortMessages(state.messages, state.sort);
        state.listEl.innerHTML = sorted.map(m => {
            const handle = handleFor(m.author_name);
            const liked = v.id && m.liked_by.includes(v.id);
            const canDelete = v.id && (m.author_id === v.id || state.profileId === v.id);
            return `
                <div class="gb-msg" data-id="${m.id}">
                    <div class="gb-msg-avatar"></div>
                    <div class="gb-msg-body">
                        <div class="gb-msg-head">
                            <span class="gb-msg-name">${nameHtml(m.author_name)}</span>
                            <span class="gb-msg-handle">@${handle}</span>
                            <span class="gb-msg-time">${timeAgo(m.created_at_ms)}</span>
                        </div>
                        <div class="gb-msg-text">${esc(m.text)}</div>
                        <div class="gb-msg-actions">
                            <button class="gb-action gb-like ${liked ? 'liked' : ''}" data-id="${m.id}" title="Like">
                                <span class="gb-action-icon">${liked ? '♥' : '♡'}</span>
                                <span class="gb-action-count">${m.likes || 0}</span>
                            </button>
                        </div>
                    </div>
                    ${canDelete ? `<button class="gb-msg-delete" data-id="${m.id}" title="Remove">×</button>` : ''}
                </div>`;
        }).join('');

        state.listEl.querySelectorAll('.gb-msg').forEach((row, i) => {
            const m = sorted[i];
            mountAvatar(row.querySelector('.gb-msg-avatar'), m.author_avatar, m.author_name);
        });

        state.listEl.querySelectorAll('.gb-like').forEach(btn => {
            btn.addEventListener('click', () => toggleLike(state, btn.dataset.id));
        });
        state.listEl.querySelectorAll('.gb-msg-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteMessage(state, btn.dataset.id));
        });
    }

    function buildComposer(state) {
        const v = viewer();
        if (!v.id) return ''; // guests can't post
        return `
            <div class="gb-composer">
                <div class="gb-composer-top">
                    <div class="gb-composer-avatar"></div>
                    <div class="gb-composer-fields">
                        <div class="gb-composer-name"></div>
                        <textarea class="gb-text-input gb-text-input-dyn" placeholder="Message" maxlength="${MAX_LEN}" rows="1"></textarea>
                    </div>
                </div>
                <div class="gb-composer-bottom">
                    <span class="gb-counter-input">${MAX_LEN}</span>
                    <button class="gb-send-btn" disabled>Send</button>
                </div>
            </div>`;
    }

    // Public API
    window.Guestbook = {
        mount(container, profileId) {
            if (!container || !profileId) return;
            const state = { profileId, sort: 'newest', messages: [], container };
            container.classList.add('gb-container');
            container.innerHTML = `
                ${buildComposer(state)}
                <div class="gb-list-header">
                    <div class="gb-sort">
                        <button class="gb-sort-btn active" data-sort="newest">Newest</button>
                        <button class="gb-sort-btn" data-sort="oldest">Oldest</button>
                        <button class="gb-sort-btn" data-sort="liked">Popular</button>
                    </div>
                    <span class="gb-total">0</span>
                </div>
                <div class="gb-list"></div>`;

            state.input = container.querySelector('.gb-text-input-dyn');
            state.sendBtn = container.querySelector('.gb-send-btn');
            state.counter = container.querySelector('.gb-counter-input');
            state.totalEl = container.querySelector('.gb-total');
            state.listEl = container.querySelector('.gb-list');

            const composerAvatar = container.querySelector('.gb-composer-avatar');
            const composerName = container.querySelector('.gb-composer-name');
            if (composerAvatar) {
                const v = viewer();
                mountAvatar(composerAvatar, v.avatar, v.name);
            }
            if (composerName) {
                const v = viewer();
                if (typeof window.mountDisplayName === 'function') window.mountDisplayName(composerName, v.name);
                else composerName.textContent = v.name;
            }

            if (state.input) {
                state.input.addEventListener('input', () => updateComposer(state));
                state.input.addEventListener('keydown', e => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); postMessage(state); }
                });
            }
            if (state.sendBtn) state.sendBtn.addEventListener('click', () => postMessage(state));

            container.querySelectorAll('.gb-sort-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    state.sort = btn.dataset.sort;
                    container.querySelectorAll('.gb-sort-btn').forEach(b => b.classList.toggle('active', b === btn));
                    renderList(state);
                });
            });

            container.__gbState = state;
            load(state);
            return state;
        }
    };
});
