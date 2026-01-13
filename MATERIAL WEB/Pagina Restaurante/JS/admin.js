// admin.js - listeners and rendering for employee panel
let ordersUnsubscribe = null;
let eventsUnsubscribe = null;
let adminRetryCount = 0;
const adminMaxRetry = 5; // máximo 5 reintentos
const adminBaseDelay = 2000; // 2s
let adminRetryTimer = null;
let adminRetryInProgress = false;
let lastOrdersSignature = '';

// Calcula una firma robusta para la lista de pedidos
function fnv1aHashHex(str){
    // FNV-1a 32-bit
    let h = 0x811c9dc5 >>> 0;
    for(let i=0;i<str.length;i++){
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 0x01000193) >>> 0;
    }
    return (h >>> 0).toString(16);
}

function computeOrdersSignature(orders){
    try{
        const arr = orders.map(o => {
            const items = (o.items || []).map(it => `${it.name}:${it.quantity}:${it.price}`).sort().join(',');
            return `${o.id}|${o.status||''}|${o.timestamp||''}|${o.total||0}|${items}`;
        }).sort();
        const joined = arr.join('||');
        return fnv1aHashHex(joined);
    }catch(e){
        return '';
    }
}

// Exportar para acceso desde otros scripts
window.ordersUnsubscribe = () => {
    if (ordersUnsubscribe) {
        ordersUnsubscribe();
        ordersUnsubscribe = null;
    }
};

// Fuerza una reconexión: limpia listeners y reinicia el backoff
window.forceAdminReconnect = () => {
    const statusEl = document.getElementById('connection-status');
    if (ordersUnsubscribe) { ordersUnsubscribe(); ordersUnsubscribe = null; }
    if (eventsUnsubscribe) { eventsUnsubscribe(); eventsUnsubscribe = null; }
    window.adminListenersActive = false;
    lastOrdersSignature = '';
    adminRetryCount = 0;
    if (adminRetryTimer) { clearTimeout(adminRetryTimer); adminRetryTimer = null; }
    adminRetryInProgress = false;
    if (statusEl) statusEl.textContent = '🔄 Reconectando...';
    window.checkAndStartAdminListeners();
};

window.eventsUnsubscribe = () => {
    if (eventsUnsubscribe) {
        eventsUnsubscribe();
        eventsUnsubscribe = null;
    }
};

window.checkAndStartAdminListeners = () => {
    const statusEl = document.getElementById('connection-status');
    if (window.adminListenersActive) {
        statusEl.textContent = '🟢 En Linea';
        return;
    }
    if(!window.db || !window.collection || !window.onSnapshot){
        statusEl.textContent = '🟡 Conectando...';
        // Exponential backoff con límite
        if (adminRetryInProgress) return;
        adminRetryInProgress = true;
        const delay = Math.min(adminBaseDelay * Math.pow(2, adminRetryCount), 32000);
        adminRetryTimer = setTimeout(() => {
            adminRetryInProgress = false;
            adminRetryCount++;
            if (adminRetryCount <= adminMaxRetry) {
                window.checkAndStartAdminListeners();
            } else {
                statusEl.textContent = '🔴 No se pudo conectar';
            }
        }, delay);
        return;
    }
    window.startAdminListeners();
};

window.startAdminListeners = () => {
    const statusEl = document.getElementById('connection-status');
    window.adminListenersActive = true;
    statusEl.textContent = '🟢 En Linea';
    // Reset retry counters al conectarse
    adminRetryCount = 0;
    if (adminRetryTimer) { clearTimeout(adminRetryTimer); adminRetryTimer = null; }
    adminRetryInProgress = false;
    
    try {
        const ordersCollectionPath = `artifacts/${window.getAppId()}/public/data/orders`;
        ordersUnsubscribe = window.onSnapshot(
            window.collection(window.db, ordersCollectionPath), 
            (snapshot) => {
                const orders = [];
                snapshot.forEach(doc => {
                    const data = doc.data ? doc.data() : doc;
                    orders.push({id: doc.id, ...data});
                });
                // Evitar re-render si no hubo cambios reales usando hash robusto
                try {
                    const signature = computeOrdersSignature(orders);
                    if (signature && signature === lastOrdersSignature) {
                        // no hubo cambios importantes
                        return;
                    }
                    lastOrdersSignature = signature;
                } catch (e) {
                    // si falla la firma, simplemente renderizamos
                }

                // Defer DOM updates para mejorar fluidez
                if (window.requestAnimationFrame) {
                    window.requestAnimationFrame(() => renderOrders(orders));
                } else {
                    setTimeout(() => renderOrders(orders), 0);
                }
                statusEl.textContent = '🟢 En Linea';
            }, 
            (error) => {
                console.error('Error listening orders', error);
                statusEl.textContent = '🔴 Error Conexion';
                window.adminListenersActive = false;
            }
        );

        const eventsCollectionPath = `artifacts/${window.getAppId()}/public/data/event_proposals`;
        eventsUnsubscribe = window.onSnapshot(
            window.collection(window.db, eventsCollectionPath), 
            (snapshot) => {
                const events = [];
                snapshot.forEach(doc => {
                    const data = doc.data ? doc.data() : doc;
                    events.push({id: doc.id, ...data});
                });
                renderEventQuotes(events);
            }, 
            (error) => {
                console.error('Error listening events', error);
                statusEl.textContent = '🟡 Sin eventos';
            }
        );
    } catch (e) {
        console.error('Error iniciando listeners:', e);
        statusEl.textContent = '🔴 Error';
    }
};

function getStatusColor(status){
    switch(status){
        case 'En Preparacion': return '#E8C547';
        case 'Listo para Despacho': return '#A92A3F';
        case 'Facturado/Cerrado': return '#06FF00';
        default: return '#8B5A00';
    }
}

function renderOrders(orders){
    const list = document.getElementById('orders-list');
    if(!list) return;
    if(orders.length === 0){
        list.innerHTML = '<p class="lg:col-span-3 text-center text-muted">Conexion establecida. No hay pedidos activos actualmente.</p>';
        return;
    }
    list.innerHTML = orders.map((order, idx) => {
        const statusColor = getStatusColor(order.status);
        const itemsList = order.items?.map(item=>`<li class="text-small py-1">• ${item.quantity}x <span class="font-semibold">${item.name}</span></li>`).join('') || '';
        const timestamp = new Date(order.timestamp).toLocaleString('es-AR');
        const canDelete = order.status === 'Facturado/Cerrado';
        const deleteButtonStyle = canDelete ? 'background: linear-gradient(135deg, var(--accent-wine) 0%, #A92A3F 100%) !important; cursor: pointer;' : 'background: #666 !important; cursor: not-allowed; opacity: 0.6;';
        
        // Iconos elegantes por tipo de entrega
        let typeIcon = '🛒';
        if(order.type === 'Mesa') typeIcon = '🍽️';
        else if(order.type === 'Delivery') typeIcon = '🚚';
        else if(order.type === 'Para Llevar') typeIcon = '📦';
        
        // Estilos de botones mejorados
        const statusButtons = [
            { status: 'En Preparacion', icon: '🔥', color: 'linear-gradient(135deg, #E8C547 0%, #D4A547 100%)' },
            { status: 'Listo para Despacho', icon: '✅', color: 'linear-gradient(135deg, #A92A3F 0%, #8B1E3A 100%)' },
            { status: 'Facturado/Cerrado', icon: '🎉', color: 'linear-gradient(135deg, #06FF00 0%, #04CC00 100%)' }
        ];
        
        const buttonsHtml = statusButtons.map(btn => `
            <button onclick="updateOrderStatus('${order.id}', '${btn.status}')" class="w-full btn-primary text-sm py-2 transition-all" style="background: ${btn.color} !important; margin-bottom: 6px;">
                ${btn.icon} ${btn.status}
            </button>
        `).join('');
        
        return `<div class="admin-card p-6 border-l-4" style="border-left-color:${statusColor}; animation-delay: ${idx * 50}ms;">
            <div class="flex justify-between items-start mb-4">
                <div class="flex items-start gap-3 flex-1">
                    <span style="font-size: 2rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">${typeIcon}</span>
                    <div>
                        <span class="text-lg font-bold header-font block">${order.type || 'Pedido'}</span>
                        <span class="text-xs text-muted mt-1">ID: ${order.id.substring(0,8)}...</span>
                    </div>
                </div>
                <span class="text-xs font-bold px-4 py-2 rounded-full" style="background:${statusColor}; color: #F9F9F9; white-space: nowrap; margin-left: 8px;">${order.status}</span>
            </div>
            <p class="text-xs text-muted mb-3">📅 ${timestamp}</p>
            <div class="bg-black bg-opacity-20 rounded-lg p-4 mb-4 border-l-2" style="border-left-color: ${statusColor};">
                <ul class="mb-0 space-y-1">${itemsList}</ul>
                <div class="mt-4 pt-3 border-t border-white border-opacity-20 flex justify-between items-center">
                    <span class="text-sm font-semibold">💰 Total:</span>
                    <span class="text-2xl font-bold" style="color: var(--accent-gold);">$${order.total}</span>
                </div>
            </div>
            <div class="mt-4 space-y-1">
                ${buttonsHtml}
                <button onclick="deleteOrder('${order.id}', '${order.status}')" class="w-full btn-primary text-sm py-2 transition-all" style="${deleteButtonStyle} margin-top: 8px;" ${canDelete ? '' : 'disabled'}>🗑️ Eliminar</button>
            </div>
        </div>`;
    }).join('');
}

function renderEventQuotes(events){
    const list = document.getElementById('event-quotes-list');
    if(!list) return;
    if(events.length===0){ list.innerHTML = '<p class="text-center text-muted py-8">📅 No hay cotizaciones de eventos pendientes.</p>'; return; }
    list.innerHTML = events.map((event, idx)=>`
        <div class="admin-card p-6 border-l-4" style="border-left-color: var(--accent-gold); animation-delay: ${idx * 50}ms;">
            <div class="flex justify-between items-start mb-3">
                <div>
                    <h4 class="text-xl font-bold" style="color: var(--accent-gold);">🎉 ${event.type}</h4>
                    <span class="text-xs text-muted mt-1">ID: ${event.id.substring(0,8)}...</span>
                </div>
                <span class="text-xs font-semibold px-3 py-1 rounded-full" style="background: var(--accent-gold); color: #1A1410;">Pendiente</span>
            </div>
            <div class="bg-black bg-opacity-20 rounded-lg p-3 mb-4 space-y-2">
                <p class="text-sm"><span class="font-semibold">👥 Invitados:</span> ${event.guests || 'N/A'}</p>
                <p class="text-sm"><span class="font-semibold">📝 Detalles:</span> ${event.details || 'Sin detalles'}</p>
                <div class="pt-2 border-t border-white border-opacity-20 flex justify-between items-center">
                    <span class="text-sm">Estimado:</span>
                    <span class="text-lg font-bold" style="color: var(--accent-gold);">$${event.totalCost ? event.totalCost.toFixed(2) : 'N/A'}</span>
                </div>
            </div>
            <div class="mt-4">
                <button onclick="updateEventStatus('${event.id}', 'Cotizacion Aceptada')" class="w-full btn-primary py-2">✓ Marcar como Aceptada</button>
            </div>
        </div>
    `).join('');
}

async function updateOrderStatus(orderId, newStatus){
    if(!window.db || !window.doc || !window.updateDoc) return;
    try{
        const appId = window.getAppId ? window.getAppId() : 'default';
        const orderDocRef = window.doc(window.db, `artifacts/${appId}/public/data/orders`, orderId);
        await window.updateDoc(orderDocRef, { status: newStatus, updatedBy: window.getCurrentUserId ? window.getCurrentUserId() : 'admin', updatedAt: new Date().toISOString() });
    } catch(e){
        console.error('Error actualizando orden:', e);
        showModal('Error Admin', 'No se pudo actualizar el estado del pedido: ' + e.message);
    }
}

async function updateEventStatus(eventId, newStatus){
    if(!window.db || !window.doc || !window.updateDoc) return;
    try{
        const appId = window.getAppId ? window.getAppId() : 'default';
        const eventDocRef = window.doc(window.db, `artifacts/${appId}/public/data/event_proposals`, eventId);
        await window.updateDoc(eventDocRef, { status: newStatus, updatedBy: window.getCurrentUserId ? window.getCurrentUserId() : 'admin', updatedAt: new Date().toISOString() });
        showModal('Evento Actualizado', `La cotizacion se ha actualizado a: ${newStatus}.`);
    } catch(e){
        console.error('Error actualizando evento:', e);
        showModal('Error Admin', 'No se pudo actualizar el estado del evento: ' + e.message);
    }
}

async function deleteOrder(orderId, status){
    if(status !== 'Facturado/Cerrado'){
        showModal('⚠ Restricción', 'Solo se pueden eliminar pedidos con estado "Facturado/Cerrado".');
        return;
    }
    
    if(!window.db || !window.doc || !window.deleteDoc) return;
    
    try{
        const appId = window.getAppId ? window.getAppId() : 'default';
        const orderDocRef = window.doc(window.db, `artifacts/${appId}/public/data/orders`, orderId);
        await window.deleteDoc(orderDocRef);
        showToast('✓ Pedido eliminado exitosamente');
    } catch(e){
        console.error('Error eliminando orden:', e);
        showModal('⚠ Error', 'No se pudo eliminar el pedido: ' + e.message);
    }
}
