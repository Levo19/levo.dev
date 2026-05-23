# Backend GAS de Levo.dev — Workflow con clasp

## Setup inicial (1 sola vez)
1. Si no tienes clasp: `npm i -g @google/clasp` (ya lo tienes para tus otros proyectos).
2. Login: `clasp login` (cuenta luisvo.19@gmail.com).
3. Obtén tu Script ID desde la URL del proyecto en script.google.com (parte entre `/projects/` y `/edit`).
4. Renombra `.clasp.json.template` → `.clasp.json` y pega tu Script ID.

## Workflow diario (cuando modifiques Code.gs)
Desde la raíz `C:/Users/ISO/levo.dev/`:

```bash
cd gas
clasp push                                                   # sube Code.gs al proyecto
clasp deploy -i AKfycbwUrROfitdW0diXmCos-81ZK9shn872nFYxPHBIGBC_BkszURaUPsvuxyKGrvhZxPH2   # actualiza la URL /exec existente
```

Esto **mantiene la misma URL** que ya configuraste en Levo.dev — no tienes que volver a pegarla.

> 💡 Truco aprendido en tus otros proyectos: `clasp push` SOLO no actualiza el deployment activo. Hay que hacer `deploy -i <DEPLOYMENT_ID>` para que el frontend vea los cambios.

## Propiedades del script (no se versionan)
Las claves viven en Propiedades del Script (no en código, por seguridad):
- `ANTHROPIC_API_KEY` — tu llave de Claude
- `SHEET_ID` — ID de la hoja Sheets

Estas se configuran UNA SOLA VEZ en `script.google.com → ⚙ Configuración → Propiedades del script`.
