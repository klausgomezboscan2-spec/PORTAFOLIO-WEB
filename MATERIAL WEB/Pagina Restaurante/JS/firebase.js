// firebase.js - Firebase initialization and global utilities with fallback

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, updateDoc, doc, onSnapshot, getDocs, query, where, deleteDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

// Firebase Configuration - REEMPLAZA CON TUS CREDENCIALES REALES
const firebaseConfig = {
    apiKey: "AIzaSyDemoKey123456789",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};

let app, db, auth;
let isAuthReady = false;
let useFirebaseStorage = false;

// ====== LOCAL STORAGE FUNCTIONS ======

// Función para agregar documento a localStorage
const localAddDoc = async (collectionRef, data) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const collectionName = collectionRef.path || 'default';
            let docs = JSON.parse(localStorage.getItem(collectionName) || '[]');
            const id = 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            docs.push({ id, ...data });
            localStorage.setItem(collectionName, JSON.stringify(docs));
            resolve({ id });
        }, 500);
    });
};

// Función para actualizar documento en localStorage
const localUpdateDoc = async (docRef, data) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const { collectionName, docId } = docRef;
            let docs = JSON.parse(localStorage.getItem(collectionName) || '[]');
            const index = docs.findIndex(d => d.id === docId);
            if (index !== -1) {
                docs[index] = { ...docs[index], ...data };
                localStorage.setItem(collectionName, JSON.stringify(docs));
            }
            resolve();
        }, 300);
    });
};

// ====== FIREBASE INITIALIZATION ======

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    
    signInAnonymously(auth)
        .then(() => {
            isAuthReady = true;
            useFirebaseStorage = true;
            console.log('✓ Firebase autenticación anónima iniciada.');
            window.dispatchEvent(new CustomEvent('firebaseReady'));
        })
        .catch((error) => {
            console.warn('Firebase no disponible, usando almacenamiento local:', error.message);
            useFirebaseStorage = false;
            isAuthReady = true;
            window.dispatchEvent(new CustomEvent('firebaseReady'));
        });
} catch (error) {
    console.warn('Firebase no se pudo inicializar, usando almacenamiento local:', error.message);
    db = null;
    auth = null;
    useFirebaseStorage = false;
    isAuthReady = true;
    window.dispatchEvent(new CustomEvent('firebaseReady'));
}

// Mock onSnapshot para localStorage con polling
let pollingIntervals = {};

const localOnSnapshot = (collectionRef, onNext, onError) => {
    const collectionName = collectionRef.path || 'default';
    
    // Llamar inmediatamente
    try {
        const docs = JSON.parse(localStorage.getItem(collectionName) || '[]');
        const snapshot = {
            forEach: (callback) => {
                docs.forEach(doc => callback({ id: doc.id, data: () => doc }));
            }
        };
        onNext(snapshot);
    } catch (e) {
        if (onError) onError(e);
    }
    
    // Polling cada 2 segundos
    if (pollingIntervals[collectionName]) {
        clearInterval(pollingIntervals[collectionName]);
    }
    
    pollingIntervals[collectionName] = setInterval(() => {
        try {
            const docs = JSON.parse(localStorage.getItem(collectionName) || '[]');
            const snapshot = {
                forEach: (callback) => {
                    docs.forEach(doc => callback({ id: doc.id, data: () => doc }));
                }
            };
            onNext(snapshot);
        } catch (e) {
            if (onError) onError(e);
        }
    }, 2000);
    
    // Retornar unsubscribe
    return () => {
        if (pollingIntervals[collectionName]) {
            clearInterval(pollingIntervals[collectionName]);
            delete pollingIntervals[collectionName];
        }
    };
};

// Función para envolver addDoc
const wrappedAddDoc = async (collectionRef, data) => {
    if (useFirebaseStorage && addDoc) {
        return addDoc(collectionRef, data);
    } else {
        return localAddDoc(collectionRef, data);
    }
};

// Función para envolver updateDoc
const wrappedUpdateDoc = async (docRef, data) => {
    if (useFirebaseStorage && updateDoc) {
        return updateDoc(docRef, data);
    } else {
        return localUpdateDoc(docRef, data);
    }
};

// Función para obtener colección
const wrappedCollection = (dbInstance, path) => {
    if (useFirebaseStorage && collection) {
        return collection(dbInstance, path);
    } else {
        return { path };
    }
};

// Función para obtener documento
const wrappedDoc = (dbInstance, path, id) => {
    if (useFirebaseStorage && doc) {
        return doc(dbInstance, path, id);
    } else {
        const parts = path.split('/');
        return { collectionName: path, docId: id };
    }
};

// Función para eliminar documento
const wrappedDeleteDoc = async (docRef) => {
    if (useFirebaseStorage && deleteDoc) {
        return deleteDoc(docRef);
    } else {
        // Para localStorage
        return new Promise((resolve) => {
            setTimeout(() => {
                const { collectionName, docId } = docRef;
                let docs = JSON.parse(localStorage.getItem(collectionName) || '[]');
                docs = docs.filter(d => d.id !== docId);
                localStorage.setItem(collectionName, JSON.stringify(docs));
                resolve();
            }, 300);
        });
    }
};

// Exportar funciones globales para acceso desde otros scripts
window.db = db;
window.auth = auth;
window.collection = wrappedCollection;
window.addDoc = wrappedAddDoc;
window.updateDoc = wrappedUpdateDoc;
window.doc = wrappedDoc;
window.deleteDoc = wrappedDeleteDoc;
window.onSnapshot = useFirebaseStorage ? onSnapshot : localOnSnapshot;
window.getDocs = getDocs;
window.query = query;
window.where = where;

// Utilidades
window.isAuthReady = () => isAuthReady;
window.getCurrentUserId = () => auth?.currentUser?.uid || localStorage.getItem('anonymousUserId') || 'anonymous_' + Date.now();
window.getAppId = () => firebaseConfig.projectId || 'default';

// Monitorear estado de autenticación
if (auth) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('✓ Usuario autenticado:', user.uid);
            localStorage.setItem('anonymousUserId', user.uid);
            isAuthReady = true;
        }
    });
}

console.log('Firebase module cargado. Almacenamiento:', useFirebaseStorage ? 'Firebase' : 'LocalStorage');
