window.__gqParts.push(function() {
// Add Friend Functionality
const addFriendBtn = document.getElementById('add-friend-btn');
const friendNameInput = document.getElementById('friend-name-input');
const friendsList = document.getElementById('friends-list');
const viewAllFriendsBtn = document.getElementById('view-all-friends-btn');
const friendsModal = document.getElementById('friends-modal');
const closeFriendsModal = document.getElementById('close-friends-modal');
const friendsListColumn = document.getElementById('friends-list-column');
const friendProfileColumn = document.getElementById('friend-profile-column');
const friendProfileView = document.getElementById('friend-profile-view');

// Array of random friend avatars
const friendAvatars = ['⚔️', '🏹', '🗡️', '🛡️', '✨', '🔮', '⚡', '🎯', '🏆', '💎', '🌟', '🔥'];

// Store pending friend requests
let pendingRequests = [];

// Store all friends data
let allFriends = [];
let selectedFriend = null;

// Update expand button visibility
function updateViewAllButton() {
    const friendItems = friendsList.querySelectorAll('.friend-item:not(.pending-request)');
    const total = friendItems.length;
    // Update count badge in header
    const badge = document.getElementById('friends-count');
    if (badge) badge.textContent = total;
    // Always show the "All Friends" button
    viewAllFriendsBtn.style.display = 'flex';
}

// Open friends modal
// ===== FRIENDS MODAL v2 =====
let fmActiveTab = 'all';
let fmSearchQuery = '';
let fmSelectedName = null;

// Get full friend data from sidebar item
function fmGetFriendData(item) {
    const avatar = item.querySelector('.friend-avatar').textContent;
    const name = (item.querySelector('.friend-name') || item.querySelector('span')).textContent;
    const sub = (item.querySelector('.friend-sub') || {}).textContent || '';
    const isPending = item.classList.contains('pending-request');
    const isPinned = item.classList.contains('pinned');
    const status = item.dataset.status || (isPending ? 'pending' : 'offline');
    return { name, avatar, sub, isPending, isPinned, status };
}

function fmAllFriends() {
    return Array.from(friendsList.querySelectorAll('.friend-item')).map(fmGetFriendData);
}

function fmCounts(friends) {
    return {
        all: friends.filter(f => !f.isPending).length,
        online: friends.filter(f => !f.isPending && f.status === 'online').length,
        pinned: friends.filter(f => !f.isPending && f.isPinned).length,
        pending: friends.filter(f => f.isPending).length,
    };
}

function fmFilterFriends(friends) {
    let list = friends;

    if (fmActiveTab === 'all') list = list.filter(f => !f.isPending);
    else if (fmActiveTab === 'online') list = list.filter(f => !f.isPending && f.status === 'online');
    else if (fmActiveTab === 'pinned') list = list.filter(f => !f.isPending && f.isPinned);
    else if (fmActiveTab === 'pending') list = list.filter(f => f.isPending);

    if (fmSearchQuery) {
        const q = fmSearchQuery.toLowerCase();
        list = list.filter(f => f.name.toLowerCase().includes(q));
    }

    return list;
}

function fmRenderList() {
    const all = fmAllFriends();
    const counts = fmCounts(all);

    // Update tab counts
    document.getElementById('fm-count-all').textContent = counts.all;
    document.getElementById('fm-count-online').textContent = counts.online;
    document.getElementById('fm-count-pinned').textContent = counts.pinned;
    document.getElementById('fm-count-pending').textContent = counts.pending;

    // Update subtitle
    const subtitle = document.getElementById('fm-subtitle');
    if (subtitle) {
        subtitle.textContent = `${counts.all} ${counts.all === 1 ? 'friend' : counts.all < 5 ? 'friends' : 'friends'} · ${counts.online} online`;
    }

    const filtered = fmFilterFriends(all);
    const listEl = document.getElementById('fm-list');

    if (filtered.length === 0) {
        let emptyMsg = 'No one found';
        if (fmSearchQuery) emptyMsg = 'Nothing found for this search';
        else if (fmActiveTab === 'online') emptyMsg = 'No one is online';
        else if (fmActiveTab === 'pinned') emptyMsg = 'No pinned friends';
        else if (fmActiveTab === 'pending') emptyMsg = 'No pending requests';
        listEl.innerHTML = `
            <div class="fm-empty">
                <div class="fm-empty-icon">🔍</div>
                <div>${emptyMsg}</div>
            </div>`;
        return;
    }

    // For "all" tab, split into Pinned / Other groups
    let html = '';
    if (fmActiveTab === 'all') {
        const pinned = filtered.filter(f => f.isPinned);
        const others = filtered.filter(f => !f.isPinned);
        if (pinned.length > 0) {
            html += '<div class="fm-section-label">Pinned</div>';
            html += pinned.map(fmRenderFriendRow).join('');
        }
        if (others.length > 0) {
            if (pinned.length > 0) html += '<div class="fm-section-label">Others</div>';
            html += others.map(fmRenderFriendRow).join('');
        }
    } else {
        html = filtered.map(fmRenderFriendRow).join('');
    }
    listEl.innerHTML = html;

    // Wire clicks
    listEl.querySelectorAll('.fm-friend').forEach(row => {
        row.addEventListener('click', () => {
            const name = row.dataset.name;
            fmSelectedName = name;
            listEl.querySelectorAll('.fm-friend').forEach(r => r.classList.remove('active'));
            row.classList.add('active');
            fmShowProfile(name);
        });
    });

    // Auto-select first or previously selected
    if (fmSelectedName) {
        const stillExists = filtered.find(f => f.name === fmSelectedName);
        if (stillExists) {
            const row = listEl.querySelector(`.fm-friend[data-name="${CSS.escape(fmSelectedName)}"]`);
            if (row) row.classList.add('active');
            fmShowProfile(fmSelectedName);
            return;
        }
    }
    // No selection — clear right panel
    fmSelectedName = null;
    document.querySelector('.friend-profile-empty').style.display = 'flex';
    friendProfileView.style.display = 'none';
}

function fmRenderFriendRow(f) {
    const statusClass = f.status === 'online' ? ' online' : (f.status === 'away' ? ' away' : '');
    const pendingClass = f.isPending ? ' pending' : '';
    const pinBadge = f.isPinned ? '<span class="fm-pin-badge">📌</span>' : '';
    return `
        <div class="fm-friend${pendingClass}" data-name="${f.name}">
            <div class="fm-friend-avatar${statusClass}">${f.avatar}</div>
            <div class="fm-friend-info">
                <div class="fm-friend-name">${f.name} ${pinBadge}</div>
                <div class="fm-friend-sub">${f.sub || (f.isPending ? 'Request sent' : '')}</div>
            </div>
        </div>`;
}

// Deterministic pseudo-random for stable stats per friend
function fmHash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    return Math.abs(h);
}

function fmFriendStats(name) {
    const h = fmHash(name);
    const lvl = (h % 45) + 8;
    const xp = (h % 9000) + 2000;
    const quests = (h % 80) + 15;
    const days = (h % 60) + 5;
    const winRate = (h % 35) + 55;
    // 7-day activity (deterministic)
    const days7 = [];
    for (let i = 0; i < 7; i++) {
        const dh = fmHash(name + '_d' + i);
        days7.push(dh % 600);
    }
    return { lvl, xp, quests, days, winRate, days7 };
}

function fmShowProfile(name) {
    const friendItem = Array.from(friendsList.querySelectorAll('.friend-item')).find(item =>
        (item.querySelector('.friend-name') || item.querySelector('span')).textContent === name);
    if (!friendItem) return;

    const data = fmGetFriendData(friendItem);
    document.querySelector('.friend-profile-empty').style.display = 'none';
    friendProfileView.style.display = 'block';
    friendProfileView.classList.add('active');

    if (data.isPending) {
        friendProfileView.innerHTML = `
            <div class="friend-profile-header-section">
                <div class="friend-profile-top">
                    <div class="friend-profile-avatar-large">${data.avatar}</div>
                    <div class="friend-profile-info-section">
                        <div class="friend-profile-name-large">${data.name}</div>
                        <div style="color: rgba(255,255,255,0.5); font-size:13px; font-style:italic;">Waiting for a response...</div>
                    </div>
                </div>
                <div class="friend-profile-actions">
                    <button class="friend-action-btn remove-friend-large-btn" onclick="cancelFriendFromProfile('${data.name}')">
                        Cancel request
                    </button>
                </div>
            </div>`;
        return;
    }

    const stats = fmFriendStats(data.name);
    const maxBar = Math.max(...stats.days7, 100);
    const dayLabels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const statusText = data.status === 'online' ? '🟢 Online' : data.status === 'away' ? '🟡 Away' : '⚪ Offline';

    // Mock common quests
    const allQuests = [
        {icon: '🏹', name: 'Photo Hunt'},
        {icon: '🗡️', name: 'City Secrets'},
        {icon: '⚔️', name: 'Review Marathon'},
        {icon: '🔫', name: 'Counter-Strike 2'},
        {icon: '⛏️', name: 'Minecraft'},
        {icon: '🌃', name: 'Cyberpunk 2077'},
    ];
    const commonCount = (fmHash(data.name) % 3) + 2;
    const commonQuests = allQuests.slice(0, commonCount).map(q => {
        const score = (fmHash(data.name + q.name) % 41) + 60;
        return `
            <div class="fm-quest-row">
                <div class="fm-quest-icon">${q.icon}</div>
                <div class="fm-quest-name">${q.name}</div>
                <div class="fm-quest-score">${score}% accuracy</div>
            </div>`;
    }).join('');

    friendProfileView.innerHTML = `
        <div class="friend-profile-header-section">
            <div class="friend-profile-top">
                <div class="friend-profile-avatar-large">${data.avatar}</div>
                <div class="friend-profile-info-section">
                    <div class="friend-profile-name-large">${data.name}</div>
                    <div class="friend-profile-stats">
                        <span>${statusText}</span>
                        <span>·</span>
                        <span>Level ${stats.lvl}</span>
                    </div>
                </div>
            </div>
            <div class="friend-profile-actions">
                <button class="friend-action-btn message-btn" onclick="fmSendMessage('${data.name}')">
                    💬 Message
                </button>
                <button class="friend-action-btn message-btn" onclick="fmInviteToQuest('${data.name}')" style="background: rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2);">
                    🎯 Invite to quest
                </button>
                <button class="friend-action-btn pin-friend-large-btn" onclick="togglePinFriendFromProfile('${data.name}')">
                    ${data.isPinned ? '📌 Unpin' : '📌 Pin'}
                </button>
                <button class="friend-action-btn remove-friend-large-btn" onclick="removeFriendFromProfile('${data.name}')">
                    Remove
                </button>
            </div>
        </div>

        <div class="fm-stats-grid">
            <div class="fm-stat-card">
                <div class="fm-stat-value">${stats.xp.toLocaleString('en-US')}</div>
                <div class="fm-stat-label">XP</div>
            </div>
            <div class="fm-stat-card">
                <div class="fm-stat-value">${stats.quests}</div>
                <div class="fm-stat-label">Quests</div>
            </div>
            <div class="fm-stat-card">
                <div class="fm-stat-value">${stats.winRate}%</div>
                <div class="fm-stat-label">Accuracy</div>
            </div>
            <div class="fm-stat-card">
                <div class="fm-stat-value">${stats.days}</div>
                <div class="fm-stat-label">Day Streak</div>
            </div>
        </div>

        <div class="fm-activity">
            <div class="fm-activity-title">
                <span>Weekly Activity</span>
                <span class="fm-activity-total">${stats.days7.reduce((a,b) => a+b, 0)} XP</span>
            </div>
            <div class="fm-activity-chart">
                ${stats.days7.map((xp, i) => `
                    <div class="fm-activity-day">
                        <div class="fm-activity-bar" data-xp="${xp}" style="height: ${(xp / maxBar) * 100}%"></div>
                        <div class="fm-activity-label">${dayLabels[i]}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="friend-profile-section">
            <h3>Achievements</h3>
            <div class="friend-achievements-grid">
                <div class="friend-achievement-item">
                    <div class="friend-achievement-icon">🏆</div>
                    <div class="friend-achievement-name">Champion</div>
                </div>
                <div class="friend-achievement-item">
                    <div class="friend-achievement-icon">⚔️</div>
                    <div class="friend-achievement-name">Warrior</div>
                </div>
                <div class="friend-achievement-item">
                    <div class="friend-achievement-icon">🎯</div>
                    <div class="friend-achievement-name">Sniper</div>
                </div>
                <div class="friend-achievement-item">
                    <div class="friend-achievement-icon">🌟</div>
                    <div class="friend-achievement-name">Legend</div>
                </div>
            </div>
        </div>

        <div class="friend-profile-section">
            <h3>Shared Quests</h3>
            <div class="fm-quests-list">
                ${commonQuests}
            </div>
        </div>`;
}

function openFriendsModal() {
    fmSelectedName = null;
    fmSearchQuery = '';
    fmActiveTab = 'all';
    const searchInput = document.getElementById('fm-search');
    if (searchInput) searchInput.value = '';
    document.querySelectorAll('.fm-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === 'all'));
    fmRenderList();
    friendsModal.classList.add('active');
}

// Tabs
document.querySelectorAll('.fm-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        fmActiveTab = tab.dataset.tab;
        document.querySelectorAll('.fm-tab').forEach(t => t.classList.toggle('active', t === tab));
        fmRenderList();
    });
});

// Search
const fmSearchEl = document.getElementById('fm-search');
if (fmSearchEl) {
    let searchTimer;
    fmSearchEl.addEventListener('input', e => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            fmSearchQuery = e.target.value.trim();
            fmRenderList();
        }, 150);
    });
}

// Message and invite actions
window.fmSendMessage = function(name) {
    showNotification(`💬 Message для ${name}: chat is coming soon!`, '#6b7280');
};

window.fmInviteToQuest = function(name) {
    showNotification(`🎯 ${name} invited to a quest!`, '#6b7280');
};

// Profile-side actions (re-render after change)
window.removeFriendFromProfile = function(friendName) {
    const friendItem = Array.from(friendsList.querySelectorAll('.friend-item')).find(item =>
        (item.querySelector('.friend-name') || item.querySelector('span')).textContent === friendName);
    if (friendItem) {
        removeFriend(friendItem);
        fmSelectedName = null;
        setTimeout(fmRenderList, 400);
    }
};

window.cancelFriendFromProfile = function(friendName) {
    const friendItem = Array.from(friendsList.querySelectorAll('.friend-item')).find(item =>
        (item.querySelector('.friend-name') || item.querySelector('span')).textContent === friendName);
    if (friendItem) {
        cancelRequest(friendItem, friendName);
        fmSelectedName = null;
        setTimeout(fmRenderList, 400);
    }
};

window.togglePinFriendFromProfile = function(friendName) {
    const friendItem = Array.from(friendsList.querySelectorAll('.friend-item')).find(item =>
        (item.querySelector('.friend-name') || item.querySelector('span')).textContent === friendName);
    if (friendItem) {
        togglePinFriend(friendItem);
        fmSelectedName = friendName;
        fmRenderList();
    }
};
// ===== END FRIENDS MODAL v2 =====

// Close friends modal
function closeFriendsModalFunc() {
    friendsModal.classList.remove('active');
}

viewAllFriendsBtn.addEventListener('click', openFriendsModal);
closeFriendsModal.addEventListener('click', closeFriendsModalFunc);

// Close modal when clicking outside
friendsModal.addEventListener('click', function(e) {
    if (e.target === friendsModal) {
        closeFriendsModalFunc();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && friendsModal.classList.contains('active')) {
        closeFriendsModalFunc();
    }
});

function addFriend() {
    const friendName = friendNameInput.value.trim();
    
    // Validate input
    if (friendName === '') {
        showNotification("❌ Enter a friend's name!", '#ffffff');
        return;
    }

    // Check if friend already exists
    const existingFriends = friendsList.querySelectorAll('.friend-item:not(.pending-request) span');
    for (let friend of existingFriends) {
        if (friend.textContent.toLowerCase() === friendName.toLowerCase()) {
            showNotification('⚠️ You are already friends!', '#f59e0b');
            friendNameInput.value = '';
            return;
        }
    }

    // Check if request already sent
    if (pendingRequests.includes(friendName.toLowerCase())) {
        showNotification('⚠️ Request already sent!', '#f59e0b');
        friendNameInput.value = '';
        return;
    }

    // Add to pending requests
    pendingRequests.push(friendName.toLowerCase());

    // Create pending friend request item
    const friendItem = document.createElement('div');
    friendItem.className = 'friend-item pending-request';
    friendItem.dataset.friendName = friendName.toLowerCase();
    
    // Random avatar
    const randomAvatar = friendAvatars[Math.floor(Math.random() * friendAvatars.length)];
    
    friendItem.innerHTML = `
        <div class="friend-avatar">${randomAvatar}</div>
        <div class="friend-info">
            <div class="friend-name">${friendName}</div>
            <div class="friend-sub pending-status">Waiting for a response...</div>
        </div>
        <button class="cancel-request-btn" title="Cancel request">×</button>
    `;

    // Add cancel functionality
    const cancelBtn = friendItem.querySelector('.cancel-request-btn');
    cancelBtn.addEventListener('click', function() {
        cancelRequest(friendItem, friendName);
    });

    // Add to friends list
    friendsList.appendChild(friendItem);

    // Clear input
    friendNameInput.value = '';

    // Show success notification
    showNotification('✓ Request sent!', '#ffffff');

    // Update view all button visibility
    updateViewAllButton();

    // Simulate friend acceptance after 3-5 seconds
    const acceptDelay = Math.random() * 2000 + 3000; // 3-5 seconds
    setTimeout(() => {
        acceptFriendRequest(friendItem, friendName, randomAvatar);
    }, acceptDelay);
}

function acceptFriendRequest(friendItem, friendName, avatar) {
    // Check if the request still exists (wasn't cancelled)
    if (!document.body.contains(friendItem)) {
        return;
    }

    // Remove from pending requests
    pendingRequests = pendingRequests.filter(name => name !== friendName.toLowerCase());

    // Update the friend item to be accepted (unpinned by default)
    friendItem.classList.remove('pending-request');
    friendItem.classList.add('unpinned');
    friendItem.dataset.status = 'online';
    const randomLevel = Math.floor(Math.random() * 40) + 5;
    friendItem.innerHTML = `
        <div class="friend-avatar online">${avatar}</div>
        <div class="friend-info">
            <div class="friend-name">${friendName}</div>
            <div class="friend-sub">Online · Lv ${randomLevel}</div>
        </div>
        <button class="pin-friend-btn" title="Pin friend"></button>
        <button class="remove-friend-btn" title="Remove friend">×</button>
    `;

    // Add pin functionality
    const pinBtn = friendItem.querySelector('.pin-friend-btn');
    pinBtn.addEventListener('click', function() {
        togglePinFriend(friendItem);
    });

    // Add remove functionality
    const removeBtn = friendItem.querySelector('.remove-friend-btn');
    removeBtn.addEventListener('click', function() {
        removeFriend(friendItem);
    });

    // Add acceptance animation
    friendItem.style.animation = 'acceptFriend 0.5s ease';

    // Show notification
    showNotification(`✓ ${friendName} accepted the request!`, '#ffffff');
    
    // Add to activity log
    addActivityLog(`${friendName} accepted your friend request`, 'friend');
}

function cancelRequest(friendItem, friendName) {
    // Remove from pending requests
    pendingRequests = pendingRequests.filter(name => name !== friendName.toLowerCase());

    // Add fade out animation
    friendItem.style.transition = 'all 0.3s ease';
    friendItem.style.opacity = '0';
    friendItem.style.transform = 'translateX(-20px)';
    
    setTimeout(() => {
        if (friendsList.contains(friendItem)) {
            friendsList.removeChild(friendItem);
        }
        showNotification(`Request cancelled`, '#6b7280');
        // Update view all button visibility
        updateViewAllButton();
    }, 300);
}

function removeFriend(friendItem) {
    const friendName = (friendItem.querySelector('.friend-name') || friendItem.querySelector('span')).textContent;
    
    // Add fade out animation
    friendItem.style.transition = 'all 0.3s ease';
    friendItem.style.opacity = '0';
    friendItem.style.transform = 'translateX(-20px)';
    
    setTimeout(() => {
        if (friendsList.contains(friendItem)) {
            friendsList.removeChild(friendItem);
        }
        showNotification(`✓ ${friendName} removed!`, '#ffffff');
        // Update view all button visibility
        updateViewAllButton();
    }, 300);
}

// Function to add activity to log
function addActivityLog(title, type = 'info') {
    const activityLog = document.getElementById('activity-log');
    if (!activityLog) return;

    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.style.animation = 'slideIn 0.3s ease';
    
    let icon = '📋';
    let bgColor = 'rgba(255, 255, 255, 0.15)';
    let textColor = '#ffffff';
    
    if (type === 'quest_complete') {
        icon = '✓';
        bgColor = 'rgba(255, 255, 255, 0.15)';
        textColor = '#ffffff';
    } else if (type === 'quest_start') {
        icon = '▶';
        bgColor = 'rgba(255, 255, 255, 0.15)';
        textColor = '#ffffff';
    } else if (type === 'friend') {
        icon = '👥';
        bgColor = 'rgba(255, 255, 255, 0.15)';
        textColor = '#ffffff';
    } else if (type === 'achievement') {
        icon = '🏆';
        bgColor = 'rgba(255, 255, 255, 0.15)';
        textColor = '#ffffff';
    }
    
    activityItem.innerHTML = `
        <div class="activity-icon" style="background: ${bgColor}; color: ${textColor};">${icon}</div>
        <div class="activity-info">
            <div class="activity-title">${title}</div>
            <div class="activity-time">Just now</div>
        </div>
    `;
    
    // Insert at the beginning
    activityLog.insertBefore(activityItem, activityLog.firstChild);
    
    // Limit to 20 items
    const items = activityLog.querySelectorAll('.activity-item');
    if (items.length > 20) {
        activityLog.removeChild(items[items.length - 1]);
    }
}

// Helper function to show notifications
function showNotification(message, color) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${color};
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 2000);
}

// Add event listeners
addFriendBtn.addEventListener('click', addFriend);

friendNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addFriend();
    }
});

// Add remove functionality to existing friends
document.querySelectorAll('.remove-friend-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        removeFriend(this.closest('.friend-item'));
    });
});

// Add pin/unpin functionality to existing friends
document.querySelectorAll('.pin-friend-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        togglePinFriend(this.closest('.friend-item'));
    });
});

function togglePinFriend(friendItem) {
    if (friendItem.classList.contains('pinned')) {
        // Unpin friend
        friendItem.classList.remove('pinned');
        friendItem.classList.add('unpinned');
        const pinBtn = friendItem.querySelector('.pin-friend-btn');
        if (pinBtn) pinBtn.title = 'Pin friend';
        showNotification('Friend unpinned', '#6b7280');
    } else {
        // Check if already have 10 pinned friends
        const pinnedCount = friendsList.querySelectorAll('.friend-item.pinned').length;
        if (pinnedCount >= 10) {
            showNotification('❌ Maximum 10 pinned friends!', '#ffffff');
            return;
        }
        
        // Pin friend
        friendItem.classList.remove('unpinned');
        friendItem.classList.add('pinned');
        const pinBtn = friendItem.querySelector('.pin-friend-btn');
        if (pinBtn) pinBtn.title = 'Unpin friend';
        showNotification('✓ Friend pinned!', '#ffffff');
    }
}

// Initial check
updateViewAllButton();

    window.addActivityLog = addActivityLog;
});
