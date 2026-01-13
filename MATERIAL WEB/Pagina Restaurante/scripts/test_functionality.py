#!/usr/bin/env python3
"""
Testeo de Funcionalidad - Restaurante App
Valida que todos los elementos, estilos y scripts se cargan correctamente
"""

import requests
from bs4 import BeautifulSoup
import re
import sys

BASE_URL = "http://localhost:8000"
MAIN_PAGE = f"{BASE_URL}/HTML/index.html"

def print_test(status, message):
    """Imprime resultado de test con formato"""
    symbol = "✅" if status else "❌"
    print(f"{symbol} {message}")
    return status

def test_server_connectivity():
    """Test 1: Verificar que el servidor está activo"""
    try:
        response = requests.get(BASE_URL, timeout=5)
        return print_test(response.status_code == 200, "Servidor accesible en puerto 8000")
    except Exception as e:
        return print_test(False, f"Servidor no accesible: {str(e)}")

def test_page_load():
    """Test 2: Verificar que index.html carga correctamente"""
    try:
        response = requests.get(MAIN_PAGE, timeout=5)
        if response.status_code == 200:
            return print_test(True, f"index.html se carga correctamente (200 OK)")
        else:
            return print_test(False, f"index.html devuelve código {response.status_code}")
    except Exception as e:
        return print_test(False, f"Error al cargar index.html: {str(e)}")

def test_static_files():
    """Test 3: Verificar que CSS y JS se cargan correctamente"""
    results = []
    files = [
        ("CSS/styles.css", "Estilos CSS"),
        ("JS/firebase.js", "Firebase JS"),
        ("JS/app.js", "App JS"),
        ("JS/admin.js", "Admin JS")
    ]
    
    for file_path, name in files:
        try:
            response = requests.get(f"{BASE_URL}/{file_path}", timeout=5)
            status = response.status_code == 200
            results.append(print_test(status, f"{name} se carga correctamente"))
        except Exception as e:
            results.append(print_test(False, f"Error cargando {name}: {str(e)}"))
    
    return all(results)

def test_html_structure():
    """Test 4: Verificar estructura HTML y elementos clave"""
    try:
        response = requests.get(MAIN_PAGE, timeout=5)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Elementos críticos que deben existir
        elements = {
            "title": soup.find('title'),
            "nav#user-nav": soup.find('nav', {'id': 'user-nav'}),
            "nav#employee-nav": soup.find('nav', {'id': 'employee-nav'}),
            "#home-section": soup.find(id='home-section'),
            "#menu-section": soup.find(id='menu-section'),
            "#events-section": soup.find(id='events-section'),
            "#contact-section": soup.find(id='contact-section'),
            "#cart-drawer": soup.find(id='cart-drawer'),
            "#message-modal": soup.find(id='message-modal'),
        }
        
        results = []
        for element_name, element in elements.items():
            status = element is not None
            results.append(print_test(status, f"Elemento encontrado: {element_name}"))
        
        return all(results)
    except Exception as e:
        return print_test(False, f"Error analizando HTML: {str(e)}")

def test_script_references():
    """Test 5: Verificar que todas las referencias a scripts en HTML son correctas"""
    try:
        response = requests.get(MAIN_PAGE, timeout=5)
        content = response.text
        
        # Verificar que NO hay referencias a ./firebase.js, ./app.js, ./admin.js (rutas antiguas)
        old_refs = [
            (r'src=["\']\./firebase\.js', "firebase.js ruta antigua"),
            (r'src=["\']\./app\.js', "app.js ruta antigua"),
            (r'src=["\']\./admin\.js', "admin.js ruta antigua"),
            (r'href=["\']\./styles\.css', "styles.css ruta antigua"),
        ]
        
        results = []
        for pattern, name in old_refs:
            found = bool(re.search(pattern, content))
            results.append(print_test(not found, f"No hay referencias a {name}"))
        
        # Verificar que SI hay referencias nuevas correctas
        new_refs = [
            (r'src=["\']\.\./JS/firebase\.js', "../JS/firebase.js ruta nueva"),
            (r'src=["\']\.\./JS/app\.js', "../JS/app.js ruta nueva"),
            (r'src=["\']\.\./JS/admin\.js', "../JS/admin.js ruta nueva"),
            (r'href=["\']\.\./CSS/styles\.css', "../CSS/styles.css ruta nueva"),
        ]
        
        for pattern, name in new_refs:
            found = bool(re.search(pattern, content))
            results.append(print_test(found, f"Referencia correcta a {name}"))
        
        return all(results)
    except Exception as e:
        return print_test(False, f"Error verificando referencias: {str(e)}")

def test_css_classes():
    """Test 6: Verificar que clases Tailwind y custom están presentes"""
    try:
        response = requests.get(MAIN_PAGE, timeout=5)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Buscar clases de Tailwind comunes
        results = []
        classes_to_find = ['flex', 'grid', 'w-full', 'h-screen', 'bg-', 'text-', 'rounded']
        
        html_str = response.text
        for cls in classes_to_find:
            found = cls in html_str
            results.append(print_test(found, f"Clases Tailwind '{cls}' presentes"))
        
        return all(results)
    except Exception as e:
        return print_test(False, f"Error verificando clases: {str(e)}")

def test_key_functions():
    """Test 7: Verificar que funciones JS clave están definidas"""
    try:
        response = requests.get(MAIN_PAGE, timeout=5)
        content = response.text
        
        functions = [
            'renderMenu',
            'checkout',
            'calculateEventEstimate',
            'requestPredefinedPackage',
            'addToCart',
            'removeFromCart',
            'initializeApp',
        ]
        
        results = []
        for func in functions:
            found = func in content
            results.append(print_test(found, f"Función JS definida: {func}()"))
        
        return all(results)
    except Exception as e:
        return print_test(False, f"Error verificando funciones: {str(e)}")

def test_menu_sections():
    """Test 8: Verificar que las 5 secciones de menú están presentes"""
    try:
        response = requests.get(MAIN_PAGE, timeout=5)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        sections = [
            'Entradas',
            'Plato Fuerte',
            'Bebidas',
            'Postre',
            'Adiciones'
        ]
        
        html_str = response.text
        results = []
        for section in sections:
            found = section in html_str
            results.append(print_test(found, f"Sección de menú presente: {section}"))
        
        return all(results)
    except Exception as e:
        return print_test(False, f"Error verificando secciones: {str(e)}")

def test_forms_and_inputs():
    """Test 9: Verificar que formularios y inputs están presentes"""
    try:
        response = requests.get(MAIN_PAGE, timeout=5)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        inputs = {
            "order-customer-name": "Nombre del cliente",
            "order-table-number": "Número de mesa",
            "order-address": "Dirección domicilio",
            "event-name": "Nombre del evento",
            "event-guests": "Cantidad de huéspedes",
            "event-date": "Fecha del evento",
        }
        
        results = []
        for input_id, name in inputs.items():
            element = soup.find(id=input_id)
            status = element is not None
            results.append(print_test(status, f"Input presente: {name} (#{input_id})"))
        
        return all(results)
    except Exception as e:
        return print_test(False, f"Error verificando formularios: {str(e)}")

def test_color_palette():
    """Test 10: Verificar que la paleta vinotinto/dorado está en CSS"""
    try:
        response = requests.get(f"{BASE_URL}/CSS/styles.css", timeout=5)
        css_content = response.text
        
        colors = {
            '#722c2c': 'vinotinto principal',
            '#d4af37': 'dorado',
            '#8b3c3c': 'vinotinto secundario',
        }
        
        results = []
        for color_code, color_name in colors.items():
            found = color_code.lower() in css_content.lower()
            results.append(print_test(found, f"Color {color_name} ({color_code}) en CSS"))
        
        return all(results)
    except Exception as e:
        return print_test(False, f"Error verificando paleta: {str(e)}")

def main():
    """Ejecutar todos los tests"""
    print("\n" + "="*60)
    print("🧪 TESTEO DE FUNCIONALIDAD - RESTAURANTE APP")
    print("="*60 + "\n")
    
    tests = [
        ("Conectividad del Servidor", test_server_connectivity),
        ("Carga de Página Principal", test_page_load),
        ("Carga de Archivos Estáticos", test_static_files),
        ("Estructura HTML", test_html_structure),
        ("Referencias de Scripts", test_script_references),
        ("Clases CSS/Tailwind", test_css_classes),
        ("Funciones JavaScript", test_key_functions),
        ("Secciones de Menú", test_menu_sections),
        ("Formularios e Inputs", test_forms_and_inputs),
        ("Paleta de Colores", test_color_palette),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n📋 Test: {test_name}")
        print("-" * 60)
        try:
            result = test_func()
            results.append(result)
        except Exception as e:
            print(f"❌ Error en test: {str(e)}")
            results.append(False)
    
    # Resumen final
    print("\n" + "="*60)
    print("📊 RESUMEN FINAL")
    print("="*60)
    passed = sum(results)
    total = len(results)
    percentage = (passed / total) * 100
    
    print(f"Tests pasados: {passed}/{total} ({percentage:.0f}%)")
    
    if percentage == 100:
        print("\n✅ ¡TODO FUNCIONA CORRECTAMENTE! 🎉")
        return 0
    elif percentage >= 80:
        print("\n⚠️  Mayoría de tests pasan, pero hay algunos problemas")
        return 1
    else:
        print("\n❌ Hay problemas significativos que necesitan atención")
        return 2

if __name__ == "__main__":
    sys.exit(main())
