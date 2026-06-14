window.__gqParts.push(function() {
    // Page Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const homePage = document.getElementById('home-page');
    const leaderboardPage = document.getElementById('leaderboard-page');
    const questsPage = document.getElementById('quests-page');
    const profilePage = document.getElementById('profile-page');
    const friendsPage = document.getElementById('friends-page');
    const settingsPage = document.getElementById('settings-page');

// Check if all elements exist
if (!navLinks || !homePage || !leaderboardPage || !questsPage || !profilePage || !settingsPage) {
}

function showPage(pageName) {
    
    // Close any open friend profile page first
    const friendPage = document.getElementById('friend-page');
    if (friendPage) {
        friendPage.remove();
        document.body.classList.remove('friend-page-open');
    }

    // Hide all pages
    if (homePage) homePage.style.display = 'none';
    if (leaderboardPage) leaderboardPage.style.display = 'none';
    if (questsPage) questsPage.style.display = 'none';
    if (profilePage) profilePage.style.display = 'none';
    if (friendsPage) friendsPage.style.display = 'none';
    if (settingsPage) settingsPage.style.display = 'none';
    document.body.classList.remove('settings-page-open');
    
    // Remove active class from all pages
    if (homePage) homePage.classList.remove('active');
    if (leaderboardPage) leaderboardPage.classList.remove('active');
    if (questsPage) questsPage.classList.remove('active');
    if (profilePage) profilePage.classList.remove('active');
    if (friendsPage) friendsPage.classList.remove('active');
    if (settingsPage) settingsPage.classList.remove('active');
    
    // Remove active class from all nav links
    navLinks.forEach(l => l.classList.remove('active'));
    
    // Show the selected page
    switch(pageName) {
        case 'home':
            if (homePage) {
                homePage.style.display = 'block';
                homePage.classList.add('active');
            }
            break;
        case 'leaderboard':
            if (leaderboardPage) {
                leaderboardPage.style.display = 'block';
                leaderboardPage.classList.add('active');
            }
            break;
        case 'quests':
            if (questsPage) {
                questsPage.style.display = 'block';
                questsPage.classList.add('active');
            }
            break;
        case 'profile':
            if (profilePage) {
                profilePage.style.display = 'block';
                profilePage.classList.add('active');
            }
                if (typeof window.refreshFriends === 'function') window.refreshFriends();
                if (typeof window.mountOwnGuestbook === 'function') window.mountOwnGuestbook();
                if (window.Achievements) window.Achievements.evaluate({ notify: false });
            break;
        case 'friends':
            if (friendsPage) {
                friendsPage.style.display = 'block';
                friendsPage.classList.add('active');
            }
            if (typeof window.openFriendsPage === 'function') window.openFriendsPage();
            break;
        case 'settings':
            document.body.classList.add('settings-page-open');
            if (settingsPage) {
                settingsPage.style.display = 'flex';
                settingsPage.classList.add('active');
            }
            break;
    }
    
    // Add active class to the clicked nav link
    const activeLink = document.querySelector(`.nav-link[data-page="${pageName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const page = link.getAttribute('data-page');
        
        
        if (page) {
            showPage(page);
        }
    });
});

// Initialize - show home page
showPage('home');

// Prevent invite buttons from causing external link dialogs
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('invite-btn')) {
        e.preventDefault();
        e.stopPropagation();
        
        // Show notification instead
        const notification = document.createElement('div');
        notification.textContent = 'Invitation sent!';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.85);
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            z-index: 10000;
            font-weight: 600;
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 2000);
    }
});

// Avatar Selection
const avatarOptions = document.querySelectorAll('.avatar-option');
let selectedAvatar = 'DQ';
let profilePicUrl = null;
let profileBannerUrl = null;

avatarOptions.forEach(option => {
    option.addEventListener('click', () => {
        avatarOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedAvatar = option.getAttribute('data-avatar');
        profilePicUrl = null; // Clear uploaded picture when selecting emoji
        
        // Update display to show emoji
        const profilePicDisplay = document.getElementById('profile-pic-display');
        profilePicDisplay.innerHTML = selectedAvatar;
        profilePicDisplay.style.fontSize = '26px';
        
        // Automatically update profile page
        const profileAvatar = document.querySelector('.profile-avatar');
        profileAvatar.innerHTML = selectedAvatar;
        profileAvatar.style.fontSize = '26px';
        
        // Persist avatar to the account (debounced)
        scheduleAutoSave();
        
        // Show success notification
        const notification = document.createElement('div');
        notification.textContent = '✓ Avatar updated!';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.85);
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            z-index: 10000;
            font-weight: 600;
        `;
        document.body.appendChild(notification);
        setTimeout(() => document.body.removeChild(notification), 2000);
    });
});

// Profile Picture Upload
const profilePicUpload = document.getElementById('profile-pic-upload');
const profilePicDisplay = document.getElementById('profile-pic-display');
const removePicBtn = document.getElementById('remove-pic-btn');

profilePicUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            // Create temporary notification
            const notification = document.createElement('div');
            notification.textContent = 'File is too large! Maximum 5 MB';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(255, 100, 100, 0.9);
                color: white;
                padding: 15px 25px;
                border-radius: 5px;
                z-index: 10000;
                font-weight: 600;
            `;
            document.body.appendChild(notification);
            setTimeout(() => document.body.removeChild(notification), 3000);
            return;
        }

        // Read and display the image
        const reader = new FileReader();
        reader.onload = (event) => {
            profilePicUrl = event.target.result;
            profilePicDisplay.innerHTML = `<img src="${profilePicUrl}" alt="Profile">`;
            
            // Deselect emoji avatars
            avatarOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Automatically update profile page
            const profileAvatar = document.querySelector('.profile-avatar');
            profileAvatar.innerHTML = `<img src="${profilePicUrl}" alt="Profile">`;
            updateProfileBanner();
            scheduleAutoSave();
            
            // Show success notification
            const notification = document.createElement('div');
            notification.textContent = '✓ Profile photo updated!';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(255, 255, 255, 0.85);
                color: white;
                padding: 15px 25px;
                border-radius: 5px;
                z-index: 10000;
                font-weight: 600;
            `;
            document.body.appendChild(notification);
            setTimeout(() => document.body.removeChild(notification), 2000);
        };
        reader.readAsDataURL(file);
    }
});

removePicBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    profilePicUrl = null;
    profilePicUpload.value = '';
    profilePicDisplay.innerHTML = selectedAvatar;
    profilePicDisplay.style.fontSize = '26px';
    
    // Reselect the emoji avatar
    const selectedOption = document.querySelector(`.avatar-option[data-avatar="${selectedAvatar}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    // Automatically update profile page back to emoji
    const profileAvatar = document.querySelector('.profile-avatar');
    profileAvatar.innerHTML = selectedAvatar;
    profileAvatar.style.fontSize = '26px';
    updateProfileBanner();

    // Persist avatar change to the account
    scheduleAutoSave();
    
    // Show success notification
    const notification = document.createElement('div');
    notification.textContent = '✓ Photo removed!';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.85);
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        z-index: 10000;
        font-weight: 600;
    `;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 2000);
});

// Save Button
const saveBtn = document.querySelector('.save-btn');
const cancelBtn = document.querySelector('.cancel-btn');

// ===== Account settings persistence =====
function settingsKey(base) {
    const u = window.currentUser;
    return u && u.id ? `gamequest_${u.id}_${base}` : `gamequest_${base}`;
}
function getCachedSetting(base) {
    try {
        const perUser = localStorage.getItem(settingsKey(base));
        if (perUser !== null) return perUser;
        return localStorage.getItem('gamequest_' + base);
    } catch (e) { return null; }
}
function cacheSettings(username, bio, avatar, banner) {
    try {
        localStorage.setItem(settingsKey('username'), username);
        localStorage.setItem(settingsKey('bio'), bio);
        localStorage.setItem('gamequest_username', username);
        localStorage.setItem('gamequest_bio', bio);

        const avatarCache = avatar && avatar.length < 400000 ? avatar : null;
        if (avatarCache) {
            localStorage.setItem(settingsKey('avatar'), avatarCache);
            localStorage.setItem('gamequest_avatar', avatarCache);
            localStorage.removeItem(settingsKey('avatar_photo'));
        } else if (avatar && isAvatarImageUrl(avatar)) {
            localStorage.setItem(settingsKey('avatar_photo'), '1');
            localStorage.removeItem(settingsKey('avatar'));
        } else if (avatar) {
            localStorage.setItem(settingsKey('avatar'), avatar);
            localStorage.setItem('gamequest_avatar', avatar);
            localStorage.removeItem(settingsKey('avatar_photo'));
        }

        if (banner !== undefined) {
            if (banner) {
                localStorage.setItem(settingsKey('banner'), banner);
                localStorage.setItem('gamequest_banner', banner);
            } else {
                localStorage.removeItem(settingsKey('banner'));
                localStorage.removeItem('gamequest_banner');
            }
        }
    } catch (e) {}
}

function setProfileBannerMedia(root, imageUrl) {
    const scope = root || document;
    const media = scope.querySelector('.profile-hero-banner-media');
    if (!media) return;
    if (imageUrl) {
        const safeUrl = String(imageUrl).replace(/"/g, '%22');
        media.style.backgroundImage = `url("${safeUrl}")`;
        media.classList.add('has-image');
    } else {
        media.style.backgroundImage = '';
        media.classList.remove('has-image');
    }
}

function updateBannerPreview() {
    const preview = document.getElementById('profile-banner-preview');
    if (!preview) return;
    if (profileBannerUrl) {
        preview.style.backgroundImage = `url("${String(profileBannerUrl).replace(/"/g, '%22')}")`;
        preview.classList.add('has-image');
        preview.innerHTML = '';
    } else {
        preview.style.backgroundImage = '';
        preview.classList.remove('has-image');
        preview.innerHTML = '<span class="settings-banner-placeholder">No banner</span>';
    }
}

function applyProfileBanner(url) {
    profileBannerUrl = url || null;
    const media = document.querySelector('.profile-hero-banner-media');
    if (media) {
        if (profileBannerUrl) media.dataset.bannerUrl = profileBannerUrl;
        else delete media.dataset.bannerUrl;
    }
    updateBannerPreview();
    updateProfileBanner();
}

function resolveProfileBannerUrl(scope, explicitBanner) {
    if (explicitBanner) return explicitBanner;
    const media = scope.querySelector('.profile-hero-banner-media');
    if (media && media.dataset.bannerUrl) return media.dataset.bannerUrl;
    if (scope === document && profileBannerUrl) return profileBannerUrl;
    return null;
}

window.updateProfileBanner = function (root, explicitBanner) {
    const scope = root || document;
    const bannerUrl = resolveProfileBannerUrl(scope, explicitBanner);
    const avatarImg = scope.querySelector('.profile-avatar img');
    const url = bannerUrl || (avatarImg && avatarImg.src ? avatarImg.src : null);
    setProfileBannerMedia(scope, url);
};

function isAvatarImageUrl(av) {
    return typeof av === 'string' && (av.startsWith('data:') || av.startsWith('http://') || av.startsWith('https://'));
}

function getAvatarForSave() {
    return profilePicUrl || selectedAvatar;
}

function applyAvatar(av) {
    if (!av) return;
    if (isAvatarImageUrl(av)) {
        profilePicUrl = av;
        document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
        const profileAvatar = document.querySelector('.profile-avatar');
        if (profileAvatar) {
            profileAvatar.innerHTML = `<img src="${profilePicUrl}" alt="Profile">`;
            profileAvatar.style.fontSize = '';
        }
        const disp = document.getElementById('profile-pic-display');
        if (disp) {
            disp.innerHTML = `<img src="${profilePicUrl}" alt="Profile">`;
            disp.style.fontSize = '';
        }
    } else {
        profilePicUrl = null;
        selectedAvatar = av;
        document.querySelectorAll('.avatar-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.avatar === av);
        });
        const profileAvatar = document.querySelector('.profile-avatar');
        if (profileAvatar) { profileAvatar.innerHTML = av; profileAvatar.style.fontSize = '48px'; }
        const disp = document.getElementById('profile-pic-display');
        if (disp) { disp.innerHTML = av; disp.style.fontSize = '60px'; }
    }
    updateProfileBanner();
}

// Update the profile preview (name / bio / avatar) from the current settings inputs
function updateProfilePreview() {
    const username = document.getElementById('username').value;
    const bio = document.getElementById('bio').value;
    const profileName = document.querySelector('.profile-name');
    if (profileName) {
        if (typeof window.mountDisplayName === 'function') window.mountDisplayName(profileName, username);
        else profileName.textContent = username;
    }
    const profileBio = document.getElementById('profile-bio');
    if (profileBio) {
        if (bio.trim()) {
            profileBio.textContent = bio;
            profileBio.style.fontStyle = 'normal';
            profileBio.style.color = 'rgba(255, 255, 255, 0.8)';
        } else {
            profileBio.textContent = 'Your bio will appear here...';
            profileBio.style.fontStyle = 'italic';
            profileBio.style.color = 'rgba(255, 255, 255, 0.7)';
        }
    }
    const profileAvatar = document.querySelector('.profile-avatar');
    if (profileAvatar) {
        if (profilePicUrl) {
            profileAvatar.innerHTML = `<img src="${profilePicUrl}" alt="Profile">`;
        } else {
            profileAvatar.innerHTML = selectedAvatar;
            profileAvatar.style.fontSize = '26px';
        }
    }
    updateProfileBanner();
}

function supaClient() {
    if (typeof window.supabaseClient !== 'undefined' && window.supabaseClient) return window.supabaseClient;
    return (typeof window.initSupabaseClient === 'function') ? window.initSupabaseClient() : null;
}

// Save current settings to the account (Supabase) + local cache
async function saveAccountSettings() {
    const username = (document.getElementById('username').value || '').trim();
    const bio = document.getElementById('bio').value || '';
    const avatar = getAvatarForSave();
    cacheSettings(username, bio, avatar, profileBannerUrl);

    const u = window.currentUser;
    const c = supaClient();
    if (!u || !c) return; // guest: local cache only

    const favorite_games = (typeof window.getFavSelected === 'function') ? window.getFavSelected() : [];
    let social_links = {};
    if (typeof window.commitSocialLinks === 'function') {
        social_links = window.commitSocialLinks();
    } else if (typeof window.getSocialSelected === 'function') {
        social_links = window.getSocialSelected();
    }
    const pinned_achievements = (window.Achievements && typeof window.Achievements.getPinnedSelected === 'function')
        ? window.Achievements.getPinnedSelected()
        : (window.Achievements && typeof window.Achievements.loadPinned === 'function')
            ? window.Achievements.loadPinned()
            : [];
    const fullPatch = {
        username,
        bio,
        avatar,
        banner: profileBannerUrl || null,
        favorite_games: favorite_games || [],
        social_links,
        pinned_achievements,
    };

    try {
        const { error } = await c.from('profiles').update(fullPatch).eq('user_id', u.id);
        if (error) throw error;
        if (window.currentProfile) Object.assign(window.currentProfile, fullPatch);
    } catch (err) {
        console.warn('saveAccountSettings: full update failed, retrying partial', err);
        try {
            const { error: e2 } = await c.from('profiles').update({
                username,
                bio,
                avatar,
                banner: profileBannerUrl || null,
                favorite_games: favorite_games || [],
                social_links: social_links || {},
                pinned_achievements,
            }).eq('user_id', u.id);
            if (e2) throw e2;
            if (window.currentProfile) Object.assign(window.currentProfile, {
                username,
                bio,
                avatar,
                banner: profileBannerUrl || null,
                favorite_games: favorite_games || [],
                social_links: social_links || {},
                pinned_achievements,
            });
        } catch (err2) {
            console.warn('saveAccountSettings: partial update failed, retrying avatar + basics', err2);
            try {
                const { error: e3 } = await c.from('profiles').update({ username, bio, avatar }).eq('user_id', u.id);
                if (e3) throw e3;
                if (window.currentProfile) Object.assign(window.currentProfile, { username, bio, avatar });
            } catch (err3) {
                console.warn('saveAccountSettings: avatar update failed, retrying minimal', err3);
                try {
                    const { error: e4 } = await c.from('profiles').update({ username, bio }).eq('user_id', u.id);
                    if (e4) throw e4;
                    if (window.currentProfile) Object.assign(window.currentProfile, { username, bio });
                } catch (err4) {
                    console.warn('saveAccountSettings: minimal update failed', err4);
                }
            }
        }
    }
}

// Auto-save (debounced): update preview + persist
function autoSaveSettings() {
    updateProfilePreview();
    saveAccountSettings();
}

// Apply settings coming from the logged-in account profile (called on login)
window.applyProfileSettings = function (profile) {
    if (!profile) return;
    const usernameEl = document.getElementById('username');
    const bioEl = document.getElementById('bio');
    const name = profile.username || '';
    if (name && usernameEl) usernameEl.value = name;
    const bio = profile.bio != null ? profile.bio : '';
    if (bioEl) bioEl.value = bio;
    if (profile.avatar) applyAvatar(profile.avatar);
    if (profile.banner) applyProfileBanner(profile.banner);
    else applyProfileBanner(null);
    if (profile.favorite_games && typeof window.setFavGames === 'function') {
        window.setFavGames(profile.favorite_games);
    }
    if (typeof window.setSocialLinks === 'function') {
        window.setSocialLinks(profile.social_links || {}, { preferLocalIfEmpty: true, syncToAccount: true });
    }
    if (window.Achievements) {
        if (Array.isArray(profile.pinned_achievements) && typeof window.Achievements.setPinnedAchievements === 'function') {
            window.Achievements.setPinnedAchievements(profile.pinned_achievements);
        } else if (typeof window.Achievements.reloadPinnedForCurrentUser === 'function') {
            window.Achievements.reloadPinnedForCurrentUser();
        }
    }
    updateProfilePreview();
    cacheSettings(name, bio, profile.avatar || getAvatarForSave(), profile.banner || null);
};

// Load settings from local cache on page load (overridden by DB after login)
function loadSavedSettings() {
    const savedUsername = getCachedSetting('username');
    const savedBio = getCachedSetting('bio');
    const savedAvatar = getCachedSetting('avatar');
    const savedBanner = getCachedSetting('banner');

    if (savedUsername) {
        document.getElementById('username').value = savedUsername;
        const pn = document.querySelector('.profile-name');
        if (pn) {
            if (typeof window.mountDisplayName === 'function') window.mountDisplayName(pn, savedUsername);
            else pn.textContent = savedUsername;
        }
    }
    if (savedBio) {
        document.getElementById('bio').value = savedBio;
        const profileBio = document.getElementById('profile-bio');
        if (profileBio) {
            profileBio.textContent = savedBio;
            profileBio.style.fontStyle = 'normal';
            profileBio.style.color = 'rgba(255, 255, 255, 0.8)';
        }
    }
    if (savedAvatar) applyAvatar(savedAvatar);
    else if (getCachedSetting('avatar_photo') === '1' && window.currentProfile?.avatar) {
        applyAvatar(window.currentProfile.avatar);
    }
    if (savedBanner) applyProfileBanner(savedBanner);
}

// Profile banner upload
const profileBannerUpload = document.getElementById('profile-banner-upload');
const uploadBannerBtn = document.getElementById('upload-banner-btn');
const removeBannerBtn = document.getElementById('remove-banner-btn');

function showSettingsToast(text, bg) {
    const notification = document.createElement('div');
    notification.textContent = text;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bg};
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        z-index: 10000;
        font-weight: 600;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        if (document.body.contains(notification)) document.body.removeChild(notification);
    }, 2000);
}

if (uploadBannerBtn && profileBannerUpload) {
    uploadBannerBtn.addEventListener('click', () => profileBannerUpload.click());
}

if (profileBannerUpload) {
    profileBannerUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            showSettingsToast('File is too large! Maximum 5 MB', 'rgba(255, 100, 100, 0.9)');
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            applyProfileBanner(event.target.result);
            scheduleAutoSave();
            showSettingsToast('✓ Banner updated!', 'rgba(255, 255, 255, 0.85)');
        };
        reader.readAsDataURL(file);
    });
}

if (removeBannerBtn) {
    removeBannerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (profileBannerUpload) profileBannerUpload.value = '';
        applyProfileBanner(null);
        scheduleAutoSave();
        showSettingsToast('✓ Banner removed!', 'rgba(255, 255, 255, 0.85)');
    });
}

// Auto-save on input changes with debounce
let autoSaveTimeout;
function scheduleAutoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(autoSaveSettings, 1000); // Save after 1 second of inactivity
}

window.scheduleSettingsAutoSave = scheduleAutoSave;

document.getElementById('username').addEventListener('input', scheduleAutoSave);
document.getElementById('bio').addEventListener('input', scheduleAutoSave);

// Load settings on page load
loadSavedSettings();
updateBannerPreview();
updateProfileBanner();

saveBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    updateProfilePreview();

    if (typeof window.commitFavGames === 'function') {
        window.commitFavGames();
    }
    if (typeof window.commitSocialLinks === 'function') {
        window.commitSocialLinks();
    }
    if (window.Achievements && typeof window.Achievements.commitPinnedAchievements === 'function') {
        window.Achievements.commitPinnedAchievements();
    }
    saveAccountSettings();

    // Keep bio in sync locally so achievement checks see it immediately, then award
    const bioVal = (document.getElementById('bio').value || '').trim();
    if (window.currentProfile) window.currentProfile.bio = bioVal;
    if (window.Achievements) window.Achievements.evaluate({ notify: true });

    // Show success feedback with visual notification
    const originalText = saveBtn.textContent;
    const originalBg = saveBtn.style.background;
    
    saveBtn.textContent = '✓ Saved!';
    saveBtn.style.background = '#ffffff';
    saveBtn.disabled = true;
    
    setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.style.background = originalBg || '#ffffff';
        saveBtn.disabled = false;
        // Go to profile page
        showPage('profile');
    }, 1500);
});

cancelBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // Reset favorite games working copy from saved state
    if (typeof window.resetFavSelected === 'function') {
        window.resetFavSelected();
    }
    if (typeof window.resetSocialDraft === 'function') {
        window.resetSocialDraft();
    }
    if (window.Achievements && typeof window.Achievements.resetPinnedSelected === 'function') {
        window.Achievements.resetPinnedSelected();
    }
    showPage('profile');
});

    window.showPage = showPage;
});
