# GameQuest — Quest World

Статический веб-проект (HTML/CSS/JS) с авторизацией и хранением профилей через Supabase.

## Структура

```
gamequest/
├── index.html
├── css/
│   ├── base.css          # сброс, layout, шапка, навигация, hero
│   ├── components.css    # карточки, модалки, друзья, квесты, гостевая
│   └── pages.css         # auth-гейты, оверрайды страниц
├── js/
│   ├── config.js         # Supabase URL и ключ (публичный)
│   ├── supabase-init.js  # инициализация клиента Supabase
│   ├── utils.js          # polyfill localStorage, общие хелперы
│   ├── auth-early.js     # ранняя привязка hero-кнопок
│   ├── main.js           # навигация, настройки, аватар
│   ├── friends.js        # список друзей и модалка
│   ├── profile.js        # достижения, любимые игры, гостевая
│   ├── quests.js         # движок квестов, фильтры, quick start
│   ├── auth.js           # логин/регистрация Supabase
│   ├── home.js           # логика главной страницы
│   └── bootstrap.js      # запуск всех модулей при загрузке
└── assets/
    ├── images/
    └── icons/
```

## Запуск локально

Открой `index.html` в браузере или подними простой сервер:

```bash
npx serve .
```

## Деплой (GitHub Pages)

1. Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main`, папка `/ (root)`

Сайт будет доступен по адресу `https://<логин>.github.io/<репозиторий>/`.

## Замечания

- Ключ в `js/config.js` — публичный (anon/publishable) ключ Supabase, его использование в браузере допустимо.
- Настрой Row Level Security (RLS) в Supabase для защиты данных.
- Секретные ключи (service role) в репозиторий добавлять нельзя.
