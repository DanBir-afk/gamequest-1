window.__gqParts.push(function() {
// ===== AUTH (Supabase) =====
try {
const accountWidget = document.getElementById('account-widget');
if (!accountWidget) {
    console.error('account-widget not found in DOM!');
}
const authModal = document.getElementById('auth-modal');

// Auth-gated navigation: toggle body class
function updateNavGate(isLoggedIn) {
    document.body.classList.toggle('is-authenticated', isLoggedIn);
    // Also set nav items inline display (in case CSS doesn't load yet)
    document.querySelectorAll('.nav-auth-only').forEach(li => {
        li.style.display = isLoggedIn ? '' : 'none';
    });
    updateHeaderPlayerStats(window.currentProfile, isLoggedIn);
    // Hero CTA label
    const ctaLabel = document.getElementById('hero-cta-label');
    if (ctaLabel) {
        ctaLabel.textContent = isLoggedIn ? 'Start Playing' : 'Start for Free';
    }
    // Hero login button
    const heroLogin = document.getElementById('hero-login-btn');
    if (heroLogin) {
        heroLogin.style.display = isLoggedIn ? 'none' : '';
    }
    // If user is on a protected page while logged out, redirect home
    if (!isLoggedIn) {
        const visiblePages = document.querySelectorAll('[id$="-page"]');
        visiblePages.forEach(p => {
            if (p.id !== 'home-page' && getComputedStyle(p).display !== 'none') {
                if (typeof window.showPage === 'function') window.showPage('home');
            }
        });
    }
}
const authClose = document.getElementById('auth-close');
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');
const authError = document.getElementById('auth-error');
const authSuccess = document.getElementById('auth-success');
const loginForm = document.getElementById('auth-login-form');
const registerForm = document.getElementById('auth-register-form');
const loginSubmit = document.getElementById('login-submit');
const registerSubmit = document.getElementById('register-submit');

let currentUser = null;
let currentProfile = null;

function parseStatNumber(value, fallback) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const match = value.match(/-?\d[\d\s,.]*/);
        const parsed = match ? Number(match[0].replace(/[^\d.-]/g, '')) : NaN;
        if (Number.isFinite(parsed)) return /k/i.test(value) ? parsed * 1000 : parsed;
    }
    return fallback;
}

function profileStat(profile, keys, fallback) {
    if (!profile) return fallback;
    for (const key of keys) {
        if (profile[key] !== undefined && profile[key] !== null && profile[key] !== '') {
            return profile[key];
        }
    }
    return fallback;
}

function formatHeaderXp(value) {
    const xp = parseStatNumber(value, 0);
    if (xp >= 1000) {
        return `${(xp / 1000).toFixed(1).replace('.0', '')}K XP`;
    }
    return `${xp} XP`;
}

function updateHeaderPlayerStats(profile, isLoggedIn) {
    const stats = document.getElementById('header-player-stats');
    if (!stats) return;

    if (!isLoggedIn) {
        stats.hidden = true;
        stats.classList.remove('show');
        return;
    }

    const profileXp = parseStatNumber(profileStat(profile, ['xp', 'experience', 'points'], null), null);
    const xp = profileXp ?? 0;
    const level = typeof window.getProfileLevel === 'function'
        ? window.getProfileLevel(profile)
        : 0;

    const levelEl = document.getElementById('header-player-level');
    const xpEl = document.getElementById('header-player-xp');
    if (levelEl) levelEl.textContent = String(level);
    if (xpEl) xpEl.textContent = formatHeaderXp(xp);

    stats.hidden = false;
    stats.classList.add('show');
}

function showAuthError(msg) {
    authError.textContent = msg;
    authError.classList.add('show');
    authSuccess.classList.remove('show');
}

function showAuthSuccess(msg) {
    authSuccess.textContent = msg;
    authSuccess.classList.add('show');
    authError.classList.remove('show');
}

function clearAuthMessages() {
    authError.classList.remove('show');
    authSuccess.classList.remove('show');
}

function switchAuthTab(tab) {
    // Tabs at top show only login/register; forgot is "hidden mode"
    if (tab === 'forgot') {
        authTabs.forEach(t => t.classList.remove('active'));
        document.getElementById('auth-title').textContent = 'Password Recovery';
    } else {
        authTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
        document.getElementById('auth-title').textContent = tab === 'login' ? 'Login' : 'Sign Up';
    }
    authForms.forEach(f => f.classList.toggle('active', f.id === `auth-${tab}-form`));
    clearAuthMessages();
}

authTabs.forEach(t => t.addEventListener('click', () => switchAuthTab(t.dataset.tab)));
document.querySelectorAll('[data-switch]').forEach(a => {
    a.addEventListener('click', () => switchAuthTab(a.dataset.switch));
});

// Password show/hide toggle
document.querySelectorAll('.auth-pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.target);
        if (!target) return;
        if (target.type === 'password') {
            target.type = 'text';
            btn.textContent = '🙈';
        } else {
            target.type = 'password';
            btn.textContent = '👁️';
        }
    });
});

// Forgot password link
const forgotLink = document.getElementById('auth-forgot-link');
if (forgotLink) {
    forgotLink.addEventListener('click', () => switchAuthTab('forgot'));
}

// Forgot password submit
const forgotForm = document.getElementById('auth-forgot-form');
if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAuthMessages();
        const email = document.getElementById('forgot-email').value.trim();
        if (!email || !email.includes('@')) {
            showAuthError('Enter a valid email');
            return;
        }
        const submitBtn = document.getElementById('forgot-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        try {
            const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + window.location.pathname
            });
            if (error) throw error;
            showAuthSuccess('Email sent! Check your inbox and spam folder.');
            forgotForm.reset();
        } catch (err) {
            showAuthError(err.message || 'Could not send email');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Link';
        }
    });
}

function openAuthModal(tab = 'login') {
    switchAuthTab(tab);
    authModal.classList.add('active');
}

function closeAuthModal() {
    authModal.classList.remove('active');
    clearAuthMessages();
}

authClose.addEventListener('click', closeAuthModal);
authModal.addEventListener('click', e => {
    if (e.target === authModal) closeAuthModal();
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && authModal.classList.contains('active')) closeAuthModal();
});

// Register
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAuthMessages();
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;

    if (!username || username.length < 2) {
        showAuthError('Enter a name (minimum 2 characters)');
        return;
    }
    if (!email || !email.includes('@')) {
        showAuthError('Enter a valid email');
        return;
    }
    if (password.length < 6) {
        showAuthError('Password must be at least 6 characters');
        return;
    }

    registerSubmit.disabled = true;
    registerSubmit.textContent = 'Creating...';

    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: { data: { username } }
        });
        if (error) throw error;

        // Update username in profiles table directly (in case trigger missed metadata)
        if (data?.user) {
            // Wait a moment for trigger to create profile, then update username
            setTimeout(async () => {
                try {
                    await supabaseClient
                        .from('profiles')
                        .update({ username })
                        .eq('user_id', data.user.id);
                    await supabaseClient
                        .from('profiles')
                        .update({ xp: 0, level: 0 })
                        .eq('user_id', data.user.id);
                } catch (e) {
                    console.warn('Could not update username:', e);
                }
            }, 500);
        }

        showAuthSuccess('Account created! You can log in.');
        registerForm.reset();
        setTimeout(() => switchAuthTab('login'), 1500);
    } catch (err) {
        let msg = err.message || 'Registration error';
        if (msg.includes('already registered')) msg = 'This email is already registered';
        showAuthError(msg);
    } finally {
        registerSubmit.disabled = false;
        registerSubmit.textContent = 'Create Account';
    }
});

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAuthMessages();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showAuthError('Enter email and password');
        return;
    }

    loginSubmit.disabled = true;
    loginSubmit.textContent = 'Logging in...';

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showAuthSuccess('Success! Loading profile...');
        loginForm.reset();
        setTimeout(closeAuthModal, 800);
    } catch (err) {
        let msg = err.message || 'Login error';
        if (msg.includes('Invalid login credentials')) msg = 'Invalid email or password';
        showAuthError(msg);
    } finally {
        loginSubmit.disabled = false;
        loginSubmit.textContent = 'Log In';
    }
});

async function signOut() {
    if (window.Presence?.stop) await window.Presence.stop(true);
    await supabaseClient.auth.signOut();
    currentUser = null;
    currentProfile = null;
    renderGuestWidget();
            window.showNotification('You have logged out', '#6b7280');
}

async function loadProfile(user) {
    try {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
        if (error) {
            console.warn('Profile not found yet, creating one:', error);
            const username = user.user_metadata?.username || user.email.split('@')[0];
            const baseProfile = { user_id: user.id, username };
            let created = null;

            try {
                const { data: dataWithProgress, error: createError } = await supabaseClient
                    .from('profiles')
                    .insert({ ...baseProfile, xp: 0, level: 0 })
                    .select('*')
                    .single();
                if (createError) throw createError;
                created = dataWithProgress;
            } catch (createWithProgressError) {
                console.warn('Could not create profile with XP fields, trying basic profile:', createWithProgressError);
                const { data: basicData, error: basicError } = await supabaseClient
                    .from('profiles')
                    .insert(baseProfile)
                    .select('*')
                    .single();
                if (basicError) throw basicError;
                created = { ...basicData, xp: 0, level: 0 };
            }

            return created;
        }
        return {
            ...data,
            xp: Number(data.xp ?? data.experience ?? data.points ?? 0),
            level: Number(data.level ?? data.lvl ?? data.rank_level ?? 0)
        };
    } catch (err) {
        console.error('loadProfile error:', err);
        return {
            user_id: user.id,
            username: user.user_metadata?.username || user.email.split('@')[0],
            xp: 0,
            level: 0
        };
    }
}

function renderUserWidget(user, profile) {
    const name = profile?.username || user.email.split('@')[0];
    updateHeaderPlayerStats(profile, true);
    window.updateProfileXP();

    // Hide hero login button
    const heroLogin = document.getElementById('hero-login-btn');
    if (heroLogin) heroLogin.style.display = 'none';

    if (typeof window.applyProfileSettings === 'function') {
        window.applyProfileSettings(profile);
    } else {
        const profileName = document.querySelector('.profile-name');
        if (profileName) {
            if (typeof window.mountDisplayName === 'function') window.mountDisplayName(profileName, name);
            else profileName.textContent = name;
        }
        const usernameInput = document.getElementById('username');
        if (usernameInput) usernameInput.value = name;
    }

    // Show logout button in settings
    const logoutBtn = document.getElementById('settings-logout-btn');
    if (logoutBtn) logoutBtn.style.display = '';

    // Sync security email field
    const securityEmail = document.getElementById('security-email');
    if (securityEmail) securityEmail.value = user.email;

    // Load real friends for this user
    if (window.Presence?.start) window.Presence.start();
    if (typeof window.refreshFriends === 'function') window.refreshFriends();
    if (typeof window.CoopQuests?.refresh === 'function') window.CoopQuests.refresh();
    // Refresh own guestbook (now Supabase-backed) for this user
    if (typeof window.mountOwnGuestbook === 'function') window.mountOwnGuestbook();
    if (window.Achievements) window.Achievements.evaluate({ notify: false });
    if (typeof window.renderQuickStart === 'function') window.renderQuickStart();
}

// Delete account handler
const deleteAccountBtn = document.getElementById('delete-account-btn');
if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', async () => {
        const user = window.currentUser;
        if (!user) {
            alert('You are not logged in');
            return;
        }
        const confirmText = prompt(
            'This will permanently delete your account. All data will be lost.\n\n' +
            'To confirm, type DELETE in uppercase:'
        );
        if (confirmText !== 'DELETE') {
            if (confirmText !== null) alert('Deletion cancelled');
            return;
        }
        deleteAccountBtn.disabled = true;
        deleteAccountBtn.textContent = 'Deleting...';
        try {
            // Delete the profile (auth.users will cascade-delete via FK)
            const { error } = await supabaseClient
                .from('profiles')
                .delete()
                .eq('user_id', user.id);
            if (error) throw error;
            // Sign out
            await supabaseClient.auth.signOut();
            alert('Account deleted. Goodbye!');
            location.reload();
        } catch (err) {
            alert('Deletion error: ' + (err.message || 'unknown'));
            deleteAccountBtn.disabled = false;
            deleteAccountBtn.textContent = 'Delete Account';
        }
    });
}

function renderGuestWidget() {
    updateHeaderPlayerStats(null, false);

    // Show hero login button for guests
    const heroLogin = document.getElementById('hero-login-btn');
    if (heroLogin) heroLogin.style.display = '';

    // Hide logout button (just in case settings is visible somehow)
    const logoutBtn = document.getElementById('settings-logout-btn');
    if (logoutBtn) logoutBtn.style.display = 'none';

    // Clear friends list for guests
    if (window.Presence?.stop) void window.Presence.stop(true);
    if (typeof window.refreshFriends === 'function') window.refreshFriends();
    if (typeof window.CoopQuests?.refresh === 'function') window.CoopQuests.refresh();
    if (typeof window.renderQuickStart === 'function') window.renderQuickStart();
}

// Wire up hero login button
const heroLoginBtn = document.getElementById('hero-login-btn');
if (heroLoginBtn) {
    heroLoginBtn.addEventListener('click', () => openAuthModal('login'));
}

// Wire up settings logout button
const settingsLogoutBtn = document.getElementById('settings-logout-btn');
if (settingsLogoutBtn) {
    settingsLogoutBtn.addEventListener('click', async () => {
        if (confirm('Log out of your account?')) {
            await signOut();
            if (typeof window.showPage === 'function') window.showPage('home');
        }
    });
}

// Listen to auth state changes
supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
        currentUser = session.user;
        currentProfile = await loadProfile(currentUser);
        if (!currentProfile) {
            console.warn('Profile missing in DB, signing out');
            await supabaseClient.auth.signOut();
            currentUser = null;
            window.currentUser = null;
            window.currentProfile = null;
            renderGuestWidget();
            updateNavGate(false);
            return;
        }
        window.currentUser = currentUser;
        window.currentProfile = currentProfile;
        renderUserWidget(currentUser, currentProfile);
        updateNavGate(true);
        if (typeof window.refreshQuestRatings === 'function') window.refreshQuestRatings();
    } else {
        if (window.Presence?.stop) void window.Presence.stop(true);
        currentUser = null;
        currentProfile = null;
        window.currentUser = null;
        window.currentProfile = null;
        renderGuestWidget();
        updateNavGate(false);
    }
});

// Initial state check
(async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session?.user) {
        currentUser = session.user;
        currentProfile = await loadProfile(currentUser);
        if (!currentProfile) {
            console.warn('Profile missing in DB on init, signing out');
            await supabaseClient.auth.signOut();
            window.currentUser = null;
            window.currentProfile = null;
            renderGuestWidget();
            updateNavGate(false);
            return;
        }
        window.currentUser = currentUser;
        window.currentProfile = currentProfile;
        renderUserWidget(currentUser, currentProfile);
        updateNavGate(true);
        if (typeof window.refreshQuestRatings === 'function') window.refreshQuestRatings();
    } else {
        window.currentUser = null;
        window.currentProfile = null;
        renderGuestWidget();
        updateNavGate(false);
    }
})();
} catch (authInitError) {
    console.error('AUTH INIT ERROR:', authInitError);
    const widget = document.getElementById('account-widget');
    if (widget) {
        const btn = document.createElement('button');
        btn.textContent = 'Auth error';
        btn.style.cssText = 'padding:8px 16px;background:#fff;color:#000;border:none;border-radius:8px;cursor:pointer;';
        btn.onclick = function() { alert('Auth initialization error: ' + authInitError); };
        widget.appendChild(btn);
    }
}
// ===== END AUTH =====

    window.openAuthModal = openAuthModal;
    window.updateNavGate = updateNavGate;
});
