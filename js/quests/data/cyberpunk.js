window.QuestLoader.register("cyberpunk", {
        title: 'City Secrets',
        subtitle: 'Cyberpunk 2077 Quiz',
        emoji: '🗡️',
        description: 'Найт-Сити от первых шагов до Soulkiller и тайн Pacifica — три уровня глубины.',
        difficulties: {
            easy: {
                questions: [
                    { q: 'В каком городе происходит Cyberpunk 2077?', options: ['Лос-Анджелес', 'Night City', 'Нео-Токио', 'Дубай'], correct: 1, explain: 'Night City — вымышленный мегаполис в Калифорнии.' },
                    { q: 'Как зовут главного героя?', options: ['V', 'Джонни', 'Джеки', 'Ти-Баг'], correct: 0, explain: 'V — наёмник, имя и фамилия выбираются игроком.' },
                    { q: 'Кто озвучил Джонни Сильверхенда?', options: ['Киану Ривз', 'Брэд Питт', 'Том Круз', 'Леонардо ДиКаприо'], correct: 0, explain: 'Киану Ривз сыграл и озвучил Джонни.' },
                    { q: 'Какая корпорация чаще всего ассоциируется с властью в Night City?', options: ['Arasaka', 'Apple', 'Google', 'Nintendo'], correct: 0, explain: 'Arasaka — японский мегакорп, доминирующий в городе.' },
                    { q: 'Как называется киберпространство в лоре?', options: ['NET / Сеть', 'Матрица', 'Эфир', 'Клауд'], correct: 0, explain: 'NET — глобальная сеть, куда погружаются нетраннеры.' }
                ]
            },
            medium: {
                questions: [
                    { q: 'Сколько жизненных путей (lifepath) у V?', options: ['2', '3', '4', '5'], correct: 1, explain: 'Nomad, Streetkid и Corpo.' },
                    { q: 'Кто такой Джеки Уэллес для V?', options: ['Партнёр и друг', 'Босс Arasaka', 'Лидер Maelstrom', 'Агент NCPD'], correct: 0, explain: 'Джеки — напарник V в начале истории.' },
                    { q: 'Что такое Relic в сюжете?', options: ['Чип с сознанием', 'Снайперская винтовка', 'Имплант бега', 'Ключ от квартиры'], correct: 0, explain: 'Relic — биочип с записанным сознанием.' },
                    { q: 'Какой район известен как территория Voodoo Boys?', options: ['Pacifica', 'City Center', 'Westbrook', 'Heywood'], correct: 0, explain: 'Pacifica — заброшенный курорт, база Voodoo Boys.' },
                    { q: 'Кто главный конкурент Arasaka в лоре?', options: ['Militech', 'Biotechnica', 'Kang Tao', 'Petrochem'], correct: 0, explain: 'Militech — американский военный концерн.' },
                    { q: 'Кто такой Ти-Баг?', options: ['Нетраннер', 'Полицейский', 'Фиксер', 'Корпорат'], correct: 0, explain: 'Ти-Баг помогает V с взломами и миссиями.' },
                    { q: 'Что такое киберпсихоз?', options: ['Потеря рассудка от имплантов', 'Вирус в Сети', 'Зависимость от буста', 'Болезнь Relic'], correct: 0, explain: 'Слишком много хрома может свести с ума.' },
                    { q: 'Как зовут фиксера, давшего первую крупную работу?', options: ['Декстер ДеШон', 'Роган', 'Виктор', 'Мисти'], correct: 0, explain: 'Dex — фиксер, организовавший дело в Konpeki Plaza.' },
                    { q: 'Кто такой Виктор Вектор?', options: ['Риппердок', 'Нетраннер', 'Коп', 'Корпо'], correct: 0, explain: 'Виктор — риппердок и друг V с начала игры.' },
                    { q: 'Какой клан контролирует Japantown?', options: ['Tyger Claws', 'Maelstrom', 'Valentinos', '6th Street'], correct: 0, explain: 'Tyger Claws — японская банда Westbrook.' }
                ]
            },
            hard: {
                questions: [
                    { q: 'Что делает программа Soulkiller?', options: ['Копирует сознание, уничтожая оригинал', 'Лечит киберпсихоз', 'Взламывает ICE', 'Создаёт клон тела'], correct: 0, explain: 'Soulkiller копирует разум в цифровое хранилище.' },
                    { q: 'Чем занимаются Voodoo Boys?', options: ['Проникновением в Сеть и Blackwall', 'Уличными гонками', 'Производством имплантов', 'Торговлей оружием'], correct: 0, explain: 'Voodoo Boys одержимы Blackwall и ИИ за ним.' },
                    { q: 'Что пошло не так на ограблении в Konpeki Plaza?', options: ['Жертва Relic погибла, началась погоня', 'Voodoo Boys предали V', 'Arasaka отменила сделку', 'Джеки сбежал с чипом'], correct: 0, explain: 'После извлечения Relic сознание Джеки погибает.' },
                    { q: 'Чьё сознание на чипе Relic у V?', options: ['Джонни Сильверхенда', 'Alt Cunningham', 'Сабуро Арасака', 'Копия V'], correct: 0, explain: 'На Relic записан Джонни Сильверхенд.' },
                    { q: 'Как называлась группа Джонни?', options: ['Samurai', 'Rockerboyz', 'Maelstrom', 'Us Cracks'], correct: 0, explain: 'Samurai — легендарная рок-группа Джонни.' },
                    { q: 'Кем изначально планировали стать Pacifica?', options: ['Роскошным курортом', 'Промзоной', 'Военной базой', 'Штаб-квартирой Militech'], correct: 0, explain: 'Pacifica строили как курорт, проект заморозили.' },
                    { q: 'Что такое Blackwall?', options: ['Барьер против ИИ за Сетью', 'Стена Arasaka', 'Программа Soulkiller', 'Файрвол NCPD'], correct: 0, explain: 'Blackwall отделяет Сеть от rogue AI.' },
                    { q: 'Кто такая Alt Cunningham?', options: ['Легендарный нетраннер', 'Президент NUSA', 'Лидер Maelstrom', 'Риппердок'], correct: 0, explain: 'Alt — ключевая фигура лора, связана с Soulkiller.' },
                    { q: 'Как называется полиция Night City?', options: ['NCPD', 'MAX-TAC', 'Militech', 'Arasaka Security'], correct: 0, explain: 'Night City Police Department патрулирует город.' },
                    { q: 'Что такое MAX-TAC?', options: ['Отряд против киберпсихов', 'Нетраннерская гильдия', 'Корпоративная армия', 'Банда'], correct: 0, explain: 'MAX-TAC — «психосы» в броне, ликвидируют киберпсихоз.' },
                    { q: 'Кто такой Сабуро Арасака?', options: ['Основатель Arasaka', 'Лидер Militech', 'Фиксер', 'Нетраннер Voodoo Boys'], correct: 0, explain: 'Сабуро — патриарх корпорации Arasaka.' },
                    { q: 'Какой район — родина Valentinos?', options: ['Heywood', 'Pacifica', 'City Center', 'Watson'], correct: 0, explain: 'Valentinos — латиноамериканская банда Heywood.' },
                    { q: 'Что такое «чип» в сленге Night City?', options: ['Киберимплант или биочип', 'Деньги', 'Наркотик', 'Оружие'], correct: 0, explain: 'Чипы — носители софта, данных и сознаний.' },
                    { q: 'Кто такие Maelstrom?', options: ['Киберкультовая банда', 'Корпорация', 'Полиция', 'Номады'], correct: 0, explain: 'Maelstrom одержимы имплантами и модификациями.' },
                    { q: 'Где находится квартира V в начале?', options: ['Megabuilding H10', 'Konpeki Plaza', 'Arasaka Tower', 'Dogtown'], correct: 0, explain: 'H10 в Watson — стартовая квартира V.' }
                ]
            }
        }
    });
