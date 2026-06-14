/**
 * Online presence via profiles.last_seen_at heartbeat.
 */
window.Presence = (function () {
    const ONLINE_THRESHOLD_MS = 90 * 1000;
    const HEARTBEAT_MS = 45 * 1000;

    let heartbeatTimer = null;
    let started = false;
    let onVisibility = null;

    function client() {
        if (window.supabaseClient) return window.supabaseClient;
        if (typeof window.initSupabaseClient === 'function') return window.initSupabaseClient();
        return null;
    }

    function me() {
        return window.currentUser || null;
    }

    function lastSeenMs(profile) {
        const raw = profile?.last_seen_at ?? profile?.last_seen;
        if (!raw) return null;
        const ms = new Date(raw).getTime();
        return Number.isFinite(ms) ? ms : null;
    }

    function isOnline(profile) {
        if (!profile) return false;
        const u = me();
        if (u && profile.user_id === u.id) return true;
        const seen = lastSeenMs(profile);
        if (seen == null) return false;
        return Date.now() - seen < ONLINE_THRESHOLD_MS;
    }

    function statusText(profile) {
        if (isOnline(profile)) return { text: 'online', online: true };
        return { text: 'offline', online: false };
    }

    async function sendHeartbeat() {
        const c = client();
        const u = me();
        if (!c || !u || document.hidden) return false;

        const now = new Date().toISOString();
        try {
            const { error } = await c
                .from('profiles')
                .update({ last_seen_at: now })
                .eq('user_id', u.id);
            if (error) throw error;
            if (window.currentProfile) window.currentProfile.last_seen_at = now;
            return true;
        } catch (err) {
            if (!/last_seen_at/i.test(err.message || '')) {
                console.warn('Presence heartbeat failed:', err);
            }
            return false;
        }
    }

    async function markOffline() {
        const c = client();
        const u = me();
        if (!c || !u) return;

        try {
            const { error } = await c
                .from('profiles')
                .update({ last_seen_at: null })
                .eq('user_id', u.id);
            if (error) throw error;
            if (window.currentProfile) window.currentProfile.last_seen_at = null;
        } catch (err) {
            if (!/last_seen_at/i.test(err.message || '')) {
                console.warn('Presence markOffline failed:', err);
            }
        }
    }

    function start() {
        if (started) return;
        if (!me()) return;
        started = true;
        sendHeartbeat();
        heartbeatTimer = setInterval(sendHeartbeat, HEARTBEAT_MS);
        onVisibility = () => {
            if (!document.hidden) sendHeartbeat();
        };
        document.addEventListener('visibilitychange', onVisibility);
    }

    async function stop(markAway) {
        if (!started && !markAway) return;
        started = false;
        if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
        }
        if (onVisibility) {
            document.removeEventListener('visibilitychange', onVisibility);
            onVisibility = null;
        }
        if (markAway) await markOffline();
    }

    return {
        ONLINE_THRESHOLD_MS,
        isOnline,
        statusText,
        start,
        stop,
        sendHeartbeat,
        markOffline,
    };
})();
