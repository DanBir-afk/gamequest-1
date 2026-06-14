window.QuestLoader.register("fortnite", {
    title: 'Fortnite',
    subtitle: 'Fortnite Quiz',
    emoji: '🪂',
    description: 'От королевской битвы до Zero Build — три уровня для казуала и ranked-игрока.',
    difficulties: {
        easy: {
            questions: [
                { q: 'Кто разработал Fortnite?', options: ['Epic Games', 'Valve', 'Riot Games', 'Blizzard'], correct: 0, explain: 'Fortnite — флагман Epic Games.' },
                { q: 'Как называется основной PvP-режим Fortnite?', options: ['Battle Royale', 'Team Deathmatch', 'Capture the Flag', 'Search and Destroy'], correct: 0, explain: 'Battle Royale — главный режим с 100 игроками.' },
                { q: 'Сколько игроков в стандартном соло-матче BR?', options: ['100', '50', '64', '32'], correct: 0, explain: 'Классический лобби — до 100 игроков.' },
                { q: 'Что нужно сделать для победы в Battle Royale?', options: ['Остаться последним', 'Набрать 50 киллов', 'Захватить базу', 'Собрать 999 материалов'], correct: 0, explain: 'Victory Royale — последний выживший.' },
                { q: 'Какой материал строится быстрее всех?', options: ['Дерево', 'Камень', 'Металл', 'Все одинаково'], correct: 0, explain: 'Дерево — самый быстрый, но слабый материал.' }
            ]
        },
        medium: {
            questions: [
                { q: 'Что такое Zero Build в Fortnite?', options: ['Режим без строительства', 'Режим только с деревом', 'Режим с одной жизнью', 'Режим 1v1'], correct: 0, explain: 'Zero Build убирает механику постройки.' },
                { q: 'Как называется валюта для скинов в магазине?', options: ['V-Bucks', 'Robux', 'Credits', 'Riot Points'], correct: 0, explain: 'V-Bucks покупаются за реальные деньги или Battle Pass.' },
                { q: 'Что такое Battle Pass?', options: ['Сезонный прогресс с наградами', 'Пропуск в ranked', 'VIP-сервер', 'Подписка на Creative'], correct: 0, explain: 'Battle Pass даёт скины и эмоуты за уровни.' },
                { q: 'Какой предмет восстанавливает щит и здоровье?', options: ['Shield Potion / Medkit', 'Chug Jug только', 'Bandage только', 'Slurp Fish только'], correct: 0, explain: 'Мини/большой щит и аптечки — база выживания.' },
                { q: 'Что такое Storm в Fortnite?', options: ['Сужающаяся зона урона', 'Погодный эффект без урона', 'Режим ночи', 'Босс-ивент'], correct: 0, explain: 'Буря заставляет игроков сходиться к центру.' },
                { q: 'Сколько игроков в отряде в Squads?', options: ['4', '3', '5', '2'], correct: 0, explain: 'Squads — команды по четыре человека.' },
                { q: 'Что такое Reboot Van?', options: ['Воскрешает павших союзников', 'Даёт легендарное оружие', 'Телепортирует в безопасную зону', 'Меняет скин'], correct: 0, explain: 'Reboot Van возвращает тиммейта при наличии карты.' },
                { q: 'Какой режим для пользовательских карт?', options: ['Fortnite Creative', 'Save the World', 'Arena', 'Blitz'], correct: 0, explain: 'Creative — редактор островов и UEFN-карты.' },
                { q: 'Что такое Victory Royale?', options: ['Победа в матче', 'Редкий скин', 'Ранг в Arena', 'Сезонный ивент'], correct: 0, explain: 'Victory Royale — экран победы.' },
                { q: 'Какой предмет даёт временный полёт с рывком?', options: ['Shockwave Grenade / Launch Pad', 'Smoke Grenade', 'Boogie Bomb', 'Stink Bomb'], correct: 0, explain: 'Шоковая граната и трамплины меняют позиционирование.' }
            ]
        },
        hard: {
            questions: [
                { q: 'Что такое FNCS?', options: ['Fortnite Champion Series — киберспорт', 'Новый режим PvE', 'Сезонный Battle Pass', 'Коллаб с Marvel'], correct: 0, explain: 'FNCS — официальные турниры Epic.' },
                { q: 'Сколько HP у полного щита (большие банки)?', options: ['100', '50', '75', '150'], correct: 0, explain: 'Два больших щита дают 100 shield.' },
                { q: 'Что такое Arena mode?', options: ['Ranked с Hype очками', 'Только Creative', 'PvE кампания', 'Режим без оружия'], correct: 0, explain: 'Arena — соревновательный рейтинговый режим.' },
                { q: 'Какой материал выдерживает больше урона?', options: ['Металл', 'Дерево', 'Камень', 'Все равны'], correct: 0, explain: 'Металлические стены — самые прочные.' },
                { q: 'Что такое Save the World?', options: ['PvE-режим против зомби', 'Battle Royale 50v50', 'Тренировочный режим', 'Только мобильная версия'], correct: 0, explain: 'STW — оригинальный кооперативный PvE Fortnite.' },
                { q: 'Сколько слотов в быстром инвентаре (панель строительства)?', options: ['5', '4', '6', '8'], correct: 0, explain: 'Пять ячеек быстрого доступа для оружия и предметов.' },
                { q: 'Что делает Boogie Bomb?', options: ['Заставляет танцевать', 'Оглушает звуком', 'Лечит союзников', 'Строит стену'], correct: 0, explain: 'Boogie Bomb — мемный контроль без урона.' },
                { q: 'Что такое UEFN?', options: ['Unreal Editor for Fortnite', 'Ultra Epic Fortnite Network', 'United Esports Fortnite', 'User Event Fortnite'], correct: 0, explain: 'UEFN — профессиональный редактор карт на Unreal.' },
                { q: 'Какой предмет раньше называли «Chug Jug» и давал полный хил?', options: ['Chug Jug', 'Slurp Juice', 'Bandage', 'Small Shield'], correct: 0, explain: 'Chug Jug восстанавливал 100 HP и 100 shield с долгим применением.' },
                { q: 'Что такое «third party» в Fortnite?', options: ['Атака двух сражающихся команд', 'Игра втроём', 'Третий раунд Storm', 'Три материала строительства'], correct: 0, explain: 'Third party — вмешательство в чужой файт.' },
                { q: 'Сколько материалов максимум в стаке (классически)?', options: ['999', '500', '1000', '250'], correct: 0, explain: 'Лимит стака дерева/камня/металла — 999.' },
                { q: 'Что такое Deadpool crossover в Fortnite?', options: ['Сезонный коллаб-сезон', 'Новый движок', 'Режим без строительства', 'Турнир только для PS'], correct: 0, explain: 'Fortnite славится крупными IP-коллаборациями.' },
                { q: 'Какой слот под оружие ближнего боя?', options: ['Отдельный слот pickaxe/мели', 'Только в инвентаре', 'Нельзя носить', 'Только в Creative'], correct: 0, explain: 'Кирка — обязательный инструмент и символ Fortnite.' },
                { q: 'Что такое «box fight»?', options: ['Бой внутри построенных боксов', 'Бой на открытой равнине', 'Режим Zero Build', 'PvE миссия'], correct: 0, explain: 'Box fighting — тактика редактирования стен в 1x1.' },
                { q: 'Как называется редкая снайперская винтовка в луте?', options: ['Bolt-Action Sniper / Heavy Sniper', 'AWP', 'KAR98 только в STW', 'DMR из Warzone'], correct: 0, explain: 'Снайперки — ключевой high-ground инструмент.' }
            ]
        }
    }
});
