window.QuestLoader.register("elden-ring", {
    title: 'Elden Ring',
    subtitle: 'Elden Ring Quiz',
    emoji: '⚜️',
    description: 'Междутрудье, Великие руны и боссы — от Малении до Могва, от Мохга до Радана.',
    difficulties: {
        easy: {
            questions: [
                { q: 'Кто разработал Elden Ring?', options: ['FromSoftware', 'Bethesda', 'Ubisoft', 'Capcom'], correct: 0, explain: 'FromSoftware + коллаб с Джорджем Мартином (лор).' },
                { q: 'Как называется открытый мир игры?', options: ['Lands Between', 'Lordran', 'Yharnam', 'Drangleic'], correct: 0, explain: 'Междутрудье — центральный континент.' },
                { q: 'Кто создатель Souls-формата (директор Elden Ring)?', options: ['Hidetaka Miyazaki', 'Gabe Newell', 'Hideo Kojima', 'Shigeru Miyamoto'], correct: 0, explain: 'Миядзаки — архитектор Soulsborne.' },
                { q: 'Как зовут лошадь-призрака игрока?', options: ['Torrent', 'Roach', 'Agro', 'Epona'], correct: 0, explain: 'Торрент — верный спутник Tarnished.' },
                { q: 'Как называют игрока в лоре?', options: ['Tarnished', 'Chosen Undead', 'Hunter', 'Ashen One'], correct: 0, explain: 'Осквернённые возвращаются за Elden Ring.' }
            ]
        },
        medium: {
            questions: [
                { q: 'Что такое Sites of Grace?', options: ['Костры сохранения и телепорта', 'Магазины', 'Боссы', 'Пепельные горшки'], correct: 0, explain: 'Благодать — аналог bonfire.' },
                { q: 'Кто NPC-гид с британским акцентом?', options: ['Melina', 'Ranni', 'Malenia', 'Miriel'], correct: 0, explain: 'Мелина дарует лошадь и уровни.' },
                { q: 'Что такое Flask of Crimson Tears?', options: ['Лечение HP', 'Мана only', 'Стамина only', 'Яд'], correct: 0, explain: 'Багровые фласки — основной хил.' },
                { q: 'Какой босс на старте у ворот Stormveil?', options: ['Margit, the Fell Omen', 'Malenia', 'Radahn', 'Morgott only endgame'], correct: 0, explain: 'Маргит — первый великий фильтр.' },
                { q: 'Что такое Great Runes?', options: ['Награды за главных боссов', 'Обычные заклинания', 'Ключи от домов', 'Скины брони'], correct: 0, explain: 'Великие руны усиливают персонажа у столика.' },
                { q: 'Где правит король золотого ордена?', options: ['Leyndell / Capital', 'Caelid only', 'Limgrave', 'Snowfield'], correct: 0, explain: 'Лейнделл — столица Эрдтри.' },
                { q: 'Что такое Spirit Ashes?', options: ['Призыв духов-союзников', 'Руны только', 'Оружие луков', 'Еда'], correct: 0, explain: 'Пепельные духи тратят фокус.' },
                { q: 'Какой регион известен гнилью Scarlet Rot?', options: ['Caelid', 'Limgrave', 'Liurnia', 'Altus Plateau'], correct: 0, explain: 'Каэлид — чумной красный rot.' },
                { q: 'Кто бог войны-полубога в Каэлиде?', options: ['Starscourge Radahn', 'Godrick', 'Rykar', 'Mogh'], correct: 0, explain: 'Радан — легендарный фестивальный босс.' },
                { q: 'Что такое Summoning Pool?', options: ['Точка коопа/инвазий', 'Магазин рун', 'Кузница', 'Быстрое путешествие'], correct: 0, explain: 'Белые знаки и пулы для мультиплеера.' }
            ]
        },
        hard: {
            questions: [
                { q: 'Кто «blade of Miquella»?', options: ['Malenia', 'Ranni', 'Millicent', 'Nepheli'], correct: 0, explain: 'Маления — один из сложнейших боссов серии.' },
                { q: 'Что такое «Waterfowl Dance»?', options: ['Ультимативная атака Малении', 'Заклинание Радана', 'Прыжок Торрента', 'Руна Годрика'], correct: 0, explain: 'Танец водяных птиц — мем боли.' },
                { q: 'Кто Ranni the Witch?', options: ['Полубогиня луны и квестовая линия', 'Торговец', 'Босс в Штормвиле', 'Чёрный рыцарь'], correct: 0, explain: 'Ранни — ключ к Age of Stars.' },
                { q: 'Что такое Frenzied Flame ending?', options: ['Концовка без порядка/хаос огня', 'Свадьба с Ранни', 'Золотой порядок', 'Смерть всех'], correct: 0, explain: 'Пламя безумия — альтернативный финал.' },
                { q: 'Кто Mohg, Lord of Blood?', options: ['Полубог культа крови', 'Страж Stormveil', 'Дракон Агхид', 'Кузнец'], correct: 0, explain: 'Мог — босс подземелья и DLC-связи.' },
                { q: 'Что такое Shadow of the Erdtree?', options: ['DLC в землях Микеллы', 'Базовый босс', 'Предмет старта', 'Режим PvP'], correct: 0, explain: 'DLC расширило Междутрудье.' },
                { q: 'Какой стат масштабирует Arcane для bleed?', options: ['Arcane', 'Faith only', 'Int only', 'Vitality only'], correct: 0, explain: 'Аркан — для статусов и некоторого оружия.' },
                { q: 'Что такое Poise?', options: ['Устойчивость к стаггеру', 'Скорость бега', 'Магия only', 'Вес экипировки only'], correct: 0, explain: 'Пуаз — не прерваться от ударов.' },
                { q: 'Кто Godrick the Grafted?', options: ['Полубог Штормвила', 'Радан', 'Мог', 'Маликет'], correct: 0, explain: 'Годрик — первый Великий рунный лорд пути.' },
                { q: 'Что такое Whetstone Knife?', options: ['Позволяет менять Ashes of War', 'Ключ от дома', 'Фласка', 'Карта'], correct: 0, explain: 'Точильный камень — кастомизация навыков.' },
                { q: 'Кто Blaidd the Half-Wolf?', options: ['Союзник линии Ранни', 'Торговец рун', 'Босс в Лейнделле', 'Дракон'], correct: 0, explain: 'Блейд — верный теневой слуга.' },
                { q: 'Что такое «status bleed»?', options: ['Кровотечение как накопительный эффект', 'Мгновенный килл', 'Только яд', 'Только frost'], correct: 0, explain: 'Bleed — популярный билд-стиль.' },
                { q: 'Кто Maliketh, the Black Blade?', options: ['Финальный страж Марика', 'Торговец', 'NPC в деревне', 'Дух лошади'], correct: 0, explain: 'Маликет — связан с Black Knife Assassins.' },
                { q: 'Что такое Larval Tear?', options: ['Предмет для ресета внешности', 'Руна', 'Ключ', 'Еда'], correct: 0, explain: 'Личиночная слеза — у Реналы/Пиджи.' },
                { q: 'В каком году вышел Elden Ring?', options: ['2022', '2020', '2024', '2019'], correct: 0, explain: 'Февраль 2022 — мировой релиз.' }
            ]
        }
    }
});
