window.QuestLoader.register("valorant", {
    title: 'Valorant',
    subtitle: 'Valorant Quiz',
    emoji: '🎯',
    description: 'Агенты, спайк и экономика раундов — от unrated до знатока VCT.',
    difficulties: {
        easy: {
            questions: [
                { q: 'Кто разработал Valorant?', options: ['Riot Games', 'Valve', 'Blizzard', 'Epic Games'], correct: 0, explain: 'Valorant — tactical shooter от Riot.' },
                { q: 'Сколько игроков в команде?', options: ['5', '4', '6', '3'], correct: 0, explain: 'Стандарт 5v5.' },
                { q: 'Как называется главная PvP-цель?', options: ['Spike (плент/дефьюз)', 'Флаг', 'Кейс', 'Корона'], correct: 0, explain: 'Spike — аналог бомбы в CS.' },
                { q: 'Как зовут персонажей с уникальными способностями?', options: ['Agents', 'Champions', 'Legends', 'Operators only'], correct: 0, explain: 'Агенты делятся на роли Duelist, Initiator и др.' },
                { q: 'Сколько раундов нужно для победы в стандартном матче?', options: ['13', '16', '10', '7'], correct: 0, explain: 'Первые до 13 побед (с overtime).' }
            ]
        },
        medium: {
            questions: [
                { q: 'Какая роль агента Jett?', options: ['Duelist', 'Controller', 'Sentinel', 'Initiator'], correct: 0, explain: 'Джетт — мобильный дуэлянт.' },
                { q: 'Что такое Sage по роли?', options: ['Sentinel / хилер', 'Duelist', 'Initiator only', 'Controller only'], correct: 0, explain: 'Сейдж лечит и воскрешает.' },
                { q: 'Сколько кредитов за килл (примерно базово)?', options: ['200', '500', '100', '1000'], correct: 0, explain: 'Экономика строится на киллах, раундах и спайке.' },
                { q: 'Что такое Omen?', options: ['Controller с телепортом и дымом', 'Duelist', 'Sentinel', 'Только хилер'], correct: 0, explain: 'Омен — дым и глобальный ульт.' },
                { q: 'Сколько секунд дефьюз без kit?', options: ['7', '5', '10', '4'], correct: 0, explain: 'Defuse — 7 сек, с kit — 4 (если kit в мете).' },
                { q: 'Что такое VCT?', options: ['Valorant Champions Tour', 'Valorant Casual Tier', 'Voice Chat Tool', 'Virtual Currency'], correct: 0, explain: 'VCT — официальный киберспорт.' },
                { q: 'Какой агент известен ловушками и камерой?', options: ['Cypher', 'Phoenix', 'Raze', 'Neon'], correct: 0, explain: 'Сайфер — sentinel с инфо.' },
                { q: 'Что такое «eco round»?', options: ['Раунд с экономией', 'Раунд только ножами', 'Только ульты', 'Только шерифы'], correct: 0, explain: 'Eco — копим на full buy.' },
                { q: 'Какой пистолет за 800 кредитов?', options: ['Ghost / Sheriff tier', 'Vandal', 'Operator', 'Odin'], correct: 0, explain: 'Ghost — популярный пистолет-раунд.' },
                { q: 'Что делает Brimstone?', options: ['Дым с неба и орбитальные удары', 'Только хил', 'Только dash', 'Только flash'], correct: 0, explain: 'Брим — controller с молотами.' }
            ]
        },
        hard: {
            questions: [
                { q: 'Сколько стоит Operator?', options: ['4700', '2900', '1600', '5000'], correct: 0, explain: 'Оператор — дорогая снайперка.' },
                { q: 'Что такое «default plant»?', options: ['Стандартная установка спайка на сайте', 'Раш без инфо', 'Ножевой раунд', 'Сейв оружия'], correct: 0, explain: 'Default — базовая тактика занятия сайта.' },
                { q: 'Какой агент добавлен из линейки Initiator с recon bolt?', options: ['Sova', 'Jett', 'Sage', 'Chamber'], correct: 0, explain: 'Сова — разведка стрелами и дроном.' },
                { q: 'Что такое «trading» в Valorant?', options: ['Мгновенный ответный килл', 'Обмен скинами', 'Свап агентов', 'Покупка Vandal'], correct: 0, explain: 'Trade — важная командная механика.' },
                { q: 'Сколько HP у стандартного агента?', options: ['100', '150', '120', '80'], correct: 0, explain: 'Без брони — 100 HP, щит отдельно.' },
                { q: 'Что такое «anti-eco»?', options: ['Закуп против экономии врага', 'Сейв спайка', 'Ножевой rush', 'Только смоки'], correct: 0, explain: 'Anti-eco — не недооценивать пистолеты.' },
                { q: 'Какой агент — Duelist с ракетами?', options: ['Raze', 'Killjoy', 'Viper', 'Harbor'], correct: 0, explain: 'Рейз — взрывной урон и мобильность.' },
                { q: 'Что такое Radiant rank?', options: ['Высший ранг в ranked', 'Скин', 'Режим игры', 'Турнир'], correct: 0, explain: 'Radiant — топ игроков региона.' },
                { q: 'Сколько кредитов за победу в пистолетке?', options: ['1900+ бонусы', '500', '100', '4700'], correct: 0, explain: 'Пистолетка задаёт экономику половины.' },
                { q: 'Что такое «post-plant»?', options: ['Игра после установки спайка', 'Раш A', 'Eco', 'Смена сторон'], correct: 0, explain: 'Post-plant — удержание позиций на дефьюз.' },
                { q: 'Какой Controller создаёт кислотные стены?', options: ['Viper', 'Phoenix', 'Reyna', 'Skye'], correct: 0, explain: 'Вайпер — зоны контроля карты.' },
                { q: 'Что такое «jiggle peek» в Valorant?', options: ['Короткий пик для инфо', 'Прыжок с выстрелом', 'Ульт только', 'Плент без проверки'], correct: 0, explain: 'Jiggle — безопасная разведка угла.' },
                { q: 'Какой агент воскрешает с орбом душ?', options: ['Reyna', 'Sage only', 'Phoenix', 'Clove only'], correct: 0, explain: 'Рейна — дуэлянт с селф-хилом/ресом в мете.' },
                { q: 'Что такое Premier?', options: ['Team-based competitive mode', 'Только deathmatch', 'Только spike rush', 'Сюжет'], correct: 0, explain: 'Premier — организованные команды Riot.' },
                { q: 'На каком движке работает Valorant?', options: ['Unreal Engine 4', 'Source 2', 'Unity', 'Frostbite'], correct: 0, explain: 'UE4 + кастомный netcode Riot.' }
            ]
        }
    }
});
