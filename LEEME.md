# 🚀 Levo.dev — Cómo usarlo

## Probarlo YA (sin nada extra)
1. **Doble clic** en `index.html`.
2. Se abre en tu navegador. Ya puedes navegar las 5 pestañas, marcar postulaciones, copiar respuestas, alternar modo claro/oscuro, etc.
3. El **Asistente IA** funciona en modo DEMO (respuesta de muestra). Para respuestas reales con Claude, conecta el backend (10 min, abajo).
4. Las **ofertas** vienen con datos demo de empresas que ya revisamos (Jooycar, Alegra, Improving, etc.).
5. El **tracker** y el **banco** se guardan en este navegador (localStorage). Si abres en otro dispositivo, está vacío hasta que conectes el backend.

## Cómo funcionan los 5 tabs
| Tab | Para qué |
|---|---|
| 🏠 **Inicio** | Saludo, métricas (postulaciones/entrevistas/respuestas), próxima acción sugerida automática, accesos rápidos. |
| 📥 **Ofertas** | Feed de ofertas con filtros. Botón "Postular" abre el link y crea la postulación en el tracker. Botón "¿Por qué?" abre la IA con el formulario pre-cargado. |
| 💬 **IA** | 4 plantillas: ¿Por qué X? · Adaptar CV · Cover letter · Traducir. Toggle ES/EN. Botón copiar + guardar en banco. |
| 📋 **Tracker** | Kanban con 5 columnas (Por postular · Enviada · Entrevista · Oferta · Rechazada). Botón "→" mueve al siguiente estado. Confetti cuando llegas a Entrevista u Oferta 🎉 |
| 👤 **Yo** | Menú con Perfil, Banco de respuestas, Portal de plataformas (12+ bolsas y freelance), y Configuración. |

## Instalar como app en tu celular (PWA)
1. Sube los archivos a GitHub (ver "Subir a GitHub Pages" abajo) y activa GitHub Pages.
2. Abre la URL desde Chrome o Edge en el celular.
3. Menú del navegador → **"Añadir a pantalla de inicio"** / **"Instalar app"**.
4. Listo: aparece como app fullscreen con tu icono "L".

## Conectar la IA real (Claude API) — 10 minutos
1. Entra a https://script.google.com → **Proyecto nuevo**.
2. Borra el `Code.gs` por defecto, pega el contenido de `gas/Code.gs`.
3. Crea una **hoja de Google Sheets** nueva, copia su ID de la URL (entre `/d/` y `/edit`).
4. En Apps Script: ⚙️ **Configuración → Propiedades del script** → agrega dos:
   - `ANTHROPIC_API_KEY` = tu llave de https://console.anthropic.com
   - `SHEET_ID` = el ID de la hoja
5. **Implementar → Nueva implementación → Aplicación web** · Ejecutar como: Yo · Acceso: Cualquiera
6. Copia la URL `/exec`.
7. En Levo.dev → tab **Yo → ⚙️ Config → Backend** → pega la URL → Guardar.
8. Ahora el Asistente IA responde con Claude real. Cada respuesta cuesta unos centavos.

## Subir a GitHub Pages (gratis, queda con URL pública)
```bash
cd C:/Users/ISO/levo.dev
git init
git add .
git commit -m "feat: Levo.dev v1.0.0 (4 fases completas)"
git branch -M main
git remote add origin https://github.com/Levo19/levo.dev.git   # crea el repo primero en github.com
git push -u origin main
```
Luego en GitHub: **Settings → Pages → Source: main / root → Save.**
En 1-2 min tu portal vive en `https://levo19.github.io/levo.dev/` — y eso se lo mandas al reclutador.

## Personalizar
- **Banco de respuestas:** edita el array `BANCO_INICIAL` dentro de `index.html` (busca esa constante).
- **Ofertas demo:** edita `OFERTAS_DEMO` (mismo archivo). Cuando conectes el backend, las ofertas vendrán de la hoja "Ofertas" (que llenará la rutina cron).
- **Plataformas portal:** edita el array `PLATAFORMAS`.
- **Perfil que usa la IA:** edita la constante `PERFIL` en `gas/Code.gs` y re-implementa.

## Atajos visuales
- **Modo claro/oscuro:** ☀️/🌙 en el header (también en Config).
- **Sonidos:** toggle en Config (Web Audio API, sin archivos).
- **Confetti:** sale solo al mover una postulación a Entrevista u Oferta. 🎉
- **Exportar datos:** Config → ⬇️ Exportar (JSON con todo).

## ¿Algo no funciona?
- **"Modo DEMO" no se quita:** falta pegar la URL del backend en Config.
- **Backend da error:** revisa que `ANTHROPIC_API_KEY` y `SHEET_ID` estén en las Propiedades del Script y que el deploy esté como "Cualquiera".
- **Las ofertas no cargan del backend:** por ahora se leen del localStorage. La integración con la hoja "Ofertas" se activa cuando hagamos `fetch('getOfertas')` desde el frontend (lo dejamos para cuando conectes el backend).
