# Héctor García · Portafolio tecnológico

Sitio personal para presentar una selección de proyectos de desarrollo web, plataformas operativas, ERP/CRM, automatización e integraciones.

**Sitio:** https://hector-gc99.github.io/

## Objetivo

El portafolio está diseñado como una experiencia visual y breve. Los proyectos se cargan desde una fuente de datos centralizada y pueden incluir un enlace público cuando existe un sitio que se pueda mostrar.

## Stack

- HTML5 semántico
- CSS3 responsive
- JavaScript Vanilla
- JSON como fuente de datos
- GitHub Pages para publicación

No utiliza frameworks, Node, Composer, base de datos ni proceso de compilación.

## Estructura

```text
.
├── index.html
├── 404.html
├── .nojekyll
├── .gitignore
├── robots.txt
├── sitemap.xml
├── site.webmanifest
├── data/
│   └── projects.json
└── assets/
    ├── css/
    │   └── styles.css
    ├── js/
    │   └── app.js
    ├── icons/
    │   └── favicon.svg
    └── img/
        ├── social-preview.png
        └── projects/
```

## Administrar proyectos

Los proyectos se editan en `data/projects.json`. La interfaz se genera desde JavaScript, por lo que no es necesario duplicar tarjetas en `index.html`.

Campos principales:

- `title`, `subtitle`, `category`, `status`, `year`
- `summary`, `challenge`, `solution`, `role`
- `technologies`, `highlights`
- `url`: URL pública; dejar vacío para sistemas internos
- `featured`: prioriza visualmente un proyecto
- `accent`: `mint`, `blue`, `amber`, `violet` o `rose`

## Publicación en GitHub Pages

Este repositorio está preparado para utilizarse como sitio de usuario de GitHub Pages. El nombre esperado del repositorio es:

```text
Hector-GC99.github.io
```

Después de subir los archivos a la rama `main`, en **Settings → Pages** selecciona **Deploy from a branch**, rama `main` y carpeta `/ (root)`.

El sitio quedará disponible en:

```text
https://hector-gc99.github.io/
```

## Desarrollo local

`projects.json` se obtiene mediante `fetch()`, por lo que para una previsualización fiel conviene utilizar un servidor HTTP local en lugar de abrir `index.html` mediante `file://`.

Ejemplos: Live Server de VS Code, `php -S localhost:8000` o cualquier servidor estático local.

## Privacidad

Todo el contenido de este repositorio debe considerarse público. Antes de incorporar capturas de sistemas internos se deben retirar o difuminar credenciales, nombres personales, correos, teléfonos, folios, datos comerciales, endpoints privados y cualquier otra información sensible.

## Próximas mejoras

- Incorporar capturas reales optimizadas en WebP/AVIF.
- Completar la URL pública de Codeus cuando se valide.
- Crear casos de estudio visuales para proyectos prioritarios.
- Incorporar medios de contacto públicos que se decidan mostrar.
- Conectar un dominio propio si se requiere.
