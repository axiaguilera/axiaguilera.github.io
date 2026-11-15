# Sitio personal de Axi Fabricio Aguilera

Sitio estático (HTML, CSS y un poco de JavaScript). No necesita instalar nada.

## Estructura

```
index.html                  contenido de todo el sitio
assets/css/style.css        diseño
assets/js/twobody.js        simulador de dos cuerpos (órbitas circular, elíptica e hiperbólica)
assets/js/gallery.js        álbumes de fotos y visor
assets/js/solitons.js       animación de la colisión de solitones (datos incluidos)
assets/js/anim-video.js     reproduce y pausa el video del condensado
assets/Axi_Aguilera_CV.pdf  CV que se descarga desde el sitio
assets/img/research/        figuras de investigación (errores BSCI, video del condensado)
assets/img/industry/        figuras de Monte Carlo y convergencia de precios de opciones
assets/img/travel/          álbumes de viajes (una carpeta por lugar)
assets/img/music/           foto de la guitarra
assets/img/portrait.jpg     foto de perfil
.nojekyll                   indica a GitHub Pages que publique los archivos tal cual
```

## Publicarlo en GitHub Pages

1. En GitHub, crea un repositorio público llamado exactamente `axiaguilera.github.io`
   (por ejemplo, `axiaguilera.github.io`).
2. Sube todos los archivos de esta carpeta a la raíz del repositorio. Desde la web:
   **Add file → Upload files**, arrastra el contenido de la carpeta y haz **Commit changes**.
   Desde la terminal:
   ```bash
   git init
   git add .
   git commit -m "Personal website"
   git branch -M main
   git remote add origin https://github.com/axiaguilera/axiaguilera.github.io.git
   git push -u origin main
   ```
3. En el repositorio ve a **Settings → Pages**, y en *Build and deployment* elige
   **Deploy from a branch**, rama `main`, carpeta `/ (root)`.
4. En uno o dos minutos el sitio estará en `https://axiaguilera.github.io`.

## Qué completar en `index.html`

- **Enlaces de perfiles:** ya están puestos (Google Scholar, ResearchGate, ORCID, GitHub
  y LinkedIn). Para cambiar alguno, búscalo en la lista `class="links"` al inicio de `index.html`.
- **Foto de perfil:** para cambiarla, reemplaza `assets/img/portrait.jpg` (vertical 4:5, unos 900 px de ancho).
- **Álbumes de viajes:** cada viaje es un álbum. Se ve una foto de portada con un
  contador ("4 photos") y, al hacer clic, se abre un visor para recorrer todas las fotos
  (flechas, teclado o deslizando en el celular).
  1. Crea una carpeta por viaje, por ejemplo `assets/img/travel/mi-viaje/`, con las fotos
     `01.jpg`, `02.jpg`, ... (JPG de unos 1600 px en el lado largo y menos de 500 KB) y una
     `cover.jpg` horizontal 4:3 de unos 900 px de ancho para la portada.
  2. Copia cualquier bloque de álbum de la sección *Outside research* y cambia la carpeta,
     el lugar y año, y las líneas `<li><a ...>`, una por foto.
  3. El contador de fotos se calcula solo.
- **Imágenes reales de TLE:** si quieres, agrega figuras de tu artículo de *Sensors* donde
  indica el comentario en la sección de investigación.
- **CV:** para actualizarlo, reemplaza `assets/Axi_Aguilera_CV.pdf` con el mismo nombre.

## Probarlo en tu computadora

Abre `index.html` en el navegador, o desde esta carpeta ejecuta
`python3 -m http.server` y visita `http://localhost:8000`.
