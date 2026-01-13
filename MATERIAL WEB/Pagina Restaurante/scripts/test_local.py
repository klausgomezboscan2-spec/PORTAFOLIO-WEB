#!/usr/bin/env python3
"""
Testeo Local de Estructura - Sin necesidad de servidor
Valida que todos los archivos estén en su lugar y tengan contenido válido
"""

import os
import sys
from pathlib import Path

# Colores ANSI para terminal
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

BASE_PATH = Path(__file__).parent.parent

def print_test(status, message):
    """Imprime resultado de test con formato"""
    symbol = f"{GREEN}✅{RESET}" if status else f"{RED}❌{RESET}"
    print(f"{symbol} {message}")
    return status

def test_folder_structure():
    """Test 1: Estructura de carpetas"""
    print(f"\n{BLUE}📋 Test: Estructura de Carpetas{RESET}")
    print("-" * 60)
    
    folders = ['HTML', 'CSS', 'JS', 'scripts']
    results = []
    
    for folder in folders:
        path = BASE_PATH / folder
        exists = path.is_dir()
        results.append(print_test(exists, f"Carpeta '{folder}' existe"))
    
    return all(results)

def test_file_locations():
    """Test 2: Ubicación de archivos"""
    print(f"\n{BLUE}📋 Test: Ubicación de Archivos{RESET}")
    print("-" * 60)
    
    files = {
        'HTML/index.html': 'HTML principal',
        'CSS/styles.css': 'Estilos CSS',
        'JS/app.js': 'App JavaScript',
        'JS/admin.js': 'Admin JavaScript',
        'JS/firebase.js': 'Firebase JavaScript',
    }
    
    results = []
    for file_path, name in files.items():
        full_path = BASE_PATH / file_path
        exists = full_path.is_file()
        results.append(print_test(exists, f"Archivo presente: {name} ({file_path})"))
    
    return all(results)

def test_file_sizes():
    """Test 3: Tamaños de archivos (sanidad check)"""
    print(f"\n{BLUE}📋 Test: Tamaño de Archivos (Sanidad){RESET}")
    print("-" * 60)
    
    files = {
        'HTML/index.html': (5000, 'bytes', 'HTML muy pequeño'),
        'CSS/styles.css': (10000, 'bytes', 'CSS muy pequeño'),
        'JS/app.js': (10000, 'bytes', 'App.js muy pequeño'),
        'JS/admin.js': (5000, 'bytes', 'Admin.js muy pequeño'),
        'JS/firebase.js': (5000, 'bytes', 'Firebase.js muy pequeño'),
    }
    
    results = []
    for file_path, (min_size, unit, error_msg) in files.items():
        full_path = BASE_PATH / file_path
        if full_path.is_file():
            size = full_path.stat().st_size
            valid = size >= min_size
            status_msg = f"{file_path}: {size} bytes"
            results.append(print_test(valid, f"Tamaño válido: {status_msg}"))
        else:
            results.append(print_test(False, f"Archivo no encontrado: {file_path}"))
    
    return all(results)

def test_html_structure():
    """Test 4: Estructura HTML"""
    print(f"\n{BLUE}📋 Test: Estructura HTML{RESET}")
    print("-" * 60)
    
    html_path = BASE_PATH / 'HTML' / 'index.html'
    if not html_path.is_file():
        print(f"{RED}❌{RESET} Archivo HTML no encontrado")
        return False
    
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    elements = {
        '<html': 'Etiqueta HTML',
        '<head>': 'Etiqueta HEAD',
        '<body>': 'Etiqueta BODY',
        '<nav': 'Etiquetas NAV',
        'id="home-section"': 'Sección HOME',
        'id="menu-section"': 'Sección MENU',
        'id="events-section"': 'Sección EVENTOS',
        'id="contact-section"': 'Sección CONTACTO',
        'id="cart-drawer"': 'Carrito (drawer)',
        'id="message-modal"': 'Modal de mensajes',
        'id="order-customer-name"': 'Input nombre cliente',
        'id="order-table-number"': 'Input mesa/domicilio',
    }
    
    results = []
    for element, name in elements.items():
        found = element in content
        results.append(print_test(found, f"Elemento presente: {name}"))
    
    return all(results)

def test_routes_in_html():
    """Test 5: Rutas en HTML (crítico)"""
    print(f"\n{BLUE}📋 Test: Rutas en HTML{RESET}")
    print("-" * 60)
    
    html_path = BASE_PATH / 'HTML' / 'index.html'
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Rutas correctas
    correct_routes = {
        '../CSS/styles.css': 'Ruta CSS correcta',
        '../JS/firebase.js': 'Ruta Firebase correcta',
        '../JS/app.js': 'Ruta App correcta',
        '../JS/admin.js': 'Ruta Admin correcta',
    }
    
    # Rutas incorrectas (antiguas)
    incorrect_routes = {
        './styles.css': 'Ruta CSS antigua',
        './firebase.js': 'Ruta Firebase antigua',
        './app.js': 'Ruta App antigua',
        './admin.js': 'Ruta Admin antigua',
    }
    
    results = []
    
    # Verificar rutas correctas presentes
    for route, name in correct_routes.items():
        found = route in content
        results.append(print_test(found, f"✓ {name} presente"))
    
    # Verificar rutas incorrectas NO presentes
    for route, name in incorrect_routes.items():
        found = route in content
        results.append(print_test(not found, f"✓ {name} REMOVIDA"))
    
    return all(results)

def test_css_content():
    """Test 6: Contenido CSS (vinotinto/dorado)"""
    print(f"\n{BLUE}📋 Test: Contenido CSS (Paleta){RESET}")
    print("-" * 60)
    
    css_path = BASE_PATH / 'CSS' / 'styles.css'
    with open(css_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Buscar variables CSS que definen los colores
    colors = {
        '--bg-wine': 'Vinotinto (variable CSS)',
        '--accent-gold': 'Dorado (variable CSS)',
        '--bg-wine-light': 'Vinotinto claro (variable CSS)',
        'Vinotinto': 'Comentario Vinotinto en CSS',
        'Dorado': 'Comentario Dorado en CSS',
    }
    
    results = []
    for color_code, color_name in colors.items():
        found = color_code in content
        results.append(print_test(found, f"{color_name} presente"))
    
    return all(results)

def test_js_content():
    """Test 7: Contenido JavaScript (funciones clave)"""
    print(f"\n{BLUE}📋 Test: Contenido JavaScript{RESET}")
    print("-" * 60)
    
    files_functions = {
        'JS/app.js': [
            'renderMenu',
            'checkout',
            'calculateEventEstimate',
            'requestPredefinedPackage',
            'addToCart',
        ],
        'JS/admin.js': [
            'checkAndStartAdminListeners',
            'renderOrders',
            'renderEventQuotes',
        ],
        'JS/firebase.js': [
            'window.db',
            'window.collection',
            'window.addDoc',
        ],
    }
    
    results = []
    for file_path, functions in files_functions.items():
        full_path = BASE_PATH / file_path
        if not full_path.is_file():
            results.append(print_test(False, f"Archivo no encontrado: {file_path}"))
            continue
        
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for func in functions:
            found = func in content
            results.append(print_test(found, f"Función en {file_path}: {func}"))
    
    return all(results)

def test_menu_sections():
    """Test 8: Secciones de Menú"""
    print(f"\n{BLUE}📋 Test: Secciones de Menú{RESET}")
    print("-" * 60)
    
    html_path = BASE_PATH / 'HTML' / 'index.html'
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    sections = [
        'Entradas',
        'Plato Fuerte',
        'Bebidas',
        'Postre',
        'Adiciones',
    ]
    
    results = []
    for section in sections:
        found = section in content
        results.append(print_test(found, f"Sección de menú: {section}"))
    
    return all(results)

def test_no_duplicates():
    """Test 9: Sin elementos duplicados"""
    print(f"\n{BLUE}📋 Test: Integridad (Sin Duplicados){RESET}")
    print("-" * 60)
    
    html_path = BASE_PATH / 'HTML' / 'index.html'
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Buscar IDs (no deben repetirse)
    import re
    id_pattern = r'id=["\']([^"\']+)["\']'
    ids = re.findall(id_pattern, content)
    
    unique_ids = len(set(ids))
    total_ids = len(ids)
    
    results = []
    results.append(print_test(
        unique_ids == total_ids,
        f"IDs únicos: {unique_ids}/{total_ids} (sin duplicados)"
    ))
    
    return all(results)

def main():
    """Ejecutar todos los tests"""
    print(f"\n{BLUE}{'='*60}")
    print("🧪 TESTEO LOCAL DE FUNCIONALIDAD")
    print(f"{'='*60}{RESET}\n")
    print(f"Base path: {BASE_PATH}\n")
    
    tests = [
        ("Estructura de Carpetas", test_folder_structure),
        ("Ubicación de Archivos", test_file_locations),
        ("Tamaño de Archivos", test_file_sizes),
        ("Estructura HTML", test_html_structure),
        ("Rutas en HTML (CRÍTICO)", test_routes_in_html),
        ("Contenido CSS", test_css_content),
        ("Contenido JavaScript", test_js_content),
        ("Secciones de Menú", test_menu_sections),
        ("Sin Duplicados", test_no_duplicates),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append(result)
        except Exception as e:
            print(f"{RED}❌ Error en test: {str(e)}{RESET}")
            results.append(False)
    
    # Resumen final
    print(f"\n{BLUE}{'='*60}")
    print("📊 RESUMEN FINAL")
    print(f"{'='*60}{RESET}")
    
    passed = sum(results)
    total = len(results)
    percentage = (passed / total) * 100
    
    print(f"Tests pasados: {passed}/{total} ({percentage:.0f}%)\n")
    
    if percentage == 100:
        print(f"{GREEN}✅ ¡TODO FUNCIONA CORRECTAMENTE! 🎉{RESET}")
        print(f"\n{GREEN}La app está lista para usar en http://localhost:8000/{RESET}")
        return 0
    elif percentage >= 80:
        print(f"{YELLOW}⚠️  Mayoría de tests pasan, pero hay algunos problemas{RESET}")
        return 1
    else:
        print(f"{RED}❌ Hay problemas significativos que necesitan atención{RESET}")
        return 2

if __name__ == "__main__":
    sys.exit(main())
