window.QuestLoader.register("league-of-legends", {
    title: 'League of Legends',
    subtitle: 'LoL Quiz',
    emoji: '⚔️',
    description: 'Рунтерра, роли и Worlds — от первых каток до знатока лора и меты.',
    difficulties: {
        easy: {
            questions: [
                { q: 'Кто разработал League of Legends?', options: ['Riot Games', 'Valve', 'Blizzard', 'Epic Games'], correct: 0, explain: 'Riot — автор LoL и Valorant.' },
                { q: 'Сколько игроков в классической команде?', options: ['5', '4', '6', '3'], correct: 0, explain: '5v5 на Summoner\'s Rift.' },
                { q: 'Как называется главная карта?', options: ["Summoner's Rift", 'Howling Abyss only', 'Twisted Treeline', 'Crystal Scar'], correct: 0, explain: 'SR — стандарт ranked/нормals.' },
                { q: 'Что нужно уничтожить для победы?', options: ['Вражеский Nexus', 'Только все башни', 'Только барона', 'Только ингибиторы'], correct: 0, explain: 'Nexus — финальная цель.' },
                { q: 'Как называются игровые персонажи?', options: ['Champions', 'Agents', 'Legends', 'Operators'], correct: 0, explain: 'Чемпионы — уникальные герои с способностями.' }
            ]
        },
        medium: {
            questions: [
                { q: 'Какая роль обычно играет на нижней линии с саппортом?', options: ['ADC / Bot', 'Top', 'Jungle', 'Mid only'], correct: 0, explain: 'Bot lane — стрелок + саппорт.' },
                { q: 'Что такое Dragon в современной мете?', options: ['Объектив с душами драконов', 'Только бафф урона', 'Босс как барон', 'Крип в лесу'], correct: 0, explain: 'Dragon Souls меняют стиль игры команды.' },
                { q: 'Что даёт Baron Nashor?', options: ['Сильный бафф команды и усиление миньонов', 'Только золото одному', 'Респавн башен', 'Телепорт на базу'], correct: 0, explain: 'Baron — ключевой поздний объектив.' },
                { q: 'Сколько способностей у большинства чемпионов (без учёта пассивки)?', options: ['4 активных + пассив', '3', '5', '6'], correct: 0, explain: 'Q, W, E, R + пассив.' },
                { q: 'Что такое ARAM?', options: ['All Random All Mid на Howling Abyss', 'Ranked 5v5', 'Турнир Worlds', 'Режим TFT'], correct: 0, explain: 'ARAM — одна линия, случайные чемпионы.' },
                { q: 'Как называется валюта для покупки чемпионов?', options: ['Blue Essence / RP', 'V-Bucks', 'Robux', 'Gold только'], correct: 0, explain: 'BE — фарм, RP — премиум валюта.' },
                { q: 'Кто такой Thresh по роли?', options: ['Support', 'ADC', 'Top tank only', 'Jungle assassin'], correct: 0, explain: 'Треш — хук-сачок саппорт.' },
                { q: 'Что такое Flash?', options: ['Саммонерское заклинание рывка', 'Ультимейт', 'Руна', 'Предмет'], correct: 0, explain: 'Flash — почти обязателен в большинстве ролей.' },
                { q: 'Как называется киберспортивный мировой турнир LoL?', options: ['Worlds', 'The International', 'Majors', 'Champions Tour'], correct: 0, explain: 'World Championship — главный ивент года.' },
                { q: 'Что такое TFT?', options: ['Teamfight Tactics — автобатлер Riot', 'Новая карта SR', 'Режим 1v1', 'Тренировка last hit'], correct: 0, explain: 'TFT — отдельный режим в клиенте LoL.' }
            ]
        },
        hard: {
            questions: [
                { q: 'Какой чемпион известен фразой «Hasagi»?', options: ['Yasuo', 'Yone', 'Zed', 'Akali'], correct: 0, explain: 'Ясуо — культовый мидер с ветром.' },
                { q: 'Что такое Chemtech Drake soul?', options: ['Стиль с химтауном и шоковыми эффектами', 'Только скорость', 'Только щит', 'Невидимость всем'], correct: 0, explain: 'Души драконов менялись с патчами — знать мету.' },
                { q: 'Кто правит Noxus в лоре (иконический лидер)?', options: ['Swain / Darkwill legacy', 'Garen', 'Ashe', 'Azir'], correct: 0, explain: 'Ноксус — империя силы, Суэйн — ключевая фигура.' },
                { q: 'Что такое «wave management»?', options: ['Контроль линии и миньонов', 'Только роум', 'Только драки', 'Покупка предметов'], correct: 0, explain: 'Волны — основа макро на линии.' },
                { q: 'Какой предмет часто ассоциируют с ADC crit?', options: ['Infinity Edge', 'Warmog\'s only', 'Redemption', 'Support item'], correct: 0, explain: 'IE — классический крит-кор.' },
                { q: 'Что такое Herald?', options: ['Rift Herald — объектив для пуша', 'Дракон', 'Барон', 'Красный бафф'], correct: 0, explain: 'Герольд помогает ломать башни.' },
                { q: 'Кто такая Ahri по региону?', options: ['Ionia', 'Demacia', 'Freljord', 'Shurima'], correct: 0, explain: 'Ахри — ионийская девятихвостая лиса.' },
                { q: 'Что такое LCS / LEC / LCK?', options: ['Региональные лиги', 'Предметы', 'Руны', 'Режимы игры'], correct: 0, explain: 'Северная Америка, EMEA, Корея — топ-лиги.' },
                { q: 'Сколько чемпионов примерно в LoL (2024–2025)?', options: ['160+', '50', '80', '200 только TFT'], correct: 0, explain: 'Рост ростера — ежегодные релизы.' },
                { q: 'Что такое «peeling» для ADC?', options: ['Защита стрелка от угроз', 'Агрессивный дайв', 'Соло барон', 'Фарм только'], correct: 0, explain: 'Peel — саппорты и танки отсекают врагов.' },
                { q: 'Какой чемпион — «The Blind Monk»?', options: ['Lee Sin', 'Shen', 'Udyr', 'Master Yi'], correct: 0, explain: 'Ли Син — иконический джунглер.' },
                { q: 'Что такое Blue Essence Shop?', options: ['Магазин чемпионов за BE', 'Скины за BE only', 'Руны', 'Ключи Hextech'], correct: 0, explain: 'BE — бесплатная валюта прогрессии.' },
                { q: 'Кто такой Jinx в лоре Arcane?', options: ['Powder / безумная стрелок', 'Шериф Пилтовера', 'Ноксианский генерал', 'Дракон'], correct: 0, explain: 'Arcane принес LoL мировую популярность.' },
                { q: 'Что такое «power spike»?', options: ['Момент силы чемпиона/предмета', 'Лаг сервера', 'Патч только', 'Случайный крит'], correct: 0, explain: 'Спайки — основа тайминга драк/пуша.' },
                { q: 'Как называется режим с вращающимся набором режимов?', options: ['Rotating modes / ARURF etc.', 'Only SR', 'Only TFT', 'Custom only'], correct: 0, explain: 'URF, One for All и др. — ивентовые режимы.' }
            ]
        }
    }
});
