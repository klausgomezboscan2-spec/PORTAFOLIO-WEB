Cambios recientes realizados:

- Navbar: convertida a `navbar-custom` con fondo degradado, logo reducido a width=180 en todas las páginas.
- Hero: eliminado bloque de imágenes iniciales, ajustada altura.
- Carrito: offcanvas añadido con persistencia en localStorage.
- Secciones: `#ropa`, `#manga`, `#joyeria`, `#figuras` añadidas en `index.html` con tarjetas uniformes.
- CSS: unificación de alturas de tarjetas, uso de `object-fit: cover` en imágenes, padding para fixed navbar y `scroll-margin-top` para secciones.
- Correcciones ortográficas y mejoras menores.

Notas:
- Verificar imágenes con espacios en rutas (ej. "figuras-de-accion") al optimizar.

Script para optimizar imágenes:
- Archivo: `scripts/compress_images.js` (usa `sharp`).
- Instrucciones: ejecutar `npm install sharp` y luego `node scripts/compress_images.js`. Haz una copia de seguridad antes de sobrescribir imágenes.
- Cambio seguro: el script ahora escribe las imágenes comprimidas en `imagenes/compressed/` para no sobrescribir los originales. Si prefieres sobrescribir, puedo revertir el comportamiento después de que confirmes.
- Si quieres, puedo eliminar las páginas `index2..5.html` o refactorizar a plantillas.
