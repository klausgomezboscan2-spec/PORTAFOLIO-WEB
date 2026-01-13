# 🧪 Guía de Prueba - Página Restaurante

## ✅ Cambios Realizados para Arreglar el Checkout

### 1. **Firebase mejorado con Fallback a LocalStorage**
   - ✅ Si Firebase falla, automáticamente usa localStorage
   - ✅ Los datos se guardan aunque no haya Firebase configurado
   - ✅ Funciones wrapper permiten guardar y recuperar datos

### 2. **Mejor manejo de errores en checkout**
   - ✅ Validación de carrito vacío
   - ✅ Spinner de carga visible
   - ✅ Mensajes de error más descriptivos
   - ✅ Auto-cierre de modal después de 2 segundos

### 3. **Propuestas de eventos y contacto**
   - ✅ Guardado en localStorage si Firebase no está disponible
   - ✅ Validaciones antes de enviar
   - ✅ Feedback visual con spinner

### 4. **Modal mejorado**
   - ✅ Soporte para mostrar spinner de carga
   - ✅ Animaciones suaves
   - ✅ Auto-cierre después de 2 segundos

---

## 🧬 Pasos para Probar

### **Test 1: Agregar items al carrito**
1. Ve a "Menu y Pedidos"
2. Haz clic en "Anadir" en cualquier producto
3. Verifica que:
   - El ícono del carrito pulsea ✓
   - El contador aumenta ✓
   - Aparece un modal confirmando ✓

### **Test 2: Ver carrito**
1. Haz clic en el ícono del carrito
2. Verifica que:
   - El carrito se desliza desde la derecha ✓
   - Muestra los items agregados ✓
   - Hay un overlay oscuro detrás ✓
   - Botones + / - funcionan ✓

### **Test 3: Finalizar pedido**
1. Agrega items al carrito
2. Haz clic en "Finalizar Pedido y Guardar"
3. Verifica que:
   - Aparece un modal con spinner ✓
   - Después de 1-2 segundos se cierra ✓
   - Muestra "Pedido Guardado" ✓
   - Va automáticamente a "Contacto" ✓
   - El carrito se vacía ✓

### **Test 4: Guardar propuesta de evento**
1. Ve a "Eventos Especiales"
2. Completa los datos del evento
3. Haz clic en "Generar Propuesta y Enviar a Empleados"
4. Verifica que:
   - Aparece modal con spinner ✓
   - Se guarda correctamente ✓
   - Redirige a "Contacto" ✓

### **Test 5: Enviar formulario de contacto**
1. Ve a "Contacto"
2. Completa nombre y detalles
3. Haz clic en "Confirmar y Enviar Solicitud"
4. Verifica que:
   - Muestra spinner ✓
   - Se guarda correctamente ✓
   - Muestra confirmación ✓
   - Se vacía el formulario ✓

---

## 💾 Dónde se guardan los datos

### **Con Firebase configurado correctamente:**
- Firestore en tu proyecto Firebase

### **Sin Firebase (Modo Fallback):**
- LocalStorage del navegador
- Abre DevTools (F12) → Application → Local Storage
- Verifica las colecciones: `artifacts/default/public/data/*`

---

## 🔧 Configurar Firebase (Opcional)

Si quieres usar Firebase real:

1. Crea un proyecto en [firebase.google.com](https://firebase.google.com)
2. Copia tu configuración
3. Reemplaza los valores en `firebase.js`:

```javascript
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};
```

4. Recarga la página - automáticamente usará Firebase

---

## ✨ Características Principales

- ✅ Carrito con animaciones
- ✅ Pedidos y eventos se guardan
- ✅ Contacto funcional
- ✅ Fallback a localStorage si Firebase falla
- ✅ Spinners de carga visibles
- ✅ Mensajes de confirmación
- ✅ Responsive design

