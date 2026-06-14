window.QuestLoader.register("roblox", {
    title: 'Roblox',
    subtitle: 'Roblox Quiz',
    emoji: '🧱',
    description: 'Платформа, Robux и легендарные experience — от новичка до разработчика UGC.',
    difficulties: {
        easy: {
            questions: [
                { q: 'Что такое Roblox по сути?', options: ['Платформа пользовательских игр', 'Одна MMORPG', 'Только конструктор скинов', 'Лаунчер Steam'], correct: 0, explain: 'Roblox — экосистема experience от сообщества.' },
                { q: 'Как называется внутриигровая валюта Roblox?', options: ['Robux', 'V-Bucks', 'Minecoins', 'Gems'], correct: 0, explain: 'Robux покупают за реальные деньги.' },
                { q: 'Как называются игры внутри Roblox?', options: ['Experiences / Places', 'Servers only', 'Mods', 'Shards'], correct: 0, explain: 'Официально — experiences (раньше games).' },
                { q: 'Как зовут аватара игрока?', options: ['Avatar', 'Agent', 'Skin', 'Toon'], correct: 0, explain: 'Аватар настраивается в Avatar Shop.' },
                { q: 'Что можно купить в Avatar Shop?', options: ['Одежду и аксессуары', 'Только оружие', 'Только карты', 'Только геймпассы'], correct: 0, explain: 'UGC-одежда — огромная экономика Roblox.' }
            ]
        },
        medium: {
            questions: [
                { q: 'Что такое Game Pass?', options: ['Покупка бонусов внутри experience', 'Подписка Roblox Premium', 'VIP-сервер навсегда', 'Валюта Robux'], correct: 0, explain: 'Game Pass даёт перки в конкретной игре.' },
                { q: 'Что такое Developer Exchange (DevEx)?', options: ['Вывод заработанных Robux разработчиками', 'Обмен скинов', 'Торговля аккаунтами', 'Покупка Premium'], correct: 0, explain: 'DevEx конвертирует Robux в реальные деньги для девов.' },
                { q: 'На каком движке создают experience?', options: ['Roblox Studio', 'Unreal Engine', 'Unity', 'Godot'], correct: 0, explain: 'Roblox Studio — бесплатный редактор платформы.' },
                { q: 'Что такое Premium в Roblox?', options: ['Подписка с ежемесячными Robux', 'Только чат', 'Античит', 'Режим 18+'], correct: 0, explain: 'Premium даёт stipend и возможность торговли.' },
                { q: 'Какой язык программирования в Roblox Studio?', options: ['Luau', 'Python', 'C#', 'JavaScript'], correct: 0, explain: 'Luau — форк Lua от Roblox.' },
                { q: 'Что такое Adopt Me! по жанру?', options: ['Симулятор питомцев и торговли', 'Шутер', 'Гонки', 'Хоррор'], correct: 0, explain: 'Adopt Me! — один из самых популярных симов.' },
                { q: 'Что такое Brookhaven RP?', options: ['Ролевой симулятор жизни', 'Battle Royale', 'Tower Defense', 'Rhythm game'], correct: 0, explain: 'Brookhaven — социальный RP без цели-погони.' },
                { q: 'Что такое R$ в сообществе?', options: ['Сокращение от Robux', 'Rank Score', 'Rating Stars', 'Random Server'], correct: 0, explain: 'R$ — символ валюты Robux.' },
                { q: 'Что такое Limited UGC item?', options: ['Ограниченный предмет с resale', 'Бесплатная одежда', 'Вирусный мем', 'Геймпасс'], correct: 0, explain: 'Limiteds торгуются между игроками.' },
                { q: 'Как называется система друзей и чата?', options: ['Friends / Party / Chat', 'Guilds only', 'Clans Apex', 'Discord встроенный'], correct: 0, explain: 'Социальные функции встроены в клиент.' }
            ]
        },
        hard: {
            questions: [
                { q: 'Что такое Blox Fruits по механике?', options: ['Anime-inspired grinding RPG', 'Строительный сим', 'Racing sim', 'Card game'], correct: 0, explain: 'Blox Fruits — фрукты-силы и прокачка уровня.' },
                { q: 'Что такое «scamming» в экономике Roblox?', options: ['Мошенничество при трейде', 'Легальный DevEx', 'Покупка Premium', 'Создание UGC'], correct: 0, explain: 'Трейды Limiteds — цель скамеров.' },
                { q: 'Что такое Rthro?', options: ['Стиль реалистичных тел аватаров', 'Новый движок', 'Режим VR only', 'Тип геймпасса'], correct: 0, explain: 'Rthro — более пропорциональные модели.' },
                { q: 'Что делает Group Funds?', options: ['Казна группы разработчиков', 'Личный кошелёк', 'Premium бонус', 'Валюта experience'], correct: 0, explain: 'Группы распределяют доход от игр.' },
                { q: 'Что такое Voice Chat в Roblox?', options: ['Голосовой чат с верификацией возраста', 'Только текст', 'Только в Studio', 'Только Premium 2019'], correct: 0, explain: 'Spatial Voice требует подтверждения 13+.' },
                { q: 'Какой experience известен хоррором с doors?', options: ['DOORS', 'Adopt Me!', 'Pet Sim X', 'Jailbreak only'], correct: 0, explain: 'DOORS — процедурный хоррор в отелях.' },
                { q: 'Что такое Jailbreak по жанру?', options: ['Cops vs Robbers open world', 'Футбол', 'Tycoon', 'Rhythm'], correct: 0, explain: 'Jailbreak — классика погонь и ограблений.' },
                { q: 'Что такое UGC Program?', options: ['Создание и продажа одежды сообществом', 'Только для Roblox Corp', 'Моды вне платформы', 'Серверы Minecraft'], correct: 0, explain: 'UGC расширил каталог Avatar Shop.' },
                { q: 'Что такое «filtering enabled» в Studio?', options: ['Серверная валидация физики/логики', 'Фильтр чата only', 'Графический фильтр', 'Анти-AFK'], correct: 0, explain: 'FE — безопасность и античит на сервере.' },
                { q: 'Что такое Tower of Hell?', options: ['Obby (полоса препятствий)', 'RP город', 'Tycoon', 'FPS'], correct: 0, explain: 'Obby — жанр платформинга в Roblox.' },
                { q: 'Сколько процентов Robux обычно получает разработчик с покупок (до налогов платформы)?', options: ['Около 70% после доли платформы', '100%', '10%', '50% игроку'], correct: 0, explain: 'Доля платформы — часть экономики DevEx.' },
                { q: 'Что такое Private Server?', options: ['Платный сервер только для друзей', 'Бесплатный всем', 'Только для девов', 'Режим офлайн'], correct: 0, explain: 'VIP-сервера покупаются Robux.' },
                { q: 'Какой experience связан с «99 Nights in the Forest» хайпом?', options: ['Survival horror тренды', 'Гоночный сим', 'Образовательный', 'Музыкальный'], correct: 0, explain: 'Хоррор-survival периодически взрывает CCU.' },
                { q: 'Что такое Roblox Creator Hub?', options: ['Документация и ресурсы для девов', 'Магазин скинов', 'Форум игроков', 'Античит панель'], correct: 0, explain: 'Creator Hub — API, туториалы, аналитика.' },
                { q: 'В каком году Roblox вышел публично (классический релиз платформы)?', options: ['2006', '2015', '2011', '2020'], correct: 0, explain: 'Dynablocks → Roblox с 2006 года.' }
            ]
        }
    }
});
