window.QuestLoader.register("genshin-impact", {
    title: 'Genshin Impact',
    subtitle: 'Genshin Quiz',
    emoji: '✨',
    description: 'Тейват, стихии и Archon Quest — от Mondstadt до Sumeru и Fontaine.',
    difficulties: {
        easy: {
            questions: [
                { q: 'Кто разработал Genshin Impact?', options: ['miHoYo / HoYoverse', 'NetEase', 'Tencent', 'Bandai'], correct: 0, explain: 'HoYoverse — студия из Шанхая.' },
                { q: 'Как называется открытый мир игры?', options: ['Тейват', 'Мондштадт only', 'Инадзума only', 'Ли Юэ only'], correct: 0, explain: 'Тейват — континент с семью нациями.' },
                { q: 'Сколько стихий в базовой системе?', options: ['7', '4', '5', '10'], correct: 0, explain: 'Анемо, Гео, Электро, Дендро, Гидро, Пиро, Крио.' },
                { q: 'Как зовут главных близнецов-путешественников?', options: ['Aether / Lumine', 'Venti / Zhongli', 'Paimon / Traveler', 'Raiden / Nahida'], correct: 0, explain: 'Игрок выбирает пол Путешественника.' },
                { q: 'Кто сопровождает игрока и говорит «это вкусно!»?', options: ['Paimon', 'Jean', 'Diluc', 'Kaeya'], correct: 0, explain: 'Паймон — маскот и гид.' }
            ]
        },
        medium: {
            questions: [
                { q: 'Какая нация вдохновлена Германией/средневековой Европой?', options: ['Mondstadt', 'Liyue', 'Inazuma', 'Sumeru'], correct: 0, explain: 'Мондштадт — город ветра и свободы.' },
                { q: 'Кто Archon ветра?', options: ['Venti (Barbatos)', 'Zhongli', 'Raiden Shogun', 'Nahida'], correct: 0, explain: 'Венти — Анемо Архонт.' },
                { q: 'Какая нация — китайский эстетический стиль?', options: ['Liyue', 'Mondstadt', 'Fontaine', 'Natlan'], correct: 0, explain: 'Ли Юэ — торговый порт и Гео Архонт.' },
                { q: 'Кто Geo Archon?', options: ['Zhongli (Morax)', 'Venti', 'Ei', 'Furina'], correct: 0, explain: 'Чжун Ли — бог контрактов.' },
                { q: 'Как называется gacha-система персонажей?', options: ['Wish / Молитва', 'Summon only', 'Loot box', 'Battle Pass only'], correct: 0, explain: 'Молитвы тратят Primogems / Fates.' },
                { q: 'Какая валюта для молитв (премиум)?', options: ['Primogems', 'Mora only', 'Resin only', 'V-Bucks'], correct: 0, explain: 'Примогемы — основная валюта gacha.' },
                { q: 'Что такое Resin?', options: ['Энергия для доменов и боссов', 'Валюта магазина скинов', 'Стамина бега', 'Оружие'], correct: 0, explain: 'Смола ограничивает фарм артефактов.' },
                { q: 'Какая нация — Япония (сёгунат)?', options: ['Inazuma', 'Sumeru', 'Mondstadt', 'Liyue'], correct: 0, explain: 'Инадзума — Электро и Вечная охота.' },
                { q: 'Кто Electro Archon в сюжете Inazuma?', options: ['Raiden Ei', 'Yae Miko', 'Kokomi', 'Ayaka'], correct: 0, explain: 'Эи — богиня вечности.' },
                { q: 'Что такое Spiral Abyss?', options: ['Ендгейм-башня с этажами', 'Сюжетный квест', 'PvP арена', 'Рыбалка'], correct: 0, explain: 'Бездна — проверка билдов и ротаций.' }
            ]
        },
        hard: {
            questions: [
                { q: 'Какая нация связана с мудростью и пустыней?', options: ['Sumeru', 'Fontaine', 'Natlan', 'Snezhnaya'], correct: 0, explain: 'Сумеру — Дендро Архонт Нахида.' },
                { q: 'Кто Dendro Archon?', options: ['Nahida (Lesser Lord Kusanali)', 'Zhongli', 'Venti', 'Neuvillette'], correct: 0, explain: 'Нахида — богиня мудрости.' },
                { q: 'Какая нация — Франция/вода?', options: ['Fontaine', 'Liyue', 'Inazuma', 'Mondstadt'], correct: 0, explain: 'Фонтейн — Гидро и драма суда.' },
                { q: 'Что такое «reaction» в бою?', options: ['Элементальная реакция', 'Квестовый выбор', 'Кат-сцена', 'Покупка молитвы'], correct: 0, explain: 'Vaporize, Freeze, Bloom — основа урона.' },
                { q: 'Что такое Artifact sets?', options: ['Сеты артефактов с бонусами', 'Оружие 5★ only', 'Еда', 'Телепорты'], correct: 0, explain: '4+2 сета — стандарт билда.' },
                { q: 'Кто Fatui Harbingers по лору?', options: ['Послы Царицы Снежной', 'Стражи Мондштадта', 'Рыбаки Ли Юэ', 'Самураи Инадзумы'], correct: 0, explain: 'Предвестники — антагонисты сюжета.' },
                { q: 'Что такое C6 в сообществе?', options: ['Шестая констелляция персонажа', 'Шестой мир', 'Шестой регион', 'Шестой босс'], correct: 0, explain: 'C6 — максимальное усиление персонажа.' },
                { q: 'Какой элемент у Diluc?', options: ['Pyro', 'Cryo', 'Hydro', 'Anemo'], correct: 0, explain: 'Дилюк — классический Pyro DPS.' },
                { q: 'Что такое «National Team» в мете?', options: ['Популярный F2P состав реакций', 'Команда Mondstadt NPC', 'PvP клан', 'Сюжетная гильдия'], correct: 0, explain: 'Националка — Xingqiu, Xiangling и др.' },
                { q: 'Кто Yae Miko по роли в лоре?', options: ['Кitsune и союзник Ei', 'Geo Archon', 'Hydro Dragon', 'Fatui leader'], correct: 0, explain: 'Яэ — владелица святилища и персонаж gacha.' },
                { q: 'Что такое Serenitea Pot?', options: ['Жилище и кастомизация', 'PvP режим', 'Рейдовый босс', 'Гача баннер'], correct: 0, explain: 'Чайник — housing система.' },
                { q: 'Как называется сюжетная линия Архонтов?', options: ['Archon Quests', 'Hangout only', 'World Quest only', 'Daily commissions'], correct: 0, explain: 'Архонт квесты ведут по регионам.' },
                { q: 'Что такое «pity» в молитвах?', options: ['Гарантированный 5★ после лимита', 'Штраф урона', 'Сюжетный выбор', 'Бан персонажа'], correct: 0, explain: 'Soft/hard pity — защита игрока в gacha.' },
                { q: 'Какой регион ещё не полностью релизнут в Тейвате (на момент расширения)?', options: ['Natlan / Snezhnaya и др.', 'Только Mondstadt', 'Все 7 открыты полностью', 'Только Liyue'], correct: 0, explain: 'Тейват постепенно открывает нации.' },
                { q: 'В каком году вышел глобальный релиз Genshin?', options: ['2020', '2018', '2022', '2015'], correct: 0, explain: 'Сентябрь 2020 — мировой старт.' }
            ]
        }
    }
});
