// Core interaction script
function toggleMenu(){
  const nav = document.getElementById('nav-list');
  const navUl = nav ? nav.querySelector('ul') : null;
  const btn = document.getElementById('menu-toggle');
  if(!navUl || !btn || !nav) return;
  const isActive = navUl.classList.toggle('active');
  btn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
  // Keep semantic state for screen readers
  nav.setAttribute('aria-hidden', isActive ? 'false' : 'true');
  if(isActive){
    // focus first focusable link for keyboard users
    const firstLink = navUl.querySelector('a');
    if(firstLink) firstLink.focus();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Filters
  const botonesFiltro = document.querySelectorAll('.filtro');
  const proyectos = document.querySelectorAll('.proyecto');

  botonesFiltro.forEach(boton => {
    boton.addEventListener('click', () => {
      botonesFiltro.forEach(b => b.classList.remove('activo'));
      boton.classList.add('activo');

      const categoria = boton.getAttribute('data-categoria');

      proyectos.forEach(proyecto => {
        if (categoria === 'todos' || proyecto.classList.contains(categoria)) {
          proyecto.style.display = 'block';
        } else {
          proyecto.style.display = 'none';
        }
      });
    });
  });

  // Mobile nav interactions
  const navUl = document.querySelector('#nav-list ul');
  const btn = document.getElementById('menu-toggle');
  const navLinks = document.querySelectorAll('#nav-list ul li a');

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if(navUl && navUl.classList.contains('active')){
        navUl.classList.remove('active');
        if(btn) btn.setAttribute('aria-expanded','false');
        const nav = document.getElementById('nav-list');
        if(nav) nav.setAttribute('aria-hidden','true');
      }
    });
  });

  // attach click listener to button in case inline onclick is not present
  if(btn){
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleMenu();
    });
  }

  // close menu with Escape key for accessibility
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && navUl && navUl.classList.contains('active')){
      navUl.classList.remove('active');
      if(btn) btn.setAttribute('aria-expanded','false');
      const nav = document.getElementById('nav-list');
      if(nav) nav.setAttribute('aria-hidden','true');
      if(btn) btn.focus();
    }
  });

  // initialize ARIA and body scroll lock state
  const navRoot = document.getElementById('nav-list');
  if(navRoot){
    const startActive = navUl && navUl.classList.contains('active');
    navRoot.setAttribute('aria-hidden', startActive ? 'false' : 'true');
    if(startActive){
      document.body.classList.add('nav-open');
    } else {
      document.body.classList.remove('nav-open');
    }
  }

  // toggle body lock when menu opens/closes by observing class changes
  const observer = new MutationObserver(() => {
    if(navUl && navUl.classList.contains('active')){
      document.body.classList.add('nav-open');
    } else {
      document.body.classList.remove('nav-open');
    }
  });
  if(navUl) observer.observe(navUl, { attributes: true, attributeFilter: ['class'] });

  // Ensure menu closes on resize to desktop
  window.addEventListener('resize', () => {
    if(window.innerWidth > 768 && navUl && navUl.classList.contains('active')){
      navUl.classList.remove('active');
      if(btn) btn.setAttribute('aria-expanded','false');
      const nav = document.getElementById('nav-list');
      if(nav) nav.setAttribute('aria-hidden','true');
      document.body.classList.remove('nav-open');
    }
  });

  // IntersectionObserver for reveal animations
  const revealElements = document.querySelectorAll('section, .proyecto, .hero-texto');
  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach(el => {
    el.classList.add('reveal');
    io.observe(el);
  });
});

