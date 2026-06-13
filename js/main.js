window.__gqParts.push(function() {
    // Page Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const homePage = document.getElementById('home-page');
    const leaderboardPage = document.getElementById('leaderboard-page');
    const questsPage = document.getElementById('quests-page');
    const profilePage = document.getElementById('profile-page');
    const settingsPage = document.getElementById('settings-page');

// Check if all elements exist
if (!navLinks || !homePage || !leaderboardPage || !questsPage || !profilePage || !settingsPage) {
}

function showPage(pageName) {
    
    // Hide all pages
    if (homePage) homePage.style.display = 'none';
    if (leaderboardPage) leaderboardPage.style.display = 'none';
    if (questsPage) questsPage.style.display = 'none';
    if (profilePage) profilePage.style.display = 'none';
    if (settingsPage) settingsPage.style.display = 'none';
    
    // Remove active class from all pages
    if (homePage) homePage.classList.remove('active');
    if (leaderboardPage) leaderboardPage.classList.remove('active');
    if (questsPage) questsPage.classList.remove('active');
    if (profilePage) profilePage.classList.remove('active');
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
            break;
        case 'settings':
            if (settingsPage) {
                settingsPage.style.display = 'block';
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
        
        // Auto-save avatar selection
        localStorage.setItem('gamequest_avatar', selectedAvatar);
        
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
            profileAvatar.innerHTML = `<img src="${profilePicUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" alt="Profile">`;
            
            // Note: Profile picture is not saved to localStorage due to size limits
            
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

// Auto-save function
function autoSaveSettings() {
    const username = document.getElementById('username').value;
    const bio = document.getElementById('bio').value;

    // Save to localStorage (not saving profile pic due to size limits)
    localStorage.setItem('gamequest_username', username);
    localStorage.setItem('gamequest_bio', bio);
    localStorage.setItem('gamequest_avatar', selectedAvatar);

    // Update profile page with new data
    document.querySelector('.profile-name').textContent = username;
    
    // Update bio in profile page
    const profileBio = document.getElementById('profile-bio');
    if (bio.trim()) {
        profileBio.textContent = bio;
        profileBio.style.fontStyle = 'normal';
        profileBio.style.color = 'rgba(255, 255, 255, 0.8)';
    } else {
        profileBio.textContent = 'Your bio will appear here...';
        profileBio.style.fontStyle = 'italic';
        profileBio.style.color = 'rgba(255, 255, 255, 0.7)';
    }
    
    // Update profile avatar with picture or emoji
    const profileAvatar = document.querySelector('.profile-avatar');
    if (profilePicUrl) {
        profileAvatar.innerHTML = `<img src="${profilePicUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" alt="Profile">`;
    } else {
        profileAvatar.innerHTML = selectedAvatar;
        profileAvatar.style.fontSize = '26px';
    }
}

// Load saved settings on page load
function loadSavedSettings() {
    const savedUsername = localStorage.getItem('gamequest_username');
    const savedBio = localStorage.getItem('gamequest_bio');
    const savedAvatar = localStorage.getItem('gamequest_avatar');

    if (savedUsername) {
        document.getElementById('username').value = savedUsername;
        document.querySelector('.profile-name').textContent = savedUsername;
    }

    if (savedBio) {
        document.getElementById('bio').value = savedBio;
        const profileBio = document.getElementById('profile-bio');
        profileBio.textContent = savedBio;
        profileBio.style.fontStyle = 'normal';
        profileBio.style.color = 'rgba(255, 255, 255, 0.8)';
    }

    if (savedAvatar) {
        selectedAvatar = savedAvatar;
        document.querySelectorAll('.avatar-option').forEach(opt => {
            opt.classList.remove('selected');
            if (opt.dataset.avatar === savedAvatar) {
                opt.classList.add('selected');
            }
        });
        
        // Update profile avatar
        const profileAvatar = document.querySelector('.profile-avatar');
        profileAvatar.innerHTML = savedAvatar;
        profileAvatar.style.fontSize = '48px';
        
        // Update settings display
        const profilePicDisplay = document.getElementById('profile-pic-display');
        profilePicDisplay.innerHTML = savedAvatar;
        profilePicDisplay.style.fontSize = '60px';
    }
}

// Auto-save on input changes with debounce
let autoSaveTimeout;
function scheduleAutoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(autoSaveSettings, 1000); // Save after 1 second of inactivity
}

document.getElementById('username').addEventListener('input', scheduleAutoSave);
document.getElementById('bio').addEventListener('input', scheduleAutoSave);

// Load settings on page load
loadSavedSettings();

saveBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const username = document.getElementById('username').value;
    const bio = document.getElementById('bio').value;

    // Update profile page with new data
    document.querySelector('.profile-name').textContent = username;
    
    // Update bio in profile page
    const profileBio = document.getElementById('profile-bio');
    if (bio.trim()) {
        profileBio.textContent = bio;
        profileBio.style.fontStyle = 'normal';
        profileBio.style.color = 'rgba(255, 255, 255, 0.8)';
    } else {
        profileBio.textContent = 'Your bio will appear here...';
        profileBio.style.fontStyle = 'italic';
        profileBio.style.color = 'rgba(255, 255, 255, 0.7)';
    }
    
    // Update profile avatar with picture or emoji
    const profileAvatar = document.querySelector('.profile-avatar');
    if (profilePicUrl) {
        profileAvatar.innerHTML = `<img src="${profilePicUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" alt="Profile">`;
    } else {
        profileAvatar.innerHTML = selectedAvatar;
        profileAvatar.style.fontSize = '48px';
    }

    if (typeof window.commitFavGames === 'function') {
        window.commitFavGames();
    }

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
    showPage('profile');
});

    window.showPage = showPage;
});
