# Levo.dev

Portal personal de Luis Vásquez — **asistente de búsqueda de empleo + pieza de portafolio en vivo**.

PWA Vue 3 + Google Apps Script + Claude API. Sin build, sin servidor propio, hosting gratis en GitHub Pages.

## Stack
- **Frontend:** Vue 3 (CDN) + Tailwind (CDN) + PWA instalable
- **Backend:** Google Apps Script (serverless) — proxy seguro a Claude API
- **BD:** Google Sheets (Ofertas, Postulaciones, Banco)
- **IA:** Claude Sonnet 4.5 vía API, perfil del usuario pre-cargado en el system prompt
- **Sonidos:** Web Audio API (sin archivos externos)
- **Animaciones:** Vue transitions, confetti DOM, glassmorphism, gradientes
- **Modo claro/oscuro:** CSS variables, persiste en localStorage
- **Deploy:** GitHub Pages + clasp

## Estructura
```
levo.dev/
├─ index.html        ← Toda la app Vue (single-file, ~900 líneas)
├─ sw.js             ← Service worker (offline + PWA instalable)
├─ manifest.json     ← PWA instalable
└─ gas/
   └─ Code.gs        ← Backend Apps Script + proxy Claude + CRUD ofertas/postulaciones
```

## Estado del roadmap
- ✅ **Fase 1 — MVP:** Inicio · Asistente IA (4 plantillas: porqué / adaptar CV / cover / traducir) · Banco de respuestas (12 pre-cargadas, filtros, buscador) · Perfil profesional.
- ✅ **Fase 2 — Ofertas + Portal:** Pestaña Ofertas con feed, filtros, "postular" → tracker automático, "¿por qué?" → IA pre-cargada. Portal de plataformas (12+ links categorizados).
- ✅ **Fase 3 — Tracker:** Kanban swipeable (5 columnas), modal nuevo/editar, persiste local, tasa de respuesta calculada, próxima acción dinámica en Inicio.
- ✅ **Fase 4 — Polish:** Modo claro/oscuro toggle, sonidos toggle (Web Audio API), confetti en hitos (entrevista, oferta), animaciones premium, modal confirm custom (sin alert/confirm nativos), exportar/borrar datos.

## 5 tabs
🏠 Inicio · 📥 Ofertas · 💬 IA · 📋 Tracker · 👤 Yo
(dentro de "Yo": Perfil · Banco · Portal · Config)

## Setup
Ver `LEEME.md` — guía paso a paso de cómo abrirlo, instalarlo en celular y conectar el backend.
