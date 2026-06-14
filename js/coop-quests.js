/**
 * Co-op quest invites via Supabase.
 * Host invites a friend from quest preview; quest starts only after guest accepts.
 */
window.CoopQuests = (function() {
    const STATUS = {
        PENDING: 'pending',
        ACCEPTED: 'accepted',
        DECLINED: 'declined',
        CANCELLED: 'cancelled',
        STARTED: 'started',
        COMPLETED: 'completed',
    };

    const COOP_TYPES = {
        RACE: 'race',
        TOGETHER: 'together',
    };

    const COOP_TYPE_LABELS = {
        race: 'Race',
        together: 'Together',
    };

    let invites = [];
    const recentCompleted = new Map();
    let realtimeChannel = null;
    let pollTimer = null;
    const listeners = new Set();
    let toastEl = null;

    function client() {
        if (window.supabaseClient) return window.supabaseClient;
        if (typeof window.initSupabaseClient === 'function') return window.initSupabaseClient();
        return null;
    }

    function me() {
        return window.currentUser || null;
    }

    function esc(s) {
        const d = document.createElement('div');
        d.textContent = s == null ? '' : s;
        return d.innerHTML;
    }

    function notify(msg, color) {
        if (typeof window.showNotification === 'function') {
            window.showNotification(msg, color || '#ffffff');
        }
    }

    let lastEmitKey = '';

    function emit() {
        const key = JSON.stringify(invites.map(i => [i.id, i.status, i.coop_type, i.updated_at]));
        const changed = key !== lastEmitKey;
        lastEmitKey = key;

        if (changed) {
            listeners.forEach(fn => {
                try { fn(invites.slice()); } catch (e) { /* ignore */ }
            });
        }
        renderToast();
        maybeAutoLaunchSessions();
    }

    function onChange(fn) {
        listeners.add(fn);
        return () => listeners.delete(fn);
    }

    function rememberCompleted(invite) {
        if (!invite?.id) return;
        recentCompleted.set(invite.id, invite);
        setTimeout(() => recentCompleted.delete(invite.id), 600000);
    }

    function getInvite(id) {
        return invites.find(i => i.id === id) || recentCompleted.get(id) || null;
    }

    function isRaceInvite(invite) {
        return invite?.coop_type === COOP_TYPES.RACE;
    }

    function questTitle(questId) {
        const id = window.QuestLoader?.resolveCanonicalId(questId) || questId;
        const game = (window.gamesManifest?.games || []).find(g => g.id === id);
        return game?.title || game?.gameName || questId;
    }

    function partnerProfile(invite) {
        const u = me();
        if (!u || !invite) return null;
        const isHost = invite.host_id === u.id;
        const list = typeof window.getFriendsList === 'function' ? window.getFriendsList() : [];
        const partnerId = isHost ? invite.guest_id : invite.host_id;
        const friend = list.find(f => f.user_id === partnerId);
        if (friend) return friend;
        return { user_id: partnerId, username: isHost ? 'Friend' : 'Host' };
    }

    async function loadInvites() {
        const c = client();
        const u = me();
        if (!c || !u) {
            invites = [];
            emit();
            return invites;
        }

        try {
            const { data, error } = await c
                .from('coop_quest_invites')
                .select('*')
                .or(`host_id.eq.${u.id},guest_id.eq.${u.id}`)
                .in('status', [STATUS.PENDING, STATUS.ACCEPTED, STATUS.STARTED])
                .order('created_at', { ascending: false });
            if (error) throw error;
            invites = data || [];

            try {
                const since = new Date(Date.now() - 600000).toISOString();
                const { data: recent } = await c
                    .from('coop_quest_invites')
                    .select('*')
                    .or(`host_id.eq.${u.id},guest_id.eq.${u.id}`)
                    .eq('status', STATUS.COMPLETED)
                    .eq('coop_type', COOP_TYPES.RACE)
                    .gte('updated_at', since);
                (recent || []).forEach(rememberCompleted);
            } catch (e) { /* optional columns */ }
        } catch (err) {
            console.warn('CoopQuests.loadInvites:', err);
            if (/coop_quest_invites/i.test(err.message || '')) {
                notify('Run supabase/coop_quests_setup.sql for Co-op', '#ef4444');
            }
            invites = [];
        }

        emit();
        return invites;
    }

    function getLobbyInviteForQuest(questId) {
        const u = me();
        if (!u) return null;
        const id = window.QuestLoader?.resolveCanonicalId(questId) || questId;
        return invites.find(i => {
            if (i.quest_id !== id) return false;
            if (i.host_id !== u.id && i.guest_id !== u.id) return false;
            if (i.status === STATUS.PENDING) {
                return i.host_id === u.id;
            }
            if ([STATUS.ACCEPTED, STATUS.STARTED].includes(i.status)) {
                return isRecentSession(i, 300);
            }
            return false;
        }) || null;
    }

    function getActiveInviteForQuest(questId, asHost) {
        const u = me();
        if (!u) return null;
        const id = window.QuestLoader?.resolveCanonicalId(questId) || questId;
        return invites.find(i => {
            if (i.quest_id !== id) return false;
            if (asHost && i.host_id !== u.id) return false;
            if (!asHost && i.guest_id !== u.id && i.host_id !== u.id) return false;
            return [STATUS.PENDING, STATUS.ACCEPTED, STATUS.STARTED].includes(i.status);
        }) || null;
    }

    function isRecentSession(invite, maxSec) {
        if (!invite?.updated_at) return false;
        const age = Date.now() - new Date(invite.updated_at).getTime();
        return age < (maxSec || 120) * 1000;
    }

    async function cleanupStaleHostSessions(questId) {
        const u = me();
        if (!u) return;
        const id = window.QuestLoader?.resolveCanonicalId(questId) || questId;
        const activeId = window.currentQuest?.coopInvite?.id;

        const stale = invites.filter(i => {
            if (i.quest_id !== id || i.host_id !== u.id || i.id === activeId) return false;
            if ([STATUS.ACCEPTED, STATUS.STARTED].includes(i.status)) {
                return !isRecentSession(i, 120);
            }
            if (i.status === STATUS.PENDING && !isRecentSession(i, 3600)) return true;
            return false;
        });

        for (const inv of stale) {
            await updateInvite(inv.id, STATUS.CANCELLED);
        }

        if (stale.length) {
            await loadInvites();
        }
    }

    async function resetHostLobby(questId) {
        const u = me();
        if (!u) return;
        const id = window.QuestLoader?.resolveCanonicalId(questId) || questId;
        const activeId = window.currentQuest?.coopInvite?.id;

        const toCancel = invites.filter(i =>
            i.quest_id === id
            && i.host_id === u.id
            && i.id !== activeId
            && [STATUS.PENDING, STATUS.ACCEPTED, STATUS.STARTED].includes(i.status)
        );

        for (const inv of toCancel) {
            await updateInvite(inv.id, STATUS.CANCELLED);
        }

        if (toCancel.length) {
            await loadInvites();
            notify('Lobby reset', '#6b7280');
        }
    }

    function isCoopReady(invite) {
        return invite && invite.status === STATUS.ACCEPTED;
    }

    function coopTypeLabel(type) {
        return COOP_TYPE_LABELS[type] || COOP_TYPE_LABELS.together;
    }

    function isLobbyHost(invite) {
        const u = me();
        return !invite || (u && invite.host_id === u.id);
    }

    function canStartCoop(invite) {
        const u = me();
        return invite
            && invite.status === STATUS.ACCEPTED
            && u
            && invite.host_id === u.id;
    }

    function canLaunchCoop(invite) {
        return canStartCoop(invite);
    }

    function canJoinCoop(invite) {
        const u = me();
        return invite
            && invite.status === STATUS.STARTED
            && u
            && invite.guest_id === u.id;
    }

    async function sendInvite(questId, difficulty, guestUserId, coopType) {
        const c = client();
        const u = me();
        if (!c || !u) {
            notify('Sign in for Co-op', '#6b7280');
            return null;
        }
        if (!guestUserId) return null;

        const id = window.QuestLoader?.resolveCanonicalId(questId) || questId;

        const existing = getActiveInviteForQuest(id, true);
        if (existing && existing.guest_id === guestUserId) {
            if (existing.status === STATUS.PENDING) return existing;
            await cancelInvite(existing.id, true);
        } else if (existing) {
            await cancelInvite(existing.id, true);
        }

        try {
            const { data, error } = await c
                .from('coop_quest_invites')
                .insert({
                    quest_id: id,
                    difficulty: difficulty || 'medium',
                    coop_type: coopType === COOP_TYPES.RACE ? COOP_TYPES.RACE : COOP_TYPES.TOGETHER,
                    host_id: u.id,
                    guest_id: guestUserId,
                    status: STATUS.PENDING,
                })
                .select()
                .single();
            if (error) throw error;
            invites = [data, ...invites.filter(i => i.id !== data.id)];
            emit();
            notify('Invite sent', '#ffffff');
            return data;
        } catch (err) {
            console.error('CoopQuests.sendInvite:', err);
            notify('Failed to send invite', '#ef4444');
            return null;
        }
    }

    function isTogetherInvite(invite) {
        return invite?.coop_type === COOP_TYPES.TOGETHER;
    }

    async function patchInvite(id, fields) {
        const c = client();
        if (!c) return null;
        try {
            const payload = { ...fields, updated_at: new Date().toISOString() };
            const { data, error } = await c
                .from('coop_quest_invites')
                .update(payload)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            if ([STATUS.DECLINED, STATUS.CANCELLED].includes(data.status)) {
                invites = invites.filter(i => i.id !== id);
                recentCompleted.delete(id);
            } else if (data.status === STATUS.COMPLETED) {
                rememberCompleted(data);
                invites = invites.filter(i => i.id !== id);
            } else {
                const idx = invites.findIndex(i => i.id === id);
                if (idx >= 0) invites[idx] = data;
                else invites.unshift(data);
            }
            emit();
            return data;
        } catch (err) {
            if (!/together_/i.test(err?.message || '')) {
                console.warn('CoopQuests.patchInvite:', err);
            }
            return null;
        }
    }

    async function publishTogetherAnswer(id, qIdx, selectedIdx, correct, correctCount) {
        const u = me();
        const invite = getInvite(id);
        if (!u || !invite || !isTogetherInvite(invite) || invite.status !== STATUS.STARTED) return null;
        if (invite.together_pick?.qIdx === qIdx) return invite.together_pick;

        const prof = window.currentProfile;
        const pick = {
            qIdx,
            selectedIdx,
            correct,
            by: u.id,
            username: prof?.username
                || u.user_metadata?.username
                || u.email?.split('@')[0]
                || 'Friend',
        };

        return patchInvite(id, {
            together_pick: pick,
            together_correct: correctCount,
        });
    }

    async function advanceTogetherQuestion(id, fromQIdx, toQIdx) {
        const c = client();
        if (!c) return null;
        try {
            const { data, error } = await c
                .from('coop_quest_invites')
                .update({
                    together_q_idx: toQIdx,
                    together_pick: null,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .eq('together_q_idx', fromQIdx)
                .select()
                .maybeSingle();
            if (error) throw error;
            if (data) {
                const idx = invites.findIndex(i => i.id === id);
                if (idx >= 0) invites[idx] = data;
                else invites.unshift(data);
                emit();
                return data;
            }
            return getInvite(id);
        } catch (err) {
            if (!/together_/i.test(err?.message || '')) {
                console.warn('CoopQuests.advanceTogetherQuestion:', err);
            }
            return null;
        }
    }

    async function updateInvite(id, status) {
        const c = client();
        if (!c) return null;
        try {
            const { data, error } = await c
                .from('coop_quest_invites')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            if ([STATUS.DECLINED, STATUS.CANCELLED].includes(status)) {
                invites = invites.filter(i => i.id !== id);
                recentCompleted.delete(id);
            } else if (status === STATUS.COMPLETED) {
                rememberCompleted(data);
                invites = invites.filter(i => i.id !== id);
            } else {
                const idx = invites.findIndex(i => i.id === id);
                if (idx >= 0) invites[idx] = data;
                else invites.unshift(data);
            }
            emit();
            return data;
        } catch (err) {
            console.error('CoopQuests.updateInvite:', err);
            notify('Co-op session error', '#ef4444');
            return null;
        }
    }

    async function transitionToStarted(id) {
        const invite = getInvite(id);
        if (!invite || invite.status !== STATUS.ACCEPTED) return null;
        const started = await patchInvite(id, {
            status: STATUS.STARTED,
            together_q_idx: 0,
            together_correct: 0,
            together_pick: null,
        });
        return started || updateInvite(id, STATUS.STARTED);
    }

    let acceptLaunchId = null;

    function triggerCoopLaunch(invite) {
        if (!invite || invite.status !== STATUS.STARTED) return;
        if (typeof window.tryLaunchCoopSession === 'function') {
            Promise.resolve(window.tryLaunchCoopSession(invite)).catch(err => {
                console.warn('CoopQuests.launch:', err);
            });
        }
    }

    function maybeAutoLaunchSessions() {
        const u = me();
        if (!u) return;
        invites.forEach(inv => {
            if (acceptLaunchId && inv.id === acceptLaunchId) return;
            if (
                inv.status === STATUS.STARTED
                && (inv.host_id === u.id || inv.guest_id === u.id)
                && isRecentSession(inv, 300)
            ) {
                triggerCoopLaunch(inv);
            }
        });
    }

    async function acceptInvite(id) {
        const invite = getInvite(id);
        if (!invite || invite.status !== STATUS.PENDING) return null;
        const u = me();
        if (!u || invite.guest_id !== u.id) return null;

        acceptLaunchId = id;
        try {
            const accepted = await updateInvite(id, STATUS.ACCEPTED);
            if (!accepted) return null;
            const started = await transitionToStarted(id);
            if (!started) return null;

            notify('You\'re in the lobby — starting quest!', '#86efac');

            if (typeof window.openQuestPreview === 'function') {
                await window.openQuestPreview(started.quest_id, started.difficulty, { coopInvite: started });
            }
            if (typeof window.tryLaunchCoopSession === 'function') {
                await window.tryLaunchCoopSession(started);
            }
            return started;
        } finally {
            acceptLaunchId = null;
        }
    }

    async function declineInvite(id) {
        const invite = getInvite(id);
        if (!invite || invite.status !== STATUS.PENDING) return null;
        const u = me();
        if (!u || invite.guest_id !== u.id) return null;
        return updateInvite(id, STATUS.DECLINED);
    }

    async function leaveCoopSession(id, silent) {
        const invite = getInvite(id);
        if (!invite) return null;
        const u = me();
        if (!u || (invite.host_id !== u.id && invite.guest_id !== u.id)) return null;
        if (![STATUS.ACCEPTED, STATUS.STARTED].includes(invite.status)) return null;
        const data = await updateInvite(id, STATUS.CANCELLED);
        if (data && !silent) notify('Co-op session ended', '#6b7280');
        return data;
    }

    async function cancelInvite(id, silent) {
        const invite = getInvite(id);
        if (!invite) return null;
        const u = me();
        if (!u || invite.host_id !== u.id) return null;
        if (![STATUS.PENDING, STATUS.ACCEPTED, STATUS.STARTED].includes(invite.status)) return null;
        const data = await updateInvite(id, STATUS.CANCELLED);
        if (data && !silent) notify('Invite cancelled', '#6b7280');
        return data;
    }

    async function markStarted(id) {
        const invite = getInvite(id);
        if (!invite || invite.status !== STATUS.ACCEPTED) return null;
        const u = me();
        if (!u || invite.host_id !== u.id) return null;
        return updateInvite(id, STATUS.STARTED);
    }

    async function markCompleted(id) {
        return updateInvite(id, STATUS.COMPLETED);
    }

    async function markRaceFinish(id, correct, total) {
        const c = client();
        const u = me();
        if (!c || !u) return null;

        const invite = getInvite(id);
        if (!invite || !isRaceInvite(invite)) {
            await markCompleted(id);
            return { won: true, solo: true, correct, total };
        }

        try {
            const { data, error } = await c
                .from('coop_quest_invites')
                .update({
                    status: STATUS.COMPLETED,
                    winner_id: u.id,
                    winner_correct: correct,
                    winner_total: total,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .eq('status', STATUS.STARTED)
                .is('winner_id', null)
                .select()
                .maybeSingle();

            if (error && !/winner_id|PGRST116/i.test(error.message || '')) {
                throw error;
            }

            if (data) {
                rememberCompleted(data);
                invites = invites.filter(i => i.id !== id);
                emit();
                return { won: true, correct, total, invite: data };
            }
        } catch (err) {
            if (!/winner_id/i.test(err?.message || '')) {
                console.warn('CoopQuests.markRaceFinish:', err);
            }
        }

        const fresh = getInvite(id) || await fetchInviteById(id);
        if (fresh?.winner_id) {
            rememberCompleted(fresh);
            const won = fresh.winner_id === u.id;
            return {
                won,
                correct,
                total,
                invite: fresh,
                winnerId: fresh.winner_id,
                winnerCorrect: fresh.winner_correct,
                winnerTotal: fresh.winner_total,
            };
        }

        await markCompleted(id);
        return { won: true, correct, total, fallback: true };
    }

    async function fetchInviteById(id) {
        const c = client();
        const u = me();
        if (!c || !u) return null;
        try {
            const { data, error } = await c
                .from('coop_quest_invites')
                .select('*')
                .eq('id', id)
                .maybeSingle();
            if (error) throw error;
            if (data?.status === STATUS.COMPLETED) rememberCompleted(data);
            return data;
        } catch (err) {
            console.warn('CoopQuests.fetchInviteById:', err);
            return null;
        }
    }

    function ensureToast() {
        if (toastEl) return toastEl;
        toastEl = document.getElementById('coop-invite-toast');
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.id = 'coop-invite-toast';
            toastEl.className = 'coop-invite-toast';
            document.body.appendChild(toastEl);
        }
        return toastEl;
    }

    function renderToast() {
        const el = ensureToast();
        const u = me();
        if (!u) {
            el.innerHTML = '';
            el.classList.remove('show');
            return;
        }

        const incoming = invites.filter(i =>
            i.guest_id === u.id && i.status === STATUS.PENDING
        );

        if (!incoming.length) {
            el.innerHTML = '';
            el.classList.remove('show');
            return;
        }

        el.classList.add('show');
        el.innerHTML = incoming.map(inv => {
            const host = partnerProfile(inv);
            const title = questTitle(inv.quest_id);
            const hostName = esc(host?.username || 'Friend');

            const typeLabel = coopTypeLabel(inv.coop_type);
            if (inv.status === STATUS.PENDING) {
                return `
                    <div class="coop-toast-card" data-invite="${inv.id}">
                        <div class="coop-toast-text">
                            <strong>${hostName}</strong> invites you to Co-op (${esc(typeLabel)}): <em>${esc(title)}</em>
                        </div>
                        <div class="coop-toast-actions">
                            <button type="button" class="coop-toast-accept" data-invite="${inv.id}">Accept</button>
                            <button type="button" class="coop-toast-decline" data-invite="${inv.id}">Decline</button>
                        </div>
                    </div>`;
            }

            return '';
        }).filter(Boolean).join('');

        el.querySelectorAll('.coop-toast-accept').forEach(btn => {
            btn.addEventListener('click', async () => {
                await acceptInvite(btn.dataset.invite);
            });
        });
        el.querySelectorAll('.coop-toast-decline').forEach(btn => {
            btn.addEventListener('click', async () => {
                await declineInvite(btn.dataset.invite);
            });
        });
    }

    function subscribeRealtime() {
        const c = client();
        const u = me();
        if (!c || !u || realtimeChannel || !c.channel) return;

        try {
            realtimeChannel = c
                .channel('coop-invites-' + u.id)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'coop_quest_invites',
                }, () => loadInvites())
                .subscribe();
        } catch (e) { /* optional */ }

        if (!pollTimer) {
            pollTimer = setInterval(() => {
                if (me()) loadInvites();
            }, 3000);
        }
    }

    function refresh() {
        loadInvites();
        subscribeRealtime();
    }

    document.addEventListener('gq-auth-ready', refresh);
    document.addEventListener('gq-auth-logout', () => {
        invites = [];
        emit();
        if (realtimeChannel) {
            try { realtimeChannel.unsubscribe(); } catch (e) { /* ignore */ }
            realtimeChannel = null;
        }
    });

    refresh();

    return {
        STATUS,
        COOP_TYPES,
        COOP_TYPE_LABELS,
        coopTypeLabel,
        isLobbyHost,
        onChange,
        refresh,
        loadInvites,
        getInvite,
        getLobbyInviteForQuest,
        getActiveInviteForQuest,
        cleanupStaleHostSessions,
        resetHostLobby,
        isRecentSession,
        isCoopReady,
        canStartCoop,
        canLaunchCoop,
        canJoinCoop,
        sendInvite,
        acceptInvite,
        declineInvite,
        cancelInvite,
        leaveCoopSession,
        triggerCoopLaunch,
        transitionToStarted,
        maybeAutoLaunchSessions,
        markCompleted,
        markRaceFinish,
        isRaceInvite,
        isTogetherInvite,
        publishTogetherAnswer,
        advanceTogetherQuestion,
        fetchInviteById,
        partnerProfile,
        questTitle,
    };
})();
