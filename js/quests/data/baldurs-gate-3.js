window.QuestLoader.register("baldurs-gate-3", {
    title: "Baldur's Gate 3",
    subtitle: 'BG3 Quiz',
    emoji: '🎲',
    description: 'Фаэрюн, броски d20 и лагерь — от Акта 1 до Морфа и Dark Urge.',
    difficulties: {
        easy: {
            questions: [
                { q: 'Кто разработал Baldur\'s Gate 3?', options: ['Larian Studios', 'BioWare', 'Obsidian', 'CD Projekt Red'], correct: 0, explain: 'Larian — авторы Divinity и BG3.' },
                { q: 'На какой настольной системе основана игра?', options: ['D&D 5e', 'Pathfinder 1e', 'D&D 3.5 only', 'GURPS'], correct: 0, explain: 'BG3 адаптирует правила D&D 5th Edition.' },
                { q: 'Как называется паразит в сюжете?', options: ['Illithid tadpole / tadpoles', 'Aberration seed', 'Mind flayer egg only', 'Crown of Karsus'], correct: 0, explain: 'Симбионт связывает группу в начале.' },
                { q: 'Сколько основных компаньонов (примерно полный ростер)?', options: ['10+', '3', '5', '20'], correct: 0, explain: 'Большой состав с романтиками и сюжетами.' },
                { q: 'Какой город — финальная зона кампании?', options: ['Baldur\'s Gate', 'Neverwinter', 'Waterdeep', 'Candlekeep only'], correct: 0, explain: 'Третий акт — улицы и трон Бальдур\'с Гейт.' }
            ]
        },
        medium: {
            questions: [
                { q: 'Кто Shadowheart по классу (стартовый билд)?', options: ['Cleric', 'Wizard', 'Barbarian', 'Rogue only'], correct: 0, explain: 'Шэдоухарт — жрица Шар.' },
                { q: 'Как зовут драконьего рыцаря-компаньона?', options: ['Wyll', 'Gale', 'Astarion', 'Karlach'], correct: 0, explain: 'Вилл — паладин с пактом.' },
                { q: 'Кто вампир-саркастичный эльф?', options: ['Astarion', 'Lae\'zel', 'Halsin', 'Jaheira'], correct: 0, explain: 'Астарион — романтика и расследование Кетрикомол.' },
                { q: 'Что такое Long Rest?', options: ['Длинный отдых с прогрессом сюжета в лагере', 'Быстрый сейв', 'Телепорт', 'Только лечение'], correct: 0, explain: 'Ночь в лагере — сцены и одобрение.' },
                { q: 'Какой акт начинается в лесу у реки после корабля?', options: ['Act 1 Wilderness / Grove', 'Act 3 only', 'Act 2 Shadow-Cursed', 'Epilogue only'], correct: 0, explain: 'Гоблинский лагерь / роща — развилки Акта 1.' },
                { q: 'Что такое Approval?', options: ['Отношение компаньонов к вам', 'Репутация города only', 'Карма Steam', 'Уровень брони'], correct: 0, explain: 'Одобрение открывает романтику и сцены.' },
                { q: 'Кто Lae\'zel?', options: ['Githyanki fighter', 'Drow wizard', 'Human bard', 'Dwarf cleric'], correct: 0, explain: 'Лаэзель — гитьянки с криомсом.' },
                { q: 'Что такое Ki в BG3?', options: ['Ресурс монаха', 'Валюта', 'Заклинание волшебника', 'Яд'], correct: 0, explain: 'Ки тратится на боевые приёмы Monk.' },
                { q: 'Какой класс может превращаться в медведя?', options: ['Druid', 'Ranger only', 'Sorcerer', 'Warlock'], correct: 0, explain: 'Друиды — Wild Shape.' },
                { q: 'Что такое «surface» в бою?', options: ['Горящая/электрическая/ядовитая зона', 'Только вода', 'Небо', 'Инвентарь'], correct: 0, explain: 'Поверхности — основа тактики Larian.' }
            ]
        },
        hard: {
            questions: [
                { q: 'Кто Orpheus в сюжете гитьянки?', options: ['Принц в Астральной Море', 'Гоблин-шаман', 'Торговец Зевтор', 'Дракон'], correct: 0, explain: 'Орфей — ключ к свободе от Мозголорда.' },
                { q: 'Что такое Netherbrain?', options: ['Коллективный разум иллитидов', 'Меч Паладина', 'Заклинание 9 круга', 'Карта Акта 2'], correct: 0, explain: 'Нетермозг — финальный конфликт.' },
                { q: 'Кто Minthara?', options: ['Drow паладин Баала (путь)', 'Компаньон только эльф', 'Кузнец', 'Рыбак'], correct: 0, explain: 'Минтара — редкий путь через гоблинов.' },
                { q: 'Что такое Dark Urge?', options: ['Особый Origin с импульсами убийства', 'Класс барда', 'Заклинание', 'Сложность Tactician'], correct: 0, explain: 'Тёмное побуждение — уникальная рольплей-линия.' },
                { q: 'Кто Gale и его проблема?', options: ['Wizard с бомбой в груди (Netherese)', 'Варвар', 'Плут без магии', 'Жрец Шар'], correct: 0, explain: 'Гейл — сюжет с орбами и богами.' },
                { q: 'Что такое Tactician mode?', options: ['Повышенная сложность боя', 'Только диалоги', 'Только стелс', 'Кооп 1 игрок'], correct: 0, explain: 'Тактик — больше HP врагов и механик.' },
                { q: 'Кто Raphael в Акте 2?', options: ['Дьявол сделок в Доме Надежды', 'Компаньон-гоблин', 'Дракон', 'Клирик'], correct: 0, explain: 'Рафаэль — контракт на Айслинн.' },
                { q: 'Что такое «surprise round»?', options: ['Раунд внезапности при успешном стелсе', 'Кат-сцена', 'Отдых', 'Торговля'], correct: 0, explain: 'Внезапность даёт преимущество.' },
                { q: 'Кто Jaheira из лора?', options: ['Легендарная друид-харпер из прошлых BG', 'Новый NPC без истории', 'Злодей только', 'Иллитид'], correct: 0, explain: 'Джахейра — связь с классическими BG.' },
                { q: 'Что такое Karmic Dice?', options: ['Влияние прошлых выборов на броски (мета/мод)', 'Обычный d20', 'Только крит', 'Режим читов'], correct: 0, explain: 'Система бросков — ядро проверок D&D.' },
                { q: 'Кто Karlach?', options: ['Tiefling barbarian из Ада', 'Эльф волшебник', 'Гном клирик', 'Человек бард'], correct: 0, explain: 'Карлах — романтика и движок сердца.' },
                { q: 'Что такое «concentration»?', options: ['Удержание одного концентрационного заклинания', 'Только отдых', 'Крафт', 'Торговля'], correct: 0, explain: 'Концентрация — ограничение баффов.' },
                { q: 'Кто Mol (популярный босс гоблинов)?', options: ['Priestess Gut / Absolute cult', 'Дракон', 'Орфей', 'Вор только'], correct: 0, explain: 'Культ Абсолюта пронизывает акты.' },
                { q: 'Сколько игроков в коопе BG3?', options: ['До 4', 'До 2', 'До 6', 'Только solo'], correct: 0, explain: 'Кооп на весь кампанию — до четырёх.' },
                { q: 'В каком году вышел полный релиз BG3 на PC?', options: ['2023', '2020', '2024', '2021'], correct: 0, explain: 'Август 2023 — выход из Early Access.' }
            ]
        }
    }
});
