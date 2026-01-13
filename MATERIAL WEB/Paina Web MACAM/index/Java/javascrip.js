document.addEventListener("DOMContentLoaded", function () {
  console.log("El script de búsqueda se ha cargado correctamente.");

  const searchInput = document.getElementById("search");
  const searchForm = document.querySelector(".search-container");

  if (!searchInput || !searchForm) {
      console.error("❌ Error: No se encontraron los elementos del buscador.");
      return;
  }

  console.log("✔ Elementos encontrados correctamente.");

  // Diccionario de búsqueda con secciones reales
  const elementos = {
      "inicio": "Inicio",
      "macam": "Macam",
      "objetivos": "Objetivos",
      "testimonios": "testimonios",
      "pecetario": "Recetario",
      "documental":"Documental",
      "productora": "Productora",
      "noticias": "Noticias",
      "recetario": "Recetario",
      "integrantes": "Integrantes",
      "contacto": "Contactos",
      "recetas" : "Recetas", 
      "produccion" : "Produccion",
      "Spot":"Spot"
  };

  searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      let query = searchInput.value.toLowerCase().trim();

      if (query === "") return;

      console.log("🔍 Búsqueda realizada:", query);

      // Buscar coincidencia exacta
      if (elementos[query]) {
          let sectionId = elementos[query];
          let destino = document.getElementById(sectionId);

          if (destino) {
              console.log("✅ Se encontró la sección:", sectionId);
              destino.scrollIntoView({ behavior: "smooth", block: "start" }); // Desplazamiento suave
              resaltarTexto(query);
          } else {
              console.warn("⚠ No se encontró el elemento con ID:", sectionId);
              alert("No se encontró la sección en la página.");
          }
      } else {
          // Mostrar sugerencias si no hay coincidencia exacta
          let sugerencias = Object.keys(elementos).filter(key => key.includes(query));
          if (sugerencias.length > 0) {
              alert("¿Quisiste decir?: " + sugerencias.join(", "));
          } else {
              alert("No se encontraron resultados para: " + query);
          }
      }
  });

  function resaltarTexto(texto) {
      document.querySelectorAll(".resaltado").forEach(el => {
          el.classList.remove("resaltado");
      });

      document.querySelectorAll("h1, h2, h3, p, span").forEach(el => {
          if (el.textContent.toLowerCase().includes(texto)) {
              el.classList.add("resaltado");
          }
      });
  }
});



/* Carrusel con imágenes y videos */

let index = 2;
const elements = document.querySelectorAll(".carousel img, .carousel video");

function updateCarousel() {
  const total = elements.length;
  const prevIndex = (index - 1 + total) % total;
  const nextIndex = (index + 1) % total;

  elements.forEach((el, i) => {
    el.className = ""; // Limpia todas las clases

    if (i !== index && i !== prevIndex && i !== nextIndex) {
      el.classList.add("hidden");
      if (el.tagName === "VIDEO") el.pause();
    }
  });

  const current = elements[index];
  const prev = elements[prevIndex];
  const next = elements[nextIndex];

  current.classList.add("active");
  if (current.tagName === "VIDEO") current.play();

  prev.classList.add("prev");
  if (prev.tagName === "VIDEO") prev.pause();

  next.classList.add("next");
  if (next.tagName === "VIDEO") next.pause();
}

function nextSlide() {
  index = (index + 1) % elements.length;
  updateCarousel();
}

function prevSlide() {
  index = (index - 1 + elements.length) % elements.length;
  updateCarousel();
}

// Inicializa el carrusel al cargar
document.addEventListener("DOMContentLoaded", function () {
  updateCarousel();

  // Manejo del formulario del recetario
  const form = document.querySelector("#recetario-form");

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      form.reset();

      const mensajeExito = document.createElement("p");
      mensajeExito.textContent = "¡Tus respuestas han sido enviadas con éxito!";
      mensajeExito.style.color = "#E0A960";
      mensajeExito.style.fontWeight = "bold";
      mensajeExito.style.marginTop = "15px";
      form.appendChild(mensajeExito);

      setTimeout(() => mensajeExito.remove(), 3000);
    });
  }
});



document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".Navbar nav");

  if (!menuToggle || !menu) {
      console.error("⚠ Error: No se encontraron los elementos del menú.");
      return;
  }

  menuToggle.addEventListener("click", function () {
      menu.classList.toggle("active"); // Muestra u oculta el menú
      menuToggle.classList.toggle("active"); // Anima el botón hamburguesa
  });

  // Cerrar el menú si se hace clic fuera de él
  document.addEventListener("click", function (event) {
      if (!menu.contains(event.target) && !menuToggle.contains(event.target)) {
          menu.classList.remove("active");
          menuToggle.classList.remove("active");
      }
  });
});



  function reveal() {
    const reveals = document.querySelectorAll(".reveal");
    for (const el of reveals) {
      const windowHeight = window.innerHeight;
      const elementTop = el.getBoundingClientRect().top;
      const revealPoint = 150;

      if (elementTop < windowHeight - revealPoint) {
        el.classList.add("active");
      }
    }
  }

  window.addEventListener("scroll", reveal);
  window.addEventListener("load", reveal); // Para que actúe si ya está en pantalla




  const testimoniosSection = document.querySelector('.carrusel-testimonios');

  const slides = testimoniosSection.querySelectorAll('.testimonios-slide');
  const puntos = testimoniosSection.querySelectorAll('.testimonios-punto');
  const btnIzq = testimoniosSection.querySelector('.testimonios-flecha.testimonios-izquierda');
  const btnDer = testimoniosSection.querySelector('.testimonios-flecha.testimonios-derecha');

  let indice = 0;

  function mostrarSlide(i) {
    slides.forEach(slide => slide.classList.remove('activo'));
    puntos.forEach(punto => punto.classList.remove('activo'));
    slides[i].classList.add('activo');
    puntos[i].classList.add('activo');
  }

  btnIzq.addEventListener('click', () => {
    indice = (indice - 1 + slides.length) % slides.length;
    mostrarSlide(indice);
  });

  btnDer.addEventListener('click', () => {
    indice = (indice + 1) % slides.length;
    mostrarSlide(indice);
  });

  puntos.forEach((punto, i) => {
    punto.addEventListener('click', () => {
      indice = i;
      mostrarSlide(i);
    });
  });


