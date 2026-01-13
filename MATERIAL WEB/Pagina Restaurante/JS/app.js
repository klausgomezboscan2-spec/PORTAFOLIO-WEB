// app.js - logic for client (menu, cart, events, contact)
// VARIABLES GLOBALES
let cart = [];
let customEventProposal = null;
let isEmployeeMode = false;
const EMPLOYEE_PASSWORD = "admin123";
window.adminListenersActive = false;

// Menu inicial (agrupado por categorias)
const menuItems = [
    { id: 1, name: "Ceviche Tradicional", price: 12.80, description: "Pescado marinado en limón y ají limo.", category: "Entradas", image: "https://placehold.co/400x250/111111/C9A66B?text=Ceviche" },
    { id: 2, name: "Anticuchos", price: 9.60, description: "Brochetas de corazón con salsa especial.", category: "Entradas", image: "https://placehold.co/400x250/111111/C9A66B?text=Anticuchos" },
    { id: 3, name: "Lomo Saltado Clasico", price: 14.80, description: "Lomo fino con vegetales, papas fritas y arroz.", category: "Plato fuerte", image: "https://placehold.co/400x250/111111/C9A66B?text=Lomo+Saltado" },
    { id: 4, name: "Ají de Gallina", price: 13.60, description: "Clásico peruano cremoso con arroz.", category: "Plato fuerte", image: "https://placehold.co/400x250/111111/C9A66B?text=Ají+de+Gallina" },
    { id: 5, name: "Pisco Sour", price: 6.40, description: "Cocktail emblemático peruano.", category: "Bebidas", image: "https://placehold.co/400x250/111111/C9A66B?text=Pisco+Sour" },
    { id: 6, name: "Chicha Morada", price: 2.40, description: "Bebida tradicional de maíz morado.", category: "Bebidas", image: "https://placehold.co/400x250/111111/C9A66B?text=Chicha" },
    { id: 7, name: "Suspiro a la Limeña", price: 5.60, description: "Postre tradicional dulce y cremoso.", category: "Postre", image: "https://placehold.co/400x250/111111/C9A66B?text=Suspiro" },
    { id: 8, name: "Alfajor", price: 1.60, description: "Dulce relleno, ideal para acompañar café.", category: "Postre", image: "https://placehold.co/400x250/111111/C9A66B?text=Alfajor" },
    { id: 9, name: "Porción Extra de Papas", price: 3.20, description: "Adición porción extra de papas fritas.", category: "Adiciones", image: "https://placehold.co/400x250/111111/C9A66B?text=Papas" },
    { id: 10, name: "Servicio de Mesero Extra", price: 8.00, description: "Adición por mesero extra (por hora)", category: "Adiciones", image: "https://placehold.co/400x250/111111/C9A66B?text=Mesero" },
];

// INTERFAZ DUAL
function setInterfaceMode(mode){
    isEmployeeMode = mode === 'employee';
    const userContainer = document.getElementById('user-mode-container');
    const employeeContainer = document.getElementById('employee-mode-container');
    const userNav = document.getElementById('user-nav');
    const employeeNav = document.getElementById('employee-nav');

    if(isEmployeeMode){
        userContainer.classList.add('hidden');
        userNav.classList.add('hidden');
        employeeContainer.classList.remove('hidden');
        employeeNav.classList.remove('hidden');
        showEmployeeSection('orders');
        if(window.checkAndStartAdminListeners) window.checkAndStartAdminListeners();
    } else {
        userContainer.classList.remove('hidden');
        userNav.classList.remove('hidden');
        employeeContainer.classList.add('hidden');
        employeeNav.classList.add('hidden');
        showUserSection('home');
    }
}

// LOGIN / LOGOUT ADMIN
function showEmployeeLogin(){
    document.getElementById('employee-login-modal').classList.remove('hidden');
    document.getElementById('employee-login-modal').classList.add('flex');
}
function loginEmployee(){
    const password = document.getElementById('employee-password').value;
    if(password === EMPLOYEE_PASSWORD){
        document.getElementById('employee-login-modal').classList.add('hidden');
        document.getElementById('employee-password').value = '';
        setInterfaceMode('employee');
        showModal('Bienvenido!', 'Has ingresado al panel de gestion.');
    } else {
        showModal('Error de Acceso', 'Contrasena incorrecta. Intentalo de nuevo.');
    }
}
function logoutEmployee(){
    // Cerrar listeners
    if (window.ordersUnsubscribe) window.ordersUnsubscribe();
    if (window.eventsUnsubscribe) window.eventsUnsubscribe();
    window.adminListenersActive = false;
    
    setInterfaceMode('user');
    showModal('Sesion Cerrada', 'Has salido del panel de empleados.', false, 2000);
}

// SECCIONES
function showUserSection(sectionId){
    document.querySelectorAll('.user-section-content').forEach(s=>s.classList.add('hidden'));
    const el = document.getElementById(`${sectionId}-section`);
    if(el) el.classList.remove('hidden');
    window.scrollTo({top:0, behavior:'smooth'});
}
function showEmployeeSection(sectionId){
    document.querySelectorAll('.employee-section-content').forEach(s=>s.classList.add('hidden'));
    const el = document.getElementById(`admin-${sectionId}-section`);
    if(el) el.classList.remove('hidden');
}

// MODALES
function showModal(title, content, isLoading = false, autoCloseDelay = 0){
    document.getElementById('modal-title').textContent = title;
    
    if(isLoading) {
        document.getElementById('modal-content').innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
                <div class="loading-spinner"></div>
                <p class="loading-text" style="color: var(--text-soft);">${content}</p>
            </div>
        `;
    } else {
        document.getElementById('modal-content').textContent = content;
    }
    
    const m = document.getElementById('message-modal');
    m.classList.remove('hidden');
    m.classList.add('flex');
    
    // Auto-cerrar después del delay si se especifica
    if (autoCloseDelay > 0) {
        setTimeout(() => {
            m.classList.add('hidden');
            m.classList.remove('flex');
        }, autoCloseDelay);
    }
}

function closeModal(){
    const messageModal = document.getElementById('message-modal');
    const loginModal = document.getElementById('employee-login-modal');
    if(messageModal) messageModal.classList.add('hidden');
    if(loginModal) loginModal.classList.add('hidden');
}

// MENU & CARRITO
function renderMenu(){
    const container = document.getElementById('menu-grid');
    if(!container) return;

    // Agrupar items por categoría en orden deseado
    const categories = ['Entradas','Plato fuerte','Bebidas','Postre','Adiciones'];
    const grouped = {};
    categories.forEach(c => grouped[c] = []);
    menuItems.forEach(item => {
        const cat = item.category || 'Adiciones';
        // Normalizar nombres simples
        const normalized = (cat.toLowerCase().includes('entrada')) ? 'Entradas'
                           : (cat.toLowerCase().includes('plato')) ? 'Plato fuerte'
                           : (cat.toLowerCase().includes('bebida')) ? 'Bebidas'
                           : (cat.toLowerCase().includes('postre')) ? 'Postre'
                           : 'Adiciones';
        if(!grouped[normalized]) grouped[normalized] = [];
        grouped[normalized].push(item);
    });

    // Construir HTML: sección por categoría
    let html = '';
    categories.forEach(cat => {
        const items = grouped[cat] || [];
        html += `<section id="section-${cat.replace(/\s+/g,'-').toLowerCase()}" class="menu-category-section mb-12">
            <h3 class="header-font text-3xl font-bold accent-text mb-6">${cat}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`;
        if(items.length===0){
            html += `<p class="text-muted">No hay elementos en esta categoría.</p>`;
        } else {
            items.forEach(item=>{
                html += `
                <div class="page-card flex flex-col p-4 rounded-xl shadow-lg border border-transparent">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-36 object-cover rounded-lg mb-3">
                    <h4 class="text-xl header-font font-semibold mb-1">${item.name}</h4>
                    <p class="text-sm lead-text mb-3 flex-grow">${item.description}</p>
                    <div class="flex justify-between items-center mt-auto">
                        <span class="text-lg font-bold gold-text">$${item.price.toFixed(2)}</span>
                        <button onclick="addToCart(${item.id})" class="btn-gold">Añadir</button>
                    </div>
                </div>`;
            });
        }
        html += `</div></section>`;
    });

    container.innerHTML = html;

    // Añadir comportamiento de highlight en la nav según scroll
    setupMenuAnchorHighlight();
}

function addToCart(itemId){
    const item = menuItems.find(i=>i.id===itemId);
    if(!item) return;
    
    const cartItem = cart.find(i=>i.id===itemId);
    if(cartItem) cartItem.quantity++;
    else cart.push({...item, quantity:1});
    
    updateCartDisplay();
    
    // Animación sutil del botón del carrito
    const cartButton = document.getElementById('cart-button');
    if(cartButton) { 
        cartButton.classList.add('cart-pulse');
        setTimeout(() => {
            cartButton.classList.remove('cart-pulse');
        }, 400);
    }
    
    // Mostrar notificación sutil (sin modal, solo toast visual)
    showToast(`✓ ${item.name} agregado`);
}

// Toast sutil para feedback visual
function showToast(message) {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 24px;
        background: var(--accent-gold);
        color: #0F0F0F;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.9rem;
        box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
        animation: slideInToast 0.3s ease-out;
        z-index: 45;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutToast 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

function updateCartDisplay(){
    const cartDrawer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    if(!cartDrawer || !cartCount || !cartTotal) return;
    let total = 0, count = 0;
    if(cart.length===0){
        cartDrawer.innerHTML = '<p style="color: var(--text-soft);" class="text-center mt-8">El carrito esta vacio.</p>';
        cartCount.textContent = '0';
        cartCount.style.display = 'none';
    } else {
        cartDrawer.innerHTML = cart.map(item=>{
            total += item.price*item.quantity;
            count += item.quantity;
            return `<div class="cart-item" style="display: flex; align-items: center; justify-between; padding: 12px; background: #242424; border-radius: 8px; border: 1px solid var(--accent-gold); transition: all 0.3s ease; animation: slideInCart 0.3s ease-out;">
                <div style="flex: 1;"><p style="font-weight: 600; color: var(--text-light); margin: 0; word-break: break-word;">${item.name}</p><p style="font-size: 0.85rem; color: var(--text-soft); margin: 4px 0 0 0;">$${item.price.toFixed(2)} x ${item.quantity}</p></div>
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <button onclick="updateQuantity(${item.id}, -1)" style="background: var(--accent-wine); color: white; border: none; width: 28px; height: 28px; border-radius: 4px; cursor: pointer; transition: all 0.2s; font-weight: bold;" onmouseover="this.style.background='#ff4455'" onmouseout="this.style.background='var(--accent-wine)'">−</button>
                    <span style="font-weight: bold; color: var(--accent-gold); min-width: 20px; text-align: center;">${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)" style="background: var(--accent-cyan); color: #0F0F0F; border: none; width: 28px; height: 28px; border-radius: 4px; cursor: pointer; transition: all 0.2s; font-weight: bold;" onmouseover="this.style.background='#00ffff'" onmouseout="this.style.background='var(--accent-cyan)'">+</button>
                    <button onclick="removeItem(${item.id})" style="background: var(--accent-wine); color: white; border: none; width: 28px; height: 28px; border-radius: 4px; cursor: pointer; transition: all 0.2s; font-weight: bold; font-size: 14px;" onmouseover="this.style.background='#ff4455'" onmouseout="this.style.background='var(--accent-wine)'" title="Eliminar">✕</button>
                </div>
            </div>`;
        }).join('');
        cartCount.textContent = count;
        cartCount.style.display = 'flex';
        cartCount.style.animation = 'cartCountPulse 0.4s ease-out';
    }
    cartTotal.textContent = `$${total.toFixed(2)}`;
    updateContactSummary();
}

function updateQuantity(itemId, change){
    const cartItem = cart.find(i=>i.id===itemId);
    if(!cartItem) return;
    cartItem.quantity += change;
    if(cartItem.quantity<=0) {
        cart = cart.filter(i=>i.id!==itemId);
        showToast('✓ Producto removido');
    }
    updateCartDisplay();
}

function removeItem(itemId){
    cart = cart.filter(i=>i.id!==itemId);
    updateCartDisplay();
    showToast('✓ Producto removido');
}

function toggleCart(){
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if(drawer) {
        drawer.classList.toggle('open');
    }
    if(overlay) {
        if(overlay.style.opacity === '0' || overlay.style.opacity === '') {
            overlay.style.opacity = '1';
            overlay.style.pointerEvents = 'auto';
        } else {
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
        }
    }
}

// CHECKOUT (uses firebase functions exported globally)
async function checkout(){
    // Validaciones iniciales
    if(cart.length===0){ 
        showModal('Carrito Vacío','Agrega items antes de finalizar el pedido.', false, 3000); 
        return; 
    }
    
    // Mostrar loading
    showModal('Procesando...', 'Guardando tu pedido. Por favor espera...', true);
    
    try{
        const deliveryType = document.getElementById('delivery-type').value;
        // Datos del cliente desde el formulario del carrito
        const customerName = (document.getElementById('order-customer-name')?.value || '').trim();
        const tableNumber = (document.getElementById('order-table-number')?.value || '').trim();
        const address = (document.getElementById('order-address')?.value || '').trim();

        if(!customerName){
            showModal('Campo Requerido','Por favor ingresa el nombre del cliente antes de finalizar el pedido.', false, 3000);
            return;
        }
        const orderData = {
            userId: window.getCurrentUserId ? window.getCurrentUserId() : 'anonymous',
            timestamp: new Date().toISOString(),
            type: deliveryType,
            status: 'Pendiente de Contacto',
            customerName,
            tableNumber: deliveryType === 'Mesa' ? tableNumber : undefined,
            address: deliveryType === 'Delivery' ? address : undefined,
            items: cart.map(i=>({name:i.name, price:i.price, quantity:i.quantity})),
            total: parseFloat(cart.reduce((acc,i)=>acc+i.price*i.quantity,0).toFixed(2))
        };
        
        const appId = window.getAppId ? window.getAppId() : 'default';
        const ordersCollectionPath = `artifacts/${appId}/public/data/orders`;
        
        // Intentar guardar en Firebase/LocalStorage
        const collectionRef = window.collection(window.db, ordersCollectionPath);
        const docRef = await window.addDoc(collectionRef, orderData);
        
        // Limpiar carrito
        toggleCart();
        cart = [];
        updateCartDisplay();
        
        // Mostrar éxito con auto-cierre
        showModal('✓ Pedido Guardado', `Tu pedido (${deliveryType}) ha sido registrado. Nos contactaremos pronto.`, false, 3000);
        
        // Ir a contacto después de 3 segundos
        setTimeout(() => {
            showUserSection('contact');
        }, 3000);
        
    } catch(e){
        console.error('Error en checkout:', e);
        showModal('⚠ Error', 'Hubo un problema al guardar tu pedido. Por favor intenta de nuevo: ' + (e.message || e), false, 4000);
    }
}

// EVENTS
// Currency / conversion settings
const CURRENCY = 'COP';
const USD_TO_COP = 3800; // Ajusta según tasa real si es necesario

function formatCOP(amount){
    try{
        return amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
    }catch(e){
        return 'COP ' + Math.round(amount).toString();
    }
}

function calculateEventEstimate(){
    const guestsInput = document.getElementById('event-guests');
    const eventTypeSelect = document.getElementById('event-type');
    const costTotalEl = document.getElementById('cost-total');
    if(!guestsInput || !costTotalEl) return;

    let guests = parseInt(guestsInput.value) || 0;
    if(guests<10 && guests!==0) guestsInput.value = 10;
    guests = parseInt(guestsInput.value) || 0;

    // Base price per person in USD
    let baseUsd = 45;
    const eventType = eventTypeSelect?.value || '';
    if(eventType.includes('Matrimonio')) baseUsd += 50;

    // Menu extra per person (COP)
    const menuSelect = document.getElementById('event-menu');
    const menuExtraCop = parseFloat(menuSelect?.selectedOptions[0]?.dataset.extraCop || 0) || 0;

    // Drinks extra per person (COP)
    const drinksSelect = document.getElementById('event-drinks');
    const drinksExtraCop = parseFloat(drinksSelect?.selectedOptions[0]?.dataset.extraCop || 0) || 0;

    // Per-person and fixed service additions in COP
    const waiters = parseInt(document.getElementById('service-waiters')?.value || 0);
    const waiterCostPerWaiterCop = 80000; // reduced fixed COP per waiter (was 120000)

    // Fixed fees in COP
    const djChecked = document.getElementById('service-dj')?.checked;
    const photographerChecked = document.getElementById('service-photographer')?.checked;
    const djFeeCop = djChecked ? 532000 : 0; // reduced 30% (was 760,000 COP)
    const photographerFeeCop = photographerChecked ? 665000 : 0; // reduced 30% (was 950,000 COP)

    // Decoration fixed fee (COP)
    const decorSelect = document.getElementById('event-decor');
    const decorFixedCop = parseFloat(decorSelect?.selectedOptions[0]?.dataset.fixedCop || 0) || 0;

    // Total calculation in COP
    const baseCop = baseUsd * USD_TO_COP;
    const perPersonCop = baseCop + menuExtraCop + drinksExtraCop;
    const fixedFeesCop = djFeeCop + photographerFeeCop + decorFixedCop + (waiters * waiterCostPerWaiterCop);

    const totalCost = (perPersonCop * guests) + fixedFeesCop;
    costTotalEl.textContent = formatCOP(totalCost || 0);
}

async function requestPredefinedPackage(name, pricePerPerson, guests = 50){
    if(!window.db || !window.addDoc || !window.collection) { showModal('Cargando...','La app aun inicializa. Aguarde...'); return; }
    const numGuests = parseInt(guests) || 50;
    // pricePerPerson passed as USD -- convert to COP
    const costPerPersonCop = Math.round((pricePerPerson || 0) * USD_TO_COP);
    customEventProposal = {
        userId: window.getCurrentUserId ? window.getCurrentUserId() : 'anonymous',
        timestamp: new Date().toISOString(),
        status: 'Propuesta Predestinada - Pendiente de Confirmacion',
        type: `Paquete Predestinado: ${name}`,
        guests: numGuests,
        costPerPersonUSD: pricePerPerson,
        costPerPerson: costPerPersonCop,
        totalCost: costPerPersonCop * numGuests,
        details: `Solicitud del Paquete ${name}. Precio base: USD ${pricePerPerson} por persona. Invitados: ${numGuests}`
    };
    await saveEventProposal(customEventProposal);
}

async function prepareAndSendEventDetails(){
    if(!window.db || !window.addDoc || !window.collection) { showModal('Cargando...','La app aun inicializa. Aguarde...'); return; }
    const type = document.getElementById('event-type').value;
    const guests = parseInt(document.getElementById('event-guests').value);
    if(guests < 10){ showModal('Error de Invitados','El numero minimo de invitados es 10.'); return; }

    // El elemento `cost-total` muestra una cadena formateada en COP (ej. "COP $1.140.000").
    // Extraemos solo los dígitos para obtener el valor numérico en COP.
    const costText = (document.getElementById('cost-total')?.textContent || '0');
    const totalCost = parseInt(costText.replace(/[^0-9]/g, '')) || 0;

    customEventProposal = {
        userId: window.getCurrentUserId ? window.getCurrentUserId() : 'anonymous',
        timestamp: new Date().toISOString(),
        status: 'Propuesta Personalizada - Pendiente de Cotizar',
        type,
        guests,
        menu: document.getElementById('event-menu')?.selectedOptions[0]?.textContent || 'Menu Standar',
        decor: document.getElementById('event-decor')?.selectedOptions[0]?.textContent || 'Decoracion Standar',
        totalCost,
        details: `Evento personalizado de ${type} con ${guests} invitados. Costo Estimado Total: ${formatCOP(totalCost)}.`
    };
    await saveEventProposal(customEventProposal);
}

async function saveEventProposal(data){
    try{
        if(!window.collection || !window.addDoc) { 
            showModal('Error','Sistema no disponible. Intenta más tarde.', false, 3000); 
            return; 
        }
        
        showModal('Procesando...', 'Guardando tu propuesta de evento. Por favor espera...', true);
        
        const appId = window.getAppId ? window.getAppId() : 'default';
        const eventsCollectionPath = `artifacts/${appId}/public/data/event_proposals`;
        const collectionRef = window.collection(window.db, eventsCollectionPath);
        const docRef = await window.addDoc(collectionRef, data);
        
        showModal('✓ Propuesta Guardada', `Tu propuesta de evento ha sido registrada. Te contactaremos pronto con una cotización.`, false, 3000);
        
        setTimeout(() => {
            showUserSection('contact');
            updateContactSummary();
        }, 3000);
    } catch(e){
        console.error('Error en saveEventProposal:', e);
        showModal('⚠ Error','Hubo un error al guardar la propuesta: ' + (e.message || e), false, 3000);
    }
}

// CONTACTO
function updateContactSummary(){
    const orderSummaryEl = document.getElementById('order-summary-display');
    const eventSummaryEl = document.getElementById('event-summary-display');
    if(orderSummaryEl){
        if(cart.length>0){
            let total = cart.reduce((acc,i)=>acc + i.price*i.quantity,0);
            orderSummaryEl.innerHTML = `🛒 <strong>Resumen de Pedido:</strong> ${cart.length} items, Total estimado: <span class="gold-text">$${total.toFixed(2)}</span>.`;
        } else {
            orderSummaryEl.innerHTML = '🛒 Resumen de Pedido: No hay items en el carrito.';
        }
    }
    if(eventSummaryEl){
        if(customEventProposal){
            const total = customEventProposal.totalCost || 0;
            eventSummaryEl.innerHTML = `📅 <strong>Resumen de Evento:</strong> ${customEventProposal.type} - ${customEventProposal.guests || 'N/A'} invitados. Estimado: <span class="gold-text">${formatCOP(total)}</span>.`;
        } else {
            eventSummaryEl.innerHTML = '📅 Resumen de Evento: No hay propuesta de evento pendiente.';
        }
    }
}

// Mobile menu helpers
function toggleMobileMenu(){
    const mobileNav = document.getElementById('mobile-nav');
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    if(!mobileNav || !toggleBtn) return;
    const isOpen = mobileNav.classList.contains('open');
    if(isOpen){
        mobileNav.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded','false');
    } else {
        mobileNav.classList.add('open');
        toggleBtn.setAttribute('aria-expanded','true');
    }
}

function closeMobileMenu(){
    const mobileNav = document.getElementById('mobile-nav');
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    if(!mobileNav || !toggleBtn) return;
    mobileNav.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded','false');
}

function initMobileMenu(){
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    if(!toggleBtn) return;
    
    toggleBtn.addEventListener('click', (e)=>{
        e.preventDefault();
        toggleMobileMenu();
    });
    
    if(mobileNav){
        // close when a link inside mobile menu is clicked
        mobileNav.addEventListener('click', (e)=>{
            if(e.target && e.target.classList && e.target.classList.contains('mobile-nav-link')){
                closeMobileMenu();
            }
        });
    }
    
    // Close mobile menu on resize to larger screens
    window.addEventListener('resize', ()=>{
        if(window.innerWidth >= 768) closeMobileMenu();
    });
    
    // Close menu when Escape key is pressed
    document.addEventListener('keydown', (e)=>{
        if(e.key === 'Escape' && mobileNav && mobileNav.classList.contains('open')){
            closeMobileMenu();
            toggleBtn.focus();
        }
    });
    
    // Close menu on scroll (if user scrolls main content while menu is open)
    window.addEventListener('scroll', ()=>{
        if(mobileNav && mobileNav.classList.contains('open')){
            closeMobileMenu();
        }
    }, { passive: true });
}

// INIT
document.addEventListener('DOMContentLoaded', ()=>{
    renderMenu();
    updateCartDisplay();
    calculateEventEstimate();
    updateContactSummary();
    setInterfaceMode('user');
    // initialize mobile menu wiring
    try{ initMobileMenu(); }catch(e){}
    
    const contactForm = document.getElementById('contact-form');
    if(contactForm){
        contactForm.addEventListener('submit', async (e)=>{
            e.preventDefault();
            
            const name = document.getElementById('contact-name').value.trim();
            const message = document.getElementById('contact-message').value.trim();
            
            if(!name) {
                showModal('Campo Vacío', 'Por favor ingresa tu nombre.', false, 3000);
                return;
            }
            
            showModal('Procesando...', 'Enviando tu información. Por favor espera...', true);
            
            const contactData = {
                name: name,
                message: message || 'Sin detalles adicionales',
                timestamp: new Date().toISOString(),
                userId: window.getCurrentUserId ? window.getCurrentUserId() : 'anonymous'
            };
            
            try{
                if(!window.collection || !window.addDoc) {
                    showModal('⚠ Error', 'Sistema no disponible. Intenta más tarde.', false, 3000);
                    return;
                }
                
                const appId = window.getAppId ? window.getAppId() : 'default';
                const contactsCollectionPath = `artifacts/${appId}/public/data/contacts`;
                const collectionRef = window.collection(window.db, contactsCollectionPath);
                await window.addDoc(collectionRef, contactData);
                
                showModal('✓ Solicitud Enviada', 'Gracias! Tu información ha sido registrada. Nos contactaremos pronto.', false, 3000);
                
                setTimeout(() => {
                    contactForm.reset();
                }, 3000);
            } catch(e){
                console.error('Error en contactForm submit:', e);
                showModal('⚠ Error', 'Hubo un error al enviar: ' + (e.message || e), false, 3000);
            }
        });
    }
});

// --- Menu anchor highlight logic ---
function setupMenuAnchorHighlight(){
    const links = Array.from(document.querySelectorAll('.menu-nav-link'));
    const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

    function onScroll(){
        const scrollY = window.scrollY + 120; // offset to consider sticky nav
        let activeIndex = -1;
        for(let i=0;i<sections.length;i++){
            const s = sections[i];
            if(!s) continue;
            const top = s.getBoundingClientRect().top + window.scrollY;
            if(scrollY >= top) activeIndex = i;
        }
        links.forEach((lnk, idx)=>{
            if(idx === activeIndex) lnk.classList.add('active-menu-link');
            else lnk.classList.remove('active-menu-link');
        });
    }

    window.removeEventListener('scroll', onScroll);
    window.addEventListener('scroll', onScroll);
    onScroll();
}

// Mostrar/ocultar campos de mesa/domicilio según el tipo seleccionado en el carrito
document.addEventListener('DOMContentLoaded', ()=>{
    const deliverySelect = document.getElementById('delivery-type');
    function toggleDeliveryFields(){
        const val = deliverySelect?.value || 'Mesa';
        const tableGroup = document.getElementById('order-table-number-group');
        const addressGroup = document.getElementById('order-address-group');
        if(!tableGroup || !addressGroup) return;
        if(val === 'Mesa'){
            tableGroup.style.display = 'block';
            addressGroup.style.display = 'none';
        } else {
            tableGroup.style.display = 'none';
            addressGroup.style.display = 'block';
        }
    }
    if(deliverySelect){
        deliverySelect.addEventListener('change', toggleDeliveryFields);
        toggleDeliveryFields();
    }
});

// On load, convert package price labels from USD to COP for display
function updatePackagePriceDisplays(){
    document.querySelectorAll('.price-text[data-usd]').forEach(el=>{
        const usd = parseFloat(el.dataset.usd || 0) || 0;
        const cop = Math.round(usd * USD_TO_COP);
        el.textContent = `${formatCOP(cop)} por persona`;
    });
}

function attachMenuNavHandlers(){
    const links = Array.from(document.querySelectorAll('.menu-nav-link'));
    links.forEach(a=>{
        a.addEventListener('click', (e)=>{
            e.preventDefault();
            const href = a.getAttribute('href') || '';
            if(!href.startsWith('#')) return;
            const id = href.slice(1);
            const target = document.getElementById(id);
            if(target){
                target.scrollIntoView({behavior:'smooth', block:'start'});
                return;
            }
            // Si la sección aún no fue renderizada, forzamos render y luego scrolleamos
            if(window.renderMenu) {
                try{ window.renderMenu(); }catch(e){}
            }
            setTimeout(()=>{ document.getElementById(id)?.scrollIntoView({behavior:'smooth', block:'start'}); }, 80);
        });
    });
}

document.addEventListener('DOMContentLoaded', ()=>{
    updatePackagePriceDisplays();
    attachMenuNavHandlers();
});
