window.__gqParts.push(function() {
// ===== QUEST GAME ENGINE =====
const questsData = {
    'photo-hunt': {
        title: 'Photo Hunt',
        subtitle: 'The Witcher 3 Quiz',
        emoji: '🏹',
        xpReward: 250,
        questions: [
            {
                q: 'What is the name of the main character in The Witcher 3?',
                options: ['Geralt of Rivia', 'Ciri', 'Yennefer', 'Dandelion'],
                correct: 0,
                explain: 'Geralt of Rivia is a witcher and the main hero of Andrzej Sapkowski\'s books and the game series.'
            },
            {
                q: 'Which sword do witchers use against monsters?',
                options: ['Steel', 'Silver', 'Gold', 'Iron'],
                correct: 1,
                explain: 'Silver swords are for monsters, steel swords are for humans. Classic witcher rules.'
            },
            {
                q: 'What is the name of Geralt\'s adopted daughter?',
                options: ['Triss', 'Shani', 'Ciri', 'Keira'],
                correct: 2,
                explain: 'Cirilla Fiona Elen Riannon, or simply Ciri, is the princess of Cintra.'
            },
            {
                q: 'Near which city do most events of Hearts of Stone take place?',
                options: ['Novigrad', 'Oxenfurt', 'Toussaint', 'Velen'],
                correct: 0,
                explain: 'The events of Hearts of Stone unfold around Novigrad.'
            },
            {
                q: 'Who is Gaunter O\'Dimm?',
                options: ['Merchant', 'Master Mirror', 'Baron', 'Sorcerer'],
                correct: 1,
                explain: 'Gaunter O\'Dimm is Master Mirror, a demon who makes deals with people.'
            }
        ]
    },
    'city-secrets': {
        title: 'City Secrets',
        subtitle: 'Cyberpunk 2077 Quiz',
        emoji: '🗡️',
        xpReward: 400,
        questions: [
            {
                q: 'In which city does Cyberpunk 2077 take place?',
                options: ['Los Angeles', 'Night City', 'Neo-Tokyo', 'Dubai'],
                correct: 1,
                explain: 'Night City is a fictional metropolis located in California.'
            },
            {
                q: 'Who voiced Johnny Silverhand?',
                options: ['Brad Pitt', 'Keanu Reeves', 'Tom Cruise', 'Leonardo DiCaprio'],
                correct: 1,
                explain: 'Keanu Reeves brilliantly played rockerboy Johnny Silverhand.'
            },
            {
                q: 'What is the player character called?',
                options: ['V', 'T', 'X', 'Z'],
                correct: 0,
                explain: 'V is a mercenary whose full name can be chosen by the player.'
            },
            {
                q: 'Which corporation controls much of Night City?',
                options: ['Militech', 'Arasaka', 'Biotechnica', 'Kang Tao'],
                correct: 1,
                explain: 'Arasaka is a Japanese megacorporation that dominates Night City.'
            },
            {
                q: 'Which Night City district is the poorest and most dangerous?',
                options: ['Watson', 'Heywood', 'Pacifica', 'City Center'],
                correct: 2,
                explain: 'Pacifica is an abandoned resort district turned into Voodoo Boys territory.'
            },
            {
                q: 'What is Soulkiller?',
                options: ['Combat move', 'Mind-copying program', 'Weapon type', 'Implant'],
                correct: 1,
                explain: 'Soulkiller copies a person\'s consciousness to digital storage, destroying the original.'
            }
        ]
    },
    'review-marathon': {
        title: 'Review Marathon',
        subtitle: 'Skyrim Quiz',
        emoji: '⚔️',
        xpReward: 300,
        questions: [
            {
                q: 'What is the main warrior faction in Skyrim called?',
                options: ['The Companions', 'Dark Brotherhood', 'Thieves Guild', 'College of Winterhold'],
                correct: 0,
                explain: 'The Companions are an ancient warrior organization based in Whiterun.'
            },
            {
                q: 'What is the main hero called in the game?',
                options: ['Chosen One', 'Dovahkiin', 'Nerevarine', 'Sword of Artae'],
                correct: 1,
                explain: 'Dovahkiin is the Dragonborn, a mortal with the soul of a dragon.'
            },
            {
                q: 'Which shout is used first in the game?',
                options: ['Fus Ro Dah', 'Yol Toor Shul', 'Wuld Nah Kest', 'Zun Haal Viik'],
                correct: 0,
                explain: '"Fus Ro Dah" — Unrelenting Force, первый крик который выучивает Dovahkiin.'
            },
            {
                q: 'How many Great Houses are in Morrowind province?',
                options: ['Three', 'Five', 'Seven', 'Nine'],
                correct: 1,
                explain: 'The five Great Houses are Redoran, Hlaalu, Telvanni, Indoril, and Dres.'
            },
            {
                q: 'What is the main dragon antagonist\'s name?',
                options: ['Paarthurnax', 'Alduin', 'Odahviing', 'Durnehviir'],
                correct: 1,
                explain: 'Alduin is the World-Eater, eldest son of Akatosh.'
            }
        ]
    },
    'cs2': {
        title: 'Counter-Strike 2',
        subtitle: 'CS2 Quiz',
        emoji: '🔫',
        xpReward: 300,
        questions: [
            {
                q: 'Which engine powers Counter-Strike 2?',
                options: ['Source', 'Source 2', 'Unreal Engine 5', 'Unity'],
                correct: 1,
                explain: 'CS2 moved to Source 2 — the main technical difference from CS:GO.'
            },
            {
                q: 'How many players are on a standard CS2 team?',
                options: ['4', '5', '6', '7'],
                correct: 1,
                explain: '5v5 is the classic CS format throughout the series.'
            },
            {
                q: 'Which sniper rifle is considered the most expensive in the game?',
                options: ['AWP', 'SSG 08', 'G3SG1', 'SCAR-20'],
                correct: 0,
                explain: 'The AWP costs $4750 and kills with one body shot — a series legend.'
            },
            {
                q: 'How many rounds must you win in a standard match?',
                options: ['10', '13', '16', '30'],
                correct: 1,
                explain: 'CS2 uses MR12, so you need 13 rounds to win (previously 16).'
            },
            {
                q: 'What is the new smoke-related grenade mechanic called?',
                options: ['Smoke peek', 'Dynamic smoke', 'Volumetric smoke', 'Pop flash'],
                correct: 2,
                explain: 'Volumetric smoke is CS2\'s key feature: smoke reacts to bullets, grenades, and sound.'
            }
        ]
    },
    'rocket-league': {
        title: 'Rocket League',
        subtitle: 'Rocket League Quiz',
        emoji: '🚗',
        xpReward: 250,
        questions: [
            {
                q: 'Which studio developed Rocket League?',
                options: ['Epic Games', 'Psyonix', 'Valve', 'Riot Games'],
                correct: 1,
                explain: 'Psyonix created the game in 2015. Epic Games later acquired the studio.'
            },
            {
                q: 'How many players are usually on a standard team?',
                options: ['2', '3', '4', '5'],
                correct: 1,
                explain: '3v3 is the most popular ranked Rocket League format.'
            },
            {
                q: 'What is an Aerial in Rocket League?',
                options: ['Car type', 'Hitting the ball in the air', 'Map', 'Skin'],
                correct: 1,
                explain: 'An Aerial is hitting the ball in the air using boost. A basic advanced move.'
            },
            {
                q: 'When did the game become free-to-play?',
                options: ['2018', '2019', '2020', '2021'],
                correct: 2,
                explain: 'Rocket League became free-to-play in September 2020.'
            },
            {
                q: 'What is the mechanic where a car resets its flip off the ball in the air?',
                options: ['Pinch', 'Flip Reset', 'Wave Dash', 'Musty Flick'],
                correct: 1,
                explain: 'A Flip Reset is resetting your flip off the ball in the air, one of the hardest mechanics.'
            }
        ]
    },
    'minecraft': {
        title: 'Minecraft',
        subtitle: 'Minecraft Quiz',
        emoji: '⛏️',
        xpReward: 200,
        questions: [
            {
                q: 'Who created the original Minecraft?',
                options: ['Notch', 'Jeb', 'Dinnerbone', 'Toby Fox'],
                correct: 0,
                explain: 'Markus "Notch" Persson created Minecraft in 2009. Microsoft later bought the game.'
            },
            {
                q: 'What do you need to enter The End?',
                options: ['Diamond pickaxe', 'Eye of Ender in the portal', 'Elixir', 'Enchantment'],
                correct: 1,
                explain: 'You need to find the stronghold portal and activate it with 12 Eyes of Ender.'
            },
            {
                q: 'Which mob is rare and dangerous in the Overworld?',
                options: ['Enderman', 'End walker', 'Void walker', 'Wanderer'],
                correct: 0,
                explain: 'Endermen are neutral mobs that teleport and attack if you look at them.'
            },
            {
                q: 'What ingredient is used for a Potion of Night Vision?',
                options: ['Spider eye', 'Golden carrot', 'Sugar', 'Glowstone dust'],
                correct: 1,
                explain: 'Potion of Night Vision: awkward potion + golden carrot.'
            },
            {
                q: 'How many diamonds are needed for a full armor set?',
                options: ['16', '24', '20', '36'],
                correct: 1,
                explain: 'Helmet (5) + chestplate (8) + leggings (7) + boots (4) = 24 diamonds.'
            },
            {
                q: 'What is the game\'s final boss called?',
                options: ['Wither', 'Ender Dragon', 'Elder Guardian', 'Wanderer'],
                correct: 1,
                explain: 'The Ender Dragon is Minecraft\'s final boss, found in The End.'
            }
        ]
    },
    'half-life-alyx': {
        title: 'Half-Life: Alyx',
        subtitle: 'Half-Life: Alyx Quiz',
        emoji: '🥽',
        xpReward: 400,
        questions: [
            {
                q: 'In what year was Half-Life: Alyx released?',
                options: ['2018', '2019', '2020', '2021'],
                correct: 2,
                explain: 'The game released on March 23, 2020, exclusively for VR.'
            },
            {
                q: 'Who is the game\'s main heroine?',
                options: ['Alyx Vance', 'Judith Mossman', 'Shepard', 'Chloe'],
                correct: 0,
                explain: 'Alyx Vance is Eli Vance\'s daughter and the main heroine of this Half-Life 2 prequel.'
            },
            {
                q: 'What are the gloves that replace the Gravity Gun called?',
                options: ['Gravity Hands', 'Russell\'s Gloves', 'Gravity Gloves', 'Combine Hands'],
                correct: 2,
                explain: 'Gravity Gloves (Russell\'s Gloves) let you pull objects from a distance.'
            },
            {
                q: 'Who is G-Man in the Half-Life series?',
                options: ['Scientist', 'Combine leader', 'Mysterious handler', 'Commander'],
                correct: 2,
                explain: 'G-Man is a mysterious figure pulling strings throughout the series.'
            },
            {
                q: 'Which city is the game\'s main setting?',
                options: ['City 17', 'Black Mesa', 'Eastern Europe', 'Ravenholm'],
                correct: 0,
                explain: 'The events take place in City 17, a Combine-occupied city.'
            },
            {
                q: 'Which head-like creature jumps at your face?',
                options: ['Headcrab', 'Barnacle', 'Zombie', 'Antlion'],
                correct: 0,
                explain: 'Headcrabs are iconic Half-Life enemies that turn victims into zombies.'
            }
        ]
    },
    'ac-mirage': {
        title: 'Assassin\'s Creed: Mirage',
        subtitle: 'AC: Mirage Quiz',
        emoji: '🗡️',
        xpReward: 300,
        questions: [
            {
                q: 'In which city does AC: Mirage take place?',
                options: ['Cairo', 'Baghdad', 'Damascus', 'Jerusalem'],
                correct: 1,
                explain: '9th-century Baghdad is the main city during the Islamic Golden Age.'
            },
            {
                q: 'Who is the main hero of Mirage?',
                options: ['Ezio', 'Altair', 'Basim', 'Kassandra'],
                correct: 2,
                explain: 'Basim Ibn Ishaq is a Baghdad street thief who becomes an assassin. He also appears in AC Valhalla.'
            },
            {
                q: 'In which century does the game take place?',
                options: ['VIII', 'IX', 'XI', 'XV'],
                correct: 1,
                explain: 'The 9th century CE, during the Abbasid Caliphate.'
            },
            {
                q: 'What is the assassin order called at this time?',
                options: ['Templars', 'Hidden Ones', 'Brotherhood', 'Creed'],
                correct: 1,
                explain: 'The Hidden Ones are the predecessors of the Assassin Brotherhood.'
            },
            {
                q: 'Mirage returns to the series roots. Which games is it closest to in style?',
                options: ['AC Odyssey', 'AC Valhalla', 'AC1 and AC2', 'AC Origins'],
                correct: 2,
                explain: 'Mirage refocuses on stealth and parkour, like the early games.'
            }
        ]
    },
    'cyberpunk': {
        title: 'Cyberpunk 2077',
        subtitle: 'Cyberpunk 2077 Quiz',
        emoji: '🌃',
        xpReward: 400,
        questions: [
            {
                q: 'Who developed Cyberpunk 2077?',
                options: ['Bethesda', 'CD Projekt Red', 'Bioware', 'Ubisoft'],
                correct: 1,
                explain: 'CD Projekt Red is a Polish studio also known for The Witcher series.'
            },
            {
                q: 'What is the Cyberpunk 2077 expansion released in 2023 called?',
                options: ['Phantom Liberty', 'Blood and Wine', 'Far Harbor', 'The Old Hunters'],
                correct: 0,
                explain: 'Phantom Liberty is a major story expansion with the new Dogtown location.'
            },
            {
                q: 'Which lifepaths are available for V at the start?',
                options: ['2', '3', '4', '5'],
                correct: 1,
                explain: 'Three lifepaths: Nomad, Streetkid, and Corpo.'
            },
            {
                q: 'What is the Relic in the game\'s story?',
                options: ['Weapon', 'Biochip with a consciousness', 'Car', 'Health implant'],
                correct: 1,
                explain: 'The Relic is a biochip containing a copied consciousness — in V\'s case, Johnny Silverhand.'
            },
            {
                q: 'Which faction controls Dogtown?',
                options: ['Maelstrom', 'Tyger Claws', 'Barghest', 'Voodoo Boys'],
                correct: 2,
                explain: 'Barghest is the paramilitary faction led by Kurt Hansen in Dogtown.'
            },
            {
                q: 'Which character is voiced and modeled after Idris Elba in Phantom Liberty?',
                options: ['Solomon Reed', 'Cerberus', 'Kurt Hansen', 'Song So Mi'],
                correct: 0,
                explain: 'Solomon Reed is an FIA agent and a key character in Phantom Liberty.'
            }
        ]
    }
};

const questModal = document.getElementById('quest-modal');
const questModalTitle = document.getElementById('quest-modal-title');
const questModalSubtitle = document.getElementById('quest-modal-subtitle');
const questModalBody = document.getElementById('quest-modal-body');
const questModalClose = document.getElementById('quest-modal-close');

let currentQuest = null;
let currentQuestionIdx = 0;
let correctAnswers = 0;
let answeredCurrent = false;
const XP_PER_LEVEL = 1000;

function getPlayerProgress(totalXp) {
    const xp = Math.max(0, parseInt(totalXp, 10) || 0);
    const level = Math.floor(xp / XP_PER_LEVEL);
    const xpIntoLevel = xp % XP_PER_LEVEL;
    return {
        xp,
        level,
        xpIntoLevel,
        xpForNext: XP_PER_LEVEL,
        percent: Math.min(100, (xpIntoLevel / XP_PER_LEVEL) * 100)
    };
}

function playerStorageKey(key) {
    return window.currentUser?.id ? `gamequest_${window.currentUser.id}_${key}` : `gamequest_${key}`;
}

// Load completed quests from storage
function getCompletedQuests() {
    const saved = localStorage.getItem(playerStorageKey('completed'));
    return saved ? JSON.parse(saved) : [];
}

function saveCompletedQuest(questId, xpEarned) {
    const completed = getCompletedQuests();
    const existing = completed.find(c => c.id === questId);
    const previousBest = existing ? (existing.xp || 0) : 0;
    const xpToAdd = Math.max(0, xpEarned - previousBest);
    if (existing) {
        existing.xp = Math.max(existing.xp, xpEarned);
        existing.attempts = (existing.attempts || 1) + 1;
    } else {
        completed.push({ id: questId, xp: xpEarned, attempts: 1, date: Date.now() });
    }
    localStorage.setItem(playerStorageKey('completed'), JSON.stringify(completed));
    return xpToAdd;
}

function getUserXP() {
    const localXp = parseInt(localStorage.getItem(playerStorageKey('xp')) || '0', 10);
    if (window.currentProfile) {
        const profileXp = Number(window.currentProfile.xp ?? window.currentProfile.experience ?? window.currentProfile.points);
        if (Number.isFinite(profileXp)) {
            // Profile is the source of truth — sync localStorage to it
            if (profileXp !== localXp) {
                try { localStorage.setItem(playerStorageKey('xp'), profileXp); } catch (e) {}
            }
            return profileXp;
        }
        return localXp;
    }
    return localXp;
}

async function savePlayerProgressToSupabase(totalXp) {
    const client = typeof initSupabaseClient === 'function' ? initSupabaseClient() : supabaseClient;
    let user = window.currentUser;
    if (client?.auth?.getUser) {
        try {
            const { data } = await client.auth.getUser();
            if (data?.user) user = data.user;
        } catch (err) {
            console.warn('Could not confirm Supabase user:', err);
        }
    }
    if (!client || !user) return false;

    const progress = getPlayerProgress(totalXp);
    const payload = {
        xp: progress.xp,
        level: progress.level
    };

    try {
        const { data, error } = await client
            .from('profiles')
            .update(payload)
            .eq('user_id', user.id)
            .select('xp, level')
            .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error('No profile row was updated. Check user_id and RLS update policy.');
        window.currentProfile = { ...window.currentProfile, ...payload, ...data };
        return true;
    } catch (updateError) {
        console.warn('Profile XP update failed, trying upsert:', updateError);
    }

    try {
        const username = window.currentProfile?.username || user.user_metadata?.username || user.email.split('@')[0];
        const { data, error } = await client
            .from('profiles')
            .upsert(
                { user_id: user.id, username, ...payload },
                { onConflict: 'user_id' }
            )
            .select('xp, level')
            .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error('No profile row was upserted. Check insert policy and user_id unique constraint.');
        window.currentProfile = { ...window.currentProfile, username, ...payload, ...data };
        return true;
    } catch (upsertError) {
        console.error('Could not save XP to Supabase:', upsertError);
        if (typeof showNotification === 'function') {
            window.showNotification('XP saved locally, but Supabase blocked the update', '#6b7280');
        }
    }

    return false;
}

async function addUserXP(amount) {
    const current = getUserXP();
    const newXP = current + amount;
    localStorage.setItem(playerStorageKey('xp'), newXP);
    if (window.currentProfile) {
        const progress = getPlayerProgress(newXP);
        window.currentProfile = {
            ...window.currentProfile,
            xp: newXP,
            level: progress.level
        };
        updateProfileXP();
        if (window.currentUser) {
            await savePlayerProgressToSupabase(newXP);
            updateProfileXP();
        }
    } else {
        updateProfileXP();
    }
    return newXP;
}

function updateProfileXP() {
    const xp = getUserXP();
    const progress = getPlayerProgress(xp);
    const profileLevelEl = document.querySelector('.profile-level');
    if (profileLevelEl) {
        profileLevelEl.textContent = `Level: ${progress.level}`;
    }
    const profileXpEl = document.querySelector('.profile-xp');
    if (profileXpEl) {
        profileXpEl.textContent = `XP: ${progress.xpIntoLevel.toLocaleString('en-US')} XP / ${progress.xpForNext.toLocaleString('en-US')} XP`;
    }
    const fillEls = document.querySelectorAll('.profile-header .progress-fill');
    fillEls.forEach(el => el.style.width = progress.percent + '%');
    if (typeof updateHeaderPlayerStats === 'function') {
        updateHeaderPlayerStats(window.currentProfile || { xp, level: progress.level }, !!window.currentUser);
    }
}

function openQuest(questId) {
    currentQuest = questsData[questId];
    if (!currentQuest) return;
    currentQuest.id = questId;
    currentQuestionIdx = 0;
    correctAnswers = 0;
    answeredCurrent = false;

    questModalTitle.textContent = currentQuest.emoji + ' ' + currentQuest.title;
    questModalSubtitle.textContent = currentQuest.subtitle;
    questModal.classList.add('active');
    renderQuestion();
}

function closeQuest() {
    questModal.classList.remove('active');
    currentQuest = null;
}

function renderQuestion() {
    const q = currentQuest.questions[currentQuestionIdx];
    const total = currentQuest.questions.length;
    const progress = ((currentQuestionIdx) / total) * 100;
    answeredCurrent = false;

    questModalBody.innerHTML = `
        <div class="quest-progress-info">
            <span>Question ${currentQuestionIdx + 1} of ${total}</span>
            <span>Correct: ${correctAnswers}</span>
        </div>
        <div class="quest-progress-bar">
            <div class="quest-progress-fill" style="width: ${progress}%"></div>
        </div>
        <div class="quest-question">${q.q}</div>
        <div class="quest-options" id="quest-options">
            ${q.options.map((opt, i) => `
                <button class="quest-option" data-idx="${i}">${opt}</button>
            `).join('')}
        </div>
        <div class="quest-feedback" id="quest-feedback"></div>
        <button class="quest-next-btn" id="quest-next-btn">
            ${currentQuestionIdx + 1 < total ? 'Next Question →' : 'Finish Quest 🏆'}
        </button>
    `;

    // Attach answer handlers
    document.querySelectorAll('#quest-options .quest-option').forEach(btn => {
        btn.addEventListener('click', function() {
            if (answeredCurrent) return;
            answerQuestion(parseInt(this.dataset.idx));
        });
    });

    document.getElementById('quest-next-btn').addEventListener('click', nextQuestion);
}

function answerQuestion(selectedIdx) {
    answeredCurrent = true;
    const q = currentQuest.questions[currentQuestionIdx];
    const isCorrect = selectedIdx === q.correct;

    if (isCorrect) correctAnswers++;

    // Highlight answers
    document.querySelectorAll('#quest-options .quest-option').forEach((btn, i) => {
        btn.disabled = true;
        if (i === q.correct) {
            btn.classList.add('correct');
        } else if (i === selectedIdx && !isCorrect) {
            btn.classList.add('wrong');
        }
    });

    // Show feedback
    const feedback = document.getElementById('quest-feedback');
    feedback.className = 'quest-feedback show ' + (isCorrect ? 'correct-feedback' : 'wrong-feedback');
    feedback.innerHTML = `<strong>${isCorrect ? '✓ Correct!' : '✗ Incorrect'}</strong><br>${q.explain}`;

    // Show next button
    document.getElementById('quest-next-btn').classList.add('show');

    // Update progress bar
    const total = currentQuest.questions.length;
    const progress = ((currentQuestionIdx + 1) / total) * 100;
    document.querySelector('.quest-progress-fill').style.width = progress + '%';
}

function nextQuestion() {
    currentQuestionIdx++;
    if (currentQuestionIdx < currentQuest.questions.length) {
        renderQuestion();
    } else {
        showResults();
    }
}

async function showResults() {
    const total = currentQuest.questions.length;
    const percent = Math.round((correctAnswers / total) * 100);
    const xpEarned = Math.round(currentQuest.xpReward * (correctAnswers / total));

    let title, icon;
    if (percent === 100) {
        title = 'Perfect!';
        icon = '🏆';
    } else if (percent >= 70) {
        title = 'Great!';
        icon = '⭐';
    } else if (percent >= 40) {
        title = 'Not bad';
        icon = '👍';
    } else {
        title = 'Could be better';
        icon = '💪';
    }

    // Save progress
    const xpAwarded = saveCompletedQuest(currentQuest.id, xpEarned);
    const newXP = await addUserXP(xpAwarded);

    // Add to activity log
    window.addActivityLog(`Completed quest "${currentQuest.title}" (${correctAnswers}/${total})`, 'quest_complete');

    questModalBody.innerHTML = `
        <div class="quest-results">
            <div class="quest-results-icon">${icon}</div>
            <div class="quest-results-title">${title}</div>
            <div class="quest-results-score">Correct answers: ${correctAnswers} of ${total} (${percent}%)</div>
            <div class="quest-rewards">
                <div class="quest-reward-item">
                    <div class="quest-reward-label">XP Earned</div>
                    <div class="quest-reward-value">+${xpAwarded}</div>
                </div>
                <div class="quest-reward-item">
                    <div class="quest-reward-label">Accuracy</div>
                    <div class="quest-reward-value">${percent}%</div>
                </div>
            </div>
            <div class="quest-results-actions">
                <button class="quest-results-btn quest-retry-btn" id="quest-retry">Try Again</button>
                <button class="quest-results-btn quest-finish-btn" id="quest-finish">Done</button>
            </div>
        </div>
    `;

    document.getElementById('quest-retry').addEventListener('click', () => {
        openQuest(currentQuest.id);
    });

    document.getElementById('quest-finish').addEventListener('click', () => {
        closeQuest();
        markCompletedQuestCards();
    });

    // Mark card as completed
    markCompletedQuestCards();
}

function markCompletedQuestCards() {
    const completed = getCompletedQuests();
    document.querySelectorAll('.play-quest-btn').forEach(btn => {
        const questId = btn.dataset.quest;
        const done = completed.find(c => c.id === questId);
        if (done) {
            btn.classList.add('completed');
            btn.innerHTML = `✓ Completed (+${done.xp} XP)`;
        }
    });
}

// Wire up play buttons
document.querySelectorAll('.play-quest-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openQuest(this.dataset.quest);
    });
});

// Modal close handlers
questModalClose.addEventListener('click', closeQuest);
questModal.addEventListener('click', function(e) {
    if (e.target === questModal) closeQuest();
});
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && questModal.classList.contains('active')) closeQuest();
});

// Initialize: mark completed quests and load XP
markCompletedQuestCards();
updateProfileXP();
// ===== END QUEST ENGINE =====

// ===== QUICK START =====
const qsSteps = document.querySelectorAll('.qs-step');
const qsProgressFill = document.getElementById('qs-progress-fill');
const qsProgressText = document.getElementById('qs-progress-text');
const qsReward = document.getElementById('qs-reward');
const qsResetBtn = document.getElementById('qs-reset-btn');

function getQuickStart() {
    const saved = localStorage.getItem('gamequest_quickstart');
    return saved ? JSON.parse(saved) : { mode: false, time: false, invite: false, rewarded: false };
}

function saveQuickStart(state) {
    localStorage.setItem('gamequest_quickstart', JSON.stringify(state));
}

function renderQuickStart() {
    const state = getQuickStart();
    let done = 0;
    qsSteps.forEach(step => {
        const key = step.dataset.step;
        if (state[key]) {
            step.classList.add('done');
            done++;
        } else {
            step.classList.remove('done');
        }
    });

    const percent = (done / 3) * 100;
    qsProgressFill.style.width = percent + '%';
    qsProgressText.textContent = `${done} / 3 steps`;

    // Show reset button when at least one step done
    qsResetBtn.style.display = done > 0 ? 'inline-block' : 'none';

    // Show reward when all done
    if (done === 3) {
        qsReward.classList.add('show');
        // Give XP reward once
        if (!state.rewarded) {
            state.rewarded = true;
            saveQuickStart(state);
            addUserXP(50);
            window.addActivityLog('Quick Start completed (+50 XP)', 'achievement');
            window.showNotification('🎉 +50 XP for Quick Start!', '#ffffff');
        }
    } else {
        qsReward.classList.remove('show');
    }
}

function completeStep(key) {
    const state = getQuickStart();
    if (state[key]) return; // Already done
    state[key] = true;
    saveQuickStart(state);
    renderQuickStart();
    window.showNotification('✓ Step complete!', '#ffffff');
}

// Helper: highlight element briefly
function highlightElement(el) {
    if (!el) return;
    el.style.transition = 'box-shadow 0.3s ease';
    el.style.boxShadow = '0 0 0 3px #ffffff, 0 0 20px rgba(255, 255, 255, 0.6)';
    el.style.borderRadius = '10px';
    setTimeout(() => {
        el.style.boxShadow = '';
    }, 2000);
}

// Step 1: Mode (Solo/Co-op) — find first filter checkbox group and scroll to it
qsSteps[0].addEventListener('click', function() {
    const filters = document.querySelector('.quests-filters');
    if (filters) {
        filters.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight first filter group
        const firstGroup = filters.querySelector('.filter-group');
        highlightElement(firstGroup);
    }
    completeStep('mode');
});

// Step 2: Time — scroll to duration filter
qsSteps[1].addEventListener('click', function() {
    const filters = document.querySelectorAll('.quests-filters .filter-group');
    // Try to find a group containing time-related text
    let timeFilter = null;
    filters.forEach(g => {
        const text = g.textContent.toLowerCase();
        if (text.includes('min') || text.includes('duration') || text.includes('difficulty')) {
            if (!timeFilter) timeFilter = g;
        }
    });
    const target = timeFilter || filters[3] || filters[0];
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        highlightElement(target);
    }
    completeStep('time');
});

// Step 3: Invite — scroll to first quest card
qsSteps[2].addEventListener('click', function() {
    const trending = document.querySelector('.trending-section');
    if (trending) {
        trending.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const firstCard = trending.querySelector('.quest-card');
        highlightElement(firstCard);
    }
    completeStep('invite');
});

// Listen for actual user actions that auto-complete steps
// Auto-complete "mode" when user checks Solo/Co-op filter
document.querySelectorAll('.quests-filters input[type="checkbox"]').forEach(cb => {
    const label = cb.closest('label')?.textContent.trim().toLowerCase() || '';
    if (label.includes('solo') || label.includes('co-op')) {
        cb.addEventListener('change', function() {
            if (this.checked) completeStep('mode');
        });
    }
    if (label.includes('min')) {
        cb.addEventListener('change', function() {
            if (this.checked) completeStep('time');
        });
    }
});

// Auto-complete "invite" step when user starts any quest
document.querySelectorAll('.play-quest-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        completeStep('invite');
    });
});

// Reset button
qsResetBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    saveQuickStart({ mode: false, time: false, invite: false, rewarded: false });
    renderQuickStart();
    window.showNotification('Quick Start сброшен', '#6b7280');
});

// Initial render
renderQuickStart();
// ===== END QUICK START =====

// ===== QUEST FILTERS & SEARCH =====
const questFilters = document.querySelectorAll('.quest-filter');
const questSearchInput = document.getElementById('quest-search-input');
const resetFiltersBtn = document.getElementById('reset-filters-btn');
const trendingGrid = document.getElementById('trending-grid');
const popularGrid = document.getElementById('popular-grid');
const trendingCount = document.getElementById('trending-count');
const popularCount = document.getElementById('popular-count');

function getActiveFilters() {
    const filters = { mode: [], difficulty: [], duration: [], type: [], status: [] };
    questFilters.forEach(cb => {
        if (cb.checked) {
            filters[cb.dataset.filter].push(cb.value);
        }
    });
    return filters;
}

function questMatchesFilters(card, filters, search) {
    // Text search by title
    if (search) {
        const title = card.querySelector('.quest-title')?.textContent.toLowerCase() || '';
        if (!title.includes(search)) return false;
    }

    // Mode filter (if any checked, card must match one)
    if (filters.mode.length > 0) {
        const mode = card.dataset.mode;
        if (!mode || !filters.mode.includes(mode)) return false;
    }

    // Difficulty
    if (filters.difficulty.length > 0) {
        const diff = card.dataset.difficulty;
        if (!diff || !filters.difficulty.includes(diff)) return false;
    }

    // Duration
    if (filters.duration.length > 0) {
        const dur = card.dataset.duration;
        if (!dur || !filters.duration.includes(dur)) return false;
    }

    // Type
    if (filters.type.length > 0) {
        const type = card.dataset.type;
        if (!type || !filters.type.includes(type)) return false;
    }

    // Status (new vs completed)
    if (filters.status.length > 0) {
        const questId = card.dataset.questId;
        const completed = getCompletedQuests();
        const isCompleted = questId && completed.some(c => c.id === questId);
        const wantNew = filters.status.includes('new');
        const wantCompleted = filters.status.includes('completed');
        if (wantNew && !wantCompleted && isCompleted) return false;
        if (wantCompleted && !wantNew && !isCompleted) return false;
        // Cards with no questId are never "completed", so hide them when filtering by "completed"
        if (filters.status.includes('completed') && !filters.status.includes('new') && !questId) return false;
    }

    return true;
}

function applyQuestFilters() {
    const filters = getActiveFilters();
    const search = (questSearchInput?.value || '').trim().toLowerCase();

    const anyFilterActive =
        filters.mode.length || filters.difficulty.length ||
        filters.duration.length || filters.type.length || filters.status.length || search;

    // Toggle reset button visibility
    if (resetFiltersBtn) {
        resetFiltersBtn.style.display = anyFilterActive ? 'block' : 'none';
    }

    // Process each grid
    [trendingGrid, popularGrid].forEach(grid => {
        if (!grid) return;
        const cards = grid.querySelectorAll('.quest-card');
        let visibleCount = 0;
        cards.forEach(card => {
            if (questMatchesFilters(card, filters, search)) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });
        // Toggle empty state class
        if (visibleCount === 0) {
            grid.classList.add('empty');
        } else {
            grid.classList.remove('empty');
        }
        // Update count badge
        const badge = grid.id === 'trending-grid' ? trendingCount : popularCount;
        if (badge) badge.textContent = visibleCount;
    });
}

function resetQuestFilters() {
    questFilters.forEach(cb => cb.checked = false);
    if (questSearchInput) questSearchInput.value = '';
    applyQuestFilters();
    window.showNotification('Filters reset', '#6b7280');
}

// Wire up events
questFilters.forEach(cb => cb.addEventListener('change', applyQuestFilters));
if (questSearchInput) {
    // Debounced search
    let searchTimer;
    questSearchInput.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(applyQuestFilters, 200);
    });
}
if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', resetQuestFilters);
}

// Re-apply filters when a quest is completed (so status filters update)
const originalSaveCompleted = saveCompletedQuest;
saveCompletedQuest = function(questId, xpEarned) {
    const xpToAdd = originalSaveCompleted(questId, xpEarned);
    applyQuestFilters();
    return xpToAdd;
};

// Initial state
applyQuestFilters();
// ===== END QUEST FILTERS =====

    window.playerStorageKey = playerStorageKey;
    window.getCompletedQuests = getCompletedQuests;
    window.getUserXP = getUserXP;
    window.addUserXP = addUserXP;
    window.savePlayerProgressToSupabase = savePlayerProgressToSupabase;
    window.updateProfileXP = updateProfileXP;
    window.openQuest = openQuest;
    window.getPlayerProgress = getPlayerProgress;
});
