// Early bindings for the main hero buttons. They stay working even if later widgets fail.
document.addEventListener('DOMContentLoaded', function() {
    function showAuthMessage(type, message) {
        const error = document.getElementById('auth-error');
        const success = document.getElementById('auth-success');
        if (error) error.classList.toggle('show', type === 'error');
        if (success) success.classList.toggle('show', type === 'success');
        if (type === 'error' && error) error.textContent = message;
        if (type === 'success' && success) success.textContent = message;
    }

    function openAuthDialog(tab) {
        const authModal = document.getElementById('auth-modal');
        if (!authModal) return;

        const targetTab = tab || 'login';
        document.querySelectorAll('.auth-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === targetTab);
        });
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.toggle('active', form.id === `auth-${targetTab}-form`);
        });

        const title = document.getElementById('auth-title');
        if (title) title.textContent = targetTab === 'register' ? 'Sign Up' : 'Login';
        authModal.classList.add('active');
    }

    function showPageFallback(pageName) {
        ['home', 'leaderboard', 'quests', 'profile', 'settings'].forEach(name => {
            const page = document.getElementById(`${name}-page`);
            if (!page) return;
            const isActive = name === pageName;
            page.style.display = isActive ? 'block' : 'none';
            page.classList.toggle('active', isActive);
        });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === pageName);
        });
    }

    function setEarlyProgress(profile, isLoggedIn) {
        const progress = typeof window.getProfileProgress === 'function'
            ? window.getProfileProgress(profile)
            : { level: 0, xpIntoLevel: 0, xpForNext: 1000, percent: 0, xp: 0 };
        const { level, xpIntoLevel, xpForNext, percent, xp } = progress;

        const levelEl = document.querySelector('.profile-level');
        const xpEl = document.querySelector('.profile-xp');
        const progressFill = document.querySelector('.profile-header .progress-fill');
        const headerStats = document.getElementById('header-player-stats');
        const headerLevel = document.getElementById('header-player-level');
        const headerXp = document.getElementById('header-player-xp');

        if (levelEl) levelEl.textContent = `Level: ${level}`;
        if (xpEl) {
            xpEl.textContent = `XP: ${xpIntoLevel.toLocaleString('en-US')} XP / ${xpForNext.toLocaleString('en-US')} XP`;
        }
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (headerLevel) headerLevel.textContent = String(level);
        if (headerXp) headerXp.textContent = xp >= 1000 ? `${(xp / 1000).toFixed(1).replace('.0', '')}K XP` : `${xp} XP`;
        if (headerStats) {
            headerStats.hidden = !isLoggedIn;
            headerStats.classList.toggle('show', isLoggedIn);
        }
    }

    async function ensureEarlyProfile(client, user) {
        if (!client || !user) return null;
        try {
            const { data, error } = await client
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();
            if (!error && data) return data;
        } catch (err) {
            console.warn('Could not load profile:', err);
        }

        const username = user.user_metadata?.username || user.email.split('@')[0];
        try {
            const { data, error } = await client
                .from('profiles')
                .insert({ user_id: user.id, username, xp: 0, level: 0 })
                .select('*')
                .single();
            if (!error && data) return data;
        } catch (err) {
            console.warn('Could not create profile with XP fields:', err);
        }

        try {
            const { data, error } = await client
                .from('profiles')
                .insert({ user_id: user.id, username })
                .select('*')
                .single();
            if (!error && data) return { ...data, xp: 0, level: 0 };
        } catch (err) {
            console.warn('Could not create basic profile:', err);
        }

        return { user_id: user.id, username, xp: 0, level: 0 };
    }

    function applyEarlyAuthState(user, profile) {
        const isLoggedIn = !!user;
        window.currentUser = user || null;
        window.currentProfile = profile || null;
        document.body.classList.toggle('is-authenticated', isLoggedIn);

        document.querySelectorAll('.nav-auth-only').forEach(item => {
            item.style.display = isLoggedIn ? '' : 'none';
        });

        const loginBtn = document.getElementById('hero-login-btn');
        if (loginBtn) loginBtn.style.display = isLoggedIn ? 'none' : '';

        const ctaLabel = document.getElementById('hero-cta-label');
        if (ctaLabel) ctaLabel.textContent = isLoggedIn ? 'Start Playing' : 'Start for Free';

        const name = profile?.username || user?.email?.split('@')[0] || 'Player';
        const profileName = document.querySelector('.profile-name');
        if (profileName && isLoggedIn) {
            if (typeof window.mountDisplayName === 'function') window.mountDisplayName(profileName, name);
            else profileName.textContent = name;
        }

        const usernameInput = document.getElementById('username');
        if (usernameInput && isLoggedIn) usernameInput.value = name;

        if (isLoggedIn) {
            setEarlyProgress(profile, true);
        } else {
            setEarlyProgress(null, false);
        }
    }

    window.gameQuestOpenAuthModal = openAuthDialog;
    window.gameQuestShowPage = showPageFallback;
    window.gameQuestApplyAuthState = applyEarlyAuthState;

    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.dataset.earlyBound) return;
        link.dataset.earlyBound = '1';
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = link.dataset.page;
            if (page) showPageFallback(page);
        });
    });

    document.querySelectorAll('.auth-tab, [data-switch]').forEach(btn => {
        if (btn.dataset.earlyBound) return;
        btn.dataset.earlyBound = '1';
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            openAuthDialog(btn.dataset.tab || btn.dataset.switch || 'login');
        });
    });

    const authClose = document.getElementById('auth-close');
    if (authClose && !authClose.dataset.earlyBound) {
        authClose.dataset.earlyBound = '1';
        authClose.addEventListener('click', () => {
            document.getElementById('auth-modal')?.classList.remove('active');
        });
    }

    const startBtn = document.getElementById('hero-start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.currentUser) {
                showPageFallback('quests');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                openAuthDialog('register');
            }
        });
    }

    const loginBtn = document.getElementById('hero-login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openAuthDialog('login');
        });
    }

    const loginForm = document.getElementById('auth-login-form');
    if (loginForm && !loginForm.dataset.earlyBound) {
        loginForm.dataset.earlyBound = '1';
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            const client = typeof initSupabaseClient === 'function' ? initSupabaseClient() : null;
            if (!client) {
                showAuthMessage('error', 'Auth is still loading. Check your internet connection and try again.');
                return;
            }

            const email = document.getElementById('login-email')?.value.trim();
            const password = document.getElementById('login-password')?.value;
            if (!email || !password) {
                showAuthMessage('error', 'Enter email and password');
                return;
            }

            const submit = document.getElementById('login-submit');
            if (submit) {
                submit.disabled = true;
                submit.textContent = 'Logging in...';
            }

            try {
                const { data, error } = await client.auth.signInWithPassword({ email, password });
                if (error) throw error;
                window.currentUser = data.user;
                const profile = await ensureEarlyProfile(client, data.user);
                applyEarlyAuthState(data.user, profile);
                showAuthMessage('success', 'Success! Loading profile...');
                setTimeout(() => {
                    document.getElementById('auth-modal')?.classList.remove('active');
                    showPageFallback('profile');
                }, 450);
            } catch (err) {
                const msg = (err.message || '').includes('Invalid login credentials') ? 'Invalid email or password' : (err.message || 'Login error');
                showAuthMessage('error', msg);
            } finally {
                if (submit) {
                    submit.disabled = false;
                    submit.textContent = 'Log In';
                }
            }
        });
    }

    const registerForm = document.getElementById('auth-register-form');
    if (registerForm && !registerForm.dataset.earlyBound) {
        registerForm.dataset.earlyBound = '1';
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            const client = typeof initSupabaseClient === 'function' ? initSupabaseClient() : null;
            if (!client) {
                showAuthMessage('error', 'Auth is still loading. Check your internet connection and try again.');
                return;
            }

            const username = document.getElementById('register-username')?.value.trim();
            const email = document.getElementById('register-email')?.value.trim();
            const password = document.getElementById('register-password')?.value;
            if (!username || username.length < 2) {
                showAuthMessage('error', 'Enter a name (minimum 2 characters)');
                return;
            }
            if (!email || !email.includes('@')) {
                showAuthMessage('error', 'Enter a valid email');
                return;
            }
            if (!password || password.length < 6) {
                showAuthMessage('error', 'Password must be at least 6 characters');
                return;
            }

            const submit = document.getElementById('register-submit');
            if (submit) {
                submit.disabled = true;
                submit.textContent = 'Creating...';
            }

            try {
                const { error } = await client.auth.signUp({
                    email,
                    password,
                    options: { data: { username } }
                });
                if (error) throw error;
                showAuthMessage('success', 'Account created! You can log in.');
                registerForm.reset();
                setTimeout(() => openAuthDialog('login'), 900);
            } catch (err) {
                const msg = (err.message || '').includes('already registered') ? 'This email is already registered' : (err.message || 'Registration error');
                showAuthMessage('error', msg);
            } finally {
                if (submit) {
                    submit.disabled = false;
                    submit.textContent = 'Create Account';
                }
            }
        });
    }

    const authClient = typeof initSupabaseClient === 'function' ? initSupabaseClient() : null;
    if (authClient) {
        authClient.auth.getSession().then(async ({ data }) => {
            if (data?.session?.user) {
                const profile = await ensureEarlyProfile(authClient, data.session.user);
                applyEarlyAuthState(data.session.user, profile);
            } else {
                applyEarlyAuthState(null, null);
            }
        }).catch(err => console.warn('Could not read auth session:', err));

        authClient.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const profile = await ensureEarlyProfile(authClient, session.user);
                applyEarlyAuthState(session.user, profile);
            } else {
                applyEarlyAuthState(null, null);
            }
        });
    }
});
