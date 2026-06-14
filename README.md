# GameQuest — Quest World

Static web project (HTML/CSS/JS) with authentication and profile storage via Supabase.

## Structure

```
gamequest/
├── index.html
├── css/
│   ├── base.css          # reset, layout, header, navigation, hero
│   ├── components.css    # cards, modals, friends, quests, guest view
│   └── pages.css         # auth gates, page overrides
├── js/
│   ├── config.js         # Supabase URL and key (public)
│   ├── supabase-init.js  # Supabase client initialization
│   ├── utils.js          # localStorage polyfill, shared helpers
│   ├── auth-early.js     # early hero button binding
│   ├── main.js           # navigation, settings, avatar
│   ├── friends.js        # friends list and modal
│   ├── profile.js        # achievements, favorite games, guest view
│   ├── quests.js         # quest engine, filters, quick start
│   ├── auth.js           # Supabase login/registration
│   ├── home.js           # home page logic
│   └── bootstrap.js      # boot all modules on load
└── assets/
    ├── images/
    └── icons/
```

## Run locally

Open `index.html` in a browser or start a simple server:

```bash
npx serve .
```

## Deploy (GitHub Pages)

1. Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main`, folder `/ (root)`

The site will be available at `https://<username>.github.io/<repository>/`.

## Notes

- The key in `js/config.js` is a public (anon/publishable) Supabase key; using it in the browser is expected.
- Configure Row Level Security (RLS) in Supabase to protect data.
- Do not add secret keys (service role) to the repository.
