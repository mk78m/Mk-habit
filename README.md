# Zenith — Personal Growth & Daily Mastery (Vite)

```
zenith/
├── package.json         Dependencies & scripts (dev / build / preview)
├── vite.config.ts        Vite build configuration
├── tailwind.config.js     Tailwind theme (zenith color palette, dark mode)
├── postcss.config.js      PostCSS pipeline for Tailwind
├── index.html             App shell markup (Vite entry HTML)
├── public/
│   └── manifest.webmanifest   PWA manifest
└── src/
    ├── main.js            Entry point: loads styles, boots the app
    ├── styles.css         Tailwind directives + custom styles
    ├── app.js             ZenithApp class: rendering, state, actions
    └── modules/
        ├── jalaliCalendar.js  Gregorian ↔ Jalali (Persian) date conversion
        ├── soundEngine.js     Web Audio synthesized success/warning chimes
        └── initialState.js    Default sample data (tasks, habits, routines)
```

## Getting started

```bash
npm install
npm run dev       # starts Vite dev server at http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview the production build
```

## Notes
- Tailwind CSS is compiled locally via PostCSS (no CDN script tag).
- `lucide` and `canvas-confetti` are npm dependencies, imported as ES
  modules in `src/app.js` — no CDN scripts required.
- App state persists to `localStorage` under the key `zenith_pwa_state`.
- `window.app` is set in `src/main.js` so the inline `onclick="app.…()"`
  handlers already in `index.html` keep working unchanged.
