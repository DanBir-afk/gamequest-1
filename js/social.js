window.__gqParts.push(function () {
    const SOCIAL_SVGS = {
        discord: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.445.865-.608 1.25-1.845-.276-3.68-.276-5.487 0-.164-.393-.406-.874-.618-1.25a.077.077 0 0 0-.078-.037 19.736 19.736 0 0 0-4.885 1.515.07.07 0 0 0-.032.028C.533 9.046-.319 13.58.099 18.058a.082.082 0 0 0 .031.056c2.053 1.508 4.041 2.423 5.993 3.029a.078.078 0 0 0 .084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.042-.106 12.3 12.3 0 0 1-1.873-.891.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .079.01c.12.099.246.198.373.292a.077.077 0 0 1-.007.128 12.299 12.299 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 0 0 .084.029c1.961-.607 3.95-1.522 6.002-3.029a.077.077 0 0 0 .031-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.029zM8.02 15.33c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.211 0 2.176 1.095 2.157 2.419 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.095 2.157 2.419 0 1.333-.946 2.419-2.157 2.419z"/></svg>',
        telegram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
        twitter: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>',
        youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
        twitch: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0 1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>',
        instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.97.24 2.427.403a4.92 4.92 0 0 1 1.775 1.153 4.92 4.92 0 0 1 1.153 1.775c.163.457.349 1.257.403 2.427.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.24 1.97-.403 2.427a4.92 4.92 0 0 1-1.153 1.775 4.92 4.92 0 0 1-1.775 1.153c-.457.163-1.257.349-2.427.403-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.97-.24-2.427-.403a4.92 4.92 0 0 1-1.775-1.153 4.92 4.92 0 0 1-1.153-1.775c-.163-.457-.349-1.257-.403-2.427C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.054-1.17.24-1.97.403-2.427a4.92 4.92 0 0 1 1.153-1.775A4.92 4.92 0 0 1 5.491 2.636c.457-.163 1.257-.349 2.427-.403C8.416 2.175 8.796 2.163 12 2.163zm0 1.622c-3.15 0-3.516.012-4.75.068-1 .046-1.548.217-1.91.361a3.1 3.1 0 0 0-1.12.73 3.1 3.1 0 0 0-.73 1.12c-.144.362-.315.91-.361 1.91-.056 1.234-.068 1.6-.068 4.75s.012 3.516.068 4.75c.046 1 .217 1.548.361 1.91.16.428.377.82.73 1.12.3.353.692.57 1.12.73.362.144.91.315 1.91.361 1.234.056 1.6.068 4.75.068s3.516-.012 4.75-.068c1-.046 1.548-.217 1.91-.361a3.1 3.1 0 0 0 1.12-.73 3.1 3.1 0 0 0 .73-1.12c.144-.362.315-.91.361-1.91.056-1.234.068-1.6.068-4.75s-.012-3.516-.068-4.75c-.046-1-.217-1.548-.361-1.91a3.1 3.1 0 0 0-.73-1.12 3.1 3.1 0 0 0-1.12-.73c-.362-.144-.91-.315-1.91-.361-1.234-.056-1.6-.068-4.75-.068zm0 3.351a4.864 4.864 0 1 1 0 9.728 4.864 4.864 0 0 1 0-9.728zm0 1.622a3.242 3.242 0 1 0 0 6.484 3.242 3.242 0 0 0 0-6.484zm5.338-3.43a1.135 1.135 0 1 1-2.27 0 1.135 1.135 0 0 1 2.27 0z"/></svg>',
        steam: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.387 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.973 20.295 6.623 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.606 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.279 1.273l1.355-1.89a3.27 3.27 0 0 1-.161-.773zm2.388-4.858a1.608 1.608 0 0 0-1.608-1.608c-.885 0-1.608.723-1.608 1.608 0 .884.723 1.607 1.608 1.607s1.608-.723 1.608-1.607z"/></svg>',
        github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
    };

    const SOCIAL_PLATFORMS = [
        { id: 'discord', name: 'Discord', placeholder: 'https://discord.gg/invite' },
        { id: 'telegram', name: 'Telegram', placeholder: 'https://t.me/username' },
        { id: 'twitter', name: 'X', placeholder: 'https://x.com/username' },
        { id: 'youtube', name: 'YouTube', placeholder: 'https://youtube.com/@channel' },
        { id: 'twitch', name: 'Twitch', placeholder: 'https://twitch.tv/username' },
        { id: 'instagram', name: 'Instagram', placeholder: 'https://instagram.com/username' },
        { id: 'steam', name: 'Steam', placeholder: 'https://steamcommunity.com/id/username' },
        { id: 'github', name: 'GitHub', placeholder: 'https://github.com/username' },
    ];

    function socialIconHtml(id) {
        return SOCIAL_SVGS[id] || '';
    }

    const SOCIAL_KEY = 'gq_social_links';
    const profileSocialList = document.getElementById('profile-social-list');
    const settingsSocialList = document.getElementById('settings-social-list');

    function socialStorageKey() {
        const u = window.currentUser;
        return u && u.id ? `gamequest_${u.id}_social_links` : SOCIAL_KEY;
    }

    function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

    function escapeHtml(s) {
        const d = document.createElement('div');
        d.textContent = s == null ? '' : s;
        return d.innerHTML;
    }

    function normalizeSocialUrl(url) {
        const s = String(url || '').trim();
        if (!s) return '';
        if (/^https?:\/\//i.test(s)) return s;
        return `https://${s.replace(/^\/+/, '')}`;
    }

    function cleanSocialLinks(raw) {
        const out = {};
        if (!raw || typeof raw !== 'object') return out;
        SOCIAL_PLATFORMS.forEach(p => {
            const url = normalizeSocialUrl(raw[p.id]);
            if (url) out[p.id] = url;
        });
        return out;
    }

    function loadSocialLinks() {
        const saved = safeGet(socialStorageKey()) || safeGet(SOCIAL_KEY);
        if (!saved) return {};
        try {
            return cleanSocialLinks(JSON.parse(saved));
        } catch (e) {
            return {};
        }
    }

    function saveSocialLinks(links) {
        const clean = cleanSocialLinks(links);
        safeSet(socialStorageKey(), JSON.stringify(clean));
        safeSet(SOCIAL_KEY, JSON.stringify(clean));
        return clean;
    }

    let socialDraft = { ...loadSocialLinks() };

    function renderProfileSocialList(links, container) {
        const el = container || profileSocialList;
        if (!el) return;
        const clean = cleanSocialLinks(links);
        const items = SOCIAL_PLATFORMS.filter(p => clean[p.id]);
        if (!items.length) {
            el.innerHTML = '<div class="profile-social-empty">Add links in Settings → Profile</div>';
            return;
        }
        el.innerHTML = items.map(p => `
            <a class="profile-social-link social-${p.id}" href="${escapeHtml(clean[p.id])}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(p.name)}">
                <span class="profile-social-icon social-icon-${p.id}" aria-hidden="true">${socialIconHtml(p.id)}</span>
                <span class="profile-social-name">${escapeHtml(p.name)}</span>
            </a>`).join('');
    }

    function renderSettingsSocialList() {
        if (!settingsSocialList) return;
        settingsSocialList.innerHTML = SOCIAL_PLATFORMS.map(p => `
            <div class="settings-social-row">
                <label class="settings-social-label" for="social-${p.id}">
                    <span class="settings-social-label-icon social-icon-${p.id}" aria-hidden="true">${socialIconHtml(p.id)}</span>
                    <span>${p.name}</span>
                </label>
                <input
                    type="url"
                    id="social-${p.id}"
                    class="settings-social-input"
                    data-id="${p.id}"
                    value="${escapeHtml(socialDraft[p.id] || '')}"
                    placeholder="${escapeHtml(p.placeholder)}"
                    autocomplete="off"
                    spellcheck="false">
            </div>`).join('');

        settingsSocialList.querySelectorAll('.settings-social-input').forEach(input => {
            input.addEventListener('input', () => {
                const id = input.dataset.id;
                const val = input.value.trim();
                if (val) socialDraft[id] = val;
                else delete socialDraft[id];
                const clean = saveSocialLinks(socialDraft);
                socialDraft = { ...clean };
                renderProfileSocialList(clean);
                if (window.currentProfile) window.currentProfile.social_links = clean;
                if (typeof window.scheduleSettingsAutoSave === 'function') {
                    window.scheduleSettingsAutoSave();
                }
            });
        });
    }

    function readSocialFromInputs() {
        const links = { ...socialDraft };
        if (!settingsSocialList) return cleanSocialLinks(links);
        settingsSocialList.querySelectorAll('.settings-social-input').forEach(input => {
            const val = input.value.trim();
            if (val) links[input.dataset.id] = val;
            else delete links[input.dataset.id];
        });
        return cleanSocialLinks(links);
    }

    renderProfileSocialList(socialDraft);
    renderSettingsSocialList();

    window.getSocialSelected = function () {
        return cleanSocialLinks(readSocialFromInputs());
    };

    window.commitSocialLinks = function () {
        const clean = saveSocialLinks(readSocialFromInputs());
        socialDraft = { ...clean };
        if (window.currentProfile) window.currentProfile.social_links = clean;
        renderSettingsSocialList();
        renderProfileSocialList(clean);
        return clean;
    };

    window.resetSocialDraft = function () {
        socialDraft = { ...loadSocialLinks() };
        renderSettingsSocialList();
        renderProfileSocialList(socialDraft);
    };

    window.setSocialLinks = function (links, options) {
        const dbClean = cleanSocialLinks(links);
        let clean = dbClean;
        const usedLocal = !!(options && options.preferLocalIfEmpty && !Object.keys(dbClean).length);
        if (usedLocal) {
            const local = loadSocialLinks();
            if (Object.keys(local).length) clean = local;
        }
        socialDraft = { ...clean };
        saveSocialLinks(clean);
        if (window.currentProfile) window.currentProfile.social_links = clean;
        renderSettingsSocialList();
        renderProfileSocialList(clean);
        if (options && options.syncToAccount && usedLocal && Object.keys(clean).length
            && typeof window.scheduleSettingsAutoSave === 'function') {
            window.scheduleSettingsAutoSave();
        }
    };

    window.socialLinksHtml = function (links) {
        const clean = cleanSocialLinks(links);
        const items = SOCIAL_PLATFORMS.filter(p => clean[p.id]);
        if (!items.length) {
            return '<div class="profile-social-empty">No social links yet</div>';
        }
        return items.map(p => `
            <a class="profile-social-link social-${p.id}" href="${escapeHtml(clean[p.id])}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(p.name)}">
                <span class="profile-social-icon social-icon-${p.id}" aria-hidden="true">${socialIconHtml(p.id)}</span>
                <span class="profile-social-name">${escapeHtml(p.name)}</span>
            </a>`).join('');
    };

    window.renderProfileSocialList = renderProfileSocialList;
});
