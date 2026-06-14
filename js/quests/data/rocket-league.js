window.QuestLoader.register("rocket-league", {
        title: 'Rocket League',
        subtitle: 'Rocket League Quiz',
        emoji: '🚗',
        description: 'Футбол на машинах — от буста до flip reset на трёх уровнях.',
        difficulties: {
            easy: {
                questions: [
                    { q: 'Какой спорт смешали с машинами?', options: ['Баскетбол', 'Футбол', 'Хоккей', 'Теннис'], correct: 1, explain: 'Rocket League — футбол на машинах.' },
                    { q: 'Сколько игроков в стандартной команде?', options: ['1', '2', '3', '4'], correct: 2, explain: '3v3 — популярнейший рейтинговый формат.' },
                    { q: 'Кто разработал Rocket League?', options: ['Psyonix', 'Valve', 'Epic Games', 'Riot Games'], correct: 0, explain: 'Psyonix создала игру, позже куплена Epic.' },
                    { q: 'Для чего нужен буст?', options: ['Ускорение и полёты', 'Ремонт', 'Смена цвета', 'Пауза'], correct: 0, explain: 'Буст — скорость и aerial-удары.' },
                    { q: 'Как называется поле?', options: ['Арена', 'Питч', 'Корт', 'Стадион'], correct: 0, explain: 'Стандартные карты — арены с мячом.' }
                ]
            },
            medium: {
                questions: [
                    { q: 'Когда игра стала free-to-play?', options: ['2020', '2018', '2019', '2021'], correct: 0, explain: 'С сентября 2020 Rocket League стала бесплатной.' },
                    { q: 'Что такое aerial?', options: ['Удар по мячу в воздухе', 'Тип машины', 'Карта', 'Скин'], correct: 0, explain: 'Aerial — удар в прыжке с бустом.' },
                    { q: 'Сколько минут длится стандартный матч?', options: ['5', '7', '10', '3'], correct: 0, explain: 'Стандарт — 5 минут, при ничьей overtime.' },
                    { q: 'Как называется режим 1v1?', options: ['Duel', 'Solo', 'Showdown', 'Ranked 1s'], correct: 3, explain: '1v1 Ranked — отдельная лестница.' },
                    { q: 'Что такое «демка»?', options: ['Уничтожение машины соперника', 'Гол в верхнюю девятку', 'Сейв вратаря', 'Пас партнёру'], correct: 0, explain: 'Demo — столкновение, после которого соперник респавнится.' },
                    { q: 'Что такое dribbling?', options: ['Ведение мяча на капоте', 'Удар с переворотом', 'Сейв на линии', 'Прыжок от стены'], correct: 0, explain: 'Dribble — контроль мяча на машине.' },
                    { q: 'Сколько буст-падов на стандартной арене?', options: ['6 больших + 28 маленьких', '4', '10', '20'], correct: 0, explain: 'Классическая арена — 6 full и 28 small pads.' },
                    { q: 'Что такое overtime?', options: ['Дополнительное время при ничьей', 'Пауза', 'Штраф', 'Смена сторон'], correct: 0, explain: 'Overtime — «золотой гол» до первого гола.' },
                    { q: 'Какой режим 3 на 3?', options: ['Standard / Ranked 3s', 'Duel', 'Rumble', 'Snow Day'], correct: 0, explain: '3v3 — основной соревновательный режим.' },
                    { q: 'Что такое «pinch»?', options: ['Выстрел мяча между машиной и стеной', 'Демка', 'Аэриал', 'Флип'], correct: 0, explain: 'Pinch — мяч выжимается с огромной скоростью.' }
                ]
            },
            hard: {
                questions: [
                    { q: 'Что такое flip reset?', options: ['Сброс флипа от касания мяча в воздухе', 'Прыжок от стены', 'Двойной прыжок от потолка', 'Байт соперника'], correct: 0, explain: 'Flip reset — продвинутая механика высокого уровня.' },
                    { q: 'Что такое wave dash?', options: ['Касание земли для сохранения скорости', 'Удар носом машины', 'Прыжок без буста', 'Пинч по мячу'], correct: 0, explain: 'Wave dash сохраняет импульс при приземлении.' },
                    { q: 'Как называется соревновательная лига RL?', options: ['RLCS', 'BLAST', 'ESL One', 'Major'], correct: 0, explain: 'Rocket League Championship Series.' },
                    { q: 'Что такое musty flick?', options: ['Удар носом с переворотом', 'Пас с задней стенки', 'Дриблинг на капоте', 'Сейв на линии'], correct: 0, explain: 'Musty flick назван в честь игрока Musty.' },
                    { q: 'Сколько очков за гол в стандарте?', options: ['Зависит от режима, не фиксировано в матче', 'Всегда 100', 'Всегда 10', 'Всегда 1'], correct: 0, explain: 'Счёт — голы, не очки как в шутерах.' },
                    { q: 'Что заменило loot boxes в 2019–2020?', options: ['Blueprint и Credits', 'Battle Pass только', 'Подписка', 'Ничего'], correct: 0, explain: 'Blueprint-система после отказа от лутбоксов.' },
                    { q: 'Что такое ceiling shot?', options: ['Удар после отскока от потолка', 'Гол с земли', 'Демка', 'Сейв'], correct: 0, explain: 'Ceiling shot — продвинутая техника с потолка.' },
                    { q: 'Что такое double tap?', options: ['Два касания: стена + удар', 'Два гола подряд', 'Два демо', 'Два флипа'], correct: 0, explain: 'Double tap — мяч от стены и в ворота.' },
                    { q: 'Как называется сезонный ранкед-система?', options: ['Competitive seasons', 'Battle Cup', 'RLCS only', 'Casual only'], correct: 0, explain: 'Ранги обновляются по сезонам.' },
                    { q: 'Что такое «boost starving»?', options: ['Кража буста у соперника', 'Покупка буста', 'Пауза', 'Демка'], correct: 0, explain: 'Starve — забирать большие падсы у врага.' },
                    { q: 'Что такое half flip?', options: ['Быстрый разворот назад', 'Двойной прыжок', 'Аэриал', 'Пинч'], correct: 0, explain: 'Half flip — отмена флипа для разворота.' },
                    { q: 'Какой предмет меняет внешний вид машины?', options: ['Cosmetics / декали', 'Только буст', 'Только колёса', 'Ничего'], correct: 0, explain: 'Скины, декали, goal explosions — косметика.' },
                    { q: 'Что такое «flick»?', options: ['Резкий удар с капота', 'Пас назад', 'Сейв', 'Демка'], correct: 0, explain: 'Flick — быстрый удар при ведении мяча.' },
                    { q: 'Какой бренд владеет Rocket League с 2019?', options: ['Epic Games', 'Steam', 'Sony', 'Microsoft'], correct: 0, explain: 'Epic купила Psyonix в 2019.' },
                    { q: 'Что такое Rumble mode?', options: ['Режим со случайными power-ups', 'Только 1v1', 'Только снег', 'Без буста'], correct: 0, explain: 'Rumble — гранаты, крюки, плунжеры и т.д.' }
                ]
            }
        }
    });
