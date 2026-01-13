/* Carrusel modal para la galería de fotografía
   - carga una lista fija de imágenes desde la carpeta `Imagenes/Fotos Ice Swan/`
   - abre/cierra modal, navega con prev/next, indicadores y teclado
*/
(function(){
  const basePath = 'Imagenes/Fotos Ice Swan/';
  const files = [
    'IMG_9334.JPG','IMG_9335.JPG','IMG_9340.JPG','IMG_9345.JPG','IMG_9350.JPG',
    'IMG_9368.JPG','IMG_9373.JPG','IMG_9379.JPG','IMG_9385.JPG','IMG_9395.JPG',
    'IMG_9406.JPG','IMG_9409.JPG'
  ];
  const images = files.map(f => basePath + f);

  document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('abrir-carrusel');
    const modal = document.getElementById('carrusel-modal');
    const imgEl = document.getElementById('carrusel-img');
    const prevBtn = document.getElementById('carrusel-prev');
    const nextBtn = document.getElementById('carrusel-next');
    const closeBtn = document.getElementById('cerrar-carrusel');
    const indicadores = document.getElementById('carrusel-indicadores');
    let current = 0;

    if(!modal || !imgEl) return;

    function updateImage(){
      imgEl.src = images[current];
      imgEl.alt = `Imagen ${current+1} de ${images.length}`;
      if(indicadores){
        Array.from(indicadores.children).forEach((el, idx) => {
          el.classList.toggle('activo', idx === current);
        });
      }
    }

    function buildIndicators(){
      if(!indicadores) return;
      indicadores.innerHTML = '';
      images.forEach((_, idx) => {
        const btn = document.createElement('button');
        btn.className = 'indicador';
        btn.setAttribute('aria-label', `Ir a imagen ${idx+1}`);
        btn.addEventListener('click', () => {
          current = idx; updateImage();
        });
        indicadores.appendChild(btn);
      });
    }

    function openCarousel(startIndex = 0){
      current = Math.max(0, Math.min(startIndex, images.length-1));
      buildIndicators();
      updateImage();
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      if(closeBtn) closeBtn.focus();
    }

    function closeCarousel(){
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }

    if(openBtn){
      openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openCarousel(0);
      });
    }

    if(prevBtn){
      prevBtn.addEventListener('click', () => {
        current = (current - 1 + images.length) % images.length;
        updateImage();
      });
    }

    if(nextBtn){
      nextBtn.addEventListener('click', () => {
        current = (current + 1) % images.length;
        updateImage();
      });
    }

    if(closeBtn){
      closeBtn.addEventListener('click', closeCarousel);
    }

    modal.addEventListener('click', (e) => {
      if(e.target === modal) closeCarousel();
    });

    document.addEventListener('keydown', (e) => {
      if(modal.style.display !== 'flex') return;
      if(e.key === 'Escape') closeCarousel();
      if(e.key === 'ArrowLeft'){
        current = (current - 1 + images.length) % images.length; updateImage();
      }
      if(e.key === 'ArrowRight'){
        current = (current + 1) % images.length; updateImage();
      }
    });

    const preload = new Image(); preload.src = images[0];
  });
})();
